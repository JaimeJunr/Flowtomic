"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { VELVET_VEIL_FRAGMENT_SHADER } from "./velvet-veil-shader";
import {
  assertColorToken,
  clampFlow,
  clampUnit,
  DEFAULT_VELVET_COLOR,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./velvet-veil-utils";

export type VelvetVeilProps = React.ComponentProps<"div"> & {
  /** Token de cor (nome de variável CSS). */
  color?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Zoom; maior chega mais perto. */
  scale?: number;
  /** Quanto o véu muda de forma, de 0 a 2. */
  flow?: number;
  /** Brilho fino ao longo das dobras, de 0 a 1. */
  sheen?: number;
  /** Halo nas partes densas, de 0 a 1. */
  glow?: number;
  /** Grão de filme, de 0 a 1. */
  grain?: number;
  /** De 0 a 1; esmaece as bordas na página. */
  fade?: number;
  /** Se o mouse inclina o padrão e acende a região próxima. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

function readColor(token: string, element?: Element): Float32Array {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  return toColorUniform(readThemeColor(token, element), fallback);
}

// Relê a cor ao montar, quando o token muda e quando o tema muda no <html>.
function useThemeColor(
  token: string,
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    ref.current = readColor(token, canvasRef.current ?? undefined);
    redraw();
    const observer = new MutationObserver(() => {
      ref.current = readColor(token, canvasRef.current ?? undefined);
      redraw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [token, ref, canvasRef, redraw]);
}

type PointerState = { target: [number, number]; current: [number, number]; active: boolean };

// Só mouse e caneta: toque não tem "passar por cima".
function usePointerTarget(root: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const state = React.useRef<PointerState>({
    target: [0.5, 0.5],
    current: [0.5, 0.5],
    active: false,
  });
  React.useEffect(() => {
    const element = root.current;
    if (!element || !enabled) {
      state.current.active = false;
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      state.current.target = pointerToUnit(
        event.clientX,
        event.clientY,
        element.getBoundingClientRect()
      );
      state.current.active = true;
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

function fallbackStyle(token: string, fade: number): React.CSSProperties {
  const mask = fade > 0 ? "radial-gradient(circle at center, black 20%, transparent 75%)" : "none";
  return {
    background: `radial-gradient(circle at 30% 40%, color-mix(in oklch, var(${token}) 40%, transparent), transparent 70%)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
}

function VelvetVeil({
  color = DEFAULT_VELVET_COLOR,
  speed = 0.5,
  scale = 1,
  flow = 1,
  sheen = 0.3,
  glow = 0.4,
  grain = 0.03,
  fade = 0,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: VelvetVeilProps) {
  assertColorToken(color);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef({ speed, scale, flow, sheen, glow, grain, fade, reducedMotion });
  params.current = { speed, scale, flow, sheen, glow, grain, fade, reducedMotion };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: VELVET_VEIL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const pt = pointerState.current;
        pt.current = [
          lerp(pt.current[0], pt.target[0], POINTER_EASE),
          lerp(pt.current[1], pt.target[1], POINTER_EASE),
        ];
        const on = pt.active && !p.reducedMotion ? 1 : 0;
        gl.uniform3fv(gl.getUniformLocation(program, "uColor"), colorRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uScale"), Math.max(p.scale, 0.01));
        gl.uniform1f(gl.getUniformLocation(program, "uFlow"), clampFlow(p.flow));
        gl.uniform1f(gl.getUniformLocation(program, "uSheen"), clampUnit(p.sheen));
        gl.uniform1f(gl.getUniformLocation(program, "uGlow"), clampUnit(p.glow));
        gl.uniform1f(gl.getUniformLocation(program, "uGrain"), clampUnit(p.grain));
        gl.uniform1f(gl.getUniformLocation(program, "uFade"), clampUnit(p.fade));
        gl.uniform2f(gl.getUniformLocation(program, "uPointer"), pt.current[0], pt.current[1]);
        gl.uniform1f(gl.getUniformLocation(program, "uPointerOn"), on);
        gl.uniform1f(gl.getUniformLocation(program, "uReveal"), p.reducedMotion ? 1 : 0);
      },
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="velvet-veil"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="velvet-veil-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(color, clampUnit(fade))}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="velvet-veil-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="velvet-veil-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

VelvetVeil.displayName = "VelvetVeil";

export { VelvetVeil };
