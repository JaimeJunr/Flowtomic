/**
 * FaqSection - Flowtomic UI
 *
 * Seção de perguntas frequentes: cabeçalho, lista em Accordion e caixa de contato opcional.
 * Duas variantes (`split` e `grid`) que respondem ao contêiner (container queries).
 */

"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Check, ChevronDown, Copy, Minus, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/actions/button";
import { Input } from "@/components/atoms/forms/input";
import { Accordion, AccordionItem } from "@/components/atoms/layout/accordion";
import { cn } from "@/lib/utils";

export type FaqItem = { id?: string; question: React.ReactNode; answer: React.ReactNode };

export type FaqContact = {
  /** @default "Não achou o que procurava?" */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Linha de cópia: rótulo pequeno, valor em mono e botão "Copiar". */
  copy?: { label?: React.ReactNode; value: string };
  /** Alternativa à cópia: link em botão `outline`. */
  action?: { label: React.ReactNode; href: string };
  onCopy?: (value: string) => void;
};

export type FaqSectionProps = Omit<React.ComponentProps<"section">, "title" | "defaultValue"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  items: FaqItem[];
  /** @default "split" */
  layout?: "split" | "grid";
  /** Número de dois dígitos antes da pergunta. Padrão: `true` em `split`, `false` em `grid`. */
  numbered?: boolean;
  /** Padrão: `chevron` em `split`, `plus` em `grid`. */
  icon?: "chevron" | "plus";
  /** Permite várias perguntas abertas. @default false */
  multiple?: boolean;
  /** Ids abertos (controlado). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  contact?: FaqContact;
  /** Cabeçalho fixo enquanto a lista rola (só `split`). @default true */
  stickyHeader?: boolean;
  /** Campo de busca acima da lista. @default false */
  searchable?: boolean;
  /** Dá `id="faq-<id>"` a cada item e abre o apontado por `location.hash` ao montar. @default false */
  hashLink?: boolean;
  /** Nível do título; as perguntas ficam no nível seguinte. @default 2 */
  headingLevel?: 2 | 3 | 4;
};

