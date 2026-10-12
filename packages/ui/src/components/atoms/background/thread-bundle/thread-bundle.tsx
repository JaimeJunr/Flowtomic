"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { THREAD_BUNDLE_FRAGMENT_SHADER } from "./thread-bundle-shader";
import {
  assertColorToken,
  clampAmplitude,
  clampLineCount,
  clampSplit,
  clampSpread,
  clampThickness,
  DEFAULT_THREAD_COLOR,
  lerp,
  pointerToUnit,
  resolveAccentToken,
  toRadians,
} from "./thread-bundle-utils";

export type ThreadBundleProps = React.ComponentProps<"div"> & {
  /** Token de cor (variável CSS) dos fios do centro. */
  color?: string;
  /** Token de cor para onde os fios de fora puxam; sem valor, usa `color`. */
  accentColor?: string;
  /** Quantidade de fios, inteiro de 8 a 160. */
  lineCount?: number;
  /** Espessura do fio em px, de 0,3 a 3. */
  thickness?: number;
  /** Altura da onda, de 0 a 3. */
  amplitude?: number;
  /** Abertura entre fios, de 0 a 1. */
  spread?: number;
  /** Onde o feixe começa a se abrir ao longo do caminho, de 0 a 1. */
  split?: number;
  /** Inclinação do feixe, em graus. */
  angle?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Se o mouse empurra a onda. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

function readColors(color: string, accent: string, element?: Element): Float32Array {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  const main = readThemeColor(color, element) ?? fallback;
  const second = accent === color ? main : (readThemeColor(accent, element) ?? fallback);
  return new Float32Array([main.r, main.g, main.b, second.r, second.g, second.b]);
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  color: string,
  accent: string,
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    const reread = () => {
      ref.current = readColors(color, accent, canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [color, accent, ref, canvasRef, redraw]);
}

type PointerState = {
  target: [number, number];
  current: [number, number];
  strength: number;
  inside: boolean;
};

// Só mouse e caneta: toque não tem "passar por cima". Ao sair, o empurrão se dissolve.
function usePointerTarget(root: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const state = React.useRef<PointerState>({
    target: [0.5, 0.5],
    current: [0.5, 0.5],
    strength: 0,
    inside: false,
  });
  React.useEffect(() => {
    const element = root.current;
    state.current.inside = false;
    if (!element || !enabled) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const pt = state.current;
      pt.target = pointerToUnit(event.clientX, event.clientY, element.getBoundingClientRect());
      if (!pt.inside) pt.current = pt.target;
      pt.inside = true;
    };
    const onLeave = () => {
      state.current.inside = false;
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      state.current.inside = false;
    };
  }, [root, enabled]);
  return state;
}

function fallbackStyle(color: string): React.CSSProperties {
  return {
    background: `linear-gradient(155deg, transparent 40%, color-mix(in oklch, var(${color}) 25%, transparent) 50%, transparent 60%)`,
  };
}

type Params = {
  speed: number;
  lineCount: number;
  thickness: number;
  amplitude: number;
  spread: number;
  split: number;
  angle: number;
};

function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  p: Params,
  colors: Float32Array,
  pt: PointerState
): void {
  const at = (name: string) => gl.getUniformLocation(program, name);
  pt.current = [
    lerp(pt.current[0], pt.target[0], POINTER_EASE),
    lerp(pt.current[1], pt.target[1], POINTER_EASE),
  ];
  pt.strength = lerp(pt.strength, pt.inside ? 1 : 0, POINTER_EASE);
  gl.uniform3f(at("uColor"), colors[0], colors[1], colors[2]);
  gl.uniform3f(at("uAccent"), colors[3], colors[4], colors[5]);
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform1f(at("uLineCount"), clampLineCount(p.lineCount));
  gl.uniform1f(at("uThickness"), clampThickness(p.thickness));
  gl.uniform1f(at("uAmplitude"), clampAmplitude(p.amplitude));
  gl.uniform1f(at("uSpread"), clampSpread(p.spread));
  gl.uniform1f(at("uSplit"), clampSplit(p.split));
  gl.uniform1f(at("uAngle"), toRadians(p.angle));
  gl.uniform1f(at("uPointerStrength"), pt.strength);
  gl.uniform2f(at("uPointer"), pt.current[0], pt.current[1]);
}

function ThreadBundle({
  color = DEFAULT_THREAD_COLOR,
  accentColor,
  lineCount = 90,
  thickness = 0.6,
  amplitude = 1.7,
  spread = 0.4,
  split = 0.04,
  angle = 25,
  speed = 0.6,
  pointer = false,
  className,
  children,
  ref,
  ...props
}: ThreadBundleProps) {
  assertColorToken(color, "color");
  const accent = resolveAccentToken(color, accentColor);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorsRef = React.useRef<Float32Array>(new Float32Array(6));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef<Params>({
    speed,
    lineCount,
    thickness,
    amplitude,
    spread,
    split,
    angle,
  });
  params.current = { speed, lineCount, thickness, amplitude, spread, split, angle };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: THREAD_BUNDLE_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) =>
        setUniforms(gl, program, params.current, colorsRef.current, pointerState.current),
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(color, accent, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="thread-bundle"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="thread-bundle-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(color)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="thread-bundle-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="thread-bundle-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

ThreadBundle.displayName = "ThreadBundle";

export { ThreadBundle };
