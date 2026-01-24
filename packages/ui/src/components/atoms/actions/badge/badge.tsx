/**
 * # Badge Component
 *
 * O componente `Badge` é um elemento visual usado para destacar informações concisas como status,
 * métricas, contadores ou rótulos. Ele fornece uma forma consistente de exibir informações
 * secundárias de forma não intrusiva.
 *
 * ## Características Principais
 *
 * - **Variantes Semânticas**: Suporta múltiplas variantes (default, secondary, destructive, outline, success, warning, info)
 * - **Tamanhos Flexíveis**: Três tamanhos disponíveis (sm, md, lg)
 * - **Não Interativo**: Badge é puramente visual, não possui interação por padrão
 * - **Acessível**: Suporta foco via teclado quando necessário
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Variantes
 *
 * - **`default`**: Variante primária com cor de tema
 * - **`secondary`**: Variante secundária com cor neutra
 * - **`destructive`**: Variante para ações destrutivas ou erros
 * - **`outline`**: Variante com borda e fundo transparente
 * - **`success`**: Variante para sucesso ou confirmação (verde)
 * - **`warning`**: Variante para avisos (amarelo)
 * - **`info`**: Variante para informações (azul)
 *
 * ## Tamanhos
 *
 * - **`sm`**: Tamanho pequeno (px-2 py-0.5 text-xs)
 * - **`md`**: Tamanho médio (px-2.5 py-0.5 text-xs) - padrão
 * - **`lg`**: Tamanho grande (px-3 py-1 text-sm)
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Badge } from "@flowtomic/ui/components/atoms/actions/badge";
 *
 * function MyComponent() {
 *   return (
 *     <div>
 *       <Badge>Novo</Badge>
 *       <Badge variant="success">Ativo</Badge>
 *       <Badge variant="destructive" size="sm">Erro</Badge>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Casos de Uso
 *
 * - **Status**: Exibir status de itens (ativo, inativo, pendente)
 * - **Contadores**: Mostrar contadores ou números (notificações, itens)
 * - **Métricas**: Exibir métricas com ícones (tendências, percentuais)
 * - **Rótulos**: Rotular categorias ou tags
 *
 * ## Acessibilidade
 *
 * - Badge é renderizado como `<div>`, não possui role semântico por padrão
 * - Para uso em contexto interativo, considere usar `Button` com variante apropriada
 * - Suporta foco via teclado quando necessário (via tabIndex)
 * - Use `aria-label` ou `aria-labelledby` quando o conteúdo não for auto-descritivo
 *
 * @see [Button Component](../button/button.tsx) para versão interativa
 */

import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Variantes de estilo do Badge usando class-variance-authority.
 * Define as classes CSS para diferentes variantes e tamanhos.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground hover:bg-accent/10",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Props do componente Badge.
 *
 * @interface BadgeProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @extends {VariantProps<typeof badgeVariants>}
 *
 * @property {React.ReactNode} children - Conteúdo do badge (texto, ícones, etc.)
 * @property {'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'} variant - Variante visual do badge
 * @property {'sm' | 'md' | 'lg'} size - Tamanho do badge
 * @property {string} className - Classes CSS adicionais
 */
export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	/** Conteúdo do badge (texto, ícones, etc.) */
	children: React.ReactNode;
}

/**
 * Componente Badge para destacar informações concisas.
 *
 * @component
 * @param {BadgeProps} props - Props do componente
 * @returns {JSX.Element} Elemento Badge renderizado
 *
 * @example
 * ```tsx
 * <Badge variant="success">Ativo</Badge>
 * <Badge variant="destructive" size="sm">Erro</Badge>
 * <Badge variant="info">
 *   <Icon /> 5
 * </Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	({ className, variant, size, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(badgeVariants({ variant, size }), className)}
				{...props}
			>
				{children}
			</div>
		);
	}
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
