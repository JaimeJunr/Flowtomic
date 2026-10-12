import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  type ComparisonFeature,
  type ComparisonGroup,
  type ComparisonOption,
  ComparisonTable,
} from "./comparison-table";

const options: ComparisonOption[] = [
  { id: "cli", label: "CLI" },
  { id: "npm", label: "npm" },
  { id: "zero", label: "Do zero" },
];

const features: ComparisonFeature[] = [
  {
    id: "updates",
    label: "Atualizações",
    description: "Recebe correções novas",
    values: { cli: true, npm: true, zero: false },
  },
  { id: "edit", label: "Edita o código", values: { cli: true, npm: "partial" } },
  { id: "price", label: "Preço", values: { cli: "R$ 49", npm: <em>grátis</em>, zero: "R$ 0" } },
];

describe("ComparisonTable", () => {
  it("renderiza uma table com cabeçalho de opções e uma linha por recurso", () => {
    render(<ComparisonTable options={options} features={features} title="Recursos" />);
    expect(screen.getByRole("table", { name: "Recursos" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: "CLI" })).toBeInTheDocument();
    expect(screen.getAllByRole("rowheader")).toHaveLength(3);
    expect(screen.getByRole("rowheader", { name: /Edita o código/ })).toBeInTheDocument();
  });

  it("usa a prop caption como nome acessível", () => {
    render(<ComparisonTable options={options} features={features} caption="Comparação de uso" />);
    expect(screen.getByRole("table", { name: "Comparação de uso" })).toBeInTheDocument();
  });

  it("converte true, false e partial em texto acessível", () => {
    render(<ComparisonTable options={options} features={features} />);
    const row = screen.getByRole("row", { name: /Atualizações/ });
    expect(within(row).getAllByText("Sim")).toHaveLength(2);
    expect(within(row).getByText("Não")).toBeInTheDocument();
    const parcial = screen.getByRole("row", { name: /Edita o código/ });
    expect(within(parcial).getByLabelText("Parcial")).toBeInTheDocument();
  });

  it("trata valor ausente como Não", () => {
    render(<ComparisonTable options={options} features={features} />);
    const row = screen.getByRole("row", { name: /Edita o código/ });
    const cells = within(row).getAllByRole("cell");
    expect(cells[2]).toHaveAttribute("data-value", "no");
    expect(within(cells[2]).getByText("Não")).toBeInTheDocument();
  });

  it("renderiza texto e ReactNode como estão", () => {
    render(<ComparisonTable options={options} features={features} />);
    expect(screen.getByText("R$ 49")).toHaveClass("font-mono");
    expect(screen.getByText("grátis").tagName).toBe("EM");
    const row = screen.getByRole("row", { name: /Preço/ });
    expect(within(row).getAllByRole("cell")[0]).toHaveAttribute("data-value", "custom");
  });

  it("marca a coluna destacada e mostra o highlightLabel", () => {
    render(
      <ComparisonTable
        options={options}
        features={features}
        highlight="cli"
        highlightLabel="Recomendado"
      />
    );
    const cli = screen.getByRole("columnheader", { name: /CLI/ });
    expect(cli).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByRole("columnheader", { name: "npm" })).toHaveAttribute(
      "data-highlighted",
      "false"
    );
    const label = screen.getByText("Recomendado");
    expect(label).toBeVisible();
    expect(cli.getAttribute("aria-describedby")).toBe(label.id);
  });

  it("gera botão ? com aria-label e mostra o tooltip ao focar", async () => {
    render(<ComparisonTable options={options} features={features} />);
    const button = screen.getByRole("button", { name: "Sobre Atualizações" });
    expect(screen.queryByRole("button", { name: "Sobre Preço" })).not.toBeInTheDocument();
    act(() => button.focus());
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Recebe correções novas");
  });

  it("renderiza link com href e botão com onSelect", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup({ skipHover: true });
    render(
      <ComparisonTable
        options={options}
        features={[
          { id: "a", label: "Documentação", href: "/docs", values: {} },
          { id: "b", label: "Detalhes", onSelect, values: {} },
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Documentação" })).toHaveAttribute("href", "/docs");
    await user.click(screen.getByRole("button", { name: "Detalhes" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renderiza grupos com subtítulo e as linhas de cada grupo", () => {
    const groups: ComparisonGroup[] = [
      { id: "g1", label: "Instalação", features: [features[0]] },
      { id: "g2", label: "Manutenção", features: [features[1], features[2]] },
    ];
    const { container } = render(<ComparisonTable options={options} features={groups} />);
    expect(screen.getByText("Instalação")).toBeInTheDocument();
    expect(screen.getByText("Manutenção")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="comparison-table-group"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-slot="comparison-table-row"]')).toHaveLength(3);
  });

  describe("modo estreito", () => {
    it("mostra abas de opção, começa na destacada e troca os valores ao trocar de aba", async () => {
      const user = userEvent.setup({ skipHover: true });
      render(
        <ComparisonTable
          layout="stacked"
          options={options}
          features={features}
          highlight="npm"
          highlightLabel="Recomendado"
        />
      );
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
      const npm = screen.getByRole("tab", { name: /npm/ });
      expect(npm).toHaveAttribute("aria-selected", "true");
      expect(within(npm).getByText("Recomendado")).toBeInTheDocument();
      expect(screen.getByLabelText("Parcial")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: "Do zero" }));
      expect(screen.getByRole("tab", { name: "Do zero" })).toHaveAttribute("aria-selected", "true");
      expect(screen.queryByLabelText("Parcial")).not.toBeInTheDocument();
      expect(screen.getByText("R$ 0")).toBeInTheDocument();
    });

    it("começa na primeira opção sem highlight", () => {
      render(<ComparisonTable layout="stacked" options={options} features={features} />);
      expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
    });
  });
});
