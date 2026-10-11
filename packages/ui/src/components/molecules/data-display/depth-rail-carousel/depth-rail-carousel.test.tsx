import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DepthRailCarousel, type DepthRailCarouselProps } from "./depth-rail-carousel";

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});
afterEach(() => {
  vi.useRealTimers();
});

const items = [
  { id: "a", label: "Relatório de março", content: <p>Março</p> },
  { id: "b", label: "Relatório de abril", content: <p>Abril</p> },
  { id: "c", label: "Relatório de maio", content: <p>Maio</p> },
];

function setup(props: Partial<DepthRailCarouselProps> = {}) {
  return render(<DepthRailCarousel items={items} aria-label="Relatórios" {...props} />);
}

const activeSlide = () => screen.getByRole("group");
const offsets = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-slot='depth-rail-carousel-card']")).map((el) =>
    el.getAttribute("data-offset")
  );

describe("DepthRailCarousel", () => {
  it("expõe região acessível e só o cartão ativo na árvore", () => {
    const { container } = setup();
    const root = screen.getByRole("region", { name: "Relatórios" });
    expect(root).toHaveAttribute("aria-roledescription", "carrossel");
    expect(root).toHaveAttribute("data-slot", "depth-rail-carousel");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
    const cards = container.querySelectorAll("[data-slot='depth-rail-carousel-card']");
    expect(cards[1]).toHaveAttribute("aria-hidden", "true");
    expect(cards[1]).toHaveAttribute("inert");
    expect(offsets(container)).toEqual(["0", "1", "2"]);
  });

  it("anuncia o rótulo do ativo numa região polite", () => {
    const { container } = setup();
    const live = container.querySelector("[aria-live]");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent("Relatório de março");
  });

  it("avança e volta pelas setas", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(activeSlide()).toHaveAccessibleName("2 de 3");
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
  });

  it("vai direto ao cartão pelos pontos e marca aria-current", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Ir para Relatório de maio" }));
    expect(activeSlide()).toHaveAccessibleName("3 de 3");
    expect(screen.getByRole("button", { name: "Ir para Relatório de maio" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: "Ir para Relatório de março" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("troca pelo teclado com foco na raiz", () => {
    setup();
    const root = screen.getByRole("region");
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(activeSlide()).toHaveAccessibleName("2 de 3");
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
  });

  it("com loop dá a volta e as setas nunca desabilitam", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(activeSlide()).toHaveAccessibleName("3 de 3");
  });

  it("sem loop desabilita as setas nas pontas e deixa os passados para trás", async () => {
    const user = userEvent.setup();
    const { container } = setup({ loop: false });
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(offsets(container)).toEqual(["-1", "0", "1"]);
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByRole("button", { name: "Próximo" })).toBeDisabled();
  });

  it("chama onChange com o novo índice", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    setup({ onChange });
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("no modo controlado só muda quando a prop muda", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DepthRailCarousel items={items} index={0} onChange={onChange} aria-label="Relatórios" />
    );
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
    rerender(
      <DepthRailCarousel items={items} index={1} onChange={onChange} aria-label="Relatórios" />
    );
    expect(activeSlide()).toHaveAccessibleName("2 de 3");
  });

  it("começa em defaultIndex", () => {
    setup({ defaultIndex: 2 });
    expect(activeSlide()).toHaveAccessibleName("3 de 3");
  });

  it("esconde setas e pontos quando pedido", () => {
    setup({ showControls: false, showIndicators: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("troca ao arrastar mais de 60 px e ignora arrasto curto", () => {
    const { container } = setup();
    const stage = container.querySelector("[data-slot='depth-rail-carousel-card']")
      ?.parentElement as HTMLElement;
    fireEvent.pointerDown(stage, { clientX: 200 });
    fireEvent.pointerUp(stage, { clientX: 195 });
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
    fireEvent.pointerDown(stage, { clientX: 200 });
    fireEvent.pointerUp(stage, { clientX: 100 });
    expect(activeSlide()).toHaveAccessibleName("2 de 3");
    fireEvent.pointerDown(stage, { clientX: 100 });
    fireEvent.pointerUp(stage, { clientX: 200 });
    expect(activeSlide()).toHaveAccessibleName("1 de 3");
    expect(stage.style.touchAction).toBe("pan-y");
    expect(stage).toHaveClass("select-none");
  });

  it("lança erro citando o valor recebido para opções inválidas", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DepthRailCarousel items={[]} />)).toThrow(/items.*0/);
    expect(() => render(<DepthRailCarousel items={items} visibleCards={9} />)).toThrow(
      /visibleCards.*9/
    );
    expect(() => render(<DepthRailCarousel items={items} falloff={2} />)).toThrow(/falloff.*2/);
    spy.mockRestore();
  });

  describe("autoplay", () => {
    it("avança sozinho e desliga o aria-live", async () => {
      const { container } = setup({ autoplay: true, autoplayDelay: 40 });
      expect(container.querySelector("[aria-live]")).toHaveAttribute("aria-live", "off");
      await waitFor(() => expect(activeSlide()).toHaveAccessibleName("2 de 3"));
    });

    it("pausa com o mouse em cima", async () => {
      setup({ autoplay: true, autoplayDelay: 40 });
      const root = screen.getByRole("region");
      fireEvent.pointerEnter(root, { pointerType: "mouse" });
      await act(() => new Promise((r) => setTimeout(r, 200)));
      expect(activeSlide()).toHaveAccessibleName("1 de 3");
      fireEvent.pointerLeave(root, { pointerType: "mouse" });
      await waitFor(() => expect(activeSlide()).toHaveAccessibleName("2 de 3"));
    });

    it("pausa com foco dentro", async () => {
      setup({ autoplay: true, autoplayDelay: 40 });
      fireEvent.focus(screen.getByRole("button", { name: "Próximo" }));
      await act(() => new Promise((r) => setTimeout(r, 200)));
      expect(activeSlide()).toHaveAccessibleName("1 de 3");
    });

    it("para na última sem loop", async () => {
      setup({ autoplay: true, autoplayDelay: 30, loop: false, defaultIndex: 2 });
      await act(() => new Promise((r) => setTimeout(r, 150)));
      expect(activeSlide()).toHaveAccessibleName("3 de 3");
    });

    it("com movimento reduzido não troca sozinho", async () => {
      render(
        <MotionConfig reducedMotion="always">
          <DepthRailCarousel items={items} autoplay autoplayDelay={30} aria-label="Relatórios" />
        </MotionConfig>
      );
      await act(() => new Promise((r) => setTimeout(r, 150)));
      expect(activeSlide()).toHaveAccessibleName("1 de 3");
    });
  });
});
