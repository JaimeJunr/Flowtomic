/**
 * FuseToast Component - Flowtomic UI
 *
 * Aviso individual com pavio: sobe do canto, uma linha fina queima até acabar e ele
 * desce sozinho. Passar o mouse pausa o pavio; dá para dispensar arrastando de lado.
 * Não é fila nem gerenciador de avisos: para isso use o `Sonner` (atoms/feedback/sonner).
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/fuse-toast.md
 */

"use client";

import { X } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type FuseToastCloseReason,
  shouldDismiss,
  swipeOpacity,
  useFuseTimer,
} from "./fuse-toast-utils";

export type { FuseToastCloseReason };

type FuseToastFuse = "bottom" | "top" | "none";

export type FuseToastProps = Omit<
  React.ComponentProps<"div">,
  "title" | "style" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actionLabel?: React.ReactNode;
  onAction?: () => void;
  open?: boolean;
  /** Chamado depois da animação de saída, com o motivo do fechamento. */
  onClose?: (reason: FuseToastCloseReason) => void;
  /** Duração da entrada/saída, em ms. */
  slideMs?: number;
  /** Quanto a mola do arraste balança ao voltar (0 a 1). */
  settleBounce?: number;
  /** Distância (px) que um arraste lento precisa passar para dispensar. */
  swipeDistance?: number;
  /** Tempo até fechar sozinho, em ms; 0 fica até ser dispensado. */
  durationMs?: number;
  fuse?: FuseToastFuse;
  pauseOnHover?: boolean;
  closeButton?: boolean;
  /** No fluxo do pai em vez de fixo no canto da tela. */
  inline?: boolean;
  /** Falso desliga arraste e Escape. */
  dismissible?: boolean;
};

type ExitCustom = { reduced: boolean; inline: boolean };

const toastVariants = {
  hidden: ({ reduced }: ExitCustom) => (reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }),
  shown: { y: 0, opacity: 1 },
  gone: ({ reduced, inline }: ExitCustom) => ({
    opacity: 0,
    ...(reduced ? {} : { y: "100%" }),
    // Inline: a altura colapsa para o conteúdo vizinho acompanhar.
    ...(inline ? { height: 0, overflow: "hidden" } : {}),
  }),
};

const SWIPE_EXIT_PX = 480;

type DragState = { startX: number; lastX: number; lastT: number; vx: number };

/** Arraste horizontal por pointer events; o botão de ação/fechar não inicia arraste. */
function useSwipe(options: {
  enabled: boolean;
  distance: number;
  bounce: number;
  reduced: boolean;
  slideMs: number;
  onDismiss: () => void;
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, swipeOpacity);
  const [dragging, setDragging] = React.useState(false);
  const drag = React.useRef<DragState | null>(null);
  const { enabled, distance, bounce, reduced, slideMs, onDismiss } = options;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    const target = event.currentTarget;
    if (typeof target.setPointerCapture === "function") target.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, lastX: event.clientX, lastT: performance.now(), vx: 0 };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state) return;
    const now = performance.now();
    if (now > state.lastT) state.vx = ((event.clientX - state.lastX) / (now - state.lastT)) * 1000;
    state.lastX = event.clientX;
    state.lastT = now;
    x.set(event.clientX - state.startX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    setDragging(false);
    const dx = event.clientX - state.startX;
    if (shouldDismiss(dx, state.vx, distance)) {
      const side = dx === 0 ? Math.sign(state.vx) || 1 : Math.sign(dx);
      animate(x, side * SWIPE_EXIT_PX, { duration: slideMs / 1000, ease: "easeOut" });
      onDismiss();
      return;
    }
    // Movimento reduzido: volta sem mola.
    animate(x, 0, reduced ? { duration: 0 } : { type: "spring", bounce, duration: 0.5 });
  };

  return { x, opacity, dragging, handlers: { onPointerDown, onPointerMove, onPointerUp } };
}

