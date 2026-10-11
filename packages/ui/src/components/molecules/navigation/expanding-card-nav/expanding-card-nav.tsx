"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  assertGroupCount,
  BAR_HEIGHT,
  type CardTone,
  cardTransition,
  openHeight,
  toneClasses,
} from "./expanding-card-nav-utils";

export type CardNavLink = { label: string; href: string; ariaLabel?: string };
export type CardNavGroup = { label: string; links: CardNavLink[]; tone?: CardTone };

export type ExpandingCardNavProps = React.ComponentProps<"nav"> & {
  groups: CardNavGroup[];
  logo?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [inner, setInner] = React.useState(defaultOpen);
  const current = open ?? inner;
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return [current, set] as const;
}

// Mede o conteúdo mesmo fechado (ele fica montado e invisível) para saber até onde crescer.
function useContentHeight(ref: React.RefObject<HTMLDivElement | null>) {
  const [height, setHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return height;
}

function MenuIcon({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300";
  return (
    <span aria-hidden="true" className="relative block h-3 w-5">
      <span className={cn(bar, "top-0", open && "translate-y-[5px] rotate-45")} />
      <span className={cn(bar, "bottom-0", open && "-translate-y-[5px] -rotate-45")} />
    </span>
  );
}

function NavCard({
  group,
  index,
  open,
  reduced,
  onNavigate,
}: {
  group: CardNavGroup;
  index: number;
  open: boolean;
  reduced: boolean;
  onNavigate: () => void;
}) {
  return (
    <motion.section
      data-slot="expanding-card-nav-card"
      aria-label={group.label}
      initial={false}
      animate={{ y: open ? 0 : 40, opacity: open ? 1 : 0 }}
      transition={cardTransition(index, open, reduced)}
      className={cn("flex min-h-32 flex-col rounded-xl p-4", toneClasses(group.tone))}
    >
      <h3 className="text-lg font-medium">{group.label}</h3>
      <ul className="mt-auto flex flex-col gap-1 pt-4">
        {group.links.map((link) => (
          <li key={link.href + link.label}>
            <a
              href={link.href}
              aria-label={link.ariaLabel}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {link.label}
              <ArrowUpRight aria-hidden="true" style={{ width: 14, height: 14 }} />
            </a>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

function ExpandingCardNav({
  groups,
  logo,
  action,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children: _children,
  ...props
}: ExpandingCardNavProps) {
  assertGroupCount(groups.length);
  const reduced = useShouldReduceMotion();
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const contentId = React.useId();
  const measureRef = React.useRef<HTMLDivElement>(null);
  const contentHeight = useContentHeight(measureRef);

  // No documento, e não no nav: com o foco fora da barra o Esc também precisa fechar.
  const closeRef = React.useRef(() => {});
  closeRef.current = () => setOpen(false);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.nav
      data-slot="expanding-card-nav"
      aria-label="Principal"
      {...(props as object)}
      initial={false}
      animate={{ height: open ? openHeight(contentHeight) : BAR_HEIGHT }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div
        data-slot="expanding-card-nav-bar"
        className="flex items-center justify-between px-3"
        style={{ height: BAR_HEIGHT }}
      >
        <button
          type="button"
          data-slot="expanding-card-nav-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(!open)}
          className="flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <MenuIcon open={open} />
        </button>
        <div className="flex items-center text-foreground">{logo}</div>
        <div className="flex items-center">{action}</div>
      </div>
      <div
        id={contentId}
        data-slot="expanding-card-nav-content"
        aria-hidden={!open}
        inert={!open}
        className="px-2 pb-2"
      >
        <div ref={measureRef} className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {groups.map((group, index) => (
            <NavCard
              key={group.label}
              group={group}
              index={index}
              open={open}
              reduced={reduced}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
ExpandingCardNav.displayName = "ExpandingCardNav";

export { ExpandingCardNav };