type Resolved = { id: string; index: number; item: FaqItem };

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function FaqContactBox({
  contact,
  id,
  className,
}: {
  contact: FaqContact;
  id: string;
  className?: string;
}) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (value: string) => {
    let next: "copied" | "error" = "copied";
    try {
      await navigator.clipboard.writeText(value);
      contact.onCopy?.(value);
    } catch {
      next = "error";
    }
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div
      data-slot="faq-section-contact"
      id={id}
      tabIndex={-1}
      className={cn("rounded-xl border border-border bg-card p-6 outline-none", className)}
    >
      <p className="text-base font-semibold text-foreground">
        {contact.title ?? "Não achou o que procurava?"}
      </p>
      {contact.description && (
        <p className="mt-1 text-sm text-muted-foreground">{contact.description}</p>
      )}
      {contact.copy && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
          <div className="min-w-0">
            {contact.copy.label && (
              <p className="text-xs text-muted-foreground">{contact.copy.label}</p>
            )}
            <p className="truncate font-mono text-sm text-foreground">{contact.copy.value}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Copiar ${contact.copy.value}`}
            onClick={() => copy(contact.copy?.value ?? "")}
            className="shrink-0 whitespace-nowrap"
          >
            {status === "copied" ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            <span aria-live="polite">
              {status === "copied"
                ? "Copiado"
                : status === "error"
                  ? "Não deu para copiar"
                  : "Copiar"}
            </span>
          </Button>
        </div>
      )}
      {contact.action && (
        <Button asChild variant="outline" className="mt-4">
          <a href={contact.action.href}>{contact.action.label}</a>
        </Button>
      )}
    </div>
  );
}

function FaqEntry({
  entry,
  variant,
  numbered,
  icon,
  hashLink,
  questionLevel,
}: {
  entry: Resolved;
  variant: "split" | "grid";
  numbered: boolean;
  icon: "chevron" | "plus";
  hashLink: boolean;
  questionLevel: number;
}) {
  const QuestionHeading = `h${questionLevel}` as "h3" | "h4" | "h5" | "h6";
  const isSplit = variant === "split";
  return (
    <AccordionItem
      value={entry.id}
      data-slot="faq-section-item"
      id={hashLink ? `faq-${entry.id}` : undefined}
      className={cn(
        isSplit
          ? "scroll-mt-24 border-b border-border"
          : "rounded-xl border border-border bg-card p-5 last:border-b"
      )}
    >
      <AccordionPrimitive.Header asChild>
        <QuestionHeading className="flex">
          <AccordionPrimitive.Trigger
            className={cn(
              "group flex flex-1 items-start justify-between gap-4 text-left text-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isSplit
                ? "-mx-3 rounded-lg px-3 py-4 text-lg hover:bg-muted"
                : "rounded-md text-base font-medium"
            )}
          >
            <span className="flex min-w-0 gap-4">
              {numbered && (
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground"
                >
                  {pad(entry.index + 1)}
                </span>
              )}
              <span className="min-w-0">{entry.item.question}</span>
            </span>
            {icon === "chevron" ? (
              <ChevronDown
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            ) : (
              <>
                <Plus
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-muted-foreground group-data-[state=open]:hidden"
                />
                <Minus
                  aria-hidden="true"
                  className="mt-1 hidden size-4 shrink-0 text-muted-foreground group-data-[state=open]:block"
                />
              </>
            )}
          </AccordionPrimitive.Trigger>
        </QuestionHeading>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
        <div
          className={cn(
            "max-w-[65ch] text-sm text-muted-foreground",
            isSplit ? "pb-4" : "pt-2",
            isSplit && numbered && "pl-10"
          )}
        >
          {entry.item.answer}
        </div>
      </AccordionPrimitive.Content>
    </AccordionItem>
  );
}

function FaqList({
  entries,
  open,
  onChange,
  multiple,
  className,
  children,
}: {
  entries: Resolved[];
  open: string[];
  onChange: (columnIds: string[], next: string[]) => void;
  multiple: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ids = entries.map((e) => e.id);
  if (multiple) {
    return (
      <Accordion
        type="multiple"
        value={open.filter((id) => ids.includes(id))}
        onValueChange={(next) => onChange(ids, next)}
        className={className}
      >
        {children}
      </Accordion>
    );
  }
  return (
    <Accordion
      type="single"
      collapsible
      value={open.find((id) => ids.includes(id)) ?? ""}
      onValueChange={(next) => onChange(ids, next ? [next] : [])}
      className={className}
    >
      {children}
    </Accordion>
  );
}

/** Seção de perguntas frequentes em Accordion, com cabeçalho, busca e caixa de contato. */
function FaqSection({
  title,
  description,
  items,
  layout = "split",
  numbered,
  icon,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  contact,
  stickyHeader = true,
  searchable = false,
  hashLink = false,
  headingLevel = 2,
  className,
  ...props
}: FaqSectionProps) {
  const baseId = React.useId();
  const titleId = `${baseId}-title`;
  const contactId = `${baseId}-contact`;
  const searchId = `${baseId}-search`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const isSplit = layout === "split";
  const showNumbers = numbered ?? isSplit;
  const iconKind = icon ?? (isSplit ? "chevron" : "plus");

  const [innerOpen, setInnerOpen] = React.useState<string[]>(defaultValue ?? []);
  const [query, setQuery] = React.useState("");
  const controlled = value !== undefined;
  const open = controlled ? value : innerOpen;

  const commit = (next: string[]) => {
    if (!controlled) setInnerOpen(next);
    onValueChange?.(next);
  };

  const resolved = React.useMemo<Resolved[]>(
    () => items.map((item, index) => ({ id: item.id ?? String(index), index, item })),
    [items]
  );

  const term = query.trim();
  const visible = React.useMemo(() => {
    if (!searchable || !term) return resolved;
    const needle = term.toLowerCase();
    return resolved.filter(({ item }) =>
      `${textOf(item.question)} ${textOf(item.answer)}`.toLowerCase().includes(needle)
    );
  }, [resolved, searchable, term]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: só na montagem, a partir do hash inicial
  React.useEffect(() => {
    if (!hashLink || typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#faq-")) return;
    const id = decodeURIComponent(hash.slice("#faq-".length));
    if (!resolved.some((r) => r.id === id)) return;
    commit(multiple ? Array.from(new Set([...open, id])) : [id]);
    const frame = requestAnimationFrame(() => {
      document.getElementById(`faq-${id}`)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleChange = (columnIds: string[], next: string[]) => {
    commit(multiple ? [...open.filter((id) => !columnIds.includes(id)), ...next] : next);
  };

  const questionLevel = headingLevel + 1;
  const entryProps = {
    variant: layout,
    numbered: showNumbers,
    icon: iconKind,
    hashLink,
    questionLevel,
  } as const;

  const contactBox = contact && <FaqContactBox contact={contact} id={contactId} />;

  const header = (
    <div
      data-slot="faq-section-header"
      className={cn(
        isSplit && stickyHeader && "@min-[768px]:sticky @min-[768px]:top-24 @min-[768px]:self-start"
      )}
    >
      <Heading
        id={titleId}
        className="text-balance text-display-xs font-semibold @min-[768px]:text-display-sm"
      >
        {title}
      </Heading>
      {description && (
        <p className="mt-4 max-w-[48ch] text-base text-muted-foreground">{description}</p>
      )}
      {isSplit && contactBox && <div className="mt-8">{contactBox}</div>}
    </div>
  );

  const search = searchable && (
    <div data-slot="faq-section-search" className="mb-6">
      <label htmlFor={searchId} className="sr-only">
        Buscar nas perguntas
      </label>
      <Input
        id={searchId}
        type="search"
        placeholder="Buscar nas perguntas"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p aria-live="polite" className="sr-only">
        {term
          ? `${visible.length} ${visible.length === 1 ? "pergunta encontrada" : "perguntas encontradas"}`
          : ""}
      </p>
    </div>
  );

  const empty = searchable && term && visible.length === 0 && (
    <p className="text-sm text-muted-foreground">
      Nenhuma pergunta com '{term}'.
      {contact && (
        <>
          {" "}
          <a
            href={`#${contactId}`}
            onClick={() => document.getElementById(contactId)?.focus()}
            className="rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Fale com a gente
          </a>
        </>
      )}
    </p>
  );

  const left = visible.filter((_, i) => i % 2 === 0);
  const right = visible.filter((_, i) => i % 2 === 1);

  return (
    <section
      data-slot="faq-section"
      aria-labelledby={titleId}
      className={cn("@container bg-background px-6 py-16 text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        {isSplit ? (
          <div className="grid gap-12 @min-[768px]:grid-cols-12">
            <div className="@min-[768px]:col-span-5">{header}</div>
            <div className="@min-[768px]:col-span-7" data-slot="faq-section-list">
              {search}
              {empty}
              {visible.length > 0 && (
                <FaqList entries={visible} open={open} onChange={handleChange} multiple={multiple}>
                  {visible.map((entry) => (
                    <FaqEntry key={entry.id} entry={entry} {...entryProps} />
                  ))}
                </FaqList>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="grid items-start gap-8 @min-[768px]:grid-cols-2">
              {header}
              {contactBox}
            </div>
            <div data-slot="faq-section-list">
              {search}
              {empty}
              {visible.length > 0 && (
                <div className="grid items-start gap-4 @min-[768px]:grid-cols-2">
                  {[left, right].map((column, i) =>
                    column.length > 0 ? (
                      <FaqList
                        // biome-ignore lint/suspicious/noArrayIndexKey: duas colunas fixas
                        key={i}
                        entries={column}
                        open={open}
                        onChange={handleChange}
                        multiple={multiple}
                        className="flex flex-col gap-4"
                      >
                        {column.map((entry) => (
                          <FaqEntry key={entry.id} entry={entry} {...entryProps} />
                        ))}
                      </FaqList>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

FaqSection.displayName = "FaqSection";

export { FaqSection };
