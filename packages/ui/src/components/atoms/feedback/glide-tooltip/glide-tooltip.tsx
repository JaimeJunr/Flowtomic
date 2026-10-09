/**
 * GlideTooltip - Flowtomic UI
 *
 * Rótulo compartilhado para barras de ferramentas: o primeiro hover espera um
 * pouco e o rótulo surge com pop; ao passar para o botão vizinho ele não
 * fecha e reabre, desliza até o novo gatilho trocando o texto no caminho.
 * Saindo da barra, o grupo "esfria" depois de uma janela e o próximo hover
 * volta a esperar. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/glide-tooltip.md
 */

"use client";

import { AnimatePresence, motion, useIsPresent } from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type GlideSide,
  placeLabel,
  popOrigin,
  resolveSide,
  type WarmthState,
  warmthReducer,
} from "./glide-tooltip-utils";

const DEFAULT_DELAY_MS = 400;
const DEFAULT_WARM_WINDOW_MS = 300;
const DEFAULT_TRAVEL_MS = 240;
const POP_SECONDS = 0.16;
const POP_SCALE = 0.94;
const FUSE_THICKNESS_PX = 1.5;
const COLD_STATE: WarmthState = { phase: "cold", target: null, delayMs: 0 };

/** Tudo o que o rótulo compartilhado precisa saber do gatilho que o chamou. */
type GlideEntry = {
  id: string;
  anchor: HTMLElement;
  content: React.ReactNode;
  shortcut?: React.ReactNode;
  side: GlideSide;
  showFuse: boolean;
  className?: string;
};

type GlideContextValue = {
  phase: WarmthState["phase"];
  target: string | null;
  delayMs: number;
  labelId: string;
  enter: (entry: GlideEntry, delayMs: number) => void;
  leave: (id: string) => void;
  close: () => void;
};

const GlideContext = React.createContext<GlideContextValue | null>(null);

export type GlideTooltipGroupProps = {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  /** Espera do primeiro hover, em ms. */
  delayMs?: number;
  /** Quanto tempo depois de sair o grupo continua "quente" (abre sem esperar), em ms. */
  warmWindowMs?: number;
  /** Duração do deslize entre gatilhos, em ms. 0 = pula. */
  travelMs?: number;
};

export type GlideTooltipProps = {
  content: React.ReactNode;
  /** Atalho desenhado como `<kbd>`. */
  shortcut?: React.ReactNode;
  /** O gatilho; recebe apenas `aria-describedby` e handlers compostos com os seus. */
  children: React.ReactElement<GlideTriggerProps>;
  side?: GlideSide;
  /** Herda do grupo quando omitido. */
  delayMs?: number;
  /** Linha fina que enche na borda do gatilho durante a espera. */
  showFuse?: boolean;
  disabled?: boolean;
  /** Aplicada ao rótulo. */
  className?: string;
};

type GlideTriggerProps = {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  "aria-describedby"?: string;
};

type Viewport = { width: number; height: number };

function currentViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

type LabelLayout = { x: number; y: number; width: number; height: number; side: GlideSide };

type GlideLabelProps = {
  entry: GlideEntry;
  labelId: string;
  travelMs: number;
  reduced: boolean;
};

