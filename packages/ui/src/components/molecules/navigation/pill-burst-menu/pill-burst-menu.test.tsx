import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PillBurstMenu, type PillBurstMenuProps } from "./pill-burst-menu";

const ITEMS = [
  { label: "Início", href: "#inicio", tone: "primary" as const },
  { label: "Carteiras", href: "#carteiras" },
  { label: "Planos", href: "#planos", rotation: 3 },
];

// O PointerEvent do setup não carrega `pointerType`.
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

function setup(props: Partial<PillBurstMenuProps> = {}, reduced: "never" | "always" = "never") {
  return render(
    <MotionConfig reducedMotion={reduced}>
      <PillBurstMenu items={ITEMS} logo={<span>Logo</span>} {...props} />
    </MotionConfig>
  );
}

const toggle = () => screen.getByRole("button", { name: /menu/i });

describe("PillBurstMenu", () => {
  it("renderiza fechado com marcação base", () => {
    const { container } = setup();
    expect(container.querySelector('[data-slot="pill-burst-menu"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pill-burst-menu-logo"]')).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveAccessibleName("Abrir menu");
  });

  it("abre pelo botão e foca a primeira pílula", async () => {
    setup();
    fireEvent.click(toggle());
    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(toggle()).toHaveAccessibleName("Fechar menu");
    expect(toggle()).toHaveAttribute("aria-controls", dialog.id);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    await waitFor(() => expect(screen.getByRole("link", { name: "Início" })).toHaveFocus());
  });

  it("fecha pelo botão e devolve o foco a ele", async () => {
    setup({ defaultOpen: true });
    await screen.findByRole("dialog");
    fireEvent.click(toggle());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(toggle()).toHaveFocus();
  });

  it("fecha com Esc", async () => {
    setup({ defaultOpen: true });
    await screen.findByRole("dialog");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("fecha ao clicar num item", async () => {
    const onOpenChange = vi.fn();
    setup({ defaultOpen: true, onOpenChange });
    fireEvent.click(await screen.findByRole("link", { name: "Carteiras" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("respeita o modo controlado", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = setup({ open: false, onOpenChange });
    fireEvent.click(toggle());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(
      <MotionConfig reducedMotion="never">
        <PillBurstMenu items={ITEMS} open onOpenChange={onOpenChange} />
      </MotionConfig>
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("marca data-hovered só com mouse", async () => {
    setup({ defaultOpen: true });
    const link = await screen.findByRole("link", { name: "Carteiras" });
    fireEvent.pointerEnter(link, { pointerType: "touch" });
    expect(link).not.toHaveAttribute("data-hovered");
    fireEvent.pointerEnter(link, { pointerType: "mouse" });
    expect(link).toHaveAttribute("data-hovered", "true");
    fireEvent.pointerLeave(link, { pointerType: "mouse" });
    expect(link).not.toHaveAttribute("data-hovered");
  });

  it("marca data-hovered no foco", async () => {
    setup({ defaultOpen: true });
    const link = await screen.findByRole("link", { name: "Planos" });
    fireEvent.focus(link);
    expect(link).toHaveAttribute("data-hovered", "true");
    fireEvent.blur(link);
    expect(link).not.toHaveAttribute("data-hovered");
  });

  it("lança erro com 0 ou mais de 8 itens", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ items: [] })).toThrow(/received 0 items/);
    const many = Array.from({ length: 9 }, (_, i) => ({ label: `Item ${i}`, href: "#" }));
    expect(() => setup({ items: many })).toThrow(/received 9 items/);
    spy.mockRestore();
  });

  it("abre por opacidade com movimento reduzido", async () => {
    setup({ defaultOpen: true }, "always");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("usa fixed e className", () => {
    const { container } = setup({ fixed: true, className: "h-40" });
    const root = container.querySelector('[data-slot="pill-burst-menu"]');
    expect(root).toHaveClass("fixed", "h-40");
  });
});
