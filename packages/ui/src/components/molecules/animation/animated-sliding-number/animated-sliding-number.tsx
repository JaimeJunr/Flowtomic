/**
 * AnimatedSlidingNumber Component - Flowtomic UI
 *
 * Componente de tipografia para exibir números com animação de deslizamento
 * Encapsula SlidingNumber com estilos e props específicos para uso em textos
 */

"use client";

import type * as React from "react";
import {
  SlidingNumber,
  type SlidingNumberProps,
} from "@/components/atoms/animation/sliding-number/sliding-number";
import { cn } from "@/lib/utils";

export interface AnimatedSlidingNumberProps
  extends Omit<SlidingNumberProps, "number" | "className"> {
  /**
   * Valor numérico a ser exibido
   */
  value: number | string;
  /**
   * Classes CSS adicionais para o container
   */
  className?: string;
  /**
   * Tamanho do texto (usa classes Tailwind de tipografia)
   */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /**
   * Peso da fonte
   */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  /**
   * Cor do texto (usa variáveis do design system)
   * Use "inherit" para herdar a cor do contexto pai
   */
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "muted"
    | "success"
    | "warning"
    | "error"
    | "inherit";
  /**
   * Alinhamento do texto
   */
  align?: "left" | "center" | "right";
  /**
   * Props customizadas para o SlidingNumber interno
   */
  slidingNumberProps?: Omit<SlidingNumberProps, "number">;
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const weightClasses = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

// Mapeamento de cores para variáveis CSS
const colorCSSVars = {
  default: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary-foreground))",
  muted: "hsl(var(--muted-foreground))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  error: "hsl(var(--destructive))",
  inherit: "inherit",
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function AnimatedSlidingNumber({
  value,
  className,
  size = "base",
  weight = "normal",
  color = "default",
  align = "left",
  slidingNumberProps,
  ...props
}: AnimatedSlidingNumberProps) {
  const isInherit = color === "inherit";
  const textColor = isInherit ? "inherit" : colorCSSVars[color];

  const containerClasses = cn(
    // Aplica classe de cor apenas se não for inherit
    !isInherit && colorClasses[color],
    // Força herança de cor em todos os elementos filhos
    "[&_*]:!text-inherit",
    "[&_span]:!text-inherit"
  );

  const textClasses = cn(
    sizeClasses[size],
    weightClasses[weight],
    alignClasses[align],
    "tabular-nums",
    className
  );

  return (
    <span
      className={containerClasses}
      style={
        {
          color: textColor,
          "--animated-number-color": textColor,
        } as React.CSSProperties
      }
    >
      <SlidingNumber number={value} className={textClasses} {...slidingNumberProps} {...props} />
    </span>
  );
}

export { AnimatedSlidingNumber };
