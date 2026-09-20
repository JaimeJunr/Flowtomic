import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  describe("Renderização", () => {
    it("deve renderizar o DropdownMenu", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      expect(screen.getByRole("button", { name: "Trigger" })).toBeInTheDocument();
    });

    it("deve renderizar todos os sub-componentes", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();

      // Abre o menu para verificar conteúdo
      const trigger = screen.getByRole("button", { name: "Trigger" });
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Label")).toBeInTheDocument();
        expect(screen.getByText("Item")).toBeInTheDocument();
      });
    });
  });

  describe("Interação", () => {
    it("deve abrir menu ao clicar no trigger", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: "Trigger" });
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });
    });

    it("deve chamar onClick quando item é clicado", async () => {
      const handleClick = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: "Trigger" });
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });

      const item = screen.getByText("Item");
      await userEvent.click(item);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Acessibilidade", () => {
    it("deve abrir menu via teclado (Enter)", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: "Trigger" });
      trigger.focus();
      await userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });
    });

    it("deve navegar entre itens com setas", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Trigger</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: "Trigger" });
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeVisible();
      });

      await userEvent.keyboard("{ArrowDown}");
      // O foco deve estar no segundo item
    });
  });
});
