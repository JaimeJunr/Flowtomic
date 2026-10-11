import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { LightBeams } from "./light-beams";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Veja cada vencimento antes que ele chegue
      </h2>
      <p className="max-w-lg text-muted-foreground">
        O calendário reúne cupons, resgates e dividendos da sua carteira em uma única linha do
        tempo.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir meu calendário
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/LightBeams",
  component: LightBeams,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com feixes de luz que saem de um ponto da borda e se abrem em leque, tremulando devagar. Com o mouse, o leque gira um pouco. Sem WebGL, mostra um gradiente radial equivalente. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    spread: { control: { type: "range", min: 0.4, max: 2, step: 0.1 } },
    length: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
    intensity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    origin: {
      control: "select",
      options: [
        "top-center",
        "top-left",
        "top-right",
        "left",
        "right",
        "bottom-center",
        "bottom-left",
        "bottom-right",
      ],
    },
  },
  render: (args) => (
    <div className="dark bg-background">
      <LightBeams {...args} className="min-h-[480px]">
        <Hero />
      </LightBeams>
    </div>
  ),
} satisfies Meta<typeof LightBeams>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LightTheme: Story = {
  args: { color: "--primary", intensity: 0.7 },
  render: (args) => (
    <div className="bg-background">
      <LightBeams {...args} className="min-h-[480px]">
        <Hero />
      </LightBeams>
    </div>
  ),
};

export const FromTopLeft: Story = { args: { origin: "top-left", spread: 0.8 } };

export const FromRight: Story = { args: { origin: "right", length: 2 } };

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
