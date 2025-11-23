import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScriptEditor } from "./script-editor";

const meta = {
  title: "Flowtomic UI/Organisms/ScriptEditor",
  component: ScriptEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultScript: {
      control: "text",
      description: "Script inicial",
    },
    wsUrl: {
      control: "text",
      description: "URL do WebSocket para conexão em tempo real",
    },
    autoConnect: {
      control: "boolean",
      description: "Se deve conectar automaticamente ao WebSocket",
    },
    maxReconnectAttempts: {
      control: "number",
      description: "Número máximo de tentativas de reconexão",
    },
  },
} satisfies Meta<typeof ScriptEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomScript: Story = {
  args: {
    defaultScript: `// Script customizado de exemplo
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Resultado:", doubled);
return { numbers, doubled };`,
  },
};

export const WithWebSocket: Story = {
  args: {
    wsUrl: "ws://localhost:8080/ws/terminal",
    defaultScript: `// Script que será executado via WebSocket
console.log("Conectado via WebSocket");
return { status: "connected", timestamp: new Date() };`,
  },
};

export const WithHTTPFallback: Story = {
  args: {
    executeScript: async (script: string) => {
      // Simulação de execução HTTP
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        output: `Script executado: ${script.substring(0, 50)}...`,
        result: {
          message: "Script executado com sucesso",
          timestamp: new Date().toISOString(),
          scriptLength: script.length,
        },
      };
    },
    defaultScript: `// Este script será executado via HTTP (fallback)
const result = {
  message: "Hello from HTTP!",
  data: [1, 2, 3, 4, 5],
};
return result;`,
  },
};

export const Disconnected: Story = {
  args: {
    autoConnect: false,
    defaultScript: `// WebSocket desabilitado
console.log("Modo desconectado - use executeScript prop para HTTP");`,
  },
};
