import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MonthlySummary } from "./monthly-summary";

describe("MonthlySummary", () => {
  it("formata os valores em pt-BR por padrão", () => {
    render(<MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} />);
    expect(screen.getByText("125.000")).toBeInTheDocument();
    expect(screen.getByText("45.000")).toBeInTheDocument();
    expect(screen.getByText("80.000")).toBeInTheDocument();
  });

  it("respeita um formatCurrency customizado, sem forçar pt-BR", () => {
    render(
      <MonthlySummary
        totalRevenue={125000}
        costs={45000}
        netProfit={80000}
        formatCurrency={(value) => `US$ ${value.toFixed(2)}`}
      />
    );
    expect(screen.getByText("US$ 80000.00")).toBeInTheDocument();
  });

  it("separa o rótulo do valor no card de lucro líquido", () => {
    render(<MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} />);
    expect(screen.queryByText("Lucro Líquido80.000")).not.toBeInTheDocument();
    expect(screen.getByText("Lucro Líquido")).toBeInTheDocument();
    expect(screen.getByText("80.000")).toBeInTheDocument();
  });

  it("não usa mais o fundo em gradiente no card de lucro líquido", () => {
    render(<MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} />);
    const label = screen.getByText("Lucro Líquido");
    const card = label.closest("div");
    expect(card?.className).not.toMatch(/gradient/);
    expect(card?.className).toMatch(/bg-card/);
    expect(card?.className).toMatch(/border-border/);
  });
});
