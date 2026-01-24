import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { Button } from "../../actions/button/button";

describe("Sheet", () => {
	describe("Renderização", () => {
		it("deve renderizar o Sheet", () => {
			render(
				<Sheet>
					<SheetTrigger asChild>
						<Button>Open</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Title</SheetTitle>
						</SheetHeader>
					</SheetContent>
				</Sheet>
			);
			const button = screen.getByRole("button", { name: "Open" });
			expect(button).toBeInTheDocument();
		});

		it("deve renderizar SheetTrigger", () => {
			render(
				<Sheet>
					<SheetTrigger asChild>
						<Button>Trigger</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Title</SheetTitle>
						</SheetHeader>
					</SheetContent>
				</Sheet>
			);
			const trigger = screen.getByRole("button", { name: "Trigger" });
			expect(trigger).toBeInTheDocument();
		});
	});

	describe("Interação", () => {
		it("deve abrir sheet ao clicar no trigger", async () => {
			const user = userEvent.setup();
			render(
				<Sheet>
					<SheetTrigger asChild>
						<Button>Open Sheet</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Sheet Title</SheetTitle>
						</SheetHeader>
					</SheetContent>
				</Sheet>
			);
			const button = screen.getByRole("button", { name: "Open Sheet" });
			await user.click(button);

			await waitFor(() => {
				const title = screen.getByText("Sheet Title");
				expect(title).toBeInTheDocument();
			});
		});
	});

	describe("Lados", () => {
		it("deve renderizar com side right por padrão", async () => {
			const user = userEvent.setup();
			const { container } = render(
				<Sheet>
					<SheetTrigger asChild>
						<Button>Open</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Title</SheetTitle>
						</SheetHeader>
					</SheetContent>
				</Sheet>
			);
			
			// Abre o sheet para verificar o conteúdo
			const button = screen.getByRole("button", { name: "Open" });
			await user.click(button);

			await waitFor(() => {
				const sheet = document.querySelector('[data-slot="sheet-content"]');
				expect(sheet).toBeInTheDocument();
			});
		});
	});
});

