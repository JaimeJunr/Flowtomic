import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ElevationMap } from "./elevation-map";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        O relevo dos seus investimentos, em um só mapa
      </h2>
      <p className="max-w-lg text-foreground">
        Cada curva marca um nível de retorno da carteira; as cristas mostram onde o dinheiro
        trabalha mais.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Ver minha carteira
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/ElevationMap",
  component: ElevationMap,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de mapa topográfico: curvas de nível finas que se transformam devagar, com cor de vale, meio e crista e um brilho suave em cada linha. O mouse levanta um morro sob o cursor. Sem WebGL, mostra anéis concêntricos em CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.05 } },
    morph: { control: { type: "range", min: 0, max: 5, step: 0.1 } },
    bands: { control: { type: "range", min: 0.5, max: 8, step: 0.1 } },
    thickness: { control: { type: "range", min: 0.002, max: 0.05, step: 0.002 } },
    scale: { control: { type: "range", min: 0.3, max: 4, step: 0.1 } },
    glow: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    fill: { control: "boolean" },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <ElevationMap {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </ElevationMap>
  ),
} satisfies Meta<typeof ElevationMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dense: Story = { args: { bands: 6, thickness: 0.006 } };

export const Filled: Story = { args: { fill: true, glow: 1 } };

export const Restless: Story = { args: { morph: 5, speed: 0.8 } };

export const Zoomed: Story = { args: { scale: 2.5, bands: 3 } };

export const WarmColors: Story = { args: { colors: ["--warning", "--primary", "--foreground"] } };

export const NoPointer: Story = { args: { pointer: false } };

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
