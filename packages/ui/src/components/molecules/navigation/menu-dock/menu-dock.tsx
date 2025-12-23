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
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
}

const defaultItems: MenuDockItem[] = [
  { label: "home", icon: () => null },
  { label: "work", icon: () => null },
  { label: "calendar", icon: () => null },
  { label: "security", icon: () => null },
  { label: "settings", icon: () => null },
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
  const shouldReduceMotion = useReducedMotion();
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
    if (animationType === "default" && activeIndex >= finalItems.length && !isControlled) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, activeIndex, isControlled, animationType]);

  // Se animationType for "floating", renderizar FloatingDock
  if (animationType === "floating") {
    return (
      <FloatingDock
        items={finalItems.map((item) => ({
          title: item.label,
          icon: <item.icon className="h-full w-full" />,
          href: item.href || item.path || "#",
          onClick: item.onClick,
        }))}
        desktopClassName={desktopClassName}
        mobileClassName={mobileClassName}
        className={className}
      />
    );
  }

  // Registrar elementos quando shouldUseIndicator mudar ou items mudarem
  useEffect(() => {
    if (shouldUseIndicator) {
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
  }, [shouldUseIndicator, registerElement, unregisterElement]);

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
      ref={containerRef}
      className={cn(
        "relative flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "items-center gap-2",
        "bg-background border border-border rounded-lg",
        "p-2",
        className
      )}
      aria-label="Menu dock"
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
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName || className} />
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
    <div className={cn("relative block md:hidden", className)}>
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
                  onClick={item.onClick}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop: React.FC<{
  items: FloatingDockItem[];
  className?: string;
}> = ({ items, className }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
