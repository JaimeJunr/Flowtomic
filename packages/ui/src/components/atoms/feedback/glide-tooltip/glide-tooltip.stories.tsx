import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Link, List, Underline } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Button } from "../../actions/button/button";
import { GlideTooltip, GlideTooltipGroup } from "./glide-tooltip";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/GlideTooltip",
  component: GlideTooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Rótulo compartilhado para barras de ferramentas: o primeiro hover espera, o seguinte desliza até o botão vizinho. Fora de um GlideTooltipGroup funciona sozinho, sem deslizar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    delayMs: { control: "number" },
    showFuse: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    content: "Negrito",
    shortcut: "⌘B",
    side: "top",
    children: (
      <Button variant="outline" size="icon" aria-label="Negrito">
        <Bold />
      </Button>
    ),
  },
} satisfies Meta<typeof GlideTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const FERRAMENTAS = [
  { icone: Bold, rotulo: "Negrito", atalho: "⌘B" },
  { icone: Italic, rotulo: "Itálico", atalho: "⌘I" },
  { icone: Underline, rotulo: "Sublinhado", atalho: "⌘U" },
  { icone: Link, rotulo: "Inserir link", atalho: "⌘K" },
  { icone: List, rotulo: "Lista com marcadores", atalho: "⌘⇧8" },
];

function Barra({ travelMs, showFuse }: { travelMs?: number; showFuse?: boolean }) {
  return (
    <GlideTooltipGroup travelMs={travelMs}>
      <div className="flex gap-1 rounded-lg border bg-card p-1">
        {FERRAMENTAS.map(({ icone: Icone, rotulo, atalho }) => (
          <GlideTooltip key={rotulo} content={rotulo} shortcut={atalho} showFuse={showFuse}>
            <Button variant="ghost" size="icon" aria-label={rotulo}>
              <Icone />
            </Button>
          </GlideTooltip>
        ))}
      </div>
    </GlideTooltipGroup>
  );
}

export const BarraDeFerramentas: Story = {
  render: () => <Barra />,
};

export const Sozinho: Story = {};

export const Lados: Story = {
  render: () => (
    <div className="flex gap-6 p-16">
      {(["top", "bottom", "left", "right"] as const).map((lado) => (
        <GlideTooltip key={lado} content={`Rótulo à ${lado}`} side={lado}>
          <Button variant="outline">{lado}</Button>
        </GlideTooltip>
      ))}
    </div>
  ),
};

export const ComPavio: Story = {
  render: () => <Barra showFuse />,
};

export const SemDeslize: Story = {
  render: () => <Barra travelMs={0} />,
};

export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <Barra />
    </MotionConfig>
  ),
};
