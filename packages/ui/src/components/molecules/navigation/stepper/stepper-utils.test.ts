import { describe, expect, it } from "vitest";
import {
  clampStep,
  indicatorStatus,
  nextStep,
  prevStep,
  validateStepperProps,
} from "./stepper-utils";

describe("indicatorStatus", () => {
  it("marca feito, atual e futuro (indice 1-based)", () => {
    expect(indicatorStatus(1, 2)).toBe("complete");
    expect(indicatorStatus(2, 2)).toBe("active");
    expect(indicatorStatus(3, 2)).toBe("upcoming");
  });

  it("com o assistente concluido (n + 1) todos ficam feitos", () => {
    expect([1, 2, 3].map((i) => indicatorStatus(i, 4))).toEqual([
      "complete",
      "complete",
      "complete",
    ]);
  });
});

describe("nextStep e prevStep", () => {
  it("avancam e voltam dentro dos limites", () => {
    expect(nextStep(1, 3)).toBe(2);
    expect(prevStep(3)).toBe(2);
  });

  it("nextStep para em n + 1 e prevStep para em 1", () => {
    expect(nextStep(3, 3)).toBe(4);
    expect(nextStep(4, 3)).toBe(4);
    expect(prevStep(1)).toBe(1);
  });
});

describe("clampStep", () => {
  it("limita ao intervalo 1..n e arredonda", () => {
    expect(clampStep(0, 3)).toBe(1);
    expect(clampStep(9, 3)).toBe(3);
    expect(clampStep(2.6, 3)).toBe(3);
    expect(clampStep(Number.NaN, 3)).toBe(1);
  });
});

describe("validateStepperProps", () => {
  it("aceita steps e labels do mesmo tamanho", () => {
    expect(() => validateStepperProps(3, 3)).not.toThrow();
  });

  it("lanca com os dois tamanhos quando diferem", () => {
    expect(() => validateStepperProps(3, 2)).toThrow(/steps\.length=3.*labels\.length=2/);
  });

  it("lanca quando vazio", () => {
    expect(() => validateStepperProps(0, 0)).toThrow(/steps\.length=0/);
  });
});
