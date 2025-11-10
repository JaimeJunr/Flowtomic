/**
 * StatsGrid - Organism Component
 *
 * Grid de cards de estatísticas reutilizável.
 * Componente genérico que pode ser usado em qualquer aplicação.
 */

import React from "react";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../molecules/stat-card/stat-card";

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendPercentage?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  // Nova API com formatação avançada
  delta?: number;
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
  loading?: boolean;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const StatsGrid = React.forwardRef<HTMLDivElement, StatsGridProps>(
  ({ stats, layout = "grid", loading = false, className, columns, ...props }, ref) => {
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
      // IDs estáticos para skeletons - array nunca muda, então índices são seguros
      const skeletonIds = ["stats-skeleton-0", "stats-skeleton-1", "stats-skeleton-2"];
      return (
        <div ref={ref} className={cn("grid grid-cols-1 gap-6", gridCols, className)} {...props}>
          {skeletonIds.map((id) => (
            <div key={id} className="animate-pulse">
              <div className="bg-muted rounded-xl h-40 border-2 border-border"></div>
            </div>
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
