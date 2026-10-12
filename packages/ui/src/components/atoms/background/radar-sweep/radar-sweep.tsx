"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { RADAR_SWEEP_FRAGMENT_SHADER } from "./radar-sweep-shader";
import {
  assertColorToken,
  assertMode,
  clampClutter,
  clampRings,
  clampScale,
  clampSpokes,
  clampTargets,
  clampTrail,
  fallbackBackground,
  modeCode,
  pointerTarget,
  type RadarMode,
  stepToward,
} from "./radar-sweep-utils";

export type RadarSweepProps = React.ComponentProps<"div"> & {
  /** Token de cor do radar (nome de variável CSS). */
  color?: string;
  /** `sweep` gira um feixe; `pulse` emite anéis de sonar do centro. */
  mode?: RadarMode;
  /** Voltas por unidade de tempo; negativo gira ao contrário; 0 congela. */
  speed?: number;
  /** Comprimento do rastro do feixe, de 0 a 1. */
  trail?: number;
  /** Raio do radar relativo ao menor lado, de 0,2 a 1,5. */
  scale?: number;
  /** Anéis de distância, de 1 a 12. */
  rings?: number;
  /** Linhas de rumo, de 0 a 36. */
  spokes?: number;
  /** Contatos que derivam, de 0 a 16. */
  targets?: number;
  /** Quantidade de retornos esparsos, de 0 a 1. */
  clutter?: number;
  /** O mouse acende a grade por perto e vira um contato. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const FOLLOW = 0.15;
const FADE = 0.1;

type Motion = { x: number; y: number; targetX: number; targetY: number };
type Params = Required<
  Pick<
    RadarSweepProps,
    "mode" | "speed" | "trail" | "scale" | "rings" | "spokes" | "targets" | "clutter"
  >
>;

function readColor(token: string, element?: Element): Float32Array {
  const color = readThemeColor(token, element) ?? readThemeColor("--foreground", element) ?? BLACK;
  return new Float32Array([color.r, color.g, color.b]);
}

// Relê a cor ao montar, quando o token muda e quando o tema muda no <html>.
function useThemeColor(
  token: string,
  colorRef: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    const reread = () => {
      colorRef.current = readColor(token, canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [token, colorRef, canvasRef, redraw]);
}

function RadarSweep({
  color = "--success",
  mode = "sweep",
  speed = 1,
  trail = 0.35,
  scale = 0.9,
  rings = 6,
  spokes = 12,
  targets = 6,
  clutter = 0.35,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: RadarSweepProps) {
  assertColorToken(color);
  assertMode(mode);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { mode, speed, trail, scale, rings, spokes, targets, clutter };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  // Força 0-1 do ponteiro: sobe enquanto o mouse está em cima e desce ao sair.
  const force = React.useRef({ value: 0, target: 0 });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: RADAR_SWEEP_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const m = motion.current;
        const f = force.current;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        f.value = stepToward(f.value, f.target, FADE);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uColor"), colorRef.current);
        gl.uniform1f(at("uMode"), modeCode(p.mode));
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uTrail"), clampTrail(p.trail));
        gl.uniform1f(at("uScale"), clampScale(p.scale));
        gl.uniform1f(at("uRings"), clampRings(p.rings));
        gl.uniform1f(at("uSpokes"), clampSpokes(p.spokes));
        gl.uniform1f(at("uTargets"), clampTargets(p.targets));
        gl.uniform1f(at("uClutter"), clampClutter(p.clutter));
        gl.uniform2f(at("uPointer"), m.x, m.y);
        gl.uniform1f(at("uPointerForce"), f.value);
        // Em movimento reduzido o quadro estático para o feixe a 45 graus.
        gl.uniform1f(at("uStatic"), reducedRef.current ? 1 : 0);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) force.current.target = 0;
  }, [interactive]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!interactive || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    const next = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!next) return;
    motion.current.targetX = next.x;
    motion.current.targetY = next.y;
    force.current.target = 1;
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    force.current.target = 0;
  }

  return (
    <div
      ref={ref}
      data-slot="radar-sweep"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="radar-sweep-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(color)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="radar-sweep-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="radar-sweep-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

RadarSweep.displayName = "RadarSweep";

export { RadarSweep };
