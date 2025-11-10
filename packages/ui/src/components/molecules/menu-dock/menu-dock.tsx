/**
 * MenuDock - Componente Molecule
 *
 * Componente de dock de menu com animação e suporte a múltiplos itens
 */

"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface MenuDockItem {
  id?: string;
  label: string;
  icon: IconComponentType;
  onClick?: () => void;
  path?: string;
}

export interface MenuDockProps {
  items?: MenuDockItem[];
  className?: string;
  variant?: "default" | "compact" | "large";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  animated?: boolean;
  defaultActiveIndex?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
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
  animated = true,
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onActiveIndexChange,
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 8;
    if (!isValid) {
      console.warn("MenuDock: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);

  // Usar índice controlado se fornecido, caso contrário usar estado interno
  const isControlled = controlledActiveIndex !== undefined;
  const activeIndex = isControlled ? controlledActiveIndex : internalActiveIndex;

  const setActiveIndex = (index: number) => {
    if (!isControlled) {
      setInternalActiveIndex(index);
    }
    onActiveIndexChange?.(index);
  };
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [underlineLeft, setUnderlineLeft] = useState(0);

  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (activeIndex >= finalItems.length && !isControlled) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, activeIndex, isControlled]);

  useEffect(() => {
    const updateUnderline = () => {
      const activeButton = itemRefs.current[activeIndex];
      const activeText = textRefs.current[activeIndex];

      if (activeButton && activeText && showLabels && orientation === "horizontal") {
        const buttonRect = activeButton.getBoundingClientRect();
        const textRect = activeText.getBoundingClientRect();
        const containerRect = activeButton.parentElement?.getBoundingClientRect();

        if (containerRect) {
          setUnderlineWidth(textRect.width);
          setUnderlineLeft(
            buttonRect.left - containerRect.left + (buttonRect.width - textRect.width) / 2
          );
        }
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeIndex, showLabels, orientation]);

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
              itemRefs.current[index] = el;
            }}
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
                }}
                className={cn(
                  "text-sm font-medium",
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

      {showLabels && orientation === "horizontal" && (
        <div
          className={cn(
            "absolute bottom-0 h-0.5 bg-primary transition-all duration-300",
            animated && "ease-out"
          )}
          style={{
            width: `${underlineWidth}px`,
            left: `${underlineLeft}px`,
          }}
        />
      )}
    </nav>
  );
};
