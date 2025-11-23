/**
 * CircularProgressChart - Componente Visual
 *
 * Gráfico circular de progresso usando SVG puro
 */

import { Card, CardContent, CardHeader, CardTitle } from "../../../atoms";

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
   * Label central do gráfico
   */
  label?: string;

  /**
   * Título do card
   */
  title?: string;

  /**
   * Tamanho do gráfico em pixels
   * @default 200
   */
  size?: number;

  /**
   * Espessura da linha do gráfico
   * @default 12
   */
  strokeWidth?: number;

  /**
   * Cor da linha de progresso
   * @default "hsl(var(--primary))"
   */
  progressColor?: string;

  /**
   * Cor da linha de fundo
   * @default "hsl(var(--muted))"
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
   * Legenda de cores (ex: Completed, In Progress, Pending)
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

/**
 * Componente de gráfico circular de progresso
 */
export function CircularProgressChart({
  value,
  max = 100,
  label,
  title,
  size = 200,
  strokeWidth = 12,
  progressColor = "hsl(var(--primary))",
  trackColor = "hsl(var(--muted))",
  colorRanges,
  legend,
  className,
}: CircularProgressChartProps) {
  // Calcular porcentagem
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Determinar cor baseado em ranges
  let finalProgressColor = progressColor;
  if (colorRanges) {
    for (const range of colorRanges) {
      if (percentage >= range.min && percentage <= range.max) {
        finalProgressColor = range.color;
        break;
      }
    }
  }

  // Calcular raio e circunferência
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
              role="img"
              aria-label={title || label || "Circular progress chart"}
            >
              <title>{title || label || "Circular progress chart"}</title>
              {/* Track (fundo) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={trackColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                className="opacity-20"
              />
              {/* Progress (barra de progresso) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={finalProgressColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
            {/* Label central */}
            {label && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontSize: size * 0.15 }}
              >
                <div className="text-center">
                  <div className="font-bold text-foreground">{Math.round(percentage)}%</div>
                  {label && <div className="text-xs text-muted-foreground mt-1">{label}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Legenda */}
          {legend && legend.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              {legend.map((item) => (
                <div key={`legend-${item.label}`} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
