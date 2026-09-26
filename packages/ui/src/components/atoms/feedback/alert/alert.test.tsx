import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  describe("Texto legível no fundo tingido", () => {
    // O *-foreground é a cor de texto em cima do fundo sólido (branco no claro); no fundo
    // tingido de 10% o texto precisa da própria cor do tom.
    it.each(["destructive", "success"] as const)("%s escreve com a cor do tom", (variant) => {
      render(<Alert variant={variant}>Falhou</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass(`text-${variant}`);
      expect(alert).not.toHaveClass(`text-${variant}-foreground`);
    });
  });

  describe("Renderização", () => {
    it("deve renderizar o Alert", () => {
      render(
        <Alert>
          <AlertTitle>Título</AlertTitle>
          <AlertDescription>Descrição</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("deve renderizar AlertTitle", () => {
      render(
        <Alert>
          <AlertTitle>Título do Alert</AlertTitle>
        </Alert>
      );
      const title = screen.getByText("Título do Alert");
      expect(title).toBeInTheDocument();
    });

    it("deve renderizar AlertDescription", () => {
      render(
        <Alert>
          <AlertDescription>Descrição do alert</AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Descrição do alert");
      expect(description).toBeInTheDocument();
    });

    it("deve aplicar className customizada", () => {
      const { container } = render(
        <Alert className="custom-class">
          <AlertDescription>Teste</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass("custom-class");
    });
  });

  describe("Variantes", () => {
    it("deve aplicar variante default", () => {
      const { container } = render(
        <Alert variant="default">
          <AlertDescription>Teste</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("deve aplicar variante destructive", () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertDescription>Erro</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("deve aplicar variante success", () => {
      const { container } = render(
        <Alert variant="success">
          <AlertDescription>Sucesso</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("deve aplicar variante warning", () => {
      const { container } = render(
        <Alert variant="warning">
          <AlertDescription>Aviso</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("deve aplicar variante info", () => {
      const { container } = render(
        <Alert variant="info">
          <AlertDescription>Informação</AlertDescription>
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Composição", () => {
    it("deve renderizar com título e descrição", () => {
      render(
        <Alert>
          <AlertTitle>Título</AlertTitle>
          <AlertDescription>Descrição</AlertDescription>
        </Alert>
      );
      const title = screen.getByText("Título");
      const description = screen.getByText("Descrição");
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it("deve renderizar apenas com descrição", () => {
      render(
        <Alert>
          <AlertDescription>Descrição sem título</AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Descrição sem título");
      expect(description).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role alert", () => {
      render(
        <Alert>
          <AlertDescription>Teste</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });
});
