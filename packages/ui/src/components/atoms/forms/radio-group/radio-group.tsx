/**
 * # RadioGroup Component
 *
 * O componente `RadioGroup` é um grupo de botões de opção usado para permitir que o usuário
 * selecione uma opção de um conjunto. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Seleção Única**: Apenas uma opção pode ser selecionada por vez
 * - **Composição**: RadioGroup + RadioGroupItem para flexibilidade
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { RadioGroup, RadioGroupItem } from "@flowtomic/ui/components/atoms/forms/radio-group";
 *
 * function MyComponent() {
 *   return (
 *     <RadioGroup defaultValue="option1">
 *       <div className="flex items-center gap-2">
 *         <RadioGroupItem value="option1" id="option1" />
 *         <label htmlFor="option1">Opção 1</label>
 *       </div>
 *       <div className="flex items-center gap-2">
 *         <RadioGroupItem value="option2" id="option2" />
 *         <label htmlFor="option2">Opção 2</label>
 *       </div>
 *     </RadioGroup>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (setas, Tab)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group) para mais detalhes
 */

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente RadioGroup.
 * @see RadioGroupPrimitive.Root para props disponíveis (value, onValueChange, defaultValue, etc.)
 */
export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {}

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {}

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
