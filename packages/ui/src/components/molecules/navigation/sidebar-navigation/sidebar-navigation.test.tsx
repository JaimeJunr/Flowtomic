import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
