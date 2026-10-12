"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { DITHER_WAVES_FRAGMENT_SHADER } from "./dither-waves-shader";
import {
  activeTrail,
  assertColorToken,
  clampContrast,
  clampLevels,
  clampPixelSize,
  clampScale,
  type DitherPattern,
  fallbackBackground,
  patternIndex,
  pointerTarget,
  pushTrail,
  type TrailPoint,
  trailUniforms,
} from "./dither-waves-utils";

export type DitherWavesProps = React.ComponentProps<"div"> & {
  /** Token de cor das ondas (nome de variável CSS). */
  color?: string;
  /** Padrão do pontilhado: matriz de Bayer 4x4, 8x8 ou linhas. */
  pattern?: DitherPattern;
  /** Tons por canal, de 2 a 8. */
  levels?: number;
  /** Tamanho do bloco em px de tela, de 1 a 8. */
  pixelSize?: number;
  /** Tamanho das ondas; maior deixa as ondas mais largas. */
  scale?: number;
  /** Multiplica a velocidade; 0 congela. */
  speed?: number;
  /** Contraste das ondas, de 0,5 a 2. */
  contrast?: number;
  /** Se o mouse apaga as ondas por onde passa. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const TRAIL_INTERVAL_MS = 30;

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

type Params = {
  pattern: DitherPattern;
  levels: number;
  pixelSize: number;
  scale: number;
  speed: number;
  contrast: number;
};

type TrailState = { points: TrailPoint[]; time: number; lastPushMs: number };

function DitherWaves({
  color = "--primary",
  pattern = "bayer8",
  levels = 4,
  pixelSize = 2,
  scale = 1,
  speed = 1,
  contrast = 1,
  pointer = true,
  className,
  children,
  onPointerMove,
  ref,
  ...props
}: DitherWavesProps) {
  assertColorToken(color);
  patternIndex(pattern);
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const params = React.useRef<Params>({ pattern, levels, pixelSize, scale, speed, contrast });
  params.current = { pattern, levels, pixelSize, scale, speed, contrast };
  const reduced = useShouldReduceMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const interactive = pointer && !reduced;
  const trail = React.useRef<TrailState>({
    points: [],
    time: 0,
    lastPushMs: Number.NEGATIVE_INFINITY,
  });

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: DITHER_WAVES_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        const p = params.current;
        const state = trail.current;
        state.time = time;
        state.points = reducedRef.current ? [] : activeTrail(state.points, time);
        const packed = trailUniforms(state.points);
        const at = (name: string) => gl.getUniformLocation(program, name);
        // O bloco é em px de tela; o canvas é desenhado em px do dispositivo.
        const dpr = window.devicePixelRatio || 1;
        gl.uniform3fv(at("uColor"), colorRef.current);
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uScale"), clampScale(p.scale));
        gl.uniform1f(at("uLevels"), clampLevels(p.levels));
        gl.uniform1f(at("uPixelSize"), clampPixelSize(p.pixelSize) * dpr);
        gl.uniform1f(at("uContrast"), clampContrast(p.contrast));
        gl.uniform1i(at("uPattern"), patternIndex(p.pattern));
        gl.uniform1f(at("uReveal"), reducedRef.current ? 1 : 0);
        gl.uniform3fv(at("uTrail"), packed.data);
        gl.uniform1i(at("uTrailCount"), packed.count);
      },
    }),
    [paused]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(color, colorRef, canvasRef, redraw);

  React.useEffect(() => {
    if (!interactive) trail.current.points = [];
  }, [interactive]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!interactive || event.pointerType === "touch") return;
    const state = trail.current;
    const now = performance.now();
    if (now - state.lastPushMs < TRAIL_INTERVAL_MS) return;
    const at = pointerTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect()
    );
    if (!at) return;
    state.lastPushMs = now;
    state.points = pushTrail(state.points, { x: at.x, y: at.y, start: state.time });
    // Fundo congelado não desenha sozinho: o rastro precisa de um quadro para aparecer.
    if (paused) redraw();
  }

  return (
    <div
      ref={ref}
      data-slot="dither-waves"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="dither-waves-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackBackground(color)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="dither-waves-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="dither-waves-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

DitherWaves.displayName = "DitherWaves";

export { DitherWaves };
