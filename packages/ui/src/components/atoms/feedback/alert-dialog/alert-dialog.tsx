import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../../actions/button/button";
import { Animated3D } from "../../animation/animated-3d";
import { BackdropBlur } from "../../animation/backdrop-blur";

export type AlertDialogProps = React.ComponentProps<typeof AlertDialogPrimitive.Root>;
export type AlertDialogTriggerProps = React.ComponentProps<typeof AlertDialogPrimitive.Trigger>;

/**
 * Variantes de animação para AlertDialogContent
 */
const alertDialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background text-foreground p-6 shadow-lg dark:shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:opacity-100! sm:rounded-lg",
  {
    variants: {
      animation: {
        depth:
          "data-[state=closed]:zoom-out-75 data-[state=open]:zoom-in-95 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        bottom:
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        top: "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        left: "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        right:
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%]",
        center: "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "3d": "", // Animações 3D são aplicadas via Framer Motion
      },
    },
    defaultVariants: {
      animation: "depth",
    },
  }
);

export type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> &
  VariantProps<typeof alertDialogContentVariants> & {
    /**
     * Habilita backdrop blur (apenas para animation="3d")
     */
    backdropBlur?: boolean;
    /**
     * Mostra botão de fechar no canto superior direito (apenas para animation="3d")
     */
    showCloseButton?: boolean;
  };

export type AlertDialogHeaderProps = React.ComponentProps<"div">;
export type AlertDialogFooterProps = React.ComponentProps<"div">;
export type AlertDialogTitleProps = React.ComponentProps<typeof AlertDialogPrimitive.Title>;
export type AlertDialogDescriptionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Description
>;
export type AlertDialogActionProps = React.ComponentProps<typeof AlertDialogPrimitive.Action>;
export type AlertDialogCancelProps = React.ComponentProps<typeof AlertDialogPrimitive.Cancel>;

/**
 * AlertDialog - Container principal do alert dialog
 */
function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}
AlertDialog.displayName = "AlertDialog";

/**
 * AlertDialogTrigger - Trigger do alert dialog
 */
function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}
AlertDialogTrigger.displayName = "AlertDialogTrigger";

/**
 * AlertDialogPortal - Portal do alert dialog
 */
function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}
AlertDialogPortal.displayName = "AlertDialogPortal";

/**
 * AlertDialogOverlay - Overlay do alert dialog
 * Suporta backdrop blur quando animation="3d"
 */
function AlertDialogOverlay({
  className,
  backdropBlur = false,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay> & {
  backdropBlur?: boolean;
}) {
  const isOpen = (props as { "data-state"?: string })["data-state"] === "open";

  // Se backdropBlur estiver ativado, use componente BackdropBlur
  if (backdropBlur) {
    return (
      <>
        <BackdropBlur isOpen={isOpen} />
        <AlertDialogPrimitive.Overlay
          data-slot="alert-dialog-overlay"
          className={cn("fixed inset-0 z-50 bg-black/80 dark:bg-black/90", className)}
          {...props}
        />
      </>
    );
  }

  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 dark:bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:opacity-100!",
        className
      )}
      {...props}
    />
  );
}
AlertDialogOverlay.displayName = "AlertDialogOverlay";

/**
 * AlertDialogContent - Conteúdo do alert dialog
 * Suporta animações 3D quando animation="3d"
 */
function AlertDialogContent({
  className,
  animation,
  backdropBlur = false,
  showCloseButton = false,
  children,
  ref,
  ...props
}: AlertDialogContentProps) {
  const is3D = animation === "3d";
  const isOpen = (props as { "data-state"?: string })["data-state"] === "open";

  const content = (
    <AlertDialogPrimitive.Content
      data-slot="alert-dialog-content"
      ref={ref}
      className={cn(
        alertDialogContentVariants({ animation }),
        is3D && "opacity-0", // Desabilita animações CSS para 3D - Framer Motion controla
        className
      )}
      {...props}
    >
      {showCloseButton && is3D && (
        <AlertDialogPrimitive.Cancel asChild>
          <button
            data-slot="alert-dialog-close"
            type="button"
            className="absolute top-4 right-4 group z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-foreground group-hover:scale-125 group-hover:rotate-3 transition duration-200" />
            <span className="sr-only">Fechar</span>
          </button>
        </AlertDialogPrimitive.Cancel>
      )}
      {children}
    </AlertDialogPrimitive.Content>
  );

  // Se for animação 3D, use componente Animated3D
  if (is3D) {
    return (
      <AlertDialogPortal>
        <AlertDialogOverlay backdropBlur={backdropBlur} {...props} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <Animated3D isOpen={isOpen} className="w-full max-w-lg pointer-events-auto">
            {content}
          </Animated3D>
        </div>
      </AlertDialogPortal>
    );
  }

  // Animação padrão (CSS-based)
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay backdropBlur={backdropBlur} {...props} />
      {content}
    </AlertDialogPortal>
  );
}
AlertDialogContent.displayName = "AlertDialogContent";

/**
 * AlertDialogHeader - Cabeçalho do alert dialog
 */
const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => (
  <div
    data-slot="alert-dialog-header"
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

/**
 * AlertDialogFooter - Rodapé do alert dialog
 */
const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => (
  <div
    data-slot="alert-dialog-footer"
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

/**
 * AlertDialogTitle - Título do alert dialog
 */
function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}
AlertDialogTitle.displayName = "AlertDialogTitle";

/**
 * AlertDialogDescription - Descrição do alert dialog
 */
function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
AlertDialogDescription.displayName = "AlertDialogDescription";

/**
 * AlertDialogAction - Botão de ação do alert dialog
 */
function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}
AlertDialogAction.displayName = "AlertDialogAction";

/**
 * AlertDialogCancel - Botão de cancelar do alert dialog
 */
function AlertDialogCancel({ className, ...props }: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
      {...props}
    />
  );
}
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  alertDialogContentVariants,
};
