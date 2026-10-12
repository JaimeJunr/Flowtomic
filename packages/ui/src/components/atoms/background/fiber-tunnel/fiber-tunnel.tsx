"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { FIBER_TUNNEL_FRAGMENT_SHADER } from "./fiber-tunnel-shader";
import {
  assertColorToken,
  assertDirection,
  clampCables,
  clampPulseLength,
  clampThickness,
  clampWaviness,
  directionSign,
  fallbackBackground,
  pointerTarget,
  stepToward,
} from "./fiber-tunnel-utils";

export type FiberTunnelProps = React.ComponentProps<"div"> & {
  /** Token de cor dos cabos (nome de variável CSS). */
  cableColor?: string;
  /** Token de cor dos pulsos de luz (nome de variável CSS). */
  pulseColor?: string;
  /** Multiplica o relógio da animação; 0 congela. */
  speed?: number;
  /** Sentido dos pulsos: do centro para a borda ou o contrário. */
  direction?: "outward" | "inward";
  /** Quantidade de cabos, de 4 a 48. */
  cables?: number;
  /** Espessura dos cabos, de 0,1 a 1. */
  thickness?: number;
  /** Comprimento dos pulsos, de 0,05 a 1. */
  pulseLength?: number;
  /** Quanto os cabos ondulam, de 0 a 1. */
  waviness?: number;
  /** O mouse puxa o ponto de fuga. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;

type Motion = { x: number; y: number; targetX: number; targetY: number };

function readColor(token: string, element?: Element): Float32Array {
  const color = readThemeColor(token, element) ?? readThemeColor("--foreground", element) ?? BLACK;
  return new Float32Array([color.r, color.g, color.b]);
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  tokens: readonly [string, string],
  refs: readonly [React.RefObject<Float32Array>, React.RefObject<Float32Array>],
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  const [cableToken, pulseToken] = tokens;
  const [cableRef, pulseRef] = refs;
  React.useLayoutEffect(() => {
    const reread = () => {
      const element = canvasRef.current ?? undefined;
      cableRef.current = readColor(cableToken, element);
      pulseRef.current = readColor(pulseToken, element);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [cableToken, pulseToken, cableRef, pulseRef, canvasRef, redraw]);
}

type Params = Required<
  Pick<
    FiberTunnelProps,
    "speed" | "direction" | "cables" | "thickness" | "pulseLength" | "waviness"
  >
>;

function FiberTunnel({
  cableColor = "--primary",
  pulseColor = "--info",
  speed = 1,
  direction = "outward",
  cables = 20,
  thickness = 0.35,
  pulseLength = 0.28,
  waviness = 0.3,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: FiberTunnelProps) {
  assertColorToken(cableColor);
  assertColorToken(pulseColor);
  assertDirection(direction);
  const cableRef = React.useRef<Float32Array>(new Float32Array(3));
  const pulseRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { speed, direction, cables, thickness, pulseLength, waviness };
  const reduced = useShouldReduceMotion();
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: FIBER_TUNNEL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const m = motion.current;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uCableColor"), cableRef.current);
        gl.uniform3fv(at("uPulseColor"), pulseRef.current);
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uCables"), clampCables(p.cables));
        gl.uniform1f(at("uThickness"), clampThickness(p.thickness));
        gl.uniform1f(at("uPulseLength"), clampPulseLength(p.pulseLength));
        gl.uniform1f(at("uWaviness"), clampWaviness(p.waviness));
        gl.uniform1f(at("uDirection"), directionSign(p.direction));
        gl.uniform2f(at("uPointer"), m.x, m.y);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors([cableColor, pulseColor], [cableRef, pulseRef], canvasRef, redraw);

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

  return (
    <div
      ref={ref}
      data-slot="fiber-tunnel"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="fiber-tunnel-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(cableColor)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="fiber-tunnel-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="fiber-tunnel-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

FiberTunnel.displayName = "FiberTunnel";

export { FiberTunnel };
