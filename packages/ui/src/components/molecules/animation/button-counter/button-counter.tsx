/**
 * ButtonCounter Component - Flowtomic UI
 *
 * Componente que combina Button com Counter/SlidingNumber
 * Exibe um botão com número animado que pode ser incrementado/decrementado
 */

"use client";

import { motion, type Transition } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../../atoms";
import {
  AnimatedSlidingNumber,
  type AnimatedSlidingNumberProps,
} from "../animated-sliding-number/animated-sliding-number";

export interface ButtonCounterProps extends Omit<ButtonProps, "children" | "prefix" | "suffix"> {
  /**
   * Valor numérico atual
   */
  value: number;
  /**
   * Callback quando o valor muda
   */
  onValueChange: (value: number) => void;
  /**
   * Valor mínimo permitido
   */
  min?: number;
  /**
   * Valor máximo permitido
   */
  max?: number;
  /**
   * Incremento/decremento por clique
   */
  step?: number;
  /**
   * Mostrar botões de incremento/decremento
   */
  showControls?: boolean;
  /**
   * Props para o AnimatedSlidingNumber
   */
  animatedNumberProps?: Omit<AnimatedSlidingNumberProps, "value">;
  /**
   * Transição para animações
   */
  transition?: Transition;
  /**
   * Conteúdo adicional antes do número
   */
  prefix?: React.ReactNode;
  /**
   * Conteúdo adicional depois do número
   */
  suffix?: React.ReactNode;
  /**
   * Remove borda e fundo do botão que exibe o número (apenas quando showControls=true)
   */
  hideNumberBackground?: boolean;
}

function ButtonCounter({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  showControls = false,
  animatedNumberProps,
  transition,
  prefix,
  suffix,
  className,
  variant = "default",
  size = "default",
  hideNumberBackground = false,
  ...buttonProps
}: ButtonCounterProps) {
  const handleIncrement = React.useCallback(() => {
    const newValue = value + step;
    if (max === undefined || newValue <= max) {
      onValueChange(newValue);
    }
  }, [value, step, max, onValueChange]);

  const handleDecrement = React.useCallback(() => {
    const newValue = value - step;
    if (min === undefined || newValue >= min) {
      onValueChange(newValue);
    }
  }, [value, step, min, onValueChange]);

  const isMin = min !== undefined && value <= min;
  const isMax = max !== undefined && value >= max;

  if (showControls) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={variant}
            size={size}
            onClick={handleDecrement}
            disabled={isMin || buttonProps.disabled}
            {...buttonProps}
          >
            -
          </Button>
        </motion.div>

        <Button
          variant={hideNumberBackground ? "ghost" : variant}
          size={size}
          className={cn(
            "gap-2",
            hideNumberBackground && "bg-transparent border-none shadow-none hover:bg-transparent"
          )}
          {...buttonProps}
        >
          {prefix}
          <AnimatedSlidingNumber
            value={value}
            color={animatedNumberProps?.color ?? "inherit"}
            {...animatedNumberProps}
            className={cn("font-medium", animatedNumberProps?.className)}
          />
          {suffix}
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={variant}
            size={size}
            onClick={handleIncrement}
            disabled={isMax || buttonProps.disabled}
            {...buttonProps}
          >
            +
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <Button variant={variant} size={size} className={cn("gap-2", className)} {...buttonProps}>
      {prefix}
      <AnimatedSlidingNumber
        value={value}
        color={animatedNumberProps?.color ?? "inherit"}
        {...animatedNumberProps}
        className={cn("font-medium", animatedNumberProps?.className)}
      />
      {suffix}
    </Button>
  );
}

export { ButtonCounter };
