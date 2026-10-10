import { describe, expect, it, vi } from "vitest";
import { edgeFade, moveIndex, scrollItemIntoView } from "./animated-list-utils";

describe("edgeFade", () => {
  it("no topo, top=0 e bottom positivo", () => {
    const fade = edgeFade(0, 1000, 384);
    expect(fade.top).toBe(0);
    expect(fade.bottom).toBe(1);
  });

  it("no fim, bottom=0 e top positivo", () => {
    const fade = edgeFade(616, 1000, 384);
    expect(fade.bottom).toBe(0);
    expect(fade.top).toBe(1);
  });

  it("no meio, os dois são positivos e proporcionais", () => {
    const fade = edgeFade(25, 434, 384);
    expect(fade.top).toBeCloseTo(0.5);
    expect(fade.bottom).toBeCloseTo(0.5);
  });

  it("limita a 1 e nunca fica negativo", () => {
    expect(edgeFade(5000, 100, 384)).toEqual({ top: 1, bottom: 0 });
  });
});

describe("moveIndex", () => {
  it("ArrowDown a partir de -1 vai ao 0 e limita no último", () => {
    expect(moveIndex(-1, "ArrowDown", 3)).toBe(0);
    expect(moveIndex(2, "ArrowDown", 3)).toBe(2);
  });

  it("ArrowUp limita no primeiro", () => {
    expect(moveIndex(0, "ArrowUp", 3)).toBe(0);
    expect(moveIndex(-1, "ArrowUp", 3)).toBe(0);
    expect(moveIndex(2, "ArrowUp", 3)).toBe(1);
  });

  it("Home e End vão aos extremos", () => {
    expect(moveIndex(1, "Home", 4)).toBe(0);
    expect(moveIndex(1, "End", 4)).toBe(3);
  });

  it("devolve null para tecla desconhecida ou lista vazia", () => {
    expect(moveIndex(1, "a", 4)).toBeNull();
    expect(moveIndex(-1, "ArrowDown", 0)).toBeNull();
  });
});

describe("scrollItemIntoView", () => {
  it("usa block nearest com smooth por padrão", () => {
    const el = { scrollIntoView: vi.fn() } as unknown as HTMLElement;
    scrollItemIntoView(el, false);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "smooth" });
  });

  it("sem smooth em movimento reduzido", () => {
    const el = { scrollIntoView: vi.fn() } as unknown as HTMLElement;
    scrollItemIntoView(el, true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "auto" });
  });

  it("ignora elemento ausente ou sem scrollIntoView (jsdom)", () => {
    expect(() => scrollItemIntoView(null, false)).not.toThrow();
    expect(() => scrollItemIntoView({} as HTMLElement, false)).not.toThrow();
  });
});
