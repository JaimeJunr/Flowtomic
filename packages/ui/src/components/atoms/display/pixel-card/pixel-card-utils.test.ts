import { describe, expect, it } from "vitest";
import {
  allPixelsGone,
  buildPixels,
  mulberry32,
  type Pixel,
  settlePixel,
  stepPixel,
  throttledSpeed,
} from "./pixel-card-utils";

// Gerador fixo: os valores de cada chamada são previsíveis.
class FakeRandom {
  private index = 0;
  constructor(private readonly values: number[]) {}
  next = (): number => {
    const value = this.values[this.index % this.values.length] ?? 0;
    this.index += 1;
    return value;
  };
}

function basePixel(overrides: Partial<Pixel> = {}): Pixel {
  return {
    x: 0,
    y: 0,
    color: 0,
    maxSize: 2,
    delay: 10,
    speed: 0.5,
    size: 0,
    counter: 0,
    shimmering: false,
    reverse: false,
    ...overrides,
  };
}

describe("buildPixels", () => {
  it("cria ceil(w/gap) * ceil(h/gap) pixels", () => {
    const pixels = buildPixels(23, 12, 5, 3, new FakeRandom([0.5]).next, 30);
    expect(pixels).toHaveLength(Math.ceil(23 / 5) * Math.ceil(12 / 5));
  });

  it("o pixel no centro tem delay 0 e os de fora têm delay maior", () => {
    const pixels = buildPixels(10, 10, 5, 3, new FakeRandom([0.5]).next, 30);
    const center = pixels.find((p) => p.x === 5 && p.y === 5);
    const corner = pixels.find((p) => p.x === 0 && p.y === 0);
    expect(center?.delay).toBe(0);
    expect(corner?.delay).toBeCloseTo(Math.hypot(5, 5));
  });

  it("sorteia cor, tamanho máximo entre 0,5 e 2 e velocidade própria", () => {
    const low = buildPixels(5, 5, 5, 3, new FakeRandom([0]).next, 100)[0];
    const high = buildPixels(5, 5, 5, 3, new FakeRandom([0.999]).next, 100)[0];
    expect(low?.color).toBe(0);
    expect(high?.color).toBe(2);
    expect(low?.maxSize).toBeCloseTo(0.5);
    expect(high?.maxSize).toBeCloseTo(2, 1);
    expect(low?.speed).toBeCloseTo(0.1 * 0.1);
    expect(high?.speed).toBeCloseTo(0.9 * 0.1, 2);
    expect(low?.size).toBe(0);
  });

  it("gap <= 0 lança erro com o valor recebido", () => {
    expect(() => buildPixels(10, 10, 0, 3, Math.random, 30)).toThrow(
      "buildPixels: received gap 0, expected a number > 0"
    );
    expect(() => buildPixels(10, 10, -2, 3, Math.random, 30)).toThrow(/-2/);
  });
});

describe("throttledSpeed", () => {
  it("escala 0..100 para 0..0,1", () => {
    expect(throttledSpeed(50)).toBeCloseTo(0.05);
    expect(throttledSpeed(100)).toBeCloseTo(0.1);
  });

  it("limita fora da faixa", () => {
    expect(throttledSpeed(-10)).toBe(0);
    expect(throttledSpeed(500)).toBeCloseTo(0.1);
  });
});

describe("stepPixel", () => {
  it("só começa a crescer depois que o contador passa o delay", () => {
    let pixel = basePixel({ delay: 12 });
    pixel = stepPixel(pixel, "appear");
    expect(pixel.size).toBe(0);
    pixel = stepPixel(stepPixel(pixel, "appear"), "appear");
    expect(pixel.counter).toBeGreaterThan(12);
    expect(pixel.size).toBeCloseTo(0.1);
  });

  it("cresce 0,1 por quadro até maxSize e passa a cintilar", () => {
    let pixel = basePixel({ delay: 0, maxSize: 0.7 });
    for (let i = 0; i < 20; i++) {
      pixel = stepPixel(pixel, "appear");
      if (pixel.shimmering) break;
    }
    expect(pixel.shimmering).toBe(true);
    expect(pixel.size).toBeCloseTo(0.7);
  });

  it("cintila entre 0,5 e maxSize", () => {
    let pixel = basePixel({ delay: 0, maxSize: 1.5, speed: 0.4 });
    const seen: number[] = [];
    for (let i = 0; i < 80; i++) {
      pixel = stepPixel(pixel, "appear");
      if (pixel.shimmering) seen.push(pixel.size);
    }
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(0.5 - 1e-9);
    expect(Math.max(...seen)).toBeLessThanOrEqual(1.5 + 1e-9);
    expect(Math.max(...seen) - Math.min(...seen)).toBeGreaterThan(0.5);
  });

  it("disappear zera o contador e encolhe 0,1 por quadro até 0", () => {
    let pixel = basePixel({ size: 0.25, counter: 99, shimmering: true });
    pixel = stepPixel(pixel, "disappear");
    expect(pixel.counter).toBe(0);
    expect(pixel.shimmering).toBe(false);
    expect(pixel.size).toBeCloseTo(0.15);
    pixel = stepPixel(stepPixel(pixel, "disappear"), "disappear");
    expect(pixel.size).toBe(0);
  });

  it("não muta o pixel recebido", () => {
    const pixel = basePixel({ delay: 0 });
    stepPixel(pixel, "appear");
    expect(pixel.size).toBe(0);
  });
});

describe("settlePixel e allPixelsGone", () => {
  it("settlePixel mostra no maxSize ou esconde de uma vez", () => {
    const pixel = basePixel({ maxSize: 1.2 });
    expect(settlePixel(pixel, true).size).toBe(1.2);
    expect(settlePixel(settlePixel(pixel, true), false).size).toBe(0);
  });

  it("allPixelsGone só é verdadeiro quando todos estão em 0", () => {
    expect(allPixelsGone([basePixel(), basePixel()])).toBe(true);
    expect(allPixelsGone([basePixel(), basePixel({ size: 0.1 })])).toBe(false);
  });
});

describe("mulberry32", () => {
  it("é determinístico e devolve valores em [0, 1)", () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
