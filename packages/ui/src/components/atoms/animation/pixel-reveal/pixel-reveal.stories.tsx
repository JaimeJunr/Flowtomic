import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { PixelReveal } from "./pixel-reveal";

function Balance({ hidden }: { hidden: boolean }) {
  return (
    <div className="flex h-full flex-col justify-between p-6">
      <p className="text-sm text-muted-foreground">Patrimônio da carteira Atlas</p>
      <p className="font-mono text-3xl font-semibold">{hidden ? "R$ ••••••" : "R$ 4.218.906,40"}</p>
      <p className="text-xs text-muted-foreground">
        {hidden ? "Passe o ponteiro para ver o valor" : "Atualizado hoje, às 18h00"}
      </p>
    </div>
  );
}

function Comparison({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-mono text-4xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/PixelReveal",
  component: PixelReveal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Uma grade de pixels cobre o primeiro conteúdo, o conteúdo troca por baixo e os pixels somem, revelando o segundo. Útil para saldo escondido e comparação antes/depois.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    gridSize: { control: { type: "range", min: 4, max: 24, step: 1 } },
    stepDuration: { control: { type: "range", min: 0.1, max: 1.5, step: 0.05 } },
    pattern: {
      control: "inline-radio",
      options: [
        "random",
        "dither",
        "ripple",
        "wipe",
        "center",
        "edges",
        "left-to-right",
        "right-to-left",
        "top-to-bottom",
        "bottom-to-top",
        "diagonal",
        "spiral",
      ],
    },
    randomness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    trigger: { control: "inline-radio", options: ["hover", "click"] },
    once: { control: "boolean" },
    gap: { control: { type: "range", min: 0, max: 8, step: 1 } },
    pixelRadius: { control: { type: "range", min: 0, max: 50, step: 1 } },
    pixelScale: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pixelSpin: { control: { type: "range", min: 0, max: 360, step: 15 } },
    fade: { control: "boolean" },
    pixelColor: { control: "text" },
    aspectRatio: { control: "text" },
  },
  args: {
    className: "w-80",
    aspectRatio: "4 / 3",
    firstContent: <Balance hidden />,
    secondContent: <Balance hidden={false} />,
  },
} satisfies Meta<typeof PixelReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Xadrez: Story = {
  args: { pattern: "dither", gridSize: 12 },
};

export const OndaDoPonteiro: Story = {
  args: { pattern: "ripple", randomness: 0.15, gridSize: 14 },
};

export const VarreduraPelaBorda: Story = {
  args: { pattern: "wipe", randomness: 0.2, stepDuration: 0.6 },
};

export const DoCentroParaFora: Story = {
  args: { pattern: "center", randomness: 0.1, gridSize: 12 },
};

export const DasBordasParaDentro: Story = {
  args: { pattern: "edges", randomness: 0.1, gridSize: 12 },
};

export const Espiral: Story = {
  args: { pattern: "spiral", randomness: 0, gridSize: 10, stepDuration: 0.8 },
};

export const DiagonalComPixelsRedondos: Story = {
  args: { pattern: "diagonal", pixelRadius: 50, pixelSpin: 90, pixelScale: 0.3, gridSize: 12 },
};

export const EsquerdaParaDireitaSemFade: Story = {
  args: { pattern: "left-to-right", fade: false, gap: 2, randomness: 0, gridSize: 12 },
};

export const ComCliqueEUmaVez: Story = {
  args: {
    trigger: "click",
    once: true,
    firstContent: (
      <Comparison
        label="Antes do rebalanceamento"
        value="62% em renda fixa"
        note="Clique para ver"
      />
    ),
    secondContent: (
      <Comparison
        label="Depois do rebalanceamento"
        value="48% em renda fixa"
        note="Posição final"
      />
    ),
  },
};

export const Controlado: Story = {
  render: function Controlado(args) {
    const [active, setActive] = React.useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <PixelReveal {...args} active={active} onActiveChange={setActive} trigger="click" />
        <p className="text-sm text-muted-foreground">{active ? "Valor visível" : "Valor oculto"}</p>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PixelReveal {...args} />
    </MotionConfig>
  ),
};