/** O único rótulo do grupo: muda de âncora em vez de ser recriado por gatilho. */
function GlideLabel({ entry, labelId, travelMs, reduced }: GlideLabelProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const placedOnce = React.useRef(false);
  const present = useIsPresent();
  const [layout, setLayout] = React.useState<LabelLayout | null>(null);

  // Mede o conteúdo natural e a âncora; refaz a cada troca de gatilho.
  React.useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const size = { width: inner.offsetWidth, height: inner.offsetHeight };
    const rect = entry.anchor.getBoundingClientRect();
    const side = resolveSide(rect, size, entry.side, currentViewport());
    setLayout({ ...placeLabel(rect, size, side), ...size, side });
  }, [entry]);

  React.useEffect(() => {
    if (layout) placedOnce.current = true;
  }, [layout]);

  // A primeira posição nunca desliza (viria do canto da tela); só as seguintes.
  const glides = placedOnce.current && !reduced && travelMs > 0;
  const moveSeconds = glides ? travelMs / 1000 : 0;
  const hidden = {
    opacity: 0,
    scale: reduced ? 1 : POP_SCALE,
    filter: reduced ? "blur(0px)" : "blur(4px)",
  };
  const side = layout?.side ?? entry.side;

  return (
    <motion.div
      data-slot="glide-tooltip"
      data-side={side}
      data-state={present ? "open" : "closed"}
      role="tooltip"
      id={labelId}
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground text-xs shadow-md",
        entry.className
      )}
      style={{
        transformOrigin: popOrigin(side),
        width: layout?.width,
        height: layout?.height,
        transition: glides
          ? `width ${travelMs}ms ease-out, height ${travelMs}ms ease-out`
          : undefined,
      }}
      initial={hidden}
      animate={{
        opacity: layout ? 1 : 0,
        scale: 1,
        filter: "blur(0px)",
        x: layout?.x ?? 0,
        y: layout?.y ?? 0,
      }}
      exit={{ ...hidden, transition: { duration: reduced ? 0.1 : POP_SECONDS * 0.8 } }}
      transition={{
        default: { duration: reduced ? 0.1 : POP_SECONDS, ease: "easeOut" },
        x: { duration: moveSeconds, ease: "easeOut" },
        y: { duration: moveSeconds, ease: "easeOut" },
      }}
    >
      <div ref={innerRef} className="flex w-max max-w-xs items-center gap-2 px-3 py-1.5">
        <span>{entry.content}</span>
        {entry.shortcut != null && (
          <kbd className="rounded-sm bg-foreground/10 px-1 font-mono text-[10px] text-muted-foreground">
            {entry.shortcut}
          </kbd>
        )}
      </div>
    </motion.div>
  );
}

GlideLabel.displayName = "GlideLabel";

/** Linha que cresce na borda do gatilho, do lado `side`, durante a espera. */
function GlideFuse({ entry, delayMs }: { entry: GlideEntry; delayMs: number }) {
  const rect = React.useMemo(() => entry.anchor.getBoundingClientRect(), [entry.anchor]);
  const vertical = entry.side === "left" || entry.side === "right";
  const position: React.CSSProperties = vertical
    ? {
        top: rect.top,
        height: rect.height,
        width: FUSE_THICKNESS_PX,
        left: entry.side === "left" ? rect.left : rect.right - FUSE_THICKNESS_PX,
        transformOrigin: "top",
      }
    : {
        left: rect.left,
        width: rect.width,
        height: FUSE_THICKNESS_PX,
        top: entry.side === "top" ? rect.top : rect.bottom - FUSE_THICKNESS_PX,
        transformOrigin: "left",
      };
  const axis = vertical ? "scaleY" : "scaleX";
  return (
    <motion.div
      aria-hidden="true"
      data-slot="glide-tooltip-fuse"
      className="pointer-events-none fixed z-50 bg-primary"
      style={position}
      initial={{ [axis]: 0 }}
      animate={{ [axis]: 1 }}
      transition={{ duration: delayMs / 1000, ease: "linear" }}
    />
  );
}

GlideFuse.displayName = "GlideFuse";

/**
 * Agrupa gatilhos que compartilham um único rótulo deslizante.
 *
 * Não usa o Tooltip do Radix porque ele cria um conteúdo por gatilho, e o
 * deslize exige um rótulo só que muda de âncora. Acessibilidade mantida à mão:
 * `role="tooltip"` com `id`, `aria-describedby` no gatilho só enquanto aberto,
 * abre no foco e fecha no blur, Escape fecha, o rótulo não é interativo e
 * nunca recebe foco. Toque (pressionar e segurar) ainda não é tratado.
 *
 * O wrapper é um `div` com `display: contents`: não participa do layout, então
 * o grupo não altera a barra de ferramentas que o contém.
 */
