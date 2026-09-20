import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChatMessage } from "./chat-message";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ChatMessage",
  component: ChatMessage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    renderMarkdown: {
      control: "boolean",
      description: "Se deve renderizar o conteúdo como markdown",
    },
    showActions: {
      control: "boolean",
      description: "Se deve mostrar ações (editar, deletar, ver contexto)",
    },
    showTimestamp: {
      control: "boolean",
      description: "Se deve mostrar o timestamp",
    },
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessage = {
  id: 1,
  content: "Esta é uma **mensagem** de exemplo com *markdown*.",
  sender: "Mestre",
  timestamp: new Date(),
  messageType: "STORY" as const,
};

export const Default: Story = {
  args: {
    message: sampleMessage,
  },
};

export const ActionMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      messageType: "ACTION",
      sender: "Personagem",
      content: "O personagem *ataca* o inimigo com sua espada!",
    },
  },
};

export const SayMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      messageType: "SAY",
      sender: "Personagem",
      content: '"Olá, como você está?" disse o personagem.',
    },
  },
};

export const SystemMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      sender: "Sistema",
      content: "O jogo começou!",
      messageType: undefined,
    },
  },
};

export const WithActions: Story = {
  args: {
    message: sampleMessage,
    onEdit: (id) => console.log("Edit", id),
    onDelete: (id) => console.log("Delete", id),
    onViewContext: (id) => console.log("View Context", id),
  },
};

export const WithoutMarkdown: Story = {
  args: {
    message: sampleMessage,
    renderMarkdown: false,
  },
};

export const SummaryMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      isSummary: true,
      content: "**Resumo do capítulo anterior:** Os heróis chegaram à cidade...",
    },
  },
};

export const CustomTimestamp: Story = {
  args: {
    message: sampleMessage,
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours()}:${date.getMinutes()}`;
    },
  },
};

export const CustomMessageType: Story = {
  args: {
    message: {
      ...sampleMessage,
      messageType: "CUSTOM",
      content: "Mensagem com tipo customizado",
    },
    messageTypeConfig: {
      CUSTOM: {
        label: "CUSTOM",
        badgeClassName: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        containerClassName: "bg-purple-50 dark:bg-purple-900/20 border-purple-500",
        senderClassName: "text-purple-700 dark:text-purple-400",
      },
    },
  },
};
