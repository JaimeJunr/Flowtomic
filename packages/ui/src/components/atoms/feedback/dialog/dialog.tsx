/**
 * # Dialog Component
 *
 * O componente `Dialog` é usado para exibir conteúdo em uma modal overlay.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 * - **Overlay**: Overlay escuro por padrão
 * - **Fechamento**: Suporta fechamento via Escape, clique no overlay ou botão de fechar
 *
 * ## Componentes
 *
 * - **Dialog**: Container principal
 * - **DialogTrigger**: Trigger para abrir o dialog
 * - **DialogContent**: Conteúdo do dialog
 * - **DialogHeader**: Cabeçalho do dialog (título e descrição)
 * - **DialogFooter**: Rodapé do dialog (botões de ação)
 * - **DialogTitle**: Título do dialog
 * - **DialogDescription**: Descrição do dialog
 * - **DialogClose**: Botão de fechar
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@flowtomic/ui/components/atoms/feedback/dialog";
 *
 * function MyComponent() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Open Dialog</DialogTrigger>
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>Title</DialogTitle>
 *         </DialogHeader>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Escape)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 * - Foco retorna ao trigger quando fechado
 *
 * @see [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) para mais detalhes
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type DialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;
export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

/**
 * Dialog - Container principal do dialog.
 *
 * Componente usado para gerenciar o estado do dialog.
 */
const Dialog = DialogPrimitive.Root;
Dialog.displayName = "Dialog";

/**
 * DialogTrigger - Trigger do dialog.
 *
 * Componente usado como trigger para abrir o dialog.
 */
const DialogTrigger = DialogPrimitive.Trigger;
DialogTrigger.displayName = "DialogTrigger";

/**
 * DialogPortal - Portal do dialog.
 *
 * Componente usado para renderizar o dialog em um portal.
 */
const DialogPortal = DialogPrimitive.Portal;
DialogPortal.displayName = "DialogPortal";

/**
 * DialogClose - Botão de fechar do dialog.
 *
 * Componente usado para fechar o dialog.
 */
const DialogClose = DialogPrimitive.Close;
DialogClose.displayName = "DialogClose";

/**
 * DialogOverlay - Overlay do dialog.
 *
 * Componente usado para exibir o overlay escuro atrás do dialog.
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * DialogContent - Conteúdo do dialog
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

/**
 * DialogHeader - Cabeçalho do dialog
 */
const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

/**
 * DialogFooter - Rodapé do dialog
 */
const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

/**
 * DialogTitle - Título do dialog
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * DialogDescription - Descrição do dialog
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
