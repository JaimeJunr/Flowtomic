import type { Meta, StoryObj } from "@storybook/react-vite";
import { CloudIcon, GlobeIcon, PaperclipIcon } from "lucide-react";
import { useState } from "react";
import {
  PromptInput,
  PromptInputEffort,
  PromptInputFooter,
  type PromptInputMenuItem,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputTriggerMenu,
  usePromptInputAttachments,
} from "./prompt-input";

const meta = {
  title: "Flowtomic UI/Organisms/PromptInput",
  component: PromptInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente complexo para input de prompt com suporte a attachments, speech recognition, e muito mais. Baseado no Vercel AI Elements com melhorias.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async (message) => {
      console.log("Enviado:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="adiciona o stat-card no dashboard" />
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

export const WithModelSelector: Story = {
  args: {
    onSubmit: async (message) => {
      console.log("Enviado:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="O que você gostaria de saber?" />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputModelSelect defaultValue="claude-sonnet-5">
              <PromptInputModelSelectTrigger aria-label="Modelo">
                <PromptInputModelSelectValue placeholder="Selecione o modelo" />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                <PromptInputModelSelectItem value="claude-sonnet-5">
                  claude-sonnet-5
                </PromptInputModelSelectItem>
                <PromptInputModelSelectItem value="claude-opus-5-5">
                  claude-opus-5-5
                </PromptInputModelSelectItem>
                <PromptInputModelSelectItem value="gpt-6">gpt-6</PromptInputModelSelectItem>
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

export const WithCustomHeight: Story = {
  args: {
    onSubmit: async (message) => {
      console.log("Enviado:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="roda o type-check do ui" minHeight={64} maxHeight={200} />
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

export const Respondendo: Story = {
  name: "Respondendo (Parar)",
  args: {
    onSubmit: async () => {},
    children: (
      <>
        <PromptInputTextarea placeholder="Escreva sua mensagem" />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="streaming" onStop={() => console.log("Parou")} />
        </PromptInputFooter>
      </>
    ),
  },
};

const FONTES: PromptInputMenuItem[] = [
  {
    key: "arquivos",
    label: "Arquivos",
    description: "anexar do computador",
    icon: <PaperclipIcon aria-hidden="true" />,
  },
  {
    key: "drive",
    label: "Drive",
    description: "documentos da equipe",
    icon: <CloudIcon aria-hidden="true" />,
  },
  {
    key: "web",
    label: "Web",
    description: "buscar na internet",
    icon: <GlobeIcon aria-hidden="true" />,
  },
];

const COMANDOS: PromptInputMenuItem[] = [
  { key: "resumir", label: "/resumir", description: "resume a conversa até aqui" },
  { key: "traduzir", label: "/traduzir", description: "traduz o último trecho" },
  { key: "explicar", label: "/explicar", description: "explica passo a passo" },
];

const ESFORCOS = ["Baixo", "Médio", "Alto", "Máximo"];

// Anexar do computador abre o seletor de arquivos em vez de inserir texto
function MenuDeFontes() {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputTriggerMenu
      trigger="@"
      items={FONTES}
      onSelect={(item, api) => {
        if (item.key === "arquivos") {
          api.insert("");
          attachments.openFileDialog();
          return;
        }
        api.insert(`@${item.label} `);
      }}
    />
  );
}

export const ComMencoes: Story = {
  name: "Com menções (@ e /)",
  args: {
    onSubmit: async (message) => {
      console.log("Enviado:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="Digite @ para fontes ou / para comandos" />
        <MenuDeFontes />
        <PromptInputTriggerMenu trigger="/" items={COMANDOS} />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

export const ComEsforco: Story = {
  name: "Com régua de esforço",
  args: {
    onSubmit: async (message) => {
      console.log("Enviado:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="Escolha Máximo no esforço e digite" />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputEffort steps={ESFORCOS} />
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

function EnviarPararDemo() {
  const [ocupado, setOcupado] = useState(false);
  return (
    <PromptInput onSubmit={() => setOcupado(true)}>
      <PromptInputTextarea placeholder="Escreva e envie para ver a seta virar quadrado" />
      <PromptInputFooter>
        <PromptInputTools />
        <PromptInputSubmit
          status={ocupado ? "streaming" : "ready"}
          onStop={() => setOcupado(false)}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}

export const EnviarParar: Story = {
  name: "Enviar e Parar (transição)",
  args: { onSubmit: async () => {} },
  render: () => <EnviarPararDemo />,
};

function CompletoDemo() {
  const [ocupado, setOcupado] = useState(false);
  return (
    <PromptInput onSubmit={() => setOcupado(true)}>
      <PromptInputTextarea placeholder="@ para fontes, / para comandos" />
      <MenuDeFontes />
      <PromptInputTriggerMenu trigger="/" items={COMANDOS} />
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputEffort steps={ESFORCOS} defaultValue="Alto" />
        </PromptInputTools>
        <PromptInputSubmit
          status={ocupado ? "streaming" : "ready"}
          onStop={() => setOcupado(false)}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}

export const Completo: Story = {
  name: "Completo",
  args: { onSubmit: async () => {} },
  render: () => <CompletoDemo />,
};
