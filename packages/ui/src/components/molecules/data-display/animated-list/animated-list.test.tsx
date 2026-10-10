import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AnimatedList, type AnimatedListProps } from "./animated-list";

type Fund = { id: string; name: string };

const FUNDS: Fund[] = [
  { id: "a", name: "Atlas Multimercado" },
  { id: "b", name: "Boreal Renda Fixa" },
  { id: "c", name: "Cedro Ações Brasil" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(
  props: Partial<AnimatedListProps<Fund>> = {},
  reduced: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <AnimatedList aria-label="Fundos" items={FUNDS} renderItem={(fund) => fund.name} {...props} />
    </MotionConfig>
  );
  const list = screen.getByRole("listbox", { name: "Fundos" });
  const options = () => screen.getAllByRole("option");
  return { ...view, list, options };
}

describe("AnimatedList", () => {
  it("renderiza listbox com N options e as partes marcadas", () => {
    const { options, container, list } = setup();
    expect(options()).toHaveLength(3);
    expect(list).toHaveAttribute("tabindex", "0");
    expect(container.querySelector('[data-slot="animated-list"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="animated-list-viewport"]')).toBe(list);
    expect(container.querySelectorAll('[data-slot="animated-list-item"]')).toHaveLength(3);
    for (const slot of ["animated-list-fade-top", "animated-list-fade-bottom"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    }
  });

  it("sem showGradients não renderiza os degradês", () => {
    const { container } = setup({ showGradients: false });
    expect(container.querySelector('[data-slot="animated-list-fade-top"]')).toBeNull();
  });

  it("clique seleciona e chama onItemSelect(item, index)", () => {
    const onItemSelect = vi.fn();
    const { options, list } = setup({ onItemSelect });
    fireEvent.click(options()[1]);
    expect(options()[1]).toHaveAttribute("aria-selected", "true");
    expect(options()[1]).toHaveAttribute("data-selected", "true");
    expect(list).toHaveAttribute("aria-activedescendant", options()[1].id);
    expect(onItemSelect).toHaveBeenCalledWith(FUNDS[1], 1);
  });

  it("ArrowDown duas vezes a partir de -1 seleciona o índice 1", () => {
    const { list, options } = setup();
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(options()[1]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowUp no primeiro fica no 0; End vai ao último; Home volta", () => {
    const { list, options } = setup({ defaultSelectedIndex: 0 });
    fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(list, { key: "End" });
    expect(options()[2]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(list, { key: "Home" });
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
  });

  it("Enter e Espaço confirmam o item selecionado", () => {
    const onItemSelect = vi.fn();
    const { list } = setup({ onItemSelect, defaultSelectedIndex: 2 });
    fireEvent.keyDown(list, { key: "Enter" });
    fireEvent.keyDown(list, { key: " " });
    expect(onItemSelect).toHaveBeenCalledTimes(2);
    expect(onItemSelect).toHaveBeenCalledWith(FUNDS[2], 2);
  });

  it("Enter sem seleção não chama onItemSelect", () => {
    const onItemSelect = vi.fn();
    const { list } = setup({ onItemSelect });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it("enableArrowNavigation=false ignora as setas", () => {
    const { list, options } = setup({ enableArrowNavigation: false });
    fireEvent.keyDown(list, { key: "ArrowDown" });
    for (const option of options()) expect(option).toHaveAttribute("aria-selected", "false");
  });

  it("selectedIndex controlado manda; clique só avisa", () => {
    const onItemSelect = vi.fn();
    const { options } = setup({ selectedIndex: 0, onItemSelect });
    fireEvent.click(options()[2]);
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    expect(options()[2]).toHaveAttribute("aria-selected", "false");
    expect(onItemSelect).toHaveBeenCalledWith(FUNDS[2], 2);
  });

  it("usa getKey, renderItem com selected e o padrão String(item)", () => {
    const renderItem = vi.fn((fund: Fund, _i: number, selected: boolean) => (
      <span>{`${fund.name}:${selected}`}</span>
    ));
    const { rerender } = setup({ renderItem, getKey: (fund) => fund.id, defaultSelectedIndex: 1 });
    expect(screen.getByText("Boreal Renda Fixa:true")).toBeInTheDocument();
    expect(screen.getByText("Atlas Multimercado:false")).toBeInTheDocument();
    rerender(<AnimatedList aria-label="Nomes" items={["Fundo Alfa", "Fundo Beta"]} />);
    expect(screen.getByText("Fundo Beta")).toBeInTheDocument();
  });

  it("scroll recalcula a opacidade dos degradês", () => {
    const { list, container } = setup();
    Object.defineProperty(list, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(list, "clientHeight", { configurable: true, value: 384 });
    list.scrollTop = 25;
    fireEvent.scroll(list);
    const top = container.querySelector('[data-slot="animated-list-fade-top"]') as HTMLElement;
    expect(top.style.opacity).toBe("0.5");
  });

  it("showScrollbar=false esconde a barra", () => {
    const { list } = setup({ showScrollbar: false });
    expect(list.className).toContain("[&::-webkit-scrollbar]:hidden");
  });

  it("movimento reduzido renderiza os itens sem animação de escala", () => {
    const { options } = setup({}, "always");
    expect(options()).toHaveLength(3);
    expect(options()[0].style.transform).toBe("");
    expect(options()[0].style.opacity).toBe("");
  });

  it("expõe ref, className e props nativas na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "minha-classe", id: "fundos" });
    const root = container.querySelector('[data-slot="animated-list"]');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative");
    expect(root).toHaveAttribute("id", "fundos");
  });
});
