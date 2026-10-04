import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Questionnaire,
  type QuestionnaireAnswer,
  type QuestionnaireQuestion,
  QuestionnaireSummary,
} from "./questionnaire";

const perguntas: QuestionnaireQuestion[] = [
  {
    id: "entrada",
    title: "Como a pessoa entra?",
    choices: [
      { value: "senha", label: "E-mail e senha" },
      { value: "link", label: "Link mágico por e-mail" },
      { value: "social", label: "Conta do Google ou GitHub" },
    ],
  },
  {
    id: "esqueci",
    title: "Tem “esqueci a senha”?",
    choices: [
      { value: "sim", label: "Sim, com link por e-mail" },
      { value: "nao", label: "Não" },
    ],
  },
];

const meta = {
  title: "Flowtomic UI/Organisms/Questionnaire",
  component: Questionnaire,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pergunta do assistente com opções numeradas: as teclas 1, 2, 3… escolhem, a última opção é resposta livre. Uma pergunta por vez; ao enviar, o histórico mostra o `QuestionnaireSummary`.",
      },
    },
  },
  tags: ["autodocs"],
  args: { questions: perguntas, onSubmit: () => {} },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Questionnaire>;
export default meta;
type Story = StoryObj<typeof meta>;

function FluxoCompleto() {
  const [respostas, setRespostas] = useState<QuestionnaireAnswer[] | null>(null);
  if (respostas) return <QuestionnaireSummary answers={respostas} />;
  return <Questionnaire questions={perguntas} onSubmit={setRespostas} />;
}

export const Default: Story = {
  name: "Duas perguntas",
  render: () => <FluxoCompleto />,
};

export const UmaPergunta: Story = {
  name: "Uma pergunta",
  args: { questions: [perguntas[1]] },
};

export const Preparando: Story = {
  args: { questions: [], preparing: true },
};

export const Respondida: Story = {
  name: "Respondida (histórico)",
  render: () => (
    <QuestionnaireSummary
      answers={[
        {
          questionId: "entrada",
          question: "Como a pessoa entra?",
          answer: "E-mail e senha",
          skipped: false,
        },
        {
          questionId: "esqueci",
          question: "Tem “esqueci a senha”?",
          answer: "Sim, com link por e-mail",
          skipped: false,
        },
      ]}
    />
  ),
};
