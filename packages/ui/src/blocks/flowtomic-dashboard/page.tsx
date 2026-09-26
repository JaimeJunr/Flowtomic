/**
 * Flowtomic Dashboard Block — Entregas da semana
 *
 * Responde uma pergunta de longe: "o que está atrasado e o que vence até sexta?".
 * Tabela do que vence, meta do mês, cronômetro e quem está em quê.
 */

"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";

export type DeliveryState = "em-andamento" | "em-revisao" | "concluida";

export interface Delivery {
  id: string;
  title: string;
  /** Quem está com a entrega, por papel ("Mantenedor", "Revisora", "você") */
  owner: string;
  dueDate: Date;
  state: DeliveryState;
  /** Quando foi concluída; sem ela, a conta do mês usa o prazo */
  completedAt?: Date;
}

export interface DeliveryTimer {
  elapsedSeconds: number;
  deliveryTitle: string;
}

export interface FlowtomicDashboardProps {
  /** @default entregas de exemplo relativas a `today` */
  deliveries?: Delivery[];
  /** Data de referência para "atrasada" e "vence até sexta". @default new Date() */
  today?: Date;
  /** @default 20 */
  monthGoal?: number;
  timer?: DeliveryTimer | null;
  /** @default "Flowtomic" */
  appName?: string;
  onNewDelivery?: () => void;
  onToggleTimer?: () => void;
}

