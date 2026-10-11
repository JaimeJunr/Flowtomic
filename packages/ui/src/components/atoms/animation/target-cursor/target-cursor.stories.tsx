import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { TargetCursor, type TargetCursorProps } from "./target-cursor";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/TargetCursor",
  component: TargetCursor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Cursor em forma de mira que gira livre e encaixa nos cantos de qualquer elemento marcado com `data-cursor-target`. Use `data-cursor-label` para o rótulo. Serve para landing e portfólio, nunca para telas de trabalho denso. Em toque não aparece. Mova o mouse sobre a área para ativar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    spinDuration: { control: { type: "number", min: 0, step: 0.5 } },
    snapDuration: { control: { type: "number", min: 0, step: 0.05 } },
    size: { control: "number" },
    cornerSize: { control: "number" },
    thickness: { control: "number" },
    padding: { control: "number" },
    dotSize: { control: "number" },
    parallax: { control: "boolean" },
    matchRadius: { control: "boolean" },
    showLabel: { control: "boolean" },
    pressEffect: { control: "boolean" },
    hideNativeCursor: { control: "boolean" },
  },
} satisfies Meta<typeof TargetCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

const BUTTON = "rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground text-sm";

function Showcase({ cursor }: { cursor: React.ReactNode }) {
  return (
    <div className="flex min-h-[28rem] flex-col items-start justify-center gap-8 p-12">
      <div className="max-w-xl space-y-2">
        <h2 className="font-semibold text-2xl text-foreground">Seu patrimônio, num só lugar</h2>
        <p className="text-muted-foreground">
          Consolide corretoras, fundos e previdência e acompanhe a rentabilidade da carteira.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" data-cursor-target data-cursor-label="Abrir conta" className={BUTTON}>
          Abrir conta grátis
        </button>
        <button
          type="button"
          data-cursor-target
          data-cursor-label="Ver planos"
          className="rounded-full border border-border bg-card px-5 py-3 text-foreground text-sm"
        >
          Comparar planos
        </button>
      </div>
      <div
        data-cursor-target
        data-cursor-label="Rentabilidade"
        className="w-72 rounded-xl border border-border bg-card p-5"
      >
        <p className="text-muted-foreground text-sm">Rentabilidade em 12 meses</p>
        <p className="font-mono font-semibold text-3xl text-foreground">+11,8%</p>
        <p className="text-muted-foreground text-xs">CDI no período: 10,4%</p>
      </div>
      {cursor}
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Showcase cursor={<TargetCursor {...args} />} />,
};

export const SemGiro: Story = {
  args: { spinDuration: 0 },
  render: (args) => <Showcase cursor={<TargetCursor {...args} />} />,
};

export const MiraGrandeELenta: Story = {
  args: { size: 56, cornerSize: 18, thickness: 2, spinDuration: 5, snapDuration: 0.4 },
  render: (args) => <Showcase cursor={<TargetCursor {...args} />} />,
};

export const SemPontoNemRotulo: Story = {
  args: { dotSize: 0, showLabel: false, parallax: false },
  render: (args) => <Showcase cursor={<TargetCursor {...args} />} />,
};

function ScopedDemo(args: TargetCursorProps) {
  const stage = React.useRef<HTMLDivElement | null>(null);
  return (
    <div className="space-y-4 p-12">
      <p className="text-muted-foreground text-sm">
        A mira só vive dentro do painel abaixo; fora dele o cursor é o do sistema.
      </p>
      <div
        ref={stage}
        className="relative flex h-72 items-center justify-center gap-4 overflow-hidden rounded-xl border border-border bg-muted"
      >
        <button type="button" data-cursor-target data-cursor-label="Simular" className={BUTTON}>
          Simular aporte
        </button>
        <button
          type="button"
          data-cursor-target
          data-cursor-label="Exportar"
          className="rounded-lg border border-border bg-card px-5 py-3 text-foreground text-sm"
        >
          Exportar extrato
        </button>
        <TargetCursor {...args} container={stage} />
      </div>
    </div>
  );
}

export const ComContainer: Story = {
  render: (args) => <ScopedDemo {...args} />,
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Showcase cursor={<TargetCursor {...args} />} />
    </MotionConfig>
  ),
};
