import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChartContainer } from "../../../atoms/data-display/chart";
import { ChartAreaInteractive } from "./chart-area-interactive";

// O ResponsiveContainer só renderiza os filhos depois de medir o layout, e o jsdom não mede (nem
// texto, então o recharts não desenha rótulos do eixo, tooltip ou legenda). Trocamos só o
// contêiner por um repassador com tamanho e registramos o que o componente entrega ao recharts:
// os dados já filtrados pelo período, o formatador do eixo, o tooltip e a legenda.
const entregueAoRecharts: {
  data?: { date: string }[];
  tickFormatter?: (value: string) => string;
  tooltipContent?: React.ReactElement;
  legendContent?: React.ReactElement;
} = {};

vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 250 } as Record<string, number>),
    AreaChart: (props: React.ComponentProps<typeof original.AreaChart>) => {
      entregueAoRecharts.data = props.data as { date: string }[];
      return <original.AreaChart {...props} />;
    },
    XAxis: (props: React.ComponentProps<typeof original.XAxis>) => {
      entregueAoRecharts.tickFormatter = props.tickFormatter as (value: string) => string;
      return <original.XAxis {...props} />;
    },
    Tooltip: (props: React.ComponentProps<typeof original.Tooltip>) => {
      entregueAoRecharts.tooltipContent = props.content as React.ReactElement;
      return <original.Tooltip {...props} />;
    },
    Legend: (props: React.ComponentProps<typeof original.Legend>) => {
      entregueAoRecharts.legendContent = props.content as React.ReactElement;
      return <original.Legend {...props} />;
    },
  };
});

beforeEach(() => {
  entregueAoRecharts.data = undefined;
});

// Um ponto por dia, de 01/03 a 30/06/2026 (122 dias).
function umPontoPorDia(): { date: string; desktop: number; mobile: number }[] {
  const pontos = [];
  for (let dia = 0; dia < 122; dia++) {
    const d = new Date(2026, 2, 1 + dia);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    pontos.push({ date: `${d.getFullYear()}-${mm}-${dd}`, desktop: 100 + dia, mobile: 50 + dia });
  }
  return pontos;
}

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

  it("cada período mantém só os dias dentro da janela contada a partir do último ponto", async () => {
    const user = userEvent.setup();
    render(<ChartAreaInteractive data={umPontoPorDia()} />);
    expect(entregueAoRecharts.data).toHaveLength(91);
    expect(entregueAoRecharts.data?.[0].date).toBe("2026-04-01");

    await user.click(screen.getByRole("button", { name: "30 dias" }));
    expect(entregueAoRecharts.data).toHaveLength(31);
    expect(entregueAoRecharts.data?.[0].date).toBe("2026-05-31");

    await user.click(screen.getByRole("button", { name: "7 dias" }));
    expect(entregueAoRecharts.data).toHaveLength(8);
    expect(entregueAoRecharts.data?.[0].date).toBe("2026-06-23");
    expect(entregueAoRecharts.data?.[7].date).toBe("2026-06-30");
  });

  it("se o último ponto não tem data, a janela é contada a partir de hoje", () => {
    render(
      <ChartAreaInteractive
        data={[
          { date: "2020-01-01", desktop: 1, mobile: 1 },
          { date: "", desktop: 2, mobile: 2 },
        ]}
      />
    );
    expect(entregueAoRecharts.data).toEqual([]);
  });

  it("sem dados, o gráfico recebe uma lista vazia", () => {
    render(<ChartAreaInteractive data={[]} />);
    expect(entregueAoRecharts.data).toEqual([]);
  });

  it("sem dados passados, usa a série de exemplo", () => {
    render(<ChartAreaInteractive />);
    expect((entregueAoRecharts.data ?? []).length).toBeGreaterThan(0);
  });

  it("o eixo mostra cada dia como dia e mês abreviado", () => {
    render(<ChartAreaInteractive data={data} />);
    const formatar = entregueAoRecharts.tickFormatter as (value: string) => string;
    expect(formatar("2026-06-01")).toBe("1 jun");
    expect(formatar("2026-12-25")).toBe("25 dez");
    expect(formatar("2026-06-01T12:00:00")).toBe("1 jun");
  });

  it("o tooltip mostra a data completa em pt-BR", () => {
    render(<ChartAreaInteractive data={data} />);
    const conteudo = entregueAoRecharts.tooltipContent as React.ReactElement;
    const { container } = render(
      <ChartContainer config={{ desktop: { label: "Computador", color: "var(--primary)" } }}>
        {React.cloneElement(conteudo, {
          active: true,
          label: "2026-06-30",
          payload: [
            {
              dataKey: "desktop",
              name: "desktop",
              value: 210,
              color: "var(--primary)",
              payload: data[1],
            },
          ],
        } as Record<string, unknown>)}
      </ChartContainer>
    );
    const tooltip = within(container);
    expect(tooltip.getByText("30/06/2026")).toBeInTheDocument();
    expect(tooltip.getByText("Computador")).toBeInTheDocument();
  });

  it("a legenda nomeia as séries pelos rótulos da configuração", () => {
    render(<ChartAreaInteractive data={data} />);
    const conteudo = entregueAoRecharts.legendContent as React.ReactElement;
    const { container } = render(
      <ChartContainer
        config={{
          desktop: { label: "Computador", color: "var(--primary)" },
          mobile: { label: "Celular", color: "var(--muted-foreground)" },
        }}
      >
        {React.cloneElement(conteudo, {
          payload: [
            { dataKey: "desktop", value: "desktop", color: "var(--primary)" },
            { dataKey: "mobile", value: "mobile", color: "var(--muted-foreground)" },
          ],
        } as Record<string, unknown>)}
      </ChartContainer>
    );
    const legenda = within(container);
    expect(legenda.getByText("Computador")).toBeInTheDocument();
    expect(legenda.getByText("Celular")).toBeInTheDocument();
  });

  it("a descrição só aparece quando é passada", () => {
    const { rerender } = render(<ChartAreaInteractive data={data} />);
    expect(screen.queryByText("Últimos 30 dias de acesso")).not.toBeInTheDocument();
    rerender(<ChartAreaInteractive data={data} description="Últimos 30 dias de acesso" />);
    expect(screen.getByText("Últimos 30 dias de acesso")).toBeInTheDocument();
  });

  it("os períodos formam um grupo com nome e se alternam pelo teclado", async () => {
    const user = userEvent.setup();
    render(<ChartAreaInteractive data={data} />);
    expect(screen.getByRole("group", { name: "Período" })).toBeInTheDocument();
    screen.getByRole("button", { name: "30 dias" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "30 dias" })).toHaveAttribute("aria-pressed", "true");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<ChartAreaInteractive data={data} description="Junho" />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
