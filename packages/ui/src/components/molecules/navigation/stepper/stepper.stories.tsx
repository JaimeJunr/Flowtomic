import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircle2 } from "lucide-react";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { Stepper } from "./stepper";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

const personalData = (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-semibold">Dados pessoais</h3>
    <Field label="Nome completo" value="Mariana Albuquerque Teixeira" />
    <Field label="CPF" value="***.482.917-**" />
    <Field label="Data de nascimento" value="14/03/1988" />
  </div>
);

const investorProfile = (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-semibold">Perfil de investidor</h3>
    <p className="text-sm text-muted-foreground">
      Responda com base no que você já investe hoje. Isso define quais produtos aparecem para você.
    </p>
    <Field label="Objetivo principal" value="Reserva de longo prazo" />
    <Field label="Tolerância a oscilação" value="Moderada" />
    <Field label="Patrimônio investido" value="De R$ 50 mil a R$ 200 mil" />
  </div>
);

const documents = (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-semibold">Documentos</h3>
    <p className="text-sm text-muted-foreground">
      Envie um documento com foto e um comprovante de residência dos últimos 90 dias.
    </p>
    <Field label="Documento com foto" value="rg-frente-verso.pdf, 1,2 MB" />
    <Field label="Comprovante de residência" value="conta-de-luz-set-2026.pdf, 480 KB" />
  </div>
);

const review = (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-semibold">Revisão</h3>
    <p className="text-sm text-muted-foreground">
      Confira o resumo antes de enviar. Depois de concluir, a análise leva até um dia útil.
    </p>
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <dt className="text-muted-foreground">Titular</dt>
      <dd>Mariana Albuquerque Teixeira</dd>
      <dt className="text-muted-foreground">Perfil</dt>
      <dd>Moderado</dd>
      <dt className="text-muted-foreground">Documentos</dt>
      <dd>2 arquivos enviados</dd>
    </dl>
  </div>
);

const accountOpened = (
  <div className="flex flex-col items-center gap-2 py-6 text-center">
    <CheckCircle2 className="text-primary" style={{ width: 40, height: 40 }} aria-hidden="true" />
    <h3 className="text-base font-semibold">Pedido de abertura enviado</h3>
    <p className="text-sm text-muted-foreground">
      Avisaremos por e-mail assim que a análise terminar.
    </p>
  </div>
);

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Assistente em passos para onboarding e abertura de conta: indicadores numerados, conteúdo que desliza e altura que acompanha o passo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialStep: { control: "number" },
    backLabel: { control: "text" },
    nextLabel: { control: "text" },
    completeLabel: { control: "text" },
    disableIndicatorNavigation: { control: "boolean" },
  },
  args: {
    steps: [personalData, investorProfile, documents, review],
    labels: ["Dados pessoais", "Perfil de investidor", "Documentos", "Revisão"],
    completedContent: accountOpened,
    onStepChange: fn(),
    onComplete: fn(),
    className: "w-[480px] max-w-full",
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComecandoNoSegundoPasso: Story = {
  args: { initialStep: 2 },
};

export const SemPularPeloIndicador: Story = {
  args: { disableIndicatorNavigation: true },
};

export const RotulosPersonalizados: Story = {
  args: {
    backLabel: "Etapa anterior",
    nextLabel: "Salvar e seguir",
    completeLabel: "Enviar pedido",
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Stepper {...args} />
    </MotionConfig>
  ),
};
