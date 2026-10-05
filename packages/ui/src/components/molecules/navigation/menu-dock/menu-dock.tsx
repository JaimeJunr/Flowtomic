/**
 * MenuDock - Componente Molecule
 *
 * Componente de dock de menu com animação e suporte a múltiplos itens
 * Suporta duas animações: "default" (underline animado) e "floating" (estilo macOS)
 */

"use client";

import { useAnimatedIndicator } from "@flowtomic/logic";
import { Menu } from "lucide-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface MenuDockItem {
  id?: string;
  label: string;
  icon: IconComponentType;
  onClick?: () => void;
  path?: string;
  href?: string;
}

export interface MenuDockProps {
  items?: MenuDockItem[];
  className?: string;
  variant?: "default" | "compact" | "large";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  animated?: boolean;
  animationType?: "default" | "floating";
  defaultActiveIndex?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  desktopClassName?: string;
  mobileClassName?: string;
  /** Tamanho do item longe do ponteiro, em px. Só vale com `animationType="floating"`. */
  dockItemSize?: number;
  /** Tamanho do item sob o ponteiro (ou com foco), em px. Só vale com `animationType="floating"`. */
  dockMagnification?: number;
  /** Distância do ponteiro, em px, a partir da qual o item volta ao tamanho base. */
  dockMagnifyDistance?: number;
}

type DockMagnifyOptions = Pick<
  MenuDockProps,
  "dockItemSize" | "dockMagnification" | "dockMagnifyDistance"
>;

const DOCK_ITEM_SIZE = 40;
const DOCK_MAGNIFICATION = 80;
const DOCK_MAGNIFY_DISTANCE = 150;

/** Faixas de entrada/saída das transformações da lupa; o ícone é sempre metade do item. */
export function buildDockRanges({
  itemSize = DOCK_ITEM_SIZE,
  magnification = DOCK_MAGNIFICATION,
  magnifyDistance = DOCK_MAGNIFY_DISTANCE,
}: {
  itemSize?: number;
  magnification?: number;
  magnifyDistance?: number;
}) {
  if (!(itemSize > 0)) {
    throw new RangeError(
      `invalid itemSize: received ${itemSize}, expected a positive number of pixels`
    );
  }
  if (!(magnifyDistance > 0)) {
    throw new RangeError(
      `invalid magnifyDistance: received ${magnifyDistance}, expected a positive number of pixels`
    );
  }
  if (!(magnification >= itemSize)) {
    throw new RangeError(
      `invalid magnification: received magnification ${magnification}, expected a number >= itemSize ${itemSize}`
    );
  }
  return {
    distance: [-magnifyDistance, 0, magnifyDistance],
    size: [itemSize, magnification, itemSize],
    icon: [itemSize / 2, magnification / 2, itemSize / 2],
  };
}

type DockRanges = ReturnType<typeof buildDockRanges>;

const defaultItems: MenuDockItem[] = [
  { label: "Início", icon: () => null },
  { label: "Trabalho", icon: () => null },
  { label: "Calendário", icon: () => null },
  { label: "Segurança", icon: () => null },
  { label: "Configurações", icon: () => null },
];

