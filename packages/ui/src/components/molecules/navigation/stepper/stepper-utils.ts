export type IndicatorStatus = "complete" | "active" | "upcoming";

/** `index` e `step` sao 1-based; `step === n + 1` significa assistente concluido. */
export function indicatorStatus(index: number, step: number): IndicatorStatus {
  if (index < step) return "complete";
  return index === step ? "active" : "upcoming";
}

export function nextStep(step: number, total: number): number {
  return Math.min(step + 1, total + 1);
}

export function prevStep(step: number): number {
  return Math.max(step - 1, 1);
}

export function clampStep(step: number, total: number): number {
  if (!Number.isFinite(step)) return 1;
  return Math.min(Math.max(Math.round(step), 1), total);
}

export function validateStepperProps(stepsLength: number, labelsLength: number): void {
  if (stepsLength === 0 || stepsLength !== labelsLength) {
    throw new Error(
      `Stepper: received steps.length=${stepsLength} and labels.length=${labelsLength}, expected equal sizes greater than 0`
    );
  }
}
