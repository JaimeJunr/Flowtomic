import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  LiveTranscript,
  type LiveTranscriptEntry,
  type LiveTranscriptProps,
} from "./live-transcript";

const meta = {
  title: "Flowtomic UI/Organisms/LiveTranscript",
  component: LiveTranscript,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Painel de transcrição ao vivo em três faixas: conversa (`role="log"`), medidores de áudio e controles. A fala de terceiros aparece em itálico, entre aspas inseridas por CSS; `annotation` mostra tradução ou sugestão de resposta num bloco tingido com a cor da marca. Enquanto a pessoa está no fim da lista, fala nova rola sozinha; se ela subiu para reler, aparece o botão "N falas novas". Falas `partial` ainda não são anunciadas por leitores de tela. O atalho em `primaryAction.shortcut` é só texto: o componente não registra atalho global. Responde ao contêiner (container queries) e respeita movimento reduzido.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["live", "paused", "stopped", "connecting"] },
    metersCollapsible: { control: "boolean" },
    autoScroll: { control: "boolean" },
  },
} satisfies Meta<typeof LiveTranscript>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries: LiveTranscriptEntry[] = [
  {
    id: "1",
    speaker: "Outros",
    time: "14:02",
    text: "We should ship the dark theme before the docs.",
    annotation: {
      label: "Tradução para português",
      content: "Deveríamos lançar o tema escuro antes da documentação.",
      action: { label: "Copiar", onClick: () => {} },
    },
  },
  {
    id: "2",
    speaker: "Você",
    side: "me",
    time: "14:03",
    text: "Concordo, a documentação pode sair na semana seguinte.",
  },
  {
    id: "3",
    speaker: "Cliente",
    time: "14:04",
    text: "Can the new theme follow the system setting by default?",
    annotation: {
      label: "Sugestão de resposta",
      content:
        "Sim. O tema segue a preferência do sistema e a pessoa pode trocar nas configurações.",
      action: { label: "Copiar", onClick: () => {} },
    },
  },
];

const languages = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en", label: "Inglês" },
  { value: "es", label: "Espanhol" },
];

const base: LiveTranscriptProps = {
  title: "Reunião de planejamento",
  entries,
  status: "live",
  elapsed: 754,
  meters: [
    { id: "me", label: "Você", level: 0.35, language: "pt" },
    { id: "them", label: "Outros", level: 0.72, language: "en" },
  ],
  onPause: () => {},
  onResume: () => {},
  onStop: () => {},
  languages,
  language: "pt-BR",
  primaryAction: { label: "Analisar transcrição", onClick: () => {}, shortcut: "Ctrl D" },
};

export const Default: Story = { args: base };

const script: LiveTranscriptEntry[] = [
  ...entries,
  {
    id: "4",
    speaker: "Outros",
    time: "14:05",
    text: "I can have a first version ready by Thursday.",
    annotation: {
      label: "Tradução para português",
      content: "Posso ter uma primeira versão pronta até quinta-feira.",
    },
  },
  { id: "5", speaker: "Você", side: "me", time: "14:06", text: "Perfeito, combinado." },
  { id: "6", speaker: "Outros", time: "14:06", text: "Great, I will send the link after lunch." },
  {
    id: "7",
    speaker: "Outros",
    time: "14:07",
    text: "And we still need to review the pricing page.",
  },
];

function SimuladaDemo() {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setStep((n) => Math.min(n + 1, script.length * 2 - 2));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Passo par: k + 1 falas finais. Passo ímpar: a próxima chega parcial.
  const finals = Math.floor(step / 2) + 1;
  const shown: LiveTranscriptEntry[] = script.slice(0, finals);
  const upcoming = step % 2 === 1 ? script[finals] : undefined;
  if (upcoming) shown.push({ ...upcoming, partial: true, annotation: undefined });

  return <LiveTranscript {...base} entries={shown} maxHeight="20rem" />;
}

export const Simulada: Story = {
  args: base,
  render: () => <SimuladaDemo />,
};

export const Vazia: Story = {
  args: { ...base, entries: [], status: "connecting", elapsed: undefined },
};

export const Pausada: Story = {
  args: { ...base, status: "paused" },
  render: (args) => <LiveTranscript {...args} defaultMetersOpen={false} />,
};

export const Estreito: Story = {
  args: base,
  render: (args) => (
    <div className="w-[360px]">
      <LiveTranscript {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: base,
  render: (args) => (
    <div className="dark bg-background rounded-2xl p-4">
      <LiveTranscript {...args} />
    </div>
  ),
};
