/**
 * # Textarea Component
 *
 * O componente `Textarea` é um campo de entrada de texto multilinha usado para coletar
 * textos mais longos do usuário. Fornece uma interface consistente e acessível para
 * entrada de texto multilinha.
 *
 * ## Características Principais
 *
 * - **Multilinha**: Suporta entrada de texto em múltiplas linhas
 * - **Auto-resize**: Suporta redimensionamento automático via CSS (field-sizing-content)
 * - **Acessível**: Suporta labels associados e navegação por teclado
 * - **Validação Visual**: Suporta estados de erro via aria-invalid
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Textarea } from "@flowtomic/ui/components/atoms/forms/textarea";
 *
 * function MyComponent() {
 *   return (
 *     <Textarea
 *       placeholder="Digite sua mensagem..."
 *       rows={4}
 *     />
 *   );
 * }
 * ```
 *
 * ## Com Validação
 *
 * ```tsx
 * <Textarea
 *   placeholder="Mensagem"
 *   aria-invalid="true"
 *   aria-describedby="error-message"
 * />
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta labels associados via htmlFor/id
 * - Suporta aria-invalid para estados de erro
 * - Suporta aria-describedby para mensagens de erro
 * - Suporta navegação por teclado
 *
 * @see [Input Component](../input/input.tsx) para campo de entrada de linha única
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Textarea.
 * Estende todas as props HTML padrão de textarea.
 */
export interface TextareaProps extends React.ComponentProps<"textarea"> {}

/**
 * Componente Textarea para entrada de texto multilinha.
 *
 * @component
 * @param {TextareaProps} props - Props do componente
 * @returns {JSX.Element} Elemento Textarea renderizado
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Digite sua mensagem..." rows={4} />
 * <Textarea aria-invalid="true" aria-describedby="error" />
 * ```
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

Textarea.displayName = "Textarea";

export { Textarea };
