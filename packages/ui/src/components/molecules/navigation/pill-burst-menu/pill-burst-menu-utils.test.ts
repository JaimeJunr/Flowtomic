import { describe, expect, it } from "vitest";
import { assertItemCount, pillDelay, pillRotation } from "./pill-burst-menu-utils";

describe("pillRotation", () => {
  it("alterna a tabela padrão", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => pillRotation(i))).toEqual([
      -8, 8, 6, -6, 4, -4, 8, -8,
    ]);
  });
  it("usa o valor do item quando existe, inclusive zero", () => {
    expect(pillRotation(0, 3)).toBe(3);
    expect(pillRotation(1, 0)).toBe(0);
  });
});

describe("pillDelay", () => {
  it("é crescente e determinístico", () => {
    const a = [0, 1, 2, 3].map((i) => pillDelay(i, 0.12));
    const b = [0, 1, 2, 3].map((i) => pillDelay(i, 0.12));
    expect(a).toEqual(b);
    expect(a[1]).toBeGreaterThan(a[0]);
    expect(a[3]).toBeGreaterThan(a[2]);
  });
  it("soma o jitter do índice", () => {
    expect(pillDelay(0, 0.12)).toBe(0);
    expect(pillDelay(1, 0.12)).toBeCloseTo(0.12 + 0.02);
  });
});

describe("assertItemCount", () => {
  it("aceita de 1 a 8", () => {
    expect(() => assertItemCount(1)).not.toThrow();
    expect(() => assertItemCount(8)).not.toThrow();
  });
  it("informa o valor recebido e o esperado", () => {
    expect(() => assertItemCount(0)).toThrow(/received 0 items, expected between 1 and 8/);
    expect(() => assertItemCount(9)).toThrow(/received 9 items/);
  });
});
