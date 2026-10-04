import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  useChart,
} from "./chart";

// O ResponsiveContainer só renderiza os filhos depois de medir o layout, e o jsdom não mede.
// Trocamos apenas ele por um repassador para exercitar o conteúdo do tooltip e da legenda.
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const config: ChartConfig = {
  vendas: { label: "Vendas", color: "hsl(var(--primary))" },
  custos: {
    label: "Custos",
    theme: { light: "hsl(var(--muted-foreground))", dark: "hsl(var(--foreground))" },
  },
  sem_cor: { label: "Sem cor" },
};

function noContainer(ui: React.ReactElement) {
  return render(<ChartContainer config={config}>{ui}</ChartContainer>);
}

function cssDoChart(container: HTMLElement): string {
  return container.querySelector("style")?.textContent ?? "";
}

describe("useChart", () => {
  it("fora do ChartContainer lança erro explicando onde usar", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useChart())).toThrow(
      "useChart must be used within a <ChartContainer />"
    );
    spy.mockRestore();
  });
});

describe("ChartContainer / ChartStyle", () => {
  it("expõe o config para os filhos e identifica o gráfico", () => {
    const { result } = renderHook(() => useChart(), {
      wrapper: ({ children }) => (
        <ChartContainer config={config}>
          <div>{children}</div>
        </ChartContainer>
      ),
    });
    expect(result.current.config).toBe(config);
  });

  it("gera uma variável CSS por cor e usa a cor do tema claro e do escuro", () => {
    const { container } = render(
      <ChartContainer config={config} id="vendas">
        <div />
      </ChartContainer>
    );
    const slot = container.querySelector('[data-slot="chart"]');
    expect(slot).toHaveAttribute("data-chart", "chart-vendas");
    const css = cssDoChart(container);
    expect(css).toContain("[data-chart=chart-vendas]");
    expect(css).toContain("--color-vendas: hsl(var(--primary));");
    expect(css).toContain("--color-custos: hsl(var(--muted-foreground));");
    expect(css).toMatch(
      /\.dark \[data-chart=chart-vendas\][^}]*--color-custos: hsl\(var\(--foreground\)\);/
    );
  });

  it("ignora séries sem cor no CSS", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <div />
      </ChartContainer>
    );
    expect(cssDoChart(container)).not.toContain("--color-sem_cor");
  });

  it("sem nenhuma cor no config, não injeta a tag de estilo", () => {
    const { container } = render(<ChartStyle id="x" config={{ a: { label: "A" } }} />);
    expect(container.querySelector("style")).toBeNull();
  });

  it("gera um id único por instância quando não recebe id", () => {
    const { container } = render(
      <>
        <ChartContainer config={config}>
          <div />
        </ChartContainer>
        <ChartContainer config={config}>
          <div />
        </ChartContainer>
      </>
    );
    const ids = Array.from(container.querySelectorAll('[data-slot="chart"]')).map((el) =>
      el.getAttribute("data-chart")
    );
    expect(ids[0]).toMatch(/^chart-/);
    expect(ids[0]).not.toContain(":");
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("aplica className e repassa atributos ao contêiner", () => {
    const { container } = render(
      <ChartContainer config={config} className="h-40" data-testid="grafico">
        <div />
      </ChartContainer>
    );
    expect(container.querySelector('[data-slot="chart"]')).toHaveClass("h-40", "aspect-video");
    expect(screen.getByTestId("grafico")).toBeInTheDocument();
  });
});

