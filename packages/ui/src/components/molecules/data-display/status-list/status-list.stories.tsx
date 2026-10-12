import type { Meta, StoryObj } from "@storybook/react-vite";
import { Boxes, Globe, Package, Table2, Webhook } from "lucide-react";
import type { StatusHistoryPoint, StatusListItem, StatusState } from "./status-list";
import { StatusList } from "./status-list";

const meta = {
  title: "Flowtomic UI/Molecules/StatusList",
  component: StatusList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Estado atual de vários itens numa lista que se lê de longe. Cada linha mostra o estado e quando foi conferido; as que têm `history` ou `content` abrem para mostrar barras de disponibilidade e um conteúdo livre.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    numbered: { control: "boolean" },
    multiple: { control: "boolean" },
  },
} satisfies Meta<typeof StatusList>;

export default meta;
type Story = StoryObj<typeof meta>;

const NOW = new Date("2026-10-12T12:00:00Z");
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3600 * 1000);

function makeHistory(
  days: number,
  overrides: Record<number, StatusState | null> = {}
): StatusHistoryPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(NOW.getTime() - (days - 1 - index) * 86400 * 1000);
    return {
      label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      status: index in overrides ? overrides[index] : "operational",
    };
  });
}

const items: StatusListItem[] = [
  {
    id: "api",
    name: "API pública",
    icon: <Globe className="size-5" />,
    status: "operational",
    updatedAt: hoursAgo(16),
    history: makeHistory(90, { 41: "degraded" }),
    detailTitle: "Últimos 90 dias",
    content: (
      <p className="text-sm text-muted-foreground">
        Respostas abaixo de 300 ms no percentil 95. Mudanças de contrato são avisadas com 30 dias de
        antecedência.
      </p>
    ),
  },
  {
    id: "painel",
    name: "Painel web",
    icon: <Table2 className="size-5" />,
    status: "operational",
    updatedAt: hoursAgo(2),
  },
  {
    id: "webhooks",
    name: "Webhooks",
    icon: <Webhook className="size-5" />,
    status: "operational",
    updatedAt: hoursAgo(5),
  },
  {
    id: "csv",
    name: "Exportação CSV",
    icon: <Package className="size-5" />,
    status: "operational",
    updatedAt: hoursAgo(30),
  },
  {
    id: "registry",
    name: "Registry de componentes",
    icon: <Boxes className="size-5" />,
    status: "degraded",
    updatedAt: hoursAgo(1),
  },
];

export const Default: Story = {
  args: { items, now: NOW, defaultValue: ["api"] },
};

export const ComIncidente: Story = {
  args: {
    now: NOW,
    defaultValue: ["registry"],
    items: [
      items[0],
      {
        id: "registry",
        name: "Registry de componentes",
        icon: <Boxes className="size-5" />,
        status: "outage",
        updatedAt: hoursAgo(1),
        history: makeHistory(90, { 86: "outage", 87: "outage", 88: "outage", 89: "outage" }),
        detailTitle: "Últimos 90 dias",
        content: (
          <p className="text-sm text-muted-foreground">
            Estamos investigando a queda. Instale pelo npm enquanto o registry não volta.
          </p>
        ),
      },
    ],
  },
};

export const SemNumeros: Story = {
  args: {
    now: NOW,
    numbered: false,
    multiple: false,
    items: items.map((item) => ({
      ...item,
      history: item.history ?? makeHistory(30),
    })),
  },
};

export const Estreito: Story = {
  args: { items, now: NOW, defaultValue: ["api"] },
  render: (args) => (
    <div className="w-[360px]">
      <StatusList {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: { items, now: NOW, defaultValue: ["api"] },
  render: (args) => (
    <div className="dark rounded-xl bg-background p-6">
      <StatusList {...args} />
    </div>
  ),
};
