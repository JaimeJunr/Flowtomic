/**
 * PaperFolder Component - Flowtomic UI
 *
 * Pasta de arquivo desenhada em CSS: ao clicar a frente inclina e até três folhas
 * sobem em leque; com a pasta aberta cada folha segue um pouco o ponteiro.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/paper-folder.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  closedPaperTransform,
  type FrontState,
  frontTransform,
  magnetOffset,
  paperPose,
  paperPoseTransform,
  paperSize,
} from "./paper-folder-utils";

export type PaperFolderTone = "primary" | "secondary" | "accent";

export type PaperFolderProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Até 3 folhas (conteúdo pequeno: ícone, miniatura, texto curto). */
  papers?: React.ReactNode[];
  /** Nome da pasta para leitor de tela. */
  label: string;
  /** Escala sobre a base de 100x80 px. */
  size?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tone?: PaperFolderTone;
};

const BASE_WIDTH = 100;
const BASE_HEIGHT = 80;
const MAX_PAPERS = 3;
const MAGNET_STRENGTH = 0.15;
const TRANSITION = "transition-transform duration-300 ease-in-out";

const TONE_CLASS: Record<PaperFolderTone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
};

function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [inner, setInner] = React.useState(defaultOpen);
  const current = open ?? inner;
  const toggle = () => {
    const next = !current;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return { current, toggle };
}

function useWarnExcess(received: number) {
  const warned = React.useRef(false);
  React.useEffect(() => {
    if (received <= MAX_PAPERS || warned.current) return;
    warned.current = true;
    console.warn(
      `PaperFolder: received ${received} papers, expected at most ${MAX_PAPERS}; extra papers are ignored`
    );
  }, [received]);
}

type PaperProps = {
  index: number;
  count: number;
  open: boolean;
  peeking: boolean;
  reduced: boolean;
  children: React.ReactNode;
};

function Paper({ index, count, open, peeking, reduced, children }: PaperProps) {
  const { width, height } = paperSize(index, count);
  const transform = open
    ? paperPoseTransform(paperPose(index, count))
    : closedPaperTransform(peeking);
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!open || reduced) return;
    const target = event.currentTarget;
    const offset = magnetOffset(
      target.getBoundingClientRect(),
      event.clientX,
      event.clientY,
      MAGNET_STRENGTH
    );
    target.style.setProperty("--mx", `${offset.x}px`);
    target.style.setProperty("--my", `${offset.y}px`);
  };
  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--mx", "0px");
    event.currentTarget.style.setProperty("--my", "0px");
  };
  return (
    <div
      data-slot="paper-folder-paper"
      data-index={index}
      aria-hidden={open ? undefined : true}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "absolute bottom-[10%] left-1/2 overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm",
        !reduced && "transition-[transform,translate] duration-300 ease-in-out"
      )}
      style={{
        width: `${width}%`,
        height: `${height}%`,
        transform,
        translate: "var(--mx, 0px) var(--my, 0px)",
      }}
    >
      {children}
    </div>
  );
}

function PaperFolder({
  ref,
  className,
  style,
  papers = [],
  label,
  size = 1,
  open,
  defaultOpen = false,
  onOpenChange,
  tone = "primary",
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...props
}: PaperFolderProps) {
  const reduced = useShouldReduceMotion();
  const { current, toggle } = useOpenState(open, defaultOpen, onOpenChange);
  const [hovered, setHovered] = React.useState(false);
  useWarnExcess(papers.length);
  const shown = papers.slice(0, MAX_PAPERS);
  const peeking = hovered && !current && !reduced;
  const frontState: FrontState = current ? "open" : peeking ? "hover" : "closed";
  const toneClass = TONE_CLASS[tone];

  return (
    <button
      ref={ref}
      type="button"
      data-slot="paper-folder"
      data-state={current ? "open" : "closed"}
      data-tone={tone}
      aria-label={label}
      aria-expanded={current}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse" || event.pointerType === "pen") setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      className={cn(
        "relative block cursor-pointer rounded-[10px] select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        !reduced && TRANSITION,
        className
      )}
      style={{
        width: BASE_WIDTH * size,
        height: BASE_HEIGHT * size,
        transform: current ? "translateY(-8px)" : undefined,
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: BASE_WIDTH, height: BASE_HEIGHT, transform: `scale(${size})` }}
      >
        <div
          data-slot="paper-folder-back"
          className={cn("absolute inset-0 rounded-[10px] rounded-tl-none", toneClass)}
        >
          <div className={cn("absolute -top-2.5 left-0 h-2.5 w-8 rounded-t-md", toneClass)} />
        </div>
        {shown.map((paper, index) => (
          <Paper
            // biome-ignore lint/suspicious/noArrayIndexKey: as folhas são posicionais (até 3, sem reordenação)
            key={index}
            index={index}
            count={shown.length}
            open={current}
            peeking={peeking}
            reduced={reduced}
          >
            {paper}
          </Paper>
        ))}
        <div
          data-slot="paper-folder-front"
          className={cn(
            "absolute inset-0 rounded-[10px] origin-bottom",
            toneClass,
            !reduced && TRANSITION
          )}
          style={{ transform: frontTransform(frontState) }}
        >
          <span className="absolute inset-0 rounded-[10px] bg-background/15" />
        </div>
      </div>
    </button>
  );
}

PaperFolder.displayName = "PaperFolder";

export { PaperFolder };
