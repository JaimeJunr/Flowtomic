/**
 * GlassSurface Component - Flowtomic UI
 *
 * Superfície de vidro: o fundo aparece desfocado e distorcido nas bordas, como lente grossa,
 * com leve arco-íris no contorno. Sem suporte a filtro SVG no backdrop vira vidro fosco simples.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/glass-surface.md
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  detectBackdropEnv,
  displacementMapSvg,
  mapDataUri,
  supportsSvgBackdrop,
} from "./glass-surface-utils";

export type GlassSurfaceProps = React.ComponentProps<"div"> & {
  /** Raio em px; deve bater com o arredondamento visual. */
  radius?: number;
  /** Espessura da borda que distorce, fração do menor lado (0..0.5). */
  edge?: number;
  /** Força da distorção em px. Negativo puxa para dentro. */
  distortion?: number;
  /** Separação entre canais para o arco-íris, em px. */
  chroma?: number;
  /** Desfoque do fundo em px. */
  blur?: number;
  /** Opacidade do véu de cor por cima (token --background), de 0 a 1. */
  frost?: number;
  saturation?: number;
};

const CHANNEL_ONLY = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
] as const;

type FilterProps = {
  id: string;
  mapUri: string;
  width: number;
  height: number;
  distortion: number;
  chroma: number;
};

function GlassFilter({ id, mapUri, width, height, distortion, chroma }: FilterProps) {
  return (
    <svg
      data-slot="glass-surface-filter"
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feImage
          href={mapUri}
          x="0"
          y="0"
          width={width}
          height={height}
          preserveAspectRatio="none"
          result="map"
        />
        {CHANNEL_ONLY.map((matrix, i) => (
          <React.Fragment key={matrix}>
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={distortion + i * chroma}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`d${i}`}
            />
            <feColorMatrix in={`d${i}`} type="matrix" values={matrix} result={`c${i}`} />
          </React.Fragment>
        ))}
        <feBlend in="c0" in2="c1" mode="screen" result="rg" />
        <feBlend in="rg" in2="c2" mode="screen" result="rgb" />
        <feGaussianBlur in="rgb" stdDeviation="0.7" />
      </filter>
    </svg>
  );
}

function useMeasuredSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = React.useState({ width: 300, height: 80 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { width, height } = el.getBoundingClientRect();
        if (width > 0 && height > 0)
          setSize({ width: Math.round(width), height: Math.round(height) });
      });
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ref]);
  return size;
}

function GlassSurface({
  radius = 20,
  edge = 0.07,
  distortion = -180,
  chroma = 10,
  blur = 11,
  frost = 0,
  saturation = 1,
  className,
  style,
  children,
  ref,
  ...props
}: GlassSurfaceProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const filterId = `glass-${React.useId().replace(/:/g, "")}`;
  const [svgMode, setSvgMode] = React.useState(false);
  React.useEffect(() => setSvgMode(supportsSvgBackdrop(detectBackdropEnv())), []);
  const { width, height } = useMeasuredSize(innerRef);
  const mapUri = React.useMemo(
    () => mapDataUri(displacementMapSvg(width, height, radius, edge)),
    [width, height, radius, edge]
  );
  const tail = `blur(${blur}px) saturate(${saturation})`;
  const backdropFilter = svgMode ? `url(#${filterId}) ${tail}` : tail;
  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      data-slot="glass-surface"
      data-mode={svgMode ? "svg" : "fallback"}
      ref={setRefs}
      className={cn(
        "relative isolate overflow-hidden",
        !svgMode && "border border-border/50 bg-background/40 shadow-inner",
        className
      )}
      style={{
        borderRadius: radius,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        ...style,
      }}
      {...props}
    >
      <GlassFilter
        id={filterId}
        mapUri={mapUri}
        width={width}
        height={height}
        distortion={distortion}
        chroma={chroma}
      />
      <div
        data-slot="glass-surface-frost"
        className="pointer-events-none absolute inset-0 bg-background"
        style={{ opacity: frost }}
      />
      <div data-slot="glass-surface-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
}

GlassSurface.displayName = "GlassSurface";

export { GlassSurface };
