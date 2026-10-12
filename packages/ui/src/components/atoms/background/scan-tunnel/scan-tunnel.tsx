"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { SCAN_TUNNEL_FRAGMENT_SHADER } from "./scan-tunnel-shader";
import {
  assertColorToken,
  clampGridScale,
  clampLineWidth,
  clampScanDelay,
  clampScanDuration,
  clampScanOpacity,
  fallbackBackground,
  pointerTarget,
  stepToward,
} from "./scan-tunnel-utils";

export type ScanTunnelProps = React.ComponentProps<"div"> & {
  /** Token de cor das linhas da grade (nome de variável CSS). */
  lineColor?: string;
  /** Token de cor da faixa de luz (nome de variável CSS). */
  scanColor?: string;
  /** Tamanho da célula da grade, de 0,05 a 0,5. */
  gridScale?: number;
  /** Espessura das linhas, em px, de 0,5 a 3. */
  lineWidth?: number;
  /** Intensidade da faixa de luz, de 0 a 1. */
  scanOpacity?: number;
  /** Segundos de uma passada da faixa, de 0,5 a 10. */
  scanDuration?: number;
  /** Segundos de pausa entre passadas, de 0 a 10. */
  scanDelay?: number;
  /** Multiplica o relógio da varredura; 0 congela. */
  speed?: number;
  /** O mouse inclina a câmera. */
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
  const [lineToken, scanToken] = tokens;
  const [lineRef, scanRef] = refs;
  React.useLayoutEffect(() => {
    const reread = () => {
      const element = canvasRef.current ?? undefined;
      lineRef.current = readColor(lineToken, element);
      scanRef.current = readColor(scanToken, element);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [lineToken, scanToken, lineRef, scanRef, canvasRef, redraw]);
}

type Params = Required<
  Pick<
    ScanTunnelProps,
    "gridScale" | "lineWidth" | "scanOpacity" | "scanDuration" | "scanDelay" | "speed"
  >
>;

function ScanTunnel({
  lineColor = "--muted-foreground",
  scanColor = "--primary",
  gridScale = 0.12,
  lineWidth = 1,
  scanOpacity = 0.5,
  scanDuration = 2,
  scanDelay = 2,
  speed = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: ScanTunnelProps) {
  assertColorToken(lineColor);
  assertColorToken(scanColor);
  const lineRef = React.useRef<Float32Array>(new Float32Array(3));
  const scanRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>(null as unknown as Params);
  params.current = { gridScale, lineWidth, scanOpacity, scanDuration, scanDelay, speed };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const motion = React.useRef<Motion>({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: SCAN_TUNNEL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const m = motion.current;
        m.x = stepToward(m.x, m.targetX, FOLLOW);
        m.y = stepToward(m.y, m.targetY, FOLLOW);
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uLineColor"), lineRef.current);
        gl.uniform3fv(at("uScanColor"), scanRef.current);
        gl.uniform1f(at("uGridScale"), clampGridScale(p.gridScale));
        gl.uniform1f(at("uLineWidth"), clampLineWidth(p.lineWidth));
        gl.uniform1f(at("uScanOpacity"), clampScanOpacity(p.scanOpacity));
        gl.uniform1f(at("uScanDuration"), clampScanDuration(p.scanDuration));
        gl.uniform1f(at("uScanDelay"), clampScanDelay(p.scanDelay));
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform2f(at("uPointer"), m.x, m.y);
        // Em movimento reduzido o quadro estático mostra só a grade, sem faixa.
        gl.uniform1f(at("uStatic"), reducedRef.current ? 1 : 0);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors([lineColor, scanColor], [lineRef, scanRef], canvasRef, redraw);

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
      data-slot="scan-tunnel"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="scan-tunnel-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(scanColor)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="scan-tunnel-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="scan-tunnel-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

ScanTunnel.displayName = "ScanTunnel";

export { ScanTunnel };
