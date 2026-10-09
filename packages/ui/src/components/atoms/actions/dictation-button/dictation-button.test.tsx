import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DictationButton, type DictationStopReason } from "./dictation-button";
import {
  createLevelSource,
  envelope,
  formatClock,
  type LevelSource,
  pushLevel,
  releaseDecision,
  rmsOf,
  scatterOffset,
  simulatedLevel,
} from "./dictation-button-utils";

const ROOT = '[data-slot="dictation-button"]';

class FakeLevelSource implements LevelSource {
  stops = 0;
  value = 0.5;
  read = () => this.value;
  stop = () => {
    this.stops += 1;
  };
}

class Recorder {
  starts: string[] = [];
  stops: { reason: DictationStopReason; durationMs: number }[] = [];
  onStart = (detail: { source: string }) => {
    this.starts.push(detail.source);
  };
  onStop = (detail: { reason: DictationStopReason; durationMs: number }) => {
    this.stops.push(detail);
  };
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(
  props: Partial<React.ComponentProps<typeof DictationButton>> = {},
  source = new FakeLevelSource()
) {
  const rec = new Recorder();
  const ui = (p: Partial<React.ComponentProps<typeof DictationButton>>) => (
    <MotionConfig reducedMotion="never">
      <DictationButton
        levelSource={() => source}
        onStart={rec.onStart}
        onStop={rec.onStop}
        {...p}
      />
    </MotionConfig>
  );
  const view = render(ui(props));
  const root = view.container.querySelector(ROOT) as HTMLButtonElement;
  return { ...view, root, rec, source, rerenderWith: (p: typeof props) => view.rerender(ui(p)) };
}

const press = (el: Element, x = 100) =>
  fireEvent.pointerDown(el, { clientX: x, pointerId: 1, button: 0 });
const move = (el: Element, x: number) => fireEvent.pointerMove(el, { clientX: x, pointerId: 1 });
const lift = (el: Element) => fireEvent.pointerUp(el, { pointerId: 1 });

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("envelope sobe mais rápido do que desce", () => {
    const up = envelope(0, 1, 40, 40, 240);
    const down = 1 - envelope(1, 0, 40, 40, 240);
    expect(up).toBeGreaterThan(0.6);
    expect(down).toBeLessThan(0.2);
    expect(envelope(0.3, 0.3, 40, 40, 240)).toBeCloseTo(0.3);
  });

  it("envelope rejeita constantes inválidas com o valor recebido", () => {
    expect(() => envelope(0, 1, 16, 0, 240)).toThrow("received attackMs 0");
  });

  it("formatClock formata m:ss", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(63_000)).toBe("1:03");
    expect(formatClock(-5)).toBe("0:00");
    expect(formatClock(9_999)).toBe("0:09");
  });

  it("releaseDecision cobre os três modos", () => {
    expect(releaseDecision("hold", 50, 300, false)).toBe("stop");
    expect(releaseDecision("toggle", 5000, 300, false)).toBe("latch");
    expect(releaseDecision("auto", 100, 300, false)).toBe("latch");
    expect(releaseDecision("auto", 400, 300, false)).toBe("stop");
    expect(releaseDecision("auto", 400, 300, true)).toBe("keep");
  });

  it("pushLevel mantém só as últimas N barras", () => {
    expect(pushLevel([0.1, 0.2, 0.3], 0.4, 3)).toEqual([0.2, 0.3, 0.4]);
    expect(pushLevel([], 0.4, 3)).toEqual([0.4]);
  });

  it("rmsOf, simulatedLevel e scatterOffset são determinísticos e limitados", () => {
    expect(rmsOf(new Float32Array([0.5, -0.5]))).toBeCloseTo(0.5);
    expect(rmsOf(new Float32Array([]))).toBe(0);
    for (const t of [0, 100, 1234, 99_999]) {
      const v = simulatedLevel(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(simulatedLevel(t)).toBe(v);
    }
    expect(scatterOffset(3)).toBe(scatterOffset(3));
    expect(scatterOffset(1)).not.toBe(scatterOffset(2));
  });

  it("createLevelSource simulado lê níveis e para sem erro", async () => {
    const source = await createLevelSource("simulated");
    expect(source.read()).toBeGreaterThanOrEqual(0);
    expect(() => source.stop()).not.toThrow();
  });

  it("createLevelSource mic rejeita sem mediaDevices, dizendo o que faltou", async () => {
    await expect(createLevelSource("mic")).rejects.toThrow("navigator.mediaDevices");
  });
});

