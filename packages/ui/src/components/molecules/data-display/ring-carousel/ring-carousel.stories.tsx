import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { RingCarousel, type RingCarouselItem } from "./ring-carousel";

const GRADIENTS = [
  "from-primary to-accent",
  "from-accent to-secondary",
  "from-secondary to-muted",
  "from-primary to-secondary",
  "from-accent to-primary",
  "from-muted to-accent",
];

const TITLES = [
  "Fundo Atlas Renda Fixa",
  "Relatório de março",
  "Fundo Boreal Multimercado",
  "Carteira conservadora",
  "Fundo Cedro Ações",
  "Resumo trimestral",
  "Informe de rendimentos",
  "Extrato de setembro",
  "Política de investimentos",
  "Lâmina do fundo",
];

function Card({ gradient, title }: { gradient: string; title: string }) {
  return (
    <div className={`flex size-full items-end bg-gradient-to-br p-4 ${gradient}`}>
      <p className="font-medium text-base text-foreground">{title}</p>
    </div>
  );
}

const ITEMS: RingCarouselItem[] = TITLES.map((title, i) => ({
  id: `item-${i}`,
  label: title,
  content: <Card gradient={GRADIENTS[i % GRADIENTS.length]} title={title} />,
}));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/RingCarousel",
  component: RingCarousel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Vitrine de relatórios ou fundos num anel 3D. Gira devagar, aceita arraste com inércia, alinha num cartão ao soltar e leva o cartão clicado para a frente. Setas do teclado giram um cartão. Com movimento reduzido o anel fica parado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "inline-radio", options: ["cylinder", "orbit"] },
    autoplay: { control: "inline-radio", options: ["drift", "step", "off"] },
    direction: { control: "inline-radio", options: ["left", "right"] },
    cardWidth: { control: "number" },
    aspectRatio: { control: "number" },
    gap: { control: "number" },
    tilt: { control: "number" },
    speed: { control: "number" },
    interval: { control: "number" },
    depthFade: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    draggable: { control: "boolean" },
    snap: { control: "boolean" },
    pauseOnHover: { control: "boolean" },
    focusOnClick: { control: "boolean" },
  },
  args: { items: ITEMS },
  decorators: [
    (Story) => (
      <div className="py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RingCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Orbit: Story = {
  args: { layout: "orbit", aspectRatio: 1.4, gap: 40 },
};

export const PassoAPasso: Story = {
  args: { autoplay: "step", interval: 2.5, direction: "right" },
};

export const ApenasManual: Story = {
  args: { autoplay: "off", tilt: -14, depthFade: 0.8 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <RingCarousel {...args} />
    </MotionConfig>
  ),
};
