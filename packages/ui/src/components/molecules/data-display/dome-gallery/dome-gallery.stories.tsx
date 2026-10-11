import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Banknote,
  Building2,
  Coins,
  Globe,
  Landmark,
  LineChart,
  PiggyBank,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import type * as React from "react";
import { DomeGallery, type DomeItem } from "./dome-gallery";

const GRADIENTS = [
  "from-primary to-accent",
  "from-accent to-secondary",
  "from-secondary to-muted",
  "from-primary to-secondary",
  "from-muted to-accent",
];

type Segment = {
  label: string;
  initials: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SEGMENTS: Segment[] = [
  { label: "Previdência", initials: "PV", icon: PiggyBank },
  { label: "Câmbio", initials: "CB", icon: Globe },
  { label: "Crédito", initials: "CR", icon: Banknote },
  { label: "Renda fixa", initials: "RF", icon: Landmark },
  { label: "Renda variável", initials: "RV", icon: LineChart },
  { label: "Seguros", initials: "SG", icon: Shield },
  { label: "Custódia", initials: "CU", icon: Wallet },
  { label: "Tesouraria", initials: "TS", icon: Coins },
  { label: "Compliance", initials: "CP", icon: Scale },
  { label: "Gestão de fundos", initials: "GF", icon: Building2 },
  { label: "Consórcios", initials: "CS" },
  { label: "Investimentos no exterior", initials: "IE" },
  { label: "Planejamento sucessório", initials: "PS" },
  { label: "Cartões corporativos", initials: "CC" },
  { label: "Antecipação de recebíveis", initials: "AR" },
  { label: "Fundos imobiliários", initials: "FI" },
  { label: "Crédito rural", initials: "CD" },
  { label: "Private banking", initials: "PB" },
  { label: "Open finance", initials: "OF" },
  { label: "Meios de pagamento", initials: "MP" },
];

function Block({ segment, gradient }: { segment: Segment; gradient: string }) {
  const Icon = segment.icon;
  return (
    <div
      className={`flex size-full flex-col items-start justify-between bg-gradient-to-br p-3 ${gradient}`}
    >
      {Icon ? (
        <Icon aria-hidden className="text-foreground" style={{ width: 28, height: 28 }} />
      ) : (
        <span className="font-mono font-semibold text-4xl text-foreground">{segment.initials}</span>
      )}
      <span className="font-medium text-foreground text-sm leading-tight">{segment.label}</span>
    </div>
  );
}

const ITEMS: DomeItem[] = SEGMENTS.map((segment, i) => ({
  id: `segmento-${i}`,
  label: segment.label,
  content: <Block segment={segment} gradient={GRADIENTS[i % GRADIENTS.length]} />,
}));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/DomeGallery",
  component: DomeGallery,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Galeria imersiva: a pessoa fica dentro de uma esfera cuja parede é coberta de ladrilhos. Arrastar gira a esfera com inércia, as setas do teclado giram uma unidade e clicar num ladrilho o abre ampliado. Com movimento reduzido não há inércia nem mola na abertura.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    fit: { control: { type: "range", min: 0.1, max: 1.5, step: 0.05 } },
    fitBasis: { control: "inline-radio", options: ["auto", "min", "max", "width", "height"] },
    segments: { control: { type: "range", min: 8, max: 60, step: 1 } },
    maxVerticalRotation: { control: { type: "range", min: 0, max: 30, step: 1 } },
    dragSensitivity: { control: { type: "range", min: 5, max: 60, step: 1 } },
    dragDampening: { control: { type: "range", min: 0, max: 5, step: 0.5 } },
    tileRadius: { control: { type: "range", min: 0, max: 60, step: 2 } },
    grayscale: { control: "boolean" },
  },
  args: {
    items: ITEMS,
    "aria-label": "Segmentos de atuação",
    className: "h-[600px] w-full bg-background",
  },
} satisfies Meta<typeof DomeGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemGrayscale: Story = { args: { grayscale: false } };

export const DomoFechado: Story = {
  args: { fit: 0.8, segments: 24, maxVerticalRotation: 12, tileRadius: 12 },
};

export const AberturaMaior: Story = {
  args: { openedSize: { width: "520px", height: "320px" } },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <DomeGallery {...args} />
    </MotionConfig>
  ),
};
