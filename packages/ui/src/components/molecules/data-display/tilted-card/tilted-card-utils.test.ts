import { describe, expect, it } from "vitest";
import { CAPTION_MAX_TILT, captionTilt, tiltAngles } from "./tilted-card-utils";

const rect = { left: 100, top: 100, width: 200, height: 100 };

describe("tiltAngles", () => {
  it("devolve zero no centro", () => {
    expect(tiltAngles(rect, 200, 150, 12)).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it("canto superior direito inclina com rotateX e rotateY positivos", () => {
    const { rotateX, rotateY } = tiltAngles(rect, 300, 100, 12);
    expect(rotateX).toBeCloseTo(12);
    expect(rotateY).toBeCloseTo(12);
  });

  it("respeita a amplitude", () => {
    const { rotateY } = tiltAngles(rect, 300, 150, 20);
    expect(rotateY).toBeCloseTo(20);
  });

  it("limita ponteiro fora do retangulo a amplitude", () => {
    const { rotateY } = tiltAngles(rect, 900, 150, 10);
    expect(rotateY).toBeCloseTo(10);
  });

  it("lança erro com o valor recebido para retangulo de tamanho zero", () => {
    expect(() => tiltAngles({ left: 0, top: 0, width: 0, height: 10 }, 1, 1, 12)).toThrow(
      /received width=0, height=10/
    );
  });
});

describe("captionTilt", () => {
  it("é zero sem velocidade", () => {
    expect(captionTilt(0)).toBe(0);
  });

  it("acompanha o sentido do movimento", () => {
    expect(captionTilt(300)).toBeGreaterThan(0);
    expect(captionTilt(-300)).toBeLessThan(0);
  });

  it("limita a mais ou menos 12 graus", () => {
    expect(captionTilt(1e6)).toBe(CAPTION_MAX_TILT);
    expect(captionTilt(-1e6)).toBe(-CAPTION_MAX_TILT);
    expect(CAPTION_MAX_TILT).toBe(12);
  });
});
