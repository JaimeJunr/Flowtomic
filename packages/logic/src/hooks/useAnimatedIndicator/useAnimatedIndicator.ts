/**
 * useAnimatedIndicator - Headless UI Hook
 *
 * Hook reutilizável para animação de indicador que se move entre elementos
 * Fornece apenas: lógica, estado e cálculos de posição
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface IndicatorStyle {
  left: number;
  width: number;
  height: number;
  top: number;
  opacity: number;
}

export interface UseAnimatedIndicatorOptions {
  /**
   * Container que contém os elementos
   */
  containerRef: React.RefObject<HTMLElement>;
  /**
   * Seletor CSS para encontrar o elemento ativo (ex: '[data-state="active"]')
   * @default '[data-state="active"]'
   */
  activeSelector?: string;
  /**
   * Callback para obter o valor/identificador do elemento
   * Se não fornecido, usa o atributo 'data-value' ou busca no Map
   */
  getElementValue?: (element: HTMLElement) => string;
  /**
   * Se deve atualizar automaticamente quando o container é redimensionado
   * @default true
   */
  updateOnResize?: boolean;
}

export interface UseAnimatedIndicatorReturn {
  /**
   * Estilo do indicador (posição e dimensões)
   */
  indicatorStyle: IndicatorStyle;
  /**
   * Registra um elemento para rastreamento
   */
  registerElement: (element: HTMLElement | null, value: string) => void;
  /**
   * Remove um elemento do rastreamento
   */
  unregisterElement: (value: string) => void;
  /**
   * Força atualização do indicador
   */
  updateIndicator: () => void;
  /**
   * Valor do elemento ativo
   */
  activeValue: string | undefined;
}

/**
 * Hook headless para animação de indicador
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { indicatorStyle, registerElement, unregisterElement } = useAnimatedIndicator({
 *   containerRef,
 *   activeSelector: '[data-state="active"]',
 * });
 *
 * return (
 *   <div ref={containerRef}>
 *     {items.map((item) => (
 *       <button
 *         ref={(el) => registerElement(el, item.id)}
 *         data-state={isActive ? "active" : "inactive"}
 *       >
 *         {item.label}
 *       </button>
 *     ))}
 *     <motion.div
 *       style={{
 *         left: `${indicatorStyle.left}px`,
 *         top: `${indicatorStyle.top}px`,
 *         width: indicatorStyle.width,
 *         height: indicatorStyle.height,
 *       }}
 *     />
 *   </div>
 * );
 * ```
 */
