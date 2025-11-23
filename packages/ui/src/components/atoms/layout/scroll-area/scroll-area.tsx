/**
 * ScrollArea Component - Flowtomic UI
 *
 * Componente ScrollArea baseado em Radix UI
 */

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "@/lib/utils";

export type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>;
export type ScrollAreaViewportProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Viewport
>;
export type ScrollAreaScrollbarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;
export type ScrollAreaThumbProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Thumb>;
export type ScrollAreaCornerProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Corner
>;

/**
 * ScrollBar - Scrollbar do scroll area
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-px",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

/**
 * ScrollAreaViewport - Viewport do scroll area
 */
const ScrollAreaViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  ScrollAreaViewportProps
>(({ className, children, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      // Verificar se há scroll horizontal disponível
      const hasHorizontalScroll = viewport.scrollWidth > viewport.clientWidth;
      const hasVerticalScroll = viewport.scrollHeight > viewport.clientHeight;

      // Se Shift estiver pressionado e houver scroll horizontal, fazer scroll horizontal
      if (e.shiftKey && hasHorizontalScroll) {
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
        return;
      }

      // Se o scroll for principalmente horizontal (trackpad/trackball), permitir nativo
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      // Se houver scroll horizontal disponível e scroll vertical limitado,
      // permitir scroll horizontal quando no limite vertical
      if (hasHorizontalScroll && e.deltaY !== 0) {
        const isAtTop = viewport.scrollTop <= 1;
        const isAtBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;

        // Se estiver no limite vertical ou não houver scroll vertical,
        // fazer scroll horizontal com a roda do mouse
        if ((isAtTop || isAtBottom || !hasVerticalScroll) && Math.abs(e.deltaY) > 0) {
          e.preventDefault();
          viewport.scrollLeft += e.deltaY;
          return;
        }
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <ScrollAreaPrimitive.Viewport
      ref={(node) => {
        viewportRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn("h-full w-full rounded-[inherit]", className)}
      {...props}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
  );
});
ScrollAreaViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

/**
 * ScrollArea - Container principal do scroll area
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaViewport>{children}</ScrollAreaViewport>
    <ScrollBar />
    <ScrollBar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea, ScrollAreaViewport, ScrollBar };
