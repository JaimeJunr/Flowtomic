/**
 * StatsGrid - Organism Component
 *
 * Régua de métricas: rótulo, valor em mono e a variação contra o período anterior.
 * Sem cards — a tipografia faz a hierarquia e só a variação ganha cor.
 * Componente genérico que pode ser usado em qualquer aplicação.
 *
 * @example
 * ```tsx
 * // Delta calculado automaticamente quando lastMonth é fornecido
 * <StatsGrid
 *   stats={[
 *     { id: "npm", title: "Downloads no npm, 7 dias", value: 1240, lastMonth: 1074 },
 *     { id: "build", title: "Build do registry", value: 38, lastMonth: 35, suffix: " s", positive: false },
 *   ]}
 * />
 * ```
 */

import { type StatCardData, useStatCard } from "@flowtomic/logic";
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../../atoms";

export interface StatItem {
  id: string;
  title: string;
  /** Número é formatado em pt-BR; texto aparece como veio (ex.: "20,9%") */
  value: string | number;
  /** Substitui a comparação com o período anterior (ex.: "meta 75%") */
  subtitle?: string;
  /** @deprecated a direção vem de `delta`/`lastMonth` */
  trend?: "up" | "down" | "neutral";
  /** @deprecated a porcentagem vem de `delta`/`lastMonth` */
  trendPercentage?: string;
  /** @deprecated o valor não ganha cor própria; só a variação é colorida */
  color?: "blue" | "green" | "orange" | "red" | "purple";
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
  prefix?: string;
  suffix?: string;
  format?: (value: number) => string;
  lastFormat?: (value: number) => string;
  /** `false` quando subir é ruim (tempo de build, erros): a subida fica vermelha */
  positive?: boolean;
}

export interface StatsGridProps {
  stats: StatItem[];
  layout?: "grid" | "list";
  /**
   * Quando `true`, exibe skeletons de loading no lugar das métricas.
   * O número de skeletons será baseado no tamanho do array `stats` (se disponível) ou 3 por padrão.
   */
  loading?: boolean;
  /**
   * Número de skeletons a exibir quando `loading` é `true`.
   * Se não especificado, usa o tamanho do array `stats` ou 3 por padrão.
   */
  skeletonCount?: number;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const COLUMN_CLASSES: Record<"sm" | "md" | "lg", Record<number, string>> = {
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" },
};

function gridColumns(columns: StatsGridProps["columns"], count: number): string {
  if (columns) {
    const breakpoints = ["sm", "md", "lg"] as const;
    return breakpoints.map((bp) => (columns[bp] ? COLUMN_CLASSES[bp][columns[bp]] : "")).join(" ");
  }
  return `sm:grid-cols-2 ${COLUMN_CLASSES.lg[Math.min(Math.max(count, 1), 4)]}`;
}

const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function trendClass(direction: "up" | "down" | "neutral", good: boolean): string {
  if (direction === "neutral") return "text-muted-foreground";
  return good ? "text-success" : "text-destructive";
}

function useMetric(stat: StatItem) {
  const data: StatCardData = {
    value: stat.value,
    delta: stat.delta,
    lastMonth: stat.lastMonth,
    prefix: stat.prefix,
    suffix: stat.suffix,
    format: stat.format,
    lastFormat: stat.lastFormat,
  };
  const { formattedValue, formattedLastMonth, trend } = useStatCard(data);
  const hasTrend = stat.delta !== undefined || stat.lastMonth !== undefined;
  // `positive` responde "subir é bom?"; o hook trata como "a variação foi boa?"
  const good = (trend.direction === "up") === (stat.positive ?? true);
  return {
    value: typeof stat.value === "string" ? stat.value : formattedValue,
    trendLabel: hasTrend
      ? `${trend.direction === "down" ? "↓" : "↑"} ${PERCENT.format(trend.delta)}%`
      : null,
    trendColor: trendClass(trend.direction, good),
    context: stat.subtitle ?? (formattedLastMonth ? `sobre ${formattedLastMonth}` : null),
  };
}

function GridMetric({ stat }: { stat: StatItem }) {
  const metric = useMetric(stat);
  return (
    <div className="flex flex-col gap-2 border-border py-5 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
      <dt className="text-sm text-muted-foreground">{stat.title}</dt>
      <dd className="font-mono text-[32px] font-medium leading-none tracking-tight">
        {metric.value}
      </dd>
      {(metric.trendLabel || metric.context) && (
        <dd className="flex flex-wrap gap-1.5 text-[13px] text-muted-foreground">
          {metric.trendLabel && (
            <span className={cn("font-semibold", metric.trendColor)}>{metric.trendLabel}</span>
          )}
          {metric.context && <span>{metric.context}</span>}
        </dd>
      )}
    </div>
  );
}

function ListMetric({ stat }: { stat: StatItem }) {
  const metric = useMetric(stat);
  return (
    <div className="contents">
      <dt className="border-t border-border py-3 text-foreground/80">{stat.title}</dt>
      <dd className="border-t border-border py-3 text-right font-mono">{metric.value}</dd>
      <dd className="border-t border-border py-3 pl-6 text-muted-foreground">
        {metric.trendLabel ? (
          <span className={metric.trendColor}>{metric.trendLabel}</span>
        ) : (
          metric.context
        )}
      </dd>
    </div>
  );
}

const StatsGrid = React.forwardRef<HTMLDivElement, StatsGridProps>(
  (
    { stats, layout = "grid", loading = false, skeletonCount, className, columns, ...props },
    ref
  ) => {
    if (loading) {
      // Determina o número de skeletons: usa skeletonCount, ou stats.length (se > 0), ou 3 por padrão
      const count = skeletonCount ?? (stats.length > 0 ? stats.length : 3);
      const skeletonIds = Array.from({ length: count }, (_, i) => `stats-skeleton-${i}`);
      return (
        <div
          ref={ref}
          aria-busy="true"
          className={cn(
            "grid grid-cols-1 border-t border-border",
            gridColumns(columns, count),
            className
          )}
        >
          {skeletonIds.map((id) => (
            <div key={id} className="flex flex-col gap-3 py-5 sm:px-6 sm:first:pl-0">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (layout === "list") {
      return (
        <div ref={ref} className={className} {...props}>
          <dl className="grid max-w-3xl grid-cols-[minmax(0,1fr)_auto_minmax(160px,auto)] text-sm">
            {stats.map((stat) => (
              <ListMetric key={stat.id} stat={stat} />
            ))}
          </dl>
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        <dl
          className={cn(
            "grid grid-cols-1 border-t border-border",
            gridColumns(columns, stats.length)
          )}
        >
          {stats.map((stat) => (
            <GridMetric key={stat.id} stat={stat} />
          ))}
        </dl>
      </div>
    );
  }
);

StatsGrid.displayName = "StatsGrid";

export { StatsGrid };
