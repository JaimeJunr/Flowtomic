/**
 * # Checkbox Component
 *
 * O componente `Checkbox` é um controle de seleção usado para permitir que o usuário selecione
 * uma ou mais opções de um conjunto. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Estados Visuais**: Suporta estados checked, unchecked e disabled
 * - **Indicador Visual**: Exibe ícone de check quando selecionado
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Checkbox } from "@flowtomic/ui/components/atoms/forms/checkbox";
 *
 * function MyComponent() {
 *   const [checked, setChecked] = React.useState(false);
 *
 *   return (
 *     <Checkbox
 *       checked={checked}
 *       onCheckedChange={setChecked}
 *     />
 *   );
 * }
 * ```
 *
 * ## Com Label
 *
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms">Aceito os termos</label>
 * </div>
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Espaço)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) para mais detalhes
 */

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Checkbox.
 * @see CheckboxPrimitive.Root para props disponíveis (checked, onCheckedChange, disabled, etc.)
 */
export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/**
 * Componente Checkbox para seleção de opções.
 *
 * @component
 * @param {CheckboxProps} props - Props do componente
 * @returns {JSX.Element} Elemento Checkbox renderizado
 *
 * @example
 * ```tsx
 * <Checkbox checked={checked} onCheckedChange={setChecked} />
 * <Checkbox defaultChecked />
 * <Checkbox disabled />
 * ```
 */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
