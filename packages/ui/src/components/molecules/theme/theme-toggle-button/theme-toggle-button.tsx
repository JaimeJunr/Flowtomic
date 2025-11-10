/**
 * ThemeToggleButton - Componente de Toggle de Tema com Animação Circle Blur
 *
 * Componente consolidado para alternância de tema com animação suave
 * usando View Transitions API e variante circle-blur (soft-edge circle)
 *
 * NOTA: Este componente requer que o projeto forneça um hook useThemeToggle
 * ou props para controlar o tema. Por padrão, aceita props diretas.
 */

import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../atoms/button/button";

export type StartPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ThemeToggleButtonProps {
  /**
   * Tamanho do botão
   * @default 'icon'
   */
  size?: "sm" | "md" | "lg" | "icon";

  /**
   * Posição inicial da animação circle-blur
   * @default 'top-right'
   */
  start?: StartPosition;

  /**
   * Classes CSS adicionais
   */
  className?: string;

  /**
   * Desabilitar o botão
   * @default false
   */
  disabled?: boolean;

  /**
   * Tema atual ('light' | 'dark')
   * Se não fornecido, tenta detectar do sistema
   */
  theme?: "light" | "dark";

  /**
   * Callback quando o tema é alternado
   */
  onThemeChange?: (theme: "light" | "dark") => void;
}

const buttonSizeMap = {
  sm: "icon-sm" as const,
  md: "icon-lg" as const,
  lg: "icon-lg" as const,
  icon: "icon-lg" as const,
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 24,
  icon: 24,
};

/**
 * Componente de toggle de tema com animação circle-blur
 *
 * Usa View Transitions API para transições suaves entre temas
 * com animação de círculo expandindo com blur (soft-edge)
 *
 * @example
 * ```tsx
 * <ThemeToggleButton
 *   size="icon"
 *   start="top-right"
 *   theme={currentTheme}
 *   onThemeChange={setTheme}
 * />
 * ```
 */
export function ThemeToggleButton({
  size = "icon",
  start = "top-right",
  className,
  disabled = false,
  theme: controlledTheme,
  onThemeChange,
}: ThemeToggleButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [internalTheme, setInternalTheme] = useState<"light" | "dark">("light");

  // Detectar tema do sistema se não fornecido
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setInternalTheme(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  const theme = controlledTheme ?? internalTheme;
  const isDark = theme === "dark";

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? "light" : "dark";
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      setInternalTheme(newTheme);
    }
  }, [isDark, onThemeChange]);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    setIsToggling(true);

    // Verifica se estamos em ambiente de browser
    if (typeof window === "undefined" || typeof document === "undefined") {
      setIsToggling(false);
      return;
    }

    const root = document.documentElement;

    if ("startViewTransition" in document) {
      // Injeta estilos de animação circle-blur para esta transição específica
      const styleId = `theme-transition-${Date.now()}`;
      const style = (document as Document).createElement("style");
      style.id = styleId;

      // Posições para a animação
      const positions: Record<StartPosition, string> = {
        center: "center",
        "top-left": "top left",
        "top-right": "top right",
        "bottom-left": "bottom left",
        "bottom-right": "bottom right",
      };

      // Calcula posição do círculo baseado no start
      const cx = start === "center" ? "50" : start.includes("left") ? "0" : "100";
      const cy = start === "center" ? "50" : start.includes("top") ? "0" : "100";

      // CSS para animação circle-blur
      const css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `;

      style.textContent = css;
      (document as Document).head.appendChild(style);

      // Usa View Transitions API se disponível
      const docWithTransition = document as Document & {
        startViewTransition?: (callback: () => void) => {
          finished: Promise<void>;
          updateCallbackDone: Promise<void>;
          ready: Promise<void>;
        };
      };

      const transition = docWithTransition.startViewTransition?.(() => {
        toggleTheme();
      });

      // Aguarda a conclusão da transição antes de reabilitar o botão
      if (transition) {
        transition.finished.finally(() => {
          setIsToggling(false);
          // Remove os estilos após a transição
          setTimeout(() => {
            const styleEl = document.getElementById(styleId);
            if (styleEl) {
              styleEl.remove();
            }
          }, 100);
        });
      } else {
        setTimeout(() => {
          setIsToggling(false);
          const styleEl = document.getElementById(styleId);
          if (styleEl) {
            styleEl.remove();
          }
        }, 500);
      }
    } else {
      // Fallback: animação CSS customizada
      const styleId = `theme-toggle-style-${Date.now()}`;
      const style = (document as Document).createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes theme-toggle-expand {
          from {
            clip-path: circle(0% at 50% 50%);
          }
          to {
            clip-path: circle(150% at 50% 50%);
          }
        }
        
        html.theme-transitioning * {
          animation: theme-toggle-expand 500ms ease-in-out;
        }
      `;
      (document as Document).head.appendChild(style);

      root.classList.add("theme-transitioning");
      toggleTheme();

      setTimeout(() => {
        root.classList.remove("theme-transitioning");
        const styleEl = document.getElementById(styleId);
        if (styleEl) {
          styleEl.remove();
        }
        setIsToggling(false);
      }, 500);
    }
  }, [disabled, start, toggleTheme]);

  if (!mounted) {
    return <div className={cn("h-9 w-9 rounded-lg", className)} />;
  }

  const buttonSize = buttonSizeMap[size];
  const iconSize = iconSizes[size];

  return (
    <Button
      variant="outline"
      size={buttonSize}
      onClick={handleToggle}
      disabled={disabled || isToggling}
      className={cn("relative overflow-hidden", isToggling && "scale-95", className)}
      aria-label={`Alternar para tema ${isDark ? "claro" : "escuro"}`}
      aria-pressed={isDark}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ícone do Sol */}
        <Sun
          className={cn(
            "absolute transition-all duration-300 ease-in-out",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          size={iconSize}
        />

        {/* Ícone da Lua */}
        <Moon
          className={cn(
            "absolute transition-all duration-300 ease-in-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
          size={iconSize}
        />
      </div>
    </Button>
  );
}
