import type { Meta, StoryObj } from "@storybook/react-vite";
import DeveloperPanel from "./page";
import type { DeveloperPanelProps, EnvironmentInfo, SystemHealth, SystemInfo, UserInfo } from "./page";

const meta = {
  title: "Flowtomic UI/Blocks/Developer Panel",
  component: DeveloperPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Painel de desenvolvedor completo com informações do sistema, ambiente e ferramentas de desenvolvimento. Inclui editor de scripts integrado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    loading: {
      control: "boolean",
      description: "Estado de carregamento",
    },
    error: {
      control: "text",
      description: "Mensagem de erro",
    },
    apiBaseUrl: {
      control: "text",
      description: "URL base da API",
    },
  },
} satisfies Meta<typeof DeveloperPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dados de exemplo
const mockUser: UserInfo = {
  username: "dev.user",
  email: "dev@example.com",
  role: "ADMIN",
  isAdmin: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVc2VyIn0",
};

const mockHealth: SystemHealth = {
  status: "UP",
  timestamp: new Date().toISOString(),
  service: "api-service",
};

const mockSystemInfo: SystemInfo = {
  name: "Flowtomic App",
  version: "1.0.0",
  description: "Aplicação de exemplo usando Flowtomic UI",
};

const mockEnvironmentInfo: EnvironmentInfo = {
  apiBaseUrl: "https://api.example.com/api",
  nodeEnv: "development",
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export const Default: Story = {
  args: {
    user: mockUser,
    health: mockHealth,
    systemInfo: mockSystemInfo,
    environmentInfo: mockEnvironmentInfo,
    loading: false,
    error: null,
    apiBaseUrl: "https://api.example.com/api",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    user: mockUser,
    error: "Erro ao carregar informações do sistema",
    apiBaseUrl: "https://api.example.com/api",
  },
};

export const MinimalData: Story = {
  args: {
    user: {
      username: "user",
      email: "user@example.com",
      role: "USER",
      isAdmin: false,
    },
    apiBaseUrl: "https://api.example.com/api",
  },
};

export const WithScriptEditor: Story = {
  args: {
    user: mockUser,
    health: mockHealth,
    systemInfo: mockSystemInfo,
    environmentInfo: mockEnvironmentInfo,
    apiBaseUrl: "https://api.example.com/api",
    scriptEditorProps: {
      defaultScript: "console.log('Hello from Flowtomic!');",
    },
  },
};

export const AdminUser: Story = {
  args: {
    user: {
      ...mockUser,
      isAdmin: true,
    },
    health: mockHealth,
    systemInfo: mockSystemInfo,
    environmentInfo: mockEnvironmentInfo,
    apiBaseUrl: "https://api.example.com/api",
  },
};

export const SystemDown: Story = {
  args: {
    user: mockUser,
    health: {
      status: "DOWN",
      timestamp: new Date().toISOString(),
      service: "api-service",
    },
    systemInfo: mockSystemInfo,
    environmentInfo: mockEnvironmentInfo,
    apiBaseUrl: "https://api.example.com/api",
  },
};

