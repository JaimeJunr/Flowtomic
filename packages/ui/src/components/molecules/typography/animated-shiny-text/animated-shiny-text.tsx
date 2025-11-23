/**
 * AnimatedShinyText - Componente Molecule
 *
 * Componente de texto com efeito shimmer animado.
 * Implementação especializada que usa o componente atômico Shimmer.
 */

import type { ComponentPropsWithoutRef, FC } from "react";
import { cn } from "@/lib/utils";
import { Shimmer } from "../../../atoms/animation/shimmer";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Largura do efeito shimmer em pixels
   * @default 100
   */
  shimmerWidth?: number;
  /**
   * Duração da animação em segundos
   * @default 2
   */
  duration?: number;
}

/**
 * Componente de texto com efeito shimmer animado.
 * Usa o componente atômico Shimmer internamente para maior flexibilidade.
 */
export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  duration = 2,
  ...props
}) => {
  // Converte children para string para usar com Shimmer
  const textContent =
    typeof children === "string"
      ? children
      : typeof children === "number"
        ? String(children)
        : null;

  // Se não for string/number, renderiza sem shimmer (compatibilidade)
  if (textContent === null) {
    return (
      <span className={cn("relative inline-block", className)} {...props}>
        {children}
      </span>
    );
  }

  // Calcula spread baseado na largura do shimmer
  // O Shimmer multiplica spread pelo comprimento do texto para calcular a largura do gradiente
  // Para aproximar o comportamento do shimmerWidth original, usamos uma fórmula que
  // considera o comprimento do texto e a largura desejada
  const spread =
    textContent.length > 0 ? Math.max(0.5, shimmerWidth / (textContent.length * 10)) : 2;

  return (
    <Shimmer
      as="span"
      duration={duration}
      spread={spread}
      className={cn(className)}
      {...(props as Record<string, unknown>)}
    >
      {textContent}
    </Shimmer>
  );
};
