import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChatInput, type ChatInputProps } from "./chat-input";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/ChatInput",
  component: ChatInput,
  parameters: {
    layout: "padded",
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
  args: {
    value: "",
    onChange: () => {},
    onSubmit: () => {},
  },
  // O campo é controlado: a story guarda o texto para dar para digitar de verdade
  render: function ControlledChatInput(args: ChatInputProps) {
    const [value, setValue] = useState(args.value);
    const [messageType, setMessageType] = useState(args.selectedMessageType);
    const [mode, setMode] = useState(args.selectedMode);
    return (
      <div className="max-w-xl">
        <ChatInput
          {...args}
          value={value}
          onChange={setValue}
          selectedMessageType={messageType}
          onMessageTypeChange={setMessageType}
          selectedMode={mode}
          onModeChange={setMode}
        />
      </div>
    );
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMessageTypes: Story = {
  args: {
    messageTypes: [
      { value: "STORY", label: "Narração" },
      { value: "ACTION", label: "Ação" },
      { value: "SAY", label: "Fala" },
    ],
    selectedMessageType: "ACTION",
  },
};

export const WithModes: Story = {
  args: {
    modes: [
      {
        value: "write",
        label: "Escrever",
        description: "O texto entra no log como você escreveu",
      },
      {
        value: "suggest",
        label: "Pedir sugestão",
        description: "Você descreve a cena e recebe uma sugestão para revisar",
      },
    ],
    selectedMode: "write",
  },
};

export const WithHeader: Story = {
  args: {
    showHeader: true,
    headerTitle: "Narração da mesa",
    headerDescription: "O que você escrever aqui aparece para todos os jogadores",
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: "Descreva o que o personagem faz",
  },
};

export const Disabled: Story = {
  args: {
    value: "A porta da taverna range.",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    value: "A porta da taverna range.",
    isLoading: true,
  },
};

export const WithoutCounter: Story = {
  args: {
    showCounter: false,
  },
};

export const CustomMaxLength: Story = {
  args: {
    value: "Examino as canecas sem tocar nelas, procurando marcas",
    maxLength: 60,
  },
};
