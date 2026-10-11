import { describe, expect, it } from "vitest";
import { buildDockRanges, dockKey } from "./menu-dock-utils";

describe("buildDockRanges", () => {
  it("sem argumentos mantém as faixas de antes (40, 80, 150)", () => {
    expect(buildDockRanges({})).toEqual({
      distance: [-150, 0, 150],
      size: [40, 80, 40],
      icon: [20, 40, 20],
    });
  });

  it("as props novas alteram as faixas e o ícone fica na metade do item", () => {
    expect(buildDockRanges({ itemSize: 48, magnification: 96, magnifyDistance: 200 })).toEqual({
      distance: [-200, 0, 200],
      size: [48, 96, 48],
      icon: [24, 48, 24],
    });
  });

  it("rejeita distância não positiva informando o valor recebido", () => {
    expect(() => buildDockRanges({ magnifyDistance: 0 })).toThrow(
      /received 0, expected a positive number of pixels/
    );
  });

  it("rejeita tamanho base não positivo", () => {
    expect(() => buildDockRanges({ itemSize: -4 })).toThrow(
      /received -4, expected a positive number of pixels/
    );
  });

  it("rejeita magnificação menor que o tamanho base", () => {
    expect(() => buildDockRanges({ itemSize: 60, magnification: 40 })).toThrow(
      /received magnification 40, expected a number >= itemSize 60/
    );
  });
});

describe("dockKey", () => {
  it("usa o id quando existe e o rótulo quando não", () => {
    expect(dockKey({ id: "a", label: "Início" })).toBe("a");
    expect(dockKey({ label: "Início" })).toBe("Início");
  });
});
