import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import Chatbot, { type ChatbotMessage, type ChatbotStatus } from "./page";

const modelos = [
  { id: "sonnet-5-5", name: "Sonnet 5.5" },
  { id: "opus-5-5", name: "Opus 5.5" },
  { id: "haiku-4-5", name: "Haiku 4.5" },
];

const sugestoes = [
  { label: "Ordenar tabela pelo teclado", prompt: "Como faço o DataTable ordenar pelo teclado?" },
  {
    label: "Trocar a cor da marca",
    prompt: "Quais tokens do theme.css eu mudo para trocar a cor da marca?",
  },
  {
    label: "Montar um block de login",
    prompt: "Monte um block de login com os componentes que já existem",
  },
  { label: "O que falta testar", prompt: "Quais componentes ainda não têm teste?" },
];

const dica = (
  <>
    Antes de responder, o assistente lê{" "}
    <span className="font-mono text-foreground">packages/ui/src</span> e{" "}
    <span className="font-mono text-foreground">docs/</span>
  </>
);

const conversa: ChatbotMessage[] = [
  {
    id: "1",
    role: "user",
    parts: [{ type: "text", text: "Como faço o DataTable ordenar pelo teclado?" }],
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      { type: "tool", kind: "file", state: "done", label: "Leu", detail: "data-table.tsx" },
      {
        type: "tool",
        kind: "web",
        state: "done",
        label: "Buscou na web por",
        detail: "aria-sort table header",
      },
      {
        type: "text",
        text: "O cabeçalho ordenável precisa ser um `<button>` dentro do `<th>`. Assim o Tab chega nele e o Enter ordena. O `th` leva `aria-sort`, para o leitor de tela dizer a direção.\n\n```tsx\n<th aria-sort={direcao}>\n  <button onClick={alternarOrdem}>Nome</button>\n</th>\n```",
      },
      {
        type: "sources",
        sources: [
          {
            url: "https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/",
            title: "Sortable table — WAI-ARIA APG",
          },
          {
            url: "https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-sort",
            title: "aria-sort",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    role: "user",
    parts: [{ type: "text", text: "E o campo de busca da tabela, tem label?" }],
  },
  {
    id: "4",
    role: "assistant",
    parts: [
      { type: "tool", kind: "file", state: "done", label: "Leu", detail: "data-table-toolbar.tsx" },
      {
        type: "text",
        text: "Não tem. O `Input` da barra só usa `placeholder`, e o leitor de tela anuncia apenas “campo de edição”. Dá para resolver com",
      },
    ],
  },
];

const meta = {
  title: "Flowtomic UI/Blocks/Chatbot",
  component: Chatbot,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela de chat com assistente. Não fala com nenhuma API: o app liga `messages`, `status` e os callbacks no `useChat` do AI SDK ou no que usar.",
      },
    },
  },
  tags: ["autodocs"],
  args: { models: modelos, model: "sonnet-5-5" },
} satisfies Meta<typeof Chatbot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazia: Story = {
  name: "Conversa nova",
  args: {
    emptyTitle: "Pergunte sobre qualquer componente",
    emptyHint: dica,
    suggestions: sugestoes,
  },
};

export const EmAndamento: Story = {
  name: "Respondendo",
  args: {
    title: "Ordenar o DataTable pelo teclado",
    messages: conversa,
    status: "streaming",
    onStop: () => {},
  },
};

export const Respondida: Story = {
  args: {
    title: "Ordenar o DataTable pelo teclado",
    messages: conversa.slice(0, 2),
    status: "ready",
    onNewChat: () => {},
  },
};

export const Pergunta: Story = {
  name: "Assistente pergunta",
  args: {
    title: "Block de login",
    messages: [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Monta um block de login com o que já existe" }],
      },
      {
        id: "2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Antes de montar, preciso saber duas coisas sobre onde o login vai rodar.",
          },
        ],
      },
    ],
    question: {
      questions: [
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
      ],
    },
  },
};

export const Erro: Story = {
  args: {
    title: "Ordenar o DataTable pelo teclado",
    messages: conversa.slice(0, 1),
    status: "error",
    error: "429 · limite de requisições",
    onRetry: () => {},
  },
};

const resposta =
  "Tem, desde a versão 0.8: o `DataTableToolbar` aceita `searchLabel`, que vira o nome acessível do campo.";

function ChatbotDemo() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [status, setStatus] = useState<ChatbotStatus>("ready");
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const stop = () => {
    clearInterval(timer.current);
    setStatus("ready");
  };

  // simula o streaming: a resposta chega em pedaços, como no useChat
  const send = (text: string) => {
    const id = String(Date.now());
    setMessages((prev) => [...prev, { id, role: "user", parts: [{ type: "text", text }] }]);
    setStatus("submitted");
    let size = 0;
    timer.current = setInterval(() => {
      size += 6;
      setStatus(size >= resposta.length ? "ready" : "streaming");
      if (size >= resposta.length) clearInterval(timer.current);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== `${id}-r`),
        {
          id: `${id}-r`,
          role: "assistant",
          parts: [{ type: "text", text: resposta.slice(0, size) }],
        },
      ]);
    }, 80);
  };

  return (
    <Chatbot
      title={messages.length ? "Campo de busca do DataTable" : undefined}
      messages={messages}
      status={status}
      emptyTitle="Pergunte sobre qualquer componente"
      emptyHint={dica}
      suggestions={sugestoes}
      models={modelos}
      model="sonnet-5-5"
      onSend={send}
      onStop={stop}
      onNewChat={() => {
        stop();
        setMessages([]);
      }}
    />
  );
}

export const Interativo: Story = {
  render: () => <ChatbotDemo />,
};
