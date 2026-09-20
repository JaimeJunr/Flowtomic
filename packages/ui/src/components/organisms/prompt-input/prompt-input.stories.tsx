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
      console.log("Submitted:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="Type your message..." />
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
      console.log("Submitted:", message);
    },
    children: (
      <>
        <PromptInputToolbar>
          <PromptInputModelSelect defaultValue="gpt-4">
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue placeholder="Select model" />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              <PromptInputModelSelectItem value="gpt-4">GPT-4</PromptInputModelSelectItem>
              <PromptInputModelSelectItem value="gpt-3.5">GPT-3.5</PromptInputModelSelectItem>
              <PromptInputModelSelectItem value="claude">Claude</PromptInputModelSelectItem>
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputToolbar>
        <PromptInputTextarea placeholder="What would you like to know?" />
        <PromptInputFooter>
          <PromptInputTools>{/* Tools can be added here */}</PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};

export const WithCustomHeight: Story = {
  args: {
    onSubmit: async (message) => {
      console.log("Submitted:", message);
    },
    children: (
      <>
        <PromptInputTextarea placeholder="Type your message..." minHeight={64} maxHeight={200} />
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </>
    ),
  },
};
