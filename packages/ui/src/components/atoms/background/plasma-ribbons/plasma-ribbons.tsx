"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { PLASMA_RIBBONS_FRAGMENT_SHADER } from "./plasma-ribbons-shader";
import {
  assertColorTokens,
  clampBend,
  clampCore,
  clampGlow,
  clampGrain,
  clampThickness,
  DEFAULT_BEND,
  DEFAULT_PLASMA_RIBBONS_COLORS,
  fallbackBackground,
  pointerTarget,
  stepToward,
  toColorUniform,
} from "./plasma-ribbons-utils";

export type PlasmaRibbonsProps = React.ComponentProps<"div"> & {
  /** Dois tokens de cor (nomes de variável CSS): primeira e segunda fita. */
  colors?: [string, string];
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** A segunda fita corre no sentido contrário da primeira. */
  reverse?: boolean;
  /** Quanto cada fita se enrosca, de 0 a 2. */
  bend?: [number, number];
  /** Espessura das fitas, de 0,05 a 1. */
  thickness?: number;
  /** Rotação do conjunto, em graus. */
  rotation?: number;
  /** Luz macia ao redor das fitas, de 0 a 2. */
  glow?: number;
  /** Quão branco fica o núcleo, de 0 a 1. */
  core?: number;
  /** Quantidade de grão, de 0 a 1. */
  grain?: number;
  /** Perto do mouse as fitas incham e acendem. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;

type Params = Required<
  Pick<
    PlasmaRibbonsProps,
    "speed" | "reverse" | "bend" | "thickness" | "rotation" | "glow" | "core" | "grain"
  >
>;

type Motion = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  amount: number;
  goal: number;
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

function PlasmaRibbons({
  colors = DEFAULT_PLASMA_RIBBONS_COLORS,
  speed = 1,
  reverse = false,
  bend = DEFAULT_BEND,
  thickness = 0.3,
  rotation = 0,
  glow = 1,
  core = 0.6,
  grain = 0.03,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: PlasmaRibbonsProps) {
  assertColorTokens(colors);
  const colorsRef = React.useRef<Float32Array>(new Float32Array(6));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { speed, reverse, bend, thickness, rotation, glow, core, grain };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    amount: 0,
    goal: 0,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: PLASMA_RIBBONS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const m = motion.current;
        const isReduced = reducedRef.current;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        m.amount = stepToward(m.amount, isReduced ? 0 : m.goal, FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uColors"), colorsRef.current);
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uReverse"), p.reverse ? 1 : 0);
        gl.uniform2f(at("uBend"), clampBend(p.bend[0]), clampBend(p.bend[1]));
        gl.uniform1f(at("uThickness"), clampThickness(p.thickness));
        gl.uniform1f(at("uRotation"), (p.rotation * Math.PI) / 180);
        gl.uniform1f(at("uGlow"), clampGlow(p.glow));
        gl.uniform1f(at("uCore"), clampCore(p.core));
        gl.uniform1f(at("uGrain"), clampGrain(p.grain));
        gl.uniform2f(at("uPointer"), m.x, m.y);
        gl.uniform1f(at("uPointerAmount"), m.amount);
        gl.uniform1f(at("uReveal"), isReduced ? 1 : 0);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) motion.current.goal = 0;
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
    motion.current.goal = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.goal = 0;
  }

  return (
    <div
      ref={ref}
      data-slot="plasma-ribbons"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="plasma-ribbons-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(colors[0], colors[1])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="plasma-ribbons-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="plasma-ribbons-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

PlasmaRibbons.displayName = "PlasmaRibbons";

export { PlasmaRibbons };
