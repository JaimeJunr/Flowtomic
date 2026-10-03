import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChatMessage } from "./chat-message";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ChatMessage",
  component: ChatMessage,
  parameters: {
    layout: "padded",
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
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Data fixa para o horário não mudar a cada abertura da story
const sampleMessage = {
  id: 1,
  content: "A porta da taverna **range**. Lá dentro, só o taverneiro e três canecas ainda cheias.",
  sender: "Mestre",
  timestamp: new Date(2026, 9, 2, 19, 15),
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
      content: "Examino as canecas *sem tocar nelas*.",
    },
  },
};

export const SayMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      messageType: "SAY",
      sender: "Personagem",
      content: "“Quem saiu com tanta pressa que nem bebeu?”",
    },
  },
};

export const SystemMessage: Story = {
  args: {
    message: {
      ...sampleMessage,
      sender: "Sistema",
      content: "Rolagem de Percepção: 14",
      messageType: undefined,
    },
  },
};

export const WithActions: Story = {
  args: {
    message: sampleMessage,
    onEdit: () => {},
    onDelete: () => {},
    onViewContext: () => {},
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
      content: "**Na sessão anterior:** o grupo chegou à cidade e alugou quartos na taverna.",
    },
  },
};

export const CustomTimestamp: Story = {
  args: {
    message: sampleMessage,
    formatTimestamp: (timestamp) =>
      new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  },
};

export const CustomMessageType: Story = {
  args: {
    message: {
      ...sampleMessage,
      messageType: "OOC",
      sender: "Personagem",
      content: "Vou ter que sair às dez hoje.",
    },
    messageTypeConfig: {
      OOC: {
        label: "Fora do jogo",
        badgeClassName: "bg-muted-foreground",
      },
    },
  },
};
