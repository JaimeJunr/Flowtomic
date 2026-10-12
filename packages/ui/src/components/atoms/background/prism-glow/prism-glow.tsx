"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { PRISM_GLOW_FRAGMENT_SHADER } from "./prism-glow-shader";
import {
  assertColorToken,
  clampBands,
  clampGlow,
  clampHeight,
  clampUnit,
  DEFAULT_PRISM_TINT,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./prism-glow-utils";

export type PrismGlowProps = React.ComponentProps<"div"> & {
  /** Token de cor (nome de variável CSS) que puxa o espectro. */
  tint?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Intensidade do brilho, de 0 a 2. */
  glow?: number;
  /** Frequência das faixas de espectro, de 0,5 a 4. */
  bands?: number;
  /** Altura relativa do prisma, de 0,3 a 1. */
  height?: number;
  /** Grão, de 0 a 1. */
  noise?: number;
  /** Se o mouse inclina o prisma. */
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

function fallbackStyle(token: string): React.CSSProperties {
  return {
    background: `radial-gradient(ellipse at 50% 80%, color-mix(in oklch, var(${token}) 45%, transparent), transparent 60%)`,
  };
}

function PrismGlow({
  tint = DEFAULT_PRISM_TINT,
  speed = 0.5,
  glow = 1,
  bands = 1,
  height = 0.7,
  noise = 0.5,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: PrismGlowProps) {
  assertColorToken(tint);
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
  const params = React.useRef({ speed, glow, bands, height, noise, reducedMotion });
  params.current = { speed, glow, bands, height, noise, reducedMotion };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: PRISM_GLOW_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const pt = pointerState.current;
        pt.current = [
          lerp(pt.current[0], pt.target[0], POINTER_EASE),
          lerp(pt.current[1], pt.target[1], POINTER_EASE),
        ];
        gl.uniform3fv(gl.getUniformLocation(program, "uTint"), colorRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uGlow"), clampGlow(p.glow));
        gl.uniform1f(gl.getUniformLocation(program, "uBands"), clampBands(p.bands));
        gl.uniform1f(gl.getUniformLocation(program, "uHeight"), clampHeight(p.height));
        gl.uniform1f(gl.getUniformLocation(program, "uNoise"), clampUnit(p.noise));
        gl.uniform2f(gl.getUniformLocation(program, "uPointer"), pt.current[0], pt.current[1]);
      },
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(tint, colorRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="prism-glow"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="prism-glow-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(tint)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="prism-glow-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="prism-glow-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

PrismGlow.displayName = "PrismGlow";

export { PrismGlow };
