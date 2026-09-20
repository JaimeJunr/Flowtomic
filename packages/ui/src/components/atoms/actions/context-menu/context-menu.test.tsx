import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
  describe("Renderização", () => {
    it("deve renderizar o ContextMenu", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();
    });

    it("deve renderizar todos os sub-componentes", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Label</ContextMenuLabel>
            <ContextMenuItem>Item</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuContent>
        </ContextMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Label")).toBeInTheDocument();
        expect(screen.getByText("Item")).toBeInTheDocument();
      });
    });
  });

  describe("ContextMenuItem", () => {
    it("deve renderizar item com variant default", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem variant="default">Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeInTheDocument();
      });
    });

    it("deve renderizar item com variant destructive", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        const item = document.querySelector('[data-variant="destructive"]');
        expect(item).toBeInTheDocument();
      });
    });

    it("deve renderizar item com inset", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem inset>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        const item = document.querySelector('[data-inset="true"]');
        expect(item).toBeInTheDocument();
      });
    });

    it("deve chamar onClick quando clicado", async () => {
      const handleClick = vi.fn();
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleClick}>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      // Aguarda menu abrir
      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });

      // Clica no item
      const item = screen.getByText("Item");
      await userEvent.click(item);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Acessibilidade", () => {
    it("deve abrir menu via clique direito", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      const trigger = screen.getByTestId("trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });
    });
  });
});
