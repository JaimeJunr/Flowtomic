import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ContourLines } from "./contour-lines";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Veja o relevo do seu patrimônio
      </h2>
      <p className="max-w-lg text-foreground">
        Cada linha marca um nível de risco; onde elas se apertam, a carteira está mais concentrada.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Analisar minha carteira
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/ContourLines",
  component: ContourLines,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de linhas finas e paralelas, inclinadas, que ondulam juntas como curvas de nível. Num trecho se apertam e brilham; em outro se abrem e somem. O mouse empurra as linhas por perto. Sem WebGL, mostra listras CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    lineCount: { control: { type: "range", min: 8, max: 80, step: 1 } },
    warp: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    rotation: { control: { type: "range", min: -180, max: 180, step: 5 } },
    brightness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <ContourLines {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </ContourLines>
  ),
} satisfies Meta<typeof ContourLines>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dense: Story = { args: { lineCount: 70, warp: 0.6 } };

export const Sparse: Story = { args: { lineCount: 12, brightness: 0.9 } };

export const Turbulent: Story = { args: { warp: 2, speed: 0.8 } };

export const Vertical: Story = { args: { rotation: 0 } };

export const SuccessPalette: Story = {
  args: { colors: ["--success", "--foreground", "--warning"] },
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
