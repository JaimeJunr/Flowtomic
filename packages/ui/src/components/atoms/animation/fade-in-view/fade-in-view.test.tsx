import { act, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FadeInView, type FadeInViewProps } from "./fade-in-view";

const ROOT = '[data-slot="fade-in-view"]';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly targets = new Set<Element>();
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
  trigger(isIntersecting: boolean) {
    const entries = [...this.targets].map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        }) as IntersectionObserverEntry
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

function setVisible(isIntersecting: boolean) {
  act(() => {
    for (const io of FakeIntersectionObserver.instances) io.trigger(isIntersecting);
  });
}

const original = window.IntersectionObserver;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  vi.useFakeTimers();
});
afterEach(() => {
  window.IntersectionObserver = original;
  vi.useRealTimers();
});

function setup(props: Partial<FadeInViewProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <FadeInView {...props}>
        <span>Relatório trimestral</span>
      </FadeInView>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const state = () => root.getAttribute("data-state");
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  return { ...view, root, state, advance };
}

describe("FadeInView", () => {
  it("expõe ref, className, data-slot, props nativas e filhos", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, getByText } = setup({ ref, className: "minha-classe", id: "bloco" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("id", "bloco");
    expect(getByText("Relatório trimestral")).toBeInTheDocument();
  });

  it("começa hidden e vira shown ao entrar na tela", () => {
    const onAppear = vi.fn();
    const { state, advance } = setup({ onAppear });
    expect(state()).toBe("hidden");
    setVisible(true);
    expect(state()).toBe("shown");
    advance(1000);
    expect(onAppear).toHaveBeenCalledTimes(1);
  });

  it("com once (padrão) continua shown ao sair da tela", () => {
    const { state } = setup();
    setVisible(true);
    setVisible(false);
    expect(state()).toBe("shown");
  });

  it("com once=false volta a hidden ao sair", () => {
    const { state } = setup({ once: false });
    setVisible(true);
    expect(state()).toBe("shown");
    setVisible(false);
    expect(state()).toBe("hidden");
  });

  it("disappearAfter leva a gone com aria-hidden, inert e onDisappear", () => {
    const onDisappear = vi.fn();
    const { root, state, advance } = setup({
      duration: 1,
      delay: 0,
      disappearAfter: 2,
      onDisappear,
    });
    setVisible(true);
    advance(2900);
    expect(state()).toBe("shown");
    expect(root).not.toHaveAttribute("aria-hidden");
    advance(200);
    expect(state()).toBe("gone");
    advance(1000);
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("inert");
    expect(onDisappear).toHaveBeenCalledTimes(1);
  });

  it("limpa o timer ao desmontar", () => {
    const onDisappear = vi.fn();
    const { unmount, advance } = setup({ disappearAfter: 1, onDisappear });
    setVisible(true);
    unmount();
    advance(10000);
    expect(onDisappear).not.toHaveBeenCalled();
  });

  it("movimento reduzido nasce shown e visível", () => {
    const { state, root } = setup({ blur: true }, "always");
    expect(state()).toBe("shown");
    expect(root.style.opacity).toBe("1");
    expect(root.style.filter).toBe("");
  });

  it("movimento reduzido mantém disappearAfter", () => {
    const { state, advance } = setup({ disappearAfter: 2 }, "always");
    advance(1900);
    expect(state()).toBe("shown");
    advance(200);
    expect(state()).toBe("gone");
  });
});
