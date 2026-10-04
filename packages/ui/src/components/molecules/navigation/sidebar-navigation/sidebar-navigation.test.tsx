import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "../../../atoms/layout";
import { SidebarNavigation } from "./sidebar-navigation";

function renderSidebar(props: Parameters<typeof SidebarNavigation>[0] = {}) {
  return render(
    <SidebarProvider>
      <SidebarNavigation {...props} />
    </SidebarProvider>
  );
}

describe("SidebarNavigation", () => {
  describe("Copy em português, sem template em inglês", () => {
    it("não põe rótulo de grupo em cima dos menus (Navegação, Geral, MENU, GENERAL)", () => {
      renderSidebar();
      for (const label of ["Navegação", "Geral", "MENU", "GENERAL"]) {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
    });

    it("usa itens de menu padrão em português quando nenhum é passado", () => {
      renderSidebar();
      expect(screen.getByText("Início")).toBeInTheDocument();
      expect(screen.getByText("Tarefas")).toBeInTheDocument();
      expect(screen.getByText("Calendário")).toBeInTheDocument();
      expect(screen.getByText("Relatórios")).toBeInTheDocument();
      expect(screen.getByText("Equipe")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Tasks")).not.toBeInTheDocument();
    });

    it("usa itens gerais padrão em português quando nenhum é passado", () => {
      renderSidebar();
      expect(screen.getByText("Configurações")).toBeInTheDocument();
      expect(screen.getByText("Ajuda")).toBeInTheDocument();
      expect(screen.getByText("Sair")).toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
  });

  describe("Identidade e navegação", () => {
    it("sem logo, mostra só o nome do app, sem ícone de logo inventado", () => {
      renderSidebar();
      const name = screen.getByText("Flowtomic");
      expect(name.parentElement?.querySelector("svg")).toBeNull();
    });

    it("os dois menus são navegações com nome, e o item ativo é a página atual", () => {
      renderSidebar();
      expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Conta" })).toBeInTheDocument();
      expect(screen.getByText("Início").closest("button")).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("Tarefas").closest("button")).not.toHaveAttribute("aria-current");
    });
  });

  describe("mobileAppCard (deprecated)", () => {
    it("continua renderizando o card quando passado, com o texto padrão em português", () => {
      renderSidebar({ mobileAppCard: { title: "Baixe o app" } });
      expect(screen.getByText("Baixe o app")).toBeInTheDocument();
      expect(screen.getByText("Baixar app")).toBeInTheDocument();
      expect(screen.queryByText("Download our Mobile App")).not.toBeInTheDocument();
    });

    it("não renderiza nenhum card quando a prop não é passada", () => {
      renderSidebar();
      expect(screen.queryByText("Baixar app")).not.toBeInTheDocument();
    });
  });
});

describe("SidebarNavigation: itens personalizados e interação", () => {
  it("usa o logo passado no lugar do nome do app", () => {
    renderSidebar({ logo: <img src="/logo.svg" alt="Logo da Acme" /> });
    expect(screen.getByRole("img", { name: "Logo da Acme" })).toBeInTheDocument();
    expect(screen.queryByText("Flowtomic")).not.toBeInTheDocument();
  });

  it("mostra o nome do app informado quando não há logo", () => {
    renderSidebar({ appName: "Acme" });
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("os itens passados substituem os padrões nos dois menus", () => {
    renderSidebar({
      menuItems: [{ id: "a", label: "Carteiras" }],
      generalItems: [{ id: "b", label: "Perfil" }],
    });
    expect(screen.getByRole("button", { name: "Carteiras" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.queryByText("Início")).not.toBeInTheDocument();
    expect(screen.queryByText("Sair")).not.toBeInTheDocument();
  });

  it("clicar num item chama onNavigate com o item e depois o onClick dele", async () => {
    const ordem: string[] = [];
    const onNavigate = vi.fn(() => ordem.push("navigate"));
    const onClick = vi.fn(() => ordem.push("click"));
    const item = { id: "a", label: "Carteiras", onClick };
    renderSidebar({ menuItems: [item], onNavigate });

    await userEvent.click(screen.getByRole("button", { name: "Carteiras" }));

    expect(onNavigate).toHaveBeenCalledWith(item);
    expect(ordem).toEqual(["navigate", "click"]);
  });

  it("clicar num item da conta também notifica onNavigate", async () => {
    const onNavigate = vi.fn();
    renderSidebar({ onNavigate });
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "logout" }));
  });

  it("clicar num item sem onNavigate nem onClick não quebra", async () => {
    renderSidebar({ menuItems: [{ id: "a", label: "Carteiras" }] });
    await userEvent.click(screen.getByRole("button", { name: "Carteiras" }));
    expect(screen.getByRole("button", { name: "Carteiras" })).toBeInTheDocument();
  });

  it("item com href vira link, com a página atual marcada, nos dois menus", () => {
    renderSidebar({
      menuItems: [{ id: "a", label: "Carteiras", href: "/carteiras", active: true }],
      generalItems: [{ id: "b", label: "Perfil", href: "/perfil", active: true }],
    });
    expect(screen.getByRole("link", { name: "Carteiras" })).toHaveAttribute("href", "/carteiras");
    expect(screen.getByRole("link", { name: "Carteiras" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("aria-current", "page");
  });

  it("o item pode ser acionado pelo teclado", async () => {
    const onClick = vi.fn();
    renderSidebar({ menuItems: [{ id: "a", label: "Carteiras", onClick }] });
    screen.getByRole("button", { name: "Carteiras" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("o card mobile mostra descrição e texto do botão informados e dispara o download", async () => {
    const onDownload = vi.fn();
    renderSidebar({
      mobileAppCard: {
        title: "Baixe o app",
        description: "Leve seus painéis no bolso",
        buttonText: "Instalar",
        onDownload,
      },
    });
    expect(screen.getByText("Leve seus painéis no bolso")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Instalar" }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = renderSidebar({
      menuItems: [
        { id: "a", label: "Carteiras", href: "/carteiras", active: true },
        { id: "b", label: "Relatórios" },
      ],
    });
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
