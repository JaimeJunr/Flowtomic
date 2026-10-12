"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { DRIFT_LINES_FRAGMENT_SHADER } from "./drift-lines-shader";
import {
  assertColorTokens,
  clampBend,
  clampLineCount,
  clampLineGap,
  DEFAULT_DRIFT_COLORS,
  DEFAULT_DRIFT_WAVES,
  type DriftColors,
  type DriftWave,
  lerp,
  pointerToUnit,
  wavesMask,
} from "./drift-lines-utils";

export type DriftLinesProps = React.ComponentProps<"div"> & {
  /** Dois tokens de cor (variáveis CSS) do gradiente ao longo do fio. */
  colors?: DriftColors;
  /** Quais feixes aparecem. */
  waves?: DriftWave[];
  /** Fios por feixe, inteiro de 1 a 12. */
  lineCount?: number;
  /** Espaço entre fios, de 0,2 a 4. */
  lineGap?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Se o mouse curva os fios e desliza a cena. */
  pointer?: boolean;
  /** Força da curva perto do ponteiro, de -2 a 2. */
  bend?: number;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

function readColors(colors: DriftColors, element?: Element): Float32Array {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  const first = readThemeColor(colors[0], element) ?? fallback;
  const second = readThemeColor(colors[1], element) ?? fallback;
  return new Float32Array([first.r, first.g, first.b, second.r, second.g, second.b]);
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  first: string,
  second: string,
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    const reread = () => {
      ref.current = readColors([first, second], canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [first, second, ref, canvasRef, redraw]);
}

type PointerState = {
  target: [number, number];
  current: [number, number];
  strength: number;
  inside: boolean;
};

// Só mouse e caneta: toque não tem "passar por cima". Ao sair, o efeito se dissolve.
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

function fallbackStyle(token: string): React.CSSProperties {
  return {
    background: `linear-gradient(170deg, transparent 40%, color-mix(in oklch, var(${token}) 25%, transparent) 50%, transparent 60%)`,
  };
}

type Params = {
  speed: number;
  lineCount: number;
  lineGap: number;
  bend: number;
  mask: [number, number, number];
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
  gl.uniform3f(at("uColor1"), colors[0], colors[1], colors[2]);
  gl.uniform3f(at("uColor2"), colors[3], colors[4], colors[5]);
  gl.uniform3f(at("uWaves"), p.mask[0], p.mask[1], p.mask[2]);
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform1f(at("uLineCount"), clampLineCount(p.lineCount));
  gl.uniform1f(at("uLineGap"), clampLineGap(p.lineGap));
  gl.uniform1f(at("uBend"), clampBend(p.bend));
  gl.uniform1f(at("uPointerStrength"), pt.strength);
  gl.uniform2f(at("uPointer"), pt.current[0], pt.current[1]);
}

function DriftLines({
  colors = DEFAULT_DRIFT_COLORS,
  waves = DEFAULT_DRIFT_WAVES,
  lineCount = 6,
  lineGap = 1,
  speed = 1,
  pointer = true,
  bend = -0.5,
  className,
  children,
  ref,
  ...props
}: DriftLinesProps) {
  assertColorTokens(colors);
  const [first, second] = colors;
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
  const params = React.useRef<Params>({ speed, lineCount, lineGap, bend, mask: [1, 1, 1] });
  params.current = { speed, lineCount, lineGap, bend, mask: wavesMask(waves) };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: DRIFT_LINES_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) =>
        setUniforms(gl, program, params.current, colorsRef.current, pointerState.current),
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(first, second, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="drift-lines"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="drift-lines-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(first)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="drift-lines-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="drift-lines-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

DriftLines.displayName = "DriftLines";

export { DriftLines };
