import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SlideToConfirm, type SlideToConfirmProps } from "./slide-to-confirm";
import {
  labelOpacity,
  progress,
  type SlideEvent,
  type SlidePhase,
  slideReducer,
  springFor,
  travelOf,
} from "./slide-to-confirm-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<SlideToConfirmProps> = {}, reduced: "never" | "always" = "never") {
  const onConfirm = props.onConfirm ?? vi.fn();
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <SlideToConfirm
        label="Deslize para pagar"
        doneLabel="Pago"
        errorLabel="Falha"
        {...props}
        onConfirm={onConfirm}
      />
    </MotionConfig>
  );
  return { ...view, onConfirm };
}

const handle = () => screen.getByRole("slider");
const root = () =>
  document.querySelector<HTMLElement>('[data-slot="slide-to-confirm"]') as HTMLElement;
const flush = () => act(async () => {});

describe("progress / travelOf", () => {
  it("limita a 0..1", () => {
    expect(progress(-5, 100)).toBe(0);
    expect(progress(50, 100)).toBe(0.5);
    expect(progress(500, 100)).toBe(1);
  });
  it("curso zero devolve 0", () => {
    expect(progress(10, 0)).toBe(0);
  });
  it("travelOf desconta alça e insets, nunca negativo", () => {
    expect(travelOf(300, 40, 4)).toBe(252);
    expect(travelOf(20, 40, 4)).toBe(0);
  });
});

describe("slideReducer", () => {
  const cases: [SlidePhase, SlideEvent, SlidePhase][] = [
    ["idle", "dragStart", "dragging"],
    ["error", "dragStart", "dragging"],
    ["pending", "dragStart", "pending"],
    ["dragging", "release", "idle"],
    ["done", "release", "done"],
    ["idle", "confirm", "pending"],
    ["dragging", "confirm", "pending"],
    ["done", "confirm", "done"],
    ["pending", "resolve", "done"],
    ["idle", "resolve", "idle"],
    ["pending", "reject", "error"],
    ["idle", "reject", "idle"],
    ["done", "reset", "idle"],
    ["error", "reset", "error"],
  ];
  it.each(cases)("%s + %s -> %s", (from, event, to) => {
    expect(slideReducer(from, event)).toBe(to);
  });
  it("evento inválido lança com o valor recebido", () => {
    expect(() => slideReducer("idle", "x" as SlideEvent)).toThrow(/received event "x"/);
  });
});

describe("labelOpacity / springFor", () => {
  it("texto apaga com o progresso", () => {
    expect(labelOpacity(0)).toBe(1);
    expect(labelOpacity(1)).toBe(0);
  });
  it("mais bounce, menos amortecimento", () => {
    expect(springFor(50, 0.8).damping).toBeLessThan(springFor(50, 0.1).damping);
  });
});

describe("SlideToConfirm", () => {
  it("expõe slider acessível e marcação", () => {
    setup();
    expect(handle()).toHaveAttribute("aria-valuemin", "0");
    expect(handle()).toHaveAttribute("aria-valuemax", "100");
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
    expect(handle()).toHaveAttribute("aria-label", "Deslize para pagar");
    expect(root()).toHaveAttribute("data-phase", "idle");
    expect(document.querySelector('[data-slot="slide-to-confirm-fill"]')).toBeInTheDocument();
  });

  it("Enter confirma; promessa resolvida vai a done e chama onDone", async () => {
    const onDone = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    setup({ onConfirm, onDone });
    fireEvent.keyDown(handle(), { key: "Enter" });
    await flush();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute("data-phase", "done");
    expect(screen.getAllByText("Pago").length).toBeGreaterThan(0);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("holdMs volta a idle; holdMs 0 fica", async () => {
    vi.useFakeTimers();
    const first = setup({ holdMs: 1500 });
    fireEvent.keyDown(handle(), { key: " " });
    await act(async () => {});
    expect(root()).toHaveAttribute("data-phase", "done");
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });
    expect(root()).toHaveAttribute("data-phase", "idle");
    first.unmount();
    setup({ holdMs: 0 });
    fireEvent.keyDown(handle(), { key: "End" });
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(root()).toHaveAttribute("data-phase", "done");
    vi.useRealTimers();
  });

  it("promessa rejeitada vai a error e chama onError", async () => {
    const onError = vi.fn();
    const reason = new Error("boom");
    setup({ onConfirm: () => Promise.reject(reason), onError });
    fireEvent.keyDown(handle(), { key: "Enter" });
    await flush();
    expect(root()).toHaveAttribute("data-phase", "error");
    expect(screen.getAllByText("Falha").length).toBeGreaterThan(0);
    expect(onError).toHaveBeenCalledWith(reason);
  });

  it("promessa pendente marca aria-busy", async () => {
    setup({ onConfirm: () => new Promise(() => {}) });
    fireEvent.keyDown(handle(), { key: "Enter" });
    await flush();
    expect(handle()).toHaveAttribute("aria-busy", "true");
    expect(root()).toHaveAttribute("data-phase", "pending");
  });

  it("setas avançam 10%", () => {
    setup();
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(handle()).toHaveAttribute("aria-valuenow", "10");
  });

  describe("arrasto", () => {
    function mockWidth() {
      return vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300);
    }
    function drag(to: number) {
      fireEvent.pointerDown(handle(), { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle(), { clientX: to, pointerId: 1 });
      fireEvent.pointerUp(handle(), { clientX: to, pointerId: 1 });
    }

    it("até o fim confirma", async () => {
      const spy = mockWidth();
      const { onConfirm } = setup();
      drag(400);
      await flush();
      expect(onConfirm).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it("até a metade não confirma e volta a idle", async () => {
      const spy = mockWidth();
      const { onConfirm } = setup();
      drag(120);
      await flush();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(root()).toHaveAttribute("data-phase", "idle");
      spy.mockRestore();
    });
  });

  it("disabled ignora teclado", () => {
    const { onConfirm } = setup({ disabled: true });
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(root().className).toContain("opacity-50");
  });

  it("movimento reduzido confirma", async () => {
    const { onConfirm } = setup({}, "always");
    fireEvent.keyDown(handle(), { key: "Enter" });
    await flush();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SlideToConfirm ref={ref} className="w-72" onConfirm={() => {}} />);
    expect(ref.current).toBe(root());
    expect(root().className).toContain("w-72");
  });
});
