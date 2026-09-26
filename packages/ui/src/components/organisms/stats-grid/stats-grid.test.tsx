import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type StatItem, StatsGrid } from "./stats-grid";

const stats: StatItem[] = [
  { id: "npm", title: "Downloads no npm, 7 dias", value: 1240, lastMonth: 1074 },
  {
    id: "build",
    title: "Build do registry",
    value: 38,
    lastMonth: 35,
    suffix: " s",
    positive: false,
  },
  { id: "cobertura", title: "Cobertura de testes", value: "20,9%", subtitle: "meta 75%" },
];

describe("StatsGrid", () => {
  describe("Métrica lida de longe", () => {
    it("mostra o valor em pt-BR e a variação com vírgula", () => {
      render(<StatsGrid stats={stats} />);
      expect(screen.getByText("1.240")).toBeInTheDocument();
      expect(screen.getByText("↑ 15,5%")).toBeInTheDocument();
      expect(screen.getByText("sobre 1.074")).toBeInTheDocument();
    });

    it("valor em texto aparece como veio, com o subtítulo no lugar da comparação", () => {
      render(<StatsGrid stats={stats} />);
      expect(screen.getByText("20,9%")).toBeInTheDocument();
      expect(screen.getByText("meta 75%")).toBeInTheDocument();
    });
  });

  describe("Cor só na variação, e pelo sentido do que é bom", () => {
    it("subida boa fica verde e subida ruim (positive=false) fica vermelha", () => {
      render(<StatsGrid stats={stats} />);
      expect(screen.getByText("↑ 15,5%")).toHaveClass("text-success");
      expect(screen.getByText("↑ 8,6%")).toHaveClass("text-destructive");
    });

    it("o número em si não ganha cor, mesmo com a prop color antiga", () => {
      render(<StatsGrid stats={[{ ...stats[0], color: "green" }]} />);
      const value = screen.getByText("1.240");
      expect(value.className).not.toMatch(/text-(success|primary|info|warning|error)/);
      expect(value).toHaveClass("font-mono");
    });
  });

  describe("Sem vitrine de cards", () => {
    it("é uma lista de definição, não uma grade de cards", () => {
      const { container } = render(<StatsGrid stats={stats} />);
      expect(container.querySelector("dl")).toBeInTheDocument();
      expect(container.querySelectorAll("dt")).toHaveLength(3);
      expect(container.querySelector(".bg-card")).not.toBeInTheDocument();
    });

    it("layout list mantém as três métricas em linhas", () => {
      const { container } = render(<StatsGrid stats={stats} layout="list" />);
      expect(container.querySelectorAll("dt")).toHaveLength(3);
      expect(screen.getByText("Build do registry")).toBeInTheDocument();
    });

    it("carregando mostra um esqueleto por métrica, sem cards", () => {
      const { container } = render(<StatsGrid stats={stats} loading />);
      expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(3);
      expect(container.querySelector(".bg-card")).not.toBeInTheDocument();
    });
  });
});
