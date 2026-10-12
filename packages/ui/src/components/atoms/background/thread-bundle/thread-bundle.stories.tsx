import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ThreadBundle } from "./thread-bundle";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Todos os seus fluxos de caixa, em um só feixe
      </h2>
      <p className="max-w-lg text-foreground">
        Acompanhe cada conta lado a lado e veja onde os caminhos se separam.
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
  title: "Flowtomic UI/Atoms/Background/ThreadBundle",
  component: ThreadBundle,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de dezenas de fios finos que atravessam a tela na diagonal, ondulando juntos como uma fita de seda. Num ponto do caminho os fios se soltam e se abrem em leque; os de fora ficam mais fracos e macios. O mouse empurra a onda. Sem WebGL, mostra uma faixa diagonal em CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    lineCount: { control: { type: "range", min: 8, max: 160, step: 1 } },
    thickness: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    amplitude: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    spread: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    split: { control: { type: "range", min: 0, max: 1, step: 0.02 } },
    angle: { control: { type: "range", min: -180, max: 180, step: 5 } },
    speed: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <ThreadBundle {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </ThreadBundle>
  ),
} satisfies Meta<typeof ThreadBundle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPointer: Story = { args: { pointer: true } };

export const AccentFringe: Story = { args: { color: "--foreground", accentColor: "--primary" } };

export const Dense: Story = { args: { lineCount: 150, thickness: 0.4 } };

export const Wide: Story = { args: { spread: 1, split: 0.3, amplitude: 2.5 } };

export const Flat: Story = { args: { amplitude: 0, angle: 0 } };

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