describe("ChartTooltipContent", () => {
  const payload = [
    { dataKey: "vendas", name: "vendas", value: 1500, color: "#111", payload: { fill: "#222" } },
    { dataKey: "custos", name: "custos", value: 900, color: "#333" },
  ];

  it("não renderiza nada quando inativo ou sem dados", () => {
    const { container, rerender } = noContainer(
      <ChartTooltipContent active={false} payload={payload} />
    );
    expect(container.querySelector(".border-border\\/50")).toBeNull();
    rerender(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={[]} />
      </ChartContainer>
    );
    expect(container.querySelector(".border-border\\/50")).toBeNull();
  });

  it("lista cada série com o rótulo do config e o valor formatado", () => {
    noContainer(<ChartTooltipContent active payload={payload} label="Janeiro" />);
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getByText("Custos")).toBeInTheDocument();
    expect(screen.getByText((1500).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText("900")).toBeInTheDocument();
  });

  it("mostra o título quando o label corresponde a uma série do config", () => {
    noContainer(<ChartTooltipContent active payload={payload} label="vendas" />);
    expect(screen.getAllByText("Vendas").length).toBeGreaterThanOrEqual(2);
  });

  it("hideLabel esconde o título", () => {
    noContainer(<ChartTooltipContent active payload={payload} label="vendas" hideLabel />);
    expect(screen.getAllByText("Vendas")).toHaveLength(1);
  });

  it("labelFormatter personaliza o título", () => {
    noContainer(
      <ChartTooltipContent
        active
        payload={payload}
        label="vendas"
        labelFormatter={() => "Resumo do mês"}
      />
    );
    expect(screen.getByText("Resumo do mês")).toBeInTheDocument();
  });

  it("formatter assume o desenho da linha", () => {
    noContainer(
      <ChartTooltipContent
        active
        payload={payload}
        formatter={(valor, nome) => <span>{`${nome}: R$ ${valor}`}</span>}
      />
    );
    expect(screen.getByText("vendas: R$ 1500")).toBeInTheDocument();
  });

  it("hideIndicator remove a marca de cor; sem ele, a marca usa a cor do payload", () => {
    const { container, rerender } = noContainer(<ChartTooltipContent active payload={payload} />);
    const marca = container.querySelector<HTMLElement>("[style*='--color-bg']");
    expect(marca?.style.getPropertyValue("--color-bg")).toBe("#222");
    rerender(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={payload} hideIndicator />
      </ChartContainer>
    );
    expect(container.querySelector("[style*='--color-bg']")).toBeNull();
  });

  it("cada indicador aplica o seu estilo de marca", () => {
    const um = [payload[0] as (typeof payload)[number]];
    const { container, rerender } = noContainer(
      <ChartTooltipContent active payload={um} indicator="line" />
    );
    expect(container.querySelector("[style*='--color-bg']")).toHaveClass("w-1");
    rerender(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={um} indicator="dashed" />
      </ChartContainer>
    );
    expect(container.querySelector("[style*='--color-bg']")).toHaveClass("border-dashed");
    rerender(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={um} indicator="dot" />
      </ChartContainer>
    );
    expect(container.querySelector("[style*='--color-bg']")).toHaveClass("h-2.5", "w-2.5");
  });

  it("a prop color tem prioridade sobre a cor do payload", () => {
    const { container } = noContainer(
      <ChartTooltipContent active payload={payload} color="#abc" />
    );
    expect(
      container
        .querySelector<HTMLElement>("[style*='--color-bg']")
        ?.style.getPropertyValue("--color-bg")
    ).toBe("#abc");
  });

  it("ignora itens do tipo 'none'", () => {
    noContainer(
      <ChartTooltipContent
        active
        payload={[...payload, { dataKey: "meta", name: "meta", value: 5, type: "none" }]}
      />
    );
    expect(screen.queryByText("meta")).not.toBeInTheDocument();
  });

  it("usa o ícone do config no lugar da marca de cor", () => {
    const Icone = () => <svg data-testid="icone-vendas" />;
    render(
      <ChartContainer config={{ vendas: { label: "Vendas", icon: Icone } }}>
        <ChartTooltipContent active payload={payload.slice(0, 1)} />
      </ChartContainer>
    );
    expect(screen.getByTestId("icone-vendas")).toBeInTheDocument();
  });

  it("sem rótulo no config cai no nome da série", () => {
    render(
      <ChartContainer config={{}}>
        <ChartTooltipContent active payload={[{ dataKey: "x", name: "Série X", value: 3 }]} />
      </ChartContainer>
    );
    expect(screen.getByText("Série X")).toBeInTheDocument();
  });
});

describe("ChartLegendContent", () => {
  const payload = [
    { value: "vendas", dataKey: "vendas", color: "#111" },
    { value: "custos", dataKey: "custos", color: "#222" },
  ];

  it("não renderiza nada sem itens", () => {
    const { container } = noContainer(<ChartLegendContent payload={[]} />);
    expect(container.querySelector(".gap-4")).toBeNull();
  });

  it("lista os rótulos do config com a cor de cada série", () => {
    const { container } = noContainer(<ChartLegendContent payload={payload} />);
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getByText("Custos")).toBeInTheDocument();
    const marcas = container.querySelectorAll<HTMLElement>(".h-2.w-2");
    expect(marcas[0]?.style.backgroundColor).toBe("rgb(17, 17, 17)");
  });

  it("verticalAlign decide o espaçamento da legenda", () => {
    const { container, rerender } = noContainer(<ChartLegendContent payload={payload} />);
    expect(container.querySelector(".gap-4")).toHaveClass("pt-3");
    rerender(
      <ChartContainer config={config}>
        <ChartLegendContent payload={payload} verticalAlign="top" />
      </ChartContainer>
    );
    expect(container.querySelector(".gap-4")).toHaveClass("pb-3");
  });

  it("usa ícone do config e hideIcon volta para a marca de cor", () => {
    const Icone = () => <svg data-testid="icone" />;
    const cfg: ChartConfig = { vendas: { label: "Vendas", icon: Icone } };
    const { rerender } = render(
      <ChartContainer config={cfg}>
        <ChartLegendContent payload={payload.slice(0, 1)} />
      </ChartContainer>
    );
    expect(screen.getByTestId("icone")).toBeInTheDocument();
    rerender(
      <ChartContainer config={cfg}>
        <ChartLegendContent payload={payload.slice(0, 1)} hideIcon />
      </ChartContainer>
    );
    expect(screen.queryByTestId("icone")).not.toBeInTheDocument();
  });

  it("ignora itens do tipo 'none'", () => {
    noContainer(
      <ChartLegendContent
        payload={[...payload, { value: "meta", dataKey: "vendas", type: "none" }]}
      />
    );
    expect(screen.getAllByText("Vendas")).toHaveLength(1);
  });
});
