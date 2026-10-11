"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { LIGHT_BEAMS_FRAGMENT_SHADER } from "./light-beams-shader";
import {
  assertColorToken,
  clampUnit,
  fallbackBackground,
  type LightBeamsOrigin,
  originPoint,
  pointerAngle,
  stepToward,
} from "./light-beams-utils";

export type { LightBeamsOrigin } from "./light-beams-utils";

export type LightBeamsProps = React.ComponentProps<"div"> & {
  /** Token de cor (nome de variável CSS). */
  color?: string;
  /** De onde os feixes saem. */
  origin?: LightBeamsOrigin;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Abertura do leque. */
  spread?: number;
  /** Alcance dos feixes, em alturas da área. */
  length?: number;
  /** Opacidade máxima da luz, de 0 a 1. */
  intensity?: number;
  /** Gira o leque um pouco na direção do mouse. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.08;

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

type Params = {
  speed: number;
  spread: number;
  length: number;
  intensity: number;
  origin: LightBeamsOrigin;
};

function LightBeams({
  color = "--foreground",
  origin = "top-center",
  speed = 1,
  spread = 1,
  length = 1.6,
  intensity = 0.6,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: LightBeamsProps) {
  assertColorToken(color);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>({ speed, spread, length, intensity, origin });
  params.current = { speed, spread, length, intensity, origin };
  const reduced = useShouldReduceMotion();
  const followPointer = pointer && !reduced;
  const target = React.useRef(0);
  const angle = React.useRef(0);

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: LIGHT_BEAMS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const point = originPoint(p.origin);
        angle.current = stepToward(angle.current, target.current, FOLLOW);
        gl.uniform3fv(gl.getUniformLocation(program, "uColor"), colorRef.current);
        gl.uniform2f(gl.getUniformLocation(program, "uOrigin"), point.x, point.y);
        gl.uniform2f(gl.getUniformLocation(program, "uDirection"), point.dirX, point.dirY);
        gl.uniform1f(gl.getUniformLocation(program, "uAngle"), angle.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpread"), Math.max(0.05, p.spread));
        gl.uniform1f(gl.getUniformLocation(program, "uLength"), Math.max(0.05, p.length));
        gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), clampUnit(p.intensity));
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!followPointer) target.current = 0;
  }, [followPointer]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!followPointer || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    target.current = pointerAngle((event.clientX - rect.left) / rect.width);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    target.current = 0;
  }

  return (
    <div
      ref={ref}
      data-slot="light-beams"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="light-beams-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: fallbackBackground(color, origin),
            opacity: clampUnit(intensity / 0.6),
          }}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="light-beams-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="light-beams-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

LightBeams.displayName = "LightBeams";

export { LightBeams };
