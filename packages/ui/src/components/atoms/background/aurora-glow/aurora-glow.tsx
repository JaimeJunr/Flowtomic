"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { AURORA_GLOW_FRAGMENT_SHADER } from "./aurora-glow-shader";
import {
  assertColorTokens,
  clampUnit,
  DEFAULT_AURORA_COLORS,
  toColorUniform,
} from "./aurora-glow-utils";

export type AuroraGlowProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (nomes de variável CSS), da esquerda para a direita. */
  colors?: [string, string, string];
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Altura das ondas; 0 deixa a borda reta. */
  amplitude?: number;
  /** Suavidade da borda de baixo, de 0 a 1. */
  blend?: number;
  /** Opacidade máxima da luz, de 0 a 1. */
  intensity?: number;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];

function readColors(tokens: readonly string[]): Float32Array {
  const fallback = readThemeColor("--foreground") ?? BLACK;
  return toColorUniform(
    tokens.map((token) => readThemeColor(token)),
    fallback
  );
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(tokens: readonly string[]): React.RefObject<Float32Array> {
  const ref = React.useRef<Float32Array>(new Float32Array(9));
  const key = tokens.join("|");
  React.useLayoutEffect(() => {
    const list = key.split("|");
    ref.current = readColors(list);
    const observer = new MutationObserver(() => {
      ref.current = readColors(list);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [key]);
  return ref;
}

function fallbackStyle(colors: readonly string[], intensity: number): React.CSSProperties {
  const mask = "linear-gradient(to bottom, black, transparent 60%)";
  return {
    background: `linear-gradient(to right, ${colors.map((token) => `var(${token})`).join(", ")})`,
    maskImage: mask,
    WebkitMaskImage: mask,
    opacity: intensity,
  };
}

function AuroraGlow({
  colors = DEFAULT_AURORA_COLORS,
  speed = 1,
  amplitude = 1,
  blend = 0.5,
  intensity = 0.8,
  className,
  children,
  ref,
  ...props
}: AuroraGlowProps) {
  assertColorTokens(colors);
  const colorsRef = useThemeColors(colors);
  const params = React.useRef({ speed, amplitude, blend, intensity });
  params.current = { speed, amplitude, blend, intensity };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: AURORA_GLOW_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorsRef.current);
        gl.uniform1f(gl.getUniformLocation(program, "uAmplitude"), p.amplitude);
        gl.uniform1f(gl.getUniformLocation(program, "uBlend"), clampUnit(p.blend));
        gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), clampUnit(p.intensity));
        gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), p.speed);
      },
    }),
    [paused, colorsRef]
  );
  const { canvasRef, isSupported } = useWebglCanvas(options);

  return (
    <div
      ref={ref}
      data-slot="aurora-glow"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="aurora-glow-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors, clampUnit(intensity))}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="aurora-glow-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="aurora-glow-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

AuroraGlow.displayName = "AuroraGlow";

export { AuroraGlow };
