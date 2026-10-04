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
