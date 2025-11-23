/**
 * StatsGrid - Organism Component
 *
 * Grid de cards de estatísticas reutilizável.
 * Componente genérico que pode ser usado em qualquer aplicação.
 *
 * @example
 * ```tsx
 * // Delta calculado automaticamente quando lastMonth é fornecido
 * <StatsGrid
 *   stats={[
 *     {
 *       id: "1",
 *       title: "Receita Total",
 *       value: 122380,
 *       lastMonth: 105922, // delta será calculado automaticamente: +15.5%
 *       prefix: "R$ ",
 *     },
 *   ]}
 * />
 * ```
 */

import React from "react";
import { StatCard } from "@/components/molecules/data-display/stat-card/stat-card";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, Skeleton } from "../../atoms";

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendPercentage?: string;
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
  positive?: boolean;
}

export interface StatsGridProps {
  stats: StatItem[];
  layout?: "grid" | "list";
  /**
   * Quando `true`, exibe skeletons de loading no lugar dos cards.
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

const StatsGrid = React.forwardRef<HTMLDivElement, StatsGridProps>(
  (
    { stats, layout = "grid", loading = false, skeletonCount, className, columns, ...props },
    ref
  ) => {
    // Colunas customizáveis ou padrão
    const getGridCols = () => {
      if (columns) {
        const smMap: Record<number, string> = {
          1: "sm:grid-cols-1",
          2: "sm:grid-cols-2",
          3: "sm:grid-cols-3",
          4: "sm:grid-cols-4",
        };
        const mdMap: Record<number, string> = {
          1: "md:grid-cols-1",
          2: "md:grid-cols-2",
          3: "md:grid-cols-3",
          4: "md:grid-cols-4",
        };
        const lgMap: Record<number, string> = {
          1: "lg:grid-cols-1",
          2: "lg:grid-cols-2",
          3: "lg:grid-cols-3",
          4: "lg:grid-cols-4",
        };
        const smCols = columns.sm ? smMap[columns.sm] || "" : "";
        const mdCols = columns.md ? mdMap[columns.md] || "" : "";
        const lgCols = columns.lg ? lgMap[columns.lg] || "" : "";
        return `grid-cols-1 ${smCols} ${mdCols} ${lgCols}`.trim();
      }
      return layout === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-1";
    };

    const gridCols = getGridCols();

    if (loading) {
      // Determina o número de skeletons: usa skeletonCount, ou stats.length (se > 0), ou 3 por padrão
      const count = skeletonCount ?? (stats.length > 0 ? stats.length : 3);

      // Gera IDs únicos para os skeletons
      const skeletonIds = Array.from({ length: count }, (_, i) => `stats-skeleton-${i}`);

      return (
        <div ref={ref} className={cn("grid grid-cols-1 gap-6", gridCols, className)} {...props}>
          {skeletonIds.map((id) => (
            <Card key={id} className="transition-all duration-300 hover:shadow-lg border">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 sm:pb-6 border-0">
                <div className="space-y-1 flex-1 min-w-0 pr-2">
                  {/* Skeleton do título (text-xs) */}
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Skeleton do ícone (p-1.5 sm:p-2 rounded-lg) */}
                  <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
                  {/* Skeleton do valor principal (text-xl sm:text-2xl) */}
                  <Skeleton className="h-7 sm:h-8 w-32" />
                  {/* Skeleton do badge (text-xs) */}
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                {/* Skeleton do subtítulo (text-xs sm:text-sm) */}
                <Skeleton className="h-3 sm:h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("grid grid-cols-1 gap-6", gridCols, className)} {...props}>
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            trend={stat.trend}
            trendPercentage={stat.trendPercentage}
            color={stat.color}
            delta={stat.delta}
            lastMonth={stat.lastMonth}
            prefix={stat.prefix}
            suffix={stat.suffix}
            format={stat.format}
            lastFormat={stat.lastFormat}
            positive={stat.positive}
          />
        ))}
      </div>
    );
  }
);

StatsGrid.displayName = "StatsGrid";

export { StatsGrid };
