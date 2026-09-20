/**
 * # Popover Component
 *
 * O componente `Popover` é usado para exibir conteúdo flutuante que aparece
 * quando o usuário clica em um trigger. É baseado em Radix UI para garantir
 * acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Posicionamento**: Suporta alinhamento e offset customizáveis
 * - **Composição**: Popover + PopoverTrigger + PopoverContent para flexibilidade
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Popover, PopoverTrigger, PopoverContent } from "@flowtomic/ui/components/atoms/feedback/popover";
 *
 * function MyComponent() {
 *   return (
 *     <Popover>
 *       <PopoverTrigger>Open</PopoverTrigger>
 *       <PopoverContent>
 *         <p>Conteúdo do popover</p>
 *       </PopoverContent>
 *     </Popover>
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
 *
 * @see [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover) para mais detalhes
 */

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Popover.
 */
export interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {}

/**
 * Popover - Container principal do popover.
 *
 * Componente usado para exibir conteúdo flutuante quando o usuário clica em um trigger.
 *
 * @param {PopoverProps} props - Props do componente
 * @returns {JSX.Element} Componente Popover
 */
function Popover({ ...props }: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

Popover.displayName = "Popover";

/**
 * Props do componente PopoverTrigger.
 */
export interface PopoverTriggerProps
  extends React.ComponentProps<typeof PopoverPrimitive.Trigger> {}

/**
 * PopoverTrigger - Trigger do popover.
 *
 * Componente usado como trigger para abrir o popover.
 *
 * @param {PopoverTriggerProps} props - Props do componente
 * @returns {JSX.Element} Componente PopoverTrigger
 */
function PopoverTrigger({ ...props }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

PopoverTrigger.displayName = "PopoverTrigger";

/**
 * Props do componente PopoverContent.
 *
 * @property {'start' | 'center' | 'end'} [align='center'] - Alinhamento do popover
 * @property {number} [sideOffset=4] - Offset em pixels do lado do popover
 */
export interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  /** Alinhamento do popover */
  align?: "start" | "center" | "end";
  /** Offset em pixels do lado do popover */
  sideOffset?: number;
}

/**
 * PopoverContent - Conteúdo do popover.
 *
 * Componente usado para exibir o conteúdo do popover.
 *
 * @param {PopoverContentProps} props - Props do componente
 * @returns {JSX.Element} Componente PopoverContent
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

PopoverContent.displayName = "PopoverContent";

export interface PopoverAnchorProps extends React.ComponentProps<typeof PopoverPrimitive.Anchor> {}

function PopoverAnchor({ ...props }: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
