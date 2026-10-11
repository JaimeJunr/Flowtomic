"use client";

import { motion, useMotionValue } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { DockIcon, DockMobile } from "./menu-dock-parts";
import { buildDockRanges, dockKey, type MenuDockItem } from "./menu-dock-utils";

export type { MenuDockItem } from "./menu-dock-utils";

export type MenuDockProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: MenuDockItem[];
  /** Tamanho do item longe do ponteiro, em px. */
  itemSize?: number;
  /** Tamanho do item sob o ponteiro (ou com foco de teclado), em px. */
  magnification?: number;
  /** Distância do ponteiro, em px, a partir da qual o item volta ao tamanho base. */
  magnifyDistance?: number;
  /** Classes só da barra de desktop (a partir de `md`). */
  desktopClassName?: string;
  /** Classes só do botão de menu mobile (abaixo de `md`). */
  mobileClassName?: string;
  /** @deprecated Use `itemSize`. */
  dockItemSize?: number;
  /** @deprecated Use `magnification`. */
  dockMagnification?: number;
  /** @deprecated Use `magnifyDistance`. */
  dockMagnifyDistance?: number;
  /** @deprecated Sem efeito: o MenuDock é sempre o dock flutuante. */
  animationType?: "floating";
};

// pb-3 (12) + o respiro de cima (12) somados ao item: a barra acompanha itemSize
const BAR_PADDING = 24;

function MenuDock({
  items,
  itemSize,
  magnification,
  magnifyDistance,
  desktopClassName,
  mobileClassName,
  dockItemSize,
  dockMagnification,
  dockMagnifyDistance,
  animationType: _animationType,
  className,
  "aria-label": ariaLabel = "Dock de navegação",
  ref,
  ...props
}: MenuDockProps) {
  const resolvedItemSize = itemSize ?? dockItemSize;
  const resolvedMagnification = magnification ?? dockMagnification;
  const resolvedDistance = magnifyDistance ?? dockMagnifyDistance;
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const ranges = React.useMemo(
    () =>
      buildDockRanges({
        itemSize: resolvedItemSize,
        magnification: resolvedMagnification,
        magnifyDistance: resolvedDistance,
      }),
    [resolvedItemSize, resolvedMagnification, resolvedDistance]
  );

  return (
    <nav
      ref={ref}
      data-slot="menu-dock"
      aria-label={ariaLabel}
      className={cn("w-fit", className)}
      {...props}
    >
      <motion.div
        data-slot="menu-dock-desktop"
        // clientX: a conta usa getBoundingClientRect, que também é relativo à janela
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        style={{ height: (ranges.size[0] ?? 0) + BAR_PADDING }}
        className={cn(
          "hidden items-end gap-4 rounded-2xl bg-muted px-4 pb-3 md:flex",
          desktopClassName
        )}
      >
        {items.map((item) => (
          <DockIcon key={dockKey(item)} mouseX={mouseX} ranges={ranges} item={item} />
        ))}
      </motion.div>
      <DockMobile items={items} className={mobileClassName} />
    </nav>
  );
}
MenuDock.displayName = "MenuDock";

export { MenuDock };
