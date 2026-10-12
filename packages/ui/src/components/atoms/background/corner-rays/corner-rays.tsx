"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { CORNER_RAYS_FRAGMENT_SHADER } from "./corner-rays-shader";
import {
  assertColorTokens,
  type CornerRaysOrigin,
  clampBlend,
  clampFalloff,
  clampIntensity,
  clampSpread,
  clampTilt,
  cornerPoint,
  DEFAULT_CORNER_RAYS_COLORS,
  fallbackBackground,
  originPoint,
  toColorUniform,
} from "./corner-rays-utils";

export type CornerRaysProps = React.ComponentProps<"div"> & {
  /** Dois tokens de cor (nomes de variável CSS): camada 1 e camada 2 dos raios. */
  colors?: [string, string];
  /** Canto por onde a luz entra. */
  origin?: CornerRaysOrigin;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Brilho geral, de 0 a 4. */
  intensity?: number;
  /** Abertura do leque, de 0,2 a 4. */
  spread?: number;
  /** Giro do leque em graus, de -90 a 90. */
  tilt?: number;
  /** 0 mostra só a camada 1; 1, só a camada 2. */
  blend?: number;
  /** Quão rápido a luz apaga com a distância, de 0,3 a 4. */
  falloff?: number;
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

type Params = Required<
  Pick<CornerRaysProps, "origin" | "intensity" | "spread" | "tilt" | "blend" | "falloff" | "speed">
>;

function CornerRays({
  colors = DEFAULT_CORNER_RAYS_COLORS,
  origin = "top-right",
  speed = 1,
  intensity = 1.5,
  spread = 1.5,
  tilt = 0,
  blend = 0.5,
  falloff = 1.6,
  className,
  children,
  ref,
  ...props
}: CornerRaysProps) {
  assertColorTokens(colors);
  // Valida a origem na renderização, com a mensagem da função pura.
  originPoint(origin);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(6));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { origin, intensity, spread, tilt, blend, falloff, speed };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: CORNER_RAYS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, _time: number) => {
        const p = params.current;
        const at = (name: string) => gl.getUniformLocation(program, name);
        const foco = originPoint(p.origin);
        const canto = cornerPoint(p.origin);
        gl.uniform3fv(at("uColors"), colorsRef.current);
        gl.uniform2f(at("uOrigin"), foco.x, foco.y);
        gl.uniform2f(at("uCorner"), canto.x, canto.y);
        gl.uniform1f(at("uIntensity"), clampIntensity(p.intensity));
        gl.uniform1f(at("uSpread"), clampSpread(p.spread));
        gl.uniform1f(at("uTilt"), clampTilt(p.tilt));
        gl.uniform1f(at("uBlend"), clampBlend(p.blend));
        gl.uniform1f(at("uFalloff"), clampFalloff(p.falloff));
        gl.uniform1f(at("uSpeed"), p.speed);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={ref}
      data-slot="corner-rays"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="corner-rays-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(colors[0], origin)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="corner-rays-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="corner-rays-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

CornerRays.displayName = "CornerRays";

export { CornerRays };
