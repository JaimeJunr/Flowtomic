"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { STAR_WARP_FRAGMENT_SHADER } from "./star-warp-shader";
import {
  assertColorTokens,
  clampDensity,
  clampFlare,
  clampStarSize,
  clampTravel,
  clampTwinkle,
  DEFAULT_STAR_WARP_COLORS,
  fallbackBackground,
  pointerTarget,
  resolveLayers,
  stepToward,
  toColorUniform,
} from "./star-warp-utils";

export type StarWarpProps = React.ComponentProps<"div"> & {
  /** De 1 a 4 tokens de cor (nomes de variável CSS); cada estrela usa uma delas. */
  colors?: string[];
  /** Quantidade de estrelas, de 0,3 a 3. */
  density?: number;
  /** Camadas de profundidade, inteiro de 2 a 8. */
  layers?: number;
  /** Tamanho das estrelas, de 0,3 a 3. */
  starSize?: number;
  /** Cruz de brilho das estrelas mais fortes, de 0 a 2. */
  flare?: number;
  /** Cintilação, de 0 a 1. */
  twinkle?: number;
  /** Velocidade do voo, de -2 a 2; negativo recua. */
  travel?: number;
  /** Giro do campo. */
  rotation?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** O mouse afasta as estrelas e o clique dá um salto em velocidade de dobra. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const NO_CLICK = -1;

type ColorState = { data: Float32Array; count: number };

type Motion = {
  time: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  amount: number;
  targetAmount: number;
  click: number;
};

function readColors(tokens: readonly string[], element?: Element): ColorState {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  const colors = tokens.map((token) => readThemeColor(token, element));
  return { data: toColorUniform(colors, fallback), count: tokens.length };
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
    StarWarpProps,
    "density" | "starSize" | "flare" | "twinkle" | "travel" | "rotation" | "speed"
  >
> & { layers: number };

function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  p: Params,
  colors: ColorState,
  m: Motion,
  reduced: boolean
): void {
  const at = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform3fv(at("uColors"), colors.data);
  gl.uniform1i(at("uColorCount"), colors.count);
  gl.uniform1f(at("uDensity"), clampDensity(p.density));
  gl.uniform1i(at("uLayers"), p.layers);
  gl.uniform1f(at("uStarSize"), clampStarSize(p.starSize));
  gl.uniform1f(at("uFlare"), clampFlare(p.flare));
  gl.uniform1f(at("uTwinkle"), clampTwinkle(p.twinkle));
  gl.uniform1f(at("uTravel"), clampTravel(p.travel));
  gl.uniform1f(at("uRotation"), p.rotation);
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform2f(at("uPointer"), m.x, m.y);
  gl.uniform1f(at("uPointerAmount"), reduced ? 0 : m.amount);
  gl.uniform1f(at("uClick"), reduced ? NO_CLICK : m.click);
  gl.uniform1f(at("uReveal"), reduced ? 1 : 0);
}

function StarWarp({
  colors = DEFAULT_STAR_WARP_COLORS,
  density = 1,
  layers = 4,
  starSize = 1,
  flare = 1,
  twinkle = 0.3,
  travel = 0.5,
  rotation = 0.1,
  speed = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onClick,
  ref,
  ...props
}: StarWarpProps) {
  assertColorTokens(colors);
  const layerCount = resolveLayers(layers);
  const colorsRef = React.useRef<ColorState>({ data: new Float32Array(12), count: 1 });
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = {
    density,
    layers: layerCount,
    starSize,
    flare,
    twinkle,
    travel,
    rotation,
    speed,
  };
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
    amount: 0,
    targetAmount: 0,
    click: NO_CLICK,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: STAR_WARP_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const m = motion.current;
        m.time = time;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        m.amount = stepToward(m.amount, m.targetAmount, FOLLOW);
        setUniforms(gl, program, params.current, colorsRef.current, m, reducedRef.current);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) motion.current.targetAmount = 0;
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
    motion.current.targetAmount = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.targetAmount = 0;
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    // O instante fica no relógio do uTime; o shader calcula a idade do salto.
    if (interactive) motion.current.click = motion.current.time;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: fundo decorativo; o clique só dá um salto visual.
    // biome-ignore lint/a11y/useKeyWithClickEvents: sem ação equivalente por teclado, o efeito é só visual.
    <div
      ref={ref}
      data-slot="star-warp"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="star-warp-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(colors[0])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="star-warp-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="star-warp-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

StarWarp.displayName = "StarWarp";

export { StarWarp };
