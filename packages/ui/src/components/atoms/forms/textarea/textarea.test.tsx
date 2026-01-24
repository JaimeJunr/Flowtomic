import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  describe("Renderização", () => {
    it("deve renderizar o textarea", () => {
      render(<Textarea placeholder="Digite aqui" />);
      expect(screen.getByPlaceholderText("Digite aqui")).toBeInTheDocument();
    });

    it("deve renderizar como textarea", () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
    });

    it("deve aplicar className customizada", () => {
      const { container } = render(<Textarea className="custom-class" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("custom-class");
    });
  });

  describe("Props HTML", () => {
    it("deve passar props HTML padrão", () => {
      render(<Textarea rows={5} cols={30} placeholder="Mensagem" />);
      const textarea = screen.getByPlaceholderText("Mensagem");
      expect(textarea).toHaveAttribute("rows", "5");
      expect(textarea).toHaveAttribute("cols", "30");
    });

    it("deve suportar ref", () => {
      let refValue: HTMLTextAreaElement | null = null;
      const ref = (node: HTMLTextAreaElement | null) => {
        refValue = node;
      };
      render(<Textarea ref={ref} />);
      expect(refValue).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe("Acessibilidade", () => {
    it("deve suportar aria-invalid", () => {
      render(<Textarea aria-invalid="true" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("deve suportar aria-describedby", () => {
      render(<Textarea aria-describedby="error-message" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "error-message");
    });

    it("deve ser focável via teclado", async () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      await userEvent.tab();
      expect(textarea).toHaveFocus();
    });
  });

  describe("Interação", () => {
    it("deve permitir digitação", async () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Texto digitado");
      expect(textarea).toHaveValue("Texto digitado");
    });

    it("não deve permitir digitação quando disabled", async () => {
      render(<Textarea disabled defaultValue="Valor inicial" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
      await userEvent.type(textarea, "Novo texto");
      expect(textarea).toHaveValue("Valor inicial");
    });
  });
});
