import { MotionConfigContext, motion, type Transition, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface Animated3DProps {
  /**
   * Se a animação está ativa (aberta)
   */
  isOpen: boolean;
  /**
   * Conteúdo a ser animado
   */
  children: React.ReactNode;
  /**
   * Configuração de transição customizada
   */
  transition?: Transition;
  /**
   * Rotação inicial em X (graus)
   * @default 25
   */
  initialRotateX?: number;
  /**
   * Rotação inicial em Y (graus)
   * @default 0
   */
  initialRotateY?: number;
  /**
   * Escala inicial
   * @default 0.85
   */
  initialScale?: number;
  /**
   * Opacidade inicial
   * @default 0
   */
  initialOpacity?: number;
  /**
   * Profundidade inicial (translateZ em px)
   * @default -100
   */
  initialTranslateZ?: number;
  /**
   * Perspectiva CSS (px)
   * @default "1200px"
   */
  perspective?: string;
  /**
   * Se deve desabilitar a animação
   */
  disabled?: boolean;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /** Ref do elemento animado (prop comum no React 19) */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Animated3D - Componente de animação 3D com perspectiva
 */
function Animated3D({
  isOpen,
  children,
  className,
  transition,
  initialRotateX = 25,
  initialRotateY = 0,
  initialScale = 0.85,
  initialOpacity = 0,
  initialTranslateZ = -100,
  perspective = "1200px",
  disabled = false,
  ref,
}: Animated3DProps) {
  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 280,
    damping: 25,
    mass: 0.8,
    ...transition,
  };

  // Mesmo critério do sliding-number: preferência do sistema ou MotionConfig reducedMotion="always"
  const reducedMotionConfig = React.useContext(MotionConfigContext).reducedMotion;
  const shouldReduceMotion = useReducedMotion() || reducedMotionConfig === "always";

  if (disabled) {
    return (
      <div data-slot="animated-3d" ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <motion.div
        data-slot="animated-3d"
        ref={ref}
        initial={false}
        animate={
          isOpen
            ? {
                opacity: 1,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                z: 0,
              }
            : shouldReduceMotion
              ? // Com movimento reduzido, fechar só esmaece: sem girar, encolher ou afundar
                { opacity: initialOpacity, scale: 1, rotateX: 0, rotateY: 0, z: 0 }
              : {
                  opacity: initialOpacity,
                  scale: initialScale,
                  rotateX: initialRotateX,
                  rotateY: initialRotateY,
                  z: initialTranslateZ,
                }
        }
        transition={shouldReduceMotion ? { duration: 0 } : defaultTransition}
        style={{
          transformStyle: "preserve-3d",
        }}
        className={cn("relative", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
Animated3D.displayName = "Animated3D";

export { Animated3D };
