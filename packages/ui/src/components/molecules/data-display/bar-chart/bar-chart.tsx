/**
 * BarChart - Componente Visual
 *
 * Gráfico de barras simples para analytics usando SVG puro
 */

import { Card, CardContent, CardHeader, CardTitle } from "../../../atoms";

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
   * Título do gráfico
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
   * Cor das barras inativas/pendentes
   * @default "hsl(var(--muted))"
   */
  inactiveColor?: string;

  /**
   * Se deve mostrar valores nas barras
   * @default false
   */
  showValues?: boolean;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente de gráfico de barras
 */
export function BarChart({
  data,
  title,
  height = 200,
  defaultColor = "hsl(var(--primary))",
  inactiveColor = "hsl(var(--muted))",
  showValues = false,
  className,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular valores máximos para normalização
  const maxValue = Math.max(...data.map((d) => d.value));
  const chartPadding = 40;
  const _barWidth = Math.max(20, (height - chartPadding * 2) / data.length - 8);
  const chartWidth = 300;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full">
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${chartWidth} ${height}`}
            className="overflow-visible"
            role="img"
            aria-label={title || "Bar chart"}
          >
            <title>{title || "Bar chart"}</title>
            {data.map((point, index) => {
              const barHeight =
                maxValue > 0 ? (point.value / maxValue) * (height - chartPadding * 2) : 0;
              const x = (index * chartWidth) / data.length + chartPadding / 2;
              const y = height - chartPadding - barHeight;
              const isActive = point.value > 0;
              const fillColor = point.color || (isActive ? defaultColor : inactiveColor);

              return (
                <g key={`bar-${point.label}-${index}`}>
                  {/* Barra */}
                  <rect
                    x={x}
                    y={y}
                    width={(chartWidth - chartPadding) / data.length - 4}
                    height={barHeight}
                    fill={fillColor}
                    rx={4}
                    className="transition-all duration-300"
                  />
                  {/* Valor na barra (se showValues) */}
                  {showValues && point.value > 0 && (
                    <text
                      x={x + (chartWidth - chartPadding) / data.length / 2 - 4}
                      y={y - 5}
                      fontSize="10"
                      fill="currentColor"
                      textAnchor="middle"
                      className="fill-foreground"
                    >
                      {point.value}%
                    </text>
                  )}
                  {/* Label */}
                  <text
                    x={x + (chartWidth - chartPadding) / data.length / 2 - 4}
                    y={height - chartPadding + 15}
                    fontSize="12"
                    fill="currentColor"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
