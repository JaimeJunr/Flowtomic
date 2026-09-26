import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DashboardMovementsSection } from "./dashboard-movements-section";

// Cores de status por publicação: o default do componente só reconhece
// DISPONÍVEL/RESERVADO/VENDIDO (ou AVAILABLE/RESERVED/SOLD), então as stories
// passam getStatusColor próprio pro vocabulário de release.
const getStatusColor = (tag: string): string => {
  switch (tag.toUpperCase()) {
    case "PUBLICADO":
      return "bg-success/10 text-success border border-success/30";
    case "AGUARDANDO CI":
      return "bg-accent text-accent-foreground border border-accent-hover";
    case "DEPRECIADO":
      return "bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/30";
    default:
      return "bg-muted text-foreground border border-border";
  }
};

const releases = [
  {
    id: "1",
    name: "@flowtomic/ui",
    price: "0.8.0",
    tag: "Publicado",
    buttonText: "Ver no npm",
    onButtonClick: fn(),
  },
  {
    id: "2",
    name: "@flowtomic/logic",
    price: "0.1.8",
    tag: "Aguardando CI",
    buttonText: "Ver build",
    onButtonClick: fn(),
  },
  {
    id: "3",
    name: "flowtomic-cli",
    price: "0.2.1",
    tag: "Publicado",
    buttonText: "Ver no npm",
    onButtonClick: fn(),
  },
];

const meta = {
  title: "Flowtomic UI/Organisms/DashboardMovementsSection",
  component: DashboardMovementsSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    periodBadge: {
      control: "text",
    },
  },
} satisfies Meta<typeof DashboardMovementsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    movements: releases,
    title: "Publicações recentes",
    periodBadge: "7 dias",
    getStatusColor,
  },
};

export const Empty: Story = {
  args: {
    movements: [],
    title: "Publicações recentes",
    periodBadge: "7 dias",
    emptyMessage: "Nenhuma publicação nos últimos 7 dias",
  },
};

export const CustomPeriod: Story = {
  args: {
    movements: releases,
    title: "Publicações",
    periodBadge: "30 dias",
    getStatusColor,
  },
};

export const CustomTitle: Story = {
  args: {
    movements: releases,
    title: "Builds do registry",
    periodBadge: "última semana",
    getStatusColor,
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    movements: [],
    title: "Publicações",
    periodBadge: "7 dias",
    emptyMessage: "Nenhum pacote publicado neste período",
  },
};
