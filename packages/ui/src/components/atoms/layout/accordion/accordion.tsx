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
 * @see [Radix UI Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) para mais detalhes
 */
function Accordion(props: AccordionProps) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

Accordion.displayName = "Accordion";

/**
 * Props do componente AccordionItem.
 */
export interface AccordionItemProps extends React.ComponentProps<typeof AccordionPrimitive.Item> {}

/** AccordionItem - Item individual do accordion. */
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

/** AccordionTrigger - Trigger do accordion item. */
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

/** AccordionContent - Conteúdo do accordion item. */
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
