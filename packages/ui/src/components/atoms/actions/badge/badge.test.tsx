import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
	describe("Renderização", () => {
		it("deve renderizar o badge com conteúdo", () => {
			render(<Badge>Teste</Badge>);
			expect(screen.getByText("Teste")).toBeInTheDocument();
		});

		it("deve renderizar como div", () => {
			const { container } = render(<Badge>Teste</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(<Badge className="custom-class">Teste</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("custom-class");
		});
	});

	describe("Variantes", () => {
		it("deve aplicar variante default", () => {
			const { container } = render(<Badge variant="default">Default</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-primary");
		});

		it("deve aplicar variante secondary", () => {
			const { container } = render(<Badge variant="secondary">Secondary</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-secondary");
		});

		it("deve aplicar variante destructive", () => {
			const { container } = render(<Badge variant="destructive">Destructive</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-destructive");
		});

		it("deve aplicar variante outline", () => {
			const { container } = render(<Badge variant="outline">Outline</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("text-foreground");
		});

		it("deve aplicar variante success", () => {
			const { container } = render(<Badge variant="success">Success</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-green-500");
		});

		it("deve aplicar variante warning", () => {
			const { container } = render(<Badge variant="warning">Warning</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-yellow-500");
		});

		it("deve aplicar variante info", () => {
			const { container } = render(<Badge variant="info">Info</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("bg-blue-500");
		});
	});

	describe("Tamanhos", () => {
		it("deve aplicar tamanho sm", () => {
			const { container } = render(<Badge size="sm">Small</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("px-2", "py-0.5", "text-xs");
		});

		it("deve aplicar tamanho md (padrão)", () => {
			const { container } = render(<Badge size="md">Medium</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("px-2.5", "py-0.5", "text-xs");
		});

		it("deve aplicar tamanho lg", () => {
			const { container } = render(<Badge size="lg">Large</Badge>);
			const badge = container.querySelector("div");
			expect(badge).toHaveClass("px-3", "py-1", "text-sm");
		});
	});

	describe("Props HTML", () => {
		it("deve passar props HTML padrão", () => {
			render(<Badge data-testid="badge" aria-label="Test badge">Teste</Badge>);
			const badge = screen.getByTestId("badge");
			expect(badge).toHaveAttribute("aria-label", "Test badge");
		});

		it("deve suportar ref", () => {
			let refValue: HTMLDivElement | null = null;
			const ref = (node: HTMLDivElement | null) => {
				refValue = node;
			};
			render(<Badge ref={ref}>Teste</Badge>);
			expect(refValue).toBeInstanceOf(HTMLDivElement);
		});
	});

	describe("Acessibilidade", () => {
		it("deve renderizar conteúdo acessível", () => {
			render(<Badge>Conteúdo Acessível</Badge>);
			expect(screen.getByText("Conteúdo Acessível")).toBeInTheDocument();
		});

		it("deve suportar aria-label", () => {
			render(<Badge aria-label="Badge de teste">Teste</Badge>);
			const badge = screen.getByLabelText("Badge de teste");
			expect(badge).toBeInTheDocument();
		});
	});

	describe("Children", () => {
		it("deve renderizar texto como children", () => {
			render(<Badge>Texto simples</Badge>);
			expect(screen.getByText("Texto simples")).toBeInTheDocument();
		});

		it("deve renderizar elementos React como children", () => {
			render(
				<Badge>
					<span data-testid="child">Elemento filho</span>
				</Badge>
			);
			expect(screen.getByTestId("child")).toBeInTheDocument();
		});
	});
});

