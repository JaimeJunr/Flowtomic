"use client";

/**
 * MetricStrip Component - Flowtomic UI
 *
 * Faixa de números de produto: um `<dl>` em colunas, linhas ou texto corrido,
 * com contagem animada opcional. Lê "rótulo: número" no leitor de tela, mesmo
 * com o número aparecendo em cima do rótulo.
 *
 * Implementação clean room — spec em docs/clean-room/sites/metric-strip.md
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { CountUp, countDecimals, formatCountUp } from "../../../atoms/typography/count-up/count-up";

export type Metric = {
  id: string;
  value: number;
  /** Vai no `<dt>`. */
  label: React.ReactNode;
  /** Linha extra em muted (variantes `columns` e `rows`). */
  description?: React.ReactNode;
  /** "R$ ", "+" */
  prefix?: React.ReactNode;
  /** "+", "%" — no tamanho do número. */
  suffix?: React.ReactNode;
  /** "ms", "mi" — menor, alinhada à base. */
  unit?: React.ReactNode;
  /** Substitui o número formatado. */
  display?: React.ReactNode;
  formatOptions?: Intl.NumberFormatOptions;
  /** O item inteiro vira link (`columns` e `rows`). */
  href?: string;
};

export type MetricStripProps = Omit<React.ComponentProps<"dl">, "children"> & {
  items: Metric[];
  variant?: "columns" | "rows" | "inline";
  size?: "md" | "lg" | "xl";
  mono?: boolean;
  /** Número em `--primary`. Padrão: `true` só na variante `inline`. */
  accent?: boolean;
  /** Réguas entre as colunas (variante `columns`). */
  dividers?: boolean;
  /** Ponto entre os itens (variante `inline`). */
  separator?: "none" | "dot";
  /** Conta de 0 até o valor quando o item entra na tela. */
  animate?: boolean;
  durationMs?: number;
  locale?: string;
};

// Classes literais: o Tailwind não gera classe montada por interpolação.
const SIZE_CLASS = {
  md: "text-3xl",
  lg: "text-display-xs",
  xl: "text-display-md",
} as const;

const WIDE_COLUMNS: Record<number, string> = {
  2: "@min-[768px]:grid-cols-2",
  3: "@min-[768px]:grid-cols-3",
  4: "@min-[768px]:grid-cols-4",
};

const VARIANT_CLASS = {
  columns: "grid grid-cols-1 gap-x-0 gap-y-6 @min-[420px]:grid-cols-2",
  rows: "flex flex-col",
  inline: "flex flex-wrap items-baseline gap-x-6 gap-y-2",
} as const;

const ITEM_CLASS = {
  columns: "relative flex flex-col gap-1",
  rows: "relative grid grid-cols-1 gap-x-6 gap-y-1 border-t border-border py-4 first:border-t-0 first:pt-0 @min-[480px]:grid-cols-[auto_1fr]",
  inline: "relative flex items-baseline gap-2",
} as const;

const DIVIDER_ITEM_CLASS =
  "border-t border-border pt-4 first:border-t-0 first:pt-0 @min-[420px]:nth-2:border-t-0 @min-[420px]:nth-2:pt-0 @min-[768px]:border-t-0 @min-[768px]:border-l @min-[768px]:pt-0 @min-[768px]:pl-6 @min-[768px]:first:border-l-0 @min-[768px]:first:pl-0";

type MetricItemProps = {
  metric: Metric;
  variant: NonNullable<MetricStripProps["variant"]>;
  size: NonNullable<MetricStripProps["size"]>;
  mono: boolean;
  accent: boolean;
  dividers: boolean;
  dot: boolean;
  animate: boolean;
  durationMs: number;
  locale: string;
};

function MetricNumber({
  metric,
  animate,
  durationMs,
  locale,
}: Pick<MetricItemProps, "metric" | "animate" | "durationMs" | "locale">) {
  if (metric.display !== undefined) return <>{metric.display}</>;
  if (animate) {
    return (
      <CountUp
        to={metric.value}
        durationMs={durationMs}
        locale={locale}
        formatOptions={metric.formatOptions}
      />
    );
  }
  return (
    <>{formatCountUp(metric.value, locale, countDecimals(metric.value), metric.formatOptions)}</>
  );
}

function MetricItem(props: MetricItemProps) {
  const { metric, variant, size, mono, accent, dividers, dot } = props;
  const valueId = React.useId();
  const linked = metric.href !== undefined && variant !== "inline";
  const label = linked ? (
    <a
      href={metric.href}
      aria-describedby={valueId}
      className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring"
    >
      {metric.label}
    </a>
  ) : (
    metric.label
  );

  return (
    <div
      data-slot="metric-strip-item"
      className={cn(ITEM_CLASS[variant], variant === "columns" && dividers && DIVIDER_ITEM_CLASS)}
    >
      {dot ? (
        <span
          aria-hidden="true"
          data-slot="metric-strip-separator"
          className="absolute top-1/2 -left-3.5 size-1 -translate-y-1/2 rounded-full bg-border"
        />
      ) : null}
      <dt
        data-slot="metric-strip-label"
        className={cn(
          variant === "rows" && "text-lg font-medium text-foreground",
          variant === "inline" && "text-sm text-muted-foreground",
          variant === "columns" && "text-sm text-muted-foreground"
        )}
      >
        {label}
        {metric.description && variant !== "inline" ? (
          <span
            data-slot="metric-strip-description"
            className="mt-1 block text-sm font-normal text-muted-foreground"
          >
            {metric.description}
          </span>
        ) : null}
      </dt>
      <dd
        id={valueId}
        data-slot="metric-strip-value"
        className={cn(
          "order-first m-0 min-w-0 font-semibold tracking-tight tabular-nums",
          variant === "rows" && "min-w-[7ch]",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        <span className={cn(SIZE_CLASS[size], mono && "font-mono")}>
          {metric.prefix}
          <MetricNumber {...props} />
          {metric.suffix}
          {metric.unit ? (
            <span data-slot="metric-strip-unit" className="ml-0.5 align-baseline text-[0.5em]">
              {metric.unit}
            </span>
          ) : null}
        </span>
      </dd>
    </div>
  );
}

function MetricStrip({
  items,
  variant = "columns",
  size = "lg",
  mono = false,
  accent,
  dividers = false,
  separator = "none",
  animate = false,
  durationMs = 1200,
  locale = "pt-BR",
  className,
  ref,
  ...props
}: MetricStripProps) {
  return (
    // Container query só estiliza descendentes: o @container fica num wrapper
    // e o <dl> (que ganha as colunas) é filho dele.
    <div data-slot="metric-strip-container" className="@container">
      <dl
        ref={ref}
        data-slot="metric-strip"
        data-variant={variant}
        className={cn(
          VARIANT_CLASS[variant],
          variant === "columns" && WIDE_COLUMNS[Math.min(items.length, 4)],
          className
        )}
        {...props}
      >
        {items.map((metric, index) => (
          <MetricItem
            key={metric.id}
            metric={metric}
            variant={variant}
            size={size}
            mono={mono}
            accent={accent ?? variant === "inline"}
            dividers={dividers}
            dot={variant === "inline" && separator === "dot" && index > 0}
            animate={animate}
            durationMs={durationMs}
            locale={locale}
          />
        ))}
      </dl>
    </div>
  );
}

MetricStrip.displayName = "MetricStrip";

export { MetricStrip };
