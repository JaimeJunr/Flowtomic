"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { InputGroupButton } from "@/components/molecules/forms/input-group";
import { cn } from "@/lib/utils";
import { usePromptInputExtras } from "./prompt-input-extras-context";

export type PromptInputEffortProps = {
  /** Passos do menor para o maior, ex.: ["Baixo", "Médio", "Alto", "Máximo"]. */
  steps: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (step: string) => void;
  /** Brilho e faíscas no último passo. */
  sparks?: boolean;
  label?: string;
  className?: string;
};

function stepIndex(steps: string[], step: string, source: string): number {
  const index = steps.indexOf(step);
  if (index === -1) {
    throw new RangeError(
      `invalid ${source}: received ${JSON.stringify(step)}, expected one of ${JSON.stringify(steps)}`
    );
  }
  return index;
}

export const PromptInputEffort = ({
  steps,
  value,
  defaultValue,
  onValueChange,
  sparks = true,
  label = "Esforço",
  className,
}: PromptInputEffortProps) => {
  const { setEffort } = usePromptInputExtras("PromptInputEffort");
  if (steps.length === 0) {
    throw new RangeError(`invalid steps: received [], expected at least one step`);
  }
  const [inner, setInner] = useState(defaultValue ?? steps[Math.floor((steps.length - 1) / 2)]);
  const current = value ?? inner;
  const index = stepIndex(steps, current, value === undefined ? "defaultValue" : "value");
  const isMax = steps.length > 1 && index === steps.length - 1;

  useEffect(() => {
    setEffort({ max: isMax, sparks });
    return () => setEffort(null);
  }, [setEffort, isMax, sparks]);

  const change = (next: number) => {
    const step = steps[next];
    if (step === undefined || step === current) {
      return;
    }
    setInner(step);
    onValueChange?.(step);
  };

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <InputGroupButton
          data-slot="prompt-input-effort"
          type="button"
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", className)}
        >
          <span className="text-muted-foreground">{label}</span>
          <span>{current}</span>
          <ChevronDownIcon aria-hidden="true" className="size-3.5" />
        </InputGroupButton>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 w-56 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-hidden"
        >
          <SliderPrimitive.Root
            className="relative flex h-5 w-full touch-none select-none items-center"
            min={0}
            max={steps.length - 1}
            step={1}
            value={[index]}
            onValueChange={([next]) => change(next)}
          >
            <SliderPrimitive.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-muted">
              <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              aria-label={label}
              aria-valuetext={current}
              className="block size-4 rounded-full border border-primary bg-background shadow-sm outline-hidden focus-visible:ring-4 focus-visible:ring-ring/50"
            />
          </SliderPrimitive.Root>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
              <span key={step} className={cn(step === current && "font-medium text-foreground")}>
                {step}
              </span>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

PromptInputEffort.displayName = "PromptInputEffort";
