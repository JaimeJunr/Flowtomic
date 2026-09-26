import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardMovementsSection, type Movement } from "./dashboard-movements-section";

const movements: Movement[] = [
  {
    id: "ui",
    name: "@flowtomic/ui",
    price: "0.8.0",
    tag: "Publicado",
    buttonText: "Ver no npm",
  },
  {
    id: "logic",
    name: "@flowtomic/logic",
    price: "0.1.8",
    tag: "Aguardando CI",
    buttonText: "Ver build",
  },
];

describe("DashboardMovementsSection", () => {
  describe("Lista densa, sem vitrine", () => {
    it("não desenha avatar com a inicial nem card dentro de card", () => {
      const { container } = render(<DashboardMovementsSection movements={movements} />);
      expect(container.querySelector("[class*='gradient']")).not.toBeInTheDocument();
      expect(screen.queryByText("@")).not.toBeInTheDocument();
      expect(container.querySelectorAll("li.rounded-lg")).toHaveLength(0);
    });

    it("o valor sai em mono e sem cor de marca", () => {
      render(<DashboardMovementsSection movements={movements} />);
      const value = screen.getByText("0.8.0");
      expect(value).toHaveClass("font-mono");
      expect(value).not.toHaveClass("text-primary");
    });
  });

  describe("Um botão sólido por tela, não um por linha", () => {
    it("por padrão as ações das linhas são outline", () => {
      render(<DashboardMovementsSection movements={movements} />);
      for (const name of ["Ação: Ver no npm", "Ação: Ver build"]) {
        expect(screen.getByRole("button", { name })).not.toHaveClass("bg-primary");
        expect(screen.getByRole("button", { name })).not.toHaveClass("bg-success");
      }
    });

    it("getButtonVariant ainda decide quando é passado, e o clique chega", async () => {
      const onButtonClick = vi.fn();
      render(
        <DashboardMovementsSection
          movements={[{ ...movements[0], onButtonClick }]}
          getButtonVariant={() => "default"}
        />
      );
      const button = screen.getByRole("button", { name: "Ação: Ver no npm" });
      expect(button).toHaveClass("bg-primary");
      await userEvent.click(button);
      expect(onButtonClick).toHaveBeenCalledOnce();
    });
  });

  describe("Estado vazio", () => {
    it("mostra a mensagem padrão sem lista", () => {
      render(<DashboardMovementsSection />);
      expect(screen.getByText("Nenhuma movimentação encontrada")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});
