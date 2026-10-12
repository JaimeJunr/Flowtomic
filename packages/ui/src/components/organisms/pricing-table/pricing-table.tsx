/**
 * PricingTable - Flowtomic UI
 *
 * Planos lado a lado (2 a 4), um deles recomendado, com alternância opcional de período.
 * A grade responde ao tamanho do contêiner (container queries), sem medir nada em JS. Cada
 * cartão é um subgrid de 3 linhas (cabeçalho, botão, itens), então os botões ficam na mesma
 * altura em todos os cartões da mesma fileira.
 */

"use client";

import { Check, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/atoms/actions/badge";
import { Button } from "@/components/atoms/actions/button";
import { SlidingNumber } from "@/components/atoms/animation/sliding-number";
import { ToggleGroup, ToggleGroupItem } from "@/components/atoms/layout/toggle-group";
import { cn } from "@/lib/utils";

export type PricingPeriod = { id: string; label: React.ReactNode; badge?: React.ReactNode };

export type PricingPrice = {
  /** Número é formatado com Intl (`currency` e `locale`); texto fica como está. */
  amount: string | number;
  suffix?: React.ReactNode;
  /** Preço original, riscado. */
  original?: string | number;
};

export type PricingFeature = {
  label: React.ReactNode;
  included?: boolean;
  badge?: React.ReactNode;
};

export type PricingPlan = {
  id: string;
  name: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** Um preço só, ou um preço por id de período. */
  price: PricingPrice | Record<string, PricingPrice>;
  action: { label: React.ReactNode; href?: string; onClick?: () => void };
  note?: React.ReactNode;
  features: PricingFeature[];
  highlighted?: boolean;
  highlightLabel?: React.ReactNode;
};

export type PricingTableProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  plans: PricingPlan[];
  periods?: PricingPeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  /** @default "BRL" */
  currency?: string;
  /** @default "pt-BR" */
  locale?: string;
};

function isSinglePrice(price: PricingPlan["price"]): price is PricingPrice {
  return (
    "amount" in price && (typeof price.amount === "string" || typeof price.amount === "number")
  );
}

function resolvePrice(
  price: PricingPlan["price"],
  period: string | undefined,
  periods: PricingPeriod[]
): PricingPrice | undefined {
  if (isSinglePrice(price)) return price;
  const byPeriod = price as Record<string, PricingPrice>;
  if (period && byPeriod[period]) return byPeriod[period];
  for (const p of periods) {
    if (byPeriod[p.id]) return byPeriod[p.id];
  }
  return Object.values(byPeriod)[0];
}

function formatMoney(value: string | number, currency: string, locale: string): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function PriceAmount({
  amount,
  currency,
  locale,
}: {
  amount: string | number;
  currency: string;
  locale: string;
}) {
  if (typeof amount === "string") return <span>{amount}</span>;

  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).formatToParts(amount);

  const firstNumber = parts.findIndex((p) => p.type === "integer");
  const lastNumber = parts.reduce(
    (last, p, i) => (p.type === "integer" || p.type === "fraction" ? i : last),
    firstNumber
  );
  const text = (list: Intl.NumberFormatPart[]) => list.map((p) => p.value).join("");
  const prefix = text(parts.slice(0, firstNumber));
  const suffix = text(parts.slice(lastNumber + 1));

  return (
    <span className="inline-flex items-baseline">
      {prefix ? <span className="whitespace-pre">{prefix}</span> : null}
      <SlidingNumber
        number={amount}
        decimalPlaces={fractionDigits}
        decimalSeparator={parts.find((p) => p.type === "decimal")?.value ?? "."}
        thousandsSeparator={parts.find((p) => p.type === "group")?.value ?? ""}
        className="inline-flex"
      />
      {suffix ? <span className="whitespace-pre">{suffix}</span> : null}
    </span>
  );
}

