/**
 * ChartAreaInteractive Component - Flowtomic UI
 *
 * Gráfico de área com as duas séries empilhadas e o período escolhido por botões visíveis
 * (antes era um select escondido no celular).
 */

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../atoms/data-display/chart";

export type ChartAreaInteractiveDataPoint = {
  date: string;
  desktop: number;
  mobile: number;
};

export type ChartAreaInteractiveProps = {
  /**
   * Dados do gráfico
   */
  data?: ChartAreaInteractiveDataPoint[];
  /**
   * Configuração do gráfico
   */
  config?: ChartConfig;
  /**
   * Título da seção
   * @default "Visitas"
   */
  title?: string;
  /**
   * Texto abaixo do título. Só aparece quando é passado.
   */
  description?: string;
  /**
   * Valor inicial do filtro de tempo
   * @default "90d"
   */
  defaultTimeRange?: "7d" | "30d" | "90d";
  /**
   * Altura do gráfico
   * @default "250px"
   */
  height?: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
};

const defaultChartData: ChartAreaInteractiveDataPoint[] = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const defaultChartConfig = {
  visitors: {
    label: "Visitas",
  },
  desktop: {
    label: "Computador",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Celular",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

type TimeRange = "7d" | "30d" | "90d";

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "3 meses", days: 90 },
];

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// "2026-06-01" sozinho o Date lê como meia-noite UTC, que no Brasil ainda é 31/05.
function parseDay(value: string | number | Date): Date {
  if (typeof value === "string") {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly)
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}

function shortDay(value: string | number | Date): string {
  const d = parseDay(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function ChartAreaInteractive({
  data = defaultChartData,
  config = defaultChartConfig,
  title = "Visitas",
  description,
  defaultTimeRange = "90d",
  height = "250px",
  className,
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(defaultTimeRange);

  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    const referenceDate = parseDay(data[data.length - 1]?.date || new Date());
    const days = TIME_RANGES.find((r) => r.value === timeRange)?.days ?? 90;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - days);
    return data.filter((item) => parseDay(item.date) >= startDate);
  }, [data, timeRange]);

  return (
    <section className={cn("text-sm", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="h-px flex-1 bg-border" />
        <fieldset className="m-0 flex min-w-0 rounded-lg border-0 bg-muted p-0.5">
          <legend className="sr-only">Período</legend>
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              aria-pressed={timeRange === range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "h-7 rounded-md px-2.5 text-[13px] font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                timeRange === range.value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </fieldset>
      </div>
      {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      <ChartContainer config={config} className="mt-5 aspect-auto w-full" style={{ height }}>
        <AreaChart data={filteredData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={shortDay}
            className="font-mono"
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  parseDay(value as string | number | Date).toLocaleDateString("pt-BR")
                }
                indicator="dot"
              />
            }
          />
          {/* Preenchimento chapado e fraco: gradiente de cima a baixo é enfeite de template. */}
          <Area
            dataKey="mobile"
            type="monotone"
            fill="var(--color-mobile)"
            fillOpacity={0.12}
            stroke="var(--color-mobile)"
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="monotone"
            fill="var(--color-desktop)"
            fillOpacity={0.16}
            stroke="var(--color-desktop)"
            stackId="a"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}

ChartAreaInteractive.displayName = "ChartAreaInteractive";
