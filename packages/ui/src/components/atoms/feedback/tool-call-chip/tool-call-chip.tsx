/**
 * ToolCallChip Component - Flowtomic UI
 *
 * Chip de uma chamada de ferramenta em andamento: um preenchimento atravessa o
 * chip e estaciona em 90% enquanto o contador sobe; ao concluir completa, ganha
 * uma lavagem verde e o ícone rola para um ✓; em erro congela, chacoalha e o
 * ícone vira ↻ (reexecuta se houver onRetry). Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/tool-call-chip.md
 */

"use client";

import { Check, FileText, Pencil, RotateCw, Search, SquareTerminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  parkedProgress,
  statusText,
  type ToolCallStatus,
} from "./tool-call-chip-utils";

export type { ToolCallStatus } from "./tool-call-chip-utils";

type IconName = "terminal" | "file" | "search" | "edit";

// Props de arrasto e animação do HTML colidem com as do motion.
type NativeProps = Omit<
  React.ComponentProps<"div">,
  | "children"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "style"
>;

export type ToolCallChipProps = NativeProps & {
  icon?: IconName | React.ReactNode;
  name: string;
  argument?: string;
  status?: ToolCallStatus;
  /** Tempo esperado, em ms; o preenchimento chega a 90% nele. */
  expectedMs?: number;
  size?: "sm" | "default";
  showTimer?: boolean;
  /** Amplitude do chacoalhar em erro, em px; 0 só tinge. */
  shake?: number;
  /** Com ele, o chip com erro vira botão de reexecutar. */
  onRetry?: () => void;
};

const ICONS: Record<IconName, React.ReactNode> = {
  terminal: <SquareTerminal />,
  file: <FileText />,
  search: <Search />,
  edit: <Pencil />,
};

const SIZE_CLASSES = { sm: "h-7 text-xs", default: "h-[34px] text-sm" } as const;
const DONE_FILL_SECONDS = 0.2;
const SHAKE_SECONDS = 0.4;
const ICON_SWAP_SECONDS = 0.2;

function resolveIcon(icon: ToolCallChipProps["icon"]): React.ReactNode {
  if (icon === undefined) return ICONS.terminal;
  return typeof icon === "string" && icon in ICONS ? ICONS[icon as IconName] : icon;
}

/** Mede o tempo por quadro só enquanto roda; congela no valor final em done/error. */
function useElapsedMs(running: boolean): number {
  const [elapsed, setElapsed] = React.useState(0);
  const startedAtRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!running) return;
    startedAtRef.current = null;
    setElapsed(0);
  }, [running]);

  useFrameLoop((now) => {
    startedAtRef.current ??= now;
    setElapsed(now - startedAtRef.current);
  }, running);
  return elapsed;
}

function shakeKeyframes(amplitude: number): number[] {
  return [0, -amplitude, amplitude, -amplitude / 2, amplitude / 2, 0];
}

type GlyphProps = { status: ToolCallStatus; icon: React.ReactNode; reduced: boolean };

/** O ícone troca rolando: o antigo sai para cima, o novo entra de baixo. */
function RollingIcon({ status, icon, reduced }: GlyphProps) {
  const swap = status === "done" ? "done" : status === "error" ? "error" : "base";
  const glyph =
    swap === "done" ? (
      <Check className="text-success" />
    ) : swap === "error" ? (
      <RotateCw className="text-destructive" />
    ) : (
      icon
    );
  const duration = reduced ? 0 : ICON_SWAP_SECONDS;
  return (
    <span
      aria-hidden="true"
      data-slot="tool-call-chip-icon"
      className="relative inline-flex size-4 shrink-0 items-center justify-center overflow-hidden [&_svg]:size-4"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={swap}
          className="inline-flex"
          initial={{ y: reduced ? 0 : "100%" }}
          animate={{ y: 0 }}
          exit={{ y: reduced ? 0 : "-100%" }}
          transition={{ duration }}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type FillProps = { status: ToolCallStatus; progress: number };

function Fill({ status, progress }: FillProps) {
  const tone =
    status === "done"
      ? "bg-success/15"
      : status === "error"
        ? "bg-destructive/15"
        : "bg-foreground/8";
  return (
    <span
      aria-hidden="true"
      data-slot="tool-call-chip-fill"
      className={cn("pointer-events-none absolute inset-0 origin-left transition-colors", tone)}
      style={{
        transform: `scaleX(${progress})`,
        transition:
          status === "done"
            ? `transform ${DONE_FILL_SECONDS}s ease-out, background-color 0.2s`
            : undefined,
      }}
    />
  );
}

/** Chip de chamada de ferramenta: nome, argumento, contador e preenchimento de progresso. */
function ToolCallChip({
  ref,
  className,
  icon,
  name,
  argument,
  status = "running",
  expectedMs = 2500,
  size = "default",
  showTimer = true,
  shake = 6,
  onRetry,
  ...props
}: ToolCallChipProps) {
  const reduced = useShouldReduceMotion();
  const running = status === "running";
  const elapsed = useElapsedMs(running);
  const lastProgressRef = React.useRef(0);
  if (running) lastProgressRef.current = parkedProgress(elapsed, expectedMs);
  else if (status === "idle") lastProgressRef.current = 0;
  const progress = status === "done" ? 1 : lastProgressRef.current;

  const asButton = status === "error" && onRetry !== undefined;
  const shaking = status === "error" && !reduced && shake > 0;
  const showFill = !reduced || status === "done" || status === "error";
  const className_ = cn(
    "relative inline-flex max-w-full items-center gap-2 overflow-hidden rounded-md border bg-secondary px-2.5 text-secondary-foreground",
    SIZE_CLASSES[size],
    asButton && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className
  );
  const body = (
    <>
      {showFill && <Fill status={status} progress={reduced && running ? 0 : progress} />}
      <span className="relative inline-flex items-center gap-2 truncate">
        <RollingIcon status={status} icon={resolveIcon(icon)} reduced={reduced} />
        <span className="font-medium">{name}</span>
        {argument && <span className="truncate font-mono text-muted-foreground">{argument}</span>}
        {showTimer && (
          <span
            data-slot="tool-call-chip-timer"
            className="font-mono text-muted-foreground tabular-nums"
          >
            {formatDuration(elapsed)}
          </span>
        )}
      </span>
      <span className="sr-only">{statusText(status, name, argument, elapsed)}</span>
    </>
  );
  const motionProps = {
    "data-status": status,
    className: className_,
    animate: { x: shaking ? shakeKeyframes(shake) : 0 },
    transition: { duration: shaking ? SHAKE_SECONDS : 0 },
  };

  if (asButton) {
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        data-slot="tool-call-chip"
        aria-label={`Reexecutar ${argument ? `${name} ${argument}` : name}`}
        {...motionProps}
        {...(props as React.ComponentProps<typeof motion.button>)}
        onClick={onRetry}
      >
        {body}
      </motion.button>
    );
  }
  return (
    <motion.div
      ref={ref}
      data-slot="tool-call-chip"
      role="status"
      {...motionProps}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {body}
    </motion.div>
  );
}

ToolCallChip.displayName = "ToolCallChip";

export { ToolCallChip };
