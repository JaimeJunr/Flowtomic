/**
 * BackdropBlur Component - Flowtomic UI
 *
 * Componente de backdrop blur reutilizável para overlays e modais
 * Usa Framer Motion para animação suave do blur
 */

import { motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BackdropBlurProps {
  /**
   * Se o backdrop está visível
   */
  isOpen: boolean;
  /**
   * Intensidade do blur (px)
   * @default 10
   */
  blurIntensity?: number;
  /**
   * Opacidade do backdrop
   * @default 0.5
   */
  opacity?: number;
  /**
   * Cor de fundo do backdrop
   * @default "black"
   */
  backgroundColor?: string;
  /**
   * Se deve desabilitar a animação
   */
  disabled?: boolean;
  /**
   * Duração da transição (segundos)
   * @default 0.2
   */
  duration?: number;
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * BackdropBlur - Componente de backdrop com blur animado
 */
const BackdropBlur = React.forwardRef<HTMLDivElement, BackdropBlurProps>(
  (
    {
      isOpen,
      className,
      blurIntensity = 10,
      opacity = 0.5,
      backgroundColor = "black",
      disabled = false,
      duration = 0.2,
    },
    ref
  ) => {
    // Converte backgroundColor para rgba incluindo a opacidade
    // Usa useMemo para evitar recálculos desnecessários
    // IMPORTANTE: Hook deve ser chamado antes de qualquer early return
    const backgroundColorWithOpacity = React.useMemo(() => {
      const convertToRgba = (color: string, opacityValue: number): string => {
        // Se já é rgba, extrai os valores RGB e aplica nova opacidade
        if (color.startsWith("rgba(")) {
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacityValue})`;
          }
        }
        // Se é rgb, adiciona opacidade
        if (color.startsWith("rgb(")) {
          const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacityValue})`;
          }
        }
        // Se é hex, converte para rgba
        if (color.startsWith("#")) {
          const hex = color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
        }
        // Para cores nomeadas comuns, usa valores conhecidos
        const namedColors: Record<string, [number, number, number]> = {
          black: [0, 0, 0],
          white: [255, 255, 255],
          red: [255, 0, 0],
          green: [0, 128, 0],
          blue: [0, 0, 255],
          transparent: [0, 0, 0],
        };
        const lowerColor = color.toLowerCase();
        if (namedColors[lowerColor]) {
          const [r, g, b] = namedColors[lowerColor];
          return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
        }
        // Fallback: retorna a cor original (opacidade será aplicada via CSS)
        return color;
      };

      return {
        open: convertToRgba(backgroundColor, opacity),
        closed: convertToRgba(backgroundColor, 0),
      };
    }, [backgroundColor, opacity]);

    if (disabled) {
      return (
        <div
          ref={ref}
          className={cn("fixed inset-0 z-40", className)}
          style={{
            backgroundColor: `${backgroundColor}${Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
            backdropFilter: isOpen ? `blur(${blurIntensity}px)` : "blur(0px)",
          }}
        />
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={false}
        animate={
          isOpen
            ? {
                backdropFilter: `blur(${blurIntensity}px)`,
                backgroundColor: backgroundColorWithOpacity.open,
              }
            : {
                backdropFilter: "blur(0px)",
                backgroundColor: backgroundColorWithOpacity.closed,
              }
        }
        transition={{ duration }}
        className={cn("fixed inset-0 z-40", className)}
      />
    );
  }
);
BackdropBlur.displayName = "BackdropBlur";

export { BackdropBlur };
