"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { FillPillNavItem } from "./fill-pill-nav-types";

type ButtonProps = {
  open: boolean;
  reduced: boolean;
  menuId: string;
  onToggle: () => void;
};

export function MenuButton({ open, reduced, menuId, onToggle }: ButtonProps) {
  const transition = { duration: reduced ? 0 : 0.25 };
  return (
    <button
      type="button"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      aria-controls={menuId}
      onClick={onToggle}
      className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <motion.span
        aria-hidden="true"
        className="absolute h-0.5 w-4 rounded-full bg-background"
        initial={false}
        animate={{ y: open ? 0 : -3, rotate: open ? 45 : 0 }}
        transition={transition}
      />
      <motion.span
        aria-hidden="true"
        className="absolute h-0.5 w-4 rounded-full bg-background"
        initial={false}
        animate={{ y: open ? 0 : 3, rotate: open ? -45 : 0 }}
        transition={transition}
      />
    </button>
  );
}

type PanelProps = {
  open: boolean;
  menuId: string;
  items: FillPillNavItem[];
  activeHref?: string;
  reduced: boolean;
  onNavigate: () => void;
};

export function MenuPanel({ open, menuId, items, activeHref, reduced, onNavigate }: PanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          id={menuId}
          data-slot="fill-pill-nav-menu"
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="absolute inset-x-0 top-full z-50 mt-2 rounded-2xl border border-border bg-background p-2 shadow-lg"
        >
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-label={item.ariaLabel}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-11 items-center rounded-xl px-4 font-semibold text-foreground text-sm uppercase outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-muted"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
