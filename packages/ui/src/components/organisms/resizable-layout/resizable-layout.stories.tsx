import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useId, useState } from "react";
import { Button } from "../../atoms";
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

const COMPONENT_GROUPS = [
  { label: "Atoms", count: 63 },
  { label: "Molecules", count: 47 },
  { label: "Organisms", count: 30 },
  { label: "Hooks", count: 14 },
];

/**
 * Sidebar de exemplo: o índice de componentes do Flowtomic.
 * `title` fica só como rótulo acessível da variação da story.
 */
const ExampleSidebar = ({ title = "Componentes" }: { title?: string }) => (
  <nav aria-label={title} className="flex h-full flex-col gap-4 p-4">
    <span className="font-display px-2 text-sm font-semibold">Componentes</span>
    <ul className="text-sm">
      {COMPONENT_GROUPS.map((group, index) => (
        <li key={group.label}>
          <Button
            variant="ghost"
            className={index === 2 ? "w-full justify-between bg-accent" : "w-full justify-between"}
          >
            {group.label}
            <span className="font-mono text-xs text-muted-foreground">{group.count}</span>
          </Button>
        </li>
      ))}
    </ul>
  </nav>
);

/**
 * Conteúdo principal de exemplo: a página de um organism.
 */
const ExampleContent = ({ title = "stats-grid" }: { title?: string }) => (
  <article className="flex h-full max-w-2xl flex-col gap-4 overflow-auto p-8">
    <h1 className="font-display text-2xl font-bold">{title}</h1>
    <p className="text-[15px] leading-relaxed text-foreground/80">
      Régua de métricas com valor em mono e variação contra o período anterior. Arraste a divisória
      para dar mais espaço à lista; dois cliques nela fecham ou abrem a lista.
    </p>
    <pre className="overflow-x-auto rounded-md bg-foreground px-4 py-3 font-mono text-sm text-background">
      <code>bunx flowtomic-cli add stats-grid</code>
    </pre>
  </article>
);

export const Default: Story = {
  render: (_args, context) => (
    <ResizableLayoutWrapper
      docsMode={context.viewMode === "docs"}
      sidebar={<ExampleSidebar title="Sidebar Padrão" />}
      side="left"
      persistKey="storybook-default"
    >
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
      <ExampleContent />
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
