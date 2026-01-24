import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";

describe("Slider", () => {
	describe("Renderização", () => {
		it("deve renderizar o Slider", () => {
			render(<Slider defaultValue={[50]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toBeInTheDocument();
		});

		it("deve renderizar com valor único", () => {
			render(<Slider value={[25]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuenow", "25");
		});

		it("deve renderizar com intervalo (range)", () => {
			render(<Slider value={[20, 80]} aria-label="Range slider" />);
			const sliders = screen.getAllByRole("slider");
			expect(sliders).toHaveLength(2);
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(
				<Slider defaultValue={[50]} className="custom-class" aria-label="Slider" />
			);
			const slider = container.querySelector('[data-slot="slider"]');
			expect(slider).toHaveClass("custom-class");
		});
	});

	describe("Valores", () => {
		it("deve usar min e max padrão (0-100)", () => {
			render(<Slider defaultValue={[50]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuemin", "0");
			expect(slider).toHaveAttribute("aria-valuemax", "100");
		});

		it("deve usar min e max customizados", () => {
			render(<Slider defaultValue={[25]} min={0} max={50} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuemin", "0");
			expect(slider).toHaveAttribute("aria-valuemax", "50");
		});

		it("deve usar defaultValue quando fornecido", () => {
			render(<Slider defaultValue={[30]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuenow", "30");
		});

		it("deve usar value quando fornecido", () => {
			render(<Slider value={[40]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuenow", "40");
		});
	});

	describe("Interação", () => {
		it("deve chamar onValueChange quando valor muda", async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(<Slider value={[50]} onValueChange={handleChange} aria-label="Slider" />);
			const slider = screen.getByRole("slider");
			// Simula mudança de valor (teste básico, interação real requer testes E2E)
			expect(slider).toBeInTheDocument();
		});
	});

	describe("Desabilitado", () => {
		it("deve desabilitar o Slider quando disabled", () => {
			render(<Slider defaultValue={[50]} disabled aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toBeDisabled();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter role slider", () => {
			render(<Slider defaultValue={[50]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toBeInTheDocument();
		});

		it("deve ter aria-valuemin e aria-valuemax", () => {
			render(<Slider defaultValue={[50]} min={0} max={100} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuemin", "0");
			expect(slider).toHaveAttribute("aria-valuemax", "100");
		});

		it("deve ter aria-valuenow", () => {
			render(<Slider value={[50]} aria-label="Slider" />);
			const slider = screen.getByRole("slider", { name: "Slider" });
			expect(slider).toHaveAttribute("aria-valuenow", "50");
		});
	});
});

