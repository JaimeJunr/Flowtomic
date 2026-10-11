import { describe, expect, it } from "vitest";
import {
  approach,
  assertHelixProps,
  directionSign,
  type HelixOptions,
  helixSlot,
  slotCountFor,
  slotStyle,
  wrapPosition,
} from "./helix-gallery-utils";

const OPTS: HelixOptions = {
  slotCount: 14,
  cardsPerTurn: 7,
  verticalSpacing: 60,
  radius: 170,
  rotation: 0,
  centerScale: 1.2,
  edgeFade: 0.3,
  edgeBlur: 6,
};

describe("helixSlot", () => {
  it("o cartão em t 0 fica na frente, em escala máxima", () => {
    const slot = helixSlot(0, 0, OPTS);
    expect(slot.x).toBeCloseTo(0);
    expect(slot.z).toBeCloseTo(170);
    expect(slot.y).toBe(0);
    expect(slot.scale).toBeCloseTo(1.2);
    expect(slot.opacity).toBe(1);
    expect(slot.blur).toBe(0);
  });

  it("um passo de cardsPerTurn volta ao mesmo ângulo", () => {
    const a = helixSlot(1, 0, OPTS);
    const b = helixSlot(8, 0, OPTS);
    expect(Math.cos((b.angle * Math.PI) / 180)).toBeCloseTo(Math.cos((a.angle * Math.PI) / 180));
    expect(b.x).toBeCloseTo(a.x);
    expect(b.z).toBeCloseTo(a.z);
    // t 8 dá a volta no laço e vira -6.
    expect(b.y).toBeCloseTo(-6 * 60);
  });

  it("progress crescente faz o cartão subir (y menor)", () => {
    expect(helixSlot(0, 1, OPTS).y).toBeLessThan(helixSlot(0, 0, OPTS).y);
  });

  it("nas bordas some e desfoca no máximo", () => {
    const edge = helixSlot(0, 7, OPTS);
    expect(edge.opacity).toBe(0);
    expect(edge.blur).toBeCloseTo(6);
  });

  it("sem edgeFade nunca esmaece", () => {
    const slot = helixSlot(0, 7, { ...OPTS, edgeFade: 0 });
    expect(slot.opacity).toBe(1);
    expect(slot.blur).toBe(0);
  });

  it("rotation soma ao ângulo", () => {
    expect(helixSlot(0, 0, { ...OPTS, rotation: 90 }).angle).toBe(90);
  });

  it("cartões de trás não ganham escala", () => {
    const back = helixSlot(0, 0, { ...OPTS, rotation: 180 });
    expect(back.scale).toBeCloseTo(1);
  });
});

describe("wrapPosition", () => {
  it("reduz ao intervalo [-n/2, n/2)", () => {
    expect(wrapPosition(8, 14)).toBe(-6);
    expect(wrapPosition(-7, 14)).toBe(-7);
    expect(wrapPosition(7, 14)).toBe(-7);
    expect(wrapPosition(-15, 14)).toBe(-1);
  });
});

describe("helpers", () => {
  it("slotCountFor usa o maior entre itens e duas voltas", () => {
    expect(slotCountFor(3, 7)).toBe(14);
    expect(slotCountFor(20, 7)).toBe(20);
  });

  it("directionSign", () => {
    expect(directionSign("up")).toBe(1);
    expect(directionSign("down")).toBe(-1);
  });

  it("approach converge sem ultrapassar", () => {
    const v = approach(1, 0, 0.13, 0.13);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(0.5);
    expect(approach(0.5, 0.5, 1, 0.1)).toBe(0.5);
  });

  it("slotStyle monta transform, opacidade e filtro", () => {
    const style = slotStyle(helixSlot(0, 0, OPTS), 4);
    expect(style.transform).toContain("translate3d(");
    expect(style.transform).toContain("rotateY(");
    expect(style.transform).toContain("rotateZ(4deg)");
    expect(style.transform).toContain("scale(");
    expect(style.filter).toBe("none");
    expect(slotStyle(helixSlot(0, 6, OPTS), 0).filter).toMatch(/^blur\(/);
  });
});

describe("assertHelixProps", () => {
  it("rejeita items vazio", () => {
    expect(() => assertHelixProps({ itemCount: 0, cardsPerTurn: 7, edgeFade: 0.3 })).toThrow(
      /received 0.*expected at least 1/
    );
  });
  it("rejeita cardsPerTurn menor que 3", () => {
    expect(() => assertHelixProps({ itemCount: 4, cardsPerTurn: 2, edgeFade: 0.3 })).toThrow(
      /received cardsPerTurn 2.*>= 3/
    );
  });
  it("rejeita edgeFade fora de 0..0.5", () => {
    expect(() => assertHelixProps({ itemCount: 4, cardsPerTurn: 7, edgeFade: 0.7 })).toThrow(
      /received edgeFade 0.7.*0 and 0.5/
    );
  });
  it("aceita valores válidos", () => {
    expect(() => assertHelixProps({ itemCount: 1, cardsPerTurn: 3, edgeFade: 0.5 })).not.toThrow();
  });
});

describe("slotStyle", () => {
  const base = { x: 0, y: 0, z: 0, scale: 1, opacity: 1, blur: 0 };

  it("vira o cartão de trás da hélice para o texto não sair espelhado", () => {
    expect(slotStyle({ ...base, angle: 180 }, 0).transform).toContain("rotateY(360deg)");
    expect(slotStyle({ ...base, angle: 120 }, 0).transform).toContain("rotateY(300deg)");
  });

  it("mantém o ângulo do cartão da frente", () => {
    expect(slotStyle({ ...base, angle: 30 }, 0).transform).toContain("rotateY(30deg)");
    expect(slotStyle({ ...base, angle: -60 }, 0).transform).toContain("rotateY(-60deg)");
  });
});
