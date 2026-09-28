import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircularProgressChart } from "./circular-progress-chart";

describe("CircularProgressChart", () => {
  it("mostra a porcentagem no centro mesmo sem label", () => {
    render(<CircularProgressChart value={41} />);
    expect(screen.getByText("41%")).toBeInTheDocument();
  });

  it("mostra o label abaixo da porcentagem", () => {
    render(<CircularProgressChart value={41} label="com teste" />);
    expect(screen.getByText("com teste")).toBeInTheDocument();
  });

  it("calcula sobre max e limita entre 0% e 100%", () => {
    const { rerender } = render(<CircularProgressChart value={12} max={29} />);
    expect(screen.getByText("41%")).toBeInTheDocument();
    rerender(<CircularProgressChart value={150} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    rerender(<CircularProgressChart value={-5} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("o gráfico diz o valor para o leitor de tela, em português", () => {
    render(<CircularProgressChart value={41} label="com teste" />);
    expect(screen.getByRole("img", { name: "41% com teste" })).toBeInTheDocument();
    expect(screen.queryByText(/circular progress/i)).not.toBeInTheDocument();
  });

  it("título vira cabeçalho de seção", () => {
    render(<CircularProgressChart value={41} title="Molecules da 0.9.0" />);
    expect(screen.getByRole("heading", { name: "Molecules da 0.9.0" })).toBeInTheDocument();
  });

  it("usa a faixa de cor que contém o valor", () => {
    const { container } = render(
      <CircularProgressChart
        value={80}
        colorRanges={[
          { min: 0, max: 50, color: "hsl(var(--destructive))" },
          { min: 51, max: 100, color: "hsl(var(--success))" },
        ]}
      />
    );
    const progress = container.querySelectorAll("circle")[1];
    expect(progress.getAttribute("stroke")).toBe("hsl(var(--success))");
  });

  it("mostra a legenda", () => {
    render(
      <CircularProgressChart
        value={41}
        legend={[
          { label: "Com teste", color: "hsl(var(--primary))" },
          { label: "Sem teste", color: "hsl(var(--muted))" },
        ]}
      />
    );
    expect(screen.getByText("Com teste")).toBeInTheDocument();
    expect(screen.getByText("Sem teste")).toBeInTheDocument();
  });
});
