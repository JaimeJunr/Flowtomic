"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { SILK_WAVES_FRAGMENT_SHADER } from "./silk-waves-shader";
import {
  assertColorToken,
  clampUnit,
  DEFAULT_SILK_COLOR,
  toColorUniform,
  toRadians,
} from "./silk-waves-utils";

export type SilkWavesProps = React.ComponentProps<"div"> & {
  /** Token de cor (nome de variável CSS). */
  color?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Tamanho das dobras; maior deixa as dobras maiores. */
  scale?: number;
  /** Direção das dobras, em graus. */
  rotation?: number;
  /** Textura de tecido, de 0 a 1. */
  grain?: number;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];

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

function fallbackStyle(token: string): React.CSSProperties {
  const base = `var(${token})`;
  return {
    background: `linear-gradient(135deg, ${base}, color-mix(in oklch, ${base}, var(--foreground) 35%))`,
  };
}

function SilkWaves({
  color = DEFAULT_SILK_COLOR,
  speed = 1,
  scale = 1,
  rotation = -30,
  grain = 0.35,
  className,
  children,
  ref,
  ...props
}: SilkWavesProps) {
  assertColorToken(color);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef({ speed, scale, rotation, grain });
  params.current = { speed, scale, rotation, grain };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: SILK_WAVES_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        gl.uniform3fv(gl.getUniformLocation(program, "uColor"), colorRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
        gl.uniform1f(gl.getUniformLocation(program, "uScale"), p.scale);
        gl.uniform1f(gl.getUniformLocation(program, "uRotation"), toRadians(p.rotation));
        gl.uniform1f(gl.getUniformLocation(program, "uGrain"), clampUnit(p.grain));
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  return (
    <div
      ref={ref}
      data-slot="silk-waves"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="silk-waves-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(color)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="silk-waves-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="silk-waves-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

SilkWaves.displayName = "SilkWaves";

export { SilkWaves };
