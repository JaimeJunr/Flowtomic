"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { LIQUID_METAL_FRAGMENT_SHADER } from "./liquid-metal-shader";
import {
  assertColorToken,
  clampFrequency,
  clampUnit,
  fallbackBackground,
  pointerTarget,
  stepToward,
} from "./liquid-metal-utils";

export type LiquidMetalProps = React.ComponentProps<"div"> & {
  /** Token de cor dos reflexos (nome de variável CSS). */
  color?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Força da distorção, de 0 a 1. */
  amplitude?: number;
  /** Densidade das ondas, de 1 a 8. */
  frequency?: number;
  /** Ondas concêntricas a partir do mouse. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.12;

function readColor(token: string, element?: Element): Float32Array {
  const color = readThemeColor(token, element) ?? readThemeColor("--foreground", element) ?? BLACK;
  return new Float32Array([color.r, color.g, color.b]);
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

type Params = { speed: number; amplitude: number; frequency: number };
type PointerState = { x: number; y: number; strength: number; targetStrength: number };

function LiquidMetal({
  color = "--foreground",
  speed = 1,
  amplitude = 0.3,
  frequency = 3,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: LiquidMetalProps) {
  assertColorToken(color);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>({ speed, amplitude, frequency });
  params.current = { speed, amplitude, frequency };
  const reduced = useShouldReduceMotion();
  const followPointer = pointer && !reduced;
  const state = React.useRef<PointerState>({ x: 0.5, y: 0.5, strength: 0, targetStrength: 0 });
  const target = React.useRef({ x: 0.5, y: 0.5 });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: LIQUID_METAL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const s = state.current;
        s.x = stepToward(s.x, target.current.x, FOLLOW);
        s.y = stepToward(s.y, target.current.y, FOLLOW);
        s.strength = stepToward(s.strength, s.targetStrength, FOLLOW);
        gl.uniform3fv(gl.getUniformLocation(program, "uColor"), colorRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uAmplitude"), clampUnit(p.amplitude));
        gl.uniform1f(gl.getUniformLocation(program, "uFrequency"), clampFrequency(p.frequency));
        gl.uniform3f(gl.getUniformLocation(program, "uPointer"), s.x, s.y, s.strength);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!followPointer) state.current.targetStrength = 0;
  }, [followPointer]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!followPointer || event.pointerType === "touch") return;
    const next = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!next) return;
    if (state.current.targetStrength === 0) {
      // Na entrada, a posição salta para o ponteiro; só a força sobe suavemente.
      state.current.x = next.x;
      state.current.y = next.y;
    }
    target.current = next;
    state.current.targetStrength = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    state.current.targetStrength = 0;
  }

  return (
    <div
      ref={ref}
      data-slot="liquid-metal"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="liquid-metal-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: fallbackBackground(color) }}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="liquid-metal-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="liquid-metal-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

LiquidMetal.displayName = "LiquidMetal";

export { LiquidMetal };
