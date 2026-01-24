import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
  describe("Renderização", () => {
    it("deve renderizar o Select", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("deve renderizar todos os sub-componentes", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
            <SelectItem value="option2">Opção 2</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir menu ao clicar no trigger", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Opção 1")).toBeVisible();
      });
    });

    it("deve selecionar item quando clicado", async () => {
      const handleValueChange = vi.fn();
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Opção 1")).toBeVisible();
      });

      const item = screen.getByText("Opção 1");
      await userEvent.click(item);
      expect(handleValueChange).toHaveBeenCalledWith("option1");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role combobox", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("deve ser focável via teclado", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Opção 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      await userEvent.tab();
      expect(trigger).toHaveFocus();
    });
  });
});
