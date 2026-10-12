"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { LIGHTNING_BOLTS_FRAGMENT_SHADER } from "./lightning-bolts-shader";
import {
  assertColorToken,
  clampBranches,
  clampFlicker,
  clampGlow,
  clampSpread,
  clampThickness,
  DEFAULT_LIGHTNING_BOLTS_COLOR,
  deviceScale,
  fallbackBackground,
  pointerTarget,
  resolveBolts,
  stepToward,
  toColorUniform,
} from "./lightning-bolts-utils";

export type LightningBoltsProps = React.ComponentProps<"div"> & {
  /** Token de cor (nome de variável CSS) do brilho dos raios. */
  color?: string;
  /** Quantidade de raios, inteiro de 1 a 4. */
  bolts?: number;
  /** Espaço entre os raios, de 0 a 1. */
  spread?: number;
  /** Frequência dos galhos laterais, de 0 a 1. */
  branches?: number;
  /** Inclinação dos raios, em graus; 0 é vertical. */
  angle?: number;
  /** Espessura do núcleo, de 0,3 a 3. */
  thickness?: number;
  /** Alcance do brilho em volta, de 0 a 2. */
  glow?: number;
  /** Intensidade do piscar, de 0 a 1. */
  flicker?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Mouse puxa os raios e o clique chama um raio no ponto. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const NO_STRIKE = -1;

type Motion = {
  time: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
  targetStrength: number;
  strikeAt: number;
  strikeX: number;
  strikeY: number;
};

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

type Params = Required<
  Pick<
    LightningBoltsProps,
    "bolts" | "spread" | "branches" | "angle" | "thickness" | "glow" | "flicker" | "speed"
  >
>;

function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  values: { p: Params; color: Float32Array; m: Motion; reduced: boolean }
): void {
  const { p, color, m, reduced } = values;
  const canvas = gl.canvas as HTMLCanvasElement;
  const at = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform3f(at("uColor"), color[0], color[1], color[2]);
  gl.uniform1f(
    at("uScale"),
    deviceScale(canvas.width, canvas.clientWidth, window.devicePixelRatio)
  );
  gl.uniform1i(at("uBolts"), p.bolts);
  gl.uniform1f(at("uSpread"), clampSpread(p.spread));
  gl.uniform1f(at("uBranches"), clampBranches(p.branches));
  gl.uniform1f(at("uAngle"), p.angle);
  gl.uniform1f(at("uThickness"), clampThickness(p.thickness));
  gl.uniform1f(at("uGlow"), clampGlow(p.glow));
  gl.uniform1f(at("uFlicker"), clampFlicker(p.flicker));
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform3f(at("uPointer"), m.x * canvas.width, m.y * canvas.height, m.strength);
  const strikeAt = reduced ? NO_STRIKE : m.strikeAt;
  gl.uniform3f(at("uStrike"), m.strikeX * canvas.width, m.strikeY * canvas.height, strikeAt);
  gl.uniform1f(at("uStatic"), reduced ? 1 : 0);
}

function LightningBolts({
  color = DEFAULT_LIGHTNING_BOLTS_COLOR,
  bolts = 1,
  spread = 0.6,
  branches = 0.5,
  angle = 0,
  thickness = 1,
  glow = 1,
  flicker = 0.6,
  speed = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onClick,
  ref,
  ...props
}: LightningBoltsProps) {
  assertColorToken(color);
  const count = resolveBolts(bolts);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { bolts: count, spread, branches, angle, thickness, glow, flicker, speed };
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
    strength: 0,
    targetStrength: 0,
    strikeAt: NO_STRIKE,
    strikeX: 0.5,
    strikeY: 0.5,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: LIGHTNING_BOLTS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const m = motion.current;
        m.time = time;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        m.strength = stepToward(m.strength, m.targetStrength, FOLLOW);
        setUniforms(gl, program, {
          p: params.current,
          color: colorRef.current,
          m,
          reduced: reducedRef.current,
        });
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) motion.current.targetStrength = 0;
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
    motion.current.targetStrength = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.targetStrength = 0;
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (!interactive) return;
    const next = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!next) return;
    // O instante fica no relógio do uTime; o shader calcula a idade do raio.
    motion.current.strikeAt = motion.current.time;
    motion.current.strikeX = next.x;
    motion.current.strikeY = next.y;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: fundo decorativo; o clique só chama um raio.
    // biome-ignore lint/a11y/useKeyWithClickEvents: sem ação equivalente por teclado, o efeito é só visual.
    <div
      ref={ref}
      data-slot="lightning-bolts"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="lightning-bolts-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(color)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="lightning-bolts-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="lightning-bolts-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

LightningBolts.displayName = "LightningBolts";

export { LightningBolts };
