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
  value: number | string;

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
   * Se `locale` e `currency` forem fornecidos, será ignorado em favor da formatação de moeda
   */
  prefix?: string;

  /**
   * Sufixo para formatação do valor (ex: 'M', 'K')
   */
  suffix?: string;

  /**
   * Locale para formatação numérica (ex: 'pt-BR', 'en-US', 'de-DE')
   * Padrão: 'pt-BR' (formata com ponto como separador de milhares)
   */
  locale?: string;

  /**
   * Código da moeda para formatação (ex: 'BRL', 'USD', 'EUR')
   * Se fornecido, usa formatação de moeda do locale
   */
  currency?: string;

  /**
   * Como exibir a moeda ('symbol' | 'narrowSymbol' | 'code' | 'name')
   * Padrão: 'symbol' (ex: R$ para BRL, $ para USD)
   */
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";

  /**
   * Função customizada de formatação do valor principal
   * Tem prioridade sobre locale e currency
   */
  format?: (value: number) => string;

  /**
   * Função customizada de formatação do valor do mês anterior
   * Tem prioridade sobre locale e currency
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
 * Formata um número seguindo padrões comuns com suporte a locale
 * - Valores >= 1.000.000: formata como "X.XM" (respeitando locale para decimais)
 * - Valores >= 1.000: formata com separador de milhares conforme locale
 * - Valores < 1.000: retorna formatado conforme locale
 */
function formatNumberDefault(n: number, locale: string = "pt-BR"): string {
  if (n >= 1_000_000) {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    return `${formatter.format(n / 1_000_000)}M`;
  }
  if (n >= 1_000) {
    return new Intl.NumberFormat(locale).format(n);
  }
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Formata um número como moeda usando locale
 */
function formatCurrency(
  n: number,
  locale: string = "pt-BR",
  currency: string = "BRL",
  currencyDisplay: "symbol" | "narrowSymbol" | "code" | "name" = "symbol"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
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
    locale = "pt-BR",
    currency,
    currencyDisplay = "symbol",
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
      return ((Number(value) - Number(lastMonth)) / Number(lastMonth)) * 100;
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
      return format(Number(value));
    }
    const numValue = Number(value);
    if (currency) {
      // Se currency está definido, usa formatação de moeda (ignora prefix)
      return (
        formatCurrency(numValue, locale, currency, currencyDisplay) + (suffix ? ` ${suffix}` : "")
      );
    }
    // Caso contrário, usa formatação numérica padrão com prefix/suffix
    return prefix + formatNumberDefault(numValue, locale) + suffix;
  }, [value, prefix, suffix, locale, currency, currencyDisplay, format]);

  // Formata o valor do mês anterior
  const formattedLastMonth = useMemo(() => {
    if (!lastMonth) return null;
    if (lastFormat) {
      return lastFormat(lastMonth);
    }
    if (currency) {
      // Se currency está definido, usa formatação de moeda (ignora prefix)
      return formatCurrency(lastMonth, locale, currency, currencyDisplay);
    }
    // Caso contrário, usa formatação numérica padrão com prefix/suffix
    return prefix + formatNumberDefault(lastMonth, locale) + suffix;
  }, [lastMonth, prefix, suffix, locale, currency, currencyDisplay, lastFormat]);

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
  const formatNumber = useCallback(
    (n: number) => {
      if (currency) {
        return formatCurrency(n, locale, currency, currencyDisplay);
      }
      return formatNumberDefault(n, locale);
    },
    [locale, currency, currencyDisplay]
  );

  return {
    formattedValue,
    formattedLastMonth,
    trend,
    isPositive,
    getCardProps,
    formatNumber,
  };
}
