/**
 * CircularProgressChart - Componente Visual
 *
 * Anel de progresso em SVG puro. A porcentagem no centro, em mono, é a resposta;
 * o label e a legenda ficam subordinados em texto suave.
 */

import { cn } from "@/lib/utils";

export interface CircularProgressChartProps {
  /**
   * Valor atual (0-100)
   */
  value: number;

  /**
   * Valor máximo
   * @default 100
   */
  max?: number;

  /**
   * Texto abaixo da porcentagem, no centro do anel
   */
  label?: string;

  /**
   * Título da seção
   */
  title?: string;

  /**
   * Tamanho do gráfico em pixels
   * @default 160
   */
  size?: number;

  /**
   * Espessura da linha do gráfico
   * @default 10
   */
  strokeWidth?: number;

  /**
   * Cor da linha de progresso
   * @default "var(--primary)"
   */
  progressColor?: string;

  /**
   * Cor da linha de fundo
   * @default "var(--muted)"
   */
  trackColor?: string;

  /**
   * Cores para diferentes faixas de valor
   */
  colorRanges?: Array<{
    min: number;
    max: number;
    color: string;
  }>;

  /**
   * Legenda de cores (ex.: Com teste, Sem teste)
   */
  legend?: Array<{
    label: string;
    color: string;
  }>;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

function pickColor(
  percentage: number,
  fallback: string,
  ranges?: CircularProgressChartProps["colorRanges"]
): string {
  const range = ranges?.find((r) => percentage >= r.min && percentage <= r.max);
  return range?.color ?? fallback;
}

/**
 * Componente de gráfico circular de progresso
 */
export function CircularProgressChart({
  value,
  max = 100,
  label,
  title,
  size = 160,
  strokeWidth = 10,
  progressColor = "var(--primary)",
  trackColor = "var(--muted)",
  colorRanges,
  legend,
  className,
}: CircularProgressChartProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const rounded = Math.round(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const spoken = label ? `${rounded}% ${label}` : `${rounded}%`;

  return (
    <section data-slot="circular-progress-chart" className={cn("text-sm", className)}>
      {title && (
        <div className="mb-5 flex items-center gap-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={spoken}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={pickColor(percentage, progressColor, colorRanges)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <span className="font-mono text-[32px] font-medium leading-none tracking-tight">
            {rounded}%
          </span>
          {label && <span className="mt-1 text-[13px] text-muted-foreground">{label}</span>}
        </div>
      </div>

      {legend && legend.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-4 text-[13px] text-muted-foreground">
          {legend.map((item) => (
            <li key={`legend-${item.label}`} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
