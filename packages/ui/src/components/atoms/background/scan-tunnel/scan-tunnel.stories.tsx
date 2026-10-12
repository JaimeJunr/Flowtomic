import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ScanTunnel } from "./scan-tunnel";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira inteira sob varredura, todo dia
      </h2>
      <p className="max-w-lg text-muted-foreground">
        O monitor confere limites, enquadramento e concentração em cada ativo e avisa o que saiu do
        mandato.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Rodar a primeira verificação
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/ScanTunnel",
  component: ScanTunnel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de um túnel retangular em perspectiva, coberto por uma grade fina que some no escuro do fundo. Uma faixa de luz varre o túnel em profundidade, vai e volta, e o mouse inclina a câmera. Sem WebGL, mostra uma vinheta radial em CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    gridScale: { control: { type: "range", min: 0.05, max: 0.5, step: 0.01 } },
    lineWidth: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
    scanOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    scanDuration: { control: { type: "range", min: 0.5, max: 10, step: 0.1 } },
    scanDelay: { control: { type: "range", min: 0, max: 10, step: 0.1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <ScanTunnel {...args} className="min-h-[480px]">
        <Hero />
      </ScanTunnel>
    </div>
  ),
} satisfies Meta<typeof ScanTunnel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FineGrid: Story = { args: { gridScale: 0.06, lineWidth: 0.6 } };

export const WideCells: Story = { args: { gridScale: 0.35, lineWidth: 1.8 } };

export const SlowAndStrong: Story = {
  args: { scanDuration: 6, scanDelay: 0.5, scanOpacity: 1 },
};

export const AlternativeColors: Story = {
  args: { lineColor: "--info", scanColor: "--success" },
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
