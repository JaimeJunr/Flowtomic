"use client";

import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  ellipsePoint,
  itemFraction,
  type OrbitDirection,
  type OrbitPathOptions,
  type OrbitShape,
  orbitPath,
  type Point,
  rotatePoint,
  rotationTransform,
  shapeRadii,
} from "./orbit-images-utils";

export type OrbitImagesProps = React.ComponentProps<"div"> & {
  /** Itens que orbitam: imagem com alt, icone, avatar. */
  items: React.ReactNode[];
  shape?: OrbitShape;
  /** Caminho proprio no viewBox 0..100; vence `shape`. */
  customPath?: string;
  /** Raios da elipse, em % da largura e da altura da area. */
  radiusX?: number;
  radiusY?: number;
  /** Raio das demais formas, em % do menor lado da area. */
  radius?: number;
  starPoints?: number;
  starInnerRatio?: number;
  /** Inclinacao do caminho, em graus. */
  rotation?: number;
  /** Segundos por volta. */
  duration?: number;
  direction?: OrbitDirection;
  /** Lado de cada item, em px. */
  itemSize?: number;
  showPath?: boolean;
  paused?: boolean;
  /** Conteudo fixo no centro. */
  centerContent?: React.ReactNode;
};

type Sampler = (fraction: number) => Point;

const pct = (n: number): string => `${Number(n.toFixed(3))}%`;

/** Mede o <path> real; sem medicao (jsdom), cai na elipse analitica. */
function makeSampler(
  path: SVGPathElement | null,
  rotation: number,
  aspect: number,
  fallback: Sampler
): Sampler {
  if (!path || typeof path.getTotalLength !== "function") {
    return (f) => rotatePoint(...fallback(f), rotation, aspect);
  }
  const length = path.getTotalLength();
  return (f) => {
    const { x, y } = path.getPointAtLength(f * length);
    return rotatePoint(x, y, rotation, aspect);
  };
}

const DEFAULT_ASPECT = 16 / 9;

/** Proporcao largura/altura da area; antes da medicao assume a do aspect-ratio padrao. */
function useAspect(target: React.RefObject<HTMLDivElement | null>): number {
  const [aspect, setAspect] = React.useState(DEFAULT_ASPECT);
  React.useLayoutEffect(() => {
    const el = target.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setAspect(width / height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return aspect;
}

export function OrbitImages({
  items,
  shape = "ellipse",
  customPath,
  radiusX = 42,
  radiusY = 14,
  radius = 40,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  direction = "normal",
  itemSize = 56,
  showPath = false,
  paused = false,
  centerContent,
  className,
  style,
  ref,
  ...props
}: OrbitImagesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const aspect = useAspect(rootRef);
  const options: OrbitPathOptions = {
    radiusX,
    radiusY,
    radius,
    starPoints,
    starInnerRatio,
    aspect,
  };
  const d = customPath ?? orbitPath(shape, options);
  const reduced = useShouldReduceMotion();
  const [focusWithin, setFocusWithin] = React.useState(false);
  const pathRef = React.useRef<SVGPathElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const phaseRef = React.useRef(0);
  const lastRef = React.useRef<number | null>(null);
  const count = items.length;
  const active = !paused && !reduced && !focusWithin && count > 0;

  const fallback: Sampler =
    shape === "ellipse" && !customPath
      ? (f) => ellipsePoint(f, radiusX, radiusY)
      : (f) => ellipsePoint(f, ...shapeRadii(radius, aspect));

  const place = (sample: Sampler) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const [x, y] = sample(itemFraction(phaseRef.current, i, count, direction));
      el.style.left = pct(x);
      el.style.top = pct(y);
    });
  };

  // Sem deps: re-posiciona a cada render para nao perder o que o loop escreveu.
  React.useLayoutEffect(() => {
    place(makeSampler(pathRef.current, rotation, aspect, fallback));
  });

  // Ao parar, zera o relogio: retomar nao pode saltar o tempo da pausa.
  React.useEffect(() => {
    if (!active) return;
    return () => {
      lastRef.current = null;
    };
  }, [active]);

  useFrameLoop((now) => {
    const last = lastRef.current;
    lastRef.current = now;
    if (last === null) return;
    phaseRef.current = (phaseRef.current + (now - last) / (duration * 1000)) % 1;
    place(makeSampler(pathRef.current, rotation, aspect, fallback));
  }, active);

  const initial = makeSampler(null, rotation, aspect, fallback);

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset traria estilo de formulario; a area e so um agrupamento
    <div
      ref={(el) => {
        rootRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-slot="orbit-images"
      data-shape={shape}
      role="group"
      className={cn("relative w-full", className)}
      style={{ aspectRatio: "16 / 9", ...style }}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <path
          ref={pathRef}
          data-slot="orbit-images-path"
          d={d}
          fill="none"
          stroke={showPath ? "var(--border)" : "none"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          transform={rotationTransform(rotation, aspect)}
        />
      </svg>
      {centerContent ? (
        <div data-slot="orbit-images-center" className="absolute inset-0 grid place-items-center">
          {centerContent}
        </div>
      ) : null}
      <ul
        className="pointer-events-none absolute inset-0 m-0 list-none p-0"
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
        }}
      >
        {items.map((item, i) => {
          const [x, y] = initial(itemFraction(0, i, count, direction));
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem dos itens define a posicao na orbita
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              data-slot="orbit-images-item"
              className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: pct(x), top: pct(y), width: itemSize, height: itemSize }}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
OrbitImages.displayName = "OrbitImages";
