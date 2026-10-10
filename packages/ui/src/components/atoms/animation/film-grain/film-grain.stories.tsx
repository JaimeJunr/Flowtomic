import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { FilmGrain, type FilmGrainProps } from "./film-grain";

function HeroBlock(props: FilmGrainProps) {
  return (
    <div className="relative isolate w-[36rem] overflow-hidden rounded-lg bg-primary p-10 text-primary-foreground">
      <h2 className="font-display text-3xl font-semibold">Carteiras consolidadas até as 9h</h2>
      <p className="mt-3 max-w-md text-sm">
        Cotas, fluxo de caixa e enquadramento conciliados antes da abertura do mercado, sem planilha
        no meio.
      </p>
      <FilmGrain {...props} />
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/FilmGrain",
  component: FilmGrain,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Granulado de filme por cima de uma área, para tirar a cara de chapado de fundos lisos. Poeira, riscos, varredura e tremor são opcionais.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: { type: "number", min: 1, max: 6 } },
    fps: { control: { type: "number", min: 0, max: 60 } },
    blendMode: {
      control: "inline-radio",
      options: ["normal", "overlay", "soft-light", "multiply", "screen"],
    },
    contrast: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dust: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    scratches: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    scanlines: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    flicker: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    fixed: { control: "boolean" },
  },
  render: (args) => <HeroBlock {...args} />,
} satisfies Meta<typeof FilmGrain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Coarse: Story = {
  args: { size: 3, opacity: 0.25, contrast: 0.9 },
};

export const Dusty: Story = {
  args: { dust: 0.6, opacity: 0.2 },
};

export const Scratched: Story = {
  args: { scratches: 0.8, dust: 0.2, flicker: 0.4 },
};

export const Scanlines: Story = {
  args: { scanlines: 0.8, opacity: 0.2, blendMode: "soft-light" },
};

export const Still: Story = {
  args: { fps: 0, opacity: 0.2 },
};

export const ReducedMotion: Story = {
  args: { dust: 0.4, scratches: 0.8, scanlines: 0.5, flicker: 0.5 },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <HeroBlock {...args} />
    </MotionConfig>
  ),
};