type FuseLineProps = { remaining: number; edge: "top" | "bottom" };

function FuseLine({ remaining, edge }: FuseLineProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="fuse-toast-fuse"
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 origin-left bg-primary",
        edge === "top" ? "top-0" : "bottom-0"
      )}
      style={{ transform: `scaleX(${remaining})` }}
    />
  );
}

/** Aviso individual que fecha sozinho quando o pavio acaba. */
function FuseToast({
  ref,
  className,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  open = true,
  onClose,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  durationMs = 4000,
  fuse = "bottom",
  pauseOnHover = true,
  closeButton = false,
  inline = false,
  dismissible = true,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  ...props
}: FuseToastProps) {
  const reduced = useShouldReduceMotion();
  const [visible, setVisible] = React.useState(open);
  const [hovered, setHovered] = React.useState(false);
  const visibleRef = React.useRef(visible);
  visibleRef.current = visible;
  const reasonRef = React.useRef<FuseToastCloseReason>("programmatic");

  const close = React.useCallback((reason: FuseToastCloseReason) => {
    if (!visibleRef.current) return;
    visibleRef.current = false;
    reasonRef.current = reason;
    setVisible(false);
  }, []);

  React.useEffect(() => {
    if (open) setVisible(true);
    else close("programmatic");
  }, [open, close]);

  React.useEffect(() => {
    if (!visible || !dismissible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close("escape");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, dismissible, close]);

  const swipe = useSwipe({
    enabled: dismissible,
    distance: swipeDistance,
    bounce: settleBounce,
    reduced,
    slideMs,
    onDismiss: () => close("swipe"),
  });

  const remaining = useFuseTimer({
    active: visible,
    durationMs,
    paused: swipe.dragging || (pauseOnHover && hovered),
    onEnd: () => close("timeout"),
  });

  if (!inline && typeof document === "undefined") return null;

  const custom: ExitCustom = { reduced, inline };
  const toast = (
    <AnimatePresence custom={custom} onExitComplete={() => onClose?.(reasonRef.current)}>
      {visible && (
        <motion.div
          ref={ref}
          key="fuse-toast"
          data-slot="fuse-toast"
          data-state="open"
          role="status"
          aria-live="polite"
          custom={custom}
          variants={toastVariants}
          initial="hidden"
          animate="shown"
          exit="gone"
          transition={{ duration: slideMs / 1000, ease: "easeOut" }}
          className={cn(
            "touch-pan-y select-none",
            inline ? "relative w-full" : "fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm",
            className
          )}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            swipe.handlers.onPointerDown(event);
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            swipe.handlers.onPointerMove(event);
          }}
          onPointerUp={(event) => {
            onPointerUp?.(event);
            swipe.handlers.onPointerUp(event);
          }}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            // Hover emulado por toque não pausa o pavio.
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (event.pointerType === "mouse") setHovered(false);
          }}
          {...props}
        >
          <motion.div
            style={{ x: swipe.x, opacity: swipe.opacity }}
            className="relative flex items-center gap-3 overflow-hidden rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg"
          >
            {icon && <span className="shrink-0 [&_svg]:size-5">{icon}</span>}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{title}</p>
              {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
            {actionLabel && (
              <button
                type="button"
                data-slot="fuse-toast-action"
                className="shrink-0 rounded-md bg-foreground px-3 py-1.5 font-medium text-background text-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => {
                  onAction?.();
                  close("action");
                }}
              >
                {actionLabel}
              </button>
            )}
            {closeButton && (
              <button
                type="button"
                aria-label="Fechar"
                data-slot="fuse-toast-close"
                className="shrink-0 rounded-md p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => close("close")}
              >
                <X className="size-4" />
              </button>
            )}
            {fuse !== "none" && durationMs > 0 && <FuseLine remaining={remaining} edge={fuse} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return inline ? toast : createPortal(toast, document.body);
}

FuseToast.displayName = "FuseToast";

export { FuseToast };
