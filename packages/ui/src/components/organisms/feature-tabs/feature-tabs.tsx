/**
 * FeatureTabs - Flowtomic UI
 *
 * Seção de recursos em abas: lista vertical com régua no largo, faixa horizontal rolável no
 * estreito (container queries), painel por recurso e endereço opcional por hash.
 * Todos os painéis ficam montados e empilhados na mesma célula para a altura não pular.
 */

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ArrowRight } from "lucide-react";
import { MotionConfigContext, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type FeatureTab = {
  /** Também é o hash da URL quando `syncHash` está ligado. */
  id: string;
  label: React.ReactNode;
  /** Ícone de 16 px antes do texto da aba. */
  icon?: React.ReactNode;
  heading: React.ReactNode;
  description?: React.ReactNode;
  points?: React.ReactNode[];
  /** Sem `label`, o texto é "Saiba mais sobre <nome da aba>". */
  link?: { label?: React.ReactNode; href: string };
  /** Abaixo do texto no estreito; à direita a partir de 1024 px de contêiner. */
  media?: React.ReactNode;
};

export type FeatureTabsProps = Omit<React.ComponentProps<"section">, "title" | "defaultValue"> & {
  tabs: FeatureTab[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Nível do título; o título de cada painel fica no nível seguinte. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Id da aba ativa (controlado). */
  value?: string;
  /** @default id da primeira aba */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Reflete a aba ativa em `#<id>` (sem empilhar histórico) e abre a aba do hash ao montar. @default false */
  syncHash?: boolean;
  /** `aria-label` da lista de abas. @default "Recursos" */
  label?: string;
};

const WIDE_MIN_WIDTH = 768;

/** Mede o contêiner para trocar a orientação do Radix (as setas seguem a orientação). */
function useIsWide(ref: React.RefObject<HTMLElement | null>): boolean {
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWide(el.getBoundingClientRect().width >= WIDE_MIN_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return wide;
}

function useInstantMotion(): boolean {
  const reduced = useReducedMotion();
  const config = React.useContext(MotionConfigContext).reducedMotion;
  return Boolean(reduced) || config === "always";
}

function FeatureTabTrigger({
  tab,
  active,
  indicatorId,
  instant,
}: {
  tab: FeatureTab;
  active: boolean;
  indicatorId: string;
  instant: boolean;
}) {
  return (
    <TabsPrimitive.Trigger
      value={tab.id}
      data-slot="feature-tabs-trigger"
      className={cn(
        "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2.5 text-left text-sm text-muted-foreground outline-none transition-colors",
        "hover:font-medium hover:text-foreground data-[state=active]:font-medium data-[state=active]:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      )}
    >
      {tab.icon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center">
          {tab.icon}
        </span>
      )}
      <span>{tab.label}</span>
      {active && (
        <motion.span
          layoutId={indicatorId}
          aria-hidden="true"
          data-slot="feature-tabs-indicator"
          transition={instant ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
          className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-primary @min-[768px]:inset-x-auto @min-[768px]:inset-y-0 @min-[768px]:-left-px @min-[768px]:bottom-auto @min-[768px]:h-auto @min-[768px]:w-0.5"
        />
      )}
    </TabsPrimitive.Trigger>
  );
}

function FeatureTabPanel({
  tab,
  active,
  headingLevel,
}: {
  tab: FeatureTab;
  active: boolean;
  headingLevel: number;
}) {
  const Heading = `h${headingLevel}` as "h3" | "h4" | "h5";
  const hasMedia = tab.media !== undefined && tab.media !== null;
  return (
    <TabsPrimitive.Content
      value={tab.id}
      forceMount
      data-slot="feature-tabs-panel"
      aria-hidden={active ? undefined : true}
      className={cn(
        "[grid-area:stack] min-w-0 outline-none transition-[opacity,visibility] duration-150 motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:opacity-0"
      )}
    >
      <div className={cn("grid grid-cols-1 gap-8", hasMedia && "@min-[1024px]:grid-cols-2")}>
        <div className="min-w-0">
          <Heading className="max-w-[22ch] text-balance text-xl font-semibold @min-[768px]:text-2xl">
            {tab.heading}
          </Heading>
          {tab.description && (
            <p className="mt-4 max-w-[60ch] text-base text-muted-foreground">{tab.description}</p>
          )}
          {tab.points && tab.points.length > 0 && (
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              {tab.points.map((point, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de pontos
                <li key={index} className="flex items-start gap-3">
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                  />
                  <span className="min-w-0">{point}</span>
                </li>
              ))}
            </ul>
          )}
          {tab.link && (
            <a
              href={tab.link.href}
              className="mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {tab.link.label ?? <>Saiba mais sobre {tab.label}</>}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </a>
          )}
        </div>
        {hasMedia && (
          <div data-slot="feature-tabs-media" className="min-w-0">
            {tab.media}
          </div>
        )}
      </div>
    </TabsPrimitive.Content>
  );
}

/** Seção de recursos em abas com painel de altura estável e endereço por hash. */
function FeatureTabs({
  tabs,
  title,
  description,
  headingLevel = 2,
  value,
  defaultValue,
  onValueChange,
  syncHash = false,
  label = "Recursos",
  className,
  ...props
}: FeatureTabsProps) {
  const baseId = React.useId();
  const titleId = `${baseId}-title`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const sectionRef = React.useRef<HTMLElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const wide = useIsWide(sectionRef);
  const instant = useInstantMotion();

  const [inner, setInner] = React.useState(defaultValue ?? tabs[0]?.id ?? "");
  const controlled = value !== undefined;
  const active = controlled ? value : inner;

  // biome-ignore lint/correctness/useExhaustiveDependencies: só na montagem, a partir do hash inicial
  React.useEffect(() => {
    if (!syncHash || typeof window === "undefined") return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || id === active || !tabs.some((tab) => tab.id === id)) return;
    setInner(id);
    onValueChange?.(id);
  }, []);

  const firstRun = React.useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `active` e `wide` disparam o efeito, o corpo só lê o DOM
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (wide) return;
    const target = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
    ).find((el) => el.getAttribute("data-state") === "active");
    target?.scrollIntoView?.({ inline: "nearest", block: "nearest" });
  }, [active, wide]);

  const handleChange = (id: string) => {
    if (!controlled) setInner(id);
    if (syncHash) window.history.replaceState(window.history.state, "", `#${id}`);
    onValueChange?.(id);
  };

  return (
    <section
      ref={sectionRef}
      data-slot="feature-tabs"
      aria-labelledby={title ? titleId : undefined}
      className={cn("@container bg-background px-6 py-16 text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        {(title || description) && (
          <div data-slot="feature-tabs-header" className="mb-10">
            {title && (
              <Heading
                id={titleId}
                className="text-balance text-display-xs font-semibold @min-[768px]:text-display-sm"
              >
                {title}
              </Heading>
            )}
            {description && (
              <p className="mt-4 max-w-[56ch] text-base text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <TabsPrimitive.Root
          value={active}
          onValueChange={handleChange}
          orientation={wide ? "vertical" : "horizontal"}
          className="grid grid-cols-1 gap-6 @min-[768px]:grid-cols-[minmax(10rem,14rem)_1fr] @min-[768px]:gap-10"
        >
          <TabsPrimitive.List
            ref={listRef}
            aria-label={label}
            data-slot="feature-tabs-list"
            className="flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @min-[768px]:flex-col @min-[768px]:self-start @min-[768px]:overflow-visible @min-[768px]:border-b-0 @min-[768px]:border-l"
          >
            {tabs.map((tab) => (
              <FeatureTabTrigger
                key={tab.id}
                tab={tab}
                active={tab.id === active}
                indicatorId={`${baseId}-indicator`}
                instant={instant}
              />
            ))}
          </TabsPrimitive.List>
          <div className="grid min-w-0 [grid-template-areas:'stack'] @min-[768px]:border-l @min-[768px]:border-border @min-[768px]:pl-10">
            {tabs.map((tab) => (
              <FeatureTabPanel
                key={tab.id}
                tab={tab}
                active={tab.id === active}
                headingLevel={headingLevel + 1}
              />
            ))}
          </div>
        </TabsPrimitive.Root>
      </div>
    </section>
  );
}

FeatureTabs.displayName = "FeatureTabs";

export { FeatureTabs };
