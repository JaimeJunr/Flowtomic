import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueueSectionLabel } from "./queue";

describe("QueueSectionLabel", () => {
  describe("Contagem em pt-BR", () => {
    it("formata milhar com ponto, no padrão pt-BR", () => {
      render(<QueueSectionLabel count={1240} label="tarefas do build do registry" />);
      expect(screen.getByText("1.240 tarefas do build do registry")).toBeInTheDocument();
    });

    it("sem count, mostra só o label", () => {
      render(<QueueSectionLabel label="fila vazia" />);
      expect(screen.getByText("fila vazia")).toBeInTheDocument();
    });
  });
});
