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
    defaultScript: `// Conta quantos componentes de cada tipo o registry expõe
def registry = ctx.getBean("componentRegistryService")
def porTipo = registry.findAll().groupBy { it.type }

def resultado = porTipo.collectEntries { tipo, itens -> [(tipo): itens.size()] }
resultado`,
  },
};

export const WithWebSocket: Story = {
  args: {
    wsUrl: "ws://localhost:8080/ws/registry",
    defaultScript: `// Script executado via WebSocket, com o log chegando linha a linha
def registry = ctx.getBean("componentRegistryService")
registry.findAll().each { println "adicionado em \${it.addedAt}: \${it.name}" }`,
  },
};

export const WithHTTPFallback: Story = {
  args: {
    executeScript: async (script: string) => {
      // Simulação de execução HTTP, sem WebSocket disponível
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        output: `flowtomic-cli add stat-card\n${script.split("\n")[0]}`,
        result: {
          instalado: "stat-card",
          arquivos: ["stat-card.tsx", "stat-card.stories.tsx", "index.ts"],
        },
      };
    },
    defaultScript: `// Este script roda via HTTP (fallback, sem WebSocket)
// bunx flowtomic-cli add stat-card
def resultado = ctx.getBean("cliService").add("stat-card")
resultado`,
  },
};

export const Disconnected: Story = {
  args: {
    autoConnect: false,
    defaultScript: `// WebSocket desabilitado — use a prop executeScript para HTTP
def registry = ctx.getBean("componentRegistryService")
registry.findAll().size()`,
  },
};
