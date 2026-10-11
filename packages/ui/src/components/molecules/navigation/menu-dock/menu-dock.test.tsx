import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Folder, Home } from "lucide-react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MenuDock, type MenuDockItem } from "./menu-dock";

function items(onHome = vi.fn(), onProjects = vi.fn()): MenuDockItem[] {
  return [
    { id: "inicio", label: "Início", icon: Home, href: "#inicio", onClick: onHome },
    { id: "projetos", label: "Projetos", icon: Folder, href: "#projetos", onClick: onProjects },
  ];
}

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
  it("raiz é uma navegação com data-slot, className e ref, sem posicionamento embutido", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<MenuDock ref={ref} items={items()} className="minha-classe" />);
    const root = container.querySelector('[data-slot="menu-dock"]') as HTMLElement;
    expect(root).toBe(ref.current);
    expect(root.tagName).toBe("NAV");
    expect(root).toHaveAttribute("aria-label", "Dock de navegação");
    expect(root).toHaveClass("minha-classe");
    expect(root.className).not.toMatch(/\b(fixed|absolute)\b/);
  });

  it.each([
    "Início",
    "Projetos",
  ])("desktop nomeia %s antes do hover e ativa por teclado com callback sem argumentos", async (label) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} />);
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

  it("item sem href vira botão e chama onClick", async () => {
    const onClick = vi.fn();
    render(<MenuDock items={[{ label: "Sair", icon: Home, onClick }]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onClick.mock.calls).toEqual([[]]);
  });

  it.each([
    "{Enter}",
    " ",
  ])("mobile expande e recolhe por %s, com links nomeados e callback exato", async (key) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} />);
    const { toggle, container } = mobileDock();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(container).queryAllByRole("link")).toHaveLength(0);
    const user = userEvent.setup();
    for (let index = 0; index < 3; index++) await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(key);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(container).getAllByRole("link")).toHaveLength(2);
    const projects = within(container).getByRole("link", { name: "Projetos" });
    expect(within(container).getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "#inicio"
    );
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
  });

  it("usa classes responsivas: desktop some abaixo de md e mobile some a partir dele", () => {
    const { container } = render(<MenuDock items={items()} />);
    expect(container.querySelector('[data-slot="menu-dock-desktop"]')).toHaveClass(
      "hidden",
      "md:flex"
    );
    expect(container.querySelector('[data-slot="menu-dock-mobile"]')).toHaveClass(
      "block",
      "md:hidden"
    );
  });

  it("desktopClassName e mobileClassName vão cada um para o seu lado", () => {
    const { container } = render(
      <MenuDock items={items()} desktopClassName="so-desktop" mobileClassName="so-mobile" />
    );
    expect(container.querySelector('[data-slot="menu-dock-desktop"]')).toHaveClass("so-desktop");
    expect(container.querySelector('[data-slot="menu-dock-mobile"]')).toHaveClass("so-mobile");
  });

  it.each([
    "Início",
    "Projetos",
  ])("hover em %s revela seu texto e sair o remove sem ativar navegação", async (label) => {
    const onHome = vi.fn();
    const onProjects = vi.fn();
    render(<MenuDock items={items(onHome, onProjects)} />);
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

  it("o foco por teclado também revela o rótulo e o blur o remove", async () => {
    render(<MenuDock items={items()} />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByText("Início")).toBeInTheDocument();
    await user.tab();
    await waitFor(() => expect(screen.queryByText("Início")).not.toBeInTheDocument());
  });

  it.each([
    false,
    true,
  ])("mobile aberto=%s não tem violações automáticas de acessibilidade", async (open) => {
    const { container } = render(<MenuDock items={items()} />);
    if (open) await userEvent.click(screen.getByRole("button", { name: "Alternar menu" }));
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("itemSize inválido lança erro com o valor recebido", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MenuDock items={items()} itemSize={0} />)).toThrow(/received 0/);
    spy.mockRestore();
  });
});

describe("MenuDock com lupa configurável", () => {
  const baseSize = (label: string) =>
    (screen.getByRole("link", { name: label }).firstElementChild as HTMLElement).style.width;

  it("sem props o item longe do ponteiro tem 40px", () => {
    render(<MenuDock items={items()} />);
    expect(baseSize("Início")).toBe("40px");
  });

  it("itemSize muda o tamanho base e a altura da barra acompanha", () => {
    const { container } = render(<MenuDock items={items()} itemSize={56} />);
    expect(baseSize("Início")).toBe("56px");
    expect(container.querySelector('[data-slot="menu-dock-desktop"]')).toHaveStyle({
      height: "80px",
    });
  });

  it("com movimento reduzido o item fica fixo em itemSize, mesmo com foco", async () => {
    render(
      <MotionConfig reducedMotion="always">
        <MenuDock items={items()} itemSize={48} />
      </MotionConfig>
    );
    const link = screen.getByRole("link", { name: "Início" });
    preventNavigation(link);
    await userEvent.setup().tab();
    expect(link).toHaveFocus();
    expect(baseSize("Início")).toBe("48px");
  });

  it("o foco por teclado amplia o item ao tamanho máximo e o blur devolve ao base", async () => {
    render(<MenuDock items={items()} magnification={90} />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("link", { name: "Início" })).toHaveFocus();
    await waitFor(() => expect(baseSize("Início")).toBe("90px"));
    expect(baseSize("Projetos")).toBe("40px");

    await user.tab();
    await waitFor(() => expect(baseSize("Início")).toBe("40px"));
  });

  it("sair do dock com o mouse devolve todos ao tamanho base", () => {
    const { container } = render(<MenuDock items={items()} />);
    const desktop = container.querySelector('[data-slot="menu-dock-desktop"]') as HTMLElement;
    fireEvent.mouseMove(desktop, { clientX: 10 });
    fireEvent.mouseLeave(desktop);
    expect(baseSize("Início")).toBe("40px");
    expect(baseSize("Projetos")).toBe("40px");
  });
});

describe("MenuDock: aliases deprecados", () => {
  it("path vira href e href ganha de path", () => {
    render(
      <MenuDock
        items={[
          { label: "Antigo", icon: Home, path: "#antigo" },
          { label: "Novo", icon: Folder, href: "#novo", path: "#ignorado" },
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Antigo" })).toHaveAttribute("href", "#antigo");
    expect(screen.getByRole("link", { name: "Novo" })).toHaveAttribute("href", "#novo");
  });

  it("dockItemSize acompanha a altura da barra", () => {
    const { container } = render(<MenuDock items={items()} dockItemSize={56} />);
    expect(container.querySelector('[data-slot="menu-dock-desktop"]')).toHaveStyle({
      height: "80px",
    });
  });

  it("o nome novo ganha do alias quando vêm os dois", () => {
    const { container } = render(<MenuDock items={items()} itemSize={56} dockItemSize={100} />);
    expect(container.querySelector('[data-slot="menu-dock-desktop"]')).toHaveStyle({
      height: "80px",
    });
  });

  it("dockMagnification e dockMagnifyDistance inválidos chegam à validação", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MenuDock items={items()} dockMagnification={10} />)).toThrow(
      /invalid magnification/
    );
    expect(() => render(<MenuDock items={items()} dockMagnifyDistance={0} />)).toThrow(
      /invalid magnifyDistance/
    );
    spy.mockRestore();
  });

  it("animationType floating não tem efeito nem vaza para o DOM", () => {
    const { container } = render(<MenuDock items={items()} animationType="floating" />);
    expect(container.querySelector('[data-slot="menu-dock"]')).not.toHaveAttribute("animationtype");
  });
});
