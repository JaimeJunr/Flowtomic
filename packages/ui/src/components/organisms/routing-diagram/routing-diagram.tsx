"use client";

/**
 * RoutingDiagram - Flowtomic UI
 *
 * Ilustração de uma regra de roteamento: um pedido sai da origem, passa por decisões e chega a um
 * destino. Vários cenários (abas) contam a mesma estrutura com outro critério e o caminho escolhido
 * acende. Não é editor (sem arrastar/zoom); o editor de fluxo é o `canvas`/`node`/`edge`.
 */

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  chooseOrientation,
  computeLayout,
  type LayoutEdge,
  type LayoutNode,
  pointOnCubic,
  resolvePath,
  SOURCE_ID,
} from "./layout";
import type { RoutingScenario } from "./types";

const FALLBACK_WIDTH = 800;
const SEGMENT_MS = 250;
const PULSE_PERIOD_MS = 2400;
const AUTOPLAY_MS = 5000;

// ---------------------------------------------------------------------------
// Estado compartilhado (cenário atual)
// ---------------------------------------------------------------------------

type ScenarioStateProps = {
  scenarios: RoutingScenario[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ScenarioState = {
  scenarios: RoutingScenario[];
  scenario: RoutingScenario | undefined;
  select: (value: string, origin: "user" | "auto") => void;
  /** Verdadeiro depois que a pessoa clicou numa aba (para o autoPlay). */
  interacted: boolean;
};

const ScenarioContext = React.createContext<ScenarioState | null>(null);

function useScenarioState({
  scenarios,
  value,
  defaultValue,
  onValueChange,
}: ScenarioStateProps): ScenarioState {
  const [inner, setInner] = React.useState(defaultValue);
  const [interacted, setInteracted] = React.useState(false);
  const wanted = value ?? inner;
  const scenario = scenarios.find((s) => s.value === wanted) ?? scenarios[0];
  const controlled = value !== undefined;

  const select = React.useCallback(
    (next: string, origin: "user" | "auto") => {
      if (origin === "user") setInteracted(true);
      if (!controlled) setInner(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange]
  );

  return { scenarios, scenario, select, interacted };
}

export type RoutingDiagramProviderProps = ScenarioStateProps & { children?: React.ReactNode };

/**
 * Guarda o cenário atual para que `RoutingDiagramDescription` possa ficar fora do diagrama.
 * Dentro dele, o `RoutingDiagram` usa o estado do provider (`scenarios`/`value` próprios são ignorados).
 */
function RoutingDiagramProvider({ children, ...state }: RoutingDiagramProviderProps) {
  const value = useScenarioState(state);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}
RoutingDiagramProvider.displayName = "RoutingDiagramProvider";

/** Descrição do cenário ativo; precisa estar dentro de um `RoutingDiagram` ou `RoutingDiagramProvider`. */
function RoutingDiagramDescription({ className, ...props }: React.ComponentProps<"div">) {
  const description = React.useContext(ScenarioContext)?.scenario?.description;
  if (description === undefined || description === null || description === false) return null;
  return (
    <div
      data-slot="routing-diagram-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {description}
    </div>
  );
}
RoutingDiagramDescription.displayName = "RoutingDiagramDescription";

// ---------------------------------------------------------------------------
// Tom (cores) e medidas
// ---------------------------------------------------------------------------

type Tone = "neutral" | "brand";

const TONE = {
  neutral: {
    stroke: "var(--foreground)",
    border: "border-foreground",
    fill: "border-foreground bg-foreground text-background",
  },
  brand: {
    stroke: "var(--primary)",
    border: "border-primary",
    fill: "border-primary bg-primary text-primary-foreground",
  },
} as const;

function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const padding =
      (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0);
    setWidth(Math.max(0, el.clientWidth - padding));
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (typeof next === "number") setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function useInView(ref: React.RefObject<HTMLElement | null>): {
  inView: boolean;
  started: boolean;
} {
  const [inView, setInView] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (!last) return;
      setInView(last.isIntersecting);
      if (last.isIntersecting) setStarted(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return { inView, started };
}

// ---------------------------------------------------------------------------
// Peças
// ---------------------------------------------------------------------------

function box(n: LayoutNode): React.CSSProperties {
  return {
    position: "absolute",
    boxSizing: "border-box",
    left: n.x,
    top: n.y,
    width: n.w,
    height: n.h,
  };
}

function SourceMock({ label, compact }: { label: string; compact: boolean }) {
  return (
    <div
      data-slot="routing-diagram-source-mock"
      className={cn(
        "flex size-full overflow-hidden rounded-md border bg-card",
        compact ? "flex-row items-center gap-2 px-2" : "flex-col gap-1.5 p-2"
      )}
    >
      <span className="flex shrink-0 gap-1" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
      </span>
      <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
      {compact ? null : (
        <span className="mt-auto flex flex-col gap-1" aria-hidden="true">
          <span className="h-1.5 w-full rounded-full bg-muted" />
          <span className="h-1.5 w-4/5 rounded-full bg-muted" />
          <span className="h-1.5 w-full rounded-full bg-muted" />
          <span className="h-1.5 w-3/5 rounded-full bg-muted" />
        </span>
      )}
    </div>
  );
}

type Reveal = { enabled: boolean; delayMs: number };

function revealStyle(reveal: Reveal): React.CSSProperties | undefined {
  return reveal.enabled ? { transitionDelay: `${reveal.delayMs}ms` } : undefined;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export type RoutingDiagramProps = Omit<React.ComponentProps<"div">, "defaultValue"> &
  Omit<ScenarioStateProps, "scenarios"> & {
    /** Obrigatório, a não ser que o diagrama esteja dentro de um `RoutingDiagramProvider`. */
    scenarios?: RoutingScenario[];
    /** Substitui o app esquemático da origem. */
    source?: React.ReactNode;
    /** Padrão "App"; usado no mock e no aria-label. */
    sourceLabel?: string;
    /** `brand` pinta o caminho ativo com `--primary`. */
    tone?: Tone;
    /** Ponto que percorre o caminho ativo a cada 2,4 s. */
    pulse?: boolean;
    /** Troca de cenário sozinho a cada 5 s; pausa no hover/foco e para após clique em aba. */
    autoPlay?: boolean;
    /** Sobrescreve o aria-label gerado do caminho ativo. */
    ariaLabel?: string;
    /** Padrão: a descrição do cenário abaixo do diagrama. */
    renderDescription?: (description: React.ReactNode) => React.ReactNode;
  };

const NO_SCENARIOS: RoutingScenario[] = [];

function RoutingDiagram({
  scenarios = NO_SCENARIOS,
  value,
  defaultValue,
  onValueChange,
  source,
  sourceLabel = "App",
  tone = "neutral",
  pulse = true,
  autoPlay = false,
  ariaLabel,
  renderDescription,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: RoutingDiagramProps) {
  const outer = React.useContext(ScenarioContext);
  const own = useScenarioState({ scenarios, value, defaultValue, onValueChange });
  const state = outer ?? own;
  const { scenario, select } = state;
  const list = state.scenarios;

  const reduce = useShouldReduceMotion();
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const measured = useElementWidth(canvasRef);
  const { inView, started } = useInView(canvasRef);
  const [paused, setPaused] = React.useState(false);

  const available = measured > 0 ? measured : FALLBACK_WIDTH;
  const roots = React.useMemo(() => list.map((s) => s.root), [list]);
  const orientation = React.useMemo(() => chooseOrientation(roots, available), [roots, available]);

  const layout = React.useMemo(
    () => (scenario ? computeLayout(scenario.root, { orientation, width: available }) : null),
    [scenario, orientation, available]
  );
  const path = React.useMemo(
    () => (scenario ? resolvePath(scenario, sourceLabel) : null),
    [scenario, sourceLabel]
  );

  const missingKey = path?.missing.join(",") ?? "";
  React.useEffect(() => {
    if (missingKey && (typeof process === "undefined" || process.env.NODE_ENV !== "production")) {
      console.warn(
        `RoutingDiagram: activePath tem ids que não existem na árvore (${missingKey}); nenhum caminho será destacado.`
      );
    }
  }, [missingKey]);

  // autoPlay: um timer próprio (não é do motion), que reinicia a cada troca.
  const index = Math.max(
    0,
    list.findIndex((s) => s.value === scenario?.value)
  );
  const autoPlayOn = autoPlay && !reduce && !state.interacted && !paused && list.length > 1;
  React.useEffect(() => {
    if (!autoPlayOn) return;
    const id = setTimeout(() => {
      const next = list[(index + 1) % list.length];
      if (next) select(next.value, "auto");
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [autoPlayOn, index, list, select]);

  const activeEdgeKeys = path?.valid ? path.edgeKeys : [];
  const activeIds = new Set(path?.valid ? path.ids : []);
  const destinationId = path?.valid ? path.ids[path.ids.length - 1] : undefined;
  const showActive = started;
  const animate = showActive && !reduce;
  const toneClass = TONE[tone];

  const arrivalMs = new Map<string, number>();
  arrivalMs.set(SOURCE_ID, 0);
  (path?.valid ? path.ids : []).forEach((id, i) => {
    arrivalMs.set(id, (i + 1) * SEGMENT_MS);
  });
  const edgeOrder = new Map(activeEdgeKeys.map((key, i) => [key, i] as const));

  // Pulso: um ponto percorre o caminho ativo; escreve direto no DOM, sem re-render.
  const dotRef = React.useRef<SVGCircleElement>(null);
  const startRef = React.useRef<number | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: reinicia o relógio a cada troca de cenário
  React.useEffect(() => {
    startRef.current = null;
  }, [scenario?.value]);

  const segments = React.useMemo(
    () =>
      activeEdgeKeys
        .map((key) => layout?.edges.find((e) => e.id === key)?.points)
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [activeEdgeKeys, layout]
  );
  const pulseOn = pulse && showActive && inView && !reduce && segments.length > 0;

  useFrameLoop(
    (now) => {
      const dot = dotRef.current;
      if (!dot) return;
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current - segments.length * SEGMENT_MS;
      if (elapsed < 0) {
        dot.setAttribute("opacity", "0");
        return;
      }
      const phase = (elapsed % PULSE_PERIOD_MS) / PULSE_PERIOD_MS;
      const travel = 0.75;
      if (phase > travel) {
        dot.setAttribute("opacity", "0");
        return;
      }
      const p = (phase / travel) * segments.length;
      const i = Math.min(segments.length - 1, Math.floor(p));
      const point = pointOnCubic(segments[i], p - i);
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      dot.setAttribute("opacity", "1");
    },
    pulseOn,
    60
  );

  const resolvedAria = ariaLabel ?? path?.ariaLabel ?? sourceLabel;
  const sourceActive = activeEdgeKeys.length > 0;

  const description =
    scenario?.description !== undefined && scenario.description !== null
      ? renderDescription
        ? renderDescription(scenario.description)
        : null
      : null;

  const body = (
    // biome-ignore lint/a11y/noStaticElementInteractions: os eventos só pausam o autoPlay; não há ação
    <div
      data-slot="routing-diagram"
      ref={ref}
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground",
        className
      )}
      style={style}
      onPointerEnter={(event) => {
        setPaused(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setPaused(false);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        setPaused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setPaused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {list.length > 1 && scenario ? (
        <TabsPrimitive.Root
          value={scenario.value}
          onValueChange={(next) => select(next, "user")}
          className="w-fit"
        >
          <TabsPrimitive.List
            data-slot="routing-diagram-tabs"
            aria-label="Cenários"
            className="inline-flex w-fit items-center gap-1"
          >
            {list.map((s) => (
              <TabsPrimitive.Trigger
                key={s.value}
                value={s.value}
                className="whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                {s.label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
        </TabsPrimitive.Root>
      ) : null}

      <div
        data-slot="routing-diagram-canvas"
        ref={canvasRef}
        role="img"
        aria-label={resolvedAria}
        data-orientation={orientation}
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {layout ? (
          <div className="relative" style={{ width: layout.width, height: layout.height }}>
            <svg
              aria-hidden="true"
              width={layout.width}
              height={layout.height}
              className="pointer-events-none absolute inset-0 overflow-visible"
            >
              {layout.edges.map((edge) => (
                <path
                  key={edge.id}
                  d={edge.d}
                  fill="none"
                  stroke="color-mix(in oklch, var(--muted-foreground) 55%, transparent)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              ))}
              <AnimatePresence>
                {layout.edges
                  .filter((edge) => showActive && edgeOrder.has(edge.id))
                  .map((edge) => {
                    const order = edgeOrder.get(edge.id) ?? 0;
                    return (
                      <motion.path
                        key={`${scenario?.value}:${edge.id}`}
                        data-slot="routing-diagram-edge-active"
                        d={edge.d}
                        fill="none"
                        stroke={toneClass.stroke}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        initial={{ pathLength: reduce ? 1 : 0, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
                        transition={{
                          duration: reduce ? 0 : SEGMENT_MS / 1000,
                          delay: reduce ? 0 : (order * SEGMENT_MS) / 1000,
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
              </AnimatePresence>
              {pulseOn ? (
                <circle
                  ref={dotRef}
                  data-slot="routing-diagram-pulse"
                  r={3.5}
                  fill={toneClass.stroke}
                  opacity={0}
                />
              ) : null}
            </svg>

            {layout.edges.map((edge) => (
              <EdgeLabel
                key={edge.id}
                edge={edge}
                active={edgeOrder.has(edge.id)}
                showActive={showActive}
                fillClass={toneClass.fill}
                reveal={{
                  enabled: animate,
                  delayMs: (edgeOrder.get(edge.id) ?? 0) * SEGMENT_MS + SEGMENT_MS / 2,
                }}
              />
            ))}

            {layout.nodes.map((n) => {
              if (n.id === SOURCE_ID) {
                return (
                  <div
                    key={n.id}
                    data-slot="routing-diagram-source"
                    data-active={sourceActive ? "true" : "false"}
                    style={box(n)}
                  >
                    {source ?? (
                      <SourceMock label={sourceLabel} compact={orientation === "vertical"} />
                    )}
                  </div>
                );
              }
              const routing = n.node;
              if (!routing) return null;
              const onPath = showActive && activeIds.has(n.id);
              const reveal: Reveal = { enabled: animate, delayMs: arrivalMs.get(n.id) ?? 0 };
              if (routing.kind === "decision") {
                return (
                  <div
                    key={n.id}
                    data-slot="routing-diagram-decision"
                    data-active={activeIds.has(n.id) ? "true" : "false"}
                    style={{ ...box(n), ...revealStyle(reveal) }}
                    className={cn(
                      "flex items-center justify-center rounded-full border bg-card px-3 text-center text-xs leading-tight transition-colors duration-150",
                      onPath ? `${toneClass.border} text-foreground` : "text-muted-foreground"
                    )}
                  >
                    <span className="line-clamp-2 [text-wrap:balance]">{routing.question}</span>
                  </div>
                );
              }
              const isDestination = n.id === destinationId;
              const down = routing.status === "down";
              const filled = showActive && isDestination;
              return (
                <div
                  key={n.id}
                  data-slot="routing-diagram-target"
                  data-active={isDestination ? "true" : "false"}
                  data-status={down ? "down" : "ok"}
                  style={{
                    ...box(n),
                    ...(animate && isDestination
                      ? { transitionDelay: `${reveal.delayMs}ms` }
                      : null),
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md border bg-card px-2.5 transition-colors duration-200",
                    filled ? toneClass.border : "border-border"
                  )}
                >
                  {routing.icon ? (
                    <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">
                      {routing.icon}
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium text-foreground">
                      {routing.title}
                    </span>
                    {routing.subtitle ? (
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {routing.subtitle}
                      </span>
                    ) : null}
                  </span>
                  {routing.badge ? (
                    <span
                      data-slot="routing-diagram-target-badge"
                      style={
                        filled && animate ? { transitionDelay: `${reveal.delayMs}ms` } : undefined
                      }
                      className={cn(
                        "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-200",
                        filled
                          ? toneClass.fill
                          : down
                            ? "border-transparent bg-muted text-muted-foreground"
                            : "border-border text-muted-foreground"
                      )}
                    >
                      {routing.badge}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <ol
        data-slot="routing-diagram-steps"
        aria-live="polite"
        aria-label="Caminho escolhido"
        className="sr-only"
      >
        {(path?.steps ?? []).map((step) => (
          <li key={step.id}>{step.text}</li>
        ))}
      </ol>

      {renderDescription ? description : <RoutingDiagramDescription />}
    </div>
  );

  // Fora de um provider, o estado próprio precisa chegar ao RoutingDiagramDescription.
  return outer ? body : <ScenarioContext.Provider value={own}>{body}</ScenarioContext.Provider>;
}
RoutingDiagram.displayName = "RoutingDiagram";

function EdgeLabel({
  edge,
  active,
  showActive,
  fillClass,
  reveal,
}: {
  edge: LayoutEdge;
  active: boolean;
  showActive: boolean;
  fillClass: string;
  reveal: Reveal;
}) {
  if (!edge.label) return null;
  const on = active && showActive;
  return (
    <span
      data-slot="routing-diagram-edge-label"
      data-active={active ? "true" : "false"}
      style={{
        position: "absolute",
        left: edge.mid.x,
        top: edge.mid.y,
        transform: "translate(-50%, -50%)",
        ...(on ? revealStyle(reveal) : null),
      }}
      className={cn(
        "whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] leading-none transition-colors duration-150",
        on ? fillClass : "border-border bg-card text-muted-foreground"
      )}
    >
      {edge.label}
    </span>
  );
}
EdgeLabel.displayName = "RoutingDiagramEdgeLabel";

export { RoutingDiagram, RoutingDiagramDescription, RoutingDiagramProvider };
