"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { CONTOUR_LINES_FRAGMENT_SHADER } from "./contour-lines-shader";
import {
  assertColorTokens,
  clampBrightness,
  clampLineCount,
  clampWarp,
  DEFAULT_CONTOUR_COLORS,
  lerp,
  pointerToUnit,
  toColorUniform,
  toRadians,
} from "./contour-lines-utils";

export type ContourLinesProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (nomes de variável CSS), do mais claro ao fundo. */
  colors?: [string, string, string];
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Quantidade de linhas, de 8 a 80. */
  lineCount?: number;
  /** Força da ondulação, de 0 a 2. */
  warp?: number;
  /** Inclinação das linhas, em graus. */
  rotation?: number;
  /** Intensidade do traço, de 0 a 1. */
  brightness?: number;
  /** Se o mouse empurra as linhas por perto. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

function readColors(tokens: readonly string[], element?: Element): Float32Array {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  return toColorUniform(
    tokens.map((token) => readThemeColor(token, element)),
    fallback
  );
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  tokens: readonly string[],
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  const key = tokens.join("|");
  React.useLayoutEffect(() => {
    const list = key.split("|");
    ref.current = readColors(list, canvasRef.current ?? undefined);
    redraw();
    const observer = new MutationObserver(() => {
      ref.current = readColors(list, canvasRef.current ?? undefined);
      redraw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [key, ref, canvasRef, redraw]);
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

function fallbackStyle(tokens: readonly string[]): React.CSSProperties {
  const [a] = tokens;
  return {
    background: `repeating-linear-gradient(-45deg, color-mix(in oklch, var(${a}) 25%, transparent) 0 1px, transparent 1px 14px)`,
  };
}

function ContourLines({
  colors = DEFAULT_CONTOUR_COLORS,
  speed = 0.3,
  lineCount = 34,
  warp = 1,
  rotation = -45,
  brightness = 0.6,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: ContourLinesProps) {
  assertColorTokens(colors);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorsRef = React.useRef<Float32Array>(new Float32Array(9));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef({ speed, lineCount, warp, rotation, brightness });
  params.current = { speed, lineCount, warp, rotation, brightness };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: CONTOUR_LINES_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const pt = pointerState.current;
        pt.current = [
          lerp(pt.current[0], pt.target[0], POINTER_EASE),
          lerp(pt.current[1], pt.target[1], POINTER_EASE),
        ];
        pt.strength = lerp(pt.strength, pt.inside ? 1 : 0, POINTER_EASE);
        gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorsRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uLineCount"), clampLineCount(p.lineCount));
        gl.uniform1f(gl.getUniformLocation(program, "uWarp"), clampWarp(p.warp));
        gl.uniform1f(gl.getUniformLocation(program, "uRotation"), toRadians(p.rotation));
        gl.uniform1f(gl.getUniformLocation(program, "uBrightness"), clampBrightness(p.brightness));
        gl.uniform1f(gl.getUniformLocation(program, "uPointerStrength"), pt.strength);
        gl.uniform2f(gl.getUniformLocation(program, "uPointer"), pt.current[0], pt.current[1]);
      },
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="contour-lines"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="contour-lines-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="contour-lines-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="contour-lines-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

ContourLines.displayName = "ContourLines";

export { ContourLines };
