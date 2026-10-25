"use client";

import * as React from "react";
import { type RgbColor, readThemeColor } from "@/lib/read-theme-color";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useWebglCanvas } from "@/lib/webgl";
import { IRIDESCENT_FOIL_FRAGMENT_SHADER } from "./iridescent-foil-shader";
import {
  assertTintToken,
  clampDetail,
  clampUnit,
  isDarkBackground,
  lerp,
} from "./iridescent-foil-utils";

export type IridescentFoilProps = React.ComponentProps<"div"> & {
  /** Token de cor (variável CSS) multiplicado sobre o arco-íris; sem valor, não tinge. */
  tint?: string;
  /** Multiplica o tempo; 0 congela. */
  speed?: number;
  /** Tamanho das dobras. */
  scale?: number;
  /** Camadas de distorção, inteiro de 2 a 8. */
  detail?: number;
  /** Saturação do arco-íris, de 0 a 1. */
  saturation?: number;
  /** O mouse empurra o padrão e clareia a região próxima. */
  pointer?: boolean;
};

const THEME_ATTRIBUTES = ["class", "style", "data-theme"];
const WHITE: RgbColor = { r: 1, g: 1, b: 1, a: 1 };
const FOLLOW = 0.08;

type ThemeState = { tint: [number, number, number]; dark: number };

function readTheme(tint: string | undefined, element?: Element): ThemeState {
  const base = readThemeColor("--background", element);
  const color = tint
    ? (readThemeColor(tint, element) ?? readThemeColor("--foreground", element) ?? WHITE)
    : WHITE;
  return { tint: [color.r, color.g, color.b], dark: isDarkBackground(base) ? 1 : 0 };
}

// Relê tint e luminância do fundo ao montar e quando o tema muda no <html>.
function useThemeState(
  tint: string | undefined,
  ref: React.RefObject<ThemeState>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void
): void {
  React.useLayoutEffect(() => {
    ref.current = readTheme(tint, canvasRef.current ?? undefined);
    redraw();
    const observer = new MutationObserver(() => {
      ref.current = readTheme(tint, canvasRef.current ?? undefined);
      redraw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: THEME_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [tint, ref, canvasRef, redraw]);
}

type PointerState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
  s: number;
};

// Só mouse e caneta: toque não tem "passar por cima". A suavização fica no JS, por quadro.
function usePointerTracking(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean
): React.RefObject<PointerState> {
  const state = React.useRef<PointerState>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    active: false,
    s: 0,
  });
  React.useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      state.current.targetX = clampUnit((event.clientX - rect.left) / rect.width);
      // O eixo y do GLSL cresce para cima.
      state.current.targetY = 1 - clampUnit((event.clientY - rect.top) / rect.height);
      state.current.active = true;
    };
    const onLeave = () => {
      state.current.active = false;
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      state.current.active = false;
    };
  }, [rootRef, enabled]);
  return state;
}

function stepPointer(p: PointerState): void {
  p.x = lerp(p.x, p.targetX, FOLLOW);
  p.y = lerp(p.y, p.targetY, FOLLOW);
  p.s = lerp(p.s, p.active ? 1 : 0, FOLLOW);
}

const FALLBACK_STYLE: React.CSSProperties = {
  background: [
    "conic-gradient(from 0deg at 50% 50%,",
    "color-mix(in oklab, var(--info) 70%, var(--background)),",
    "color-mix(in oklab, var(--primary) 70%, var(--background)),",
    "color-mix(in oklab, var(--success) 70%, var(--background)),",
    "color-mix(in oklab, var(--info) 70%, var(--background)))",
  ].join(" "),
  filter: "blur(40px)",
};

function useMergedRef(
  inner: React.RefObject<HTMLDivElement | null>,
  outer: React.Ref<HTMLDivElement> | undefined
) {
  return React.useCallback(
    (node: HTMLDivElement | null) => {
      inner.current = node;
      if (typeof outer === "function") outer(node);
      else if (outer) (outer as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [inner, outer]
  );
}

function IridescentFoil({
  tint,
  speed = 1,
  scale = 1,
  detail = 5,
  saturation = 0.6,
  pointer = true,
  className,
  children,
  ref,
  ...props
}: IridescentFoilProps) {
  assertTintToken(tint);
  const reducedMotion = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(rootRef, ref);
  const theme = React.useRef<ThemeState>({ tint: [1, 1, 1], dark: 0 });
  const pointerState = usePointerTracking(rootRef, pointer && !reducedMotion);
  const params = React.useRef({ speed, scale, detail, saturation });
  params.current = { speed, scale, detail, saturation };

  const paused = speed === 0;
  const options = React.useMemo(
    () => ({
      fragmentShader: IRIDESCENT_FOIL_FRAGMENT_SHADER,
      paused,
      uniforms: (gl: WebGL2RenderingContext, program: WebGLProgram) => {
        const p = params.current;
        const u = (name: string) => gl.getUniformLocation(program, name);
        stepPointer(pointerState.current);
        gl.uniform3fv(u("uTint"), theme.current.tint);
        gl.uniform1f(u("uDark"), theme.current.dark);
        gl.uniform1f(u("uSpeed"), p.speed);
        gl.uniform1f(u("uScale"), Math.max(0.05, p.scale));
        gl.uniform1f(u("uDetail"), clampDetail(p.detail));
        gl.uniform1f(u("uSaturation"), clampUnit(p.saturation));
        gl.uniform2f(u("uPointer"), pointerState.current.x, pointerState.current.y);
        gl.uniform1f(u("uPointerStrength"), pointerState.current.s);
      },
    }),
    [paused, pointerState]
  );
  const { canvasRef, isSupported, redraw } = useWebglCanvas(options);
  useThemeState(tint, theme, canvasRef, redraw);

  return (
    <div
      ref={setRef}
      data-slot="iridescent-foil"
      data-webgl={isSupported ? "on" : "off"}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {isSupported ? null : (
        <div
          data-slot="iridescent-foil-fallback"
          aria-hidden="true"
          className="absolute inset-0"
          style={FALLBACK_STYLE}
        />
      )}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: canvas decorativo, não recebe foco. */}
      <canvas
        ref={canvasRef}
        data-slot="iridescent-foil-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full"
      />
      <div data-slot="iridescent-foil-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

IridescentFoil.displayName = "IridescentFoil";

export { IridescentFoil };
