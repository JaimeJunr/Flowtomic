import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { PlasmaRibbons } from "./plasma-ribbons";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-start justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Duas carteiras, um só rendimento
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe renda fixa e ações lado a lado e veja onde cada real está trabalhando.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Consolidar minhas carteiras
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/PlasmaRibbons",
  component: PlasmaRibbons,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com duas fitas de plasma que atravessam a tela em ondas e se enroscam no próprio caminho. Os pontos mais fortes ficam quase brancos e há uma luz macia ao redor. Perto do mouse as fitas incham e acendem. Sem WebGL, mostra duas faixas de gradiente CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    reverse: { control: "boolean" },
    thickness: { control: { type: "range", min: 0.05, max: 1, step: 0.05 } },
    rotation: { control: { type: "range", min: -180, max: 180, step: 1 } },
    glow: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    core: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    grain: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <PlasmaRibbons {...args} className="min-h-[480px]">
        <Hero />
      </PlasmaRibbons>
    </div>
  ),
} satisfies Meta<typeof PlasmaRibbons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Opposed: Story = { args: { reverse: true, bend: [1.6, 1.2] } };

export const Thick: Story = { args: { thickness: 0.7, glow: 1.6, core: 0.9 } };

export const Diagonal: Story = { args: { rotation: 30, thickness: 0.15, glow: 0.6 } };

export const AlternativeColors: Story = {
  args: { colors: ["--success", "--warning"], grain: 0.1 },
};

export const Frozen: Story = { args: { speed: 0 } };

export const WithoutPointer: Story = { args: { pointer: false } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
