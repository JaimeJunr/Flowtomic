import type { Meta, StoryObj } from "@storybook/react-vite";
import { Edit3, Wand2 } from "lucide-react";
import { ChatInput } from "./chat-input";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/ChatInput",
  component: ChatInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    maxLength: {
      control: "number",
      description: "Número máximo de caracteres",
    },
    showCounter: {
      control: "boolean",
      description: "Se deve mostrar o contador de caracteres",
    },
    showHeader: {
      control: "boolean",
      description: "Se deve mostrar o header",
    },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
  },
};

export const WithMessageTypes: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value, messageType) => console.log("Submit", value, messageType),
    messageTypes: [
      { value: "STORY", label: "Narrar" },
      { value: "ACTION", label: "Ação" },
      { value: "SAY", label: "Fala" },
    ],
    selectedMessageType: "STORY",
    onMessageTypeChange: (type) => console.log("Message type changed", type),
  },
};

export const WithModes: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value, messageType, mode) => console.log("Submit", value, messageType, mode),
    modes: [
      {
        value: "narrate",
        label: "Escrever Diretamente",
        icon: <Edit3 className="w-4 h-4" />,
        description: "Você escreve e adiciona diretamente ao log da história",
      },
      {
        value: "suggest",
        label: "Pedir Sugestão IA",
        icon: <Wand2 className="w-4 h-4" />,
        description: "A IA criará uma sugestão baseada na sua descrição",
      },
    ],
    selectedMode: "narrate",
    onModeChange: (mode) => console.log("Mode changed", mode),
  },
};

export const WithHeader: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    showHeader: true,
    headerTitle: "Entrada do Mestre",
    headerDescription: "Digite sua mensagem aqui",
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    placeholder: "Narrar a história...",
  },
};

export const Disabled: Story = {
  args: {
    value: "Mensagem desabilitada",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    value: "Mensagem sendo enviada...",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    isLoading: true,
  },
};

export const WithoutCounter: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    showCounter: false,
  },
};

export const CustomMaxLength: Story = {
  args: {
    value: "",
    onChange: (value) => console.log("Change", value),
    onSubmit: (value) => console.log("Submit", value),
    maxLength: 500,
  },
};
