import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { MagnetLines } from "./magnet-lines";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/MagnetLines",
  component: MagnetLines,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Grade de tracinhos que giram para apontar ao ponteiro, como limalha em volta de um ímã. Decorativa: ilustra estados vazios, telas de login e heros sem imagem. Com movimento reduzido os traços ficam fixos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rows: { control: { type: "number", min: 1, max: 20 } },
    columns: { control: { type: "number", min: 1, max: 20 } },
    lineColor: { control: "text" },
    lineWidth: { control: "text" },
    lineLength: { control: "text" },
    baseAngle: { control: { type: "number", min: -180, max: 180 } },
  },
  decorators: [
    (Story) => (
      <div className="p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MagnetLines>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GradeDensa: Story = {
  args: { rows: 14, columns: 14, lineLength: "16px", lineWidth: "1.5px" },
};

export const TracosGrossos: Story = {
  args: { rows: 6, columns: 6, lineLength: "36px", lineWidth: "5px", lineColor: "var(--primary)" },
};

export const RepousoVertical: Story = {
  args: { baseAngle: 0, lineColor: "var(--border)" },
};

export const EstadoVazioDeCarteira: Story = {
  render: (args) => (
    <div className="relative flex h-80 w-[28rem] items-center justify-center rounded-lg border bg-card text-card-foreground">
      <MagnetLines {...args} className="absolute inset-0 size-full opacity-60" />
      <div className="relative text-center">
        <p className="text-lg font-semibold">Nenhuma carteira ainda</p>
        <p className="text-sm text-muted-foreground">
          Importe seus ativos para acompanhar o patrimônio.
        </p>
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
