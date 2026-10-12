"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { LIGHT_BLINDS_FRAGMENT_SHADER } from "./light-blinds-shader";
import {
  assertColorTokens,
  clampBlindCount,
  clampNoise,
  clampSoftness,
  clampSpotlightRadius,
  DEFAULT_BLIND_COLORS,
  effectiveBlindCount,
  expandTokens,
  fallbackBackground,
  stepToward,
  toColorUniform,
} from "./light-blinds-utils";

export type LightBlindsProps = React.ComponentProps<"div"> & {
  /** De 1 a 8 tokens de cor (nomes de variável CSS); o degradê corre por eles. */
  colors?: string[];
  /** Giro do degradê e das lâminas, em graus. */
  angle?: number;
  /** Limite de lâminas, de 2 a 64. */
  blindCount?: number;
  /** Largura mínima de cada lâmina, em px. */
  blindMinWidth?: number;
  /** Raio do holofote, relativo ao menor lado. */
  spotlightRadius?: number;
  /** Expoente da borda do holofote; maior deixa a borda mais seca. */
  spotlightSoftness?: number;
  /** Lado aceso de cada lâmina. */
  shine?: "left" | "right";
  /** Grão sobre a luz, de 0 a 1. */
  noise?: number;
  /** Multiplica o tempo do degradê; 0 congela. */
  speed?: number;
  /** O holofote segue o mouse. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.1;

type ColorState = { data: Float32Array; count: number };

function readColors(tokens: readonly string[], element?: Element): ColorState {
  const list = expandTokens(tokens);
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  const colors = list.map((token) => readThemeColor(token, element));
  return { data: toColorUniform(colors, fallback), count: list.length };
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  tokens: readonly string[],
  ref: React.RefObject<ColorState>,
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

type Params = Required<
  Pick<
    LightBlindsProps,
    | "angle"
    | "blindCount"
    | "blindMinWidth"
    | "spotlightRadius"
    | "spotlightSoftness"
    | "shine"
    | "noise"
    | "speed"
  >
>;

function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  p: Params,
  colors: ColorState,
  width: number,
  pointer: { x: number; y: number }
): void {
  const loc = (name: string) => gl.getUniformLocation(program, name);
  const blinds = effectiveBlindCount(width, clampBlindCount(p.blindCount), p.blindMinWidth);
  gl.uniform3fv(loc("uColors"), colors.data);
  gl.uniform1i(loc("uColorCount"), colors.count);
  gl.uniform1f(loc("uAngle"), (p.angle * Math.PI) / 180);
  gl.uniform1f(loc("uBlinds"), blinds);
  gl.uniform1f(loc("uRadius"), clampSpotlightRadius(p.spotlightRadius));
  gl.uniform1f(loc("uSoftness"), clampSoftness(p.spotlightSoftness));
  gl.uniform1f(loc("uShine"), p.shine === "right" ? 1 : 0);
  gl.uniform1f(loc("uNoise"), clampNoise(p.noise));
  gl.uniform1f(loc("uSpeed"), p.speed);
  gl.uniform2f(loc("uPointer"), pointer.x, pointer.y);
}

function LightBlinds({
  colors = DEFAULT_BLIND_COLORS,
  angle = 0,
  blindCount = 16,
  blindMinWidth = 60,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  shine = "left",
  noise = 0.3,
  speed = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: LightBlindsProps) {
  assertColorTokens(colors);
  const colorsRef = React.useRef<ColorState>({ data: new Float32Array(24), count: 2 });
  const params = React.useRef<Params>({} as Params);
  params.current = {
    angle,
    blindCount,
    blindMinWidth,
    spotlightRadius,
    spotlightSoftness,
    shine,
    noise,
    speed,
  };
  const reduced = useShouldReduceMotion();
  const followPointer = pointer && !reduced;
  const target = React.useRef({ x: 0.5, y: 0.5 });
  const current = React.useRef({ x: 0.5, y: 0.5 });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: LIGHT_BLINDS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        current.current = {
          x: stepToward(current.current.x, target.current.x, FOLLOW),
          y: stepToward(current.current.y, target.current.y, FOLLOW),
        };
        // Largura em px CSS (o buffer do canvas pode ter outra escala).
        const width = (gl.canvas as HTMLCanvasElement).clientWidth;
        setUniforms(gl, program, params.current, colorsRef.current, width, current.current);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!followPointer) target.current = { x: 0.5, y: 0.5 };
  }, [followPointer]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!followPointer || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    target.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: 1 - (event.clientY - rect.top) / rect.height,
    };
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    target.current = { x: 0.5, y: 0.5 };
  }

  const mask = "radial-gradient(circle at center, black, transparent 70%)";
  return (
    <div
      ref={ref}
      data-slot="light-blinds"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="light-blinds-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: fallbackBackground(colors[0]),
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="light-blinds-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="light-blinds-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

LightBlinds.displayName = "LightBlinds";

export { LightBlinds };
