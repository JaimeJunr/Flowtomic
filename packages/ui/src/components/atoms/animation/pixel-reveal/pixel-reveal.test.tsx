import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PixelReveal, type PixelRevealProps } from "./pixel-reveal";

const ROOT = '[data-slot="pixel-reveal"]';
const COVER_MS = 400 + 200;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<PixelRevealProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <PixelReveal
        firstContent={<span>Saldo oculto</span>}
        secondContent={<span>R$ 12.480,00</span>}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const state = () => root.getAttribute("data-state");
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  return { ...view, root, state, advance };
}

describe("PixelReveal", () => {
  it("expõe ref, className, data-slot e a grade decorativa", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, container } = setup({ ref, className: "minha-classe", id: "saldo" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "overflow-hidden", "bg-card");
    expect(root).toHaveAttribute("id", "saldo");
    const grid = container.querySelector('[data-slot="pixel-reveal-grid"]');
    expect(grid).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll('[data-slot="pixel-reveal-cell"]')).toHaveLength(100);
  });

  it("usa gridSize e aspectRatio para o número de células", () => {
    const { container, root } = setup({ gridSize: 4, aspectRatio: "2 / 1" });
    expect(container.querySelectorAll('[data-slot="pixel-reveal-cell"]')).toHaveLength(8);
    expect(root.style.aspectRatio).toBe("2 / 1");
  });

  it("começa com o primeiro conteúdo; o outro fica fora da árvore de acessibilidade", () => {
    const { getByText, state } = setup();
    expect(state()).toBe("first");
    expect(getByText("Saldo oculto").parentElement).not.toHaveAttribute("hidden");
    expect(getByText("R$ 12.480,00").parentElement).toHaveAttribute("hidden");
  });

  it("hover cobre e termina em second; sair volta a first", () => {
    const { root, state, advance, getByText } = setup();
    fireEvent.pointerEnter(root, { clientX: 5, clientY: 5 });
    expect(state()).toBe("covering");
    advance(COVER_MS - 50);
    expect(state()).toBe("covering");
    advance(100);
    expect(state()).toBe("second");
    expect(getByText("R$ 12.480,00").parentElement).not.toHaveAttribute("hidden");
    fireEvent.pointerLeave(root);
    expect(state()).toBe("uncovering");
    advance(COVER_MS + 10);
    expect(state()).toBe("first");
  });

  it("foco e desfoco por teclado revelam e escondem no hover", () => {
    const { root, state, advance } = setup();
    expect(root).toHaveAttribute("tabindex", "0");
    fireEvent.focus(root);
    advance(COVER_MS + 10);
    expect(state()).toBe("second");
    fireEvent.blur(root);
    advance(COVER_MS + 10);
    expect(state()).toBe("first");
  });

  it("trocar de ideia no meio recomeça da cobertura atual, sem pular para o fim", () => {
    const { root, state, advance } = setup();
    fireEvent.pointerEnter(root);
    advance(200);
    fireEvent.pointerLeave(root);
    expect(state()).toBe("uncovering");
    advance(COVER_MS - 100);
    expect(state()).toBe("uncovering");
    advance(200);
    expect(state()).toBe("first");
  });

  it("click: role button, aria-pressed alterna e Enter e Espaço funcionam", () => {
    const { root, state, advance } = setup({ trigger: "click" });
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    advance(COVER_MS + 10);
    expect(state()).toBe("second");
    fireEvent.keyDown(root, { key: "Enter" });
    expect(root).toHaveAttribute("aria-pressed", "false");
    advance(COVER_MS + 10);
    fireEvent.keyDown(root, { key: " " });
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("click ignora hover, e hover não tem role button", () => {
    const click = setup({ trigger: "click" });
    fireEvent.pointerEnter(click.root);
    expect(click.state()).toBe("first");
    click.unmount();
    const hover = setup();
    expect(hover.root).not.toHaveAttribute("role");
    expect(hover.root).not.toHaveAttribute("aria-pressed");
    fireEvent.keyDown(hover.root, { key: "Enter" });
    expect(hover.state()).toBe("first");
  });

  it("controlado: active manda e onActiveChange avisa no hover", () => {
    const onActiveChange = vi.fn();
    const { root, state, advance } = setup({ active: false, onActiveChange });
    fireEvent.pointerEnter(root);
    expect(onActiveChange).toHaveBeenCalledWith(true);
    advance(COVER_MS + 10);
    expect(state()).toBe("first");
  });

  it("controlado: active=true começa revelado e segue mudanças do pai", () => {
    const view = setup({ active: true });
    expect(view.state()).toBe("second");
    view.rerender(
      <MotionConfig reducedMotion="never">
        <PixelReveal firstContent="a" secondContent="b" active={false} />
      </MotionConfig>
    );
    expect(view.state()).toBe("uncovering");
    view.advance(COVER_MS + 10);
    expect(view.state()).toBe("first");
  });

  it("once: depois de revelar, sair não volta", () => {
    const onActiveChange = vi.fn();
    const { root, state, advance } = setup({ once: true, onActiveChange });
    fireEvent.pointerEnter(root);
    advance(COVER_MS + 10);
    fireEvent.pointerLeave(root);
    advance(COVER_MS + 10);
    expect(state()).toBe("second");
    expect(onActiveChange).toHaveBeenCalledTimes(1);
  });

  it("chama os handlers do usuário", () => {
    const onPointerEnter = vi.fn();
    const onFocus = vi.fn();
    const { root } = setup({ onPointerEnter, onFocus });
    fireEvent.pointerEnter(root);
    fireEvent.focus(root);
    expect(onPointerEnter).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
  });

  it("movimento reduzido: sem grade, troca direta", () => {
    const { root, container, state, getByText } = setup({}, "always");
    expect(container.querySelector('[data-slot="pixel-reveal-grid"]')).toBeNull();
    fireEvent.pointerEnter(root);
    expect(state()).toBe("second");
    expect(getByText("R$ 12.480,00").parentElement).not.toHaveAttribute("hidden");
    fireEvent.pointerLeave(root);
    expect(state()).toBe("first");
  });
});
