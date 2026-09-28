import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart, type BarChartDataPoint } from "./bar-chart";

const data: BarChartDataPoint[] = [
  { label: "seg", value: 3 },
  { label: "ter", value: 7 },
  { label: "qua", value: 0 },
];

describe("BarChart", () => {
  it("título vira cabeçalho de seção", () => {
    render(<BarChart data={data} title="Builds do registry por dia" />);
    expect(screen.getByRole("heading", { name: "Builds do registry por dia" })).toBeInTheDocument();
  });

  it("mostra os rótulos das barras", () => {
    render(<BarChart data={data} />);
    for (const label of ["seg", "ter", "qua"]) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("com showValues mostra o valor sem acrescentar '%'", () => {
    render(<BarChart data={data} showValues />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("valor zero vira um traço visível, não some", () => {
    const { container } = render(<BarChart data={data} />);
    const heights = [...container.querySelectorAll("rect")].map((r) =>
      Number(r.getAttribute("height"))
    );
    expect(heights[2]).toBeGreaterThan(0);
    expect(heights[1]).toBeGreaterThan(heights[0]);
  });

  it("o gráfico tem nome em português para o leitor de tela", () => {
    render(<BarChart data={data} />);
    expect(screen.getByRole("img", { name: "Gráfico de barras" })).toBeInTheDocument();
  });

  it("sem dados diz isso em português", () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText("Nenhum valor para mostrar.")).toBeInTheDocument();
  });
});
