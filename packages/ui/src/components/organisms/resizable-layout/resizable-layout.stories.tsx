import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useId, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { ResizableLayout } from "./resizable-layout";

const meta = {
  title: "Flowtomic UI/Organisms/ResizableLayout",
  component: ResizableLayout,
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
} satisfies Meta<typeof ResizableLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente wrapper para gerenciar o estado do sidebar.
 * Em docs (várias instâncias na mesma página), usa persistKey único por instância
 * para evitar que uma sobrescreva a outra no localStorage.
 */
function ResizableLayoutWrapper(
  props: Omit<React.ComponentProps<typeof ResizableLayout>, "sidebarOpen" | "setSidebarOpen"> & {
    /** Quando true (página Docs), suffixa o persistKey com useId() para não colidir entre instâncias */
    docsMode?: boolean;
  }
) {
  const { docsMode, persistKey = "default", ...rest } = props;
  const instanceId = useId();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stablePersistKey =
    docsMode === true ? `${persistKey}-${instanceId.replace(/:/g, "-")}` : persistKey;

  return (
    <div className="h-screen w-screen min-h-[400px] min-w-[600px]">
      <ResizableLayout
        {...rest}
        persistKey={stablePersistKey}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
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
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Padrão" />}
      side="left"
      persistKey="storybook-default"
    >
      <ExampleContent title="Conteúdo Principal" />
    </ResizableLayoutWrapper>
  ),
};

export const SidebarRight: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar à Direita" />}
      side="right"
      persistKey="storybook-sidebar-right"
    >
      <ExampleContent title="Conteúdo Principal" />
    </ResizableLayoutWrapper>
  ),
};

export const CustomSizes: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Customizada" />}
      side="left"
      persistKey="storybook-custom-sizes"
      defaultSidebarPct={0.35}
      minPx={200}
      maxPct={0.5}
      maxPxCap={400}
    >
      <ExampleContent title="Conteúdo com Sidebar Customizada" />
    </ResizableLayoutWrapper>
  ),
};

export const WithPersistence: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Persistente" />}
      side="left"
      persistKey="storybook-resizable"
      defaultSidebarPct={0.3}
    >
      <ExampleContent title="Conteúdo com Persistência" />
    </ResizableLayoutWrapper>
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
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Handle Espesso" />}
      side="left"
      persistKey="storybook-thick-resizer"
      resizerThicknessPx={16}
    >
      <ExampleContent title="Conteúdo com Handle Espesso" />
    </ResizableLayoutWrapper>
  ),
};

export const NarrowSidebar: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Estreita" />}
      side="left"
      persistKey="storybook-narrow"
      defaultSidebarPct={0.15}
      minPx={150}
      maxPct={0.3}
    >
      <ExampleContent title="Conteúdo com Sidebar Estreita" />
    </ResizableLayoutWrapper>
  ),
};

export const WideSidebar: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Larga" />}
      side="left"
      persistKey="storybook-wide"
      defaultSidebarPct={0.5}
      minPx={300}
      maxPct={0.7}
      maxPxCap={600}
    >
      <ExampleContent title="Conteúdo com Sidebar Larga" />
    </ResizableLayoutWrapper>
  ),
};

export const WithSnap: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar com Snap" />}
      side="left"
      persistKey="storybook-snap"
      defaultSidebarPct={0.25}
      tinySizePx={60}
      snapThreshold={50}
    >
      <ExampleContent title="Conteúdo com Snap Automático" />
    </ResizableLayoutWrapper>
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
