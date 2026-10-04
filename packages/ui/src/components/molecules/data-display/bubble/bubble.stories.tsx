import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./bubble";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Bubble",
  component: Bubble,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Balão de mensagem. `align` escolhe o lado da conversa e `variant` a cor. A resposta do assistente não usa balão: ocupa a largura toda.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    align: { control: "inline-radio", options: ["end", "start"] },
    variant: { control: "select", options: ["muted", "tinted", "outline", "destructive"] },
  },
  decorators: [
    (Story) => (
      <div className="flex w-[560px] max-w-[calc(100vw-2rem)] flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Bubble>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Mensagem da pessoa",
  args: { align: "end", variant: "muted" },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>Como faço o DataTable ordenar pelo teclado?</BubbleContent>
    </Bubble>
  ),
};

export const Variantes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Bubble>
        <BubbleContent>Mensagem da pessoa</BubbleContent>
      </Bubble>
      <Bubble variant="tinted">
        <BubbleContent asChild>
          <button type="button">Resposta fixada no tópico</button>
        </BubbleContent>
      </Bubble>
      <Bubble align="start" variant="outline">
        <BubbleContent>Bate-papo entre pessoas</BubbleContent>
      </Bubble>
    </div>
  ),
};

function ReacoesDemo() {
  const [curtiu, setCurtiu] = useState(false);
  const total = curtiu ? 2 : 1;
  return (
    <Bubble align="start" variant="outline">
      <BubbleContent>Subi o PR do DataTable, alguém revisa?</BubbleContent>
      <BubbleReactions aria-label="Reações">
        <button
          type="button"
          aria-pressed={curtiu}
          aria-label={`Curtir, ${total} ${total === 1 ? "pessoa" : "pessoas"}`}
          onClick={() => setCurtiu((v) => !v)}
          className="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2 text-xs text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary"
        >
          <ThumbsUp aria-hidden className="size-3" />
          <span className="font-mono">{total}</span>
        </button>
      </BubbleReactions>
    </Bubble>
  );
}

export const ComReacoes: Story = {
  name: "Com reações",
  render: () => <ReacoesDemo />,
};

export const NaoEnviada: Story = {
  name: "Não enviada",
  render: () => (
    <Bubble variant="destructive">
      <BubbleContent>Como faço o DataTable ordenar?</BubbleContent>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
        <AlertCircle aria-hidden className="size-3.5" />
        Não foi enviada.{" "}
        <button type="button" className="underline">
          Tentar de novo
        </button>
      </p>
    </Bubble>
  ),
};

export const Sequencia: Story = {
  name: "Mensagens seguidas",
  render: () => (
    <BubbleGroup>
      <Bubble>
        <BubbleContent>Achei o bug do cabeçalho.</BubbleContent>
      </Bubble>
      <Bubble>
        <BubbleContent>O th não tinha aria-sort.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};
