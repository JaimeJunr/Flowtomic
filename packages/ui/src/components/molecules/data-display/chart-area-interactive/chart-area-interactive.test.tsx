import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartAreaInteractive } from "./chart-area-interactive";

const data = [
  { date: "2026-06-01", desktop: 150, mobile: 90 },
  { date: "2026-06-30", desktop: 210, mobile: 120 },
];

describe("ChartAreaInteractive", () => {
  it("título padrão em português, sem o texto de demo", () => {
    render(<ChartAreaInteractive data={data} />);
    expect(screen.getByRole("heading", { name: "Visitas" })).toBeInTheDocument();
    expect(screen.queryByText(/Area Chart|Showing total|Last 3 months/)).not.toBeInTheDocument();
  });

  it("o período é escolhido por botões visíveis, com o padrão marcado", () => {
    render(<ChartAreaInteractive data={data} />);
    const three = screen.getByRole("button", { name: "3 meses" });
    const seven = screen.getByRole("button", { name: "7 dias" });
    expect(three).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(seven);
    expect(seven).toHaveAttribute("aria-pressed", "true");
    expect(three).toHaveAttribute("aria-pressed", "false");
  });

  it("respeita o período inicial", () => {
    render(<ChartAreaInteractive data={data} defaultTimeRange="30d" />);
    expect(screen.getByRole("button", { name: "30 dias" })).toHaveAttribute("aria-pressed", "true");
  });

  it("as cores padrão vêm dos tokens do tema, não de --chart-* que não existe", () => {
    const { container } = render(<ChartAreaInteractive data={data} />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).not.toMatch(/--chart-\d/);
    expect(css).toMatch(/var\(--primary\)/);
  });
});
