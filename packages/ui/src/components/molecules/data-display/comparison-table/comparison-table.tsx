/**
 * ComparisonTable - Flowtomic UI
 *
 * Recursos (linhas) por opções (colunas), com uma coluna em destaque. Em contêiner
 * estreito vira um seletor de opção (abas) e uma lista de recursos.
 * Spec: docs/clean-room/sites/comparison-table.md
 */

import { Check, HelpCircle, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export type ComparisonValue = boolean | "partial" | React.ReactNode;

export type ComparisonOption = {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
};

export type ComparisonFeature = {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Conteúdo do tooltip do botão "?" */
  description?: React.ReactNode;
  href?: string;
  onSelect?: () => void;
  /** Valores por id de opção; ausente conta como "Não" */
  values: Record<string, ComparisonValue>;
};

export type ComparisonGroup = {
  id: string;
  label: React.ReactNode;
  features: ComparisonFeature[];
};

export type ComparisonTableProps = React.ComponentProps<"div"> & {
  options: ComparisonOption[];
  features: ComparisonFeature[] | ComparisonGroup[];
  /** Id da opção destacada */
  highlight?: string;
  highlightLabel?: React.ReactNode;
  /** Cabeçalho da primeira coluna */
  title?: React.ReactNode;
  /** Complemento ao lado do título */
  titleHint?: React.ReactNode;
  /** Nome acessível; padrão = title em texto */
  caption?: string;
  /**
   * `auto` mede o contêiner (estreito abaixo de 640 px); `table` e `stacked` forçam
   * um modo. Útil em testes, onde o ResizeObserver não dispara.
   * @default "auto"
   */
  layout?: "auto" | "table" | "stacked";
};

const NARROW_BREAKPOINT = 640;

type Entry =
  | { type: "group"; group: ComparisonGroup }
  | { type: "feature"; feature: ComparisonFeature };

function isGroups(
  features: ComparisonFeature[] | ComparisonGroup[]
): features is ComparisonGroup[] {
  return features.length > 0 && "features" in features[0];
}

function toEntries(features: ComparisonFeature[] | ComparisonGroup[]): Entry[] {
  if (isGroups(features)) {
    return features.flatMap((group) => [
      { type: "group" as const, group },
      ...group.features.map((feature) => ({ type: "feature" as const, feature })),
    ]);
  }
  return (features as ComparisonFeature[]).map((feature) => ({ type: "feature", feature }));
}

type ValueKind = "yes" | "no" | "partial" | "custom";

function valueKind(value: ComparisonValue | undefined): ValueKind {
  if (value === true) return "yes";
  if (value === false || value === undefined || value === null) return "no";
  if (value === "partial") return "partial";
  return "custom";
}

function ValueContent({
  value,
  highlighted,
}: {
  value: ComparisonValue | undefined;
  highlighted: boolean;
}) {
  const kind = valueKind(value);
  if (kind === "yes") {
    return (
      <span
        className={cn(
          "flex items-center justify-center text-foreground",
          highlighted && "mx-auto size-6 rounded-full bg-primary text-primary-foreground"
        )}
      >
        <Check aria-hidden="true" className="size-4" />
        <span className="sr-only">Sim</span>
      </span>
    );
  }
  if (kind === "no") {
    return (
      <span className="flex items-center justify-center text-muted-foreground">
        <X aria-hidden="true" className="size-4" />
        <span className="sr-only">Não</span>
      </span>
    );
  }
  if (kind === "partial") {
    return (
      <span role="img" aria-label="Parcial" className="block text-center text-muted-foreground">
        {"—"}
      </span>
    );
  }
  const numeric = typeof value === "number" || (typeof value === "string" && /\d/.test(value));
  return <span className={cn("block text-center", numeric && "font-mono")}>{value}</span>;
}

function FeatureName({ feature }: { feature: ComparisonFeature }) {
  const clickable = "underline decoration-dotted underline-offset-4 hover:text-primary";
  const label = feature.label;
  let name: React.ReactNode = label;
  if (feature.href) {
    name = (
      <a href={feature.href} onClick={feature.onSelect} className={clickable}>
        {label}
      </a>
    );
  } else if (feature.onSelect) {
    name = (
      <button type="button" onClick={feature.onSelect} className={cn(clickable, "text-left")}>
        {label}
      </button>
    );
  }
  const labelText = typeof label === "string" ? label : "";
  return (
    <span className="flex min-w-0 items-center gap-2">
      {feature.icon ? (
        <span className="shrink-0 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
          {feature.icon}
        </span>
      ) : null}
      <span className="min-w-0">{name}</span>
      {feature.description ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={labelText ? `Sobre ${labelText}` : "Sobre este recurso"}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HelpCircle aria-hidden="true" className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{feature.description}</TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  );
}

const HIGHLIGHT_BG = "bg-[color-mix(in_oklch,var(--primary)_10%,var(--card))]";
const HIGHLIGHT_DIVIDER = "border-b-[color-mix(in_oklch,var(--primary)_25%,transparent)]";

function stripClasses(highlighted: boolean, first: boolean, last: boolean) {
  return cn(
    "border-x",
    highlighted ? cn("border-x-primary", HIGHLIGHT_BG) : "border-x-border bg-card",
    first && cn("rounded-t-xl border-t", highlighted ? "border-t-primary" : "border-t-border"),
    last
      ? cn("rounded-b-xl border-b", highlighted ? "border-b-primary" : "border-b-border")
      : cn("border-b", highlighted ? HIGHLIGHT_DIVIDER : "border-b-border")
  );
}

function ComparisonTable({
  options,
  features,
  highlight,
  highlightLabel,
  title,
  titleHint,
  caption,
  layout = "auto",
  className,
  ref,
  ...props
}: ComparisonTableProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const labelId = React.useId();
  const [measuredNarrow, setMeasuredNarrow] = React.useState(false);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || layout !== "auto" || typeof ResizeObserver === "undefined") return;
    const apply = (width: number) => {
      if (width > 0) setMeasuredNarrow(width < NARROW_BREAKPOINT);
    };
    apply(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) apply(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout]);

  const narrow = layout === "stacked" || (layout === "auto" && measuredNarrow);
  const entries = React.useMemo(() => toEntries(features), [features]);
  const accessibleName = caption ?? (typeof title === "string" ? title : "Comparação");
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const activeOption =
    options.find((o) => o.id === selected)?.id ??
    options.find((o) => o.id === highlight)?.id ??
    options[0]?.id;

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  if (narrow) {
    return (
      <TooltipProvider>
        <div
          ref={setRefs}
          data-slot="comparison-table"
          data-layout="stacked"
          className={cn("w-full", className)}
          {...props}
        >
          <Tabs value={activeOption} onValueChange={setSelected} aria-label={accessibleName}>
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
              {options.map((option) => (
                <TabsTrigger key={option.id} value={option.id} className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {option.icon ? (
                        <span aria-hidden="true" className="inline-flex shrink-0 [&_svg]:size-4">
                          {option.icon}
                        </span>
                      ) : null}
                      {option.label}
                    </span>
                    {option.id === highlight && highlightLabel ? (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                        {highlightLabel}
                      </span>
                    ) : null}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {options.map((option) => (
              <TabsContent key={option.id} value={option.id}>
                <ul className="divide-y divide-border rounded-xl border bg-card">
                  {entries.map((entry) =>
                    entry.type === "group" ? (
                      <li
                        key={`g-${entry.group.id}`}
                        data-slot="comparison-table-group"
                        className="bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground"
                      >
                        {entry.group.label}
                      </li>
                    ) : (
                      <li
                        key={entry.feature.id}
                        data-slot="comparison-table-row"
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <FeatureName feature={entry.feature} />
                        <span
                          data-slot="comparison-table-cell"
                          data-value={valueKind(entry.feature.values[option.id])}
                          className="shrink-0 text-right"
                        >
                          <ValueContent
                            value={entry.feature.values[option.id]}
                            highlighted={option.id === highlight}
                          />
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </TooltipProvider>
    );
  }

  const lastIndex = entries.length - 1;

  return (
    <TooltipProvider>
      <div
        ref={setRefs}
        data-slot="comparison-table"
        data-layout="table"
        className={cn("w-full overflow-x-auto", className)}
        {...props}
      >
        <table className="w-full border-separate border-spacing-x-2 border-spacing-y-0 text-sm">
          <caption className="sr-only">{accessibleName}</caption>
          <thead>
            <tr>
              <th scope="col" className="px-4 pb-3 text-left align-bottom font-semibold">
                {title}
                {titleHint ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {titleHint}
                  </span>
                ) : null}
              </th>
              {options.map((option) => {
                const highlighted = option.id === highlight;
                return (
                  <th
                    key={option.id}
                    scope="col"
                    data-slot="comparison-table-column"
                    data-highlighted={highlighted ? "true" : "false"}
                    aria-describedby={highlighted && highlightLabel ? labelId : undefined}
                    className={cn(
                      "px-4 py-3 text-center align-bottom font-semibold",
                      stripClasses(highlighted, true, false)
                    )}
                  >
                    {highlighted && highlightLabel ? (
                      <span id={labelId} className="mb-1 block text-xs font-medium text-primary">
                        {highlightLabel}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center justify-center gap-2">
                      {option.icon ? (
                        <span aria-hidden="true" className="[&_svg]:size-4">
                          {option.icon}
                        </span>
                      ) : null}
                      {option.label}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const last = index === lastIndex;
              if (entry.type === "group") {
                return (
                  <tr key={`g-${entry.group.id}`} data-slot="comparison-table-group">
                    <th
                      scope="rowgroup"
                      className="px-4 pt-4 pb-1 text-left text-xs font-medium text-muted-foreground"
                    >
                      {entry.group.label}
                    </th>
                    {options.map((option) => (
                      <td
                        key={option.id}
                        aria-hidden="true"
                        className={stripClasses(option.id === highlight, false, last)}
                      />
                    ))}
                  </tr>
                );
              }
              const { feature } = entry;
              return (
                <tr key={feature.id} data-slot="comparison-table-row">
                  <th scope="row" className="h-12 px-4 py-3 text-left align-middle font-normal">
                    <FeatureName feature={feature} />
                  </th>
                  {options.map((option) => {
                    const highlighted = option.id === highlight;
                    const value = feature.values[option.id];
                    return (
                      <td
                        key={option.id}
                        data-slot="comparison-table-cell"
                        data-value={valueKind(value)}
                        className={cn(
                          "h-12 px-4 py-3 text-center align-middle",
                          stripClasses(highlighted, false, last)
                        )}
                      >
                        <ValueContent value={value} highlighted={highlighted} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
ComparisonTable.displayName = "ComparisonTable";

export { ComparisonTable };
