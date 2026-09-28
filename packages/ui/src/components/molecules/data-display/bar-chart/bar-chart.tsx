/**
 * BarChart - Componente Visual
 *
 * Gráfico de barras simples em SVG puro. Valores e rótulos em mono; barra de valor
 * zero vira um traço na linha de base, para o dia vazio não sumir do gráfico.
 */

import { cn } from "@/lib/utils";

export interface BarChartDataPoint {
  /**
   * Label da barra
   */
  label: string;

  /**
   * Valor da barra
   */
  value: number;

  /**
   * Cor da barra (opcional)
   */
  color?: string;
}

export interface BarChartProps {
  /**
   * Dados do gráfico
   */
  data: BarChartDataPoint[];

  /**
   * Título da seção
   */
  title?: string;

  /**
   * Altura do gráfico em pixels
   * @default 200
   */
  height?: number;

  /**
   * Cor padrão das barras
   * @default "hsl(var(--primary))"
   */
  defaultColor?: string;

  /**
   * Cor do traço de barra com valor zero
   * @default "hsl(var(--muted-foreground))"
   */
  inactiveColor?: string;

  /**
   * Se deve mostrar o valor acima de cada barra
   * @default false
   */
  showValues?: boolean;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

const CHART_WIDTH = 300;
const LABEL_SPACE = 20;
const VALUE_SPACE = 18;
const ZERO_BAR = 2;

function SectionTitle({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="mb-4 flex items-center gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Componente de gráfico de barras
 */
export function BarChart({
  data,
  title,
  height = 200,
  defaultColor = "hsl(var(--primary))",
  inactiveColor = "hsl(var(--muted-foreground))",
  showValues = false,
  className,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <section className={cn("text-sm", className)}>
        <SectionTitle title={title} />
        <p className="text-muted-foreground">Nenhum valor para mostrar.</p>
      </section>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const baseline = height - LABEL_SPACE;
  const plotHeight = baseline - VALUE_SPACE;
  const slot = CHART_WIDTH / data.length;
  const barWidth = Math.min(40, slot * 0.6);

  return (
    <section className={cn("text-sm", className)}>
      <SectionTitle title={title} />
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        role="img"
        aria-label={title || "Gráfico de barras"}
        className="overflow-visible font-mono"
      >
        <line x1={0} x2={CHART_WIDTH} y1={baseline} y2={baseline} className="stroke-border" />
        {data.map((point, index) => {
          const barHeight =
            point.value > 0 && maxValue > 0 ? (point.value / maxValue) * plotHeight : ZERO_BAR;
          const center = index * slot + slot / 2;
          const fill = point.color || (point.value > 0 ? defaultColor : inactiveColor);

          return (
            <g key={`bar-${point.label}-${index}`}>
              <rect
                x={center - barWidth / 2}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                fill={fill}
                rx={point.value > 0 ? 3 : 0}
              />
              {showValues && (
                <text
                  x={center}
                  y={baseline - barHeight - 6}
                  fontSize="11"
                  textAnchor="middle"
                  className={point.value > 0 ? "fill-foreground" : "fill-muted-foreground"}
                >
                  {point.value}
                </text>
              )}
              <text
                x={center}
                y={height - 4}
                fontSize="11"
                textAnchor="middle"
                className="fill-muted-foreground"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
