"use client";

import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { type ExpandPanelItem, type Orientation, Panel } from "./expand-panels-parts";
import { assertExpandPanelsConfig, openPanelSize, panelBasis } from "./expand-panels-utils";

export type { ExpandPanelItem };

export type ExpandPanelsProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: ExpandPanelItem[];
  defaultIndex?: number;
  value?: number;
  onChange?: (index: number) => void;
  trigger?: "hover" | "click";
  orientation?: Orientation;
  size?: number;
  gap?: number;
  expandRatio?: number;
  tilt?: number;
  parallax?: number;
  showLabels?: boolean;
  grayscale?: boolean;
};

const PREV_KEYS: Record<Orientation, string> = { horizontal: "ArrowLeft", vertical: "ArrowUp" };
const NEXT_KEYS: Record<Orientation, string> = { horizontal: "ArrowRight", vertical: "ArrowDown" };

// Mede o eixo principal da fileira para o conteúdo interno ter a largura do painel aberto.
function useMainAxisLength(orientation: Orientation) {
  const [length, setLength] = React.useState(0);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!node) return;
    const read = () => {
      const rect = node.getBoundingClientRect();
      setLength(orientation === "vertical" ? rect.height : rect.width);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, orientation]);
  return { length, setNode };
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

function ExpandPanels({
  items,
  defaultIndex = 0,
  value,
  onChange,
  trigger = "hover",
  orientation = "horizontal",
  size = 460,
  gap = 10,
  expandRatio = 0.52,
  tilt = 8,
  parallax = 0.5,
  showLabels = true,
  grayscale = true,
  className,
  style,
  ref,
  "aria-label": ariaLabel = "Painéis expansíveis",
  ...props
}: ExpandPanelsProps) {
  const count = items.length;
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultIndex);
  const active = controlled ? value : inner;
  assertExpandPanelsConfig({ count, index: active, expandRatio });
  if (!controlled) assertExpandPanelsConfig({ count, index: defaultIndex, expandRatio });

  const reduced = useShouldReduceMotion();
  const vertical = orientation === "vertical";
  const { length, setNode } = useMainAxisLength(orientation);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const basis = panelBasis(count, active, expandRatio);
  const openSize = openPanelSize(length, gap, count, expandRatio);

  const activate = (index: number) => {
    if (index === active) return;
    if (!controlled) setInner(index);
    onChange?.(index);
  };

  const moveFocus = (from: number, event: React.KeyboardEvent) => {
    const step =
      event.key === NEXT_KEYS[orientation] ? 1 : event.key === PREV_KEYS[orientation] ? -1 : 0;
    if (step === 0) return;
    const target = from + step;
    if (target < 0 || target >= count) return;
    event.preventDefault();
    const nodes = rootRef.current?.querySelectorAll<HTMLElement>(
      '[data-slot="expand-panels-item"]'
    );
    nodes?.[target]?.focus();
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset traria semântica de formulário e estilo próprio
    <div
      data-slot="expand-panels"
      role="group"
      aria-label={ariaLabel}
      ref={(node) => {
        rootRef.current = node;
        setNode(node);
        assignRef(ref, node);
      }}
      className={cn("flex w-full", vertical ? "flex-col" : "flex-row", className)}
      style={{
        gap,
        perspective: 1200,
        [vertical ? "width" : "height"]: size,
        ...style,
      }}
      {...props}
    >
      {items.map((item, index) => (
        <Panel
          key={item.id}
          item={item}
          index={index}
          active={active}
          basis={basis[index]}
          orientation={orientation}
          tilt={tilt}
          parallax={parallax}
          showLabels={showLabels}
          grayscale={grayscale}
          reduced={reduced}
          openSize={openSize}
          onPointerEnter={(event) => {
            if (trigger === "hover" && event.pointerType !== "touch") activate(index);
          }}
          onPointerDown={(event) => {
            if (event.pointerType === "touch") activate(index);
          }}
          onFocus={() => activate(index)}
          onClick={() => trigger === "click" && activate(index)}
          onKeyDown={(event) => moveFocus(index, event)}
        />
      ))}
    </div>
  );
}
ExpandPanels.displayName = "ExpandPanels";

export { ExpandPanels };
