import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Plan, PlanHeader, PlanTitle, PlanTrigger } from "./plan";

describe("PlanTrigger", () => {
  describe("Texto para leitor de tela em pt-BR", () => {
    it("expõe 'Expandir ou recolher o plano' para quem usa leitor de tela", () => {
      render(
        <Plan>
          <PlanHeader>
            <PlanTitle>Plano</PlanTitle>
            <PlanTrigger />
          </PlanHeader>
        </Plan>
      );
      expect(screen.getByText("Expandir ou recolher o plano")).toBeInTheDocument();
    });

    it("o título do plano aparece normalmente ao lado do gatilho", () => {
      render(
        <Plan>
          <PlanHeader>
            <PlanTitle>1. Rodar o type-check do ui</PlanTitle>
            <PlanTrigger />
          </PlanHeader>
        </Plan>
      );
      expect(screen.getByText("1. Rodar o type-check do ui")).toBeInTheDocument();
    });
  });
});
