"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { ELEVATION_MAP_FRAGMENT_SHADER } from "./elevation-map-shader";
import {
  assertColorTokens,
  clampBands,
  clampGlow,
  clampMorph,
  clampScale,
  clampThickness,
  DEFAULT_ELEVATION_COLORS,
  type ElevationColors,
  lerp,
  pointerToUnit,
} from "./elevation-map-utils";

export type ElevationMapProps = React.ComponentProps<"div"> & {
  /** Três tokens de cor (variáveis CSS): vales, meio e cristas. */
  colors?: ElevationColors;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Quanto o terreno muda ao longo do tempo, de 0 a 5. */
  morph?: number;
  /** Densidade das curvas de nível, de 0,5 a 8. */
  bands?: number;
  /** Espessura das curvas, de 0,002 a 0,05. */
  thickness?: number;
  /** Zoom do mapa, de 0,3 a 4. */
  scale?: number;
  /** Intensidade do brilho em volta das curvas, de 0 a 2. */
  glow?: number;
  /** Tinge o espaço entre as curvas. */
  fill?: boolean;
  /** Se o mouse levanta um morro sob o cursor. */
  pointer?: boolean;
};

const BLACK: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const POINTER_EASE = 0.12;

function readColors(colors: ElevationColors, element?: Element): Float32Array {
  const fallback = readThemeColor("--foreground", element) ?? BLACK;
  const values = colors.map((token) => readThemeColor(token, element) ?? fallback);
  return new Float32Array(values.flatMap((c) => [c.r, c.g, c.b]));
}

// Relê as cores ao montar, quando os tokens mudam e quando o tema muda no <html>.
function useThemeColors(
  colors: ElevationColors,
  ref: React.RefObject<Float32Array>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  const [low, mid, high] = colors;
  React.useLayoutEffect(() => {
    const reread = () => {
      ref.current = readColors([low, mid, high], canvasRef.current ?? undefined);
      redraw();
    };
    reread();
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [low, mid, high, ref, canvasRef, redraw]);
}

type PointerState = {
  target: [number, number];
  current: [number, number];
  strength: number;
  inside: boolean;
};

// Só mouse e caneta: toque não tem "passar por cima". Ao sair, o morro se dissolve.
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

// Sem WebGL: anéis concêntricos finos no tom do meio, lembrando curvas de nível.
function fallbackStyle(token: string): React.CSSProperties {
  return {
    background: `repeating-radial-gradient(ellipse at 30% 40%, transparent 0 18px, color-mix(in oklch, var(${token}) 35%, transparent) 18px 19px)`,
  };
}

type Params = {
  speed: number;
  morph: number;
  bands: number;
  thickness: number;
  scale: number;
  glow: number;
  fill: boolean;
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
  gl.uniform3f(at("uColor1"), colors[0], colors[1], colors[2]);
  gl.uniform3f(at("uColor2"), colors[3], colors[4], colors[5]);
  gl.uniform3f(at("uColor3"), colors[6], colors[7], colors[8]);
  gl.uniform1f(at("uSpeed"), p.speed);
  gl.uniform1f(at("uMorph"), clampMorph(p.morph));
  gl.uniform1f(at("uBands"), clampBands(p.bands));
  gl.uniform1f(at("uThickness"), clampThickness(p.thickness));
  gl.uniform1f(at("uScale"), clampScale(p.scale));
  gl.uniform1f(at("uGlow"), clampGlow(p.glow));
  gl.uniform1f(at("uFill"), p.fill ? 1 : 0);
  gl.uniform1f(at("uPointerStrength"), pt.strength);
  gl.uniform2f(at("uPointer"), pt.current[0], pt.current[1]);
}

function ElevationMap({
  colors = DEFAULT_ELEVATION_COLORS,
  speed = 0.35,
  morph = 3,
  bands = 2,
  thickness = 0.01,
  scale = 1,
  glow = 0.5,
  fill = false,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: ElevationMapProps) {
  assertColorTokens(colors);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const colorsRef = React.useRef<Float32Array>(new Float32Array(9));
  const reducedMotion = useShouldReduceMotion();
  const pointerState = usePointerTarget(rootRef, pointer && !reducedMotion);
  const params = React.useRef<Params>({ speed, morph, bands, thickness, scale, glow, fill });
  params.current = { speed, morph, bands, thickness, scale, glow, fill };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: ELEVATION_MAP_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) =>
        setUniforms(gl, program, params.current, colorsRef.current, pointerState.current),
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeColors(colors, colorsRef, canvasRef, redraw);

  return (
    <div
      ref={setRoot}
      data-slot="elevation-map"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="elevation-map-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={fallbackStyle(colors[1])}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="elevation-map-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="elevation-map-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

ElevationMap.displayName = "ElevationMap";

export { ElevationMap };
