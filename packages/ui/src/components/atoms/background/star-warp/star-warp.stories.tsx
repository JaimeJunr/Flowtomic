import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { StarWarp } from "./star-warp";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-start justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira rumo ao próximo patamar
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe aportes, proventos e rentabilidade de todos os seus ativos em um só lugar.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Abrir minha carteira
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/StarWarp",
  component: StarWarp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com um campo de estrelas em camadas de profundidade: a pessoa voa devagar por ele, as estrelas cintilam e as mais fortes têm cruz de brilho. O mouse afasta as estrelas por perto e o clique dá um salto em velocidade de dobra. Sem WebGL, mostra pontos em CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    density: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    layers: { control: { type: "range", min: 2, max: 8, step: 1 } },
    starSize: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    flare: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    twinkle: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    travel: { control: { type: "range", min: -2, max: 2, step: 0.1 } },
    rotation: { control: { type: "range", min: -2, max: 2, step: 0.05 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <StarWarp {...args} className="min-h-[480px]">
        <Hero />
      </StarWarp>
    </div>
  ),
} satisfies Meta<typeof StarWarp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DenseAndDeep: Story = { args: { density: 2, layers: 8, starSize: 0.7 } };

export const Sparse: Story = { args: { density: 0.4, layers: 3, starSize: 1.6, flare: 1.6 } };

export const Retreating: Story = { args: { travel: -1, rotation: 0 } };

export const SingleColor: Story = { args: { colors: ["--primary"], twinkle: 0.6 } };

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
