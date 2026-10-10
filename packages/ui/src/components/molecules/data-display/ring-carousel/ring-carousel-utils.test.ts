import { describe, expect, it } from "vitest";
import {
  approach,
  cardTransform,
  decayVelocity,
  depthShade,
  dragToDegrees,
  frontIndex,
  nearestSnap,
  releaseVelocity,
  ringRadius,
  shortestRotationTo,
  stepAngle,
} from "./ring-carousel-utils";

describe("ringRadius", () => {
  it("cresce com o número de cartões", () => {
    expect(ringRadius(8, 220, 24)).toBeGreaterThan(ringRadius(4, 220, 24));
  });

  it("segue (largura + gap) / (2 tan(pi/n))", () => {
    expect(ringRadius(4, 200, 0)).toBeCloseTo(100, 5);
  });

  it("lança erro com o valor recebido quando n < 3", () => {
    expect(() => ringRadius(2, 220, 24)).toThrow(/received count 2/);
  });
});

describe("stepAngle", () => {
  it("divide a volta pelo número de cartões", () => {
    expect(stepAngle(6)).toBe(60);
  });
});

describe("nearestSnap", () => {
  it("arredonda para o múltiplo de passo mais próximo", () => {
    expect(nearestSnap(70, 60)).toBe(60);
    expect(nearestSnap(-95, 60)).toBe(-120);
  });
});

describe("shortestRotationTo", () => {
  it("leva o cartão à frente pelo lado curto, cruzando 0/360", () => {
    // cartão 5 de 6 está à frente em rotation = -300 (ou +60); de 10 graus o caminho curto é 60.
    expect(shortestRotationTo(10, 5, 60)).toBe(60);
    expect(shortestRotationTo(-10, 1, 60)).toBe(-60);
  });

  it("não se mexe quando o cartão já está à frente", () => {
    expect(shortestRotationTo(-120, 2, 60)).toBe(-120);
  });
});

describe("frontIndex", () => {
  it("devolve o cartão mais próximo de frente", () => {
    expect(frontIndex(0, 6)).toBe(0);
    expect(frontIndex(-60, 6)).toBe(1);
    expect(frontIndex(-350, 6)).toBe(0);
    expect(frontIndex(60, 6)).toBe(5);
  });
});

describe("depthShade", () => {
  it("é 0 na frente e depthFade atrás", () => {
    expect(depthShade(0, 0, 6, 0.55)).toBeCloseTo(0, 5);
    expect(depthShade(0, 3, 6, 0.55)).toBeCloseTo(0.55, 5);
  });
});

describe("dragToDegrees", () => {
  it("converte pixels em graus pela circunferência", () => {
    expect(dragToDegrees(Math.PI * 100, 100)).toBeCloseTo(180, 5);
  });
});

describe("releaseVelocity / decayVelocity", () => {
  it("usa só as amostras dos últimos 100 ms", () => {
    const samples = [
      { t: 0, rotation: 0 },
      { t: 950, rotation: 10 },
      { t: 1000, rotation: 15 },
    ];
    expect(releaseVelocity(samples, 1000)).toBeCloseTo(100, 5);
  });

  it("devolve 0 com poucas amostras", () => {
    expect(releaseVelocity([{ t: 0, rotation: 0 }], 10)).toBe(0);
  });

  it("aplica atrito exponencial", () => {
    expect(decayVelocity(100, 1 / 60)).toBeCloseTo(95, 5);
  });
});

describe("cardTransform", () => {
  it("monta a posição no anel", () => {
    expect(cardTransform(1, 4, 100)).toBe("translate(-50%, -50%) rotateY(90deg) translateZ(100px)");
  });
});

describe("approach", () => {
  it("anda em direção ao alvo e para nele", () => {
    expect(approach(1, 0, 0.1, 0.4)).toBeCloseTo(0.75, 5);
    expect(approach(0.1, 0, 0.1, 0.4)).toBe(0);
  });
});
