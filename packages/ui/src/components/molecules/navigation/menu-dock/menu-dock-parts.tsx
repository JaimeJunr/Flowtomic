"use client";

import { Menu } from "lucide-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { type DockRanges, dockHref, dockKey, type MenuDockItem } from "./menu-dock-utils";

const DOCK_SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

// :focus-visible separa foco de teclado de foco por clique; sem suporte, trata como teclado
function isKeyboardFocus(element: HTMLElement): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

type DockActionProps = Pick<MenuDockItem, "href" | "onClick" | "label"> &
  Omit<React.ComponentProps<"a">, "href" | "onClick">;

/** Link quando há destino; botão quando só há ação (um `href="#"` rolaria a página ao topo). */
function DockAction({ href, onClick, label, children, ...props }: DockActionProps) {
  // O callback público não recebe o evento
  const handleClick = onClick ? () => onClick() : undefined;
  if (href !== undefined) {
    return (
      <a {...props} href={href} aria-label={label} onClick={handleClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      {...(props as React.ComponentProps<"button">)}
      type="button"
      aria-label={label}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

type IconContainerProps = {
  mouseX: MotionValue<number>;
  ranges: DockRanges;
  item: MenuDockItem;
};

export function DockIcon({ mouseX, ranges, item }: IconContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useShouldReduceMotion();
  // 1 = foco de teclado: o item se comporta como se o ponteiro estivesse sobre ele
  const keyboardFocus = useMotionValue(0);
  const distance = useTransform([mouseX, keyboardFocus], ([val, focused]: number[]) => {
    if (focused) return 0;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const width = useSpring(useTransform(distance, ranges.distance, ranges.size), DOCK_SPRING);
  const iconSize = useSpring(useTransform(distance, ranges.distance, ranges.icon), DOCK_SPRING);

  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const Icon = item.icon;
  const base = ranges.size[0] ?? 0;
  const baseIcon = ranges.icon[0] ?? 0;

  return (
    <DockAction
      href={dockHref(item)}
      label={item.label}
      onClick={item.onClick}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onFocus={(event) => {
        const keyboard = isKeyboardFocus(event.currentTarget);
        keyboardFocus.set(keyboard ? 1 : 0);
        setFocused(keyboard);
      }}
      onBlur={() => {
        keyboardFocus.set(0);
        setFocused(false);
      }}
    >
      <motion.div
        ref={ref}
        style={reduced ? { width: base, height: base } : { width, height: width }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-full bg-secondary"
      >
        <AnimatePresence>
          {(hovered || focused) && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-border bg-popover px-2 py-0.5 text-xs whitespace-pre text-popover-foreground"
            >
              {item.label}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={
            reduced ? { width: baseIcon, height: baseIcon } : { width: iconSize, height: iconSize }
          }
          className="flex items-center justify-center text-secondary-foreground"
        >
          <Icon className="size-full" />
        </motion.div>
      </motion.div>
    </DockAction>
  );
}

type MobileProps = { items: MenuDockItem[]; className?: string };

export function DockMobile({ items, className }: MobileProps) {
  const [open, setOpen] = React.useState(false);
  const itemClass = "flex size-10 items-center justify-center rounded-full bg-muted";

  return (
    <div data-slot="menu-dock-mobile" className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div
                key={dockKey(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { delay: idx * 0.05 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <DockAction
                  href={dockHref(item)}
                  label={item.label}
                  onClick={item.onClick}
                  className={itemClass}
                >
                  <item.icon className="size-4" />
                </DockAction>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={itemClass}
        aria-label="Alternar menu"
        aria-expanded={open}
      >
        <Menu className="size-5 text-muted-foreground" />
      </button>
    </div>
  );
}
