import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Node as ReactFlowNode } from "@xyflow/react";
import { Position, useEdgesState, useNodesState } from "@xyflow/react";
import type { ReactNode } from "react";
import { Canvas } from "@/components/molecules/flow/canvas";
import { Node, NodeContent, NodeHeader, NodeTitle } from "../node";
import { Toolbar } from "./toolbar";

const meta = {
  title: "Flowtomic UI/Organisms/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Toolbar component wrapper do NodeToolbar do @xyflow/react. Usado para exibir ações em nodes do ReactFlow.",
      },
      canvas: {
        sourceState: "shown",
      },
    },
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      description: "Posição do toolbar em relação ao node",
      control: "select",
      options: [Position.Top, Position.Bottom, Position.Left, Position.Right],
      table: {
        type: { summary: "Position" },
      },
    },
    children: {
      description: "Conteúdo do toolbar (geralmente botões de ação)",
      control: false,
    },
    className: {
      description: "Classes CSS adicionais para o componente",
      control: "text",
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Componente wrapper para usar Toolbar dentro do Canvas
const ToolbarInCanvas = ({
  toolbarChildren,
  toolbarPosition,
}: {
  toolbarChildren: ReactNode;
  toolbarPosition?: Position;
}) => {
  const [nodes, _setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([
    {
      id: "1",
      type: "custom",
      position: { x: 250, y: 250 },
      data: { toolbarChildren, toolbarPosition },
    },
  ]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = {
    custom: ({ data }: { data: { toolbarChildren: ReactNode; toolbarPosition?: Position } }) => (
      <Node handles={{ top: { type: "target" }, bottom: { type: "source" } }}>
        <Toolbar position={data.toolbarPosition}>{data.toolbarChildren}</Toolbar>
        <NodeHeader>
          <NodeTitle>Node com Toolbar</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <p className="text-sm">Passe o mouse sobre o node para ver o toolbar</p>
        </NodeContent>
      </Node>
    ),
  };

  return (
    <Canvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
};

export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <ToolbarInCanvas
        toolbarChildren={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-destructive px-2 py-1 text-destructive-foreground text-xs"
            >
              Delete
            </button>
          </div>
        }
      />
    </div>
  ),
};

export const TopPosition: Story = {
  render: () => (
    <div className="h-screen w-full">
      <ToolbarInCanvas
        toolbarPosition={Position.Top}
        toolbarChildren={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-destructive px-2 py-1 text-destructive-foreground text-xs"
            >
              Delete
            </button>
          </div>
        }
      />
    </div>
  ),
};

export const MultipleActions: Story = {
  render: () => (
    <div className="h-screen w-full">
      <ToolbarInCanvas
        toolbarChildren={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded bg-secondary px-2 py-1 text-secondary-foreground text-xs"
            >
              Copy
            </button>
            <button
              type="button"
              className="rounded bg-secondary px-2 py-1 text-secondary-foreground text-xs"
            >
              Share
            </button>
            <button
              type="button"
              className="rounded bg-destructive px-2 py-1 text-destructive-foreground text-xs"
            >
              Delete
            </button>
          </div>
        }
      />
    </div>
  ),
};
