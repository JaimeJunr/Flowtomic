import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Folder, Home } from "lucide-react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MenuDock, type MenuDockItem } from "./menu-dock";

function items(onHome = vi.fn(), onProjects = vi.fn()): MenuDockItem[] {
  return [
    {
      id: "inicio",
      label: "Início",
      icon: Home,
      href: "#inicio",
      path: "/outra-rota",
      onClick: onHome,
    },
    { id: "projetos", label: "Projetos", icon: Folder, path: "#projetos", onClick: onProjects },
  ];
}

const navigation = () => screen.getByRole("navigation", { name: "Menu de navegação" });

function mobileDock() {
  const toggle = screen.getByRole("button", { name: "Alternar menu" });
  if (!toggle.parentElement) throw new Error("O toggle deve estar dentro do dock mobile");
  return { toggle, container: toggle.parentElement };
}

function preventNavigation(link: HTMLElement) {
  link.addEventListener("click", (event) => event.preventDefault());
}

// A animação de saída passa de 1 s com a máquina carregada e estoura o waitFor padrão
// (falhava só na suíte inteira). O teste confere o comportamento, não a duração.
beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("MenuDock", () => {
  it.each([2, 8])("aceita %i itens e identifica só o primeiro como página atual", (count) => {
    const entries = Array.from({ length: count }, (_, index) => ({
      id: String(index),
      label: `Destino ${index + 1}`,
      icon: Home,
    }));
    render(<MenuDock items={entries} />);
    expect(within(navigation()).getAllByRole("button")).toHaveLength(count);
    for (const [index, item] of entries.entries()) {
      const button = screen.getByRole("button", { name: item.label });
      if (index === 0) expect(button).toHaveAttribute("aria-current", "page");
      else expect(button).not.toHaveAttribute("aria-current");
    }
  });

  it.each([
    undefined,
    [],
    [{ label: "Único", icon: Home }],
    Array.from({ length: 9 }, (_, index) => ({ label: `Item ${index}`, icon: Home })),
  ])("items=%j inválido usa os cinco destinos padrão em português", (entries) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(<MenuDock items={entries} />);
      expect(screen.getAllByRole("button")).toHaveLength(5);
      for (const label of ["Início", "Trabalho", "Calendário", "Segurança", "Configurações"]) {
        expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
      }
      expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
    }
  });

  it.each([
    false,
    true,
  ])("showLabels=%s preserva nomes acessíveis e só controla o texto visível", (showLabels) => {
    render(<MenuDock items={items()} showLabels={showLabels} />);
    for (const label of ["Início", "Projetos"]) {
      const button = screen.getByRole("button", { name: label });
      if (showLabels) expect(within(button).getByText(label)).toBeInTheDocument();
      else expect(within(button).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it.each([
    "{Enter}",
    " ",
  ])("Tab e %s selecionam itens e enviam índice e callbacks sem argumentos extras", async (key) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    const onActiveIndexChange = vi.fn();
    render(
      <MenuDock
        items={items(onHome, onProjects)}
        showLabels={false}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Início" })).toHaveFocus();
    await user.keyboard(key);
    await user.tab();
    expect(screen.getByRole("button", { name: "Projetos" })).toHaveFocus();
    await user.keyboard(key);
    expect(onActiveIndexChange.mock.calls).toEqual([[0], [1]]);
    expect(onHome.mock.calls).toEqual([[]]);
    expect(onProjects.mock.calls).toEqual([[]]);
    expect(screen.getByRole("button", { name: "Projetos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("modo controlado solicita o índice e espera activeIndex, inclusive ao clicar no item atual", async () => {
    const onActiveIndexChange = vi.fn();
    const entries = items();
    const { rerender } = render(
      <MenuDock
        items={entries}
        defaultActiveIndex={1}
        activeIndex={0}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Projetos" }));
    expect(onActiveIndexChange.mock.calls).toEqual([[1]]);
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Projetos" })).not.toHaveAttribute("aria-current");
    rerender(
      <MenuDock items={entries} activeIndex={1} onActiveIndexChange={onActiveIndexChange} />
    );
    expect(screen.getByRole("button", { name: "Projetos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await user.click(screen.getByRole("button", { name: "Projetos" }));
    expect(onActiveIndexChange.mock.calls).toEqual([[1], [1]]);
  });

  it("índice controlado fora da lista não é reescrito e o consumidor pode selecionar o primeiro", async () => {
    const onActiveIndexChange = vi.fn();
    const entries = items();
    const { rerender } = render(
      <MenuDock items={entries} activeIndex={9} onActiveIndexChange={onActiveIndexChange} />
    );
    for (const button of screen.getAllByRole("button"))
      expect(button).not.toHaveAttribute("aria-current");
    await userEvent.click(screen.getByRole("button", { name: "Início" }));
    expect(onActiveIndexChange.mock.calls).toEqual([[0]]);
    expect(screen.getByRole("button", { name: "Início" })).not.toHaveAttribute("aria-current");
    rerender(
      <MenuDock items={entries} activeIndex={0} onActiveIndexChange={onActiveIndexChange} />
    );
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
  });

  it.each([
    -1, 2,
  ])("defaultActiveIndex=%i fora da lista retorna ao primeiro sem emitir callback", (defaultActiveIndex) => {
    const onActiveIndexChange = vi.fn();
    render(
      <MenuDock
        items={items()}
        defaultActiveIndex={defaultActiveIndex}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(onActiveIndexChange).not.toHaveBeenCalled();
  });

  it("encurtar items elimina a seleção inexistente; uma seleção ainda válida é preservada", async () => {
    const entries = [...items(), { id: "arquivos", label: "Arquivos", icon: Folder }];
    const { rerender } = render(<MenuDock items={entries} defaultActiveIndex={2} />);
    expect(screen.getByRole("button", { name: "Arquivos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    rerender(<MenuDock items={entries.slice(0, 2)} />);
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: "Projetos" }));
    rerender(<MenuDock items={entries} />);
    expect(screen.getByRole("button", { name: "Projetos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it.each([
    "Início",
    "Projetos",
  ])("dock floating desktop nomeia %s antes do hover e ativa por teclado com callback sem argumentos", async (label) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} animationType="floating" />);
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", label === "Início" ? "#inicio" : "#projetos");
    expect(screen.queryByText(label)).not.toBeInTheDocument();
    preventNavigation(link);
    const user = userEvent.setup();
    await user.tab();
    if (label === "Projetos") await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");
    expect((label === "Início" ? onHome : onProjects).mock.calls).toEqual([[]]);
    expect(label === "Início" ? onProjects : onHome).not.toHaveBeenCalled();
  });

  it.each([
    "{Enter}",
    " ",
  ])("dock floating mobile expande e recolhe por %s, com links nomeados e callback exato", async (key) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} animationType="floating" />);
    const { toggle, container } = mobileDock();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(container).queryAllByRole("link")).toHaveLength(0);
    const user = userEvent.setup();
    for (let index = 0; index < 3; index++) await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(key);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(container).getAllByRole("link")).toHaveLength(2);
    const home = within(container).getByRole("link", { name: "Início" });
    const projects = within(container).getByRole("link", { name: "Projetos" });
    expect(home).toHaveAttribute("href", "#inicio");
    expect(projects).toHaveAttribute("href", "#projetos");
    preventNavigation(projects);
    await user.tab({ shift: true });
    expect(projects).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onProjects.mock.calls).toEqual([[]]);
    expect(onHome).not.toHaveBeenCalled();
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(key);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(within(container).queryAllByRole("link")).toHaveLength(0));
    expect(onProjects.mock.calls).toEqual([[]]);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it.each([
    "Início",
    "Projetos",
  ])("hover em %s revela seu texto e sair o remove sem ativar navegação", async (label) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} animationType="floating" />);
    const link = screen.getByRole("link", { name: label });
    const user = userEvent.setup();
    const icone = link.firstElementChild as HTMLElement;
    await user.hover(icone);
    expect(screen.getByText(label)).toBeInTheDocument();
    await user.unhover(icone);
    await waitFor(() => expect(screen.queryByText(label)).not.toBeInTheDocument());
    expect(onHome).not.toHaveBeenCalled();
    expect(onProjects).not.toHaveBeenCalled();
  });

  it.each([
    false,
    true,
  ])("dock floating mobile aberto=%s não tem violações automáticas de acessibilidade", async (open) => {
    const { container } = render(<MenuDock items={items()} animationType="floating" />);
    if (open) await userEvent.click(screen.getByRole("button", { name: "Alternar menu" }));
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
