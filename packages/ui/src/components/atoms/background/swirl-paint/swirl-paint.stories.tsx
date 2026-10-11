import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SwirlPaint } from "./swirl-paint";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira inteira, num só redemoinho
      </h2>
      <p className="max-w-lg text-foreground">
        Acompanhe aportes, resgates e rendimentos de todas as contas sem trocar de tela.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Conectar minhas contas
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/SwirlPaint",
  component: SwirlPaint,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de tinta de três cores girando, com limites nítidos e pixelização de tela antiga. O centro gira mais rápido que as bordas e o mouse desloca o centro do giro. Sem WebGL, mostra um gradiente cônico CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    spin: { control: { type: "range", min: -3, max: 3, step: 0.1 } },
    contrast: { control: { type: "range", min: 0.5, max: 4, step: 0.1 } },
    pixelSize: { control: { type: "range", min: 1, max: 12, step: 1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <SwirlPaint {...args} className="min-h-[480px] bg-background">
      <Hero />
    </SwirlPaint>
  ),
} satisfies Meta<typeof SwirlPaint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Chunky: Story = { args: { pixelSize: 8, contrast: 3.5 } };

export const Smooth: Story = { args: { pixelSize: 1, contrast: 0.8 } };

export const ReverseSpin: Story = { args: { spin: -2, speed: 1.5 } };

export const SuccessPalette: Story = {
  args: { colors: ["--success", "--warning", "--background"] },
};

export const Frozen: Story = { args: { speed: 0, pointer: false } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
