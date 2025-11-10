import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../atoms/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/card/card";
import { Resizable } from "./resizable";

const meta = {
  title: "Flowtomic UI/Organisms/Resizable",
  component: Resizable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Componente de layout com sidebar redimensionável. Suporta sidebar à esquerda ou direita, persistência de tamanho, modo mobile com drawer e snap automático.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["left", "right"],
      description: "Lado onde a sidebar será posicionada",
    },
    defaultSidebarPct: {
      control: { type: "number", min: 0.1, max: 0.9, step: 0.01 },
      description: "Tamanho padrão da sidebar em porcentagem (0.1 a 0.9)",
    },
    minPx: {
      control: { type: "number", min: 100, max: 500, step: 10 },
      description: "Largura mínima da sidebar em pixels",
    },
    maxPct: {
      control: { type: "number", min: 0.3, max: 0.9, step: 0.01 },
      description: "Tamanho máximo da sidebar em porcentagem",
    },
    maxPxCap: {
      control: { type: "number", min: 300, max: 800, step: 50 },
      description: "Largura máxima absoluta da sidebar em pixels",
    },
    resizerThicknessPx: {
      control: { type: "number", min: 4, max: 16, step: 1 },
      description: "Espessura do handle de redimensionamento em pixels",
    },
    mobileDrawer: {
      control: "boolean",
      description: "Usar drawer em dispositivos móveis",
    },
    drawerWidthVw: {
      control: { type: "number", min: 50, max: 100, step: 5 },
      description: "Largura do drawer em viewport width (%)",
    },
    persistKey: {
      control: "text",
      description: "Chave para persistir o tamanho da sidebar no localStorage",
    },
  },
} satisfies Meta<typeof Resizable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente wrapper para gerenciar o estado do sidebar
 */
function ResizableWrapper(
  props: Omit<React.ComponentProps<typeof Resizable>, "sidebarOpen" | "setSidebarOpen">
) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen">
      <Resizable {...props} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
}

/**
 * Sidebar de exemplo
 */
const ExampleSidebar = ({ title = "Sidebar" }: { title?: string }) => (
  <div className="p-4 h-full">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <nav className="space-y-2">
      <Button variant="ghost" className="w-full justify-start">
        Menu Item 1
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        Menu Item 2
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        Menu Item 3
      </Button>
    </nav>
    <div className="mt-8 p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">
        Esta é uma sidebar de exemplo. Você pode redimensionar arrastando o handle.
      </p>
    </div>
  </div>
);

/**
 * Conteúdo principal de exemplo
 */
const ExampleContent = ({ title = "Conteúdo Principal" }: { title?: string }) => (
  <div className="p-6 h-full overflow-auto">
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Este é o conteúdo principal. A sidebar pode ser redimensionada arrastando o handle entre
          os painéis.
        </p>
        <p className="mb-4">
          Você pode fazer duplo clique no handle para colapsar/expandir a sidebar automaticamente.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">• Arraste o handle para redimensionar</p>
          <p className="text-sm text-muted-foreground">
            • Duplo clique no handle para colapsar/expandir
          </p>
          <p className="text-sm text-muted-foreground">
            • O tamanho é persistido automaticamente no localStorage
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const Default: Story = {
  render: () => (
    <ResizableWrapper sidebar={<ExampleSidebar title="Sidebar Padrão" />} side="left">
      <ExampleContent title="Conteúdo Principal" />
    </ResizableWrapper>
  ),
};

export const SidebarRight: Story = {
  render: () => (
    <ResizableWrapper sidebar={<ExampleSidebar title="Sidebar à Direita" />} side="right">
      <ExampleContent title="Conteúdo Principal" />
    </ResizableWrapper>
  ),
};

export const CustomSizes: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Sidebar Customizada" />}
      side="left"
      defaultSidebarPct={0.35}
      minPx={200}
      maxPct={0.5}
      maxPxCap={400}
    >
      <ExampleContent title="Conteúdo com Sidebar Customizada" />
    </ResizableWrapper>
  ),
};

export const WithPersistence: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Sidebar Persistente" />}
      side="left"
      persistKey="storybook-resizable"
      defaultSidebarPct={0.3}
    >
      <ExampleContent title="Conteúdo com Persistência" />
    </ResizableWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "O tamanho da sidebar é persistido no localStorage usando a chave 'storybook-resizable'. Redimensione e recarregue a página para ver a persistência.",
      },
    },
  },
};

export const ThickResizer: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Handle Espesso" />}
      side="left"
      resizerThicknessPx={16}
    >
      <ExampleContent title="Conteúdo com Handle Espesso" />
    </ResizableWrapper>
  ),
};

export const NarrowSidebar: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Sidebar Estreita" />}
      side="left"
      defaultSidebarPct={0.15}
      minPx={150}
      maxPct={0.3}
    >
      <ExampleContent title="Conteúdo com Sidebar Estreita" />
    </ResizableWrapper>
  ),
};

export const WideSidebar: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Sidebar Larga" />}
      side="left"
      defaultSidebarPct={0.5}
      minPx={300}
      maxPct={0.7}
      maxPxCap={600}
    >
      <ExampleContent title="Conteúdo com Sidebar Larga" />
    </ResizableWrapper>
  ),
};

export const WithSnap: Story = {
  render: () => (
    <ResizableWrapper
      sidebar={<ExampleSidebar title="Sidebar com Snap" />}
      side="left"
      defaultSidebarPct={0.25}
      tinySizePx={60}
      snapThreshold={50}
    >
      <ExampleContent title="Conteúdo com Snap Automático" />
    </ResizableWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando a sidebar é redimensionada próxima ao tamanho 'tiny', ela faz snap automático para o modo compacto (só ícones).",
      },
    },
  },
};
