import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage (esqueleto de app)", () => {
  describe("Estado vazio que ensina o próximo passo", () => {
    it("diz onde fica o conteúdo e o comando para adicionar o primeiro componente", () => {
      render(<DashboardPage />);
      expect(
        screen.getByText("Página vazia, pronta para o primeiro componente")
      ).toBeInTheDocument();
      expect(screen.getByText("app/dashboard/page.tsx")).toBeInTheDocument();
      expect(screen.getByText("bunx flowtomic-cli add stat-card data-table")).toBeInTheDocument();
    });

    it("aceita o nome do app e o caminho da página de quem instalou", () => {
      render(<DashboardPage appName="Painel interno" pagePath="src/pages/home.tsx" />);
      expect(screen.getByText("Painel interno")).toBeInTheDocument();
      expect(screen.getByText("src/pages/home.tsx")).toBeInTheDocument();
    });
  });

  describe("Sem cara de template", () => {
    it("não traz os cards numerados de exemplo", () => {
      render(<DashboardPage />);
      expect(screen.queryByText(/Card 1/)).not.toBeInTheDocument();
      expect(screen.queryByText(/exemplo de card/)).not.toBeInTheDocument();
    });

    it("não tem botão competindo com o estado vazio", () => {
      render(<DashboardPage />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });
});
