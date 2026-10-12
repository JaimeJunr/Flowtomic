/**
 * TestimonialWall - Flowtomic UI
 *
 * Mural de depoimentos em colunas de alturas desiguais (CSS columns): cartões de texto com
 * nota e data, cartões de vídeo com pôster e botão de play, altura limitada opcional com
 * degradê e pílula de prova social. Responde ao contêiner (container queries).
 */

"use client";

import { ExternalLink, Play, Star } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/actions/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/display/avatar";
import { cn } from "@/lib/utils";

export type TestimonialAuthor = { name: string; role?: React.ReactNode; avatarSrc?: string };

export type TestimonialTextItem = {
  id: string;
  /** @default "text" */
  kind?: "text";
  author: TestimonialAuthor;
  /** De 0 a 5. */
  rating?: number;
  /** Data em ISO; exibida com `dateFormatter`. */
  date?: string;
  title?: React.ReactNode;
  body: React.ReactNode;
  media?: { src: string; alt: string };
  source?: { label: string; href: string };
};

export type TestimonialVideoItem = {
  id: string;
  kind: "video";
  author: TestimonialAuthor;
  /** Quadro do vídeo; decorativo, o nome da pessoa vai em texto. */
  poster: string;
  videoSrc?: string;
  /** @default "portrait" */
  aspect?: "portrait" | "square" | "landscape";
};

export type TestimonialItem = TestimonialTextItem | TestimonialVideoItem;

export type TestimonialWallProps = Omit<React.ComponentProps<"section">, "title"> & {
  items: TestimonialItem[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Máximo de colunas. @default 3 */
  columns?: 2 | 3;
  /** Altura limitada do mural, ex. "40rem". Sem ela, o mural não é cortado. */
  collapsedHeight?: string;
  /** @default "Mostrar mais depoimentos" */
  expandLabel?: React.ReactNode;
  proof?: {
    avatars: { src?: string; name: string }[];
    text: React.ReactNode;
    action?: { label: React.ReactNode; href: string };
  };
  /** Se existir, o play chama esta função em vez de tocar o `videoSrc`. */
  onPlay?: (item: TestimonialVideoItem) => void;
  /** @default Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }) */
  dateFormatter?: (iso: string) => string;
};

const ASPECT = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-video",
} as const;

const COLUMNS = {
  2: "columns-1 @min-[640px]:columns-2",
  3: "columns-1 @min-[640px]:columns-2 @min-[1024px]:columns-3",
} as const;

function defaultDateFormatter(iso: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  }).format(date);
}

function prefersReducedMotion(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)")?.matches === true
    );
  } catch {
    return false;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function PersonAvatar({
  name,
  src,
  compact = false,
  className,
  ...props
}: { name: string; src?: string; compact?: boolean } & React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar className={className} {...props}>
      {src ? (
        <AvatarImage src={src} alt="" />
      ) : (
        <AvatarFallback
          className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-[0.625rem]" : "text-xs"
          )}
        >
          {compact ? initials(name).slice(0, 1) : initials(name)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

function formatRating(value: number): string {
  return String(value).replace(".", ",");
}

function Rating({ value }: { value: number }) {
  const clamped = Math.min(5, Math.max(0, value));
  const filled = Math.round(clamped);
  return (
    <span
      data-slot="testimonial-rating"
      role="img"
      aria-label={`Nota ${formatRating(clamped)} de 5`}
      className="flex items-center gap-0.5"
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={14}
          aria-hidden="true"
          data-filled={index < filled ? "true" : "false"}
          className={index < filled ? "fill-primary text-primary" : "text-muted-foreground"}
        />
      ))}
    </span>
  );
}

function TextCard({
  item,
  dateFormatter,
}: {
  item: TestimonialTextItem;
  dateFormatter: (iso: string) => string;
}) {
  const { author } = item;
  return (
    <figure
      data-slot="testimonial-card"
      data-kind="text"
      className="m-0 flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <figcaption className="flex items-start gap-3">
        <PersonAvatar name={author.name} src={author.avatarSrc} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{author.name}</span>
          {author.role && <span className="text-xs text-muted-foreground">{author.role}</span>}
          {item.rating !== undefined && <Rating value={item.rating} />}
        </div>
        {item.date && (
          <time dateTime={item.date} className="shrink-0 text-xs text-muted-foreground">
            {dateFormatter(item.date)}
          </time>
        )}
      </figcaption>
      {item.title && <p className="text-base font-medium text-foreground">{item.title}</p>}
      <blockquote className="m-0 flex flex-col gap-2 text-sm text-muted-foreground">
        {item.body}
      </blockquote>
      {item.media && (
        <img
          src={item.media.src}
          alt={item.media.alt}
          loading="lazy"
          className="w-full rounded-lg border border-border"
        />
      )}
      {item.source && (
        <a
          href={item.source.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Ver no {item.source.label}
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      )}
    </figure>
  );
}

function VideoCard({
  item,
  onPlay,
}: {
  item: TestimonialVideoItem;
  onPlay?: (item: TestimonialVideoItem) => void;
}) {
  const { author } = item;
  const [playing, setPlaying] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);

  const canPlay = Boolean(onPlay || item.videoSrc);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(item);
      return;
    }
    setAutoPlay(!prefersReducedMotion());
    setPlaying(true);
  };

  return (
    <figure
      data-slot="testimonial-card"
      data-kind="video"
      className={cn(
        "relative m-0 overflow-hidden rounded-xl bg-muted",
        ASPECT[item.aspect ?? "portrait"]
      )}
    >
      {playing ? (
        // biome-ignore lint/a11y/useMediaCaption: depoimento do usuário, sem faixa de legenda no dado
        <video
          ref={videoRef}
          src={item.videoSrc}
          controls
          autoPlay={autoPlay}
          playsInline
          tabIndex={0}
          aria-label={`Depoimento de ${author.name}`}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <img
          src={item.poster}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <figcaption
        className="dark pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-0.5 p-4 pb-10 text-foreground"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, color-mix(in oklch, var(--background) 70%, transparent), transparent)",
        }}
      >
        <span className="text-sm font-semibold">{author.name}</span>
        {author.role && <span className="text-xs">{author.role}</span>}
      </figcaption>
      {canPlay && !playing && (
        <Button
          type="button"
          variant="natural"
          aria-label={`Assistir depoimento de ${author.name}`}
          onClick={handlePlay}
          className="absolute bottom-3 right-3 size-10 rounded-full border-0 p-0"
        >
          <Play aria-hidden="true" className="fill-foreground" />
        </Button>
      )}
    </figure>
  );
}

