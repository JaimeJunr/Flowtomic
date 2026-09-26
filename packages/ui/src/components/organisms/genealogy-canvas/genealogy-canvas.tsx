/**
 * GenealogyCanvas Component - Flowtomic UI
 *
 * Componente para exibir árvores genealógicas interativas em um canvas
 */

import type { GenealogyData, RelationshipType, UseGenealogyOptions } from "@flowtomic/logic";
import { useGenealogy } from "@flowtomic/logic";
import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
  type InternalNode,
  type OnNodesChange,
  Position,
  type Node as ReactFlowNode,
  useEdgesState,
  useInternalNode,
  useNodesState,
} from "@xyflow/react";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { Canvas } from "@/components/molecules/flow/canvas";
import { cn } from "@/lib/utils";
import { Edge } from "../edge";
import { Node, NodeDescription, NodeHeader, NodeTitle } from "../node";

/**
 * Props do componente GenealogyNode (node customizado para genealogia)
 */
interface GenealogyNodeData {
  person: {
    id: string;
    name: string;
    type?: string; // Tipo da entidade: "person", "animal", "litter", "offspring", etc.
    birthDate?: string;
    deathDate?: string;
    gender?: "male" | "female" | "other";
    image?: string; // URL ou base64 da imagem
    photo?: string; // Alias para image
    [key: string]: unknown;
  };
  hierarchy?: {
    parents: Array<{ id: string; name: string }>;
    children: Array<{ id: string; name: string }>;
    siblings: Array<{ id: string; name: string }>;
  };
  isExpanded?: boolean;
}

// yyyy-mm-dd (com ou sem horário/timezone atrás, ex. "1950-01-01T00:00:00Z")
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Formata uma data de nascimento/óbito em pt-BR (dd/mm/aaaa).
 *
 * Parseia y/m/d manualmente em vez de `new Date(string)`: o construtor trata
 * "yyyy-mm-dd" como UTC, então em fusos negativos (ex. UTC-3) a data exibida
 * volta um dia (1950-01-01 vira 31/12/1949). Quando não bate o formato ISO
 * ou os componentes não formam uma data real, devolve o valor original.
 */
function formatPersonDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return value;
  }

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

/**
 * Componente de nó customizado para genealogia
 */
