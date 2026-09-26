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
          "Entregas da semana: diz de longe o que está atrasado e o que vence até sexta, com a tabela do que vence, a meta do mês, o cronômetro e quem está em quê. Instale com `bunx flowtomic-cli add-block flowtomic-dashboard`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    monthGoal: { control: { type: "number", min: 1 } },
    appName: { control: "text" },
  },
} satisfies Meta<typeof FlowtomicDashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTimer: Story = {
  args: {
    timer: { elapsedSeconds: 5048, deliveryTitle: "Story do date-range-picker" },
  },
};

export const WeekClear: Story = {
  args: {
    deliveries: [
      {
        id: "1",
        title: "Migrar docs do deploy",
        owner: "Revisora",
        dueDate: new Date(Date.now() + 14 * 86_400_000),
        state: "em-andamento",
      },
    ],
  },
};

export const Empty: Story = {
  args: { deliveries: [] },
};
