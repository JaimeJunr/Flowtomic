import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { MotionConfigContext, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export type StatusState = "operational" | "degraded" | "outage" | "maintenance";

export type StatusHistoryPoint = {
  /** Data ou rótulo do período, mostrado no tooltip da barra. */
  label: string;
  /** Estado do período; `null` quando não há dado. */
  status: StatusState | null;
};

export type StatusListItem = {
  id: string;
  name: React.ReactNode;
  icon?: React.ReactNode;
  status: StatusState;
  /** Sobrescreve o texto do selo. */
  statusLabel?: React.ReactNode;
  /** Quando o estado foi conferido; esconde o "Atualizado há" se ausente. */
  updatedAt?: Date | number | string;
  history?: StatusHistoryPoint[];
  detailTitle?: React.ReactNode;
  content?: React.ReactNode;
};

export type StatusListProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  items: StatusListItem[];
  /** Mostra o número da linha (001, 002...). */
  numbered?: boolean;
  /** Permite várias linhas abertas ao mesmo tempo. */
  multiple?: boolean;
  /** Ids das linhas abertas (controlado). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  locale?: string;
  /** Instante de referência do "Atualizado há"; padrão: agora. */
  now?: Date | number;
};

const STATE_TEXT: Record<StatusState, string> = {
  operational: "Operacional",
  degraded: "Degradado",
  outage: "Fora do ar",
  maintenance: "Manutenção",
};

const STATE_CLASSES: Record<
  StatusState,
  { dot: string; badge: string; text: string; bar: string; open: string }
> = {
  operational: {
    dot: "bg-success shadow-[0_0_0_3px_color-mix(in_oklch,var(--success)_25%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-success",
    text: "text-success",
    bar: "bg-success",
    open: "data-[state=open]:border-[color-mix(in_oklch,var(--success)_60%,var(--border))]",
  },
  degraded: {
    dot: "bg-warning shadow-[0_0_0_3px_color-mix(in_oklch,var(--warning)_25%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--warning)_15%,transparent)] text-warning",
    text: "text-warning",
    bar: "bg-warning",
    open: "data-[state=open]:border-[color-mix(in_oklch,var(--warning)_60%,var(--border))]",
  },
  outage: {
    dot: "bg-destructive shadow-[0_0_0_3px_color-mix(in_oklch,var(--destructive)_25%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--destructive)_15%,transparent)] text-destructive",
    text: "text-destructive",
    bar: "bg-destructive",
    open: "data-[state=open]:border-[color-mix(in_oklch,var(--destructive)_60%,var(--border))]",
  },
  maintenance: {
    dot: "bg-muted-foreground shadow-[0_0_0_3px_color-mix(in_oklch,var(--muted-foreground)_25%,transparent)]",
    badge: "bg-[color-mix(in_oklch,var(--muted-foreground)_15%,transparent)] text-muted-foreground",
    text: "text-muted-foreground",
    bar: "bg-muted-foreground",
    open: "data-[state=open]:border-[color-mix(in_oklch,var(--muted-foreground)_60%,var(--border))]",
  },
};

