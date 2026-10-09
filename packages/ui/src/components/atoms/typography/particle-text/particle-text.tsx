/**
 * ParticleText Component - Flowtomic UI
 *
 * Nuvem de pontos que voa e se junta até formar a palavra; formada, ela "respira"
 * de leve e os pontos fogem do ponteiro, voltando com mola. `trigger` repete o ciclo
 * no hover ou no clique. Sem canvas 2D mostra o texto puro; com movimento reduzido
 * desenha os pontos já no lugar, sem voo, drift nem repulsão.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/particle-text.md
 */

"use client";

import { useInView } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  buildParticles,
  colorToHex,
  createRng,
  type Particle,
  pointerToTextSpace,
  positionAt,
  repelForce,
  resolveCanvasColor,
  sampleTargets,
  springStep,
  textSeed,
} from "./particle-text-utils";

type ParticleTextTrigger = "mount" | "hover" | "click";

type ParticleTextProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Tamanho de cada ponto, em px CSS. */
  particleSizePx?: number;
  /** Passo de amostragem, em px. Menor = mais pontos. */
  density?: number;
  /** Segunda cor misturada no campo. */
  highlightColor?: string;
  /** Distância inicial dos pontos até o alvo, em px. */
  scatterPx?: number;
  gatherMs?: number;
  /** Atraso máximo por ponto, em ms. */
  staggerMs?: number;
  repelStrength?: number;
  repelRadiusPx?: number;
  /** Movimento de repouso, 0..1. */
  idleDrift?: number;
  /** Como repetir o espalha-e-junta depois da primeira vez. */
  trigger?: ParticleTextTrigger;
  glow?: boolean;
};

type Scene = {
  ctx: CanvasRenderingContext2D;
  particles: Particle[];
  mainColor: string;
  accentColor: string;
  /** Margem do canvas em volta do texto, em px CSS. */
  margin: number;
  width: number;
  height: number;
};

type PointerState = { active: boolean; x: number; y: number };

const MAX_POINTS = 6000;
const MAX_DPR = 2;
const LINE_HEIGHT_RATIO = 1.3;
const HIGHLIGHT_RATIO = 0.25;
const RESIZE_DEBOUNCE_MS = 150;
const DRIFT_PX = 1.5;
const GLOW_BLUR_PX = 8;

function sampleText(
  text: string,
  font: string,
  color: string,
  density: number
): { targets: ReturnType<typeof sampleTargets>; width: number; height: number } | null {
  const source = document.createElement("canvas");
  const ctx = source.getContext("2d");
  if (!ctx) return null;
  const sizePx = Number.parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? "16");
  ctx.font = font;
  const width = Math.max(1, Math.ceil(ctx.measureText(text).width));
  const height = Math.ceil(sizePx * LINE_HEIGHT_RATIO);
  source.width = width;
  source.height = height;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 0, height / 2);
  const image = ctx.getImageData(0, 0, width, height);
  return { targets: sampleTargets(image, density, MAX_POINTS), width, height };
}

