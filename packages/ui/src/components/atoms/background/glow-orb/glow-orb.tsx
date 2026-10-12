"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { GLOW_ORB_FRAGMENT_SHADER } from "./glow-orb-shader";
import {
  assertColorTokens,
  clampGlow,
  clampHighlight,
  clampSize,
  clampTrail,
  clampWobble,
  DEFAULT_GLOW_ORB_COLORS,
  fallbackBackground,
  pointerTarget,
  stepToward,
  toColorUniform,
} from "./glow-orb-utils";

export type GlowOrbProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (nomes de variável CSS): duas do anel e a do brilho de trás. */
  colors?: [string, string, string];
  /** Tamanho relativo ao menor lado, de 0,2 a 1,5. */
  size?: number;
  /** Largura do brilho em volta do anel, de 0 a 2. */
  glow?: number;
  /** Respiração e deformação do anel, de 0 a 2. */
  wobble?: number;
  /** Força da luz que percorre o anel, de 0 a 2. */
  highlight?: number;
  /** Comprimento da cauda da luz, de 0 a 2. */
  trail?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Mouse estica e acende o anel; o clique faz o anel pulsar. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const FORCE_FOLLOW = 0.1;
const NO_PULSE = -1;

type Motion = {
  time: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  force: number;
  targetForce: number;
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
  Pick<GlowOrbProps, "size" | "glow" | "wobble" | "highlight" | "trail" | "speed">
>;

function GlowOrb({
  colors = DEFAULT_GLOW_ORB_COLORS,
  size = 1,
  glow = 1,
  wobble = 1,
  highlight = 1,
  trail = 1,
  speed = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onClick,
  ref,
  ...props
}: GlowOrbProps) {
  assertColorTokens(colors);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(9));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { size, glow, wobble, highlight, trail, speed };
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
    force: 0,
    targetForce: 0,
    pulse: NO_PULSE,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: GLOW_ORB_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const p = params.current;
        const m = motion.current;
        const isReduced = reducedRef.current;
        m.time = time;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        m.force = stepToward(m.force, m.targetForce, FORCE_FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uColors"), colorsRef.current);
        gl.uniform1f(at("uSize"), clampSize(p.size));
        gl.uniform1f(at("uGlow"), clampGlow(p.glow));
        gl.uniform1f(at("uWobble"), clampWobble(p.wobble));
        gl.uniform1f(at("uHighlight"), clampHighlight(p.highlight));
        gl.uniform1f(at("uTrail"), clampTrail(p.trail));
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform2f(at("uPointer"), m.x, m.y);
        gl.uniform1f(at("uPointerForce"), isReduced ? 0 : m.force);
        gl.uniform1f(at("uPulse"), isReduced ? NO_PULSE : m.pulse);
        gl.uniform1f(at("uCalm"), isReduced ? 1 : 0);
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
      motion.current.targetForce = 0;
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
    motion.current.targetForce = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.targetForce = 0;
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
      data-slot="glow-orb"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="glow-orb-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(colors[0])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="glow-orb-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="glow-orb-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

GlowOrb.displayName = "GlowOrb";

export { GlowOrb };
