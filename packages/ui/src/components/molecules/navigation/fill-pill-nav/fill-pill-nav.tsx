"use client";

import { motion } from "motion/react";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { MenuButton, MenuPanel } from "./fill-pill-nav-menu";
import { NavLogo, NavPill } from "./fill-pill-nav-parts";
import type { FillPillNavItem } from "./fill-pill-nav-types";
import { FILL_EASE, isCompactWidth } from "./fill-pill-nav-utils";
import { useElementSize } from "./use-element-size";

export type { FillPillNavItem } from "./fill-pill-nav-types";

export type FillPillNavProps = ComponentProps<"nav"> & {
  items: FillPillNavItem[];
  activeHref?: string;
  /** Conteúdo do círculo do logo. */
  logo?: ReactNode;
  logoHref?: string;
  /** Nome acessível do logo. */
  logoLabel?: string;
  introAnimation?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
};

function FillPillNav({
  ref,
  items,
  activeHref,
  logo,
  logoHref = "#",
  logoLabel = "Início",
  introAnimation = true,
  onMobileMenuToggle,
  className,
  "aria-label": ariaLabel = "Principal",
  ...props
}: FillPillNavProps) {
  const reduced = useShouldReduceMotion();
  const menuId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootSize = useElementSize(rootRef);
  const listSize = useElementSize(listRef);
  const [openState, setOpenState] = useState(false);
  const intro = introAnimation && !reduced;
  const [introDone, setIntroDone] = useState(!intro);

  const compact = isCompactWidth(rootSize?.width ?? null);
  // Voltar a uma tela larga fecha o painel sem avisar: o usuário não tocou em nada.
  const open = compact && openState;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (next !== open) onMobileMenuToggle?.(next);
    },
    [open, onMobileMenuToggle]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const setRoot = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <nav
      ref={setRoot}
      data-slot="fill-pill-nav"
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-full items-center gap-2",
        compact && "justify-between",
        className
      )}
      {...props}
    >
      <NavLogo href={logoHref} label={logoLabel} intro={intro} reduced={reduced}>
        {logo}
      </NavLogo>
      {compact ? (
        <>
          <MenuButton
            open={open}
            reduced={reduced}
            menuId={menuId}
            onToggle={() => setOpen(!open)}
          />
          <MenuPanel
            open={open}
            menuId={menuId}
            items={items}
            activeHref={activeHref}
            reduced={reduced}
            onNavigate={() => setOpen(false)}
          />
        </>
      ) : (
        <motion.div
          className={cn("rounded-full bg-foreground p-1", !introDone && "overflow-hidden")}
          initial={intro ? { width: 0 } : false}
          animate={introDone ? { width: "auto" } : { width: listSize ? listSize.width + 8 : 0 }}
          transition={{ duration: 0.6, ease: FILL_EASE }}
          onAnimationComplete={() => listSize && setIntroDone(true)}
        >
          <ul ref={listRef} className="flex w-max items-center gap-1">
            {items.map((item) => (
              <NavPill
                key={item.href}
                item={item}
                active={item.href === activeHref}
                reduced={reduced}
              />
            ))}
          </ul>
        </motion.div>
      )}
    </nav>
  );
}

FillPillNav.displayName = "FillPillNav";

export { FillPillNav };
