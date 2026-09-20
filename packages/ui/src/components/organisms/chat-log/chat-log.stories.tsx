import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/atoms";
import { ChatLog } from "./chat-log";

const meta = {
  title: "Flowtomic UI/Organisms/ChatLog",
  component: ChatLog,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    autoScroll: {
      control: "boolean",
      description: "Se deve fazer scroll automático para a última mensagem",
    },
    showActions: {
      control: "boolean",
      description: "Se deve mostrar ações nas mensagens",
    },
    showTimestamp: {
      control: "boolean",
      description: "Se deve mostrar timestamp nas mensagens",
    },
  },
} satisfies Meta<typeof ChatLog>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages = [
  {
    id: 1,
    content: "Esta é uma **mensagem** de exemplo com *markdown*.",
    sender: "Mestre",
    timestamp: new Date(Date.now() - 3600000),
    messageType: "STORY",
  },
  {
    id: 2,
    content: "O personagem *ataca* o inimigo com sua espada!",
    sender: "Personagem",
    timestamp: new Date(Date.now() - 1800000),
    messageType: "ACTION",
  },
  {
    id: 3,
    content: '"Olá, como você está?" disse o personagem.',
    sender: "Personagem",
    timestamp: new Date(Date.now() - 900000),
    messageType: "SAY",
  },
  {
    id: 4,
    content: "O jogo começou!",
    sender: "Sistema",
    timestamp: new Date(Date.now() - 600000),
  },
];

export const Default: Story = {
  args: {
    messages: sampleMessages,
    onMessageEdit: (id) => console.log("Edit", id),
    onMessageDelete: (id) => console.log("Delete", id),
    onMessageViewContext: (id) => console.log("View Context", id),
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    messages: [],
    emptyStateTitle: "Bem-vindo à sua aventura!",
    emptyStateDescription: "Crie um personagem e comece a narrar sua história.",
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const WithHeaderActions: Story = {
  args: {
    messages: sampleMessages,
    headerActions: (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Capítulo 1: A Jornada Começa
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" title="Gerenciar Capítulos">
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Pesquisar">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    ),
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const WithFilters: Story = {
  args: {
    messages: sampleMessages,
    filters: (
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtros:</span>
          <Button variant="outline" size="sm">
            STORY
          </Button>
          <Button variant="outline" size="sm">
            ACTION
          </Button>
          <Button variant="outline" size="sm">
            SAY
          </Button>
        </div>
      </div>
    ),
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const WithoutActions: Story = {
  args: {
    messages: sampleMessages,
    showActions: false,
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const WithoutTimestamp: Story = {
  args: {
    messages: sampleMessages,
    showTimestamp: false,
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const WithoutMarkdown: Story = {
  args: {
    messages: sampleMessages,
    renderMarkdown: false,
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};

export const ManyMessages: Story = {
  args: {
    messages: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      content: `Mensagem número ${i + 1} com algum conteúdo interessante.`,
      sender: i % 3 === 0 ? "Mestre" : i % 3 === 1 ? "Personagem" : "Sistema",
      timestamp: new Date(Date.now() - (50 - i) * 60000),
      messageType: i % 3 === 0 ? "STORY" : i % 3 === 1 ? "ACTION" : undefined,
    })),
  },
  render: (args) => (
    <div className="h-[600px]">
      <ChatLog {...args} />
    </div>
  ),
};
