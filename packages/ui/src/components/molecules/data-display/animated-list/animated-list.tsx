"use client";

import { motion } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { edgeFade, moveIndex, scrollItemIntoView } from "./animated-list-utils";

type AnimatedListProps<T> = Omit<React.ComponentProps<"div">, "onSelect" | "children"> & {
  items: T[];
  /** Conteúdo de cada item. Padrão: String(item). */
  renderItem?: (item: T, index: number, selected: boolean) => React.ReactNode;
  /** Chave estável. Padrão: o índice. */
  getKey?: (item: T, index: number) => React.Key;
  onItemSelect?: (item: T, index: number) => void;
  /** Controlado. */
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  showScrollbar?: boolean;
  itemClassName?: string;
  /** Rótulo da lista para leitor de tela. */
  "aria-label": string;
};

const FADE_BASE = "pointer-events-none absolute inset-x-0 z-10 h-12";

function AnimatedList<T>({
  items,
  renderItem,
  getKey,
  onItemSelect,
  selectedIndex,
  defaultSelectedIndex = -1,
  showGradients = true,
  enableArrowNavigation = true,
  showScrollbar = true,
  itemClassName,
  className,
  "aria-label": ariaLabel,
  ref,
  ...props
}: AnimatedListProps<T> & { ref?: React.Ref<HTMLDivElement> }) {
  const reduceMotion = useShouldReduceMotion();
  const baseId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [innerIndex, setInnerIndex] = React.useState(defaultSelectedIndex);
  const [fade, setFade] = React.useState({ top: 0, bottom: 1 });
  const current = selectedIndex ?? innerIndex;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const updateFade = React.useCallback(() => {
    const el = listRef.current;
    if (el) setFade(edgeFade(el.scrollTop, el.scrollHeight, el.clientHeight));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refaz a medição quando a quantidade de itens muda
  React.useEffect(() => {
    updateFade();
  }, [updateFade, items.length]);

  const select = (index: number) => {
    setInnerIndex(index);
    onItemSelect?.(items[index], index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableArrowNavigation) return;
    if ((event.key === "Enter" || event.key === " ") && current >= 0 && current < items.length) {
      event.preventDefault();
      onItemSelect?.(items[current], current);
      return;
    }
    const next = moveIndex(current, event.key, items.length);
    if (next === null) return;
    event.preventDefault();
    setInnerIndex(next);
    onItemSelect?.(items[next], next);
    scrollItemIntoView(document.getElementById(optionId(next)), reduceMotion);
  };

  return (
    <div ref={ref} data-slot="animated-list" className={cn("relative", className)} {...props}>
      <div
        ref={listRef}
        data-slot="animated-list-viewport"
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={current >= 0 ? optionId(current) : undefined}
        tabIndex={0}
        onScroll={updateFade}
        onKeyDown={handleKeyDown}
        className={cn(
          "max-h-96 overflow-y-auto rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
          showScrollbar
            ? "[scrollbar-width:thin]"
            : "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((item, index) => {
          const selected = index === current;
          return (
            <motion.div
              key={getKey ? getKey(item, index) : index}
              id={optionId(index)}
              role="option"
              aria-selected={selected}
              data-slot="animated-list-item"
              data-selected={selected}
              initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
              whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
              viewport={{ root: listRef, amount: 0.5 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              onClick={() => select(index)}
              className={cn(
                "mb-2 cursor-pointer rounded-md border bg-card px-4 py-3 text-sm hover:bg-muted",
                selected && "border-primary bg-accent text-accent-foreground hover:bg-accent",
                itemClassName
              )}
            >
              {renderItem ? renderItem(item, index, selected) : String(item)}
            </motion.div>
          );
        })}
      </div>
      {showGradients && (
        <>
          <div
            data-slot="animated-list-fade-top"
            aria-hidden="true"
            className={cn(FADE_BASE, "top-0 bg-gradient-to-b from-background to-transparent")}
            style={{ opacity: fade.top }}
          />
          <div
            data-slot="animated-list-fade-bottom"
            aria-hidden="true"
            className={cn(FADE_BASE, "bottom-0 bg-gradient-to-t from-background to-transparent")}
            style={{ opacity: fade.bottom }}
          />
        </>
      )}
    </div>
  );
}

AnimatedList.displayName = "AnimatedList";

export type { AnimatedListProps };
export { AnimatedList };
