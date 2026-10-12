import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { LightColumn } from "./light-column";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-start justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada aporte sobe junto com a sua meta
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Veja o patrimônio crescer mês a mês, com rentabilidade e aportes no mesmo painel.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Criar minha meta de investimento
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/LightColumn",
  component: LightColumn,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com uma coluna de luz inclinada, feita de filamentos que se torcem. O mouse inclina a coluna e o clique manda um pulso subindo por ela. Sem WebGL, mostra uma faixa de gradiente CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    intensity: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    width: { control: { type: "range", min: 0.1, max: 1, step: 0.05 } },
    tilt: { control: { type: "range", min: -60, max: 60, step: 1 } },
    twist: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    detail: { control: { type: "range", min: 1, max: 6, step: 1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    grain: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <LightColumn {...args} className="min-h-[480px]">
        <Hero />
      </LightColumn>
    </div>
  ),
} satisfies Meta<typeof LightColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WideAndTwisted: Story = { args: { width: 0.6, twist: 1.4, detail: 6 } };

export const Slim: Story = { args: { width: 0.12, tilt: 10, intensity: 1.4 } };

export const AlternativeColors: Story = {
  args: { colors: ["--info", "--success"], grain: 0.2 },
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
