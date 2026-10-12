import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { DriftLines } from "./drift-lines";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Seu patrimônio em movimento, sem ruído
      </h2>
      <p className="max-w-lg text-foreground">
        Veja carteira, fluxo de caixa e metas no mesmo painel, atualizados a cada lançamento.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir meu painel
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/DriftLines",
  component: DriftLines,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de até três feixes de fios finos de luz que flutuam em curvas suaves, com brilho mais forte no miolo do feixe e gradiente de cor ao longo do fio. O mouse curva os fios por perto e desliza a cena (paralaxe). Sem WebGL, mostra uma faixa diagonal em CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    lineCount: { control: { type: "range", min: 1, max: 12, step: 1 } },
    lineGap: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    bend: { control: { type: "range", min: -2, max: 2, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <DriftLines {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </DriftLines>
  ),
} satisfies Meta<typeof DriftLines>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleBeam: Story = { args: { waves: ["middle"], lineCount: 10 } };

export const TopAndBottom: Story = { args: { waves: ["top", "bottom"], lineGap: 2 } };

export const Dense: Story = { args: { lineCount: 12, lineGap: 0.4 } };

export const StrongBend: Story = { args: { bend: 2 } };

export const WarmColors: Story = { args: { colors: ["--warning", "--primary"] } };

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
