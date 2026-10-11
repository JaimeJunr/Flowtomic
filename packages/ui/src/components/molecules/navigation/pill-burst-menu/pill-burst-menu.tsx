"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { assertItemCount, pillDelay, pillRotation } from "./pill-burst-menu-utils";

export type PillBurstItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  tone?: "primary" | "foreground" | "muted";
};

export type PillBurstMenuProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: PillBurstItem[];
  logo?: React.ReactNode;
  menuLabel?: string;
  fixed?: boolean;
  stagger?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const BUBBLE = "bg-background text-foreground shadow-lg border border-border";

// Classes literais por tom: o Tailwind só gera o que enxerga inteiro no fonte.
const TONE_HOVER = {
  primary: "data-[hovered=true]:bg-primary data-[hovered=true]:text-primary-foreground",
  foreground: "data-[hovered=true]:bg-foreground data-[hovered=true]:text-background",
  muted: "data-[hovered=true]:bg-muted",
} as const;

const SPRING = { type: "spring", stiffness: 320, damping: 14 } as const;

function ToggleBars({ open }: { open: boolean }) {
  const bar =
    "absolute left-1/2 top-1/2 h-0.5 w-5 -ml-2.5 rounded-full bg-current transition-transform";
  return (
    <span aria-hidden="true" className="relative block size-5">
      <span className={bar} style={{ transform: open ? "rotate(45deg)" : "translateY(-4px)" }} />
      <span className={bar} style={{ transform: open ? "rotate(-45deg)" : "translateY(4px)" }} />
    </span>
  );
}

type PillProps = {
  item: PillBurstItem;
  index: number;
  stagger: number;
  reduced: boolean;
  onSelect: () => void;
  linkRef?: React.Ref<HTMLAnchorElement>;
};

function Pill({ item, index, stagger, reduced, onSelect, linkRef }: PillProps) {
  const [hovered, setHovered] = React.useState(false);
  // O atraso escalonado vale só na entrada; depois disso o hover deve responder na hora.
  const entered = React.useRef(false);
  const rotation = pillRotation(index, item.rotation);
  const delay = pillDelay(index, stagger);
  const lift = hovered && !reduced;
  if (hovered) entered.current = true;
  const hoverIn = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") setHovered(true);
  };
  return (
    <li>
      <motion.a
        ref={linkRef}
        data-slot="pill-burst-menu-item"
        data-hovered={hovered ? "true" : undefined}
        href={item.href}
        aria-label={item.ariaLabel}
        onClick={onSelect}
        onPointerEnter={hoverIn}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={reduced ? { rotate: rotation } : undefined}
        initial={reduced ? { opacity: 0 } : { scale: 0, rotate: rotation }}
        animate={
          reduced
            ? { opacity: 1, transition: { delay } }
            : {
                scale: lift ? 1.06 : 1,
                rotate: lift ? 0 : rotation,
                transition: { ...SPRING, delay: entered.current ? 0 : delay },
              }
        }
        exit={reduced ? { opacity: 0 } : { scale: 0, transition: { duration: 0.2 } }}
        className={cn(
          "block select-none rounded-full px-10 py-6 text-center text-3xl font-medium no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:text-5xl",
          BUBBLE,
          TONE_HOVER[item.tone ?? "primary"]
        )}
      >
        <motion.span
          className="block"
          initial={reduced ? false : { y: 24 }}
          animate={{ y: 0, transition: { delay: delay + 0.08 } }}
        >
          {item.label}
        </motion.span>
      </motion.a>
    </li>
  );
}

function PillBurstMenu({
  items,
  logo,
  menuLabel,
  fixed = false,
  stagger = 0.12,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  onKeyDown,
  ref,
  ...props
}: PillBurstMenuProps) {
  assertItemCount(items.length);
  const reduced = useShouldReduceMotion();
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const overlayId = React.useId();
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const firstRef = React.useRef<HTMLAnchorElement>(null);
  const wasOpen = React.useRef(open);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };

  // Foco: primeira pílula ao abrir, botão ao fechar (só na transição, não na montagem).
  React.useEffect(() => {
    if (open) firstRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key === "Escape" && open) setOpen(false);
  };

  const label = menuLabel ?? (open ? "Fechar menu" : "Abrir menu");
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: captura Esc vindo de dentro do menu
    <div
      ref={ref}
      data-slot="pill-burst-menu"
      onKeyDown={handleKeyDown}
      className={cn(
        fixed ? "pointer-events-none fixed inset-0 z-50" : "relative w-full",
        className
      )}
      {...props}
    >
      <div className="pointer-events-auto relative z-20 flex items-center justify-between p-4">
        <div
          data-slot="pill-burst-menu-logo"
          className={cn("flex h-12 items-center rounded-full px-5", BUBBLE)}
        >
          {logo}
        </div>
        <button
          ref={toggleRef}
          type="button"
          data-slot="pill-burst-menu-toggle"
          aria-label={label}
          aria-expanded={open}
          aria-controls={overlayId}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex size-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            BUBBLE
          )}
        >
          <ToggleBars open={open} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            id={overlayId}
            data-slot="pill-burst-menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
          >
            <nav>
              <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
                {items.map((item, i) => (
                  <Pill
                    key={item.href + item.label}
                    item={item}
                    index={i}
                    stagger={stagger}
                    reduced={reduced}
                    onSelect={() => setOpen(false)}
                    linkRef={i === 0 ? firstRef : undefined}
                  />
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

PillBurstMenu.displayName = "PillBurstMenu";

export { PillBurstMenu };
