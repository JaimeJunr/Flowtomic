import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartBarInteractive } from "./chart-bar-interactive";

const data = [
  { date: "2026-06-01", desktop: 1500, mobile: 200 },
  { date: "2026-06-02", desktop: 1200, mobile: 300 },
];

describe("ChartBarInteractive", () => {
  it("título padrão em português, sem o texto de demo", () => {
    render(<ChartBarInteractive data={data} />);
    expect(screen.getByRole("heading", { name: "Visitas por dia" })).toBeInTheDocument();
    expect(screen.queryByText(/Bar Chart|Showing total/)).not.toBeInTheDocument();
  });

  it("mostra o total de cada série em pt-BR e alterna qual está ativa", () => {
    render(<ChartBarInteractive data={data} />);
    const desktop = screen.getByRole("button", { name: /Computador/ });
    const mobile = screen.getByRole("button", { name: /Celular/ });
    expect(desktop).toHaveTextContent("2.700");
    expect(mobile).toHaveTextContent("500");
    expect(desktop).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(mobile);
    expect(mobile).toHaveAttribute("aria-pressed", "true");
    expect(desktop).toHaveAttribute("aria-pressed", "false");
  });

  it("as cores padrão vêm dos tokens do tema, não de --chart-* que não existe", () => {
    const { container } = render(<ChartBarInteractive data={data} />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).not.toMatch(/--chart-\d/);
    expect(css).toMatch(/var\(--primary\)/);
  });

  it("a descrição só aparece quando é passada", () => {
    const { rerender } = render(<ChartBarInteractive data={data} />);
    expect(screen.queryByText(/visitantes/)).not.toBeInTheDocument();
    rerender(<ChartBarInteractive data={data} description="Junho de 2026" />);
    expect(screen.getByText("Junho de 2026")).toBeInTheDocument();
  });
});
