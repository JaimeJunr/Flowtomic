import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	TooltipWithMouseFollow,
} from "./tooltip";
import { Button } from "../../actions/button/button";

describe("Tooltip", () => {
	describe("Renderização", () => {
		it("deve renderizar o Tooltip", () => {
			render(
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button>Hover me</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Tooltip content</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
			const button = screen.getByRole("button", { name: "Hover me" });
			expect(button).toBeInTheDocument();
		});

		it("deve renderizar TooltipTrigger", () => {
			render(
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button>Trigger</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Content</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
			const trigger = screen.getByRole("button", { name: "Trigger" });
			expect(trigger).toBeInTheDocument();
		});

		it("deve renderizar TooltipContent", async () => {
			const user = userEvent.setup();
			render(
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button>Hover</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Tooltip content</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
			const button = screen.getByRole("button", { name: "Hover" });
			await user.hover(button);

			await waitFor(() => {
				const content = screen.getAllByText("Tooltip content");
				expect(content.length).toBeGreaterThan(0);
				expect(content[0]).toBeInTheDocument();
			});
		});
	});

	describe("Interação", () => {
		it("deve exibir tooltip ao passar o mouse", async () => {
			const user = userEvent.setup();
			render(
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button>Hover me</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Tooltip appears</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
			const button = screen.getByRole("button", { name: "Hover me" });
			await user.hover(button);

			await waitFor(() => {
				const content = screen.getAllByText("Tooltip appears");
				expect(content.length).toBeGreaterThan(0);
				expect(content[0]).toBeInTheDocument();
			});
		});
	});

	describe("TooltipWithMouseFollow", () => {
		it("deve renderizar TooltipWithMouseFollow", () => {
			render(
				<TooltipWithMouseFollow content={<p>Follow mouse</p>}>
					<Button>Hover</Button>
				</TooltipWithMouseFollow>
			);
			const button = screen.getByRole("button", { name: "Hover" });
			expect(button).toBeInTheDocument();
		});

		it("deve aceitar minWidth customizado", () => {
			render(
				<TooltipWithMouseFollow content={<p>Content</p>} minWidth={300}>
					<Button>Hover</Button>
				</TooltipWithMouseFollow>
			);
			const button = screen.getByRole("button", { name: "Hover" });
			expect(button).toBeInTheDocument();
		});
	});

	describe("Acessibilidade", () => {
		it("deve ter estrutura acessível", () => {
			render(
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button aria-label="Info button">Info</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Information</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
			const button = screen.getByRole("button", { name: "Info button" });
			expect(button).toBeInTheDocument();
		});
	});
});

