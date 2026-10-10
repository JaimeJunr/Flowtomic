import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Banknote,
  Building2,
  Landmark,
  Mail,
  QrCode,
  Sheet,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { OrbitImages } from "./orbit-images";

function Integration({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <span
      title={label}
      className="grid size-full place-items-center rounded-full border bg-card text-foreground shadow-xs"
    >
      <Icon className="size-5" aria-label={label} />
    </span>
  );
}

const INTEGRATIONS = [
  <Integration key="banco" icon={Landmark} label="Banco" />,
  <Integration key="pix" icon={QrCode} label="Pix" />,
  <Integration key="b3" icon={TrendingUp} label="B3" />,
  <Integration key="planilha" icon={Sheet} label="Planilha" />,
  <Integration key="email" icon={Mail} label="E-mail" />,
  <Integration key="carteira" icon={Wallet} label="Carteira" />,
  <Integration key="custodia" icon={Building2} label="Custodiante" />,
  <Integration key="boleto" icon={Banknote} label="Boleto" />,
];

function Center() {
  return (
    <div className="text-center">
      <p className="font-mono text-4xl font-semibold">12</p>
      <p className="text-sm text-muted-foreground">integrações ativas</p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Animation/OrbitImages",
  component: OrbitImages,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Itens giram devagar ao longo de um caminho (elipse, círculo, estrela, coração, infinito, onda ou um caminho próprio), sempre de pé e igualmente espaçados. Serve para mostrar as integrações ao redor do produto. O giro para com o foco dentro de um item e, em movimento reduzido, os itens ficam parados.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["ellipse", "circle", "square", "star", "heart", "infinity", "wave"],
    },
    direction: { control: "inline-radio", options: ["normal", "reverse"] },
    duration: { control: { type: "range", min: 5, max: 120, step: 5 } },
    rotation: { control: { type: "range", min: -90, max: 90, step: 1 } },
    itemSize: { control: { type: "range", min: 32, max: 96, step: 4 } },
  },
  args: { items: INTEGRATIONS, centerContent: <Center /> },
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrbitImages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CaminhoVisivel: Story = { args: { showPath: true } };

export const Circulo: Story = {
  args: { shape: "circle", showPath: true, radius: 30, itemSize: 48 },
};

export const Estrela: Story = {
  args: {
    shape: "star",
    showPath: true,
    starPoints: 4,
    starInnerRatio: 0.45,
    radius: 42,
    duration: 60,
  },
};

export const Infinito: Story = {
  args: { shape: "infinity", showPath: true, radius: 38, centerContent: undefined },
};

export const Coracao: Story = {
  args: { shape: "heart", showPath: true, radius: 34, itemSize: 44 },
};

export const SentidoInverso: Story = { args: { direction: "reverse", duration: 25 } };

export const Pausado: Story = { args: { paused: true, showPath: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <OrbitImages {...args} showPath />
    </MotionConfig>
  ),
};