export function useAnimatedIndicator(
  options: UseAnimatedIndicatorOptions
): UseAnimatedIndicatorReturn {
  const {
    containerRef,
    activeSelector = '[data-state="active"]',
    getElementValue,
    updateOnResize = true,
  } = options;

  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const updateTimeoutRef = useRef<number | null>(null);
  const activeValueRef = useRef<string | undefined>(undefined);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
    left: 0,
    width: 0,
    height: 0,
    top: 0,
    opacity: 0,
  });
  const [activeValue, setActiveValue] = useState<string | undefined>();

  // Sincronizar ref com state
  useEffect(() => {
    activeValueRef.current = activeValue;
  }, [activeValue]);

  const updateIndicator = useCallback(() => {
    const currentActiveValue = activeValueRef.current;
    
    if (!currentActiveValue) {
      setIndicatorStyle((prev) => {
        if (prev.opacity === 0) return prev;
        return { left: 0, width: 0, height: 0, top: 0, opacity: 0 };
      });
      return;
    }

    const activeElement = elementsRef.current.get(currentActiveValue);
    const container = containerRef.current;

    if (activeElement && container) {
      const elementRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calcular posição relativa ao container
      const left = elementRect.left - containerRect.left;
      const width = elementRect.width;
      const height = elementRect.height;
      const top = elementRect.top - containerRect.top;

      setIndicatorStyle((prev) => {
        // Evitar atualização se os valores não mudaram
        if (
          prev.left === left &&
          prev.width === width &&
          prev.height === height &&
          prev.top === top &&
          prev.opacity === 1
        ) {
          return prev;
        }

        return {
          left,
          width,
          height,
          top,
          opacity: 1,
        };
      });
    }
  }, [containerRef]);

  // Função para agendar atualização (debounce) - estável
  const scheduleUpdateRef = useRef<(() => void) | undefined>(undefined);
  
  // Atualizar a função no ref sempre que updateIndicator mudar
  useEffect(() => {
    scheduleUpdateRef.current = () => {
      if (updateTimeoutRef.current !== null) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = requestAnimationFrame(() => {
        updateIndicator();
        updateTimeoutRef.current = null;
      });
    };
  }, [updateIndicator]);

  const scheduleUpdate = useCallback(() => {
    scheduleUpdateRef.current?.();
  }, []);

  // Atualizar quando activeValue mudar
  useEffect(() => {
    scheduleUpdate();
  }, [activeValue, scheduleUpdate]);

  // Listener de resize
  useEffect(() => {
    if (!updateOnResize) return;

    const handleResize = () => scheduleUpdate();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (updateTimeoutRef.current !== null) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
    };
  }, [scheduleUpdate, updateOnResize]);

  const registerElement = useCallback(
    (element: HTMLElement | null, value: string) => {
      const previousElement = elementsRef.current.get(value);
      
      // Só atualizar se o elemento realmente mudou
      if (element === previousElement) {
        return;
      }

      if (element) {
        elementsRef.current.set(value, element);
      } else {
        // Só remover se o elemento existia antes
        if (previousElement) {
          elementsRef.current.delete(value);
        } else {
          return; // Elemento já não existe, não precisa atualizar
        }
      }
      
      // Agendar atualização de forma assíncrona para evitar loops
      // Só atualizar se temos um elemento válido
      if (element) {
        scheduleUpdate();
      }
    },
    [scheduleUpdate]
  );

  const unregisterElement = useCallback(
    (value: string) => {
      elementsRef.current.delete(value);
      scheduleUpdate();
    },
    [scheduleUpdate]
  );

  // Refs para opções estáveis
  const activeSelectorRef = useRef(activeSelector);
  const getElementValueRef = useRef(getElementValue);
  
  useEffect(() => {
    activeSelectorRef.current = activeSelector;
    getElementValueRef.current = getElementValue;
  }, [activeSelector, getElementValue]);

  // Observar mudanças no elemento ativo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const findActiveValue = () => {
      const activeElement = container.querySelector<HTMLElement>(
        activeSelectorRef.current
      );
      if (activeElement) {
        let value: string | undefined;

        if (getElementValueRef.current) {
          value = getElementValueRef.current(activeElement);
        } else {
          // Tentar obter do atributo data-value
          value = activeElement.getAttribute("data-value") || undefined;

          // Se não tiver data-value, buscar no Map pelo elemento
          if (!value) {
            for (const [mapValue, mapElement] of elementsRef.current.entries()) {
              if (mapElement === activeElement) {
                value = mapValue;
                break;
              }
            }
          }
        }

        if (value) {
          setActiveValue((prev) => {
            // Só atualizar se o valor realmente mudou
            if (prev !== value) {
              return value;
            }
            return prev;
          });
        }
      }
    };

    const observer = new MutationObserver(() => {
      // Usar requestAnimationFrame para evitar chamadas síncronas
      requestAnimationFrame(findActiveValue);
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ["data-state", "data-active", "aria-selected"],
      subtree: true,
    });

    // Verificar estado inicial com delay para evitar loop
    const timeoutId = setTimeout(findActiveValue, 0);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [containerRef]);

  return {
    indicatorStyle,
    registerElement,
    unregisterElement,
    updateIndicator,
    activeValue,
  };
}

