import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

function Navegacao({ viewport }: { viewport?: boolean }) {
  return (
    <NavigationMenu viewport={viewport} aria-label="Principal">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/relatorios">Relatórios</NavigationMenuLink>
            <NavigationMenuLink href="/painel" active>
              Painel
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/precos" className={navigationMenuTriggerStyle()}>
            Preços
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("mostra os itens de primeiro nível e esconde o conteúdo do submenu", () => {
    render(<Navegacao />);
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Produtos" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("link", { name: "Preços" })).toHaveAttribute("href", "/precos");
    expect(screen.queryByRole("link", { name: "Relatórios" })).not.toBeInTheDocument();
  });

  it("clicar no gatilho abre o conteúdo e clicar de novo fecha", async () => {
    render(<Navegacao />);
    const gatilho = screen.getByRole("button", { name: "Produtos" });
    await userEvent.click(gatilho);
    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Relatórios" })).toHaveAttribute("href", "/relatorios");
    await userEvent.click(gatilho);
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
  });

  it("Esc fecha o conteúdo aberto", async () => {
    render(<Navegacao />);
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    expect(screen.getByRole("link", { name: "Relatórios" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("link", { name: "Relatórios" })).not.toBeInTheDocument();
  });

  it("Enter no gatilho focado abre o conteúdo pelo teclado", async () => {
    render(<Navegacao />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Produtos" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: "Relatórios" })).toBeInTheDocument();
  });

  it("marca como atual o link ativo", async () => {
    render(<Navegacao />);
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Relatórios" })).not.toHaveAttribute("aria-current");
  });

  it("com viewport ligado o conteúdo aberto vai para o viewport compartilhado", async () => {
    const { container } = render(<Navegacao />);
    expect(container.querySelector('[data-slot="navigation-menu"]')).toHaveAttribute(
      "data-viewport",
      "true"
    );
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    const viewport = container.querySelector('[data-slot="navigation-menu-viewport"]');
    expect(viewport).toContainElement(screen.getByRole("link", { name: "Relatórios" }));
  });

  it("com viewport desligado o conteúdo aparece sem o contêiner de viewport", async () => {
    const { container } = render(<Navegacao viewport={false} />);
    expect(container.querySelector('[data-slot="navigation-menu"]')).toHaveAttribute(
      "data-viewport",
      "false"
    );
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    expect(screen.getByRole("link", { name: "Relatórios" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="navigation-menu-viewport"]')).toBeNull();
  });

  it("navigationMenuTriggerStyle gera as classes do gatilho", () => {
    expect(navigationMenuTriggerStyle()).toContain("rounded-md");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Navegacao />);
    await userEvent.click(screen.getByRole("button", { name: "Produtos" }));
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
