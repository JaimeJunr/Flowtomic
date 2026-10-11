import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { IridescentFoil } from "./iridescent-foil";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cartão Platinum, aprovado em minutos
      </h2>
      <p className="max-w-lg text-foreground">
        Limite definido pela sua renda, sem anuidade no primeiro ano e fatura aberta no aplicativo.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Solicitar meu cartão
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/IridescentFoil",
  component: IridescentFoil,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL que imita papel holográfico: dobras líquidas cuja cor muda de tom conforme a curvatura. O mouse empurra o padrão e clareia a região próxima. Sem WebGL, mostra um gradiente cônico CSS.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    scale: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    detail: { control: { type: "range", min: 2, max: 8, step: 1 } },
    saturation: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <IridescentFoil {...args} className="min-h-[480px] bg-background">
      <Hero />
    </IridescentFoil>
  ),
} satisfies Meta<typeof IridescentFoil>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vivid: Story = { args: { saturation: 1, detail: 7 } };

export const LargeFolds: Story = { args: { scale: 2.2, detail: 3, speed: 0.6 } };

export const Tinted: Story = { args: { tint: "--primary" } };

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
