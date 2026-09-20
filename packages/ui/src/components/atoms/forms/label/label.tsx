/**
 * # Label Component
 *
 * O componente `Label` é usado para associar texto descritivo a controles de formulário.
 * É baseado em Radix UI para garantir acessibilidade completa e associação correta com inputs.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Associação Automática**: Associa-se automaticamente a controles via htmlFor/id
 * - **Estados Visuais**: Responde a estados disabled dos controles associados
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Label } from "@flowtomic/ui/components/atoms/forms/label";
 * import { Input } from "@flowtomic/ui/components/atoms/forms/input";
 *
 * function MyComponent() {
 *   return (
 *     <div>
 *       <Label htmlFor="email">E-mail</Label>
 *       <Input id="email" type="email" />
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Associa-se automaticamente a controles via htmlFor/id
 * - Suporta leitores de tela
 * - Responde visualmente a estados disabled dos controles
 *
 * @see [Radix UI Label](https://www.radix-ui.com/primitives/docs/components/label) para mais detalhes
 */

import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Label.
 * @see LabelPrimitive.Root para props disponíveis (htmlFor, etc.)
 */
export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {}

/**
 * Componente Label para associar texto a controles de formulário.
 *
 * @component
 * @param {LabelProps} props - Props do componente
 * @returns {JSX.Element} Elemento Label renderizado
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">E-mail</Label>
 * <Input id="email" type="email" />
 * ```
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

Label.displayName = "Label";

export { Label };
