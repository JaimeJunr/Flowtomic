import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
	describe("Renderização", () => {
		it("deve renderizar o ScrollArea", () => {
			render(
				<ScrollArea className="h-[200px]">
					<div>Conteúdo longo</div>
				</ScrollArea>
			);
			const content = screen.getByText("Conteúdo longo");
			expect(content).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const { container } = render(
				<ScrollArea className="custom-class h-[200px]">
					<div>Content</div>
				</ScrollArea>
			);
			const scrollArea = container.querySelector('[data-slot="scroll-area"]');
			expect(scrollArea).toBeInTheDocument();
		});
	});

	describe("Conteúdo", () => {
		it("deve renderizar conteúdo longo", () => {
			render(
				<ScrollArea className="h-[200px]">
					<div style={{ height: "500px" }}>Conteúdo muito longo</div>
				</ScrollArea>
			);
			const content = screen.getByText("Conteúdo muito longo");
			expect(content).toBeInTheDocument();
		});
	});
});

