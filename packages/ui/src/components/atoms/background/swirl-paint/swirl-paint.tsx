"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { SWIRL_PAINT_FRAGMENT_SHADER } from "./swirl-paint-shader";
import {
  assertColorTokens,
  clampContrast,
  clampPixelSize,
  clampSpin,
  DEFAULT_SWIRL_COLORS,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./swirl-paint-utils";

export type SwirlPaintProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (nomes de variável CSS), do mais claro ao fundo. */
  colors?: [string, string, string];
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Força e sentido do giro, de -3 a 3. */
  spin?: number;
  /** Nitidez entre as cores, de 0,5 a 4. */
  contrast?: number;
  /** Tamanho do pixel em px de tela, de 1 (sem pixelização) a 12. */
  pixelSize?: number;
  /** Se o mouse desloca o centro do giro. */
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

type PointerState = { target: [number, number]; current: [number, number] };

// Só mouse e caneta: toque não tem "passar por cima". Ao sair, o centro volta ao meio.
function usePointerTarget(root: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const state = React.useRef<PointerState>({ target: [0.5, 0.5], current: [0.5, 0.5] });
  React.useEffect(() => {
    const element = root.current;
    state.current.target = [0.5, 0.5];
    if (!element || !enabled) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      state.current.target = pointerToUnit(
        event.clientX,
        event.clientY,
        element.getBoundingClientRect()
      );
    };
    const onLeave = () => {
      state.current.target = [0.5, 0.5];
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [root, enabled]);
  return state;
}

function fallbackStyle(tokens: readonly string[]): React.CSSProperties {
  const [a, b, c] = tokens;
  return {
    background: `conic-gradient(from 0deg, var(${a}), var(${b}), var(${c}), var(${a}))`,
  };
}

function SwirlPaint({
  colors = DEFAULT_SWIRL_COLORS,
  speed = 1,
  spin = 1,
  contrast = 2,
  pixelSize = 2,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: SwirlPaintProps) {
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
  const params = React.useRef({ speed, spin, contrast, pixelSize });
  params.current = { speed, spin, contrast, pixelSize };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: SWIRL_PAINT_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const pt = pointerState.current;
        pt.current = [
          lerp(pt.current[0], pt.target[0], POINTER_EASE),
          lerp(pt.current[1], pt.target[1], POINTER_EASE),
        ];
        // O pixel é em px de tela; o canvas é desenhado em px do dispositivo.
        const dpr = window.devicePixelRatio || 1;
        gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorsRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uSpin"), clampSpin(p.spin));
        gl.uniform1f(gl.getUniformLocation(program, "uContrast"), clampContrast(p.contrast));
        gl.uniform1f(
          gl.getUniformLocation(program, "uPixelSize"),
          clampPixelSize(p.pixelSize) * dpr
        );
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
      data-slot="swirl-paint"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="swirl-paint-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="swirl-paint-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="swirl-paint-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

SwirlPaint.displayName = "SwirlPaint";

export { SwirlPaint };