function toMillis(value: Date | number | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function formatUpdated(updatedAt: Date | number | string, now: number, locale: string): string {
  const diffSeconds = Math.max(0, Math.round((now - toMillis(updatedAt)) / 1000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  let text: string;
  if (diffSeconds < 60) text = rtf.format(-diffSeconds, "second");
  else if (diffSeconds < 3600) text = rtf.format(-Math.floor(diffSeconds / 60), "minute");
  else if (diffSeconds < 86400) text = rtf.format(-Math.floor(diffSeconds / 3600), "hour");
  else text = rtf.format(-Math.floor(diffSeconds / 86400), "day");
  return `Atualizado ${text}`;
}

function summarizeHistory(history: StatusHistoryPoint[]) {
  const withData = history.filter((point) => point.status !== null);
  const operational = withData.filter((point) => point.status === "operational").length;
  return { operational, total: withData.length };
}

function useShouldReduceMotion(): boolean {
  const reducedMotionConfig = React.useContext(MotionConfigContext).reducedMotion;
  const prefersReduced = useReducedMotion();
  return Boolean(prefersReduced) || reducedMotionConfig === "always";
}

function HistoryBars({
  history,
  reduceMotion,
}: {
  history: StatusHistoryPoint[];
  reduceMotion: boolean;
}) {
  const { operational, total } = summarizeHistory(history);
  const count = history.length;
  return (
    <TooltipProvider delayDuration={100}>
      <div
        data-slot="status-list-history"
        role="img"
        aria-label={`Histórico: ${operational} de ${total} períodos operacionais`}
        className="flex h-10 items-stretch gap-0.5 @max-[480px]:gap-px"
      >
        {history.map((point, index) => {
          const key = `${index}-${point.label}`;
          const stateText = point.status ? STATE_TEXT[point.status] : "Sem dados";
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <motion.span
                  data-slot="status-list-bar"
                  data-status={point.status ?? "none"}
                  className={cn(
                    "min-w-0 flex-1 origin-bottom rounded-[2px]",
                    point.status ? STATE_CLASSES[point.status].bar : "bg-muted"
                  )}
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: 0.1,
                    ease: "easeOut",
                    delay: reduceMotion ? 0 : (index / Math.max(count, 1)) * 0.3,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                {point.label}: {stateText}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function RowHeader({
  item,
  index,
  numbered,
  updatedText,
  hasDetail,
}: {
  item: StatusListItem;
  index: number;
  numbered: boolean;
  updatedText: string | null;
  hasDetail: boolean;
}) {
  const classes = STATE_CLASSES[item.status];
  return (
    <>
      {numbered && (
        <span
          aria-hidden="true"
          className="w-8 shrink-0 font-mono text-sm text-muted-foreground @max-[480px]:hidden"
        >
          {String(index + 1).padStart(3, "0")}
        </span>
      )}
      {item.icon && (
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {item.icon}
        </span>
      )}
      <span className="min-w-0 truncate text-lg text-foreground @max-[480px]:whitespace-normal @max-[480px]:text-base">
        {item.name}
      </span>
      <span className="sr-only">, </span>
      <span
        data-slot="status-list-badge"
        className={cn(
          "order-3 shrink-0 rounded-md px-2 py-0.5 font-mono text-sm @max-[480px]:ml-auto",
          classes.badge
        )}
      >
        {item.statusLabel ?? STATE_TEXT[item.status]}
      </span>
      {updatedText && (
        <>
          <span className="sr-only">, </span>
          <span className="order-2 shrink-0 text-sm text-muted-foreground @max-[640px]:sr-only">
            {updatedText}
          </span>
        </>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "order-1 ml-auto size-2 shrink-0 rounded-full @max-[480px]:hidden",
          classes.dot
        )}
      />
      {hasDetail && (
        <ChevronDown
          aria-hidden="true"
          className="order-4 size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]/trigger:rotate-180"
        />
      )}
    </>
  );
}

const ROW_LAYOUT = "flex w-full items-center gap-3 px-4 py-4 text-left";

function StatusList({
  items,
  numbered = true,
  multiple = true,
  value,
  defaultValue,
  onValueChange,
  locale = "pt-BR",
  now,
  className,
  ...props
}: StatusListProps) {
  const reduceMotion = useShouldReduceMotion();
  const reference = now === undefined ? Date.now() : toMillis(now);

  const rootProps = multiple
    ? ({ type: "multiple", value, defaultValue, onValueChange } as const)
    : ({
        type: "single",
        collapsible: true,
        value: value === undefined ? undefined : (value[0] ?? ""),
        defaultValue: defaultValue?.[0],
        onValueChange: onValueChange
          ? (next: string) => onValueChange(next ? [next] : [])
          : undefined,
      } as const);

  return (
    <div data-slot="status-list" className={cn("@container w-full", className)} {...props}>
      <Accordion asChild {...(rootProps as React.ComponentProps<typeof Accordion>)}>
        <ul className="flex flex-col gap-3">
          {items.map((item, index) => {
            const hasDetail = Boolean((item.history && item.history.length > 0) || item.content);
            const updatedText =
              item.updatedAt === undefined
                ? null
                : formatUpdated(item.updatedAt, reference, locale);
            const classes = STATE_CLASSES[item.status];
            const rowClass = cn(
              "overflow-hidden rounded-xl border bg-card text-card-foreground last:border-b",
              classes.open
            );
            const header = (
              <RowHeader
                item={item}
                index={index}
                numbered={numbered}
                updatedText={updatedText}
                hasDetail={hasDetail}
              />
            );

            if (!hasDetail) {
              return (
                <li key={item.id}>
                  <div
                    data-slot="status-list-item"
                    data-status={item.status}
                    data-state="closed"
                    className={rowClass}
                  >
                    <div className={ROW_LAYOUT}>{header}</div>
                  </div>
                </li>
              );
            }

            const availability =
              item.history && item.history.length > 0 ? summarizeHistory(item.history) : null;
            const percent =
              availability && availability.total > 0
                ? (availability.operational / availability.total) * 100
                : null;

            return (
              <li key={item.id}>
                <AccordionItem
                  value={item.id}
                  data-slot="status-list-item"
                  data-status={item.status}
                  className={rowClass}
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={cn(
                        ROW_LAYOUT,
                        "group/trigger cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                      )}
                    >
                      {header}
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent className="px-4 pb-4">
                    {item.history && item.history.length > 0 && (
                      <HistoryBars history={item.history} reduceMotion={reduceMotion} />
                    )}
                    {(item.detailTitle || percent !== null) && (
                      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{item.detailTitle}</span>
                        {percent !== null && (
                          <span className={cn("ml-auto font-mono", classes.text)}>
                            {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
                              percent
                            )}
                            % disponível
                          </span>
                        )}
                      </div>
                    )}
                    {item.content && <div className="mt-4">{item.content}</div>}
                  </AccordionContent>
                </AccordionItem>
              </li>
            );
          })}
        </ul>
      </Accordion>
    </div>
  );
}

StatusList.displayName = "StatusList";

export { StatusList };