function ProofPill({
  proof,
  className,
}: {
  proof: NonNullable<TestimonialWallProps["proof"]>;
  className?: string;
}) {
  return (
    <div
      data-slot="testimonial-wall-proof"
      className={cn(
        "dark pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-4 text-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="flex items-center">
        {proof.avatars.slice(0, 4).map((avatar, index) => (
          <PersonAvatar
            key={`${avatar.name}-${index}`}
            name={avatar.name}
            src={avatar.src}
            compact
            className={cn("h-7 w-7 ring-2 ring-background", index > 0 && "-ml-2")}
          />
        ))}
      </span>
      <span className="text-sm">{proof.text}</span>
      {proof.action && (
        <a
          href={proof.action.href}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          {proof.action.label}
        </a>
      )}
    </div>
  );
}

/** Mural de depoimentos em colunas, com cartões de texto e de vídeo e prova social. */
function TestimonialWall({
  items,
  title,
  description,
  headingLevel = 2,
  columns = 3,
  collapsedHeight,
  expandLabel = "Mostrar mais depoimentos",
  proof,
  onPlay,
  dateFormatter = defaultDateFormatter,
  className,
  ...props
}: TestimonialWallProps) {
  const uid = React.useId();
  const titleId = `${uid}-title`;
  const gridId = `${uid}-grid`;
  const [expanded, setExpanded] = React.useState(false);
  const clipRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLUListElement>(null);
  const focusIndex = React.useRef<number | null>(null);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const collapsed = Boolean(collapsedHeight) && !expanded;

  React.useEffect(() => {
    if (!expanded || focusIndex.current === null) return;
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(":scope > li");
    cards?.[focusIndex.current]?.focus();
    focusIndex.current = null;
  }, [expanded]);

  const expand = () => {
    const limit = clipRef.current?.getBoundingClientRect().bottom ?? 0;
    const cards = Array.from(gridRef.current?.querySelectorAll<HTMLElement>(":scope > li") ?? []);
    const hidden = cards.findIndex((card) => card.getBoundingClientRect().top >= limit - 1);
    focusIndex.current = hidden === -1 ? 0 : hidden;
    setExpanded(true);
  };

  return (
    <section
      data-slot="testimonial-wall"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Depoimentos"}
      className={cn("@container flex w-full flex-col gap-8", className)}
      {...props}
    >
      {(title || description) && (
        <div
          data-slot="testimonial-wall-header"
          className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center"
        >
          {title && (
            <Heading
              id={titleId}
              className="text-display-xs @min-[768px]:text-display-sm text-balance font-semibold"
            >
              {title}
            </Heading>
          )}
          {description && (
            <p className="max-w-[56ch] text-base text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div
        ref={clipRef}
        className={cn("relative", collapsed && "overflow-hidden")}
        style={collapsed ? { maxHeight: collapsedHeight } : undefined}
      >
        <ul
          ref={gridRef}
          id={gridId}
          data-slot="testimonial-wall-grid"
          className={cn("m-0 list-none gap-4 p-0", COLUMNS[columns])}
        >
          {items.map((item) => (
            <li
              key={item.id}
              tabIndex={-1}
              className="mb-4 block break-inside-avoid rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.kind === "video" ? (
                <VideoCard item={item} onPlay={onPlay} />
              ) : (
                <TextCard item={item} dateFormatter={dateFormatter} />
              )}
            </li>
          ))}
        </ul>
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-40 items-end justify-center bg-linear-to-t from-background to-transparent px-4 pb-4">
            <div className="flex flex-col items-center gap-3 @min-[640px]:flex-row">
              {proof && <ProofPill proof={proof} />}
              <Button
                type="button"
                variant="outline"
                data-slot="testimonial-wall-expand"
                aria-expanded={false}
                aria-controls={gridId}
                onClick={expand}
                className="pointer-events-auto"
              >
                {expandLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
      {proof && !collapsed && (
        <div className="flex justify-center">
          <ProofPill proof={proof} />
        </div>
      )}
    </section>
  );
}
TestimonialWall.displayName = "TestimonialWall";

export { TestimonialWall };