describe("DictationButton", () => {
  it("toque começa, aria-pressed fica true, e outro toque para com tap", async () => {
    const { root, rec } = setup();
    press(root);
    advance(100);
    lift(root);
    await act(async () => {});
    expect(rec.starts).toEqual(["simulated"]);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(root).toHaveAttribute("data-state", "listening");
    advance(1000);
    press(root);
    lift(root);
    expect(rec.stops).toHaveLength(1);
    expect(rec.stops[0].reason).toBe("tap");
    expect(rec.stops[0].durationMs).toBeGreaterThanOrEqual(1000);
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("segurar além de holdAfterMs e soltar para com release e fecha a fonte", async () => {
    const { root, rec, source } = setup({ holdAfterMs: 300 });
    press(root);
    await act(async () => {});
    advance(600);
    lift(root);
    expect(rec.stops.map((s) => s.reason)).toEqual(["release"]);
    expect(source.stops).toBe(1);
  });

  it("mode toggle nunca para ao soltar", async () => {
    const { root, rec } = setup({ mode: "toggle" });
    press(root);
    await act(async () => {});
    advance(2000);
    lift(root);
    expect(rec.stops).toHaveLength(0);
    expect(root).toHaveAttribute("data-state", "listening");
  });

  it("mode hold para mesmo num toque curto", async () => {
    const { root, rec } = setup({ mode: "hold" });
    press(root);
    await act(async () => {});
    advance(50);
    lift(root);
    expect(rec.stops.map((s) => s.reason)).toEqual(["release"]);
  });

  it("Enter alterna com key e Escape para com escape", async () => {
    const { root, rec } = setup();
    fireEvent.keyDown(root, { key: "Enter" });
    await act(async () => {});
    expect(root).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(root, { key: "Enter", repeat: true });
    expect(root).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(root, { key: " " });
    expect(rec.stops.map((s) => s.reason)).toEqual(["key"]);
    fireEvent.keyDown(root, { key: " " });
    await act(async () => {});
    fireEvent.keyDown(root, { key: "Escape" });
    expect(rec.stops.map((s) => s.reason)).toEqual(["key", "escape"]);
  });

  it("perder o foco com o ponteiro solto para com blur", async () => {
    const { root, rec } = setup({ mode: "toggle" });
    press(root);
    lift(root);
    await act(async () => {});
    fireEvent.blur(root);
    expect(rec.stops.map((s) => s.reason)).toEqual(["blur"]);
  });

  it("fonte que rejeita para com mic-denied", async () => {
    const { root, rec } = setup({ levelSource: () => Promise.reject(new Error("negado")) });
    press(root);
    await act(async () => {});
    expect(rec.stops.map((s) => s.reason)).toEqual(["mic-denied"]);
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("fonte que chega depois de parar é fechada", async () => {
    const source = new FakeLevelSource();
    const { root } = setup({ levelSource: () => Promise.resolve(source), mode: "hold" });
    press(root);
    lift(root);
    await act(async () => {});
    expect(source.stops).toBe(1);
  });

  it("arrastar à esquerda mostra Cancelar e passar de cancelDistance cancela", async () => {
    const { root, rec, container } = setup({ cancelDistance: 64 });
    press(root, 200);
    await act(async () => {});
    move(root, 170);
    expect(container.querySelector('[data-slot="dictation-button-cancel"]')).toBeInTheDocument();
    expect(rec.stops).toHaveLength(0);
    move(root, 120);
    expect(rec.stops.map((s) => s.reason)).toEqual(["cancel"]);
    expect(container.querySelector('[data-slot="dictation-button-scatter"]')).toBeInTheDocument();
    advance(600);
    expect(container.querySelector('[data-slot="dictation-button-scatter"]')).toBeNull();
  });

  it("slideToCancel=false ignora o arrasto", async () => {
    const { root, rec } = setup({ slideToCancel: false });
    press(root, 200);
    await act(async () => {});
    move(root, 0);
    expect(rec.stops).toHaveLength(0);
  });

  it("desmontar ouvindo para com unmount e fecha a fonte", async () => {
    const { root, rec, source, unmount } = setup({ mode: "toggle" });
    press(root);
    lift(root);
    await act(async () => {});
    unmount();
    expect(rec.stops.map((s) => s.reason)).toEqual(["unmount"]);
    expect(source.stops).toBe(1);
  });

  it("virar disabled ouvindo para com disabled; disabled não começa", async () => {
    const { root, rec, rerenderWith } = setup({ mode: "toggle" });
    press(root);
    lift(root);
    await act(async () => {});
    rerenderWith({ mode: "toggle", disabled: true });
    expect(rec.stops.map((s) => s.reason)).toEqual(["disabled"]);
    press(root);
    expect(rec.starts).toHaveLength(1);
  });

  it("mostra relógio e forma de onda ouvindo, e respeita showTime/waveform", async () => {
    const { root, container, rerenderWith } = setup({ mode: "toggle" });
    expect(container.querySelector('[data-slot="dictation-button-clock"]')).toBeNull();
    press(root);
    lift(root);
    await act(async () => {});
    advance(3200);
    expect(container.querySelector('[data-slot="dictation-button-clock"]')).toHaveTextContent(
      "0:03"
    );
    const bars = container.querySelectorAll('[data-slot="dictation-button-wave"] > span');
    expect(bars.length).toBeGreaterThan(1);
    rerenderWith({ mode: "toggle", showTime: false, waveform: false });
    expect(container.querySelector('[data-slot="dictation-button-clock"]')).toBeNull();
    expect(container.querySelector('[data-slot="dictation-button-wave"]')).toBeNull();
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "custom-x", "aria-label": "Ditar nota" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom-x");
    expect(root).toHaveAttribute("aria-label", "Ditar nota");
  });
});

describe("movimento reduzido", () => {
  it("troca a forma de onda por uma única barra de nível", async () => {
    const rec = new Recorder();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <DictationButton
          levelSource={() => new FakeLevelSource()}
          mode="toggle"
          onStop={rec.onStop}
        />
      </MotionConfig>
    );
    const root = container.querySelector(ROOT) as HTMLButtonElement;
    press(root);
    lift(root);
    await act(async () => {});
    advance(200);
    expect(container.querySelectorAll('[data-slot="dictation-button-wave"] > span')).toHaveLength(
      1
    );
  });
});
