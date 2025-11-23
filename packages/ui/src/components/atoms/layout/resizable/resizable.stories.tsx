import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const meta = {
  title: "Flowtomic UI/Atoms/Layout/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Componentes base para criar layouts redimensionáveis usando react-resizable-panels. Inclui ResizablePanelGroup, ResizablePanel e ResizableHandle.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Direção do layout (horizontal ou vertical)",
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-[300px] w-full">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4 bg-muted">
            <p className="text-sm">Painel 1</p>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm">Painel 2</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const ResizableLayoutStyle: Story = {
  render: () => (
    <div className="h-[400px] w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="flex h-full flex-col border-r bg-muted p-4">
            <h2 className="mb-4 text-lg font-semibold">Sidebar</h2>
            <nav className="space-y-2">
              <div className="rounded-md bg-background p-2 text-sm">Item 1</div>
              <div className="rounded-md bg-background p-2 text-sm">Item 2</div>
            </nav>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="flex h-full flex-col p-6">
            <h1 className="mb-4 text-2xl font-bold">Conteúdo Principal</h1>
            <p className="text-muted-foreground">Conteúdo redimensionável</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Resizable como no ResizableLayout, usado para criar layouts com sidebar redimensionável e conteúdo principal.",
      },
    },
  },
};

/**
 * Exemplo básico com layout horizontal
 */
export const Horizontal: Story = {
  render: () => (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Esquerdo (25%)</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm">Painel Central (50%)</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Direito (25%)</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Layout horizontal com três painéis redimensionáveis e handles visíveis.",
      },
    },
  },
};

/**
 * Exemplo com layout vertical
 */
export const Vertical: Story = {
  render: () => (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup direction="vertical" className="border rounded-lg">
        <ResizablePanel defaultSize={33} minSize={20}>
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Superior (33%)</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={34} minSize={20}>
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm">Painel Central (34%)</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={33} minSize={20}>
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Inferior (33%)</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Layout vertical com três painéis empilhados verticalmente.",
      },
    },
  },
};

/**
 * Exemplo com sidebar e conteúdo principal
 */
export const SidebarLayout: Story = {
  render: () => (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <div className="flex h-full flex-col border-r bg-muted p-4">
            <h2 className="mb-4 text-lg font-semibold">Sidebar</h2>
            <nav className="space-y-2">
              <div className="rounded-md bg-background p-2 text-sm">Menu Item 1</div>
              <div className="rounded-md bg-background p-2 text-sm">Menu Item 2</div>
              <div className="rounded-md bg-background p-2 text-sm">Menu Item 3</div>
            </nav>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} minSize={60}>
          <div className="flex h-full flex-col p-6">
            <h1 className="mb-4 text-2xl font-bold">Conteúdo Principal</h1>
            <p className="text-muted-foreground">
              Este é o conteúdo principal. Você pode redimensionar a sidebar arrastando o handle.
            </p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Layout típico de sidebar com conteúdo principal, comum em dashboards e aplicações.",
      },
    },
  },
};

/**
 * Exemplo sem handle visível
 */
export const WithoutHandle: Story = {
  render: () => (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Esquerdo</p>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm">Painel Direito</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Layout com handle invisível (sem withHandle). O handle ainda é funcional, apenas não mostra o ícone visual.",
      },
    },
  },
};

/**
 * Exemplo com painéis colapsáveis
 */
export const Collapsible: Story = {
  render: () => (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          collapsible
          collapsedSize={5}
          collapsibleThreshold={10}
        >
          <div className="flex h-full items-center justify-center p-6 bg-muted">
            <p className="text-sm text-muted-foreground">Painel Colapsável</p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm">Conteúdo Principal</p>
            <p className="ml-4 text-xs text-muted-foreground">
              Redimensione o painel esquerdo até o mínimo para colapsá-lo
            </p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Painel colapsável que pode ser minimizado até um tamanho mínimo. Útil para sidebars que podem ser ocultadas.",
      },
    },
  },
};
