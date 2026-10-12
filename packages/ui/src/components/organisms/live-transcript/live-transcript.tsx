/**
 * LiveTranscript - Flowtomic UI
 *
 * Painel de transcrição ao vivo: conversa (`role="log"`) com rolagem automática e botão de
 * falas novas, anotações destacadas (tradução, sugestão de resposta), medidores de áudio e
 * controles. Responde ao contêiner (container queries) e usa só tokens semânticos.
 */

"use client";

import { ArrowDown, AudioLines, Globe, Pause, Play, Square } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/atoms/actions/badge";
import { Button } from "@/components/atoms/actions/button";
import { Kbd } from "@/components/atoms/display/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/forms/select";
import { cn } from "@/lib/utils";

export type LiveTranscriptStatus = "live" | "paused" | "stopped" | "connecting";

export type LiveTranscriptEntry = {
  id: string;
  /** Nome de quem fala: "Outros", "Você", "Ana". */
  speaker: React.ReactNode;
  /** @default "them" */
  side?: "them" | "me";
  text: React.ReactNode;
  /** Hora já formatada, ex. "14:02". */
  time?: string;
  /** Fala ainda sendo reconhecida. */
  partial?: boolean;
  annotation?: {
    label: React.ReactNode;
    content: React.ReactNode;
    action?: { label: React.ReactNode; onClick: () => void };
  };
};

export type LiveTranscriptMeter = {
  id: string;
  label: React.ReactNode;
  /** De 0 a 1; fora disso é preso nos limites. */
  level: number;
  language?: React.ReactNode;
};

export type LiveTranscriptProps = Omit<React.ComponentProps<"section">, "title"> & {
  entries: LiveTranscriptEntry[];
  title?: React.ReactNode;
  /** @default "live" */
  status?: LiveTranscriptStatus;
  /** Duração em segundos. */
  elapsed?: number;
  meters?: LiveTranscriptMeter[];
  /** @default true */
  metersCollapsible?: boolean;
  /** @default true */
  defaultMetersOpen?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  languages?: { value: string; label: string }[];
  language?: string;
  onLanguageChange?: (value: string) => void;
  /** O atalho é só texto; o componente não registra atalho global. */
  primaryAction?: { label: React.ReactNode; onClick: () => void; shortcut?: string };
  emptyState?: React.ReactNode;
  /** @default "28rem" */
  maxHeight?: string;
  /** @default true */
  autoScroll?: boolean;
};

const NEAR_BOTTOM = 48;

const STATUS_TEXT: Record<LiveTranscriptStatus, string> = {
  live: "Ao vivo",
  paused: "Pausado",
  stopped: "Encerrado",
  connecting: "Conectando…",
};

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

function formatElapsed(total: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.min(1, Math.max(0, level));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return Boolean(window.matchMedia("(prefers-reduced-motion: reduce)")?.matches);
}

function toAriaShortcut(shortcut: string): string {
  return shortcut
    .trim()
    .split(/\s+/)
    .map((k) => (k.toLowerCase() === "ctrl" ? "Control" : k))
    .join("+");
}

const ANNOTATION_STYLE =
  "bg-[color-mix(in_oklch,var(--primary)_8%,transparent)] border-[color-mix(in_oklch,var(--primary)_30%,transparent)]";

