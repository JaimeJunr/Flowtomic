"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { GRAIN_GRADIENT_FRAGMENT_SHADER } from "./grain-gradient-shader";
import {
  assertColorTokens,
  clampRange,
  clampUnit,
  DEFAULT_GRAIN_COLORS,
  toColorUniform,
} from "./grain-gradient-utils";

export type GrainGradientProps = React.ComponentProps<"div"> & {
  /** Exatamente três tokens de cor (nomes de variável CSS). */
  colors?: [string, string, string];
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Ondulação das manchas, de 0 a 2. */
  warp?: number;
  /** De 0 (manchas nítidas) a 1 (tudo misturado). */
  softness?: number;
  /** Contraste final, de 0,5 a 2. */
  contrast?: number;
  /** Intensidade do grão, de 0 a 1. */
  grain?: number;
  /** Aproxima (maior que 1) ou afasta (menor que 1) o desenho. */
  zoom?: number;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];

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
    const reread = () => {
      ref.current = readColors(list, canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [key, ref, canvasRef, redraw]);
}

function GrainGradient({
  colors = DEFAULT_GRAIN_COLORS,
  speed = 1,
  warp = 1,
  softness = 0.4,
  contrast = 1.2,
  grain = 0.1,
  zoom = 1,
  className,
  children,
  ref,
  ...props
}: GrainGradientProps) {
  assertColorTokens(colors);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(9));
  const params = React.useRef({ speed, warp, softness, contrast, grain, zoom });
  params.current = { speed, warp, softness, contrast, grain, zoom };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: GRAIN_GRADIENT_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const set = (name: string, value: number) =>
          gl.uniform1f(gl.getUniformLocation(program, name), value);
        gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorsRef.current);
        set("uSpeed", p.speed);
        set("uWarp", clampRange(p.warp, 0, 2));
        set("uSoftness", clampUnit(p.softness));
        set("uContrast", clampRange(p.contrast, 0.5, 2));
        set("uGrain", clampUnit(p.grain));
        set("uZoom", p.zoom);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={ref}
      data-slot="grain-gradient"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="grain-gradient-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.map((token) => `var(${token})`).join(", ")})`,
          }}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="grain-gradient-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="grain-gradient-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

GrainGradient.displayName = "GrainGradient";

export { GrainGradient };
