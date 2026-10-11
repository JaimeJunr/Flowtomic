"use client";

import { motion } from "motion/react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { CLOSE_DURATION, layerTone, SLIDE_EASE } from "./layered-menu-utils";

export type LayeredMenuItem = { label: string; href: string; ariaLabel?: string };
export type LayeredMenuLink = { label: string; href: string };
export type LayeredMenuSide = "left" | "right";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

export const sideClass = (side: LayeredMenuSide) => (side === "left" ? "left-0" : "right-0");
const slideFrom = (side: LayeredMenuSide) => (side === "left" ? "-100%" : "100%");

const enter = (delay: number, duration = 0.5) => ({ duration, ease: SLIDE_EASE, delay });
const leave = { duration: CLOSE_DURATION, ease: SLIDE_EASE, delay: 0 };

type ToggleProps = {
  open: boolean;
  reduced: boolean;
  panelId: string;
  onClick: () => void;
  ref: React.Ref<HTMLButtonElement>;
};

export function LayeredMenuToggle({ open, reduced, panelId, onClick, ref }: ToggleProps) {
  return (
    <button
      ref={ref}
      type="button"
      data-slot="layered-menu-toggle"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-foreground",
        "transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <span aria-hidden="true" className="block h-5 overflow-hidden">
        {reduced ? (
          <span className="block h-5 leading-5">{open ? "Fechar" : "Menu"}</span>
        ) : (
          <motion.span
            className="flex flex-col"
            animate={{ y: open ? "-50%" : "0%" }}
            transition={{ duration: 0.4, ease: SLIDE_EASE }}
          >
            <span className="block h-5 leading-5">Menu</span>
            <span className="block h-5 leading-5">Fechar</span>
          </motion.span>
        )}
      </span>
      <motion.span
        aria-hidden="true"
        className="relative block size-3.5"
        animate={{ rotate: open ? 45 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: SLIDE_EASE }}
      >
        <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current" />
        <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded-full bg-current" />
      </motion.span>
    </button>
  );
}

type LayersProps = { count: number; side: LayeredMenuSide; delays: number[] };

export function LayeredMenuLayers({ count, side, delays }: LayersProps) {
  const from = slideFrom(side);
  return Array.from({ length: count }, (_, i) => (
    <motion.div
      // biome-ignore lint/suspicious/noArrayIndexKey: camadas são fixas e ordenadas
      key={i}
      data-slot="layered-menu-layer"
      aria-hidden="true"
      className={cn("absolute inset-y-0 z-10 w-[min(420px,100%)]", sideClass(side), layerTone(i))}
      initial={{ x: from }}
      animate={{ x: 0, transition: enter(delays[i]) }}
      exit={{ x: from, transition: leave }}
    />
  ));
}

type PanelProps = {
  id: string;
  side: LayeredMenuSide;
  reduced: boolean;
  delay: number;
  ref: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
};

export function LayeredMenuPanel({ id, side, reduced, delay, ref, children }: PanelProps) {
  const from = slideFrom(side);
  const motionProps = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        initial: { x: from },
        animate: { x: 0, transition: enter(delay) },
        exit: { x: from, transition: leave },
      };
  return (
    <motion.div
      ref={ref}
      id={id}
      data-slot="layered-menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={cn(
        "absolute inset-y-0 z-20 flex w-[min(420px,100%)] flex-col gap-10 overflow-y-auto bg-background px-8 pb-8 pt-24",
        side === "left" ? "left-0 border-r border-border" : "right-0 border-l border-border"
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

type ItemsProps = {
  items: LayeredMenuItem[];
  delays: number[];
  numbered: boolean;
  reduced: boolean;
  onSelect: () => void;
};

export function LayeredMenuItems({ items, delays, numbered, reduced, onSelect }: ItemsProps) {
  return (
    <nav className="flex-1">
      <ul className="flex flex-col gap-2">
        {items.map((item, k) => (
          <li
            key={`${item.href}-${item.label}`}
            data-slot="layered-menu-item"
            className="overflow-hidden"
          >
            <a
              href={item.href}
              aria-label={item.ariaLabel}
              onClick={onSelect}
              className={cn(
                "block py-1 text-foreground transition-colors hover:text-primary",
                FOCUS_RING
              )}
            >
              <motion.span
                className="block origin-bottom-left text-5xl font-semibold uppercase leading-none tracking-tight"
                initial={reduced ? false : { y: "110%", rotate: 6 }}
                animate={{ y: 0, rotate: 0, transition: enter(delays[k]) }}
                exit={reduced ? undefined : { y: "110%", rotate: 6, transition: leave }}
              >
                {item.label}
                {numbered && (
                  <sup
                    aria-hidden="true"
                    className="ml-2 font-mono text-xs font-normal text-primary"
                  >
                    {String(k + 1).padStart(2, "0")}
                  </sup>
                )}
              </motion.span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type LinksProps = {
  links: LayeredMenuLink[];
  title: string;
  delay: number;
  reduced: boolean;
};

export function LayeredMenuLinks({ links, title, delay, reduced }: LinksProps) {
  return (
    <motion.div
      data-slot="layered-menu-links"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: enter(delay, 0.4) }}
      exit={reduced ? undefined : { opacity: 0, transition: leave }}
    >
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <a
              href={link.href}
              className={cn(
                "rounded-sm text-base text-foreground transition-colors hover:text-primary",
                FOCUS_RING
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
