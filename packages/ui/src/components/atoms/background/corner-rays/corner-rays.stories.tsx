import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { CornerRays } from "./corner-rays";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-start justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira, com a luz do dia
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe rentabilidade, proventos e vencimentos de todos os seus fundos em um só lugar.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Abrir minha carteira
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/CornerRays",
  component: CornerRays,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com um leque de raios que entra por um canto, em duas camadas de cores que tremulam devagar. A luz apaga com a distância. Sem WebGL, mostra um gradiente radial CSS no canto escolhido. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    origin: {
      control: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    intensity: { control: { type: "range", min: 0, max: 4, step: 0.1 } },
    spread: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    tilt: { control: { type: "range", min: -90, max: 90, step: 1 } },
    blend: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    falloff: { control: { type: "range", min: 0.3, max: 4, step: 0.1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
  },
  render: (args) => (
    <div className="dark bg-background">
      <CornerRays {...args} className="min-h-[480px]">
        <Hero />
      </CornerRays>
    </div>
  ),
} satisfies Meta<typeof CornerRays>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopLeft: Story = { args: { origin: "top-left" } };

export const BottomRight: Story = { args: { origin: "bottom-right", tilt: 15 } };

export const WideAndSoft: Story = { args: { spread: 3, falloff: 0.8, intensity: 1 } };

export const AlternativeColors: Story = {
  args: { colors: ["--primary", "--success"], blend: 0.3 },
};

export const Frozen: Story = { args: { speed: 0 } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
