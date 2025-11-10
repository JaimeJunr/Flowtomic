import type { Meta, StoryObj } from "@storybook/react-vite";
import DashboardPage from "./page";

const meta = {
  title: "Flowtomic UI/Blocks/Dashboard-01",
  component: DashboardPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Exemplo de block de dashboard com cards. Este block pode ser instalado via CLI usando `bunx @flowtomic/cli add dashboard-01`.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DashboardPage />,
};

export const WithCustomContent: Story = {
  render: () => <DashboardPage />,
  parameters: {
    docs: {
      description: {
        story:
          "Este é um exemplo básico de dashboard. Você pode customizar os cards e adicionar mais conteúdo conforme necessário.",
      },
    },
  },
};

