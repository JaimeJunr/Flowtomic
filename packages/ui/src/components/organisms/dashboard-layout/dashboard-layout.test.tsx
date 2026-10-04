import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { DashboardLayout } from "./dashboard-layout";

describe("DashboardLayout", () => {
  describe("Cabeçalho da página", () => {
    it("mostra título como heading de nível 1 e o subtítulo abaixo", () => {
      render(
        <DashboardLayout title="Carteiras" subtitle="Resumo do mês">
          <p>conteúdo</p>
        </DashboardLayout>
      );
      expect(screen.getByRole("heading", { level: 1, name: "Carteiras" })).toBeInTheDocument();
      expect(screen.getByText("Resumo do mês")).toBeInTheDocument();
    });

    it("renderiza as ações do cabeçalho ao lado do título", () => {
      render(
        <DashboardLayout title="Carteiras" actions={<button type="button">Exportar</button>}>
          <p>conteúdo</p>
        </DashboardLayout>
      );
      expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
    });

    it("com só o subtítulo, não cria heading", () => {
      render(
        <DashboardLayout subtitle="Só subtítulo">
          <p>conteúdo</p>
        </DashboardLayout>
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.getByText("Só subtítulo")).toBeInTheDocument();
    });

    it("com só as ações, mostra as ações sem título nem subtítulo", () => {
      render(
        <DashboardLayout actions={<button type="button">Novo</button>}>
          <p>conteúdo</p>
        </DashboardLayout>
      );
      expect(screen.getByRole("button", { name: "Novo" })).toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("sem título, subtítulo e ações, não renderiza cabeçalho algum", () => {
      render(
        <DashboardLayout>
          <p>só conteúdo</p>
        </DashboardLayout>
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.getByText("só conteúdo")).toBeInTheDocument();
    });
  });

  describe("Conteúdo e largura", () => {
    it("renderiza os filhos dentro do layout", () => {
      render(
        <DashboardLayout title="Painel">
          <section aria-label="Gráficos">gráficos</section>
        </DashboardLayout>
      );
      expect(screen.getByRole("region", { name: "Gráficos" })).toBeInTheDocument();
    });

    it("usa largura máxima 7xl por padrão", () => {
      render(
        <DashboardLayout>
          <p data-testid="filho">x</p>
        </DashboardLayout>
      );
      expect(screen.getByTestId("filho").parentElement).toHaveClass("max-w-7xl");
    });

    it.each([
      ["sm", "max-w-sm"],
      ["md", "max-w-md"],
      ["lg", "max-w-lg"],
      ["xl", "max-w-xl"],
      ["2xl", "max-w-2xl"],
      ["full", "max-w-full"],
    ] as const)("maxWidth=%s aplica a largura %s", (maxWidth, classe) => {
      render(
        <DashboardLayout maxWidth={maxWidth}>
          <p data-testid="filho">x</p>
        </DashboardLayout>
      );
      expect(screen.getByTestId("filho").parentElement).toHaveClass(classe);
    });

    it("className customizada vai para o container de padding, junto do padrão", () => {
      render(
        <DashboardLayout className="bg-muted">
          <p data-testid="filho">x</p>
        </DashboardLayout>
      );
      const container = screen.getByTestId("filho").parentElement?.parentElement;
      expect(container).toHaveClass("bg-muted", "p-6");
    });
  });

  describe("Ref e props repassadas", () => {
    it("encaminha a ref para o elemento raiz", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <DashboardLayout ref={ref}>
          <p>x</p>
        </DashboardLayout>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass("h-full", "w-full");
    });
  });
});
