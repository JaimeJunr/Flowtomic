"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";

export type DictationMode = "auto" | "hold" | "toggle";
export type LevelSourceKind = "simulated" | "mic";
export type ReleaseDecision = "stop" | "latch" | "keep";

/** Interface fina sobre a fonte do nível (0..1): o microfone e o AudioContext ficam atrás dela. */
export type LevelSource = { read: () => number; stop: () => void };
export type LevelSourceFactory = () => LevelSource | Promise<LevelSource>;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Suavização exponencial com constantes diferentes para subir (attack) e descer (release). */
export function envelope(
  prev: number,
  input: number,
  dtMs: number,
  attackMs: number,
  releaseMs: number
): number {
  if (!(attackMs > 0)) {
    throw new Error(`envelope: received attackMs ${attackMs}, expected a number greater than 0`);
  }
  if (!(releaseMs > 0)) {
    throw new Error(`envelope: received releaseMs ${releaseMs}, expected a number greater than 0`);
  }
  const tau = input > prev ? attackMs : releaseMs;
  const alpha = 1 - Math.exp(-Math.max(0, dtMs) / tau);
  return prev + (input - prev) * alpha;
}

/** "m:ss", truncando os milissegundos. */
export function formatClock(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const seconds = String(total % 60).padStart(2, "0");
  return `${Math.floor(total / 60)}:${seconds}`;
}

/** O que fazer ao soltar o ponteiro, conforme o modo, quanto tempo segurou e se já está travado. */
export function releaseDecision(
  mode: DictationMode,
  pressMs: number,
  holdAfterMs: number,
  latched: boolean
): ReleaseDecision {
  if (latched) return "keep";
  if (mode === "hold") return "stop";
  if (mode === "toggle") return "latch";
  return pressMs < holdAfterMs ? "latch" : "stop";
}

/** Histórico rolante: acrescenta no fim e descarta o excedente do começo. */
export function pushLevel(history: readonly number[], level: number, max: number): number[] {
  return [...history, level].slice(-max);
}

