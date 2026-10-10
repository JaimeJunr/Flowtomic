import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GlassSurface } from "./glass-surface";

const LINKS = ["Carteiras", "Relatórios", "Configurações"] as const;

function FloatingNav() {
  return (
    <nav className="flex items-center gap-1 px-3 py-2">
      {LINKS.map((label, i) => (
        <span
          key={label}
          className={
            i === 0
              ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
              : "px-4 py-1.5 text-sm font-medium text-foreground"
          }
        >
          {label}
        </span>
      ))}
    </nav>
  );
}

const STATS = [
  ["Patrimônio total", "R$ 1,28 mi"],
  ["Rentabilidade no mês", "+1,8%"],
  ["Aportes pendentes", "R$ 42 mil"],
] as const;

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-96 w-[34rem] max-w-full flex-col items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/40 via-accent to-secondary p-6">
      <div className="mt-20 grid w-full grid-cols-3 gap-3 text-sm">
        {STATS.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-card p-3 text-card-foreground">
            <p className="text-muted-foreground">{label}</p>
            <p className="mt-1 font-mono text-base font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center font-display text-2xl font-semibold text-foreground">
        Acompanhe cada carteira em um só lugar
      </p>
      <div className="absolute left-1/2 top-24 -translate-x-1/2">{children}</div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Display/GlassSurface",
  component: GlassSurface,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Superfície de vidro com fundo desfocado, distorção nas bordas e leve arco-íris no contorno. Em Safari e Firefox vira vidro fosco simples.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    radius: { control: "number" },
    edge: { control: { type: "range", min: 0, max: 0.5, step: 0.01 } },
    distortion: { control: { type: "range", min: -300, max: 300, step: 10 } },
    chroma: { control: { type: "range", min: 0, max: 30, step: 1 } },
    blur: { control: { type: "range", min: 0, max: 30, step: 1 } },
    frost: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    saturation: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
  },
  args: { radius: 28, children: <FloatingNav /> },
  decorators: [
    (Story) => (
      <Backdrop>
        <Story />
      </Backdrop>
    ),
  ],
} satisfies Meta<typeof GlassSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Esfumado: Story = { args: { frost: 0.35, blur: 16 } };

export const SemArcoIris: Story = { args: { chroma: 0 } };

export const BordaGrossa: Story = { args: { edge: 0.2, distortion: -120 } };

export const Saturado: Story = { args: { saturation: 1.8, blur: 6 } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GlassSurface {...args} />
    </MotionConfig>
  ),
};
