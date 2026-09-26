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

  it("não usa mais o fundo em gradiente nem card com sombra no lucro líquido", () => {
    const { container } = render(
      <MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} />
    );
    const label = screen.getByText("Lucro Líquido");
    const row = label.closest("div");
    expect(row?.className).not.toMatch(/gradient/);
    expect(row?.className).not.toMatch(/shadow/);
    expect(container.querySelector(".shadow-lg")).not.toBeInTheDocument();
  });

  it("usa régua de 1px (dl com border-t) em vez de Card", () => {
    const { container } = render(
      <MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} />
    );
    const dl = container.querySelector("dl");
    expect(dl).toBeInTheDocument();
    expect(dl?.className).toMatch(/border-t/);
  });

  it("mostra seta pra baixo e percentual sem sinal duplicado quando a variação é negativa", () => {
    const { container } = render(
      <MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} growthPercentage={-3} />
    );
    expect(screen.queryByText(/\+-3%/)).not.toBeInTheDocument();
    expect(screen.getByText("3%")).toBeInTheDocument();
    expect(container.querySelector(".lucide-trending-down")).toBeInTheDocument();
    expect(container.querySelector(".lucide-trending-up")).not.toBeInTheDocument();
    expect(screen.getByText("3%").className).toMatch(/text-destructive/);
  });

  it("mostra seta pra cima e cor de sucesso quando a variação é positiva", () => {
    const { container } = render(
      <MonthlySummary totalRevenue={125000} costs={45000} netProfit={80000} growthPercentage={5} />
    );
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(container.querySelector(".lucide-trending-up")).toBeInTheDocument();
    expect(container.querySelector(".lucide-trending-down")).not.toBeInTheDocument();
    expect(screen.getByText("5%").className).toMatch(/text-success/);
  });
});
