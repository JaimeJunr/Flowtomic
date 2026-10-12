import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cpu, Gauge, Layers, Zap } from "lucide-react";
import * as React from "react";
import {
  RoutingDiagram,
  RoutingDiagramDescription,
  RoutingDiagramProvider,
} from "./routing-diagram";
import type { RoutingScenario } from "./types";

const meta = {
  title: "Flowtomic UI/Organisms/RoutingDiagram",
  component: RoutingDiagram,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Ilustra uma regra de roteamento sem texto: o pedido sai da origem, passa por perguntas e chega a um destino. Cada aba é um cenário com o mesmo desenho e outro critério; o caminho escolhido acende e se desenha da origem ao destino. Abaixo de 640 px o layout vira vertical.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "brand"] },
    pulse: { control: "boolean" },
    autoPlay: { control: "boolean" },
    sourceLabel: { control: "text" },
  },
} satisfies Meta<typeof RoutingDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

const icon = <Cpu aria-hidden="true" />;

const scenarios: RoutingScenario[] = [
  {
    value: "disponibilidade",
    label: "Disponibilidade",
    description: "Se o provedor principal sai do ar, o pedido segue para o provedor de reserva.",
    root: {
      kind: "decision",
      id: "caiu",
      question: "O provedor caiu?",
      branches: [
        {
          label: "primário",
          to: {
            kind: "target",
            id: "rapido-a",
            title: "Modelo Rápido",
            subtitle: "provedor-a/modelo-rapido",
            icon,
            badge: "Fora do ar",
            status: "down",
            fallback: {
              label: "reserva",
              to: {
                kind: "target",
                id: "rapido-b",
                title: "Modelo Rápido",
                subtitle: "provedor-b/modelo-rapido",
                icon,
              },
            },
          },
        },
      ],
    },
    activePath: ["caiu", "rapido-a", "rapido-b"],
  },
  {
    value: "custo",
    label: "Custo",
    description: "O pedido vai para o modelo de menor custo por token que atende ao critério.",
    root: {
      kind: "decision",
      id: "menor-custo",
      question: "Menor custo por token?",
      branches: [
        {
          label: "sim",
          to: {
            kind: "target",
            id: "grande",
            title: "Modelo Grande",
            subtitle: "provedor-a/modelo-grande",
            icon,
            badge: "R$ 150 / 1M",
          },
        },
        {
          label: "não",
          to: {
            kind: "target",
            id: "compacto",
            title: "Modelo Compacto",
            subtitle: "provedor-b/modelo-compacto",
            icon,
            badge: "R$ 1,40 / 1M",
          },
        },
      ],
    },
    activePath: ["menor-custo", "compacto"],
  },
  {
    value: "latencia",
    label: "Latência",
    description: "Vence o modelo que começa a responder primeiro.",
    root: {
      kind: "decision",
      id: "mais-rapido",
      question: "Primeira resposta mais rápida?",
      branches: [
        {
          label: "sim",
          to: {
            kind: "target",
            id: "agil",
            title: "Modelo Ágil",
            subtitle: "provedor-c/modelo-agil",
            icon,
            badge: "180 ms",
          },
        },
        {
          label: "não",
          to: {
            kind: "target",
            id: "grande-lat",
            title: "Modelo Grande",
            subtitle: "provedor-a/modelo-grande",
            icon,
            badge: "320 ms",
          },
        },
      ],
    },
    activePath: ["mais-rapido", "agil"],
  },
];

export const Default: Story = {
  args: { scenarios },
};

export const ArvoreComReserva: Story = {
  args: {
    tone: "brand",
    scenarios: [
      {
        value: "plano",
        label: "Por plano",
        description: "Quem paga usa o modelo principal; quem não paga cai numa regra por volume.",
        root: {
          kind: "decision",
          id: "pago",
          question: "Usuário pago?",
          branches: [
            {
              label: "sim",
              to: {
                kind: "target",
                id: "principal",
                title: "Modelo Grande",
                subtitle: "provedor-a/modelo-grande",
                icon: <Layers aria-hidden="true" />,
                badge: "Principal",
                fallback: {
                  label: "reserva",
                  to: {
                    kind: "target",
                    id: "reserva",
                    title: "Modelo Compacto",
                    subtitle: "provedor-b/modelo-compacto",
                    icon: <Layers aria-hidden="true" />,
                    badge: "Reserva",
                  },
                },
              },
            },
            {
              label: "não",
              to: {
                kind: "decision",
                id: "volume",
                question: "Mais de 1,5 pedido por segundo?",
                branches: [
                  {
                    label: "sim",
                    to: {
                      kind: "target",
                      id: "econ",
                      title: "Modelo Compacto",
                      subtitle: "provedor-c/modelo-compacto",
                      icon: <Zap aria-hidden="true" />,
                    },
                  },
                  {
                    label: "não",
                    to: {
                      kind: "target",
                      id: "gratis",
                      title: "Modelo Ágil",
                      subtitle: "provedor-a/modelo-agil",
                      icon: <Gauge aria-hidden="true" />,
                    },
                  },
                ],
              },
            },
          ],
        },
        activePath: ["pago", "volume", "gratis"],
      },
    ],
  },
};

export const UmCenario: Story = {
  args: { scenarios: [scenarios[1]] },
};

function SecaoComDescricao() {
  const [value, setValue] = React.useState(scenarios[0].value);
  return (
    <RoutingDiagramProvider scenarios={scenarios} value={value} onValueChange={setValue}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <h2 className="text-xl font-semibold text-foreground">
            Roteie pelo critério que importa
          </h2>
          <RoutingDiagramDescription />
        </div>
        <RoutingDiagram renderDescription={() => null} />
      </div>
    </RoutingDiagramProvider>
  );
}

export const DescricaoAoLado: Story = {
  args: { scenarios },
  render: () => <SecaoComDescricao />,
};

export const Estreito: Story = {
  args: { scenarios },
  render: (args) => (
    <div style={{ width: 360 }}>
      <RoutingDiagram {...args} />
    </div>
  ),
};
