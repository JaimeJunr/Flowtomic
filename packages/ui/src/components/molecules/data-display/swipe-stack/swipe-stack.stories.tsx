import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SwipeStack } from "./swipe-stack";

const DEPOIMENTOS = [
  {
    titulo: "Fechamento em dois dias",
    texto: "A conciliação das carteiras deixou de ser uma semana de planilhas.",
  },
  {
    titulo: "Cotas sem retrabalho",
    texto: "Os relatórios de cotistas saem prontos na segunda-feira de manhã.",
  },
  {
    titulo: "Auditoria tranquila",
    texto: "Cada lançamento tem origem rastreável, do extrato ao balancete.",
  },
  {
    titulo: "Equipe enxuta",
    texto: "Três pessoas cuidam hoje do que antes exigia um departamento.",
  },
  {
    titulo: "Risco à vista",
    texto: "O painel de exposição avisa antes de o limite ser ultrapassado.",
  },
];

const ROTULOS = DEPOIMENTOS.map((item) => item.titulo);

const CARTOES = DEPOIMENTOS.map((item, index) => (
  <div
    key={item.titulo}
    className={
      index % 2 === 0
        ? "flex size-full flex-col justify-end gap-1 bg-gradient-to-br from-primary/20 to-card p-4"
        : "flex size-full flex-col justify-end gap-1 bg-gradient-to-tr from-muted to-card p-4"
    }
  >
    <p className="font-semibold text-foreground text-sm">{item.titulo}</p>
    <p className="text-muted-foreground text-xs">{item.texto}</p>
  </div>
));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/SwipeStack",
  component: SwipeStack,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pilha de cartões arrastáveis para depoimentos, destaques de produto ou onboarding num espaço pequeno. Arraste o cartão de cima para mandá-lo ao fim da pilha; no teclado, Enter, Espaço e as setas fazem o mesmo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "select", options: ["fan", "cascade", "deck", "pile"] },
    visible: { control: { type: "number", min: 1, max: 5 } },
    spread: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    depth: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    tilt: { control: { type: "range", min: 0, max: 45, step: 1 } },
    threshold: { control: "number" },
    speed: { control: { type: "range", min: 0.5, max: 2, step: 0.1 } },
    sendToBackOnClick: { control: "boolean" },
    autoplay: { control: "boolean" },
    autoplayDelay: { control: "number" },
    pauseOnHover: { control: "boolean" },
  },
  args: {
    cards: CARTOES,
    labels: ROTULOS,
    className: "size-64",
  },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SwipeStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cascata: Story = { args: { layout: "cascade" } };

export const Baralho: Story = { args: { layout: "deck", spread: 0.7 } };

export const FotosSoltas: Story = { args: { layout: "pile", spread: 0.8 } };

export const ClicaParaAvancar: Story = { args: { sendToBackOnClick: true, tilt: 0 } };

export const Autoplay: Story = {
  args: { autoplay: true, autoplayDelay: 2500, pauseOnHover: true, visible: 3 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <SwipeStack {...args} />
    </MotionConfig>
  ),
};