const DAY_MS = 86_400_000;
const MONO = "font-mono";
const SECTION_TITLE = "font-display text-sm font-semibold";
const NAV_ITEMS = [
  { label: "Entregas", href: "/entregas" },
  { label: "Revisões", href: "/revisoes" },
  { label: "Registry", href: "/registry" },
  { label: "Equipe", href: "/equipe" },
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

/** Sexta-feira da semana de `today`; sábado e domingo já olham a sexta seguinte. */
function nextFriday(today: Date): Date {
  const offset = (5 - today.getDay() + 7) % 7;
  return new Date(startOfDay(today).getTime() + offset * DAY_MS);
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatElapsed(totalSeconds: number): string {
  const parts = [totalSeconds / 3600, (totalSeconds % 3600) / 60, totalSeconds % 60];
  return parts.map((part) => String(Math.floor(part)).padStart(2, "0")).join(":");
}

function sampleDeliveries(today: Date): Delivery[] {
  const inDays = (days: number) => new Date(startOfDay(today).getTime() + days * DAY_MS);
  return [
    {
      id: "1",
      title: "Endpoint de health no registry",
      owner: "Mantenedor",
      dueDate: inDays(-2),
      state: "em-andamento",
    },
    {
      id: "2",
      title: "Onboarding do flowtomic-cli init",
      owner: "Revisora",
      dueDate: inDays(0),
      state: "em-revisao",
    },
    {
      id: "3",
      title: "Story do date-range-picker",
      owner: "você",
      dueDate: inDays(1),
      state: "em-andamento",
    },
    {
      id: "4",
      title: "Build do registry na Vercel",
      owner: "Mantenedor",
      dueDate: inDays(2),
      state: "em-andamento",
    },
    {
      id: "5",
      title: "Tema Urucum no theme.css",
      owner: "você",
      dueDate: inDays(-4),
      state: "concluida",
    },
  ];
}

interface WeekSummary {
  open: Delivery[];
  overdue: number;
  dueSoon: number;
  doneThisMonth: number;
}

function summarize(deliveries: Delivery[], today: Date): WeekSummary {
  const friday = nextFriday(today);
  const open = deliveries
    .filter((d) => d.state !== "concluida")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  const isOverdue = (d: Delivery) => daysBetween(d.dueDate, today) > 0;
  const doneThisMonth = deliveries.filter((d) => {
    const doneAt = d.completedAt ?? d.dueDate;
    return (
      d.state === "concluida" &&
      doneAt.getMonth() === today.getMonth() &&
      doneAt.getFullYear() === today.getFullYear()
    );
  }).length;
  return {
    open,
    overdue: open.filter(isOverdue).length,
    dueSoon: open.filter((d) => !isOverdue(d) && daysBetween(d.dueDate, friday) >= 0).length,
    doneThisMonth,
  };
}

function verdictOf({ overdue, dueSoon }: WeekSummary): { text: string; dot: string } {
  const parts = [
    overdue > 0 ? plural(overdue, "atrasada", "atrasadas") : null,
    dueSoon > 0 ? `${dueSoon} ${dueSoon === 1 ? "vence" : "vencem"} até sexta` : null,
  ].filter(Boolean);
  if (parts.length === 0) return { text: "Nada vence esta semana", dot: "bg-success" };
  return { text: parts.join(", "), dot: overdue > 0 ? "bg-destructive" : "bg-warning" };
}

export default function FlowtomicDashboardPage({
  deliveries,
  today = new Date(),
  monthGoal = 20,
  timer = null,
  appName = "Flowtomic",
  onNewDelivery,
  onToggleTimer,
}: FlowtomicDashboardProps) {
  const summary = summarize(deliveries ?? sampleDeliveries(today), today);
  const verdict = verdictOf(summary);
  const progress = Math.min(100, Math.round((summary.doneThisMonth / monthGoal) * 100));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <nav
        aria-label="Principal"
        className="flex w-58 shrink-0 flex-col gap-6 border-r border-border bg-surface px-4 py-6"
      >
        <span className="font-display px-2 text-lg font-bold">{appName}</span>
        <ul className="flex flex-col gap-0.5 text-sm">
          {NAV_ITEMS.map((item, index) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={index === 0 ? "page" : undefined}
                className={cn(
                  "block rounded-md px-2 py-2",
                  index === 0
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex flex-1 flex-col gap-8 px-10 py-8">
        <header className="flex items-center gap-4">
          <h1 className="font-display flex-1 text-base font-semibold text-muted-foreground">
            Entregas da semana
          </h1>
          <label className="flex h-10 w-70 items-center gap-2 rounded-md border border-input px-3 text-muted-foreground">
            <Search aria-hidden className="size-4" />
            <input
              placeholder="Buscar entrega"
              aria-label="Buscar entrega"
              className="flex-1 bg-transparent text-sm text-foreground outline-none"
            />
            <kbd className={cn(MONO, "text-xs")}>Ctrl K</kbd>
          </label>
          <Button onClick={onNewDelivery}>Nova entrega</Button>
        </header>

        <section aria-label="Veredito da semana" className="flex flex-col gap-2">
          <p className="flex items-center gap-3.5">
            <span aria-hidden className={cn("size-3.5 shrink-0 rounded-full", verdict.dot)} />
            <span className="font-display text-[40px] font-bold leading-none tracking-tight">
              {verdict.text}
            </span>
          </p>
          <p className={cn(MONO, "pl-7 text-sm text-muted-foreground")}>
            {`${summary.open.length} em andamento · ${summary.doneThisMonth} de ${monthGoal} concluídas no mês`}
          </p>
        </section>

        <div className="flex flex-col gap-12 lg:flex-row">
          <DueTable open={summary.open} today={today} />
          <aside className="flex w-full flex-col gap-8 lg:w-75">
            <SideSection title="Mês">
              <p className={cn(MONO, "text-[28px] font-medium")}>
                {summary.doneThisMonth}
                <span className="text-muted-foreground"> / {monthGoal}</span>
              </p>
              <div
                className="h-1.5 rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progress}
                aria-label="Meta do mês"
              >
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </SideSection>
            {timer && (
              <SideSection title="Cronômetro">
                <p className={cn(MONO, "text-[28px] font-medium")}>
                  {formatElapsed(timer.elapsedSeconds)}
                </p>
                <p className="text-sm text-muted-foreground">rodando em {timer.deliveryTitle}</p>
                <button
                  type="button"
                  onClick={onToggleTimer}
                  className="self-start text-sm font-medium text-accent-foreground hover:underline"
                >
                  Pausar
                </button>
              </SideSection>
            )}
            <OwnerSummary open={summary.open} today={today} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className={SECTION_TITLE}>{title}</h2>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

const STATE_LABEL: Record<Exclude<DeliveryState, "concluida">, { label: string; dot: string }> = {
  "em-andamento": { label: "em andamento", dot: "bg-muted-foreground/50" },
  "em-revisao": { label: "em revisão", dot: "bg-warning" },
};

function DueTable({ open, today }: { open: Delivery[]; today: Date }) {
  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className={SECTION_TITLE}>Vencendo</h2>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      {open.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma entrega aberta. Use{" "}
          <strong className="font-medium text-foreground">Nova entrega</strong> para registrar a
          próxima.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[13px] text-muted-foreground">
              <th className="py-2 font-medium">Entrega</th>
              <th className="py-2 font-medium">Com</th>
              <th className="py-2 font-medium">Prazo</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {open.map((delivery) => {
              const late = daysBetween(delivery.dueDate, today);
              const state =
                late > 0
                  ? { label: `atrasada ${plural(late, "dia", "dias")}`, dot: "bg-destructive" }
                  : STATE_LABEL[delivery.state as Exclude<DeliveryState, "concluida">];
              return (
                <tr key={delivery.id} className="border-t border-border">
                  <td className="py-3 font-medium">{delivery.title}</td>
                  <td className="text-foreground/70">{delivery.owner}</td>
                  <td className={cn(MONO, late > 0 && "text-destructive")}>
                    {formatDay(delivery.dueDate)}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className={cn("size-2 rounded-full", state.dot)} />
                      {state.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function OwnerSummary({ open, today }: { open: Delivery[]; today: Date }) {
  const byOwner = new Map<string, { total: number; late: number }>();
  for (const delivery of open) {
    const entry = byOwner.get(delivery.owner) ?? { total: 0, late: 0 };
    entry.total += 1;
    if (daysBetween(delivery.dueDate, today) > 0) entry.late += 1;
    byOwner.set(delivery.owner, entry);
  }
  if (byOwner.size === 0) return null;
  return (
    <SideSection title="Quem está em quê">
      <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-2 text-sm">
        {[...byOwner].map(([owner, { total, late }]) => (
          <div key={owner} className="contents">
            <dt className="text-muted-foreground">{owner}</dt>
            <dd>
              {plural(total, "entrega", "entregas")}
              {late > 0 && `, ${plural(late, "atrasada", "atrasadas")}`}
            </dd>
          </div>
        ))}
      </dl>
    </SideSection>
  );
}
