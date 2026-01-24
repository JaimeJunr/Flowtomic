import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
	describe("Renderização", () => {
		it("deve renderizar o input", () => {
			render(<Input placeholder="Digite aqui" />);
			expect(screen.getByPlaceholderText("Digite aqui")).toBeInTheDocument();
		});

		it("deve renderizar como input", () => {
			const { container } = render(<Input />);
			const input = container.querySelector("input");
			expect(input).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(<Input className="custom-class" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("custom-class");
		});
	});

	describe("Label", () => {
		it("deve renderizar label quando fornecido", () => {
			render(<Input label="Nome" />);
			expect(screen.getByText("Nome")).toBeInTheDocument();
		});

		it("deve associar label ao input via htmlFor/id", () => {
			render(<Input label="Email" id="email-input" />);
			const label = screen.getByText("Email");
			const input = screen.getByLabelText("Email");
			expect(label).toHaveAttribute("for", "email-input");
			expect(input).toHaveAttribute("id", "email-input");
		});

		it("deve gerar id automaticamente quando não fornecido", () => {
			render(<Input label="Email" />);
			const label = screen.getByText("Email");
			const input = screen.getByLabelText("Email");
			const labelFor = label.getAttribute("for");
			expect(input).toHaveAttribute("id", labelFor);
		});
	});

	describe("Variantes", () => {
		it("deve aplicar variante default", () => {
			const { container } = render(<Input variant="default" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("border-input");
		});

		it("deve aplicar variante error", () => {
			const { container } = render(<Input variant="error" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("border-destructive");
		});

		it("deve aplicar variante success", () => {
			const { container } = render(<Input variant="success" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("border-green-500");
		});
	});

	describe("Tamanhos", () => {
		it("deve aplicar tamanho default", () => {
			const { container } = render(<Input size="default" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("h-10");
		});

		it("deve aplicar tamanho sm", () => {
			const { container } = render(<Input size="sm" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("h-9");
		});

		it("deve aplicar tamanho lg", () => {
			const { container } = render(<Input size="lg" />);
			const input = container.querySelector("input");
			expect(input).toHaveClass("h-11");
		});
	});

	describe("Mensagens", () => {
		it("deve exibir mensagem de erro quando fornecido", () => {
			render(<Input error="Campo obrigatório" />);
			expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
		});

		it("deve exibir texto de ajuda quando fornecido e não há erro", () => {
			render(<Input helperText="Texto de ajuda" />);
			expect(screen.getByText("Texto de ajuda")).toBeInTheDocument();
		});

		it("não deve exibir texto de ajuda quando há erro", () => {
			render(<Input error="Erro" helperText="Ajuda" />);
			expect(screen.getByText("Erro")).toBeInTheDocument();
			expect(screen.queryByText("Ajuda")).not.toBeInTheDocument();
		});
	});

	describe("Props HTML", () => {
		it("deve passar props HTML padrão", () => {
			render(<Input type="email" placeholder="Email" required />);
			const input = screen.getByPlaceholderText("Email");
			expect(input).toHaveAttribute("type", "email");
			expect(input).toBeRequired();
		});

		it("deve suportar ref", () => {
			let refValue: HTMLInputElement | null = null;
			const ref = (node: HTMLInputElement | null) => {
				refValue = node;
			};
			render(<Input ref={ref} />);
			expect(refValue).toBeInstanceOf(HTMLInputElement);
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter label associado", () => {
			render(<Input label="Nome" />);
			const input = screen.getByLabelText("Nome");
			expect(input).toBeInTheDocument();
		});

		it("deve ser focável via teclado", async () => {
			render(<Input />);
			const input = screen.getByRole("textbox");
			await userEvent.tab();
			expect(input).toHaveFocus();
		});
	});

	describe("Interação", () => {
		it("deve permitir digitação", async () => {
			render(<Input />);
			const input = screen.getByRole("textbox");
			await userEvent.type(input, "Texto digitado");
			expect(input).toHaveValue("Texto digitado");
		});

		it("não deve permitir digitação quando disabled", async () => {
			render(<Input disabled defaultValue="Valor inicial" />);
			const input = screen.getByRole("textbox");
			expect(input).toBeDisabled();
			await userEvent.type(input, "Novo texto");
			expect(input).toHaveValue("Valor inicial");
		});
	});
});

