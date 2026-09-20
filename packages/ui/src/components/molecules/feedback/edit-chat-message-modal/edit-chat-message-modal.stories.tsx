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
  content: "Esta é uma **mensagem** de exemplo que pode ser editada.",
  sender: "Mestre",
  timestamp: new Date(),
  messageType: "STORY" as const,
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    message: sampleMessage,
    onSave: async (id, content) => {
      console.log("Save", id, content);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

export const WithActionMessage: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    message: {
      ...sampleMessage,
      messageType: "ACTION",
      content: "O personagem *ataca* o inimigo!",
    },
    onSave: async (id, content) => {
      console.log("Save", id, content);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

export const WithSayMessage: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    message: {
      ...sampleMessage,
      messageType: "SAY",
      content: '"Olá, como você está?" disse o personagem.',
    },
    onSave: async (id, content) => {
      console.log("Save", id, content);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    message: sampleMessage,
    isLoading: true,
    onSave: async (id, content) => {
      console.log("Save", id, content);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
};

export const WithoutMessageType: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    message: {
      ...sampleMessage,
      messageType: undefined,
    },
    onSave: async (id, content) => {
      console.log("Save", id, content);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};
