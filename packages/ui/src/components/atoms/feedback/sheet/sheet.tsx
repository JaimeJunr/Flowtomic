/**
 * # Sheet Component
 *
 * O componente `Sheet` é usado para exibir conteúdo em um painel lateral deslizante.
 * É baseado em Radix UI Dialog para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI Dialog com suporte completo a leitores de tela
 * - **Lados**: Suporta abertura de qualquer lado (top, right, bottom, left)
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 * - **Overlay**: Overlay escuro por padrão
 *
 * ## Componentes
 *
 * - **Sheet**: Container principal
 * - **SheetTrigger**: Trigger para abrir o sheet
 * - **SheetContent**: Conteúdo do sheet
 * - **SheetHeader**: Cabeçalho do sheet
 * - **SheetFooter**: Rodapé do sheet
 * - **SheetTitle**: Título do sheet
 * - **SheetDescription**: Descrição do sheet
 * - **SheetClose**: Botão de fechar
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@flowtomic/ui/components/atoms/feedback/sheet";
 *
 * function MyComponent() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Open Sheet</SheetTrigger>
 *       <SheetContent>
 *         <SheetHeader>
 *           <SheetTitle>Sheet Title</SheetTitle>
 *         </SheetHeader>
 *       </SheetContent>
 *     </Sheet>
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

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Sheet.
 */
export interface SheetProps extends React.ComponentProps<typeof SheetPrimitive.Root> {}

/**
 * Sheet - Container principal do sheet.
 *
 * Componente usado para gerenciar o estado do sheet.
 *
 * @param {SheetProps} props - Props do componente
 * @returns {JSX.Element} Componente Sheet
 */
function Sheet({ ...props }: SheetProps) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

Sheet.displayName = "Sheet";

/**
 * Props do componente SheetTrigger.
 */
export interface SheetTriggerProps extends React.ComponentProps<typeof SheetPrimitive.Trigger> {}

/**
 * SheetTrigger - Trigger do sheet.
 *
 * Componente usado como trigger para abrir o sheet.
 *
 * @param {SheetTriggerProps} props - Props do componente
 * @returns {JSX.Element} Componente SheetTrigger
 */
function SheetTrigger({ ...props }: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

SheetTrigger.displayName = "SheetTrigger";

export interface SheetCloseProps extends React.ComponentProps<typeof SheetPrimitive.Close> {}

function SheetClose({ ...props }: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

SheetClose.displayName = "SheetClose";

export interface SheetPortalProps extends React.ComponentProps<typeof SheetPrimitive.Portal> {}

function SheetPortal({ ...props }: SheetPortalProps) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

SheetPortal.displayName = "SheetPortal";

export interface SheetOverlayProps extends React.ComponentProps<typeof SheetPrimitive.Overlay> {}

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

SheetOverlay.displayName = "SheetOverlay";

/**
 * Props do componente SheetContent.
 *
 * @property {'top' | 'right' | 'bottom' | 'left'} [side='right'] - Lado de onde o sheet abre
 */
export interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  /** Lado de onde o sheet abre */
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * SheetContent - Conteúdo do sheet.
 *
 * Componente usado para exibir o conteúdo do sheet.
 *
 * @param {SheetContentProps} props - Props do componente
 * @returns {JSX.Element} Componente SheetContent
 */
function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

SheetContent.displayName = "SheetContent";

export interface SheetHeaderProps extends React.ComponentProps<"div"> {}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

SheetHeader.displayName = "SheetHeader";

export interface SheetFooterProps extends React.ComponentProps<"div"> {}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

SheetFooter.displayName = "SheetFooter";

export interface SheetTitleProps extends React.ComponentProps<typeof SheetPrimitive.Title> {}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

SheetTitle.displayName = "SheetTitle";

export interface SheetDescriptionProps
  extends React.ComponentProps<typeof SheetPrimitive.Description> {}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
