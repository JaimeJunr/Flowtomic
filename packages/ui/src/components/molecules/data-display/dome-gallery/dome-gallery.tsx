"use client";

import { AnimatePresence } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useDomeDrag } from "./dome-gallery-drag";
import { DomeTile, DomeViewer, DomeVignette, useElementSize } from "./dome-gallery-parts";
import {
  assertDomeProps,
  type DomeFitBasis,
  domeRadius,
  domeTiles,
  tileSizePx,
} from "./dome-gallery-utils";

export type DomeItem = {
  id: string;
  label: string;
  image?: string;
  content?: React.ReactNode;
};

export type DomeGalleryProps = React.ComponentProps<"div"> & {
  items: DomeItem[];
  fit?: number;
  fitBasis?: DomeFitBasis;
  minRadius?: number;
  maxRadius?: number;
  segments?: number;
  maxVerticalRotation?: number;
  dragSensitivity?: number;
  dragDampening?: number;
  openedSize?: { width: string; height: string };
  tileRadius?: number;
  grayscale?: boolean;
  onOpenChange?: (item: DomeItem | null) => void;
};

type Opened = { item: DomeItem; trigger: HTMLElement | null };

const DEFAULT_OPENED = { width: "400px", height: "400px" };

function DomeGallery({
  items,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Number.POSITIVE_INFINITY,
  segments = 35,
  maxVerticalRotation = 5,
  dragSensitivity = 20,
  dragDampening = 2,
  openedSize = DEFAULT_OPENED,
  tileRadius = 30,
  grayscale = true,
  onOpenChange,
  className,
  ref,
  ...props
}: DomeGalleryProps) {
  assertDomeProps(items.length, segments, fit);
  const reduced = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const sphereRef = React.useRef<HTMLDivElement | null>(null);
  const [opened, setOpened] = React.useState<Opened | null>(null);
  const area = useElementSize(rootRef);

  const radius = domeRadius(area.width, area.height, fit, fitBasis, minRadius, maxRadius);
  const unit = 360 / segments;
  const tiles = React.useMemo(() => domeTiles(items.length, segments), [items.length, segments]);
  const side = tileSizePx(radius, segments);

  const { handlers, shouldIgnoreClick } = useDomeDrag({
    sphereRef,
    radius,
    unit,
    sensitivity: dragSensitivity,
    maxVertical: maxVerticalRotation,
    dampening: dragDampening,
    reduced,
    disabled: opened !== null,
  });

  const open = (item: DomeItem, trigger: HTMLElement) => {
    if (shouldIgnoreClick()) return;
    setOpened({ item, trigger });
    onOpenChange?.(item);
  };

  const close = React.useCallback(() => {
    opened?.trigger?.focus();
    setOpened(null);
    onOpenChange?.(null);
  }, [opened, onOpenChange]);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a raiz é um div para aceitar ComponentProps<"div">
    <div
      role="region"
      aria-roledescription="galeria"
      {...props}
      ref={setRefs}
      data-slot="dome-gallery"
      className={cn("relative select-none overflow-hidden", className)}
      style={{ touchAction: "none", ...props.style }}
      {...handlers}
    >
      <div className="absolute inset-0" style={{ perspective: radius * 1.25 }}>
        <div
          ref={sphereRef}
          data-slot="dome-gallery-sphere"
          className="absolute top-1/2 left-1/2 size-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {tiles.map((placement, index) => (
            <DomeTile
              key={`${placement.row}:${placement.col}`}
              placement={placement}
              item={items[placement.item]}
              unit={unit}
              radius={radius}
              side={side}
              borderRadius={tileRadius}
              hidden={index >= items.length}
              grayscale={grayscale}
              open={opened?.item.id === items[placement.item].id}
              onActivate={open}
            />
          ))}
        </div>
      </div>
      <DomeVignette />
      <AnimatePresence>
        {opened ? (
          <DomeViewer item={opened.item} size={openedSize} reduced={reduced} onClose={close} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

DomeGallery.displayName = "DomeGallery";

export { DomeGallery };
