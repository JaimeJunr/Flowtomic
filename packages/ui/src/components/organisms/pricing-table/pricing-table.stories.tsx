import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, Sparkles, Users } from "lucide-react";
import { type PricingPlan, PricingTable } from "./pricing-table";

const meta = {
  title: "Flowtomic UI/Organisms/PricingTable",
  component: PricingTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dois a quatro planos lado a lado, um deles recomendado, com alternância opcional de período. A grade responde ao contêiner: abaixo de 640 px os cartões empilham (o destacado primeiro); com quatro planos, entre 640 e 1024 px vira 2x2. O número anima ao trocar o período e troca seco com movimento reduzido.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currency: { control: "text" },
    locale: { control: "text" },
  },
} satisfies Meta<typeof PricingTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const periods = [
  { id: "mensal", label: "Mensal" },
  { id: "anual", label: "Anual", badge: "2 meses grátis" },
];

const gratuito: PricingPlan = {
  id: "gratuito",
  name: "Gratuito",
  icon: <Sparkles />,
  description: "Para conhecer o produto.",
  price: { amount: 0, suffix: "/mês" },
  action: { label: "Comece hoje", href: "#gratuito" },
  note: "Sem cartão de crédito",
  features: [
    { label: "1 projeto" },
    { label: "Até 3 pessoas" },
    { label: "Histórico de 7 dias" },
    { label: "Suporte prioritário", included: false },
  ],
};

const equipe: PricingPlan = {
  id: "equipe",
  name: "Equipe",
  icon: <Users />,
  description: "Para times que entregam toda semana.",
  highlighted: true,
  highlightLabel: "Mais escolhido",
  price: {
    mensal: { amount: 49, suffix: "/mês" },
    anual: { amount: 39, suffix: "/mês", original: 49 },
  },
  action: { label: "Assinar Equipe", onClick: () => {} },
  features: [
    { label: "Projetos ilimitados" },
    { label: "Até 20 pessoas" },
    { label: "Histórico de 1 ano" },
    { label: "Painel de uso", badge: "Novo" },
    { label: "Suporte prioritário", included: false },
  ],
};

const empresa: PricingPlan = {
  id: "empresa",
  name: "Empresa",
  icon: <Building2 />,
  description: "Para operações com exigências próprias.",
  price: { amount: "Fale com a gente" },
  action: { label: "Falar com vendas", href: "#empresa" },
  features: [
    { label: "Tudo do plano Equipe" },
    { label: "Pessoas ilimitadas" },
    { label: "Histórico sem limite" },
    { label: "Suporte prioritário" },
  ],
};

export const Default: Story = {
  args: {
    plans: [gratuito, equipe, empresa],
    periods,
    defaultPeriod: "mensal",
  },
};

export const PagamentoUnico: Story = {
  args: {
    plans: [
      {
        id: "vitalicio",
        name: "Vitalício",
        highlighted: true,
        highlightLabel: "Oferta de lançamento",
        description: "Pague uma vez e use para sempre.",
        price: { amount: 299, suffix: "pagamento único", original: 499 },
        action: { label: "Comprar agora", onClick: () => {} },
        note: "Atualizações incluídas",
        features: [
          { label: "Todos os componentes" },
          { label: "Atualizações sem custo" },
          { label: "Licença para projetos ilimitados" },
        ],
      },
    ],
  },
};

export const QuatroPlanos: Story = {
  args: {
    plans: [
      gratuito,
      {
        id: "individual",
        name: "Individual",
        price: { amount: 19, suffix: "/mês" },
        action: { label: "Assinar Individual", onClick: () => {} },
        features: [{ label: "Projetos ilimitados" }, { label: "1 pessoa" }],
      },
      { ...equipe, price: { amount: 49, suffix: "/mês" } },
      empresa,
    ],
  },
};

export const Estreito: Story = {
  args: {
    plans: [gratuito, equipe, empresa],
    periods,
    defaultPeriod: "anual",
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <PricingTable {...args} />
    </div>
  ),
};
