import { describe, expect, it } from "vitest";
import { pointAngle } from "./magnet-lines-utils";

describe("pointAngle", () => {
  it("ponteiro acima do centro gira 0 grau", () => {
    expect(pointAngle(100, 100, 100, 40)).toBeCloseTo(0);
  });

  it("ponteiro à direita gira 90 graus", () => {
    expect(pointAngle(100, 100, 160, 100)).toBeCloseTo(90);
  });

  it("ponteiro abaixo gira 180 graus", () => {
    expect(pointAngle(100, 100, 100, 160)).toBeCloseTo(180);
  });

  it("ponteiro à esquerda gira 270 graus (equivalente a -90)", () => {
    expect(pointAngle(100, 100, 40, 100)).toBeCloseTo(270);
  });

  it("diagonal inferior direita fica entre 90 e 180", () => {
    expect(pointAngle(0, 0, 10, 10)).toBeCloseTo(135);
  });
});