function createScene(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  props: SceneProps
): Scene | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const style = getComputedStyle(root);
  const sizePx = Number.parseFloat(style.fontSize) || 16;
  const font = `${style.fontStyle} ${style.fontWeight} ${sizePx}px ${style.fontFamily || "sans-serif"}`;
  const sampled = sampleText(props.text, font, "black", props.density);
  if (!sampled) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const margin = Math.ceil(props.scatterPx);
  canvas.width = (sampled.width + margin * 2) * dpr;
  canvas.height = (sampled.height + margin * 2) * dpr;
  canvas.style.width = `${sampled.width + margin * 2}px`;
  canvas.style.height = `${sampled.height + margin * 2}px`;
  canvas.style.margin = `-${margin}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const particles = buildParticles(
    sampled.targets,
    { scatterPx: props.scatterPx, staggerMs: props.staggerMs, highlightRatio: HIGHLIGHT_RATIO },
    createRng(textSeed(props.text))
  );
  const mainRaw = style.color || "black";
  const mainColor = resolveCanvasColor(mainRaw, root, mainRaw);
  const accentColor = resolveCanvasColor(props.highlightColor, root, mainColor);
  const { width, height } = sampled;
  return { ctx, particles, mainColor, accentColor, margin, width, height };
}

type SceneProps = {
  text: string;
  density: number;
  scatterPx: number;
  staggerMs: number;
  highlightColor: string;
};

type PhysicsOptions = {
  gatherMs: number;
  repelStrength: number;
  repelRadiusPx: number;
  idleDrift: number;
  pointer: PointerState;
};

const scratch = { x: 0, y: 0 };
const push = { x: 0, y: 0 };

function stepParticle(particle: Particle, t: number, options: PhysicsOptions): void {
  const { pointer } = options;
  positionAt(particle, t, options.gatherMs, scratch);
  push.x = 0;
  push.y = 0;
  if (pointer.active) {
    // Distância pela posição-base (sem o deslocamento): evita realimentar e formar anel.
    repelForce(
      scratch.x - pointer.x,
      scratch.y - pointer.y,
      options.repelRadiusPx,
      options.repelStrength,
      push
    );
  }
  springStep(particle, push.x, push.y);
}

function drawRange(
  scene: Scene,
  from: number,
  to: number,
  color: string,
  sizePx: number,
  t: number,
  options: PhysicsOptions | null
): void {
  const { ctx, particles, margin } = scene;
  ctx.fillStyle = color;
  for (let index = from; index < to; index++) {
    const particle = particles[index];
    if (options) stepParticle(particle, t, options);
    else positionAt(particle, Number.POSITIVE_INFINITY, 0, scratch);
    let x = scratch.x;
    let y = scratch.y;
    if (options) {
      const settled = t - particle.delay >= options.gatherMs;
      const amplitude = settled ? options.idleDrift * DRIFT_PX : 0;
      x += particle.ox + Math.sin(t * 0.0015 + particle.phase) * amplitude;
      y += particle.oy + Math.cos(t * 0.0012 + particle.phase) * amplitude;
    }
    ctx.fillRect(x + margin, y + margin, sizePx, sizePx);
  }
}

/** `options` nulo desenha os pontos parados no alvo (movimento reduzido). */
function drawScene(
  scene: Scene,
  t: number,
  sizePx: number,
  glow: boolean,
  options: PhysicsOptions | null
): void {
  const { ctx, particles, margin, width, height } = scene;
  ctx.clearRect(0, 0, width + margin * 2, height + margin * 2);
  const mainCount = particles.findIndex((particle) => particle.highlight);
  const split = mainCount === -1 ? particles.length : mainCount;
  ctx.shadowBlur = 0;
  drawRange(scene, 0, split, scene.mainColor, sizePx, t, options);
  ctx.shadowBlur = glow ? GLOW_BLUR_PX : 0;
  ctx.shadowColor = scene.accentColor;
  drawRange(scene, split, particles.length, scene.accentColor, sizePx, t, options);
  ctx.shadowBlur = 0;
}

function ParticleText({
  text,
  particleSizePx = 2,
  density = 4,
  highlightColor = "var(--primary)",
  scatterPx = 180,
  gatherMs = 1600,
  staggerMs = 420,
  repelStrength = 40,
  repelRadiusPx = 120,
  idleDrift = 0.6,
  trigger = "mount",
  glow = true,
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  onKeyDown,
  ref,
  ...props
}: ParticleTextProps) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error(
      `ParticleText: invalid text, received ${JSON.stringify(text)}, expected a non-empty string`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<Scene | null>(null);
  const startRef = React.useRef(0);
  const pointerRef = React.useRef<PointerState>({ active: false, x: 0, y: 0 });
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [supported, setSupported] = React.useState(true);
  const [cycle, setCycle] = React.useState(0);
  const [layoutVersion, setLayoutVersion] = React.useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: layoutVersion refaz a amostragem após resize
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const scene =
      root && canvas
        ? createScene(root, canvas, { text, density, scatterPx, staggerMs, highlightColor })
        : null;
    sceneRef.current = scene;
    setSupported(Boolean(scene));
    if (scene && reduceMotion) drawScene(scene, 0, particleSizePx, glow, null);
  }, [
    text,
    density,
    scatterPx,
    staggerMs,
    highlightColor,
    particleSizePx,
    glow,
    reduceMotion,
    layoutVersion,
  ]);

  React.useEffect(() => {
    startRef.current = performance.now();
    if (cycle === 0) return;
    for (const particle of sceneRef.current?.particles ?? []) {
      particle.ox = particle.oy = particle.vx = particle.vy = 0;
    }
  }, [cycle]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setLayoutVersion((version) => version + 1), RESIZE_DEBOUNCE_MS);
    });
    observer.observe(root);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const onFrame = (now: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    drawScene(scene, now - startRef.current, particleSizePx, glow, {
      gatherMs,
      repelStrength,
      repelRadiusPx,
      idleDrift,
      pointer: pointerRef.current,
    });
  };
  useFrameLoop(onFrame, supported && isInView && !reduceMotion);

  const restart = () => setCycle((value) => value + 1);
  const clickable = trigger === "click";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: ponteiro e clique só reativam o efeito visual
    <div
      ref={rootRef}
      data-slot="particle-text"
      data-cycle={cycle}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn("relative inline-block", clickable && "cursor-pointer", className)}
      onPointerEnter={(event) => {
        if (trigger === "hover") restart();
        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        const canvas = canvasRef.current;
        const scene = sceneRef.current;
        if (canvas && scene) {
          const at = pointerToTextSpace(
            event.clientX,
            event.clientY,
            canvas.getBoundingClientRect(),
            scene.margin
          );
          pointerRef.current = { active: true, x: at.x, y: at.y };
        }
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        pointerRef.current.active = false;
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        if (clickable) restart();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        if (clickable && (event.key === "Enter" || event.key === " ")) restart();
        onKeyDown?.(event);
      }}
      {...props}
    >
      <span className={supported ? "sr-only" : undefined}>{text}</span>
      {supported ? (
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas não é focável; o texto equivalente está no sr-only
        <canvas
          ref={canvasRef}
          data-slot="particle-text-canvas"
          aria-hidden="true"
          className="pointer-events-none block max-w-none"
        />
      ) : null}
    </div>
  );
}

ParticleText.displayName = "ParticleText";

export type { ParticleTextProps, ParticleTextTrigger };
export {
  buildParticles,
  colorToHex,
  createRng,
  ParticleText,
  pointerToTextSpace,
  positionAt,
  repelForce,
  sampleTargets,
  springStep,
};
