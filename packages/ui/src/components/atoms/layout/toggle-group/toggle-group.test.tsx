import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  describe("Renderização", () => {
    it("deve renderizar o ToggleGroup", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      );
      const option = screen.getByText("Option 1");
      expect(option).toBeInTheDocument();
    });

    it("deve renderizar múltiplos ToggleGroupItems", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      );
      const option1 = screen.getByText("Option 1");
      const option2 = screen.getByText("Option 2");
      expect(option1).toBeInTheDocument();
      expect(option2).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve selecionar item ao clicar (single)", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      );
      const option1 = screen.getByText("Option 1");
      await user.click(option1);

      await waitFor(() => {
        expect(option1).toHaveAttribute("data-state", "on");
      });
    });

    it("deve permitir múltiplos itens selecionados (multiple)", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      );
      const option1 = screen.getByText("Option 1");
      const option2 = screen.getByText("Option 2");

      await user.click(option1);
      await user.click(option2);

      await waitFor(() => {
        expect(option1).toHaveAttribute("data-state", "on");
        expect(option2).toHaveAttribute("data-state", "on");
      });
    });
  });

  describe("Variantes", () => {
    it("deve aplicar variante default", () => {
      const { container } = render(
        <ToggleGroup type="single" variant="default">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      );
      const group = container.querySelector('[data-slot="toggle-group"]');
      expect(group).toBeInTheDocument();
    });

    it("deve aplicar variante outline", () => {
      const { container } = render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      );
      const group = container.querySelector('[data-slot="toggle-group"]');
      expect(group).toBeInTheDocument();
    });
  });
});
