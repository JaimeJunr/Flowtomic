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
          "Esqueleto de app: sidebar, cabeçalho e uma área vazia que mostra onde fica o conteúdo e o comando do primeiro componente. Instale com `bunx flowtomic-cli add-block dashboard-01`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    appName: { control: "text" },
    pagePath: { control: "text" },
  },
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomProject: Story = {
  args: {
    appName: "Painel interno",
    pagePath: "src/pages/home.tsx",
  },
};
