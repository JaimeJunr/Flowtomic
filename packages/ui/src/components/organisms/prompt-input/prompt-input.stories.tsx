import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
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
        <PromptInputToolbar>
          <PromptInputModelSelect defaultValue="claude-sonnet-5">
            <PromptInputModelSelectTrigger>
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
        </PromptInputToolbar>
        <PromptInputTextarea placeholder="O que você gostaria de saber?" />
        <PromptInputFooter>
          <PromptInputTools>{/* Ferramentas extras entram aqui */}</PromptInputTools>
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
