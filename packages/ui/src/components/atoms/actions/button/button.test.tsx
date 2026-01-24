import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  describe("Renderização", () => {
    it("deve renderizar o button com conteúdo", () => {
      render(<Button>Teste</Button>);
      expect(screen.getByRole("button", { name: "Teste" })).toBeInTheDocument();
    });

    it("deve renderizar como button", () => {
      const { container } = render(<Button>Teste</Button>);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("deve aplicar className customizada", () => {
      const { container } = render(<Button className="custom-class">Teste</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Variantes", () => {
    it("deve aplicar variante default", () => {
      const { container } = render(<Button variant="default">Default</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("deve aplicar variante destructive", () => {
      const { container } = render(<Button variant="destructive">Destructive</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("deve aplicar variante outline", () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("border");
    });

    it("deve aplicar variante secondary", () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-secondary");
    });

    it("deve aplicar variante ghost", () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("text-foreground");
    });

    it("deve aplicar variante link", () => {
      const { container } = render(<Button variant="link">Link</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("text-primary");
    });

    it("deve aplicar variante success", () => {
      const { container } = render(<Button variant="success">Success</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-success");
    });

    it("deve aplicar variante info", () => {
      const { container } = render(<Button variant="info">Info</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-accent");
    });

    it("deve aplicar variante natural", () => {
      const { container } = render(<Button variant="natural">Natural</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-background");
    });
  });

  describe("Tamanhos", () => {
    it("deve aplicar tamanho default", () => {
      const { container } = render(<Button size="default">Default</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("deve aplicar tamanho sm", () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-8", "px-3", "text-xs");
    });

    it("deve aplicar tamanho lg", () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-10", "px-8");
    });

    it("deve aplicar tamanho icon", () => {
      const { container } = render(<Button size="icon">Icon</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-9", "w-9");
    });

    it("deve aplicar tamanho icon-sm", () => {
      const { container } = render(<Button size="icon-sm">Icon Small</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("size-8");
    });

    it("deve aplicar tamanho icon-lg", () => {
      const { container } = render(<Button size="icon-lg">Icon Large</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("size-10");
    });
  });

  describe("Estado Disabled", () => {
    it("deve aplicar estado disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("deve aplicar classes de disabled", () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
    });
  });

  describe("Eventos", () => {
    it("deve chamar onClick quando clicado", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique</Button>);
      const button = screen.getByRole("button");
      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("não deve chamar onClick quando disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const button = screen.getByRole("button");
      await userEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Props HTML", () => {
    it("deve passar props HTML padrão", () => {
      render(
        <Button data-testid="button" aria-label="Test button" type="submit">
          Teste
        </Button>
      );
      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("aria-label", "Test button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("deve suportar ref", () => {
      let refValue: HTMLButtonElement | null = null;
      const ref = (node: HTMLButtonElement | null) => {
        refValue = node;
      };
      render(<Button ref={ref}>Teste</Button>);
      expect(refValue).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role button", () => {
      render(<Button>Teste</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("deve suportar aria-label", () => {
      render(<Button aria-label="Botão de teste">Teste</Button>);
      const button = screen.getByLabelText("Botão de teste");
      expect(button).toBeInTheDocument();
    });

    it("deve ser focável via teclado", async () => {
      render(<Button>Teste</Button>);
      const button = screen.getByRole("button");
      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it("deve acionar onClick com Enter", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Teste</Button>);
      const button = screen.getByRole("button");
      button.focus();
      await userEvent.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("deve acionar onClick com Espaço", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Teste</Button>);
      const button = screen.getByRole("button");
      button.focus();
      await userEvent.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Children", () => {
    it("deve renderizar texto como children", () => {
      render(<Button>Texto simples</Button>);
      expect(screen.getByText("Texto simples")).toBeInTheDocument();
    });

    it("deve renderizar elementos React como children", () => {
      render(
        <Button>
          <span data-testid="child">Elemento filho</span>
        </Button>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("Animated", () => {
    it("deve renderizar motion.button quando animated=true", () => {
      const { container } = render(<Button animated>Animado</Button>);
      // motion.button ainda renderiza como button no DOM
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });
});