function GenealogyNode({ data }: { data: GenealogyNodeData }) {
  const { person } = data;
  const imageUrl = person.image || person.photo;

  // Usar Node com handles em cima e embaixo para conexões verticais
  return (
    <Node
      handles={{
        top: { type: "target" }, // Receber conexões de pais
        bottom: { type: "source" }, // Enviar conexões para filhos
      }}
      className="overflow-hidden"
    >
      {/* Imagem do animal/pessoa se disponível */}
      {imageUrl && (
        <div className="relative w-full h-32 overflow-hidden">
          <img
            src={imageUrl}
            alt={person.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback se a imagem não carregar
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <NodeHeader>
        <NodeTitle>{person.name}</NodeTitle>
        {person.type && (
          <NodeDescription className="text-xs capitalize">{person.type}</NodeDescription>
        )}
        {person.birthDate && (
          <NodeDescription className="text-xs">
            {formatPersonDate(person.birthDate)}
            {person.deathDate && ` - ${formatPersonDate(person.deathDate)}`}
          </NodeDescription>
        )}
      </NodeHeader>
    </Node>
  );
}

/**
 * Props do componente GenealogyCanvas
 */
export interface GenealogyCanvasProps
  extends Omit<ComponentProps<typeof Canvas>, "nodes" | "edges" | "nodeTypes" | "edgeTypes"> {
  /**
   * Dados da árvore genealógica
   */
  data: GenealogyData;

  /**
   * IDs de nós inicialmente expandidos
   */
  initialExpanded?: string[];

  /**
   * Largura dos nós em pixels
   */
  nodeWidth?: number;

  /**
   * Altura dos nós em pixels
   */
  nodeHeight?: number;

  /**
   * Espaçamento horizontal entre nós em pixels
   */
  horizontalSpacing?: number;

  /**
   * Espaçamento vertical entre nós em pixels
   */
  verticalSpacing?: number;

  /**
   * Callback quando um nó é selecionado
   */
  onNodeSelect?: (nodeId: string, entity: GenealogyNodeData["person"]) => void;

  /**
   * Callback quando um nó é expandido/colapsado
   */
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;

  /**
   * Callback para adicionar relacionamento
   */
  onAddRelation?: (fromId: string, toId: string, type: RelationshipType) => void;

  /**
   * Customizar renderização do nó
   */
  renderNode?: (data: GenealogyNodeData) => ReactNode;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

// Função auxiliar para obter coordenadas do handle
const getHandleCoordsByPosition = (node: InternalNode<ReactFlowNode>, handlePosition: Position) => {
  const handleType = handlePosition === Position.Top ? "target" : "source";
  const handle = node.internals.handleBounds?.[handleType]?.find(
    (h) => h.position === handlePosition
  );

  if (!handle) {
    return [0, 0] as const;
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  switch (handlePosition) {
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
  }

  const x = node.internals.positionAbsolute.x + handle.x + offsetX;
  const y = node.internals.positionAbsolute.y + handle.y + offsetY;

  return [x, y] as const;
};

// Edge customizado para conexões verticais (top/bottom)
const VerticalEdge = ({ id, source, target, markerEnd, style }: EdgeProps) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!(sourceNode && targetNode)) {
    return null;
  }

  // Usar Bottom para source e Top para target
  const sourcePos = Position.Bottom;
  const targetPos = Position.Top;

  const [sx, sy] = getHandleCoordsByPosition(sourceNode, sourcePos);
  const [tx, ty] = getHandleCoordsByPosition(targetNode, targetPos);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
      <circle fill="var(--primary)" r="4">
        <animateMotion dur="2s" path={edgePath} repeatCount="indefinite" />
      </circle>
    </>
  );
};

export const GenealogyCanvas = ({
  data,
  initialExpanded = [],
  nodeWidth = 200,
  nodeHeight = 100,
  horizontalSpacing = 250,
  verticalSpacing = 150,
  onNodeSelect,
  onNodeExpand,
  onAddRelation,
  renderNode,
  className,
  ...canvasProps
}: GenealogyCanvasProps) => {
  // Configurar opções do hook
  const hookOptions: UseGenealogyOptions = {
    data,
    initialExpanded,
    nodeWidth,
    nodeHeight,
    horizontalSpacing,
    verticalSpacing,
    onNodeSelect,
    onNodeExpand,
    onAddRelation,
  };

  // Usar hook de genealogia
  const { nodes: genealogyNodes, edges: genealogyEdges } = useGenealogy(hookOptions);

  // Gerenciar estado dos nodes e edges do ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState(
    genealogyNodes.map((node: ReactFlowNode) => ({
      ...node,
      draggable: true as boolean, // Garantir que os nós sejam arrastáveis
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(genealogyEdges);

  // Sincronizar nodes e edges quando o hook atualizar
  useEffect(() => {
    setNodes(
      genealogyNodes.map((node: ReactFlowNode) => ({
        ...node,
        draggable: true, // Garantir que os nós sejam arrastáveis
      }))
    );
  }, [genealogyNodes, setNodes]);

  useEffect(() => {
    setEdges(genealogyEdges);
  }, [genealogyEdges, setEdges]);

  // Definir tipos de nodes customizados
  const nodeTypes = useMemo(
    () => ({
      genealogy: renderNode
        ? ({ data }: { data: GenealogyNodeData }) => <>{renderNode(data)}</>
        : GenealogyNode,
    }),
    [renderNode]
  );

  // Definir tipos de edges customizados
  const edgeTypes = useMemo(
    () => ({
      animated: VerticalEdge,
      temporary: Edge.Temporary,
      dashed: Edge.Temporary, // Usar Temporary para edges tracejados (adoções)
    }),
    []
  );

  return (
    <div className={cn("h-full w-full", className)}>
      <Canvas
        {...canvasProps}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
};
