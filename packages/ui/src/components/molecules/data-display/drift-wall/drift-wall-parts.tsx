"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { DriftWallItem } from "./drift-wall";

const TILE_CLASS =
  "group relative block flex-none overflow-hidden rounded-xl border border-border bg-card " +
  "transition-transform duration-250 ease-out [transform:translateZ(0)] " +
  "hover:[transform:translateZ(var(--drift-lift))]";

export type DriftTileProps = {
  item: DriftWallItem;
  width: number;
  height: number;
  dim: number;
  grayscale: boolean;
  /** Cópia do laço ou item repetido: fica fora da árvore de acessibilidade. */
  decorative: boolean;
};

function TileBody({ item, grayscale }: Pick<DriftTileProps, "item" | "grayscale">) {
  const tone = grayscale
    ? "grayscale transition-[filter] duration-250 group-hover:grayscale-0"
    : "";
  if (item.image) {
    return <img src={item.image} alt={item.label} className={cn("size-full object-cover", tone)} />;
  }
  if (item.content) return <div className={cn("size-full", tone)}>{item.content}</div>;
  return (
    <div className={cn("flex size-full items-end p-3 text-sm font-medium text-foreground", tone)}>
      {item.label}
    </div>
  );
}

function linkProps(item: DriftWallItem, decorative: boolean) {
  if (decorative) return { "aria-hidden": true, tabIndex: -1 } as const;
  return { "aria-label": item.label } as const;
}

export function DriftTile({ item, width, height, dim, grayscale, decorative }: DriftTileProps) {
  const style = { width, height } satisfies React.CSSProperties;
  const veil = (
    <span
      data-slot="drift-wall-veil"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-background transition-opacity duration-250 group-hover:opacity-0"
      style={{ opacity: 1 - dim }}
    />
  );
  const body = <TileBody item={item} grayscale={grayscale} />;
  if (item.href) {
    return (
      <a
        data-slot="drift-wall-tile"
        href={item.href}
        {...linkProps(item, decorative)}
        className={TILE_CLASS}
        style={style}
      >
        {body}
        {veil}
      </a>
    );
  }
  return (
    <div data-slot="drift-wall-tile" className={TILE_CLASS} style={style}>
      {body}
      {veil}
    </div>
  );
}

/** Mede a altura da raiz para saber quantas linhas a coluna precisa. */
export function useElementHeight(ref: React.RefObject<HTMLElement | null>): number {
  const [height, setHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return height;
}
