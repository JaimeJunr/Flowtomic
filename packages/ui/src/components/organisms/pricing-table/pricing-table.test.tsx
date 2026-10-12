import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type PricingPlan, PricingTable, type PricingTableProps } from "./pricing-table";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const periods = [
  { id: "mensal", label: "Mensal" },
  { id: "anual", label: "Anual", badge: "2 meses grátis" },
];

const plans: PricingPlan[] = [
  {
    id: "gratis",
    name: "Gratuito",
    price: { amount: "Grátis" },
    action: { label: "Comece hoje", href: "/comecar" },
    features: [{ label: "1 projeto" }, { label: "Suporte", included: false }],
  },
  {
    id: "equipe",
    name: "Equipe",
    highlighted: true,
    highlightLabel: "Mais escolhido",
    price: {
      mensal: { amount: 49, suffix: "/mês" },
      anual: { amount: 39, suffix: "/mês", original: 49 },
    },
    action: { label: "Assinar", onClick: () => {} },
    features: [{ label: "Painel", badge: "Novo" }],
  },
  {
    id: "vida",
    name: "Vitalício",
    price: { amount: 299, suffix: "pagamento único", original: 499 },
    action: { label: "Comprar", onClick: () => {} },
    features: [{ label: "Tudo" }],
  },
];

function setup(props: Partial<PricingTableProps> = {}) {
  return render(
    <MotionConfig reducedMotion="always">
      <PricingTable plans={plans} periods={periods} {...props} />
    </MotionConfig>
  );
}

const plano = (nome: string) => screen.getByRole("region", { name: new RegExp(nome) });

