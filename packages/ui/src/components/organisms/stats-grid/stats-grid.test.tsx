import { render, screen } from "@testing-library/react";
import { createRef } from "react";
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

  describe("Variação", () => {
    it("variação negativa explícita mostra seta para baixo e fica vermelha quando subir é bom", () => {
      render(<StatsGrid stats={[{ id: "a", title: "Receita", value: 100, delta: -4.25 }]} />);
      const variacao = screen.getByText("↓ 4,3%");
      expect(variacao).toHaveClass("text-destructive");
    });

    it("queda de algo em que subir é ruim (positive=false) fica verde", () => {
      render(
        <StatsGrid stats={[{ id: "a", title: "Erros", value: 3, delta: -10, positive: false }]} />
      );
      expect(screen.getByText("↓ 10%")).toHaveClass("text-success");
    });

    it("delta explícito vence o cálculo a partir de lastMonth", () => {
      render(
        <StatsGrid stats={[{ id: "a", title: "Receita", value: 200, lastMonth: 100, delta: 5 }]} />
      );
      expect(screen.getByText("↑ 5%")).toBeInTheDocument();
      expect(screen.queryByText("↑ 100%")).not.toBeInTheDocument();
    });

    it("sem variação (0%) a cor é neutra, nem verde nem vermelha", () => {
      render(<StatsGrid stats={[{ id: "a", title: "Usuários", value: 10, delta: 0 }]} />);
      const variacao = screen.getByText(/0%/);
      expect(variacao).toHaveClass("text-muted-foreground");
      expect(variacao).not.toHaveClass("text-success");
      expect(variacao).not.toHaveClass("text-destructive");
    });

    it("variação 0% não mostra seta para cima, que leria como alta", () => {
      render(<StatsGrid stats={[{ id: "a", title: "Usuários", value: 10, delta: 0 }]} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
    });
  });

  describe("Valor e contexto", () => {
    it("aplica prefixo e sufixo ao valor numérico", () => {
      render(
        <StatsGrid stats={[{ id: "a", title: "Tempo", value: 38, prefix: "~", suffix: " s" }]} />
      );
      expect(screen.getByText("~38 s")).toBeInTheDocument();
    });

    it("format e lastFormat customizados controlam o texto do valor e do período anterior", () => {
      render(
        <StatsGrid
          stats={[
            {
              id: "a",
              title: "Receita",
              value: 2,
              lastMonth: 1,
              format: (n) => `R$ ${n} mi`,
              lastFormat: (n) => `R$ ${n} mi antes`,
            },
          ]}
        />
      );
      expect(screen.getByText("R$ 2 mi")).toBeInTheDocument();
      expect(screen.getByText("sobre R$ 1 mi antes")).toBeInTheDocument();
    });

    it("métrica sem variação nem contexto mostra só título e valor", () => {
      const { container } = render(
        <StatsGrid stats={[{ id: "a", title: "Usuários ativos", value: 7 }]} />
      );
      expect(screen.getByText("Usuários ativos")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(container.querySelectorAll("dd")).toHaveLength(1);
    });

    it("só com subtítulo, mostra o contexto sem variação", () => {
      const { container } = render(
        <StatsGrid stats={[{ id: "a", title: "Cobertura", value: "70%", subtitle: "meta 75%" }]} />
      );
      expect(screen.getByText("meta 75%")).toBeInTheDocument();
      expect(container.querySelector(".font-semibold")).not.toBeInTheDocument();
    });

    it("só com variação, mostra a variação sem contexto", () => {
      render(<StatsGrid stats={[{ id: "a", title: "Receita", value: 10, delta: 2 }]} />);
      expect(screen.getByText("↑ 2%")).toBeInTheDocument();
      expect(screen.queryByText(/^sobre/)).not.toBeInTheDocument();
    });
  });

  describe("Layout em lista", () => {
    it("mostra título, valor e variação em colunas da mesma linha", () => {
      render(<StatsGrid stats={stats} layout="list" />);
      expect(screen.getByText("Downloads no npm, 7 dias")).toBeInTheDocument();
      expect(screen.getByText("1.240")).toBeInTheDocument();
      expect(screen.getByText("↑ 15,5%")).toHaveClass("text-success");
      expect(screen.getByText("↑ 8,6%")).toHaveClass("text-destructive");
    });

    it("sem variação, a terceira coluna mostra o contexto (subtítulo)", () => {
      render(<StatsGrid stats={[stats[2]]} layout="list" />);
      expect(screen.getByText("meta 75%")).toBeInTheDocument();
    });

    it("repassa className ao contêiner externo", () => {
      const { container } = render(<StatsGrid stats={stats} layout="list" className="mt-6" />);
      expect(container.firstElementChild).toHaveClass("mt-6");
    });
  });

  describe("Colunas responsivas", () => {
    it("por padrão usa 2 colunas em sm e tantas em lg quanto métricas (até 4)", () => {
      const { container } = render(<StatsGrid stats={stats} />);
      expect(container.querySelector("dl")).toHaveClass("sm:grid-cols-2", "lg:grid-cols-3");
    });

    it("com uma só métrica, usa 1 coluna em lg", () => {
      const { container } = render(<StatsGrid stats={[stats[0]]} />);
      expect(container.querySelector("dl")).toHaveClass("lg:grid-cols-1");
    });

    it("com mais de 4 métricas, limita a 4 colunas em lg", () => {
      const cinco = Array.from({ length: 5 }, (_, i) => ({
        id: `m${i}`,
        title: `Métrica ${i}`,
        value: i,
      }));
      const { container } = render(<StatsGrid stats={cinco} />);
      expect(container.querySelector("dl")).toHaveClass("lg:grid-cols-4");
    });

    it("sem métricas, ainda monta a grade com 1 coluna em lg", () => {
      const { container } = render(<StatsGrid stats={[]} />);
      expect(container.querySelector("dl")).toHaveClass("lg:grid-cols-1");
      expect(container.querySelectorAll("dt")).toHaveLength(0);
    });

    it("columns define as colunas por breakpoint e ignora os que não foram informados", () => {
      const { container } = render(<StatsGrid stats={stats} columns={{ sm: 1, md: 2, lg: 4 }} />);
      expect(container.querySelector("dl")).toHaveClass(
        "sm:grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4"
      );
    });

    it("columns parcial não inventa colunas nos breakpoints omitidos", () => {
      const { container } = render(<StatsGrid stats={stats} columns={{ md: 3 }} />);
      const dl = container.querySelector("dl");
      expect(dl).toHaveClass("md:grid-cols-3");
      expect(dl?.className).not.toMatch(/sm:grid-cols|lg:grid-cols/);
    });

    it.each([
      1, 2, 3, 4,
    ])("columns.lg=%i ajusta a régua dos itens para a linha de %i colunas", (n) => {
      const { container } = render(<StatsGrid stats={stats} columns={{ lg: n }} />);
      const item = container.querySelector("dl > div") as HTMLElement;
      expect(item.className).toContain(`lg:[&:nth-child(${n}n+1)]:border-l-0`);
    });

    it("repassa className e ref ao contêiner", () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(<StatsGrid ref={ref} stats={stats} className="mb-4" />);
      expect(container.firstElementChild).toHaveClass("mb-4");
      expect(ref.current).toBe(container.firstElementChild);
    });
  });

  describe("Carregando", () => {
    it("marca a região como ocupada para leitores de tela", () => {
      const { container } = render(<StatsGrid stats={stats} loading />);
      expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    });

    it("mostra um esqueleto por métrica", () => {
      const { container } = render(<StatsGrid stats={stats} loading />);
      expect(container.querySelectorAll(".animate-pulse")).toHaveLength(9);
    });

    it("sem métricas, mostra 3 esqueletos por padrão", () => {
      const { container } = render(<StatsGrid stats={[]} loading />);
      expect(container.querySelectorAll(".animate-pulse")).toHaveLength(9);
    });

    it("skeletonCount define quantos esqueletos mostrar", () => {
      const { container } = render(<StatsGrid stats={stats} loading skeletonCount={2} />);
      expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
    });

    it("carregando respeita columns e className", () => {
      const { container } = render(
        <StatsGrid stats={stats} loading columns={{ lg: 2 }} className="mt-2" />
      );
      expect(container.firstElementChild).toHaveClass("lg:grid-cols-2", "mt-2");
    });
  });
});
