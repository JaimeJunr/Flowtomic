"use client";

import * as React from "react";
import { Button } from "@/components/atoms/actions/button";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { StepperContent } from "./stepper-content";
import { StepperIndicators } from "./stepper-parts";
import { clampStep, nextStep, prevStep, validateStepperProps } from "./stepper-utils";

export type StepperProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Um nó por passo. */
  steps: React.ReactNode[];
  /** Rótulo curto de cada passo (leitor de tela e title do círculo). */
  labels: string[];
  /** Passo inicial, 1-based. */
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  backLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  /** Impede clicar nos círculos para pular. */
  disableIndicatorNavigation?: boolean;
  /** Conteúdo depois de concluir. */
  completedContent?: React.ReactNode;
};

type Navigation = { step: number; direction: 1 | -1 };

/** Foca a região de conteúdo a cada troca (menos na montagem) para o leitor de tela anunciar o novo passo. */
function useFocusOnChange(step: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const first = React.useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: o foco deve disparar a cada troca de passo
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [step]);
  return ref;
}

function Stepper({
  steps,
  labels,
  initialStep = 1,
  onStepChange,
  onComplete,
  backLabel = "Voltar",
  nextLabel = "Continuar",
  completeLabel = "Concluir",
  disableIndicatorNavigation = false,
  completedContent,
  className,
  ref,
  ...props
}: StepperProps) {
  validateStepperProps(steps.length, labels.length);
  const total = steps.length;
  const reduced = useShouldReduceMotion();
  const [nav, setNav] = React.useState<Navigation>(() => ({
    step: clampStep(initialStep, total),
    direction: 1,
  }));
  const contentRef = useFocusOnChange(nav.step);
  const done = nav.step > total;

  const goTo = (target: number) => {
    if (target === nav.step) return;
    setNav({ step: target, direction: target > nav.step ? 1 : -1 });
    if (target <= total) onStepChange?.(target);
  };
  const advance = () => {
    if (nav.step === total) onComplete?.();
    goTo(nextStep(nav.step, total));
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a raiz e um div estilizavel, fieldset traria estilo nativo
    <div
      ref={ref}
      role="group"
      aria-label="Etapas"
      data-slot="stepper"
      data-step={nav.step}
      className={cn("w-full rounded-lg border bg-card p-6 text-card-foreground", className)}
      {...props}
    >
      <StepperIndicators
        labels={labels}
        step={nav.step}
        reduced={reduced}
        disabled={disableIndicatorNavigation}
        onSelect={goTo}
      />
      <div className="mt-6">
        <StepperContent
          ref={contentRef}
          contentKey={done ? "done" : String(nav.step)}
          direction={nav.direction}
          reduced={reduced}
        >
          {done ? completedContent : steps[nav.step - 1]}
        </StepperContent>
      </div>
      {!done && (
        <div data-slot="stepper-footer" className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className={cn(nav.step === 1 && "invisible")}
            onClick={() => goTo(prevStep(nav.step))}
          >
            {backLabel}
          </Button>
          <Button type="button" onClick={advance}>
            {nav.step === total ? completeLabel : nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
Stepper.displayName = "Stepper";

export { Stepper };
