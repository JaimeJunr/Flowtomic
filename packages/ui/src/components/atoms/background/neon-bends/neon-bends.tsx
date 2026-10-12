"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { NEON_BENDS_FRAGMENT_SHADER } from "./neon-bends-shader";
import {
  assertColorTokens,
  clampBandWidth,
  clampFrequency,
  clampIntensity,
  clampScale,
  clampWarp,
  DEFAULT_NEON_COLORS,
  lerp,
  MAX_NEON_COLORS,
  pointerToUnit,
  rotationRadians,
} from "./neon-bends-utils";

export type NeonBendsProps = React.ComponentProps<"div"> & {
  /** De 1 a 4 tokens de cor (variáveis CSS); cada faixa usa uma. */
  colors?: string[];
  /** Rotação fixa da cena, em graus. */
  rotation?: number;
  /** Giro automático, em graus por segundo. */
  spin?: number;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Zoom da cena, de 0,3 a 4. */
  scale?: number;
  /** Frequência das ondas, de 0,2 a 4. */
  frequency?: number;
  /** Quanto as faixas se dobram, de 0 a 3. */
  warp?: number;
  /** Fineza do núcleo de cada faixa, de 1 a 20 (maior = mais fina). */
  bandWidth?: number;
  /** Brilho geral, de 0 a 4. */
  intensity?: number;
  /** Se o mouse entorta as faixas e desloca a cena. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

// Preenche as 4 posições do vec3[4]; as que sobram ficam zeradas e o shader nem as lê.
function readColors(tokens: readonly string[], element?: Element): Float32Array {
  const out = new Float32Array(MAX_NEON_COLORS * 3);
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  tokens.forEach((token, i) => {
    const color = readThemeColor(token, element) ?? fallback;
    out.set([color.r, color.g, color.b], i * 3);
  });
  return out;
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  tokensKey: string,
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    const tokens = tokensKey.split(",");
    const reread = () => {
      ref.current = readColors(tokens, canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [tokensKey, ref, canvasRef, redraw]);
}

type PointerState = {
  target: [number, number];
  current: [number, number];
  strength: number;
  inside: boolean;
};

// Só mouse e caneta: toque não tem "passar por cima". Ao sair, o efeito se dissolve.
function usePointerTarget(root: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const state = React.useRef<PointerState>({
    target: [0.5, 0.5],
    current: [0.5, 0.5],
    strength: 0,
    inside: false,
  });
  React.useEffect(() => {
    const element = root.current;
    state.current.inside = false;
    if (!element || !enabled) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const pt = state.current;
      pt.target = pointerToUnit(event.clientX, event.clientY, element.getBoundingClientRect());
      if (!pt.inside) pt.current = pt.target;
      pt.inside = true;
    };
    const onLeave = () => {
      state.current.inside = false;
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      state.current.inside = false;
    };
  }, [root, enabled]);
  return state;
}

function fallbackStyle(token: string): React.CSSProperties {
  return {
    background: `radial-gradient(ellipse 80% 30% at 50% 60%, color-mix(in oklch, var(${token}) 35%, transparent), transparent 70%)`,
  };
}

type Params = {
  count: number;
  rotation: number;
  spin: number;
  speed: number;
  scale: number;
  frequency: number;
  warp: number;
  bandWidth: number;
  intensity: number;
};

function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  p: Params,
  colors: Float32Array,
  pt: PointerState
): void {
  const at = (name: string) => gl.getUniformLocation(program, name);
  pt.current = [
    lerp(pt.current[0], pt.target[0], POINTER_EASE),
    lerp(pt.current[1], pt.target[1], POINTER_EASE),
  ];
  pt.strength = lerp(pt.strength, pt.inside ? 1 : 0, POINTER_EASE);
  gl.uniform3fv(at("uColors"), colors);
  gl.uniform1i(at("uCount"), p.count);
  gl.uniform1f(at("uRotation"), rotationRadians(p.rotation, 0, 0));
  gl.uniform1f(at("uSpin"), p.spin);
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform1f(at("uScale"), clampScale(p.scale));
  gl.uniform1f(at("uFrequency"), clampFrequency(p.frequency));
  gl.uniform1f(at("uWarp"), clampWarp(p.warp));
  gl.uniform1f(at("uBandWidth"), clampBandWidth(p.bandWidth));
  gl.uniform1f(at("uIntensity"), clampIntensity(p.intensity));
  gl.uniform1f(at("uPointerStrength"), pt.strength);
  gl.uniform2f(at("uPointer"), pt.current[0], pt.current[1]);
}

function NeonBends({
  colors = DEFAULT_NEON_COLORS,
  rotation = 90,
  spin = 0,
  speed = 0.2,
  scale = 1,
  frequency = 1,
  warp = 1,
  bandWidth = 6,
  intensity = 1.5,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: NeonBendsProps) {
  assertColorTokens(colors);
  const tokensKey = colors.join(",");
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorsRef = React.useRef<Float32Array>(new Float32Array(MAX_NEON_COLORS * 3));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef<Params>({} as Params);
  // Movimento reduzido: quadro estático, sem giro.
  params.current = {
    count: colors.length,
    rotation,
    spin: reducedMotion ? 0 : spin,
    speed,
    scale,
    frequency,
    warp,
    bandWidth,
    intensity,
  };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: NEON_BENDS_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) =>
        setUniforms(gl, program, params.current, colorsRef.current, pointerState.current),
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(tokensKey, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="neon-bends"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="neon-bends-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors[0])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="neon-bends-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="neon-bends-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

NeonBends.displayName = "NeonBends";

export { NeonBends };
