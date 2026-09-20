/**
 * # ToggleGroup Component
 *
 * O componente `ToggleGroup` é usado para agrupar múltiplos toggles em um grupo
 * onde apenas um ou múltiplos podem estar selecionados. É baseado em Radix UI
 * para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Modos**: Suporta single (apenas um selecionado) ou multiple (múltiplos selecionados)
 * - **Variantes**: Herda variantes do Toggle (default, outline)
 * - **Tamanhos**: Herda tamanhos do Toggle (default, sm, lg)
 * - **Espaçamento**: Suporta espaçamento customizado entre itens
 * - **Composição**: ToggleGroup + ToggleGroupItem
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { ToggleGroup, ToggleGroupItem } from "@flowtomic/ui/components/atoms/layout/toggle-group";
 *
 * function MyComponent() {
 *   return (
 *     <ToggleGroup type="single">
 *       <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
 *       <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
 *     </ToggleGroup>
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
 * @see [Radix UI Toggle Group](https://www.radix-ui.com/primitives/docs/components/toggle-group) para mais detalhes
 * @see [Toggle Component](../forms/toggle/toggle.tsx) para mais detalhes sobre variantes e tamanhos
 */

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "../../forms/toggle/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

/**
 * Props do componente ToggleGroup.
 *
 * @property {'single' | 'multiple'} type - Tipo de seleção (single ou multiple)
 * @property {'default' | 'outline'} [variant='default'] - Variante visual do toggle group
 * @property {'default' | 'sm' | 'lg'} [size='default'] - Tamanho do toggle group
 * @property {number} [spacing=0] - Espaçamento entre itens em pixels
 */
export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** Espaçamento entre itens em pixels */
    spacing?: number;
    className?: string;
    children?: React.ReactNode;
  };

/**
 * ToggleGroup - Container principal do toggle group.
 *
 * Componente usado para agrupar múltiplos toggles.
 *
 * @param {ToggleGroupProps} props - Props do componente
 * @returns {JSX.Element} Componente ToggleGroup
 */
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

ToggleGroup.displayName = "ToggleGroup";

/**
 * Props do componente ToggleGroupItem.
 *
 * @property {string} value - Valor único do item
 * @property {'default' | 'outline'} [variant] - Variante visual (herda do ToggleGroup se não fornecido)
 * @property {'default' | 'sm' | 'lg'} [size] - Tamanho (herda do ToggleGroup se não fornecido)
 */
export interface ToggleGroupItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {}

/**
 * ToggleGroupItem - Item individual do toggle group.
 *
 * Componente usado para representar um item no toggle group.
 *
 * @param {ToggleGroupItemProps} props - Props do componente
 * @returns {JSX.Element} Componente ToggleGroupItem
 */
function ToggleGroupItem({ className, children, variant, size, ...props }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
