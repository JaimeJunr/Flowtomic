import type { Meta, StoryObj } from "@storybook/react-vite";
import { EditChatMessageModal } from "./edit-chat-message-modal";

const meta = {
  title: "Flowtomic UI/Molecules/Feedback/EditChatMessageModal",
  component: EditChatMessageModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "Se está carregando (salvando)",
    },
  },
} satisfies Meta<typeof EditChatMessageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessage = {
  id: 1,
  content: "A porta da taverna range. Lá dentro, só o taverneiro e três canecas ainda cheias.",
  sender: "Mestre",
  // Data fixa para o horário não mudar a cada abertura da story
  timestamp: new Date(2026, 9, 2, 19, 15),
  messageType: "STORY" as const,
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    message: sampleMessage,
    onSave: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
};

export const WithActionMessage: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    message: {
      ...sampleMessage,
      messageType: "ACTION",
      sender: "Personagem",
      content: "Examino as canecas sem tocar nelas.",
    },
    onSave: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
};

export const WithSayMessage: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    message: {
      ...sampleMessage,
      messageType: "SAY",
      sender: "Personagem",
      content: "“Quem saiu com tanta pressa que nem bebeu?”",
    },
    onSave: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    message: sampleMessage,
    isLoading: true,
    onSave: () => new Promise((resolve) => setTimeout(resolve, 2000)),
  },
};

export const WithoutMessageType: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    message: {
      ...sampleMessage,
      messageType: undefined,
    },
    onSave: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
};
