/**
 * # Toggle Component
 *
 * O componente `Toggle` é um botão de alternância usado para ativar ou desativar
 * uma opção. Diferente do Switch, o Toggle mantém estado visual quando pressionado.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Estados Visuais**: Suporta estados on, off e disabled
 * - **Variantes**: Suporta default e outline
 * - **Tamanhos**: Suporta default, sm e lg
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Variantes
 *
 * - **`default`**: Variante padrão sem borda
 * - **`outline`**: Variante com borda
 *
 * ## Tamanhos
 *
 * - **`default`**: Tamanho padrão (h-9)
 * - **`sm`**: Tamanho pequeno (h-8)
 * - **`lg`**: Tamanho grande (h-10)
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Toggle } from "@flowtomic/ui/components/atoms/forms/toggle";
 *
 * function MyComponent() {
 *   const [pressed, setPressed] = React.useState(false);
 *
 *   return (
 *     <Toggle
 *       pressed={pressed}
 *       onPressedChange={setPressed}
 *     >
 *       Toggle
 *     </Toggle>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Espaço, Enter)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Toggle](https://www.radix-ui.com/primitives/docs/components/toggle) para mais detalhes
 * @see [Switch Component](../switch/switch.tsx) para alternativa com estado visual diferente
 */

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Variantes de estilo do Toggle usando class-variance-authority.
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Props do componente Toggle.
 *
 * @property {'default' | 'outline'} [variant='default'] - Variante visual do toggle
 * @property {'default' | 'sm' | 'lg'} [size='default'] - Tamanho do toggle
 */
export interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
