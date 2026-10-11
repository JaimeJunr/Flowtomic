"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";
import { type HelixSlot, slotStyle } from "./helix-gallery-utils";

export type HelixItem = {
  id: string;
  label: string;
  image?: string;
  content?: React.ReactNode;
  href?: string;
};

type HelixCardProps = {
  item: HelixItem;
  index: number;
  /** Cópia de slot: fica fora da árvore acessível e sem foco. */
  duplicate: boolean;
  slot: HelixSlot;
  cardTilt: number;
  width: number;
  height: number;
  fit: "cover" | "contain";
  register: (index: number, element: HTMLElement | null) => void;
};

function CardBody({ item, duplicate, fit }: Pick<HelixCardProps, "item" | "duplicate" | "fit">) {
  if (item.content) return <>{item.content}</>;
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={duplicate ? "" : item.label}
        draggable={false}
        className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
      />
    );
  }
  return <span className="p-2 text-center text-foreground text-sm">{item.label}</span>;
}

function HelixCard({
  item,
  index,
  duplicate,
  slot,
  cardTilt,
  width,
  height,
  fit,
  register,
}: HelixCardProps) {
  const style = {
    ...slotStyle(slot, cardTilt),
    width,
    height,
    left: -width / 2,
    top: -height / 2,
    "--r": "10px",
  } as React.CSSProperties;
  const className =
    "absolute flex items-center justify-center overflow-hidden rounded-[var(--r)] border border-border bg-card will-change-transform";
  const Tag = (item.href && !duplicate ? "a" : "div") as React.ElementType;
  return (
    <Tag
      data-slot="helix-gallery-card"
      data-slot-index={index}
      ref={(node: HTMLElement | null) => register(index, node)}
      style={style}
      className={className}
      aria-hidden={duplicate ? true : undefined}
      {...(item.href && !duplicate
        ? { href: item.href, "aria-label": item.label, draggable: false }
        : null)}
    >
      <CardBody item={item} duplicate={duplicate} fit={fit} />
    </Tag>
  );
}

export { HelixCard };
