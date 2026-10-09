/**
 * ScrollVelocity Component - Flowtomic UI
 *
 * Faixas de texto grande que correm na horizontal, cada uma num sentido. Ao rolar
 * a página, aceleram conforme a velocidade do scroll; rolando para cima, invertem;
 * ao parar, voltam suavemente à velocidade base. Pausam fora da tela e com a aba
 * escondida. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/scroll-velocity.md
 */

"use client";

import {
  type MotionValue,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
} from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type ScrollVelocityProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Uma faixa por item. */
  items: React.ReactNode[];
  /** Velocidade base, em px/s. Faixas de índice ímpar vão no sentido oposto. */
  baseVelocity?: number;
  /** Até quantas vezes a velocidade do scroll multiplica a base. */
  maxBoost?: number;
  /** Velocidade de scroll (px/s) que leva ao `maxBoost`. */
  boostAtScrollSpeed?: number;
  /** Container de scroll (default: a janela). */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Classe aplicada a cada cópia do item. */
  itemClassName?: string;
};

type Direction = 1 | -1;

const MIN_COPIES = 4;
const MAX_FRAME_MS = 64;
const SPRING = { damping: 50, stiffness: 400 };

/** Leva `value` para [min, max): o salto de uma cópia inteira é invisível. */
function wrap(min: number, max: number, value: number): number {
  if (!(max > min)) {
    throw new Error(
      `ScrollVelocity: invalid range, received min ${min}, max ${max}, expected max > min`
    );
  }
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/** Interpola [0, boostAt] para [0, maxBoost], saturando; o sinal do scroll não conta. */
function boostFactor(scrollSpeed: number, boostAtScrollSpeed: number, maxBoost: number): number {
  if (!(boostAtScrollSpeed > 0)) {
    throw new Error(
      `ScrollVelocity: invalid boostAtScrollSpeed, received ${boostAtScrollSpeed}, expected boostAtScrollSpeed > 0`
    );
  }
  return Math.min(Math.abs(scrollSpeed) / boostAtScrollSpeed, 1) * maxBoost;
}

/** Faixas pares vão para a esquerda (-1), ímpares para a direita (1). */
function rowDirection(index: number): Direction {
  return index % 2 === 0 ? -1 : 1;
}

/** Rolar para cima inverte; parado mantém o último sentido, para a faixa não "pular" ao frear. */
function scrollDirection(scrollVelocity: number, previous: Direction): Direction {
  if (scrollVelocity < 0) return -1;
  if (scrollVelocity > 0) return 1;
  return previous;
}

/** Cópias para cobrir 2x a largura medida da raiz (mais uma, do wrap), no mínimo MIN_COPIES. */
function copiesNeeded(rootWidth: number, copyWidth: number): number {
  if (!(copyWidth > 0) || !(rootWidth > 0)) return MIN_COPIES;
  return Math.max(MIN_COPIES, Math.ceil((2 * rootWidth) / copyWidth) + 1);
}

function useTabVisible(): boolean {
  const [visible, setVisible] = React.useState(() => document.visibilityState !== "hidden");
  React.useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return visible;
}

type RowProps = {
  item: React.ReactNode;
  index: number;
  moving: boolean;
  smoothVelocity: MotionValue<number>;
  baseVelocity: number;
  maxBoost: number;
  boostAtScrollSpeed: number;
  itemClassName?: string;
};

function ScrollVelocityRow({
  item,
  index,
  moving,
  smoothVelocity,
  baseVelocity,
  maxBoost,
  boostAtScrollSpeed,
  itemClassName,
}: RowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  const firstCopyRef = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const directionRef = React.useRef<Direction>(1);
  const [period, setPeriod] = React.useState(0);
  const [copies, setCopies] = React.useState(MIN_COPIES);

  React.useLayoutEffect(() => {
    const rowNode = rowRef.current;
    const copyNode = firstCopyRef.current;
    const measure = () => {
      const copyWidth = firstCopyRef.current?.getBoundingClientRect().width ?? 0;
      const rootWidth = rowRef.current?.getBoundingClientRect().width ?? 0;
      setPeriod(copyWidth);
      setCopies(copiesNeeded(rootWidth, copyWidth));
    };
    measure();
    if (typeof ResizeObserver === "undefined" || !rowNode) return;
    // A cópia também é observada: fonte web carregando muda a largura sem mudar a raiz.
    const observer = new ResizeObserver(measure);
    observer.observe(rowNode);
    if (copyNode) observer.observe(copyNode);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, frameMs) => {
    if (!moving || period <= 0) return;
    const scrollSpeed = smoothVelocity.get();
    directionRef.current = scrollDirection(scrollSpeed, directionRef.current);
    const speed = baseVelocity * (1 + boostFactor(scrollSpeed, boostAtScrollSpeed, maxBoost));
    const step = (speed * Math.min(frameMs, MAX_FRAME_MS)) / 1000;
    x.set(wrap(-period, 0, x.get() + rowDirection(index) * directionRef.current * step));
  });

  return (
    <div
      ref={rowRef}
      data-slot="scroll-velocity-row"
      className="flex overflow-hidden whitespace-nowrap"
    >
      <span className="sr-only">{item}</span>
      <motion.div aria-hidden="true" className="flex shrink-0" style={{ x }}>
        {Array.from({ length: copies }, (_, copyIndex) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: cópias são idênticas e de posição fixa
            key={copyIndex}
            ref={copyIndex === 0 ? firstCopyRef : undefined}
            data-slot="scroll-velocity-copy"
            className={cn("shrink-0 px-4", itemClassName)}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ScrollVelocity({
  items,
  baseVelocity = 40,
  maxBoost = 5,
  boostAtScrollSpeed = 1000,
  scrollContainerRef,
  itemClassName,
  className,
  ref,
  ...props
}: ScrollVelocityProps) {
  if (items.length === 0) {
    throw new Error(
      `ScrollVelocity: invalid items, received ${JSON.stringify(items)}, expected items: ReactNode[] com ao menos 1 item`
    );
  }

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  const isInView = useInView(rootRef);
  const tabVisible = useTabVisible();
  const reduceMotion = useShouldReduceMotion();
  const { scrollY } = useScroll({ container: scrollContainerRef });
  const smoothVelocity = useSpring(useVelocity(scrollY), SPRING);
  const moving = !reduceMotion && isInView && tabVisible;

  return (
    <div
      ref={rootRef}
      data-slot="scroll-velocity"
      data-moving={moving}
      className={cn("flex flex-col overflow-hidden", className)}
      {...props}
    >
      {items.map((item, index) => (
        <ScrollVelocityRow
          // biome-ignore lint/suspicious/noArrayIndexKey: faixas são posições fixas, o item é um nó arbitrário
          key={index}
          item={item}
          index={index}
          moving={moving}
          smoothVelocity={smoothVelocity}
          baseVelocity={baseVelocity}
          maxBoost={maxBoost}
          boostAtScrollSpeed={boostAtScrollSpeed}
          itemClassName={itemClassName}
        />
      ))}
    </div>
  );
}

ScrollVelocity.displayName = "ScrollVelocity";

export type { ScrollVelocityProps };
export { boostFactor, copiesNeeded, rowDirection, ScrollVelocity, scrollDirection, wrap };
