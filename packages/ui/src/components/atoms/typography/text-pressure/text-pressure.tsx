/**
 * TextPressure Component - Flowtomic UI
 *
 * Palavra que ocupa a largura do bloco. Cada letra engorda (ou alarga, ou inclina) conforme
 * a proximidade do ponteiro, como se ele "apertasse" o texto. Usa font-variation-settings,
 * então a fonte herdada precisa ser variável; eixos que ela não tem são ignorados.
 * Com movimento reduzido as letras ficam no meio da faixa, sem reagir ao ponteiro.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/text-pressure.md
 */

"use client";

import { useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type TextPressureProps = Omit<React.ComponentProps<"div">, "children"> & {
  text: string;
  /** Faixa de peso (eixo wght). A fonte precisa ser variável. */
  weightRange?: [number, number];
  /** Faixa de largura (eixo wdth). Só se a fonte tiver o eixo. */
  widthRange?: [number, number];
  /** Eixo ital/slnt: inclina perto do ponteiro. Só se a fonte tiver. */
  italic?: boolean;
  /** Opacidade cai com a distância. */
  alpha?: boolean;
  /** Contorno nas letras longe (cor do token da marca). */
  stroke?: boolean;
  /** Estica na vertical para preencher a altura do container. */
  scaleToHeight?: boolean;
  minFontSizePx?: number;
};

type PressureAxes = Pick<TextPressureProps, "widthRange" | "italic"> & {
  weightRange: [number, number];
};
type Point = { x: number; y: number };

const POINTER_LERP = 0.15;
const SLANT_MAX_DEG = 10;
const OUTLINE_THRESHOLD = 0.5;
const NBSP = " ";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mix = ([from, to]: [number, number], t: number) => from + (to - from) * t;

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

/** Intensidade de 0 a 1: 1 no ponteiro, 0 a meia largura do container ou mais longe. */
function pressureT(distance: number, containerWidth: number): number {
  if (containerWidth <= 0) return 0;
  return clamp(1 - distance / (containerWidth / 2), 0, 1);
}

function buildPressureSettings(axes: PressureAxes, t: number): string {
  const parts = [`"wght" ${mix(axes.weightRange, t)}`];
  if (axes.widthRange) parts.push(`"wdth" ${mix(axes.widthRange, t)}`);
  if (axes.italic) parts.push(`"ital" ${t}`, `"slnt" ${-SLANT_MAX_DEG * t}`);
  return parts.join(", ");
}

function pressureOpacity(t: number, alpha: boolean): number {
  return alpha ? 0.3 + 0.7 * t : 1;
}

/** Tamanho em que a palavra (largura `naturalWidth` a `fontSizePx`) preenche o container. */
function fitFontSizePx(input: {
  containerWidth: number;
  naturalWidth: number;
  fontSizePx: number;
  minPx: number;
}): number {
  const { containerWidth, naturalWidth, fontSizePx, minPx } = input;
  if (naturalWidth <= 0 || containerWidth <= 0) return fontSizePx;
  return Math.max(minPx, (fontSizePx * containerWidth) / naturalWidth);
}

function scaleYToHeight(containerHeight: number, contentHeight: number): number {
  return containerHeight > 0 && contentHeight > 0 ? containerHeight / contentHeight : 1;
}

function centerOf(rect: DOMRect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function TextPressure({
  text,
  weightRange = [200, 900],
  widthRange,
  italic = false,
  alpha = false,
  stroke = false,
  scaleToHeight = false,
  minFontSizePx = 24,
  className,
  ref,
  ...props
}: TextPressureProps) {
  const letters = [...text];
  if (letters.length === 0) {
    throw new Error(
      `TextPressure: invalid text, received ${JSON.stringify(text)}, expected text: string não vazio`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const charRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const isInView = useInView(rootRef);
  const reduceMotion = useShouldReduceMotion();
  const [fontSizePx, setFontSizePx] = React.useState(minFontSizePx);
  const [low, high] = weightRange;
  const [wdthLow, wdthHigh] = widthRange ?? [0, 0];
  const hasWidth = widthRange !== undefined;
  const axes = React.useMemo<PressureAxes>(
    () => ({
      weightRange: [low, high],
      widthRange: hasWidth ? [wdthLow, wdthHigh] : undefined,
      italic,
    }),
    [low, high, hasWidth, wdthLow, wdthHigh, italic]
  );

  // Ajuste: mede a palavra com todas as letras no peso máximo e escala até a largura do container.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `text` refaz a medição quando as letras mudam
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measureAndFit = () => {
      const chars = charRefs.current.filter((c): c is HTMLSpanElement => c !== null);
      const restore = chars.map((c) => c.style.fontVariationSettings);
      for (const char of chars) char.style.fontVariationSettings = buildPressureSettings(axes, 1);
      const naturalWidth = chars.reduce((sum, c) => sum + c.getBoundingClientRect().width, 0);
      chars.forEach((c, i) => {
        c.style.fontVariationSettings = restore[i];
      });
      const next = fitFontSizePx({
        containerWidth: root.getBoundingClientRect().width,
        naturalWidth,
        fontSizePx,
        minPx: minFontSizePx,
      });
      if (Math.abs(next - fontSizePx) > 0.5) setFontSizePx(next);
      const content = contentRef.current;
      if (scaleToHeight && content) {
        content.style.transform = `scaleY(${scaleYToHeight(root.clientHeight, content.offsetHeight)})`;
      }
    };
    measureAndFit();
    const observer = new ResizeObserver(measureAndFit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [text, axes, fontSizePx, minFontSizePx, scaleToHeight]);

  React.useEffect(() => {
    if (reduceMotion || !isInView) return;
    let target: Point | null = null;
    let smooth: Point | null = null;
    let frame = 0;

    const onMove = (event: Event) => {
      const { clientX, clientY } = event as PointerEvent;
      target = { x: clientX, y: clientY };
    };
    const onLeave = () => {
      target = null;
    };

    const tick = () => {
      const root = rootRef.current;
      if (root) {
        const rootRect = root.getBoundingClientRect();
        const goal = target ?? centerOf(rootRect);
        smooth = smooth
          ? { x: lerp(smooth.x, goal.x, POINTER_LERP), y: lerp(smooth.y, goal.y, POINTER_LERP) }
          : goal;
        for (const char of charRefs.current) {
          if (!char) continue;
          const center = centerOf(char.getBoundingClientRect());
          const t = pressureT(Math.hypot(smooth.x - center.x, smooth.y - center.y), rootRect.width);
          char.style.fontVariationSettings = buildPressureSettings(axes, t);
          char.style.opacity = String(pressureOpacity(t, alpha));
          if (stroke) char.dataset.outlined = String(t < OUTLINE_THRESHOLD);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, isInView, axes, alpha, stroke]);

  const restingSettings = buildPressureSettings(axes, reduceMotion ? 0.5 : 0);
  const restingOpacity = pressureOpacity(reduceMotion ? 0.5 : 0, alpha);

  return (
    <div
      ref={rootRef}
      data-slot="text-pressure"
      className={cn("relative w-full", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <div
        ref={contentRef}
        aria-hidden="true"
        className="flex origin-top select-none justify-between leading-none"
        style={{ fontSize: `${fontSizePx}px` }}
      >
        {letters.map((letter, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: letras são posições fixas do texto
            key={index}
            ref={(node) => {
              charRefs.current[index] = node;
            }}
            data-slot="text-pressure-char"
            data-index={index}
            className="inline-block data-[outlined=true]:text-transparent data-[outlined=true]:[-webkit-text-stroke:1px_var(--primary)]"
            style={{ fontVariationSettings: restingSettings, opacity: restingOpacity }}
          >
            {letter === " " ? NBSP : letter}
          </span>
        ))}
      </div>
    </div>
  );
}

TextPressure.displayName = "TextPressure";

export type { TextPressureProps };
export {
  buildPressureSettings,
  fitFontSizePx,
  lerp,
  pressureOpacity,
  pressureT,
  scaleYToHeight,
  TextPressure,
};
