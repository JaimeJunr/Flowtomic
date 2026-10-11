import { describe, expect, it } from "vitest";
import {
  coveredCount,
  layerStyle,
  parseStackTop,
  pinOffset,
  type StackCardMeasure,
  stickyTop,
} from "./stacking-cards-utils";

const opts = { itemScale: 0.05, minScale: 0.8, dimAmount: 0.2, blurAmount: 2 };

function card(top: number, pinTop = 100, travel = 400): StackCardMeasure {
  return { top, pinTop, travel };
}

describe("layerStyle", () => {
  it("não altera um cartão descoberto", () => {
    expect(layerStyle(0, opts)).toEqual({ scale: 1, dim: 0, blur: 0 });
  });

  it("escala, escurece e desfoca proporcional à cobertura", () => {
    const style = layerStyle(2, opts);
    expect(style.scale).toBeCloseTo(0.9);
    expect(style.dim).toBeCloseTo(0.4);
    expect(style.blur).toBe(4);
  });

  it("respeita minScale", () => {
    expect(layerStyle(10, opts).scale).toBe(0.8);
  });

  it("limita o escurecimento a 0.8", () => {
    expect(layerStyle(10, { ...opts, dimAmount: 0.5 }).dim).toBe(0.8);
  });
});

describe("coveredCount", () => {
  it("é zero quando os de cima ainda estão longe", () => {
    expect(coveredCount(0, [card(100), card(900), card(1300)])).toBe(0);
  });

  it("é contínuo enquanto o próximo sobe", () => {
    expect(coveredCount(0, [card(100), card(300)])).toBeCloseTo(0.5);
  });

  it("soma um por cartão já pousado", () => {
    expect(coveredCount(0, [card(100), card(100), card(100)])).toBe(2);
    expect(coveredCount(1, [card(100), card(100), card(100)])).toBe(1);
  });

  it("o último cartão nunca é coberto", () => {
    expect(coveredCount(2, [card(100), card(100), card(100)])).toBe(0);
  });

  it("limita cada contribuição entre 0 e 1", () => {
    expect(coveredCount(0, [card(100), card(-50)])).toBe(1);
  });

  it("trata percurso nulo como tudo ou nada", () => {
    expect(coveredCount(0, [card(100), card(90, 100, 0)])).toBe(1);
    expect(coveredCount(0, [card(100), card(110, 100, 0)])).toBe(0);
  });
});

describe("posição de prender", () => {
  it("lê px e porcentagem", () => {
    expect(parseStackTop(80)).toEqual({ value: 80, unit: "px" });
    expect(parseStackTop("15%")).toEqual({ value: 15, unit: "%" });
    expect(parseStackTop("40px")).toEqual({ value: 40, unit: "px" });
  });

  it("recusa valor inválido dizendo o que recebeu e o esperado", () => {
    expect(() => parseStackTop("15em" as never)).toThrow(/"15em".*"15%"/);
  });

  it("monta o top sticky em CSS", () => {
    expect(stickyTop(80, 2, 24)).toBe("128px");
    expect(stickyTop("15%", 0, 24)).toBe("15%");
    expect(stickyTop("15%", 2, 24)).toBe("calc(15% + 48px)");
  });

  it("converte para pixels", () => {
    expect(pinOffset("10%", 1, 24, 800)).toBe(104);
    expect(pinOffset(60, 2, 10, 800)).toBe(80);
  });
});
