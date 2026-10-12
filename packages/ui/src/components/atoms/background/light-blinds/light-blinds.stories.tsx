import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { LightBlinds } from "./light-blinds";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira inteira em uma só leitura
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Posições, rentabilidade e vencimentos de todas as corretoras, atualizados toda manhã antes
        da abertura.
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
  title: "Flowtomic UI/Atoms/Background/LightBlinds",
  component: LightBlinds,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com uma persiana de lâminas verticais: cada lâmina tem um lado aceso, o degradê das cores do tema corre por elas e um holofote redondo segue o mouse. Sem mouse, o holofote fica no centro. Sem WebGL, mostra listras verticais sob uma máscara radial. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    angle: { control: { type: "range", min: -90, max: 90, step: 5 } },
    blindCount: { control: { type: "range", min: 2, max: 64, step: 1 } },
    blindMinWidth: { control: { type: "range", min: 20, max: 200, step: 5 } },
    spotlightRadius: { control: { type: "range", min: 0.1, max: 1.5, step: 0.05 } },
    spotlightSoftness: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    shine: { control: "inline-radio", options: ["left", "right"] },
    noise: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
  },
  render: (args) => (
    <div className="dark bg-background">
      <LightBlinds {...args} className="min-h-[480px]">
        <Hero />
      </LightBlinds>
    </div>
  ),
} satisfies Meta<typeof LightBlinds>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShineRight: Story = { args: { shine: "right" } };

export const Tilted: Story = { args: { angle: 20, blindCount: 24 } };

export const FewWideBlinds: Story = { args: { blindCount: 6, blindMinWidth: 120 } };

export const WideSoftSpotlight: Story = {
  args: {
    spotlightRadius: 1,
    spotlightSoftness: 0.6,
    colors: ["--primary", "--info", "--success"],
  },
};

export const SingleColor: Story = { args: { colors: ["--primary"] } };

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
