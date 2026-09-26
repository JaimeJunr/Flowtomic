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
    it("usa os rótulos de grupo em português, não MENU/GENERAL", () => {
      renderSidebar();
      expect(screen.getByText("Navegação")).toBeInTheDocument();
      expect(screen.getByText("Geral")).toBeInTheDocument();
      expect(screen.queryByText("MENU")).not.toBeInTheDocument();
      expect(screen.queryByText("GENERAL")).not.toBeInTheDocument();
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
