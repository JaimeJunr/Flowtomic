/**
 * Tooltip Component - Flowtomic UI
 *
 * Componente Tooltip baseado em Radix UI (padrão) ou React Aria (followMouse)
 * com seguimento do mouse e posicionamento inteligente
 * Baseado no Aceternity UI Tooltip Card para animações
 */

"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useTooltip } from "@react-aria/tooltip";
import { useTooltipTriggerState } from "@react-stately/tooltip";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
export type TooltipTriggerProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /**
   * Se o tooltip deve seguir o mouse
   * @default false
   */
  followMouse?: boolean;
  /**
   * Largura mínima do tooltip quando seguir o mouse
   * @default 240 (15rem)
   */
  minWidth?: number;
};

/**
 * TooltipProvider - Provider do tooltip
 */
const TooltipProvider = TooltipPrimitive.Provider;
TooltipProvider.displayName = "TooltipProvider";

/**
 * Tooltip - Container principal do tooltip
 */
const Tooltip = TooltipPrimitive.Root;
Tooltip.displayName = "Tooltip";

/**
 * TooltipTrigger - Trigger do tooltip
 */
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & {
    "data-follow-mouse"?: boolean;
  }
>(({ "data-follow-mouse": followMouse, ...props }, ref) => {
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      data-radix-tooltip-trigger=""
      data-follow-mouse={followMouse}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

/**
 * TooltipPortal - Portal do tooltip
 */
const TooltipPortal = TooltipPrimitive.Portal;
TooltipPortal.displayName = "TooltipPortal";

/**
 * TooltipContent - Conteúdo do tooltip com suporte a seguimento do mouse
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, followMouse = false, minWidth = 240, children, ...props }, ref) => {
  // Se não seguir o mouse, usar comportamento padrão do Radix
  if (!followMouse) {
    return (
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    );
  }

  // Comportamento com seguimento do mouse - implementação customizada baseada no Aceternity
  return (
    <TooltipContentWithMouseFollow
      ref={ref}
      sideOffset={sideOffset}
      className={className}
      minWidth={minWidth}
      {...props}
    >
      {children}
    </TooltipContentWithMouseFollow>
  );
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * TooltipContentWithMouseFollow - Versão com seguimento do mouse
 * Este componente não renderiza nada - o tooltip é renderizado via portal
 * O estado é gerenciado pelo TooltipWithMouseFollowWrapper
 */
const TooltipContentWithMouseFollow = React.forwardRef<
  HTMLDivElement,
  Omit<TooltipContentProps, "followMouse"> & { minWidth: number }
>(({ className: _className, minWidth: _minWidth, children: _children, ..._props }, _ref) => {
  // Este componente não renderiza - o tooltip é gerenciado pelo wrapper
  return null;
});

TooltipContentWithMouseFollow.displayName = "TooltipContentWithMouseFollow";

/**
 * TooltipWithMouseFollow - Wrapper completo para tooltip com seguimento do mouse
 * Implementação baseada no Aceternity UI, sem Radix
 */
export function TooltipWithMouseFollow({
  content,
  children,
  containerClassName,
  className,
  minWidth = 240,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  minWidth?: number;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [mouse, setMouse] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [height, setHeight] = React.useState(0);
  const [position, setPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Usar React Aria para acessibilidade
  const state = useTooltipTriggerState({ delay: 0 });
  const { tooltipProps } = useTooltip({}, state);

  // Sincronizar estado do React Aria com estado local
  React.useEffect(() => {
    setIsVisible(state.isOpen);
  }, [state.isOpen]);

  React.useEffect(() => {
    if (isVisible && contentRef.current) {
      // Usar múltiplos requestAnimationFrame para garantir que o DOM foi totalmente renderizado
      const rafId1 = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          if (contentRef.current) {
            // scrollHeight do conteúdo interno
            const contentScrollHeight = contentRef.current.scrollHeight;
            // py-1.5 = 0.375rem = 6px top + 6px bottom = 12px total
            // Adicionar buffer extra para garantir que não corte
            setHeight(contentScrollHeight + 16);
          }
        });
        return () => cancelAnimationFrame(rafId2);
      });
      return () => cancelAnimationFrame(rafId1);
    }
  }, [isVisible]);

  const calculatePosition = React.useCallback(
    (mouseX: number, mouseY: number) => {
      if (!contentRef.current || !containerRef.current) {
        return { x: mouseX + 12, y: mouseY + 12 };
      }

      const tooltip = contentRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Dimensões do tooltip
      const tooltipWidth = minWidth;
      const tooltipHeight = tooltip.scrollHeight;

      // Calcular posição absoluta relativa ao viewport
      const absoluteX = containerRect.left + mouseX;
      const absoluteY = containerRect.top + mouseY;

      // Posição inicial relativa ao container (como no original)
      let finalX = mouseX + 12;
      let finalY = mouseY + 12;

      // Verificar se ultrapassa a borda direita
      if (absoluteX + 12 + tooltipWidth > viewportWidth) {
        finalX = mouseX - tooltipWidth - 12;
      }

      // Verificar se ultrapassa a borda esquerda
      if (absoluteX + finalX < 0) {
        finalX = -containerRect.left + 12;
      }

      // Verificar se ultrapassa a borda inferior
      if (absoluteY + 12 + tooltipHeight > viewportHeight) {
        finalY = mouseY - tooltipHeight - 12;
      }

      // Verificar se ultrapassa a borda superior
      if (absoluteY + finalY < 0) {
        finalY = -containerRect.top + 12;
      }

      return { x: finalX, y: finalY };
    },
    [minWidth]
  );

  const updateMousePosition = React.useCallback(
    (mouseX: number, mouseY: number) => {
      setMouse({ x: mouseX, y: mouseY });
      const newPosition = calculatePosition(mouseX, mouseY);
      setPosition(newPosition);
    },
    [calculatePosition]
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    state.open();
    const rect = e.currentTarget.getBoundingClientRect();
    // Usar coordenadas relativas ao container para cálculo
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
  };

  const handleMouseLeave = () => {
    state.close();
    setMouse({ x: 0, y: 0 });
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisible) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    updateMousePosition(mouseX, mouseY);
    state.open();
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      state.close();
      setMouse({ x: 0, y: 0 });
      setPosition({ x: 0, y: 0 });
    }, 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      if (isVisible) {
        state.close();
        setMouse({ x: 0, y: 0 });
        setPosition({ x: 0, y: 0 });
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updateMousePosition(mouseX, mouseY);
        state.open();
      }
    }
  };

  // Recalcular posição quando altura mudar ou tooltip ficar visível
  React.useEffect(() => {
    if (isVisible && mouse.x !== 0 && mouse.y !== 0) {
      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        const newPosition = calculatePosition(mouse.x, mouse.y);
        setPosition(newPosition);
      });
    }
  }, [isVisible, mouse.x, mouse.y, calculatePosition]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", containerClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key={String(isVisible)}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            role="tooltip"
            id={tooltipProps.id}
            className={cn(
              "pointer-events-none absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
              className
            )}
            style={{
              top: position.y,
              left: position.x,
              minWidth: `${minWidth}px`,
              zIndex: 9999,
              overflow: "visible",
              wordWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            <div
              ref={contentRef}
              className="overflow-visible"
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipPortal };
