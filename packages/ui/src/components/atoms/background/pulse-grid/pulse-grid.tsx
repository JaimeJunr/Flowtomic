"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { advanceRipples, initialMotion, type Motion } from "./pulse-grid-motion";
import { PULSE_GRID_FRAGMENT_SHADER } from "./pulse-grid-shader";
import {
  assertColorToken,
  clampCellSize,
  clampLineWidth,
  clampRippleStrength,
  clampUnit,
  deviceScale,
  fallbackBackground,
  type PulseGridVariant,
  pointerTarget,
  pushRipple,
  rippleUniforms,
  stepToward,
  variantIndex,
} from "./pulse-grid-utils";

export type PulseGridProps = React.ComponentProps<"div"> & {
  /** Token de cor da grade (nome de variável CSS). */
  color?: string;
  /** Desenho da grade: linhas, pontos ou cruzes. */
  variant?: PulseGridVariant;
  /** Lado da célula, em px (8 a 200). */
  cellSize?: number;
  /** Espessura do traço, em px (0,5 a 4). */
  lineWidth?: number;
  /** Quanto as ondas acendem a grade, de 0 a 1. */
  glow?: number;
  /** Quanto as ondas entortam a grade, de 0 a 2. */
  rippleStrength?: number;
  /** Multiplica a velocidade de propagação das ondas. */
  rippleSpeed?: number;
  /** Segundos entre ondas automáticas; 0 desliga. */
  rippleInterval?: number;
  /** Quanto as bordas esmaecem, de 0 a 1. */
  fade?: number;
  /** Rastro do mouse e onda forte no clique. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const TRAIL_INTERVAL_MS = 120;

function readColor(token: string, element?: Element): Float32Array {
  const color = readThemeColor(token, element) ?? readThemeColor("--foreground", element) ?? BLACK;
  return new Float32Array([color.r, color.g, color.b]);
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
    PulseGridProps,
    | "variant"
    | "cellSize"
    | "lineWidth"
    | "glow"
    | "rippleStrength"
    | "rippleSpeed"
    | "rippleInterval"
    | "fade"
  >
>;

function PulseGrid({
  color = "--foreground",
  variant = "lines",
  cellSize = 48,
  lineWidth = 1,
  glow = 0.6,
  rippleStrength = 1,
  rippleSpeed = 1,
  rippleInterval = 2.6,
  fade = 0.5,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  onClick,
  ref,
  ...props
}: PulseGridProps) {
  assertColorToken(color);
  variantIndex(variant);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = {
    variant,
    cellSize,
    lineWidth,
    glow,
    rippleStrength,
    rippleSpeed,
    rippleInterval,
    fade,
  };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>(initialMotion());

  const options = React.useMemo(
    () => ({
      fragmentShader: PULSE_GRID_FRAGMENT_SHADER,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const p = params.current;
        const m = motion.current;
        const canvas = gl.canvas as HTMLCanvasElement;
        const isReduced = reducedRef.current;
        const list = advanceRipples(m, time, p.rippleInterval, isReduced);
        const packed = rippleUniforms(list, canvas.width, canvas.height);
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        m.strength = stepToward(m.strength, m.targetStrength, FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uColor"), colorRef.current);
        const scale = deviceScale(canvas.width, canvas.clientWidth, window.devicePixelRatio);
        gl.uniform1f(at("uScale"), scale);
        gl.uniform1f(at("uCellSize"), clampCellSize(p.cellSize) * scale);
        gl.uniform1f(at("uLineWidth"), clampLineWidth(p.lineWidth) * scale);
        gl.uniform1i(at("uVariant"), variantIndex(p.variant));
        gl.uniform1f(at("uGlow"), clampUnit(p.glow));
        gl.uniform1f(at("uRippleStrength"), clampRippleStrength(p.rippleStrength));
        gl.uniform1f(at("uRippleSpeed"), p.rippleSpeed);
        gl.uniform1f(at("uFade"), clampUnit(p.fade));
        gl.uniform3fv(at("uRipples"), packed.positions);
        gl.uniform1fv(at("uStrengths"), packed.strengths);
        gl.uniform1i(at("uRippleCount"), packed.count);
        gl.uniform3f(at("uPointer"), m.x * canvas.width, m.y * canvas.height, m.strength);
        gl.uniform1f(at("uReveal"), isReduced ? 1 : 0);
      },
    }),
    []
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) motion.current.targetStrength = 0;
  }, [interactive]);

  function addRipple(x: number, y: number, strength: number) {
    const m = motion.current;
    m.ripples = pushRipple(m.ripples, { x, y, start: m.time, strength });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!interactive || event.pointerType === "touch") return;
    const next = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!next) return;
    const m = motion.current;
    if (m.targetStrength === 0) {
      // Na entrada, a luz salta para o ponteiro; só a força sobe suavemente.
      m.x = next.x;
      m.y = next.y;
    }
    m.targetX = next.x;
    m.targetY = next.y;
    m.targetStrength = 1;
    const now = performance.now();
    if (now - m.lastTrail >= TRAIL_INTERVAL_MS) {
      m.lastTrail = now;
      addRipple(next.x, next.y, 0.35);
    }
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    motion.current.targetStrength = 0;
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (!interactive) return;
    const at = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (at) addRipple(at.x, at.y, 2);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: fundo decorativo; o clique só solta uma onda.
    // biome-ignore lint/a11y/useKeyWithClickEvents: sem ação equivalente por teclado, o efeito é só visual.
    <div
      ref={ref}
      data-slot="pulse-grid"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="pulse-grid-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(color, cellSize)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="pulse-grid-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="pulse-grid-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

PulseGrid.displayName = "PulseGrid";

export { PulseGrid };
