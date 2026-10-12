"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { SPECTRAL_BURST_FRAGMENT_SHADER } from "./spectral-burst-shader";
import {
  assertColorTokens,
  assertMotion,
  clampCenter,
  clampDistort,
  clampIntensity,
  DEFAULT_SPECTRAL_COLORS,
  normalizeRayCount,
  type SpectralMotion,
  toColorUniform,
} from "./spectral-burst-utils";

export type SpectralBurstProps = React.ComponentProps<"div"> & {
  /** Dois tokens de cor (nomes de variável CSS) do gradiente dos raios. */
  colors?: [string, string];
  /** Intensidade da luz, de 0 a 4. */
  intensity?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Giro contínuo ou balanço. */
  motion?: SpectralMotion;
  /** Dobra dos raios, de 0 a 2. */
  distort?: number;
  /** 0 = raios livres; de 4 a 64 = raios discretos. */
  rayCount?: number;
  /** Deslocamento do foco em fração da tela, cada eixo de -0,5 a 0,5. */
  center?: { x: number; y: number };
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const NO_OFFSET = { x: 0, y: 0 };

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

function fallbackStyle(colors: readonly string[]): React.CSSProperties {
  const mask = "radial-gradient(circle at 50% 50%, transparent 8%, black 55%)";
  return {
    background: `repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in oklch, var(${colors[0]}) 30%, transparent) 0deg 4deg, transparent 4deg 12deg)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
}

function SpectralBurst({
  colors = DEFAULT_SPECTRAL_COLORS,
  intensity = 1.5,
  speed = 0.5,
  motion = "spin",
  distort = 0.5,
  rayCount = 0,
  center = NO_OFFSET,
  className,
  children,
  ref,
  ...props
}: SpectralBurstProps) {
  assertColorTokens(colors);
  assertMotion(motion);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(6));
  const params = React.useRef({ intensity, speed, motion, distort, rayCount, center });
  params.current = { intensity, speed, motion, distort, rayCount, center };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: SPECTRAL_BURST_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const [cx, cy] = clampCenter(p.center);
        gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorsRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), clampIntensity(p.intensity));
        gl.uniform1f(gl.getUniformLocation(program, "uSway"), p.motion === "sway" ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(program, "uDistort"), clampDistort(p.distort));
        gl.uniform1f(gl.getUniformLocation(program, "uRayCount"), normalizeRayCount(p.rayCount));
        gl.uniform2f(gl.getUniformLocation(program, "uCenter"), cx, cy);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={ref}
      data-slot="spectral-burst"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="spectral-burst-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="spectral-burst-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="spectral-burst-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

SpectralBurst.displayName = "SpectralBurst";

export { SpectralBurst };
