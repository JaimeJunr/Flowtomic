import type { Meta, StoryObj } from "@storybook/react-vite";
import { MousePointer2, Sparkles } from "lucide-react";
import { MotionConfig } from "motion/react";
import { CursorTrail } from "./cursor-trail";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/CursorTrail",
  component: CursorTrail,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    spacingPx: { control: { type: "number", min: 20, max: 300, step: 10 } },
    followDirection: { control: "boolean" },
    float: { control: "boolean" },
    maxPoints: { control: { type: "number", min: 1, max: 20, step: 1 } },
    removeIntervalMs: { control: { type: "number", min: 10, max: 300, step: 10 } },
    exitMs: { control: { type: "number", min: 100, max: 1500, step: 50 } },
    content: { control: false },
  },
} satisfies Meta<typeof CursorTrail>;

export default meta;
type Story = StoryObj<typeof meta>;

function SummaryPanel() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-10">
      <h2 className="font-display text-3xl font-semibold text-foreground">
        Fechamento de setembro
      </h2>
      <dl className="grid grid-cols-3 gap-6">
        <div>
          <dt className="text-sm text-muted-foreground">Conciliado</dt>
          <dd className="font-mono text-xl text-foreground">R$ 1.482.390,00</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pendente</dt>
          <dd className="font-mono text-xl text-foreground">R$ 38.720,15</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Divergências</dt>
          <dd className="font-mono text-xl text-foreground">14</dd>
        </div>
      </dl>
    </div>
  );
}

const AREA = "h-80 w-[44rem] rounded-xl border border-border bg-card";

export const Default: Story = {
  args: {
    content: <Sparkles className="size-6 text-primary" />,
    className: AREA,
  },
  render: (args) => (
    <CursorTrail {...args}>
      <SummaryPanel />
    </CursorTrail>
  ),
};

export const ApontaParaOMovimento: Story = {
  args: {
    content: <MousePointer2 className="size-5 text-primary" />,
    float: false,
    spacingPx: 60,
    maxPoints: 8,
    className: AREA,
  },
  render: Default.render,
};

export const ComPalavra: Story = {
  args: {
    content: <span className="font-mono text-sm text-primary">conciliado</span>,
    followDirection: false,
    className: AREA,
  },
  render: Default.render,
};

export const ReducedMotion: Story = {
  args: {
    content: <Sparkles className="size-6 text-primary" />,
    className: AREA,
  },
  render: Default.render,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
