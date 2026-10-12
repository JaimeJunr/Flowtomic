"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { LIGHT_COLUMN_FRAGMENT_SHADER } from "./light-column-shader";
import {
  assertColorTokens,
  clampGrain,
  clampIntensity,
  clampTwist,
  clampWidth,
  DEFAULT_LIGHT_COLUMN_COLORS,
  fallbackBackground,
  pointerTarget,
  resolveDetail,
  stepToward,
  toColorUniform,
} from "./light-column-utils";

export type LightColumnProps = React.ComponentProps<"div"> & {
  /** Dois tokens de cor (nomes de variável CSS): base e topo da coluna. */
  colors?: [string, string];
  /** Brilho geral, de 0 a 2. */
  intensity?: number;
  /** Largura relativa da coluna, de 0,1 a 1. */
  width?: number;
  /** Inclinação da coluna, em graus. */
  tilt?: number;
  /** Quanto os filamentos se torcem, de 0 a 2. */
  twist?: number;
  /** Oitavas da turbulência, inteiro de 1 a 6. */
  detail?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Quantidade de grão, de 0 a 1. */
  grain?: number;
  /** Mouse inclina a coluna e o clique manda um pulso de luz. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const NO_PULSE = -1;

type Motion = {
  time: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  pulse: number;
};

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
  Pick<LightColumnProps, "intensity" | "width" | "tilt" | "twist" | "detail" | "speed" | "grain">
>;

function LightColumn({
  colors = DEFAULT_LIGHT_COLUMN_COLORS,
  intensity = 1,
  width = 0.3,
  tilt = 25,
  twist = 0.4,
  detail = 4,
  speed = 1,
  grain = 0.5,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onClick,
  ref,
  ...props
}: LightColumnProps) {
  assertColorTokens(colors);
  const octaves = resolveDetail(detail);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(6));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { intensity, width, tilt, twist, detail: octaves, speed, grain };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>({
    time: 0,
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    pulse: NO_PULSE,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: LIGHT_COLUMN_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const p = params.current;
        const m = motion.current;
        const isReduced = reducedRef.current;
        m.time = time;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uColors"), colorsRef.current);
        gl.uniform1f(at("uIntensity"), clampIntensity(p.intensity));
        gl.uniform1f(at("uWidth"), clampWidth(p.width));
        gl.uniform1f(at("uTilt"), p.tilt);
        gl.uniform1f(at("uTwist"), clampTwist(p.twist));
        gl.uniform1i(at("uDetail"), p.detail);
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uGrain"), clampGrain(p.grain));
        gl.uniform2f(at("uPointer"), m.x, m.y);
        gl.uniform1f(at("uPulse"), isReduced ? NO_PULSE : m.pulse);
        gl.uniform1f(at("uReveal"), isReduced ? 1 : 0);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) {
      motion.current.targetX = 0.5;
      motion.current.targetY = 0.5;
    }
  }, [interactive]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!interactive || event.pointerType === "touch") return;
    const next = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!next) return;
    motion.current.targetX = next.x;
    motion.current.targetY = next.y;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.targetX = 0.5;
    motion.current.targetY = 0.5;
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    // O instante fica no relógio do uTime; o shader calcula a idade do pulso.
    if (interactive) motion.current.pulse = motion.current.time;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: fundo decorativo; o clique só manda um pulso.
    // biome-ignore lint/a11y/useKeyWithClickEvents: sem ação equivalente por teclado, o efeito é só visual.
    <div
      ref={ref}
      data-slot="light-column"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="light-column-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(colors[0])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="light-column-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="light-column-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

LightColumn.displayName = "LightColumn";

export { LightColumn };