describe("PricingTable", () => {
  it("renderiza uma section por plano com nome, preço, botão e itens", () => {
    const { container } = setup();
    expect(container.querySelector('[data-slot="pricing-table"]')).toBeInTheDocument();
    const cards = container.querySelectorAll('[data-slot="pricing-table-plan"]');
    expect(cards).toHaveLength(3);
    const equipe = plano("Equipe");
    expect(within(equipe).getByRole("heading", { name: "Equipe" })).toBeInTheDocument();
    expect(within(equipe).getByRole("button", { name: "Assinar" })).toBeInTheDocument();
    expect(within(equipe).getByText("Painel")).toBeInTheDocument();
    expect(within(equipe).getAllByRole("listitem")).toHaveLength(1);
  });

  it("formata número em BRL pt-BR e deixa string como está", () => {
    setup();
    expect(plano("Equipe").querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      /R\$\s?49/
    );
    expect(plano("Gratuito").querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      "Grátis"
    );
  });

  it("mostra casas decimais quando o número não é inteiro", () => {
    setup({
      plans: [{ ...plans[2], price: { amount: 49.9 } }],
      periods: [],
    });
    expect(document.querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      /R\$\s?49,90/
    );
  });

  it("mostra o preço original riscado com texto acessível Antes", () => {
    setup();
    const original = plano("Vitalício").querySelector('[data-slot="pricing-table-original-price"]');
    expect(original).toHaveTextContent(/Antes:\s?R\$\s?499/);
    expect(original?.querySelector("s")).toHaveTextContent(/R\$\s?499/);
  });

  it("destaca o plano com data-highlighted, selo e botão sólido; os outros são outline", () => {
    setup();
    const equipe = plano("Equipe");
    expect(equipe).toHaveAttribute("data-highlighted");
    expect(plano("Gratuito")).not.toHaveAttribute("data-highlighted");
    expect(within(equipe).getByText("Mais escolhido")).toBeInTheDocument();
    expect(equipe).toHaveAccessibleName(/Equipe/);
    expect(equipe).toHaveAccessibleName(/Mais escolhido/);
    const solido = within(equipe).getByRole("button", { name: "Assinar" });
    expect(solido.className).toContain("bg-primary");
    const outro = within(plano("Vitalício")).getByRole("button", { name: "Comprar" });
    expect(outro.className).not.toContain("bg-primary ");
    expect(outro.className).toContain("border");
  });

  it("marca item não incluído com texto acessível", () => {
    setup();
    const itens = plano("Gratuito").querySelectorAll('[data-slot="pricing-table-feature"]');
    expect(itens[0]).toHaveAttribute("data-included", "true");
    expect(itens[1]).toHaveAttribute("data-included", "false");
    expect(itens[1]).toHaveTextContent("Não incluso: Suporte");
  });

  it("troca preço, sufixo e preço riscado ao trocar o período (não controlado)", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup();
    const equipe = plano("Equipe");
    expect(equipe.querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(/R\$\s?49/);
    expect(equipe.querySelector('[data-slot="pricing-table-original-price"]')).toBeNull();
    await user.click(screen.getByRole("radio", { name: /Anual/ }));
    expect(equipe.querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(/R\$\s?39/);
    expect(equipe.querySelector('[data-slot="pricing-table-original-price"]')).toHaveTextContent(
      /R\$\s?49/
    );
  });

  it("controlado chama onPeriodChange e não muda sozinho", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onPeriodChange = vi.fn();
    setup({ period: "mensal", onPeriodChange });
    await user.click(screen.getByRole("radio", { name: /Anual/ }));
    expect(onPeriodChange).toHaveBeenCalledWith("anual");
    expect(plano("Equipe").querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      /R\$\s?49/
    );
  });

  it("aceita defaultPeriod e permite voltar ao outro período", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup({ defaultPeriod: "anual" });
    expect(screen.getByRole("radio", { name: /Anual/ })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: /Mensal/ }));
    expect(screen.getByRole("radio", { name: /Mensal/ })).toHaveAttribute("aria-checked", "true");
  });

  it("não deixa desmarcar o período atual", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onPeriodChange = vi.fn();
    setup({ defaultPeriod: "mensal", onPeriodChange });
    await user.click(screen.getByRole("radio", { name: /Mensal/ }));
    expect(onPeriodChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: /Mensal/ })).toHaveAttribute("aria-checked", "true");
  });

  it("expõe a alternância como radiogroup rotulado", () => {
    setup();
    expect(screen.getByRole("radiogroup", { name: "Período de cobrança" })).toBeInTheDocument();
  });

  it("plano com preço único aparece igual nos dois períodos", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup();
    const vida = plano("Vitalício").querySelector('[data-slot="pricing-table-price"]');
    expect(vida).toHaveTextContent(/R\$\s?299/);
    await user.click(screen.getByRole("radio", { name: /Anual/ }));
    expect(vida).toHaveTextContent(/R\$\s?299/);
  });

  it("usa o primeiro período disponível quando o plano não tem o escolhido", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup({
      plans: [
        {
          ...plans[1],
          price: { anual: { amount: 39, suffix: "/mês" } },
        },
      ],
    });
    await user.click(screen.getByRole("radio", { name: /Mensal/ }));
    expect(document.querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      /R\$\s?39/
    );
  });

  it("action.href vira link e onClick é chamado", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onClick = vi.fn();
    setup({
      plans: [plans[0], { ...plans[1], action: { label: "Assinar", onClick } }],
    });
    expect(within(plano("Gratuito")).getByRole("link", { name: "Comece hoje" })).toHaveAttribute(
      "href",
      "/comecar"
    );
    await user.click(within(plano("Equipe")).getByRole("button", { name: "Assinar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sem periods não há alternância", () => {
    const { container } = setup({ periods: undefined });
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(container.querySelector('[data-slot="pricing-table-periods"]')).toBeNull();
    expect(plano("Equipe").querySelector('[data-slot="pricing-table-price"]')).toHaveTextContent(
      /R\$\s?49/
    );
  });

  it("mostra nota, descrição, ícone e selo de item", () => {
    setup({
      plans: [
        {
          ...plans[1],
          icon: <svg data-testid="icone" />,
          description: "Para times",
          note: "Sem cartão",
        },
      ],
    });
    expect(screen.getByText("Para times")).toBeInTheDocument();
    expect(screen.getByText("Sem cartão")).toBeInTheDocument();
    expect(screen.getByTestId("icone")).toBeInTheDocument();
    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("repassa className e props para a raiz", () => {
    const { container } = setup({ className: "x-test", id: "raiz" });
    const raiz = container.querySelector('[data-slot="pricing-table"]');
    expect(raiz).toHaveClass("x-test");
    expect(raiz).toHaveAttribute("id", "raiz");
  });
});
