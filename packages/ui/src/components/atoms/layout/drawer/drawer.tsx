/**
 * # Drawer Component
 *
 * O componente `Drawer` é usado para exibir conteúdo em um painel deslizante
 * que aparece da borda da tela. É baseado em Vaul para garantir acessibilidade
 * e gestos de arrastar.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Vaul com suporte completo a leitores de tela
 * - **Direções**: Suporta abertura de qualquer lado (top, bottom, left, right)
 * - **Gestos**: Suporta arrastar para fechar (drag to dismiss)
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Overlay**: Overlay escuro por padrão
 *
 * ## Componentes
 *
 * - **Drawer**: Container principal
 * - **DrawerTrigger**: Trigger para abrir o drawer
 * - **DrawerContent**: Conteúdo do drawer
 * - **DrawerHeader**: Cabeçalho do drawer
 * - **DrawerFooter**: Rodapé do drawer
 * - **DrawerTitle**: Título do drawer
 * - **DrawerDescription**: Descrição do drawer
 * - **DrawerClose**: Botão de fechar
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@flowtomic/ui/components/atoms/layout/drawer";
 *
 * function MyComponent() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open Drawer</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerHeader>
 *           <DrawerTitle>Drawer Title</DrawerTitle>
 *         </DrawerHeader>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Escape)
 * - Segue padrões WAI-ARIA
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 * - Foco retorna ao trigger quando fechado
 *
 * @see [Vaul Documentation](https://vaul.emilkowal.ski/) para mais detalhes
 */

import type * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

export type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

function Drawer(props: DrawerProps) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

Drawer.displayName = "Drawer";

export type DrawerTriggerProps = React.ComponentProps<typeof DrawerPrimitive.Trigger>;

function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

DrawerTrigger.displayName = "DrawerTrigger";

export type DrawerPortalProps = React.ComponentProps<typeof DrawerPrimitive.Portal>;

function DrawerPortal(props: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

DrawerPortal.displayName = "DrawerPortal";

export type DrawerCloseProps = React.ComponentProps<typeof DrawerPrimitive.Close>;

function DrawerClose(props: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

DrawerClose.displayName = "DrawerClose";

export type DrawerOverlayProps = React.ComponentProps<typeof DrawerPrimitive.Overlay>;

function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

DrawerOverlay.displayName = "DrawerOverlay";

export type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content>;

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

DrawerContent.displayName = "DrawerContent";

export interface DrawerHeaderProps extends React.ComponentProps<"div"> {}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  );
}

DrawerHeader.displayName = "DrawerHeader";

export interface DrawerFooterProps extends React.ComponentProps<"div"> {}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

DrawerFooter.displayName = "DrawerFooter";

export type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>;

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

DrawerTitle.displayName = "DrawerTitle";

export type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description>;

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
