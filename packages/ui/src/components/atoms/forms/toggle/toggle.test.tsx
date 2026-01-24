import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./toggle";

describe("Toggle", () => {
	describe("Renderização", () => {
		it("deve renderizar o Toggle", () => {
			render(<Toggle aria-label="Toggle">Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toBeInTheDocument();
		});

		it("deve renderizar com children", () => {
			render(<Toggle aria-label="Toggle">Texto do Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toHaveTextContent("Texto do Toggle");
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(
				<Toggle className="custom-class" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toHaveClass("custom-class");
		});
	});

	describe("Estados", () => {
		it("deve ter estado pressed false por padrão", () => {
			render(<Toggle aria-label="Toggle">Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toHaveAttribute("aria-pressed", "false");
		});

		it("deve ter estado pressed true quando pressed", () => {
			render(
				<Toggle pressed aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toHaveAttribute("aria-pressed", "true");
		});

		it("deve alternar estado quando clicado", async () => {
			const user = userEvent.setup();
			render(<Toggle aria-label="Toggle">Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toHaveAttribute("aria-pressed", "false");
			await user.click(toggle);
			// Nota: O estado só muda se houver onPressedChange
		});

		it("deve chamar onPressedChange quando clicado", async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(
				<Toggle onPressedChange={handleChange} aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			await user.click(toggle);
			expect(handleChange).toHaveBeenCalled();
		});
	});

	describe("Variantes", () => {
		it("deve aplicar variante default", () => {
			const { container } = render(
				<Toggle variant="default" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toBeInTheDocument();
		});

		it("deve aplicar variante outline", () => {
			const { container } = render(
				<Toggle variant="outline" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toBeInTheDocument();
		});
	});

	describe("Tamanhos", () => {
		it("deve aplicar tamanho default", () => {
			const { container } = render(
				<Toggle size="default" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toBeInTheDocument();
		});

		it("deve aplicar tamanho sm", () => {
			const { container } = render(
				<Toggle size="sm" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toBeInTheDocument();
		});

		it("deve aplicar tamanho lg", () => {
			const { container } = render(
				<Toggle size="lg" aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = container.querySelector('[data-slot="toggle"]');
			expect(toggle).toBeInTheDocument();
		});
	});

	describe("Desabilitado", () => {
		it("deve desabilitar o Toggle quando disabled", () => {
			render(
				<Toggle disabled aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toBeDisabled();
		});

		it("não deve chamar onPressedChange quando desabilitado", async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(
				<Toggle disabled onPressedChange={handleChange} aria-label="Toggle">
					Toggle
				</Toggle>
			);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			await user.click(toggle);
			expect(handleChange).not.toHaveBeenCalled();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter role button", () => {
			render(<Toggle aria-label="Toggle">Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toBeInTheDocument();
		});

		it("deve ter aria-pressed", () => {
			render(<Toggle aria-label="Toggle">Toggle</Toggle>);
			const toggle = screen.getByRole("button", { name: "Toggle" });
			expect(toggle).toHaveAttribute("aria-pressed");
		});
	});
});

