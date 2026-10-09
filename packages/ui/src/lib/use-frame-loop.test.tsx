import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { frameIntervalMs, useFrameLoop } from "./use-frame-loop";

function Probe({ onFrame, active, fps }: { onFrame: () => void; active: boolean; fps?: number }) {
  useFrameLoop(onFrame, active, fps);
  return null;
}

let hidden = false;
beforeEach(() => {
  hidden = false;
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("frameIntervalMs", () => {
  it("converte fps em intervalo", () => {
    expect(frameIntervalMs(60)).toBeCloseTo(16.667, 2);
    expect(frameIntervalMs(10)).toBe(100);
  });
  it("rejeita fps inválido com valor recebido", () => {
    expect(() => frameIntervalMs(0)).toThrow(/received 0.*expected a number > 0/);
  });
});

describe("useFrameLoop", () => {
  it("chama o callback a cada quadro enquanto ativo", () => {
    const onFrame = vi.fn();
    render(<Probe onFrame={onFrame} active />);
    act(() => vi.advanceTimersByTime(100));
    expect(onFrame.mock.calls.length).toBeGreaterThan(3);
  });

  it("limita os quadros por fps", () => {
    const onFrame = vi.fn();
    render(<Probe onFrame={onFrame} active fps={10} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(onFrame.mock.calls.length).toBeLessThanOrEqual(11);
    expect(onFrame.mock.calls.length).toBeGreaterThanOrEqual(8);
  });

  it("inativo não agenda quadro", () => {
    const raf = vi.spyOn(globalThis, "requestAnimationFrame");
    render(<Probe onFrame={vi.fn()} active={false} />);
    expect(raf).not.toHaveBeenCalled();
  });

  it("para com a aba escondida e retoma ao voltar", () => {
    const onFrame = vi.fn();
    render(<Probe onFrame={onFrame} active />);
    act(() => vi.advanceTimersByTime(50));
    hidden = true;
    act(() => vi.advanceTimersByTime(50));
    const parado = onFrame.mock.calls.length;
    act(() => vi.advanceTimersByTime(200));
    expect(onFrame.mock.calls.length).toBe(parado);
    hidden = false;
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(100);
    });
    expect(onFrame.mock.calls.length).toBeGreaterThan(parado);
  });
});
