import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ChartContainer } from "../../../atoms/data-display/chart";
import { ChartBarInteractive } from "./chart-bar-interactive";

// O ResponsiveContainer só renderiza os filhos depois de medir o layout, e o jsdom não mede.
// Trocamos apenas ele por um repassador que já entrega o tamanho ao gráfico.
// O jsdom também não mede texto, então o recharts não desenha os rótulos do eixo nem o tooltip
// ao passar o mouse. Os dois wrappers abaixo só registram as props que o componente entrega ao
// recharts (formatador do eixo e conteúdo do tooltip), para exercitá-las como o recharts faria.
const entregueAoRecharts: {
  tickFormatter?: (value: string) => string;
  tooltipContent?: React.ReactElement;
} = {};

vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 250 } as Record<string, number>),
    XAxis: (props: React.ComponentProps<typeof original.XAxis>) => {
      entregueAoRecharts.tickFormatter = props.tickFormatter as (value: string) => string;
      return <original.XAxis {...props} />;
    },
    Tooltip: (props: React.ComponentProps<typeof original.Tooltip>) => {
      entregueAoRecharts.tooltipContent = props.content as React.ReactElement;
      return <original.Tooltip {...props} />;
    },
  };
});

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

describe("ChartBarInteractive: eixo, tooltip e rótulos", () => {
  it("o eixo mostra cada dia como dia e mês abreviado, sem deslocar pelo fuso", () => {
    render(<ChartBarInteractive data={data} />);
    const formatar = entregueAoRecharts.tickFormatter as (value: string) => string;
    expect(formatar("2026-06-01")).toBe("1 jun");
    expect(formatar("2026-12-25")).toBe("25 dez");
  });

  it("datas fora do formato AAAA-MM-DD também viram dia e mês", () => {
    render(<ChartBarInteractive data={data} />);
    const formatar = entregueAoRecharts.tickFormatter as (value: string) => string;
    expect(formatar("2026-06-01T12:00:00")).toBe("1 jun");
    expect(formatar(new Date(2026, 2, 9, 12).toISOString())).toBe("9 mar");
  });

  it("o tooltip mostra a data completa em pt-BR e o valor da série", () => {
    render(<ChartBarInteractive data={data} />);
    const conteudo = entregueAoRecharts.tooltipContent as React.ReactElement;
    render(
      <ChartContainer config={{ desktop: { label: "Computador", color: "var(--primary)" } }}>
        {React.cloneElement(conteudo, {
          active: true,
          label: "2026-06-01",
          payload: [
            {
              dataKey: "desktop",
              name: "desktop",
              value: 1500,
              color: "var(--primary)",
              payload: data[0],
            },
          ],
        } as Record<string, unknown>)}
      </ChartContainer>
    );
    expect(screen.getByText("01/06/2026")).toBeInTheDocument();
    expect(screen.getByText(/^1[.,]500$/)).toBeInTheDocument();
  });

  it("usa a chave do nome quando a configuração não tem rótulo da série", () => {
    render(
      <ChartBarInteractive
        data={data}
        config={{
          desktop: { color: "var(--primary)" },
          mobile: { color: "var(--muted-foreground)" },
        }}
      />
    );
    expect(screen.getByRole("button", { name: /desktop/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mobile/ })).toBeInTheDocument();
  });

  it("defaultActiveChart escolhe qual série começa ativa", () => {
    render(<ChartBarInteractive data={data} defaultActiveChart="mobile" />);
    expect(screen.getByRole("button", { name: /Celular/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Computador/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("sem dados passados, usa a série de exemplo e soma os totais", () => {
    render(<ChartBarInteractive />);
    expect(screen.getByRole("button", { name: /Computador/ })).toHaveTextContent("24.828");
    expect(screen.getByRole("button", { name: /Celular/ })).toHaveTextContent("25.010");
  });

  it("as séries se alternam pelo teclado", async () => {
    const user = userEvent.setup();
    render(<ChartBarInteractive data={data} />);
    screen.getByRole("button", { name: /Celular/ }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Celular/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<ChartBarInteractive data={data} description="Junho" />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
