/**
 * # Button Component
 *
 * O componente `Button` é um elemento interativo usado para acionar ações ou eventos dentro da interface do usuário.
 * Ele fornece uma forma consistente e acessível de criar botões com múltiplas variantes de estilo e tamanhos.
 *
 * ## Características Principais
 *
 * - **Variantes Semânticas**: Suporta múltiplas variantes (default, destructive, outline, secondary, ghost, link, success, info, natural)
 * - **Tamanhos Flexíveis**: Múltiplos tamanhos incluindo opções para ícones (default, sm, lg, icon, icon-sm, icon-lg)
 * - **Animações Opcionais**: Suporta animações sutis via Framer Motion quando `animated={true}`
 * - **Composição**: Suporta composição via `asChild` usando Radix UI Slot
 * - **Acessível**: Segue padrões WAI-ARIA e suporta navegação por teclado
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Variantes
 *
 * - **`default`**: Variante primária com cor de tema e sombra
 * - **`destructive`**: Variante para ações destrutivas ou perigosas
 * - **`outline`**: Variante com borda e fundo transparente
 * - **`secondary`**: Variante secundária com cor neutra
 * - **`ghost`**: Variante sem fundo, apenas texto
 * - **`link`**: Variante estilizada como link
 * - **`success`**: Variante para ações de sucesso (verde)
 * - **`info`**: Variante para informações (accent)
 * - **`natural`**: Variante com estilo natural e borda
 *
 * ## Tamanhos
 *
 * - **`default`**: Tamanho padrão (h-9 px-4 py-2)
 * - **`sm`**: Tamanho pequeno (h-8 px-3 text-xs)
 * - **`lg`**: Tamanho grande (h-10 px-8)
 * - **`icon`**: Tamanho para ícone (h-9 w-9)
 * - **`icon-sm`**: Tamanho pequeno para ícone (size-8)
 * - **`icon-lg`**: Tamanho grande para ícone (size-10)
 *
 * ## Props Especiais
 *
 * - **`asChild`**: Quando `true`, o Button não renderiza um elemento próprio, mas passa suas props para o primeiro filho usando Radix UI Slot
 * - **`animated`**: Quando `true`, aplica animações sutis de hover e tap via Framer Motion
 * - **`transition`**: Permite customizar a transição de animação quando `animated={true}`
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Button } from "@flowtomic/ui/components/atoms/actions/button";
 *
 * function MyComponent() {
 *   return (
 *     <div>
 *       <Button>Clique aqui</Button>
 *       <Button variant="destructive">Excluir</Button>
 *       <Button variant="outline" size="sm">Cancelar</Button>
 *       <Button animated>Animado</Button>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Composição com asChild
 *
 * ```tsx
 * import { Button } from "@flowtomic/ui/components/atoms/actions/button";
 * import { Link } from "react-router-dom";
 *
 * function MyComponent() {
 *   return (
 *     <Button asChild>
 *       <Link to="/page">Navegar</Link>
 *     </Button>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Renderizado como `<button>` por padrão, garantindo semântica correta
 * - Suporta navegação por teclado (Tab, Enter, Espaço)
 * - Suporta estados disabled com feedback visual
 * - Suporta aria-* attributes para melhor acessibilidade
 * - Quando `asChild={true}`, o elemento filho deve ser acessível
 *
 * @see [Radix UI Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) para mais sobre composição
 * @see [Framer Motion](https://www.framer.com/motion/) para mais sobre animações
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion, type Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Variantes de estilo do Button usando class-variance-authority.
 * Define as classes CSS para diferentes variantes e tamanhos.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success-hover",
        info: "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
        natural:
          "bg-background text-foreground border border-input shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Props do componente Button.
 *
 * @interface ButtonProps
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "transition">}
 * @extends {VariantProps<typeof buttonVariants>}
 *
 * @property {boolean} [asChild=false] - Quando `true`, passa props para o primeiro filho usando Radix UI Slot
 * @property {boolean} [animated=false] - Quando `true`, aplica animações sutis via Framer Motion
 * @property {Transition} [transition] - Configuração de transição customizada para animações
 * @property {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'info' | 'natural'} [variant='default'] - Variante visual do botão
 * @property {'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'} [size='default'] - Tamanho do botão
 * @property {string} [className] - Classes CSS adicionais
 * @property {React.ReactNode} [children] - Conteúdo do botão (texto, ícones, etc.)
 */
export interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "transition">,
		VariantProps<typeof buttonVariants> {
	/**
	 * Quando `true`, o Button não renderiza um elemento próprio, mas passa suas props
	 * para o primeiro filho usando Radix UI Slot. Útil para composição com outros componentes.
	 */
	asChild?: boolean;
	/**
	 * Quando `true`, aplica animações sutis de hover e tap via Framer Motion.
	 * As animações incluem scale no hover (1.02) e no tap (0.98).
	 */
	animated?: boolean;
	/**
	 * Configuração de transição customizada para animações quando `animated={true}`.
	 * Se não fornecido, usa transição spring padrão.
	 */
	transition?: Transition;
}

/**
 * Componente Button para acionar ações ou eventos.
 *
 * @component
 * @param {ButtonProps} props - Props do componente
 * @returns {JSX.Element} Elemento Button renderizado
 *
 * @example
 * ```tsx
 * <Button variant="default">Clique aqui</Button>
 * <Button variant="destructive" size="sm">Excluir</Button>
 * <Button animated>Animado</Button>
 * <Button asChild>
 *   <Link to="/page">Navegar</Link>
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, animated = false, transition, ...props }, ref) => {
    const baseClassName = cn(buttonVariants({ variant, size, className }));

    if (animated && !asChild) {
      const { onDrag: _onDrag, ...motionProps } = props;
      return (
        <motion.button
          ref={ref}
          className={baseClassName}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={
            transition || {
              type: "spring",
              stiffness: 400,
              damping: 17,
            }
          }
          {...(motionProps as Omit<HTMLMotionProps<"button">, "onDrag" | "ref">)}
        />
      );
    }

    if (asChild) {
      return <Slot className={baseClassName} ref={ref} {...props} />;
    }
    return <button className={baseClassName} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
