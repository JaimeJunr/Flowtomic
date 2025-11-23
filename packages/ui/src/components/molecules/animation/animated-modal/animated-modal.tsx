/**
 * AnimatedModal Component - Flowtomic UI
 *
 * Modal animado com perspectiva 3D e backdrop blur
 * Usa Framer Motion (via motion/react) para animações suaves
 * Componente Molecule que combina múltiplos atoms para criar experiência de modal premium
 */

"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
}

/**
 * ModalTrigger - Botão que abre o modal
 */
const ModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    const { setOpen } = useModal();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          if (props.onClick) {
            props.onClick(e as React.MouseEvent<HTMLButtonElement>);
          }
          setOpen(true);
        },
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(className)}
        onClick={() => setOpen(true)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <ModalOverlay />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
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
              {showCloseButton && <CloseIcon />}
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * ModalContent - Conteúdo principal do modal
 */
function ModalContent({ children, className, maxHeight = "80vh" }: ModalContentProps) {
  return (
    <div
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
    <div className={cn("flex items-center gap-2 mt-6", alignClasses[align], className)}>
      {children}
    </div>
  );
}

/**
 * ModalOverlay - Overlay com backdrop blur
 */
function ModalOverlay({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className={cn("fixed inset-0 h-full w-full bg-black/50 z-40", className)}
    />
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
