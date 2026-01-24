import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
	describe("Renderização", () => {
		it("deve renderizar o switch", () => {
			render(<Switch />);
			expect(screen.getByRole("switch")).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(<Switch className="custom-class" />);
			const switchElement = container.querySelector('[role="switch"]');
			expect(switchElement).toHaveClass("custom-class");
		});
	});

	describe("Estados", () => {
		it("deve iniciar desligado por padrão", () => {
			render(<Switch />);
			const switchElement = screen.getByRole("switch");
			expect(switchElement).not.toBeChecked();
		});

		it("deve iniciar ligado quando defaultChecked=true", () => {
			render(<Switch defaultChecked />);
			const switchElement = screen.getByRole("switch");
			expect(switchElement).toBeChecked();
		});

		it("deve ser controlado quando checked é fornecido", () => {
			render(<Switch checked={true} />);
			const switchElement = screen.getByRole("switch");
			expect(switchElement).toBeChecked();
		});

		it("deve estar desabilitado quando disabled=true", () => {
			render(<Switch disabled />);
			const switchElement = screen.getByRole("switch");
			expect(switchElement).toBeDisabled();
		});
	});

	describe("Interação", () => {
		it("deve chamar onCheckedChange quando clicado", async () => {
			const handleChange = vi.fn();
			render(<Switch onCheckedChange={handleChange} />);
			const switchElement = screen.getByRole("switch");
			await userEvent.click(switchElement);
			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it("não deve chamar onCheckedChange quando disabled", async () => {
			const handleChange = vi.fn();
			render(<Switch disabled onCheckedChange={handleChange} />);
			const switchElement = screen.getByRole("switch");
			await userEvent.click(switchElement);
			expect(handleChange).not.toHaveBeenCalled();
		});

		it("deve alternar estado quando clicado", async () => {
			render(<Switch />);
			const switchElement = screen.getByRole("switch");
			expect(switchElement).not.toBeChecked();
			await userEvent.click(switchElement);
			expect(switchElement).toBeChecked();
			await userEvent.click(switchElement);
			expect(switchElement).not.toBeChecked();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter role switch", () => {
			render(<Switch />);
			expect(screen.getByRole("switch")).toBeInTheDocument();
		});

		it("deve ser focável via teclado", async () => {
			render(<Switch />);
			const switchElement = screen.getByRole("switch");
			await userEvent.tab();
			expect(switchElement).toHaveFocus();
		});

		it("deve acionar onCheckedChange com Espaço", async () => {
			const handleChange = vi.fn();
			render(<Switch onCheckedChange={handleChange} />);
			const switchElement = screen.getByRole("switch");
			switchElement.focus();
			await userEvent.keyboard(" ");
			expect(handleChange).toHaveBeenCalledTimes(1);
		});
	});
});