export const MenuDock: React.FC<MenuDockProps> = ({
  items,
  className,
  variant = "default",
  orientation = "horizontal",
  showLabels = true,
  animated: _animated = true,
  animationType = "default",
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onActiveIndexChange,
  desktopClassName,
  mobileClassName,
  dockItemSize,
  dockMagnification,
  dockMagnifyDistance,
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 8;
    if (!isValid) {
      console.warn("MenuDock: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
  const isControlled = controlledActiveIndex !== undefined;
  const activeIndex = isControlled ? controlledActiveIndex : internalActiveIndex;
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useShouldReduceMotion();
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldUseIndicator = showLabels && orientation === "horizontal";

  const { indicatorStyle, registerElement, unregisterElement } = useAnimatedIndicator({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    activeSelector: 'span[data-active="true"]',
    value: activeIndex.toString(),
    getElementValue: (element: HTMLElement) => {
      return element.getAttribute("data-index") || "";
    },
    updateOnResize: shouldUseIndicator && animationType === "default",
  });

  const setActiveIndex = (index: number) => {
    if (!isControlled) {
      setInternalActiveIndex(index);
    }
    onActiveIndexChange?.(index);
  };

  useEffect(() => {
    if (
      animationType === "default" &&
      (activeIndex < 0 || activeIndex >= finalItems.length) &&
      !isControlled
    ) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, activeIndex, isControlled, animationType]);

  // Registrar elementos quando shouldUseIndicator mudar ou items mudarem
  useEffect(() => {
    if (animationType === "default" && shouldUseIndicator) {
      textRefs.current.forEach((el, index) => {
        if (el) {
          registerElement(el, index.toString());
        }
      });
      return () => {
        textRefs.current.forEach((_, index) => {
          unregisterElement(index.toString());
        });
      };
    }
  }, [shouldUseIndicator, registerElement, unregisterElement, animationType]);

  // Se animationType for "floating", renderizar FloatingDock
  if (animationType === "floating") {
    return (
      <FloatingDock
        items={finalItems.map((item) => ({
          title: item.label,
          icon: <item.icon className="h-full w-full" />,
          href: item.href || item.path || "#",
          onClick: item.onClick ? () => item.onClick?.() : undefined,
        }))}
        desktopClassName={desktopClassName}
        mobileClassName={mobileClassName}
        className={className}
        magnify={{ dockItemSize, dockMagnification, dockMagnifyDistance }}
      />
    );
  }

  const sizeClasses = {
    default: "p-3",
    compact: "p-2",
    large: "p-4",
  };

  const iconSizes = {
    default: "w-5 h-5",
    compact: "w-4 h-4",
    large: "w-6 h-6",
  };

  return (
    <nav
      data-slot="menu-dock"
      ref={containerRef}
      className={cn(
        "relative flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "items-center gap-2",
        "bg-background border border-border rounded-lg",
        "p-2",
        className
      )}
      aria-label="Menu de navegação"
    >
      {finalItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeIndex === index;

        return (
          <button
            type="button"
            key={item.id || `menu-item-${index}`}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            data-active={isActive ? "true" : "false"}
            data-index={index.toString()}
            onClick={() => {
              setActiveIndex(index);
              item.onClick?.();
            }}
            className={cn(
              "relative flex items-center gap-2",
              "px-3 py-2 rounded-md",
              "transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
              sizeClasses[variant]
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className={cn(iconSizes[variant], isActive && "text-primary")} />
            {showLabels && (
              <span
                ref={(el) => {
                  textRefs.current[index] = el;
                  if (shouldUseIndicator && el) {
                    registerElement(el, index.toString());
                  }
                }}
                data-active={isActive}
                data-index={index.toString()}
                className={cn(
                  "text-sm font-medium inline-block",
                  "transition-all duration-200",
                  isActive && "text-primary"
                )}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}

      {shouldUseIndicator && (
        <motion.div
          className="absolute bottom-0 bg-primary"
          initial={false}
          animate={
            shouldReduceMotion
              ? {
                  opacity: indicatorStyle.opacity,
                }
              : {
                  x: indicatorStyle.left,
                  width: indicatorStyle.width,
                  opacity: indicatorStyle.opacity,
                }
          }
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
            mass: 0.5,
          }}
          style={{
            pointerEvents: "none",
            zIndex: 0,
            left: 0,
            bottom: 0,
            height: "2px",
          }}
        />
      )}
    </nav>
  );
};

// Floating Dock Implementation (estilo macOS)
interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}

interface FloatingDockProps {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  className?: string;
  magnify: DockMagnifyOptions;
}

/**
 * FloatingDock - Componente de dock estilo macOS
 *
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 */
const FloatingDock: React.FC<FloatingDockProps> = ({
  items,
  desktopClassName,
  mobileClassName,
  className,
  magnify,
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName || className}
        magnify={magnify}
      />
      <FloatingDockMobile items={items} className={mobileClassName || className} />
    </>
  );
};

const FloatingDockMobile: React.FC<{
  items: FloatingDockItem[];
  className?: string;
}> = ({ items, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <div data-slot="menu-dock-mobile" className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  aria-label={item.title}
                  onClick={item.onClick}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        aria-label="Alternar menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
};

const FloatingDockDesktop: React.FC<{
  items: FloatingDockItem[];
  className?: string;
  magnify: DockMagnifyOptions;
}> = ({ items, className, magnify }) => {
  const mouseX = useMotionValue(Infinity);
  const { dockItemSize, dockMagnification, dockMagnifyDistance } = magnify;
  const ranges = useMemo(
    () =>
      buildDockRanges({
        itemSize: dockItemSize,
        magnification: dockMagnification,
        magnifyDistance: dockMagnifyDistance,
      }),
    [dockItemSize, dockMagnification, dockMagnifyDistance]
  );

  return (
    <motion.div
      data-slot="menu-dock-desktop"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-muted px-4 pb-3 md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} ranges={ranges} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

// :focus-visible separa foco de teclado de foco por clique; sem suporte, trata como teclado
function isKeyboardFocus(element: HTMLElement): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

const DOCK_SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

function IconContainer({
  mouseX,
  ranges,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue<number>;
  ranges: DockRanges;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useShouldReduceMotion();
  // 1 = foco de teclado: o item se comporta como se o ponteiro estivesse sobre ele
  const keyboardFocus = useMotionValue(0);
  const distance = useTransform([mouseX, keyboardFocus], ([val, focused]: number[]) => {
    if (focused) return 0;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, ranges.distance, ranges.size);
  const heightTransform = useTransform(distance, ranges.distance, ranges.size);
  const widthTransformIcon = useTransform(distance, ranges.distance, ranges.icon);
  const heightTransformIcon = useTransform(distance, ranges.distance, ranges.icon);

  const width = useSpring(widthTransform, DOCK_SPRING);
  const height = useSpring(heightTransform, DOCK_SPRING);
  const widthIcon = useSpring(widthTransformIcon, DOCK_SPRING);
  const heightIcon = useSpring(heightTransformIcon, DOCK_SPRING);

  const baseSize = ranges.size[0] ?? DOCK_ITEM_SIZE;
  const baseIconSize = ranges.icon[0] ?? DOCK_ITEM_SIZE / 2;

  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      aria-label={title}
      onClick={onClick}
      onFocus={(event) => keyboardFocus.set(isKeyboardFocus(event.currentTarget) ? 1 : 0)}
      onBlur={() => keyboardFocus.set(0)}
    >
      <motion.div
        ref={ref}
        style={shouldReduceMotion ? { width: baseSize, height: baseSize } : { width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-secondary"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-border bg-popover px-2 py-0.5 text-xs whitespace-pre text-popover-foreground"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={
            shouldReduceMotion
              ? { width: baseIconSize, height: baseIconSize }
              : { width: widthIcon, height: heightIcon }
          }
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
