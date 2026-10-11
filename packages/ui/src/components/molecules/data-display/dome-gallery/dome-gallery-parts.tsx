"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import type { DomeItem } from "./dome-gallery";
import { type DomeTilePlacement, tileTransform } from "./dome-gallery-utils";

const SPRING = { type: "spring", stiffness: 260, damping: 24 } as const;
const TILE_GAP = 4;

/** Mede a área com ResizeObserver; antes da primeira medida devolve 0x0. */
export function useElementSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function ItemFace({ item }: { item: DomeItem }) {
  if (item.content) return <div className="size-full">{item.content}</div>;
  return (
    <img
      src={item.image}
      alt={item.label}
      draggable={false}
      className="pointer-events-none size-full object-cover"
    />
  );
}

type TileProps = {
  placement: DomeTilePlacement;
  item: DomeItem;
  unit: number;
  radius: number;
  side: number;
  borderRadius: number;
  hidden: boolean;
  grayscale: boolean;
  open: boolean;
  onActivate: (item: DomeItem, trigger: HTMLElement) => void;
};

export function DomeTile(props: TileProps) {
  const { placement, item, unit, radius, side, borderRadius, hidden, grayscale, open } = props;
  const size = Math.max(1, side - TILE_GAP);
  return (
    <button
      type="button"
      data-slot="dome-gallery-tile"
      data-open={open}
      aria-label={item.label}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      onClick={(event) => props.onActivate(item, event.currentTarget)}
      className={cn(
        "absolute top-1/2 left-1/2 overflow-hidden border border-border bg-card p-0 outline-none",
        "transition-[filter] duration-300 focus-visible:ring-2 focus-visible:ring-ring",
        grayscale && "grayscale hover:grayscale-0 data-[open=true]:grayscale-0"
      )}
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius,
        transform: tileTransform(placement.col, placement.row, unit, radius),
      }}
    >
      <ItemFace item={item} />
    </button>
  );
}

export function DomeVignette() {
  return (
    <div
      data-slot="dome-gallery-vignette"
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
    >
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(transparent 60%, var(--background))" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-16"
        style={{ background: "linear-gradient(to bottom, var(--background), transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-16"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </div>
  );
}

type ViewerProps = {
  item: DomeItem;
  size: { width: string; height: string };
  reduced: boolean;
  onClose: () => void;
};

export function DomeViewer({ item, size, reduced, onClose }: ViewerProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      data-slot="dome-gallery-veil"
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-md"
      initial={{ opacity: reduced ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={item.label}
        data-slot="dome-gallery-viewer"
        className="relative max-h-full max-w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        style={{ width: size.width, height: size.height }}
        initial={reduced ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={reduced ? undefined : { scale: 0.8, opacity: 0 }}
        transition={reduced ? { duration: 0 } : SPRING}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          // Só há um controle focável; Tab não pode escapar para a galeria atrás do véu.
          if (event.key === "Tab") event.preventDefault();
        }}
      >
        <ItemFace item={item} />
        <button
          ref={closeRef}
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-background/80 text-foreground outline-none backdrop-blur-sm hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden style={{ width: 16, height: 16 }} />
        </button>
      </motion.div>
    </motion.div>
  );
}
