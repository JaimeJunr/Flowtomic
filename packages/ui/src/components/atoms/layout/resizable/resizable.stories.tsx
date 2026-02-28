import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { ResizableLayout } from "../../../organisms/resizable-layout/resizable-layout";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

/**
 * Stories do componente Resizable.
 *
 * O Resizable é usado para criar painéis redimensionáveis que podem ser
 * ajustados pelo usuário arrastando as bordas.
 *
 * @see [Resizable Component](../resizable.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Componentes para criar layouts redimensionáveis. Suporta direções horizontal e vertical, com handles visuais para redimensionamento.",
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

/**
 * Story padrão do Resizable.
 * Demonstra o uso básico com dois painéis horizontais.
 */
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel1 = canvas.getByText("Painel 1");
    const panel2 = canvas.getByText("Painel 2");
    await expect(panel1).toBeInTheDocument();
    await expect(panel2).toBeInTheDocument();
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

/**
 * Exemplo usando o organismo ResizableLayout (sidebar + conteúdo com persistência e handle).
 */
function ResizableLayoutExample() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="h-[400px] w-full">
      <ResizableLayout
        sidebar={
          <div className="flex flex-col gap-2 p-4">
            <h2 className="text-lg font-semibold">Sidebar</h2>
            <nav className="space-y-1 text-sm">
              <div className="rounded-md bg-muted/50 px-2 py-1.5">Item 1</div>
              <div className="rounded-md bg-muted/50 px-2 py-1.5">Item 2</div>
            </nav>
          </div>
        }
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        persistKey="resizable-atom-story"
      >
        <div className="flex h-full flex-col p-6">
          <h1 className="mb-2 text-xl font-bold">Conteúdo Principal</h1>
          <p className="text-muted-foreground">
            Este exemplo usa o organismo ResizableLayout, que compõe os átomos Resizable com
            persistência e controle de sidebar.
          </p>
        </div>
      </ResizableLayout>
    </div>
  );
}

export const WithResizableLayout: Story = {
  render: () => <ResizableLayoutExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Único exemplo que usa o organismo ResizableLayout. Mostra sidebar redimensionável com persistência e conteúdo principal.",
      },
    },
  },
};
