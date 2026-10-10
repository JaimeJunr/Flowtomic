import { describe, expect, it } from "vitest";
import { expandProgress, type FrameOptions, frameAt } from "./scroll-expand-media-utils";

const OPTS: FrameOptions = {
  startWidth: 40,
  startHeight: 60,
  startRadius: 24,
  endRadius: 0,
  mediaZoom: 1.4,
};

describe("expandProgress", () => {
  it("começa em 0 e chega a 1 no fim da expansão", () => {
    expect(expandProgress(0, 1.2, 0.3)).toBe(0);
    // fim da expansão = raw de 1.2 / 1.5 = 0.8
    expect(expandProgress(0.8, 1.2, 0.3)).toBeCloseTo(1, 10);
  });

  it("segue 1 durante a retenção e limita valores fora da faixa", () => {
    expect(expandProgress(0.9, 1.2, 0.3)).toBe(1);
    expect(expandProgress(1, 1.2, 0.3)).toBe(1);
    expect(expandProgress(-0.5, 1.2, 0.3)).toBe(0);
  });

  it("lança erro com scrollDistance menor ou igual a zero", () => {
    expect(() => expandProgress(0.5, 0, 0.3)).toThrow(/received 0/);
    expect(() => expandProgress(0.5, -2, 0.3)).toThrow(/scrollDistance/);
  });
});

describe("frameAt", () => {
  it("em p=0 devolve os valores de repouso", () => {
    expect(frameAt(0, OPTS)).toEqual({ widthPct: 40, heightPct: 60, radius: 24, zoom: 1.4 });
  });

  it("em p=1 devolve tela cheia, raio final e zoom 1", () => {
    expect(frameAt(1, OPTS)).toEqual({ widthPct: 100, heightPct: 100, radius: 0, zoom: 1 });
  });

  it("em p=0,5 fica entre os extremos, adiantado pelo ease-out", () => {
    const f = frameAt(0.5, OPTS);
    expect(f.widthPct).toBeGreaterThan(70);
    expect(f.widthPct).toBeLessThan(100);
    expect(f.radius).toBeGreaterThan(0);
    expect(f.radius).toBeLessThan(24);
    expect(f.zoom).toBeGreaterThan(1);
    expect(f.zoom).toBeLessThan(1.4);
  });
});
