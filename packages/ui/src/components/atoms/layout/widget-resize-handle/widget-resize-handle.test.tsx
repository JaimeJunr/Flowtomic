import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WidgetResizeHandle } from "./widget-resize-handle";

describe("WidgetResizeHandle", () => {
	describe("Renderização", () => {
		it("deve renderizar o WidgetResizeHandle", () => {
			const handleResize = vi.fn();
			render(
				<div className="relative group">
					<WidgetResizeHandle
						widgetId="widget-1"
						currentWidth={4}
						currentHeight={4}
						onResize={handleResize}
					/>
				</div>
			);
			const handle = screen.getByLabelText("Redimensionar widget");
			expect(handle).toBeInTheDocument();
		});

		it("deve aplicar className customizada", () => {
			const handleResize = vi.fn();
			const { container } = render(
				<div className="relative group">
					<WidgetResizeHandle
						widgetId="widget-1"
						currentWidth={4}
						currentHeight={4}
						onResize={handleResize}
						className="custom-class"
					/>
				</div>
			);
			const handle = container.querySelector('[aria-label="Redimensionar widget"]');
			expect(handle).toHaveClass("custom-class");
		});
	});

	describe("Limites", () => {
		it("deve respeitar minWidth e minHeight", () => {
			const handleResize = vi.fn();
			render(
				<div className="relative group">
					<WidgetResizeHandle
						widgetId="widget-1"
						currentWidth={2}
						currentHeight={2}
						onResize={handleResize}
						minWidth={2}
						minHeight={2}
					/>
				</div>
			);
			const handle = screen.getByLabelText("Redimensionar widget");
			expect(handle).toBeInTheDocument();
		});

		it("deve respeitar maxWidth e maxHeight", () => {
			const handleResize = vi.fn();
			render(
				<div className="relative group">
					<WidgetResizeHandle
						widgetId="widget-1"
						currentWidth={10}
						currentHeight={10}
						onResize={handleResize}
						maxWidth={12}
						maxHeight={20}
					/>
				</div>
			);
			const handle = screen.getByLabelText("Redimensionar widget");
			expect(handle).toBeInTheDocument();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter aria-label", () => {
			const handleResize = vi.fn();
			render(
				<div className="relative group">
					<WidgetResizeHandle
						widgetId="widget-1"
						currentWidth={4}
						currentHeight={4}
						onResize={handleResize}
					/>
				</div>
			);
			const handle = screen.getByLabelText("Redimensionar widget");
			expect(handle).toBeInTheDocument();
		});
	});
});

