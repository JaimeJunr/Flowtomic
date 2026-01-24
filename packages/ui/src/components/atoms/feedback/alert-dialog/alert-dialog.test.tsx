import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "./alert-dialog";
import { Button } from "../../actions/button/button";

describe("AlertDialog", () => {
	describe("Renderização", () => {
		it("deve renderizar o AlertDialog", () => {
			render(
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button>Open</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Title</AlertDialogTitle>
							<AlertDialogDescription>Description</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Confirm</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
			const button = screen.getByRole("button", { name: "Open" });
			expect(button).toBeInTheDocument();
		});

		it("deve renderizar AlertDialogTrigger", () => {
			render(
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button>Trigger</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Title</AlertDialogTitle>
						</AlertDialogHeader>
					</AlertDialogContent>
				</AlertDialog>
			);
			const trigger = screen.getByRole("button", { name: "Trigger" });
			expect(trigger).toBeInTheDocument();
		});
	});

	describe("Interação", () => {
		it("deve abrir alert dialog ao clicar no trigger", async () => {
			const user = userEvent.setup();
			render(
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button>Open Alert</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Alert Title</AlertDialogTitle>
							<AlertDialogDescription>Alert description</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Confirm</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
			const button = screen.getByRole("button", { name: "Open Alert" });
			await user.click(button);

			await waitFor(() => {
				const title = screen.getByText("Alert Title");
				expect(title).toBeInTheDocument();
			});
		});
	});
});