/** Raiz da média quadrática de um buffer de áudio. */
export function rmsOf(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

/** Ruído suave determinístico: soma de senos, sempre em 0.12..0.88. */
export function simulatedLevel(tMs: number): number {
  const wobble = Math.sin(tMs / 170) * 0.3 + Math.sin(tMs / 53) * 0.12 + Math.sin(tMs / 421) * 0.1;
  return clamp01(0.5 + wobble * 0.8);
}

/** Deslocamento vertical (px) de cada barra ao espalhar no cancelamento; sem Math.random para ser testável. */
export function scatterOffset(index: number): number {
  return Math.round(Math.sin(index * 12.9898) * 14);
}

const MIC_GAIN = 4;

async function createMicSource(): Promise<LevelSource> {
  const devices = typeof navigator === "undefined" ? undefined : navigator.mediaDevices;
  if (!devices?.getUserMedia) {
    throw new Error(
      "createLevelSource: received no navigator.mediaDevices.getUserMedia, expected a browser with microphone support on a secure context"
    );
  }
  const stream = await devices.getUserMedia({ audio: true });
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  context.createMediaStreamSource(stream).connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  return {
    read: () => {
      analyser.getFloatTimeDomainData(buffer);
      return clamp01(rmsOf(buffer) * MIC_GAIN);
    },
    stop: () => {
      for (const track of stream.getTracks()) track.stop();
      void context.close();
    },
  };
}

function createSimulatedSource(): LevelSource {
  const startedAt = performance.now();
  return { read: () => simulatedLevel(performance.now() - startedAt), stop: () => {} };
}

/** Fábrica padrão das fontes de nível: "simulated" (demo) ou "mic" (getUserMedia + AnalyserNode). */
export function createLevelSource(kind: LevelSourceKind): Promise<LevelSource> {
  if (kind === "simulated") return Promise.resolve(createSimulatedSource());
  if (kind === "mic") return createMicSource();
  throw new Error(
    `createLevelSource: received ${JSON.stringify(kind)}, expected "simulated" or "mic"`
  );
}

export type DictationStopReason =
  | "release"
  | "tap"
  | "key"
  | "escape"
  | "blur"
  | "cancel"
  | "disabled"
  | "mic-denied"
  | "unmount";

export const BAR_COUNT = 16;
const BAR_STEP_MS = 60;
const ATTACK_MS = 40;
const RELEASE_MS = 240;
const FRAME_FPS = 30;
const SCATTER_MS = 450;

type SessionOptions = {
  disabled: boolean;
  reduced: boolean;
  mode: DictationMode;
  holdAfterMs: number;
  source: LevelSourceKind;
  levelSource?: LevelSourceFactory;
  slideToCancel: boolean;
  cancelDistance: number;
  onStart?: (detail: { source: LevelSourceKind }) => void;
  onStop?: (detail: { reason: DictationStopReason; durationMs: number }) => void;
};

type PressState = { at: number; x: number; held: boolean };

/** Sessão de ditado: fonte de nível, relógio, histórico de barras e as regras de soltar/cancelar. Estado espelhado em refs para os handlers. */
export function useDictationSession(options: SessionOptions) {
  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    optionsRef.current = options;
  });
  const [listening, setListening] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [level, setLevel] = React.useState(0);
  const [bars, setBars] = React.useState<number[]>([]);
  const [dragX, setDragX] = React.useState(0);
  const [scatter, setScatter] = React.useState<number[] | null>(null);
  const listeningRef = React.useRef(false);
  const latchedRef = React.useRef(false);
  const sessionRef = React.useRef(0);
  const sourceRef = React.useRef<LevelSource | null>(null);
  const startedAtRef = React.useRef(0);
  const lastFrameRef = React.useRef(0);
  const levelRef = React.useRef(0);
  const barsRef = React.useRef<number[]>([]);
  const barAccRef = React.useRef(0);
  const pressRef = React.useRef<PressState>({ at: 0, x: 0, held: false });
  const scatterTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = React.useCallback((reason: DictationStopReason) => {
    if (!listeningRef.current) return;
    const durationMs = performance.now() - startedAtRef.current;
    listeningRef.current = false;
    sessionRef.current += 1;
    sourceRef.current?.stop();
    sourceRef.current = null;
    setListening(false);
    setDragX(0);
    setLevel(0);
    if (reason === "cancel" && !optionsRef.current.reduced) {
      setScatter(barsRef.current.slice());
      scatterTimerRef.current = setTimeout(() => setScatter(null), SCATTER_MS);
    }
    optionsRef.current.onStop?.({ reason, durationMs });
  }, []);

  const start = React.useCallback(() => {
    const opts = optionsRef.current;
    if (opts.disabled || listeningRef.current) return;
    sessionRef.current += 1;
    const id = sessionRef.current;
    listeningRef.current = true;
    startedAtRef.current = performance.now();
    lastFrameRef.current = startedAtRef.current;
    levelRef.current = 0;
    barsRef.current = [];
    barAccRef.current = 0;
    setScatter(null);
    setElapsedMs(0);
    setBars([]);
    setListening(true);
    opts.onStart?.({ source: opts.source });
    new Promise<LevelSource>((resolve) =>
      resolve((opts.levelSource ?? (() => createLevelSource(opts.source)))())
    )
      .then((created) => {
        if (sessionRef.current === id) sourceRef.current = created;
        else created.stop();
      })
      .catch(() => {
        if (sessionRef.current === id) stop("mic-denied");
      });
  }, [stop]);

  const onFrame = () => {
    const now = performance.now();
    const dt = now - lastFrameRef.current;
    lastFrameRef.current = now;
    const raw = sourceRef.current?.read() ?? 0;
    levelRef.current = envelope(levelRef.current, raw, dt, ATTACK_MS, RELEASE_MS);
    barAccRef.current += dt;
    while (barAccRef.current >= BAR_STEP_MS) {
      barsRef.current = pushLevel(barsRef.current, levelRef.current, BAR_COUNT);
      barAccRef.current -= BAR_STEP_MS;
    }
    setLevel(levelRef.current);
    setBars(barsRef.current);
    setElapsedMs(now - startedAtRef.current);
  };
  useFrameLoop(onFrame, listening, FRAME_FPS);

  const pressStart = (x: number) => {
    if (optionsRef.current.disabled) return;
    if (listeningRef.current) return stop("tap");
    pressRef.current = { at: performance.now(), x, held: true };
    latchedRef.current = false;
    start();
  };

  const pressMove = (x: number) => {
    const { slideToCancel, cancelDistance } = optionsRef.current;
    if (!pressRef.current.held || !listeningRef.current || latchedRef.current || !slideToCancel) {
      return;
    }
    const dx = Math.min(0, x - pressRef.current.x);
    setDragX(dx);
    if (-dx >= cancelDistance) stop("cancel");
  };

  const pressEnd = () => {
    const press = pressRef.current;
    if (!press.held) return;
    pressRef.current = { ...press, held: false };
    if (!listeningRef.current) return;
    const { mode, holdAfterMs } = optionsRef.current;
    const decision = releaseDecision(
      mode,
      performance.now() - press.at,
      holdAfterMs,
      latchedRef.current
    );
    if (decision === "stop") stop("release");
    if (decision === "latch") {
      latchedRef.current = true;
      setDragX(0);
    }
  };

  const toggleByKey = () => {
    if (listeningRef.current) return stop("key");
    latchedRef.current = true;
    start();
  };

  const blur = () => {
    if (!pressRef.current.held) stop("blur");
  };

  const { disabled } = options;
  React.useEffect(() => {
    if (disabled) stop("disabled");
  }, [disabled, stop]);
  React.useEffect(
    () => () => {
      if (scatterTimerRef.current) clearTimeout(scatterTimerRef.current);
      stop("unmount");
    },
    [stop]
  );

  return {
    listening,
    elapsedMs,
    level,
    bars,
    dragX,
    scatter,
    pressStart,
    pressMove,
    pressEnd,
    toggleByKey,
    blur,
    stop,
  };
}
