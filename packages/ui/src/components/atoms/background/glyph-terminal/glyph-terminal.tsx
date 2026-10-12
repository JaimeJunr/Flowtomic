"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { GLYPH_TERMINAL_FRAGMENT_SHADER } from "./glyph-terminal-shader";
import {
  assertColorToken,
  clampCurvature,
  clampFlicker,
  clampGlitch,
  clampGlyphSize,
  clampUnit,
  DEFAULT_GLYPH_TINT,
  lerp,
  pointerToUnit,
  toColorUniform,
} from "./glyph-terminal-utils";

export type GlyphTerminalProps = React.ComponentProps<"div"> & {
  /** Token de cor dos caracteres (nome de variável CSS). */
  tint?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Lado de um glifo, em px (6 a 32). */
  glyphSize?: number;
  /** Força das linhas de varredura, de 0 a 1. */
  scanlines?: number;
  /** Frequência das faixas que escorregam, de 0 a 2. */
  glitch?: number;
  /** Intensidade do piscar da imagem, de 0 a 2. */
  flicker?: number;
  /** Curvatura do vidro nas bordas, de 0 a 0,5. */
  curvature?: number;
  /** Se o mouse acende a região próxima. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

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

type PointerState = { target: [number, number]; current: [number, number]; active: boolean };

// Só mouse e caneta: toque não tem "passar por cima".
function usePointerTarget(root: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const state = React.useRef<PointerState>({
    target: [0.5, 0.5],
    current: [0.5, 0.5],
    active: false,
  });
  React.useEffect(() => {
    const element = root.current;
    if (!element || !enabled) {
      state.current.active = false;
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      state.current.target = pointerToUnit(
        event.clientX,
        event.clientY,
        element.getBoundingClientRect()
      );
      state.current.active = true;
    };
    const onLeave = () => {
      state.current.target = [0.5, 0.5];
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [root, enabled]);
  return state;
}

function fallbackStyle(token: string): React.CSSProperties {
  return {
    background: `repeating-linear-gradient(0deg, color-mix(in oklch, var(${token}) 12%, transparent) 0 1px, transparent 1px 3px)`,
  };
}

function GlyphTerminal({
  tint = DEFAULT_GLYPH_TINT,
  speed = 0.3,
  glyphSize = 16,
  scanlines = 0.3,
  glitch = 1,
  flicker = 1,
  curvature = 0.2,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: GlyphTerminalProps) {
  assertColorToken(tint);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorRef = React.useRef<Float32Array>(new Float32Array(3));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef({
    speed,
    glyphSize,
    scanlines,
    glitch,
    flicker,
    curvature,
    reducedMotion,
  });
  params.current = { speed, glyphSize, scanlines, glitch, flicker, curvature, reducedMotion };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: GLYPH_TERMINAL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const pt = pointerState.current;
        pt.current = [
          lerp(pt.current[0], pt.target[0], POINTER_EASE),
          lerp(pt.current[1], pt.target[1], POINTER_EASE),
        ];
        const on = pt.active && !p.reducedMotion ? 1 : 0;
        // Tamanho do glifo vem em px CSS; o shader trabalha em px de dispositivo.
        const canvas = gl.canvas as HTMLCanvasElement;
        const ratio = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
        // Movimento reduzido desliga glitch e piscar: o quadro estático fica limpo.
        const still = p.reducedMotion ? 0 : 1;
        const at = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform3fv(at("uTint"), colorRef.current);
        gl.uniform1f(at("uSpeed"), p.speed);
        gl.uniform1f(at("uGlyphSize"), clampGlyphSize(p.glyphSize) * ratio);
        gl.uniform1f(at("uScanlines"), clampUnit(p.scanlines));
        gl.uniform1f(at("uGlitch"), clampGlitch(p.glitch) * still);
        gl.uniform1f(at("uFlicker"), clampFlicker(p.flicker) * still);
        gl.uniform1f(at("uCurvature"), clampCurvature(p.curvature));
        gl.uniform2f(at("uPointer"), pt.current[0], pt.current[1]);
        gl.uniform1f(at("uPointerOn"), on);
        gl.uniform1f(at("uReveal"), p.reducedMotion ? 1 : 0);
      },
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColor(tint, colorRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="glyph-terminal"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="glyph-terminal-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(tint)}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="glyph-terminal-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="glyph-terminal-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

GlyphTerminal.displayName = "GlyphTerminal";

export { GlyphTerminal };