function PlanCard({
  plan,
  period,
  periods,
  currency,
  locale,
}: {
  plan: PricingPlan;
  period: string | undefined;
  periods: PricingPeriod[];
  currency: string;
  locale: string;
}) {
  const nameId = React.useId();
  const badgeId = React.useId();
  const price = resolvePrice(plan.price, period, periods);
  const highlighted = Boolean(plan.highlighted);
  const hasBadge = highlighted && plan.highlightLabel != null;
  const { action } = plan;

  const actionButton = action.href ? (
    <Button asChild variant={highlighted ? "default" : "outline"} className="w-full">
      <a href={action.href} onClick={action.onClick}>
        {action.label}
      </a>
    </Button>
  ) : (
    <Button
      type="button"
      variant={highlighted ? "default" : "outline"}
      className="w-full"
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );

  return (
    <section
      data-slot="pricing-table-plan"
      data-highlighted={highlighted ? "true" : undefined}
      aria-labelledby={hasBadge ? `${nameId} ${badgeId}` : nameId}
      className={cn(
        "row-span-3 grid grid-rows-subgrid gap-5 rounded-lg border p-6 text-card-foreground",
        highlighted
          ? "order-first border-primary bg-[color-mix(in_oklch,var(--primary)_6%,var(--card))] @min-[640px]:order-none"
          : "border-border bg-card"
      )}
    >
      <div className="flex flex-col gap-3">
        {hasBadge ? (
          <Badge id={badgeId} className="w-fit">
            {plan.highlightLabel}
          </Badge>
        ) : null}
        <h3
          id={nameId}
          className="flex items-center gap-2 font-mono text-sm font-medium text-muted-foreground [&_svg]:size-4"
        >
          {plan.icon}
          {plan.name}
        </h3>

        {price ? (
          <div className="flex flex-col gap-1">
            <div
              data-slot="pricing-table-price"
              className={cn(
                "flex flex-wrap items-baseline gap-x-2",
                highlighted ? "text-primary" : "text-foreground"
              )}
            >
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                <PriceAmount amount={price.amount} currency={currency} locale={locale} />
              </span>
              {price.suffix ? (
                <span className="text-sm font-normal text-muted-foreground">{price.suffix}</span>
              ) : null}
            </div>
            {price.original != null ? (
              <p data-slot="pricing-table-original-price" className="text-sm text-muted-foreground">
                <span className="sr-only">Antes: </span>
                <s>{formatMoney(price.original, currency, locale)}</s>
              </p>
            ) : null}
          </div>
        ) : null}

        {plan.description ? (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 self-start">
        {actionButton}
        {plan.note ? (
          <p className="text-center text-xs text-muted-foreground">{plan.note}</p>
        ) : null}
      </div>

      <ul data-slot="pricing-table-features" className="flex flex-col gap-2.5 text-sm">
        {plan.features.map((feature, index) => {
          const included = feature.included !== false;
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: lista estática, sem ids
              key={index}
              data-slot="pricing-table-feature"
              data-included={included ? "true" : "false"}
              className={cn(
                "flex items-start gap-2",
                included ? "text-foreground" : "text-muted-foreground line-through opacity-70"
              )}
            >
              {included ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              ) : (
                <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              )}
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {included ? null : <span className="sr-only">Não incluso: </span>}
                <span>{feature.label}</span>
                {feature.badge ? (
                  <Badge variant="secondary" className="no-underline">
                    {feature.badge}
                  </Badge>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const GRID_BY_COUNT: Record<number, string> = {
  1: "mx-auto max-w-md",
  2: "@min-[640px]:grid-cols-2",
  3: "@min-[768px]:grid-cols-3",
  4: "@min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4",
};

/** Planos lado a lado com um destacado e alternância opcional de período. */
function PricingTable({
  className,
  plans,
  periods = [],
  period: periodProp,
  defaultPeriod,
  onPeriodChange,
  currency = "BRL",
  locale = "pt-BR",
  ...props
}: PricingTableProps) {
  const [innerPeriod, setInnerPeriod] = React.useState(defaultPeriod ?? periods[0]?.id);
  const controlled = periodProp !== undefined;
  const period = controlled ? periodProp : innerPeriod;

  const handleChange = (next: string) => {
    if (!next) return;
    if (!controlled) setInnerPeriod(next);
    onPeriodChange?.(next);
  };

  const columns = GRID_BY_COUNT[Math.min(Math.max(plans.length, 1), 4)];

  return (
    <div data-slot="pricing-table" className={cn("@container w-full", className)} {...props}>
      <div className="flex flex-col gap-8">
        {periods.length > 0 ? (
          <div data-slot="pricing-table-periods" className="flex justify-center">
            <ToggleGroup
              type="single"
              variant="outline"
              role="radiogroup"
              aria-label="Período de cobrança"
              value={period}
              onValueChange={handleChange}
            >
              {periods.map((p) => (
                <ToggleGroupItem key={p.id} value={p.id} className="gap-2">
                  {p.label}
                  {p.badge ? (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[0.6875rem]">
                      {p.badge}
                    </Badge>
                  ) : null}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ) : null}
        <div className={cn("grid grid-cols-1 items-stretch gap-4", columns)}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              period={period}
              periods={periods}
              currency={currency}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

PricingTable.displayName = "PricingTable";

export { PricingTable };
