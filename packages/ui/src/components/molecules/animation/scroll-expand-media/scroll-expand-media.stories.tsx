import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ScrollExpandMedia } from "./scroll-expand-media";

const POSITIONS = [
  { nome: "Tesouro IPCA+ 2035", peso: "28,4%", valor: "R$ 1.198.240,00" },
  { nome: "Fundo Atlas Crédito", peso: "21,7%", valor: "R$ 915.470,00" },
  { nome: "CDB Pós-fixado", peso: "17,9%", valor: "R$ 755.180,00" },
  { nome: "Ações Brasil", peso: "32,0%", valor: "R$ 1.350.016,40" },
];

function DashboardMock() {
  return (
    <div className="flex bg-foreground p-6 text-background sm:p-10">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-70">Patrimônio da carteira Atlas</p>
            <p className="font-mono text-4xl font-semibold">R$ 4.218.906,40</p>
          </div>
          <p className="font-mono text-sm text-success">+1,82% no mês</p>
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 content-start">
          {POSITIONS.map((item) => (
            <div key={item.nome} className="border-t border-background/20 pt-3">
              <dt className="text-sm opacity-70">{item.nome}</dt>
              <dd className="font-mono text-lg">{item.valor}</dd>
              <dd className="font-mono text-xs opacity-60">{item.peso} da carteira</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Spacer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center gap-3 px-6 py-16">
      {children}
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Animation/ScrollExpandMedia",
  component: ScrollExpandMedia,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hero de landing: uma moldura pequena com a mídia cresce até ocupar a tela conforme a página rola, e fica presa enquanto expande. Ao chegar em tela cheia, o conteúdo final aparece sobre um degradê.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    startWidth: { control: { type: "range", min: 20, max: 90 } },
    startHeight: { control: { type: "range", min: 20, max: 90 } },
    startRadius: { control: { type: "range", min: 0, max: 48 } },
    mediaZoom: { control: { type: "range", min: 1, max: 2, step: 0.05 } },
    scrollDistance: { control: { type: "number", min: 0.4, max: 3, step: 0.1 } },
    holdDistance: { control: { type: "number", min: 0, max: 2, step: 0.05 } },
    overlayScrim: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  args: {
    media: <DashboardMock />,
    title: "Veja a plataforma por dentro",
    scrollHint: "Role para ver",
    children: (
      <div className="flex max-w-xl flex-col gap-3">
        <p className="text-display-sm font-display">Toda a carteira em uma tela só</p>
        <p className="text-sm opacity-80">
          Posições, rentabilidade e risco consolidados, com atualização ao fechar o pregão.
        </p>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground">
        <Spacer>
          <h2 className="font-display text-display-sm">Antes da demonstração</h2>
          <p className="text-muted-foreground">
            Role a página: a moldura abaixo cresce até cobrir a tela inteira.
          </p>
        </Spacer>
        <Story />
        <Spacer>
          <h2 className="font-display text-display-sm">Depois da demonstração</h2>
          <p className="text-muted-foreground">
            A página segue normalmente assim que a mídia termina de abrir.
          </p>
        </Spacer>
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollExpandMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MoldurasMaiores: Story = {
  args: { startWidth: 70, startHeight: 70, startRadius: 32, mediaZoom: 1.15 },
};

export const RetencaoLonga: Story = {
  args: { scrollDistance: 1.6, holdDistance: 1, overlayScrim: 0.7 },
};

export const SemTituloNemDica: Story = {
  args: { title: undefined, scrollHint: undefined },
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
