import { describe, expect, it } from "vitest";
import { lerpState, pointerState, REST_STATE } from "./profile-card-utils";

const RECT = { left: 100, top: 200, width: 200, height: 300 };

describe("pointerState", () => {
  it("centro devolve 50/50 sem inclinação", () => {
    const state = pointerState(RECT, 200, 350, 14);
    expect(state.px).toBe(50);
    expect(state.py).toBe(50);
    expect(Math.abs(state.rx)).toBe(0);
    expect(Math.abs(state.ry)).toBe(0);
  });

  it("canto superior direito inclina com rx e ry positivos", () => {
    const state = pointerState(RECT, 300, 200, 14);
    expect(state.ry).toBeGreaterThan(0);
    expect(state.rx).toBeGreaterThan(0);
  });

  it("respeita o maxTilt", () => {
    const state = pointerState(RECT, 300, 200, 20);
    expect(state.ry).toBeCloseTo(20);
    expect(state.rx).toBeCloseTo(20);
  });

  it("limita px e py a 0..100 fora do cartão", () => {
    const state = pointerState(RECT, 5000, -5000, 14);
    expect(state.px).toBe(100);
    expect(state.py).toBe(0);
  });

  it("rect zerado lança erro com o valor recebido", () => {
    expect(() => pointerState({ left: 0, top: 0, width: 0, height: 10 }, 1, 1, 14)).toThrow(
      /received 0x10/
    );
  });
});

describe("lerpState", () => {
  it("t=0 devolve origem e t=1 devolve destino", () => {
    const target = { px: 100, py: 0, rx: 14, ry: -14 };
    expect(lerpState(target, REST_STATE, 0)).toEqual(target);
    expect(lerpState(target, REST_STATE, 1)).toEqual(REST_STATE);
  });

  it("t=0,5 fica no meio", () => {
    const mid = lerpState({ px: 100, py: 0, rx: 10, ry: -10 }, REST_STATE, 0.5);
    expect(mid).toEqual({ px: 75, py: 25, rx: 5, ry: -5 });
  });
});
