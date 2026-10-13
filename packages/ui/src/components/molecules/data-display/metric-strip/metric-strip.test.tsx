import { render, screen, within } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Metric, MetricStrip } from "./metric-strip";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const items: Metric[] = [
  { id: "a", value: 12345, label: "Usuários", description: "Ativos no mês" },
  { id: "b", value: 300, label: "Latência", unit: "ms", prefix: "~" },
  { id: "c", value: 95, label: "Cobertura", suffix: "%" },
];

const root = (container: HTMLElement) =>
  container.querySelector('[data-slot="metric-strip"]') as HTMLElement;

describe("MetricStrip", () => {
  it("renderiza um dl com um dt e um dd por item", () => {
    const { container } = render(<MetricStrip items={items} />);
    expect(root(container).tagName).toBe("DL");
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(container.querySelectorAll("dd")).toHaveLength(3);
    const [first] = container.querySelectorAll("dt");
    expect(first).toHaveTextContent("Usuários");
    expect(container.querySelector("dd")).toHaveTextContent("12.345");
  });

  it("formata em pt-BR e respeita formatOptions", () => {
    const options: Intl.NumberFormatOptions = { notation: "compact" };
    const { container } = render(
      <MetricStrip
        items={[{ id: "x", value: 10_000_000, label: "Leituras", formatOptions: options }]}
      />
    );
    const esperado = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    })
      .format(10_000_000)
      .replace(/\u00a0/g, " ");
    expect(container.querySelector("dd")).toHaveTextContent(esperado);
  });

  it("mostra prefixo, sufixo e unidade com slot próprio", () => {
    const { container } = render(<MetricStrip items={items} />);
    const [, second, third] = container.querySelectorAll("dd");
    expect(second).toHaveTextContent("~300ms");
    expect(second?.querySelector('[data-slot="metric-strip-unit"]')).toHaveTextContent("ms");
    expect(third).toHaveTextContent("95%");
  });

  it("display substitui o número", () => {
    const { container } = render(
      <MetricStrip items={[{ id: "x", value: 1, label: "Custo", display: "Grátis" }]} />
    );
    const valor = container.querySelector("dd");
    expect(valor).toHaveTextContent("Grátis");
    expect(valor).not.toHaveTextContent("1");
  });

  it("data-variant muda com variant, rows mostra description e dot separa os itens", () => {
    const { container, rerender } = render(<MetricStrip items={items} variant="rows" />);
    expect(root(container)).toHaveAttribute("data-variant", "rows");
    expect(screen.getByText("Ativos no mês")).toBeInTheDocument();

    rerender(<MetricStrip items={items} variant="inline" separator="dot" />);
    expect(root(container)).toHaveAttribute("data-variant", "inline");
    const pontos = container.querySelectorAll('[aria-hidden="true"]');
    expect(pontos).toHaveLength(items.length - 1);

    rerender(<MetricStrip items={items} variant="inline" />);
    expect(container.querySelectorAll('[data-slot="metric-strip-separator"]')).toHaveLength(0);
  });

  it("accent aplica a cor de destaque e mono aplica font-mono", () => {
    const { container, rerender } = render(<MetricStrip items={items} />);
    const valor = () => container.querySelector("dd") as HTMLElement;
    expect(valor()).toHaveClass("text-foreground");
    expect(valor().querySelector(".font-mono")).toBeNull();

    rerender(<MetricStrip items={items} accent mono />);
    expect(valor()).toHaveClass("text-primary");
    expect(valor().querySelector(".font-mono")).not.toBeNull();

    rerender(<MetricStrip items={items} variant="inline" />);
    expect(valor()).toHaveClass("text-primary");
  });

  it("animate com movimento reduzido mostra o valor final direto", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <MetricStrip items={items} animate />
      </MotionConfig>
    );
    const valor = container.querySelector("dd") as HTMLElement;
    expect(valor).toHaveTextContent("12.345");
    expect(valor).not.toHaveTextContent("0");
  });

  it("animate sem IntersectionObserver disparando mantém o valor final acessível", () => {
    const { container } = render(<MetricStrip items={items} animate />);
    const final = container.querySelector("dd .sr-only");
    expect(final).toHaveTextContent("12.345");
  });

  it("href torna o item um link nomeado pelo rótulo", () => {
    render(<MetricStrip items={[{ id: "x", value: 5, label: "Releases", href: "/changelog" }]} />);
    const link = screen.getByRole("link", { name: "Releases" });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(link).toHaveAccessibleDescription("5");
    expect(within(link.closest("dt") as HTMLElement).getByText("Releases")).toBeInTheDocument();
  });
});
