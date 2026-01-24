import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
	describe("Renderização", () => {
		it("deve renderizar o label com texto", () => {
			render(<Label>Nome</Label>);
			expect(screen.getByText("Nome")).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(<Label className="custom-class">Label</Label>);
			const label = container.querySelector("label");
			expect(label).toHaveClass("custom-class");
		});
	});

	describe("Associação", () => {
		it("deve associar label ao input via htmlFor", () => {
			render(
				<>
					<Label htmlFor="input-id">Email</Label>
					<input id="input-id" />
				</>
			);
			const label = screen.getByText("Email");
			const input = screen.getByLabelText("Email");
			expect(label).toHaveAttribute("for", "input-id");
			expect(input).toHaveAttribute("id", "input-id");
		});
	});

	describe("Props HTML", () => {
		it("deve passar props HTML padrão", () => {
			render(<Label data-testid="label" aria-label="Test label">Label</Label>);
			const label = screen.getByTestId("label");
			expect(label).toHaveAttribute("aria-label", "Test label");
		});
	});
});

