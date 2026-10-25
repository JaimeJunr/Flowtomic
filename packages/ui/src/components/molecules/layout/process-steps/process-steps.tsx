import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { ProcessStepDetail } from "./process-step-detail";
import type { ProcessStep } from "./process-steps-types";

export type ProcessStepsProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** De 2 a 4 passos. */
  steps: ProcessStep[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  headingLevel?: 2 | 3 | 4;
  /** Legenda centrada sobre uma régua fina abaixo da lista. */
  caption?: React.ReactNode;
  /** Mostra 01, 02, 03 acima de cada título; padrão `true`. */
  numbering?: boolean;
};

// Classes literais: o Tailwind só gera o que aparece escrito. Com 2 passos a terceira coluna
// ficaria vazia, então a lista para em 2 colunas.
const COLUMNS: Record<number, string> = {
  2: "grid-cols-1 @min-[640px]:grid-cols-2",
  3: "grid-cols-1 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3",
  4: "grid-cols-1 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3 @min-[1200px]:grid-cols-4",
};

const VISIBLE_RATIO = 0.4;

/** Diz se o elemento está ≥ 40% visível; sem IntersectionObserver (jsdom) vale `true`. */
function useVisible(ref: React.RefObject<HTMLElement | null>, disabled: boolean): boolean {
  const [visible, setVisible] = React.useState(!disabled);
  React.useEffect(() => {
    if (disabled) {
      setVisible(false);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    setVisible(false);
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        if (last) setVisible(last.isIntersecting);
      },
      { threshold: VISIBLE_RATIO }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, ref]);
  return visible;
}

type StepItemProps = {
  step: ProcessStep;
  index: number;
  numbering: boolean;
  stepHeading: "h3" | "h4" | "h5";
  reduceMotion: boolean;
};

function StepItem({ step, index, numbering, stepHeading, reduceMotion }: StepItemProps) {
  const ref = React.useRef<HTMLLIElement>(null);
  const active = useVisible(ref, reduceMotion);
  const Heading = stepHeading;
  const preview = typeof step.preview === "function" ? step.preview({ active }) : step.preview;

  return (
    <li
      ref={ref}
      data-slot="process-step"
      data-active={active ? "true" : "false"}
      className={cn(
        "relative flex flex-col gap-3",
        step.detail &&
          "[&_[data-slot=process-step-frame]]:transition-shadow hover:[&_[data-slot=process-step-frame]]:shadow-md"
      )}
    >
      {preview ? <div className="mb-1">{preview}</div> : null}
      {numbering ? (
        <span
          data-slot="process-step-number"
          aria-hidden="true"
          className="font-mono text-xs tabular-nums text-primary"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <Heading className="text-xl font-semibold">{step.title}</Heading>
      {step.description ? (
        <p className="text-sm text-muted-foreground">{step.description}</p>
      ) : null}
      {step.detail ? <ProcessStepDetail stepTitle={step.title} detail={step.detail} /> : null}
    </li>
  );
}

/** Passos de um processo em colunas, com mini-mock, número e texto; cada passo pode abrir detalhes. */
function ProcessSteps({
  steps,
  title,
  description,
  headingLevel = 2,
  caption,
  numbering = true,
  className,
  ...props
}: ProcessStepsProps) {
  const titleId = React.useId();
  const reduceMotion = useShouldReduceMotion();
  const TitleTag = `h${headingLevel}` as "h2" | "h3" | "h4";
  const stepHeading = `h${headingLevel + 1}` as "h3" | "h4" | "h5";
  const columns = COLUMNS[Math.min(Math.max(steps.length, 2), 4)];

  return (
    <section
      data-slot="process-steps"
      aria-labelledby={title ? titleId : undefined}
      className={cn("@container w-full", className)}
      {...props}
    >
      {title || description ? (
        <div data-slot="process-steps-header" className="mb-10 max-w-3xl space-y-3">
          {title ? (
            <TitleTag
              id={titleId}
              className="text-display-xs font-semibold text-balance @min-[768px]:text-display-sm"
            >
              {title}
            </TitleTag>
          ) : null}
          {description ? <p className="max-w-[56ch] text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <ol data-slot="process-steps-list" className={cn("grid gap-10", columns)}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            numbering={numbering}
            stepHeading={stepHeading}
            reduceMotion={reduceMotion}
          />
        ))}
      </ol>
      {caption ? (
        <div
          data-slot="process-steps-caption"
          className="mt-10 flex justify-center border-t border-border"
        >
          <span className="max-w-[90%] -translate-y-1/2 bg-background px-3 text-center text-xs text-muted-foreground">
            {caption}
          </span>
        </div>
      ) : null}
    </section>
  );
}
ProcessSteps.displayName = "ProcessSteps";

export { ProcessSteps };
