import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileCheck2, IdCard, Landmark, MailCheck, TrendingUp } from "lucide-react";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { StackingCard, StackingCards } from "./stacking-cards";

const STEPS = [
  {
    icon: MailCheck,
    title: "Confirme seu e-mail",
    text: "Enviamos um link de confirmação. Abra a mensagem e toque em Confirmar para liberar o cadastro.",
    note: "Leva menos de um minuto",
  },
  {
    icon: IdCard,
    title: "Envie seus documentos",
    text: "Fotografe o RG ou a CNH e um comprovante de residência recente. Conferimos tudo em até duas horas úteis.",
    note: "Aceitamos PDF, JPG e PNG até 10 MB",
  },
  {
    icon: FileCheck2,
    title: "Responda ao perfil de investidor",
    text: "Dez perguntas sobre prazo e tolerância a oscilações. O resultado define quais produtos aparecem para você.",
    note: "Você pode refazer quando quiser",
  },
  {
    icon: Landmark,
    title: "Vincule sua conta bancária",
    text: "Informe banco, agência e conta de mesma titularidade. É por ela que o dinheiro entra e sai.",
    note: "Transferências via Pix, sem tarifa",
  },
  {
    icon: TrendingUp,
    title: "Faça o primeiro aporte",
    text: "Escolha o valor, confira a carteira sugerida e confirme. O investimento aparece no seu painel no mesmo dia.",
    note: "A partir de R$ 100,00",
  },
];

// Cada StackingCard precisa ser filho direto de StackingCards: o índice sai da lista de filhos.
function renderSteps() {
  return STEPS.map((step, index) => (
    <StackingCard key={step.title}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <step.icon className="size-6 text-primary" />
          <span className="font-mono text-sm">
            Passo {index + 1} de {STEPS.length}
          </span>
        </div>
        <h3 className="text-2xl font-semibold">{step.title}</h3>
        <p className="max-w-prose text-muted-foreground">{step.text}</p>
        <p className="mt-auto text-sm font-medium">{step.note}</p>
      </div>
    </StackingCard>
  ));
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6">
      <div className="flex h-[70vh] flex-col justify-center">
        <h2 className="text-3xl font-semibold">Como abrir sua conta de investimentos</h2>
        <p className="mt-3 text-muted-foreground">
          Role a página: cada passo prende no topo e o próximo pousa por cima.
        </p>
      </div>
      {children}
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Pronto. Sua conta está aberta.</p>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Layout/StackingCards",
  component: StackingCards,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    itemGap: { control: { type: "number" } },
    stackOffset: { control: { type: "number" } },
    itemScale: { control: { type: "number", step: 0.01 } },
    minScale: { control: { type: "number", step: 0.05 } },
    dimAmount: { control: { type: "number", step: 0.05 } },
    blurAmount: { control: { type: "number", step: 1 } },
    holdDistance: { control: { type: "number" } },
  },
} satisfies Meta<typeof StackingCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: (args) => (
    <Page>
      <StackingCards {...args}>{renderSteps()}</StackingCards>
    </Page>
  ),
};

export const WithBlur: Story = {
  args: { children: null, blurAmount: 3, stackOffset: 32 },
  render: Default.render,
};

function ScrollContainerDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div className="p-6">
      <div
        ref={ref}
        className="mx-auto h-[28rem] max-w-2xl overflow-y-auto rounded-2xl border border-border px-6"
      >
        <div className="py-10">
          <h2 className="text-xl font-semibold">Abra sua conta em cinco passos</h2>
        </div>
        <StackingCards scrollContainer={ref} stackTop={16} stackOffset={20} itemGap={60}>
          {renderSteps()}
        </StackingCards>
        <div className="py-16 text-center text-muted-foreground">Fim da lista</div>
      </div>
    </div>
  );
}

export const InsideScrollContainer: Story = {
  args: { children: null },
  render: () => <ScrollContainerDemo />,
};

export const ReducedMotion: Story = {
  args: { children: null },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Page>
        <StackingCards {...args}>{renderSteps()}</StackingCards>
      </Page>
    </MotionConfig>
  ),
};
