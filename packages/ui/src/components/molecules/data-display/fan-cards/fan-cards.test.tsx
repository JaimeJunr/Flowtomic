import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type FanCardItem, FanCards } from "./fan-cards";

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

const items: FanCardItem[] = [
  { id: "a", label: "Extrato de setembro", content: <span>Extrato</span> },
  { id: "b", label: "Informe de rendimentos", content: <span>Informe</span> },
  { id: "c", label: "Contrato de custódia", image: "/contrato.png" },
];

const cards = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="fan-cards-card"]'));

function hover(el: HTMLElement, pointerType = "mouse") {
  fireEvent(el, new PointerEvent("pointerover", { pointerType, bubbles: true }));
}

describe("FanCards", () => {
  it("renderiza a raiz como lista com os cartões", () => {
    const { container } = render(<FanCards items={items} aria-label="Documentos" />);
    const root = container.querySelector('[data-slot="fan-cards"]');
    expect(root).toHaveAttribute("role", "list");
    expect(root).toHaveAttribute("aria-label", "Documentos");
    expect(cards(container)).toHaveLength(3);
    expect(cards(container)[1]).toHaveAttribute("role", "listitem");
    expect(cards(container)[1]).toHaveAttribute("data-index", "1");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<FanCards ref={ref} items={items} className="extra" />);
    expect(ref.current).toBe(container.querySelector('[data-slot="fan-cards"]'));
    expect(ref.current).toHaveClass("extra");
  });

  it("imagem vira img com alt, senão content", () => {
    render(<FanCards items={items} />);
    expect(screen.getByAltText("Contrato de custódia")).toHaveAttribute("src", "/contrato.png");
    expect(screen.getByText("Extrato")).toBeInTheDocument();
  });

  it("hover com mouse marca data-focused e sai ao deixar", () => {
    const { container } = render(<FanCards items={items} />);
    const [first] = cards(container);
    hover(first);
    expect(first).toHaveAttribute("data-focused", "true");
    fireEvent(first, new PointerEvent("pointerout", { pointerType: "mouse", bubbles: true }));
    expect(first).toHaveAttribute("data-focused", "false");
  });

  it("hover de toque não marca foco", () => {
    const { container } = render(<FanCards items={items} />);
    const [first] = cards(container);
    hover(first, "touch");
    expect(first).toHaveAttribute("data-focused", "false");
  });

  it("interactive false ignora o hover", () => {
    const { container } = render(<FanCards items={items} interactive={false} />);
    const [first] = cards(container);
    hover(first);
    expect(first).toHaveAttribute("data-focused", "false");
  });

  it("onSelect transforma em botões e responde a clique e Enter", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup({ skipHover: true });
    render(<FanCards items={items} onSelect={onSelect} />);
    const button = screen.getByRole("button", { name: "Informe de rendimentos" });
    await user.click(button);
    expect(onSelect).toHaveBeenLastCalledWith(1);
    screen.getByRole("button", { name: "Contrato de custódia" }).focus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(2);
  });

  it("foco por teclado aplica a pose de foco", () => {
    const { container } = render(<FanCards items={items} onSelect={() => {}} />);
    const button = screen.getByRole("button", { name: "Extrato de setembro" });
    fireEvent.focus(button);
    expect(cards(container)[0]).toHaveAttribute("data-focused", "true");
    fireEvent.blur(button);
    expect(cards(container)[0]).toHaveAttribute("data-focused", "false");
  });

  it("sem onSelect não há botões", () => {
    render(<FanCards items={items} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("lança erro com o valor para items fora de 1..12 e bounciness inválida", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<FanCards items={[]} />)).toThrow(/received 0/);
    const many = Array.from({ length: 13 }, (_, i) => ({ id: String(i), label: `Item ${i}` }));
    expect(() => render(<FanCards items={many} />)).toThrow(/received 13/);
    expect(() => render(<FanCards items={items} bounciness={2} />)).toThrow(/received 2/);
    spy.mockRestore();
  });

  it("com movimento reduzido tudo aparece visível sem esperar", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <FanCards items={items} />
      </MotionConfig>
    );
    for (const card of cards(container)) {
      const inner = card.firstElementChild as HTMLElement;
      expect(inner.style.transform).not.toContain("scale(0)");
    }
    expect(screen.getByText("Extrato")).toBeVisible();
  });
});
