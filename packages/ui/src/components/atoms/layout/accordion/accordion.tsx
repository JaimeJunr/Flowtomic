/**
 * # Accordion Component
 *
 * O componente `Accordion` é usado para exibir conteúdo colapsável em seções.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Modos**: Suporta single (apenas um item aberto) ou multiple (múltiplos itens abertos)
 * - **Composição**: Accordion + AccordionItem + AccordionTrigger + AccordionContent
 * - **Animações**: Animações suaves de abertura/fechamento
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@flowtomic/ui/components/atoms/layout/accordion";
 *
 * function MyComponent() {
 *   return (
 *     <Accordion type="single" collapsible>
 *       <AccordionItem value="item-1">
 *         <AccordionTrigger>Item 1</AccordionTrigger>
 *         <AccordionContent>Conteúdo do item 1</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Enter, Espaço, setas)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) para mais detalhes
 */

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Accordion.
 */
export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

/**
 * Accordion - Container principal do accordion.
 *
 * Componente usado para gerenciar o estado do accordion.
 *
 * @param {AccordionProps} props - Props do componente
 * @returns {JSX.Element} Componente Accordion
 */
function Accordion(props: AccordionProps) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

Accordion.displayName = "Accordion";

/**
 * Props do componente AccordionItem.
 */
export interface AccordionItemProps extends React.ComponentProps<typeof AccordionPrimitive.Item> {}

/**
 * AccordionItem - Item individual do accordion.
 *
 * Componente usado para agrupar trigger e content de um item.
 *
 * @param {AccordionItemProps} props - Props do componente
 * @returns {JSX.Element} Componente AccordionItem
 */
function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

AccordionItem.displayName = "AccordionItem";

/**
 * Props do componente AccordionTrigger.
 */
export interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {}

/**
 * AccordionTrigger - Trigger do accordion item.
 *
 * Componente usado como trigger para abrir/fechar o item.
 *
 * @param {AccordionTriggerProps} props - Props do componente
 * @returns {JSX.Element} Componente AccordionTrigger
 */
function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

AccordionTrigger.displayName = "AccordionTrigger";

/**
 * Props do componente AccordionContent.
 */
export interface AccordionContentProps
  extends React.ComponentProps<typeof AccordionPrimitive.Content> {}

/**
 * AccordionContent - Conteúdo do accordion item.
 *
 * Componente usado para exibir o conteúdo do item quando aberto.
 *
 * @param {AccordionContentProps} props - Props do componente
 * @returns {JSX.Element} Componente AccordionContent
 */
function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