function GlideTooltipGroup({
  ref,
  children,
  delayMs = DEFAULT_DELAY_MS,
  warmWindowMs = DEFAULT_WARM_WINDOW_MS,
  travelMs = DEFAULT_TRAVEL_MS,
}: GlideTooltipGroupProps) {
  const reduced = useShouldReduceMotion();
  const labelId = React.useId();
  const [state, dispatch] = React.useReducer(warmthReducer, COLD_STATE);
  const [entry, setEntry] = React.useState<GlideEntry | null>(null);

  React.useEffect(() => {
    if (state.phase === "pending") {
      const timer = setTimeout(() => dispatch({ type: "elapsed" }), state.delayMs);
      return () => clearTimeout(timer);
    }
    if (state.phase === "warm") {
      const timer = setTimeout(() => dispatch({ type: "cool" }), warmWindowMs);
      return () => clearTimeout(timer);
    }
  }, [state, warmWindowMs]);

  const enter = React.useCallback((next: GlideEntry, enterDelayMs: number) => {
    setEntry(next);
    dispatch({ type: "enter", id: next.id, delayMs: enterDelayMs });
  }, []);
  const leave = React.useCallback((id: string) => dispatch({ type: "leave", id }), []);
  const close = React.useCallback(() => dispatch({ type: "close" }), []);

  const value = React.useMemo<GlideContextValue>(
    () => ({ phase: state.phase, target: state.target, delayMs, labelId, enter, leave, close }),
    [state.phase, state.target, delayMs, labelId, enter, leave, close]
  );

  const showLabel = state.phase === "open" && entry !== null;
  const showFuse = state.phase === "pending" && entry?.showFuse === true && !reduced;

  return (
    <GlideContext value={value}>
      <div ref={ref} data-slot="glide-tooltip-group" className="contents">
        {children}
        {typeof document !== "undefined" &&
          createPortal(
            <>
              <AnimatePresence>
                {showLabel && (
                  <GlideLabel
                    key="label"
                    entry={entry}
                    labelId={labelId}
                    travelMs={travelMs}
                    reduced={reduced}
                  />
                )}
              </AnimatePresence>
              {showFuse && <GlideFuse key={entry.id} entry={entry} delayMs={state.delayMs} />}
            </>,
            document.body
          )}
      </div>
    </GlideContext>
  );
}

GlideTooltipGroup.displayName = "GlideTooltipGroup";

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined === "" ? undefined : joined;
}

type TriggerBindingProps = GlideTooltipProps & { group: GlideContextValue };

function GlideTooltipBound({
  group,
  content,
  shortcut,
  children,
  side = "top",
  delayMs,
  showFuse = false,
  disabled = false,
  className,
}: TriggerBindingProps) {
  const id = React.useId();
  const { leave, close, labelId } = group;
  const isOpen = group.phase === "open" && group.target === id;
  const child = children.props;

  const show = (anchor: HTMLElement) => {
    group.enter(
      { id, anchor, content, shortcut, side, showFuse, className },
      delayMs ?? group.delayMs
    );
  };

  // Gatilho que some ou fica desabilitado não pode deixar o rótulo preso.
  React.useEffect(() => {
    if (disabled) leave(id);
    return () => leave(id);
  }, [disabled, id, leave]);

  return React.cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      child.onMouseEnter?.(event);
      if (!disabled) show(event.currentTarget);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      child.onMouseLeave?.(event);
      leave(id);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      child.onFocus?.(event);
      if (!disabled) show(event.currentTarget);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      child.onBlur?.(event);
      leave(id);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      child.onKeyDown?.(event);
      if (event.key === "Escape") close();
    },
    "aria-describedby": isOpen
      ? joinIds(child["aria-describedby"], labelId)
      : child["aria-describedby"],
  });
}

GlideTooltipBound.displayName = "GlideTooltipBound";

/**
 * Rótulo de um gatilho. Dentro de um `GlideTooltipGroup` desliza entre
 * vizinhos; fora dele funciona sozinho (abre e fecha com pop, sem deslizar).
 */
function GlideTooltip(props: GlideTooltipProps) {
  const group = React.useContext(GlideContext);
  if (group) return <GlideTooltipBound group={group} {...props} />;
  return (
    <GlideTooltipGroup>
      <GlideTooltip {...props} />
    </GlideTooltipGroup>
  );
}

GlideTooltip.displayName = "GlideTooltip";

export { GlideTooltip, GlideTooltipGroup };
