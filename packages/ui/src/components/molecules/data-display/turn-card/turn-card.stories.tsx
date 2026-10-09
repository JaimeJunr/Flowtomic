import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { TurnCard } from "./turn-card";

const FICHA: ReadonlyArray<readonly [string, string]> = [
  ["Gestor", "Atlântico Capital"],
  ["Taxa de administração", "1,2% ao ano"],
  ["Taxa de performance", "20% sobre 100% do CDI"],
  ["Liquidez", "D+30 para resgate"],
];

const Frente = (
  <div className="flex h-full flex-col justify-between p-6">
    <div>
      <p className="font-display font-semibold text-lg">Fundo Atlântico FIM</p>
      <p className="text-muted-foreground text-sm">Multimercado</p>
    </div>
    <div>
      <p className="font-mono text-4xl text-foreground">12,4%</p>
      <p className="text-muted-foreground text-sm">rentabilidade em 12 meses</p>
    </div>
  </div>
);

const Verso = (
  <div className="flex h-full flex-col gap-4 p-6">
    <p className="font-display font-semibold text-lg">Ficha técnica</p>
    <dl className="grid gap-3 text-sm">
      {FICHA.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt className="text-muted-foreground">{rotulo}</dt>
          <dd className="font-mono text-foreground">{valor}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TurnCard",
  component: TurnCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartão de duas faces que vira numa mola: clique, teclado ou girando com a mão. No hover inclina e ganha um brilho. O tamanho vem do pai ou do className.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    axis: { control: "inline-radio", options: ["y", "x"] },
    flipOnClick: { control: "boolean" },
    draggable: { control: "boolean" },
    dragDistance: { control: "number" },
    tilt: { control: "boolean" },
    tiltMax: { control: "number" },
    glare: { control: "boolean" },
    hoverScale: { control: "number" },
    perspective: { control: "number" },
    stiffness: { control: "number" },
    damping: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    front: Frente,
    back: Verso,
    className: "h-96 w-72",
    onFlippedChange: fn(),
  },
} satisfies Meta<typeof TurnCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EixoX: Story = { args: { axis: "x" } };

export const SemArrastar: Story = { args: { draggable: false } };

export const SemInclinacao: Story = { args: { tilt: false, glare: false } };

export const Controlado: Story = {
  render: (args) => {
    const [flipped, setFlipped] = React.useState(false);
    return (
      <div className="flex flex-col items-center gap-6">
        <TurnCard {...args} flipped={flipped} onFlippedChange={setFlipped} />
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => setFlipped((atual) => !atual)}
        >
          {flipped ? "Mostrar resumo" : "Mostrar ficha técnica"}
        </button>
      </div>
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <TurnCard {...args} />
    </MotionConfig>
  ),
};
