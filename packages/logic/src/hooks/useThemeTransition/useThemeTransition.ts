/**
 * useThemeTransition - Hook para View Transitions API
 *
 * Gerencia transições suaves de tema usando a View Transitions API
 * com fallback automático para navegadores que não suportam
 */

import { useCallback } from "react";

/**
 * Interface para o retorno do hook
 */
export interface UseThemeTransitionReturn {
  /**
   * Inicia uma transição de tema usando View Transitions API
   * Se não disponível, executa a função diretamente
   */
  startTransition: (updateFn: () => void) => void;
}

/**
 * Hook para gerenciar transições de tema com View Transitions API
 *
 * @example
 * ```tsx
 * const { startTransition } = useThemeTransition()
 *
 * const handleToggle = () => {
 *   startTransition(() => {
 *     toggleTheme()
 *   })
 * }
 * ```
 */
export function useThemeTransition(): UseThemeTransitionReturn {
  const startTransition = useCallback((updateFn: () => void) => {
    // Verifica se View Transitions API está disponível
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => {
          finished: Promise<void>;
          updateCallbackDone: Promise<void>;
          ready: Promise<void>;
        };
      };

      doc.startViewTransition?.(updateFn);
    } else {
      // Fallback: executa diretamente sem animação
      updateFn();
    }
  }, []);

  return { startTransition };
}
