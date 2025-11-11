/**
 * useStatCard - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * // Cálculo automático do delta a partir de lastMonth
 * function MyCustomStatCard() {
 *   const { formattedValue, trend, getCardProps } = useStatCard({
 *     value: 122380,
 *     lastMonth: 105922, // delta será calculado automaticamente: +15.5%
 *   })
 *
 *   return (
 *     <div {...getCardProps()}>
 *       <span>{formattedValue}</span>
 *       <Badge>{trend.percentage}</Badge>
 *     </div>
 *   )
 * }
 *
 * // Ou forneça delta explicitamente para casos especiais
 * function CustomDeltaCard() {
 *   const { formattedValue, trend } = useStatCard({
 *     value: 122380,
 *     delta: 15.1, // delta explícito tem prioridade
 *     lastMonth: 105922,
 *   })
 * }
 * ```
 */

import { useCallback, useMemo } from "react";

export interface StatCardData {
  /**
   * Valor principal do card
   */
  value: number;

  /**
   * Percentual de variação (positivo ou negativo)
   * Se não fornecido, será calculado automaticamente quando `lastMonth` estiver disponível.
   * Fórmula: ((value - lastMonth) / lastMonth) * 100
   */
  delta?: number;

  /**
   * Valor do mês anterior para comparação
   * Se fornecido e `delta` não estiver definido, o delta será calculado automaticamente.
   */
  lastMonth?: number;

  /**
   * Prefixo para formatação do valor (ex: '$', 'R$')
   */
  prefix?: string;

  /**
   * Sufixo para formatação do valor (ex: 'M', 'K')
   */
  suffix?: string;

  /**
   * Função customizada de formatação do valor principal
   */
  format?: (value: number) => string;

  /**
   * Função customizada de formatação do valor do mês anterior
   */
  lastFormat?: (value: number) => string;

  /**
   * Se a variação é positiva (true) ou negativa (false)
   * Se não fornecido, será calculado automaticamente baseado no delta
   */
  positive?: boolean;
}

export interface TrendInfo {
  /**
   * Se a tendência é positiva
   */
  isPositive: boolean;

  /**
   * Percentual formatado (ex: '+15.1%', '-2.0%')
   */
  percentage: string;

  /**
   * Valor absoluto do delta
   */
  delta: number;

  /**
   * Variante do badge ('success' para positivo, 'destructive' para negativo, 'secondary' para neutro)
   */
  variant: "success" | "destructive" | "secondary";

  /**
   * Direção da tendência ('up', 'down', 'neutral')
   */
  direction: "up" | "down" | "neutral";
}

export interface UseStatCardReturn {
  /**
   * Valor formatado principal
   */
  formattedValue: string;

  /**
   * Valor do mês anterior formatado
   */
  formattedLastMonth: string | null;

  /**
   * Informações sobre a tendência
   */
  trend: TrendInfo;

  /**
   * Se a tendência é positiva
   */
  isPositive: boolean;

  /**
   * Props prontas para passar para o container do card
   */
  getCardProps: (props?: { onClick?: () => void; className?: string; "aria-label"?: string }) => {
    onClick?: () => void;
    className?: string;
    "aria-label": string;
    role?: string;
  };

  /**
   * Função utilitária para formatação de números
   */
  formatNumber: (n: number) => string;
}

/**
 * Formata um número seguindo padrões comuns
 * - Valores >= 1.000.000: formata como "X.XM"
 * - Valores >= 1.000: formata com separador de milhares
 * - Valores < 1.000: retorna como string
 */
function formatNumberDefault(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return n.toLocaleString();
  }
  return n.toString();
}

/**
 * Hook Headless UI para StatCard
 *
 * Fornece apenas a lógica e API, sem markup ou styles.
 * Você é responsável por criar o visual.
 *
 * @example
 * ```tsx
 * // Cálculo automático do delta a partir de lastMonth
 * function MyCustomStatCard() {
 *   const { formattedValue, trend, getCardProps } = useStatCard({
 *     value: 122380,
 *     lastMonth: 105922, // delta será calculado automaticamente: +15.5%
 *   })
 *
 *   return (
 *     <div {...getCardProps()}>
 *       <span>{formattedValue}</span>
 *       <Badge variant={trend.variant}>{trend.percentage}</Badge>
 *     </div>
 *   )
 * }
 *
 * // Ou forneça delta explicitamente para casos especiais
 * function CustomDeltaCard() {
 *   const { formattedValue, trend } = useStatCard({
 *     value: 122380,
 *     delta: 15.1, // delta explícito tem prioridade
 *     lastMonth: 105922,
 *   })
 * }
 * ```
 */
export function useStatCard(data: StatCardData): UseStatCardReturn {
  const {
    value,
    delta: explicitDelta,
    lastMonth,
    prefix = "",
    suffix = "",
    format,
    lastFormat,
    positive: explicitPositive,
  } = data;

  // Calcula delta automaticamente se não fornecido mas lastMonth estiver disponível
  const delta = useMemo(() => {
    // Se delta foi fornecido explicitamente, usa ele (prioridade)
    if (explicitDelta !== undefined) {
      return explicitDelta;
    }

    // Se lastMonth foi fornecido, calcula o delta automaticamente
    if (lastMonth !== undefined && lastMonth !== 0) {
      return ((value - lastMonth) / lastMonth) * 100;
    }

    // Caso contrário, retorna 0
    return 0;
  }, [value, lastMonth, explicitDelta]);

  // Calcula se a tendência é positiva
  const isPositive = useMemo(() => {
    if (explicitPositive !== undefined) {
      return explicitPositive;
    }
    return delta >= 0;
  }, [delta, explicitPositive]);

  // Calcula informações da tendência
  const trend = useMemo<TrendInfo>(() => {
    const direction: "up" | "down" | "neutral" = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";

    const variant: "success" | "destructive" | "secondary" =
      direction === "up" ? "success" : direction === "down" ? "destructive" : "secondary";

    const percentage =
      delta > 0 ? `+${delta.toFixed(1)}%` : delta < 0 ? `${delta.toFixed(1)}%` : "0%";

    return {
      isPositive,
      percentage,
      delta: Math.abs(delta),
      variant,
      direction,
    };
  }, [delta, isPositive]);

  // Formata o valor principal
  const formattedValue = useMemo(() => {
    if (format) {
      return format(value);
    }
    return prefix + formatNumberDefault(value) + suffix;
  }, [value, prefix, suffix, format]);

  // Formata o valor do mês anterior
  const formattedLastMonth = useMemo(() => {
    if (!lastMonth) return null;
    if (lastFormat) {
      return lastFormat(lastMonth);
    }
    return prefix + formatNumberDefault(lastMonth) + suffix;
  }, [lastMonth, prefix, suffix, lastFormat]);

  // Props helper para o card
  const getCardProps = useCallback(
    (props: { onClick?: () => void; className?: string; "aria-label"?: string } = {}) => {
      return {
        onClick: props.onClick,
        className: props.className,
        "aria-label": props["aria-label"] || `Estatística: ${formattedValue}`,
        role: props.onClick ? "button" : undefined,
      };
    },
    [formattedValue]
  );

  // Função utilitária de formatação
  const formatNumber = useCallback((n: number) => {
    return formatNumberDefault(n);
  }, []);

  return {
    formattedValue,
    formattedLastMonth,
    trend,
    isPositive,
    getCardProps,
    formatNumber,
  };
}