function Entry({ entry }: { entry: LiveTranscriptEntry }) {
  const side = entry.side ?? "them";
  const partial = Boolean(entry.partial);
  const { annotation } = entry;
  return (
    <div
      data-slot="live-transcript-entry"
      data-side={side}
      data-partial={partial ? "true" : "false"}
      aria-busy={partial || undefined}
      className="flex flex-col gap-1.5"
    >
      <p className="text-muted-foreground flex items-baseline gap-1.5 text-xs">
        <span className="font-medium">{entry.speaker}</span>
        {entry.time ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{entry.time}</span>
          </>
        ) : null}
      </p>
      <p
        className={cn(
          "text-base leading-snug @min-[640px]:text-lg",
          side === "them"
            ? "text-muted-foreground before:content-['“'] after:content-['”'] italic"
            : "text-foreground",
          partial && "text-muted-foreground"
        )}
      >
        {partial ? (
          <span aria-hidden="true">
            {entry.text}
            <span className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-current align-text-bottom motion-reduce:animate-none" />
          </span>
        ) : (
          entry.text
        )}
      </p>
      {annotation ? (
        <div
          data-slot="live-transcript-annotation"
          className={cn("flex flex-col gap-2 rounded-xl border p-3", ANNOTATION_STYLE)}
        >
          <div className="text-primary flex items-center gap-1.5 text-xs font-medium">
            <span aria-hidden="true" className="bg-primary size-1.5 rounded-full" />
            <span>{annotation.label}</span>
          </div>
          <div className="text-foreground text-base leading-snug">{annotation.content}</div>
          {annotation.action ? (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={annotation.action.onClick}>
                {annotation.action.label}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LiveTranscript({
  entries,
  title,
  status = "live",
  elapsed,
  meters,
  metersCollapsible = true,
  defaultMetersOpen = true,
  onPause,
  onResume,
  onStop,
  languages,
  language,
  onLanguageChange,
  primaryAction,
  emptyState,
  maxHeight = "28rem",
  autoScroll = true,
  className,
  "aria-label": ariaLabel,
  ...props
}: LiveTranscriptProps) {
  const uid = React.useId();
  const titleId = `${uid}-title`;
  const metersId = `${uid}-meters`;
  const logRef = React.useRef<HTMLDivElement>(null);
  const atBottomRef = React.useRef(true);
  const prevCountRef = React.useRef(entries.length);
  const [unseen, setUnseen] = React.useState(0);
  const [metersOpen, setMetersOpen] = React.useState(defaultMetersOpen);

  const scrollToEnd = React.useCallback(() => {
    const el = logRef.current;
    if (!el) return;
    const top = el.scrollHeight;
    if (!prefersReducedMotion() && typeof el.scrollTo === "function") {
      el.scrollTo({ top, behavior: "smooth" });
    } else {
      el.scrollTop = top;
    }
  }, []);

  const handleScroll = () => {
    const el = logRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= NEAR_BOTTOM;
    atBottomRef.current = atBottom;
    if (atBottom) setUnseen(0);
  };

  const count = entries.length;
  const lastText = entries[count - 1]?.text;
  // biome-ignore lint/correctness/useExhaustiveDependencies: reage a fala nova ou texto da última fala
  React.useEffect(() => {
    const added = count - prevCountRef.current;
    prevCountRef.current = count;
    if (autoScroll && atBottomRef.current) {
      scrollToEnd();
    } else if (added > 0) {
      setUnseen((n) => n + added);
    }
  }, [count, lastText, autoScroll, scrollToEnd]);

  const jumpToEnd = () => {
    atBottomRef.current = true;
    setUnseen(0);
    scrollToEnd();
  };

  const hasControls = Boolean(
    onPause || onResume || onStop || (languages && languages.length > 0) || primaryAction
  );
  const stopped = status === "stopped";
  const paused = status === "paused";
  const pauseHandler = paused ? onResume : onPause;
  const showMeters = meters && meters.length > 0;
  const barsVisible = !metersCollapsible || metersOpen;

  return (
    <section
      data-slot="live-transcript"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : (ariaLabel ?? "Transcrição ao vivo")}
      className={cn(
        "@container bg-card text-card-foreground overflow-hidden rounded-2xl border",
        className
      )}
      {...props}
    >
      <div
        data-slot="live-transcript-header"
        className="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div id={titleId} className="min-w-0 truncate text-sm font-medium">
          {title}
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-xs">
          {elapsed !== undefined ? (
            <span className="font-mono tabular-nums">{formatElapsed(elapsed)}</span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                status === "live"
                  ? "bg-primary animate-pulse motion-reduce:animate-none"
                  : "bg-muted-foreground/50"
              )}
            />
            <span>{STATUS_TEXT[status]}</span>
          </span>
        </div>
      </div>

      <div className="relative border-t">
        <div
          ref={logRef}
          data-slot="live-transcript-log"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversa"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: região rolável precisa de foco para rolar por teclado
          tabIndex={0}
          onScroll={handleScroll}
          style={{ maxHeight }}
          className="focus-visible:ring-ring/50 flex flex-col gap-5 overflow-y-auto p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
        >
          {count === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {emptyState ??
                "Nada transcrito ainda. Fale ou compartilhe o áudio da reunião para começar."}
            </div>
          ) : (
            entries.map((entry) => <Entry key={entry.id} entry={entry} />)
          )}
        </div>
        {unseen > 0 ? (
          <Button
            type="button"
            data-slot="live-transcript-jump"
            variant="secondary"
            size="sm"
            onClick={jumpToEnd}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md"
          >
            <ArrowDown aria-hidden="true" />
            {unseen === 1 ? "1 fala nova" : `${unseen} falas novas`}
          </Button>
        ) : null}
      </div>

      {showMeters ? (
        <div data-slot="live-transcript-meters" className="flex flex-col gap-3 border-t px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <AudioLines aria-hidden="true" className="size-4" />
              Medidores de áudio
            </div>
            {metersCollapsible ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={metersOpen}
                aria-controls={metersId}
                onClick={() => setMetersOpen((o) => !o)}
              >
                {metersOpen ? "Ocultar" : "Mostrar"}
              </Button>
            ) : null}
          </div>
          {barsVisible ? (
            <ul id={metersId} className="flex flex-col gap-2.5">
              {meters.map((meter) => {
                const pct = Math.round(clampLevel(meter.level) * 100);
                return (
                  <li key={meter.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-16 shrink-0 truncate text-xs">
                      {meter.label}
                    </span>
                    {/* biome-ignore lint/a11y/useSemanticElements: barra estilizada; <meter> nativo não aceita o visual */}
                    <div
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                      aria-label={`Nível de áudio: ${textOf(meter.label)}`}
                      className="bg-muted h-1 flex-1 overflow-hidden rounded-full"
                    >
                      <div
                        className="bg-primary h-full rounded-full transition-[width] duration-150 motion-reduce:transition-none"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {meter.language ? (
                      <Badge variant="secondary" size="sm">
                        {meter.language}
                      </Badge>
                    ) : (
                      <span className="w-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      {hasControls ? (
        <div
          data-slot="live-transcript-controls"
          className="flex flex-wrap items-center gap-2 border-t px-4 py-3"
        >
          {pauseHandler ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={paused ? "Retomar" : "Pausar"}
              disabled={stopped}
              onClick={pauseHandler}
            >
              {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </Button>
          ) : null}
          {onStop ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Parar"
              disabled={stopped}
              onClick={onStop}
            >
              <Square aria-hidden="true" />
            </Button>
          ) : null}
          {languages && languages.length > 0 ? (
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger size="sm" aria-label="Idioma da tradução" className="w-auto">
                <Globe aria-hidden="true" />
                <SelectValue placeholder="Idioma" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {primaryAction ? (
            <Button
              type="button"
              onClick={primaryAction.onClick}
              aria-keyshortcuts={
                primaryAction.shortcut ? toAriaShortcut(primaryAction.shortcut) : undefined
              }
              className="ml-auto @max-[480px]:ml-0 @max-[480px]:w-full @max-[480px]:basis-full"
            >
              {primaryAction.label}
              {primaryAction.shortcut ? (
                <Kbd className="bg-primary-foreground/15 text-primary-foreground">
                  {primaryAction.shortcut}
                </Kbd>
              ) : null}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { LiveTranscript };
