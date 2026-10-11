"use client";

import { AnimatePresence } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type LayeredMenuItem,
  LayeredMenuItems,
  LayeredMenuLayers,
  type LayeredMenuLink,
  LayeredMenuLinks,
  LayeredMenuPanel,
  type LayeredMenuSide,
  LayeredMenuToggle,
} from "./layered-menu-parts";
import { openSchedule } from "./layered-menu-utils";

export type { LayeredMenuItem, LayeredMenuLink, LayeredMenuSide };

export type LayeredMenuProps = React.ComponentProps<"div"> & {
  /** Itens do menu, pelo menos um. */
  items: LayeredMenuItem[];
  /** Redes e contatos; a seção some quando vazio. */
  links?: LayeredMenuLink[];
  linksTitle?: string;
  logo?: React.ReactNode;
  side?: LayeredMenuSide;
  layers?: 1 | 2 | 3;
  numbered?: boolean;
  closeOnClickAway?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const PANEL_LINK = "a[href]";

function useOpenState(
  openProp: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return [open, setOpen] as const;
}

function LayeredMenu({
  items,
  links = [],
  linksTitle = "Contato",
  logo,
  side = "right",
  layers = 2,
  numbered = true,
  closeOnClickAway = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ref,
  ...props
}: LayeredMenuProps) {
  const reduced = useShouldReduceMotion();
  const panelId = `${React.useId()}-panel`;
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const schedule = openSchedule(layers, items.length);

  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const wasOpen = React.useRef(false);
  // Clique fora não devolve o foco ao botão: a pessoa foi para outro lugar.
  const skipRestore = React.useRef(false);
  const latest = React.useRef({ setOpen, closeOnClickAway });
  latest.current = { setOpen, closeOnClickAway };

  React.useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current?.querySelector<HTMLElement>(PANEL_LINK)?.focus({ preventScroll: true });
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (!skipRestore.current) toggleRef.current?.focus({ preventScroll: true });
    skipRestore.current = false;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") latest.current.setOpen(false);
      if (event.key === "Tab") trapTab(event, toggleRef.current, panelRef.current);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!latest.current.closeOnClickAway) return;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      skipRestore.current = true;
      latest.current.setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      data-slot="layered-menu"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <header className="relative z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center text-foreground">{logo}</div>
        <LayeredMenuToggle
          ref={toggleRef}
          open={open}
          reduced={reduced}
          panelId={panelId}
          onClick={() => setOpen(!open)}
        />
      </header>
      <AnimatePresence>
        {open && !reduced && (
          <LayeredMenuLayers key="layers" count={layers} side={side} delays={schedule.layer} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <LayeredMenuPanel
            key="panel"
            ref={panelRef}
            id={panelId}
            side={side}
            reduced={reduced}
            delay={schedule.panel}
          >
            <LayeredMenuItems
              items={items}
              delays={schedule.items}
              numbered={numbered}
              reduced={reduced}
              onSelect={() => setOpen(false)}
            />
            {links.length > 0 && (
              <LayeredMenuLinks
                links={links}
                title={linksTitle}
                delay={schedule.links}
                reduced={reduced}
              />
            )}
          </LayeredMenuPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
LayeredMenu.displayName = "LayeredMenu";

// Mantém o Tab dentro do botão e do painel enquanto o menu está aberto.
function trapTab(event: KeyboardEvent, toggle: HTMLElement | null, panel: HTMLElement | null) {
  const cycle = [
    toggle,
    ...Array.from(panel?.querySelectorAll<HTMLElement>(PANEL_LINK) ?? []),
  ].filter((el): el is HTMLElement => el !== null);
  if (cycle.length === 0) return;
  const index = cycle.indexOf(document.activeElement as HTMLElement);
  const first = cycle[0];
  const last = cycle[cycle.length - 1];
  if (event.shiftKey && index <= 0) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (index === -1 || index === cycle.length - 1)) {
    event.preventDefault();
    first.focus();
  }
}

export { LayeredMenu };
