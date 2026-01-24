import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
	describe("Renderização", () => {
		it("deve renderizar o checkbox", () => {
			render(<Checkbox />);
			expect(screen.getByRole("checkbox")).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(<Checkbox className="custom-class" />);
			const checkbox = container.querySelector('[role="checkbox"]');
			expect(checkbox).toHaveClass("custom-class");
		});
	});

	describe("Estados", () => {
		it("deve iniciar desmarcado por padrão", () => {
			render(<Checkbox />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
		});

		it("deve iniciar marcado quando defaultChecked=true", () => {
			render(<Checkbox defaultChecked />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();
		});

		it("deve ser controlado quando checked é fornecido", () => {
			render(<Checkbox checked={true} />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();
		});

		it("deve estar desabilitado quando disabled=true", () => {
			render(<Checkbox disabled />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeDisabled();
		});
	});

	describe("Interação", () => {
		it("deve chamar onCheckedChange quando clicado", async () => {
			const handleChange = vi.fn();
			render(<Checkbox onCheckedChange={handleChange} />);
			const checkbox = screen.getByRole("checkbox");
			await userEvent.click(checkbox);
			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it("não deve chamar onCheckedChange quando disabled", async () => {
			const handleChange = vi.fn();
			render(<Checkbox disabled onCheckedChange={handleChange} />);
			const checkbox = screen.getByRole("checkbox");
			await userEvent.click(checkbox);
			expect(handleChange).not.toHaveBeenCalled();
		});

		it("deve alternar estado quando clicado", async () => {
			render(<Checkbox />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
			await userEvent.click(checkbox);
			expect(checkbox).toBeChecked();
			await userEvent.click(checkbox);
			expect(checkbox).not.toBeChecked();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter role checkbox", () => {
			render(<Checkbox />);
			expect(screen.getByRole("checkbox")).toBeInTheDocument();
		});

		it("deve ser focável via teclado", async () => {
			render(<Checkbox />);
			const checkbox = screen.getByRole("checkbox");
			await userEvent.tab();
			expect(checkbox).toHaveFocus();
		});

		it("deve acionar onCheckedChange com Espaço", async () => {
			const handleChange = vi.fn();
			render(<Checkbox onCheckedChange={handleChange} />);
			const checkbox = screen.getByRole("checkbox");
			checkbox.focus();
			await userEvent.keyboard(" ");
			expect(handleChange).toHaveBeenCalledTimes(1);
		});
	});

	describe("Props HTML", () => {
		it("deve passar props HTML padrão", () => {
			render(<Checkbox data-testid="checkbox" aria-label="Test checkbox" />);
			const checkbox = screen.getByTestId("checkbox");
			expect(checkbox).toHaveAttribute("aria-label", "Test checkbox");
		});

		it("deve suportar ref", () => {
			let refValue: HTMLButtonElement | null = null;
			const ref = (node: HTMLButtonElement | null) => {
				refValue = node;
			};
			render(<Checkbox ref={ref} />);
			expect(refValue).toBeInstanceOf(HTMLButtonElement);
		});
	});
});

