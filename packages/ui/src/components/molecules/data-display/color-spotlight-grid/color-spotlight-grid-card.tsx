"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";
import { spotMask } from "./color-spotlight-grid-utils";

export type SpotlightGridItem = {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  href?: string;
};

export type CardLook = {
  reveal: "spotlight" | "card";
  softness: number;
  grayscale: number;
  dim: number;
  aspectRatio: string;
  fadeOut: number;
  showInfo: boolean;
  reduced: boolean;
};

const RING_LAYER = "linear-gradient(black 0 0)";
const RING_MASK = {
  maskImage: `${RING_LAYER}, ${RING_LAYER}`,
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: `${RING_LAYER}, ${RING_LAYER}`,
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
} as const;

const GLOW =
  "linear-gradient(to top, color-mix(in oklch, var(--primary) 35%, transparent), transparent)";
const HOLE =
  "radial-gradient(circle var(--r) at var(--x) var(--y), var(--primary), transparent 100%)";
const ENTER_TRANSITION = "0.25s";

function fadeStyle(revealed: boolean, look: CardLook): React.CSSProperties {
  if (look.reduced) return { opacity: revealed ? 1 : 0 };
  const seconds = revealed ? ENTER_TRANSITION : `${look.fadeOut}s`;
  return { opacity: revealed ? 1 : 0, transition: `opacity ${seconds} ease-out` };
}

function colorLayerStyle(revealed: boolean, look: CardLook): React.CSSProperties {
  if (look.reveal === "card") return fadeStyle(revealed, look);
  if (revealed) return { opacity: 1 };
  const mask = spotMask(look.softness);
  return { maskImage: mask, WebkitMaskImage: mask };
}

function borderStyle(revealed: boolean, look: CardLook): React.CSSProperties {
  const base = { padding: "1px", ...RING_MASK };
  if (look.reveal === "card")
    return { ...base, background: "var(--primary)", ...fadeStyle(revealed, look) };
  return { ...base, background: revealed ? "var(--primary)" : HOLE };
}

function glowStyle(revealed: boolean, look: CardLook): React.CSSProperties {
  if (look.reveal === "card") return { background: GLOW, ...fadeStyle(revealed, look) };
  return { background: GLOW, opacity: revealed ? 1 : "var(--p)" };
}

type CardProps = {
  item: SpotlightGridItem;
  look: CardLook;
  revealed: boolean;
  onHover: (id: string | null) => void;
  onFocusChange: (id: string | null) => void;
};

export function SpotlightGridCard({ item, look, revealed, onHover, onFocusChange }: CardProps) {
  const { id, title, subtitle, content, href } = item;
  const Wrapper = href ? "a" : "div";
  const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    // biome-ignore lint/a11y/useSemanticElements: cartão é div filho direto da grade; o papel mantém a semântica
    <div
      role="listitem"
      data-slot="color-spotlight-grid-card"
      data-revealed={revealed ? "true" : undefined}
      tabIndex={href ? undefined : 0}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        !href && focusRing
      )}
      style={{ "--x": "0px", "--y": "0px", "--r": "0px", "--p": "0" } as React.CSSProperties}
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onFocusChange(id)}
      onBlur={() => onFocusChange(null)}
    >
      <Wrapper
        {...(href ? { href, title, "aria-label": title } : {})}
        className={cn("block", href && cn("rounded-[inherit]", focusRing))}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: look.aspectRatio }}>
          <div
            data-slot="color-spotlight-grid-base"
            className="size-full"
            style={{
              filter: `grayscale(${look.grayscale}) brightness(${+(1 - look.dim).toFixed(4)})`,
            }}
          >
            {content}
          </div>
          <div
            aria-hidden="true"
            data-slot="color-spotlight-grid-color"
            className="pointer-events-none absolute inset-0"
            style={colorLayerStyle(revealed, look)}
          >
            {content}
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
            style={glowStyle(revealed, look)}
          />
        </div>
        {look.showInfo ? (
          <div className="flex flex-col gap-0.5 p-3">
            <span className="text-sm font-medium text-card-foreground">{title}</span>
            {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
          </div>
        ) : null}
      </Wrapper>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={borderStyle(revealed, look)}
      />
    </div>
  );
}
