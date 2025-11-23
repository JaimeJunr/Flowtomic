import type { Meta, StoryObj } from "@storybook/react-vite";
import FlowtomicDashboardPage from "./page";

const meta = {
  title: "Flowtomic UI/Blocks/FlowtomicDashboard",
  component: FlowtomicDashboardPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Dashboard completo com sidebar, header, estatísticas, gráficos, listas de projetos e equipe, e timer. Este block pode ser instalado via CLI usando `bunx flowtomic@latest add-block flowtomic-dashboard`.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FlowtomicDashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <FlowtomicDashboardPage />,
};
