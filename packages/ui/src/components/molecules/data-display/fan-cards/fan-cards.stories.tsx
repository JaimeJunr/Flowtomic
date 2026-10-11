import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { type FanCardItem, FanCards } from "./fan-cards";

function Cover({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex size-full flex-col justify-end bg-gradient-to-br from-primary/30 to-muted p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="font-mono text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

const documents: FanCardItem[] = [
  {
    id: "extrato",
    label: "Extrato de setembro",
    content: <Cover title="Extrato de setembro" detail="Carteira Conservadora" />,
  },
  {
    id: "informe",
    label: "Informe de rendimentos",
    content: <Cover title="Informe de rendimentos" detail="Ano-base 2025" />,
  },
  {
    id: "contrato",
    label: "Contrato de custódia",
    content: <Cover title="Contrato de custódia" detail="Vigente desde 03/2024" />,
  },
  {
    id: "nota",
    label: "Nota de corretagem",
    content: <Cover title="Nota de corretagem" detail="Pregão de 02/10" />,
  },
  {
    id: "come-cotas",
    label: "Demonstrativo de come-cotas",
    content: <Cover title="Come-cotas" detail="Maio e novembro" />,
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/FanCards",
  component: FanCards,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Leque de 3 a 7 cartões sobrepostos para vitrine compacta de documentos, relatórios e planos. Os cartões entram com um quique; ao passar o mouse, o cartão endireita e os vizinhos se afastam. Com movimento reduzido, tudo aparece de uma vez.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    cardSize: { control: "number" },
    spread: { control: "number" },
    rotation: { control: "number" },
    arc: { control: "number" },
    pushDistance: { control: "number" },
    hoverScale: { control: "number" },
    bounciness: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    delay: { control: "number" },
    stagger: { control: "number" },
    interactive: { control: "boolean" },
  },
  args: { items: documents, "aria-label": "Documentos da carteira" },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-full py-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FanCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithArc: Story = { args: { arc: 24, rotation: 6 } };

export const FirmBounce: Story = { args: { bounciness: 0.1, stagger: 0.12 } };

export const Static: Story = { args: { interactive: false } };

function SelectableDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <FanCards
        items={documents}
        aria-label="Documentos da carteira"
        onSelect={(i) => setSelected(documents[i].label)}
      />
      <p className="text-center text-sm text-muted-foreground">
        {selected ? `Aberto: ${selected}` : "Escolha um documento para abrir."}
      </p>
    </div>
  );
}

export const Selectable: Story = { render: () => <SelectableDemo /> };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <FanCards {...args} />
    </MotionConfig>
  ),
};
