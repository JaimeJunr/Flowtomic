/**
 * AnimatedModal Component - Flowtomic UI
 *
 * Modal animado com perspectiva 3D e backdrop blur
 * Usa Framer Motion (via motion/react) para animações suaves
 * Componente Molecule que combina múltiplos atoms para criar experiência de modal premium
 */

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, MotionConfigContext, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Context
// ============================================================================

interface ModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined);

function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal");
  }
  return context;
}

// ============================================================================
// Types
// ============================================================================

export interface ModalProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ModalTriggerProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
}

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

// ============================================================================
// Components
// ============================================================================

/**
 * Modal - Container principal do modal
 */
function Modal({ children, defaultOpen = false, open: controlledOpen, onOpenChange }: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}

/**
 * ModalTrigger - Botão que abre o modal
 */
function ModalTrigger({ children, className, asChild, ...props }: ModalTriggerProps) {
  useModal();

  if (asChild && React.isValidElement(children)) {
    return (
      <DialogPrimitive.Trigger data-slot="modal-trigger" asChild className={className} {...props}>
        {children}
      </DialogPrimitive.Trigger>
    );
  }

  return (
    <DialogPrimitive.Trigger
      data-slot="modal-trigger"
      type="button"
      className={cn(className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}
ModalTrigger.displayName = "ModalTrigger";

/**
 * ModalBody - Container do modal com backdrop e animações
 */
function ModalBody({
  children,
  className,
  closeOnOutsideClick = true,
  showCloseButton = true,
}: ModalBodyProps) {
  const { open, setOpen } = useModal();
  const reducedMotion = React.useContext(MotionConfigContext).reducedMotion;
  const shouldReduceMotion = useReducedMotion() || reducedMotion === "always";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            <ModalOverlay />
            <motion.div
              data-slot="modal-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
              style={{ pointerEvents: "auto" }}
              onClick={handleBackdropClick}
            >
              <DialogPrimitive.Content
                asChild
                forceMount
                aria-modal="true"
                aria-describedby={undefined}
                onInteractOutside={(event) => event.preventDefault()}
              >
                <motion.div
                  initial={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotateX: 15 }
                  }
                  animate={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateX: 0 }
                  }
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotateX: 15 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                  className="relative w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogPrimitive.Title className="sr-only">Modal</DialogPrimitive.Title>
                  {showCloseButton && <CloseIcon />}
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}

/**
 * ModalContent - Conteúdo principal do modal
 */
function ModalContent({ children, className, maxHeight = "80vh" }: ModalContentProps) {
  return (
    <div
      data-slot="modal-content"
      className={cn(
        "relative w-full rounded-lg border bg-background p-6 shadow-lg",
        "overflow-y-auto",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}

/**
 * ModalFooter - Rodapé do modal para ações
 */
function ModalFooter({ children, className, align = "right" }: ModalFooterProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      data-slot="modal-footer"
      className={cn("flex items-center gap-2 mt-6", alignClasses[align], className)}
    >
      {children}
    </div>
  );
}

/**
 * ModalOverlay - Overlay com backdrop blur
 */
function ModalOverlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay asChild forceMount>
      <motion.div
        data-slot="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className={cn("fixed inset-0 h-full w-full bg-black/50 z-40", className)}
      />
    </DialogPrimitive.Overlay>
  );
}

/**
 * CloseIcon - Botão de fechar
 */
function CloseIcon() {
  const { setOpen } = useModal();
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="absolute top-4 right-4 group z-50"
      aria-label="Fechar modal"
    >
      <X className="h-4 w-4 text-foreground group-hover:scale-125 group-hover:rotate-3 transition duration-200" />
    </button>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter };
