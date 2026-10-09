import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { GenerationFrame, type GenerationStatus } from "./generation-frame";

// Só formas com fill-opacity: num <img> o currentColor é preto, então as faixas variam por opacidade.
const CAPA_SVG = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>",
  "<rect width='400' height='300' fill-opacity='0.12'/>",
  "<rect y='170' width='400' height='130' fill-opacity='0.2'/>",
  "<circle cx='300' cy='90' r='46' fill-opacity='0.35'/>",
  "<rect x='40' y='150' width='60' height='110' fill-opacity='0.5'/>",
  "<rect x='120' y='110' width='60' height='150' fill-opacity='0.65'/>",
  "<rect x='200' y='70' width='60' height='190' fill-opacity='0.8'/>",
  "</svg>",
].join("");
const CAPA_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(CAPA_SVG)}`;
const CAPA_ALT = "Capa do relatório mensal: três barras crescentes sob um sol";

const Capa = <img src={CAPA_SRC} alt={CAPA_ALT} />;
const ETAPAS: GenerationStatus[] = ["queued", "generating", "refining", "complete"];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/GenerationFrame",
  component: GenerationFrame,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Quadro com proporção fixa para imagem gerada por IA. Cada estágio interpola desfoque, saturação e opacidade; uma faixa cruza o quadro enquanto trabalha.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["queued", "generating", "refining", "complete", "error"],
    },
    aspectRatio: { control: "text" },
    stageMs: { control: "number" },
    sweep: { control: "boolean" },
    showStatus: { control: "boolean" },
    hideAfterMs: { control: "number" },
  },
  args: { children: Capa, className: "w-80", caption: "Capa do relatório mensal de agosto" },
} satisfies Meta<typeof GenerationFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CicloCompleto: Story = {
  render: (args) => {
    const [indice, setIndice] = React.useState(0);
    const [rodando, setRodando] = React.useState(false);
    React.useEffect(() => {
      if (!rodando) return;
      const timer = setTimeout(() => {
        if (indice >= ETAPAS.length - 1) return setRodando(false);
        setIndice(indice + 1);
      }, 1800);
      return () => clearTimeout(timer);
    }, [rodando, indice]);
    return (
      <div className="flex flex-col items-center gap-4">
        <GenerationFrame {...args} status={ETAPAS[indice]} />
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full bg-foreground px-3 py-1 text-background text-sm"
            onClick={() => {
              setIndice(0);
              setRodando(true);
            }}
          >
            Gerar capa
          </button>
          {ETAPAS.map((etapa, i) => (
            <button
              key={etapa}
              type="button"
              className="rounded-full border border-border px-3 py-1 text-sm"
              onClick={() => {
                setRodando(false);
                setIndice(i);
              }}
            >
              {etapa}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

export const Estagios: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {[...ETAPAS, "error" as const].map((status) => (
        <GenerationFrame
          key={status}
          {...args}
          status={status}
          hideAfterMs={0}
          className="w-48"
          caption={undefined}
        />
      ))}
    </div>
  ),
};

export const Erro: Story = {
  args: { status: "error", onRetry: fn() },
};

export const SemFaixa: Story = {
  args: { status: "generating", sweep: false },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GenerationFrame {...args} status="generating" />
    </MotionConfig>
  ),
};
