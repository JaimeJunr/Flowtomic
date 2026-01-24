/**
 * # Input Component
 *
 * O componente `Input` é um campo de entrada de texto usado para coletar dados do usuário.
 * Ele fornece uma interface consistente e acessível para entrada de texto com suporte a
 * labels, mensagens de erro e texto de ajuda.
 *
 * ## Características Principais
 *
 * - **Variantes Visuais**: Suporta variantes (default, error, success) para feedback visual
 * - **Tamanhos Flexíveis**: Três tamanhos disponíveis (default, sm, lg)
 * - **Labels e Helpers**: Suporta label opcional e texto de ajuda
 * - **Validação Visual**: Exibe mensagens de erro com estilo destrutivo
 * - **Acessível**: Suporta labels associados e navegação por teclado
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Variantes
 *
 * - **`default`**: Variante padrão com borda normal
 * - **`error`**: Variante para estados de erro (borda vermelha)
 * - **`success`**: Variante para estados de sucesso (borda verde)
 *
 * ## Tamanhos
 *
 * - **`default`**: Tamanho padrão (h-10)
 * - **`sm`**: Tamanho pequeno (h-9)
 * - **`lg`**: Tamanho grande (h-11)
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Input } from "@flowtomic/ui/components/atoms/forms/input";
 *
 * function MyComponent() {
 *   return (
 *     <Input
 *       label="Nome"
 *       placeholder="Digite seu nome"
 *       helperText="Este campo é obrigatório"
 *     />
 *   );
 * }
 * ```
 *
 * ## Com Validação
 *
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Email inválido"
 *   variant="error"
 * />
 * ```
 *
 * ## Acessibilidade
 *
 * - Label associado automaticamente via htmlFor/id
 * - Suporta aria-* attributes para melhor acessibilidade
 * - Mensagens de erro são exibidas como texto acessível
 * - Suporta navegação por teclado
 *
 * @see [Label Component](../label/label.tsx) para labels customizados
 */

import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Variantes de estilo do Input usando class-variance-authority.
 * Define as classes CSS para diferentes variantes e tamanhos.
 */
const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11",
      },
      variant: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

/**
 * Props do componente Input.
 *
 * @interface InputProps
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">}
 * @extends {VariantProps<typeof inputVariants>}
 *
 * @property {string} [label] - Label opcional exibido acima do input
 * @property {string} [error] - Mensagem de erro exibida abaixo do input
 * @property {string} [helperText] - Texto de ajuda exibido abaixo do input (quando não há erro)
 * @property {'default' | 'error' | 'success'} [variant='default'] - Variante visual do input
 * @property {'default' | 'sm' | 'lg'} [size='default'] - Tamanho do input
 * @property {string} [className] - Classes CSS adicionais
 */
export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {
	/** Label opcional exibido acima do input */
	label?: string;
	/** Mensagem de erro exibida abaixo do input */
	error?: string;
	/** Texto de ajuda exibido abaixo do input (quando não há erro) */
	helperText?: string;
}

/**
 * Componente Input para entrada de texto.
 *
 * @component
 * @param {InputProps} props - Props do componente
 * @returns {JSX.Element} Elemento Input renderizado
 *
 * @example
 * ```tsx
 * <Input label="Nome" placeholder="Digite seu nome" />
 * <Input label="Email" type="email" error="Email inválido" variant="error" />
 * <Input label="Senha" type="password" helperText="Mínimo 8 caracteres" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, size, variant, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ size, variant, className }))}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
