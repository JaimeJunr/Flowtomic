/**
 * # DropdownMenu Component
 *
 * O componente `DropdownMenu` fornece um menu contextual leve com foco em acessibilidade via Radix UI primitives.
 * É útil para ações secundárias agrupadas em um trigger discreto (texto ou ícone).
 *
 * ## Características Principais
 *
 * - **Trigger Flexível**: Suporta qualquer elemento como trigger (Button, ícone, texto)
 * - **Acessível**: Suporta navegação completa por teclado e leitores de tela
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Animações**: Transições suaves de abertura/fechamento
 * - **Baseado em Radix UI**: Usa primitives do Radix UI para acessibilidade
 *
 * ## Componentes
 *
 * - **DropdownMenu**: Container raiz do menu
 * - **DropdownMenuTrigger**: Elemento que dispara o menu (clique ou teclado)
 * - **DropdownMenuContent**: Conteúdo do menu
 * - **DropdownMenuItem**: Item individual do menu
 * - **DropdownMenuLabel**: Label/separador de seção
 * - **DropdownMenuSeparator**: Separador visual
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@flowtomic/ui/components/atoms/actions/dropdown-menu";
 * import { Button } from "@flowtomic/ui/components/atoms/actions/button";
 *
 * function MyComponent() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild>
 *         <Button>Abrir Menu</Button>
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem>Item 1</DropdownMenuItem>
 *         <DropdownMenuItem>Item 2</DropdownMenuItem>
 *         <DropdownMenuItem>Item 3</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Enter, Espaço, setas, Esc)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Foco gerenciado automaticamente
 * - Suporta leitores de tela
 *
 * @see [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) para mais detalhes
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { cn } from "@/lib/utils";

export type DropdownMenuProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>;
export type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Trigger
>;
export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;
export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
>;
export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
>;
export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

/**
 * DropdownMenu - Container principal do dropdown menu
 */
const DropdownMenu = DropdownMenuPrimitive.Root;
DropdownMenu.displayName = "DropdownMenu";

/**
 * DropdownMenuTrigger - Trigger do dropdown menu
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

/**
 * DropdownMenuContent - Conteúdo do dropdown menu
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

/**
 * DropdownMenuItem - Item do dropdown menu
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

/**
 * DropdownMenuLabel - Label do dropdown menu
 */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
});
DropdownMenuLabel.displayName = "DropdownMenuLabel";

/**
 * DropdownMenuSeparator - Separador do dropdown menu
 */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
});
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
