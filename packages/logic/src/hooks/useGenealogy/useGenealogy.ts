/**
 * useGenealogy - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API para árvores genealógicas
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 */

import { useCallback, useMemo, useState } from "react";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";

/**
 * Tipos de relacionamento
 */
export type RelationshipType = "mother" | "father" | "child";

/**
 * Dados de uma entidade na árvore genealógica (pessoa, animal, ninhada, etc.)
 */
export interface EntityData {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  gender?: "male" | "female" | "other";
  image?: string; // URL ou base64 da imagem
  photo?: string; // Alias para image
  [key: string]: unknown; // Permite campos customizados (ex: species, breed, etc.)
}

/**
 * Relacionamento entre entidades
 */
export interface Relationship {
  from: string; // ID da entidade origem
  to: string; // ID da entidade destino
  type: RelationshipType;
  metadata?: Record<string, unknown>; // Dados adicionais sobre o relacionamento
}

/**
 * Estrutura de dados de entrada para a árvore genealógica
 */
export interface GenealogyData {
  people: EntityData[]; // Pode conter pessoas, animais, ninhadas, etc.
  relationships: Relationship[];
}

/**
 * Estrutura interna hierárquica de uma entidade
 */
export interface EntityHierarchy {
  person: EntityData; // Entidade principal
  parents: EntityData[];
  mother?: EntityData;
  father?: EntityData;
  children: EntityData[];
  spouse?: EntityData;
  adoptions: EntityData[]; // Filhos adotados
  siblings: EntityData[];
}

/**
 * Estado de expansão de um nó
 */
export interface NodeExpansionState {
  [nodeId: string]: boolean;
}

/**
 * Opções do hook useGenealogy
 */
export interface UseGenealogyOptions {
  data: GenealogyData;
  initialExpanded?: string[]; // IDs de nós inicialmente expandidos
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  onNodeSelect?: (nodeId: string, entity: EntityData) => void;
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;
  onAddRelation?: (fromId: string, toId: string, type: RelationshipType) => void;
}

/**
 * Retorno do hook useGenealogy
 */
export interface UseGenealogyReturn {
  // Dados processados
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  hierarchy: Map<string, EntityHierarchy>;
  
  // Estado
  selectedNodeId: string | null;
  expansionState: NodeExpansionState;
  
  // Funções de interação
  selectNode: (nodeId: string) => void;
  expandNode: (nodeId: string, expanded?: boolean) => void;
  collapseNode: (nodeId: string) => void;
  addRelation: (fromId: string, toId: string, type: RelationshipType) => void;
  getPersonHierarchy: (entityId: string) => EntityHierarchy | undefined;
  getPersonRelations: (entityId: string) => Relationship[];
}

/**
 * Calcula o nível (geração) de cada entidade na hierarquia
 * Retorna um Map com entityId -> nível (0 = raiz, 1 = filhos da raiz, etc)
 */
function calculateLevels(
  hierarchy: Map<string, EntityHierarchy>
): Map<string, number> {
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  // Função recursiva para calcular nível
  const calculateLevel = (entityId: string): number => {
    if (levels.has(entityId)) {
      return levels.get(entityId)!;
    }

    if (visited.has(entityId)) {
      // Ciclo detectado, retornar 0 como fallback
      return 0;
    }

    visited.add(entityId);
    const entityHierarchy = hierarchy.get(entityId);

    if (!entityHierarchy || entityHierarchy.parents.length === 0) {
      // Sem pais = raiz (nível 0)
      levels.set(entityId, 0);
      return 0;
    }

    // Nível = nível do pai mais alto + 1
    const parentLevels = entityHierarchy.parents.map((parent) => calculateLevel(parent.id));
    const maxParentLevel = Math.max(...parentLevels);
    const level = maxParentLevel + 1;
    levels.set(entityId, level);
    return level;
  };

  // Calcular nível para todas as entidades
  hierarchy.forEach((_, entityId) => {
    calculateLevel(entityId);
  });

  return levels;
}

/**
 * Organiza entidades por nível (geração) e calcula posições hierárquicas
 */
function calculateHierarchicalPositions(
  data: GenealogyData,
  hierarchy: Map<string, EntityHierarchy>,
  nodeWidth: number,
  nodeHeight: number,
  horizontalSpacing: number,
  verticalSpacing: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const levels = calculateLevels(hierarchy);

  // Agrupar entidades por nível
  const entitiesByLevel = new Map<number, string[]>();
  levels.forEach((level, entityId) => {
    if (!entitiesByLevel.has(level)) {
      entitiesByLevel.set(level, []);
    }
    entitiesByLevel.get(level)!.push(entityId);
  });

  // Calcular posições para cada nível, começando do nível 0 (raiz)
  const sortedLevels = Array.from(entitiesByLevel.keys()).sort((a, b) => a - b);
  
  sortedLevels.forEach((level) => {
    const entityIds = entitiesByLevel.get(level)!;
    
    // Ordenar entidades do mesmo nível (por ID para consistência)
    entityIds.sort();

    // Calcular posição Y baseada no nível (pais acima, filhos abaixo)
    const y = level * (nodeHeight + verticalSpacing);

    // Para cada entidade, tentar centralizar abaixo dos pais
    entityIds.forEach((entityId) => {
      const entityHierarchy = hierarchy.get(entityId);
      let x = 0;

      if (entityHierarchy && entityHierarchy.parents.length > 0) {
        // Calcular posição média dos pais
        const parentPositions = entityHierarchy.parents
          .map((parent) => positions.get(parent.id))
          .filter((pos): pos is { x: number; y: number } => pos !== undefined);
        
        if (parentPositions.length > 0) {
          const avgX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
          x = avgX;
        }
      }

      // Se não tem pais ou não conseguiu calcular, distribuir horizontalmente
      if (x === 0 && entityIds.length > 1) {
        const index = entityIds.indexOf(entityId);
        const totalWidth = entityIds.length * nodeWidth + (entityIds.length - 1) * horizontalSpacing;
        const startX = -totalWidth / 2 + nodeWidth / 2;
        x = startX + index * (nodeWidth + horizontalSpacing);
      }

      positions.set(entityId, { x, y });
    });

    // Ajustar posições para evitar sobreposição
    entityIds.forEach((entityId, index) => {
      const currentPos = positions.get(entityId)!;
      const minX = currentPos.x;
      
      // Verificar se há sobreposição com outros nós do mesmo nível
      entityIds.slice(0, index).forEach((otherId) => {
        const otherPos = positions.get(otherId)!;
        if (Math.abs(currentPos.x - otherPos.x) < nodeWidth + horizontalSpacing) {
          // Ajustar para evitar sobreposição
          currentPos.x = otherPos.x + nodeWidth + horizontalSpacing;
        }
      });
    });
  });

  return positions;
}

/**
 * Gera nodes do ReactFlow a partir dos dados de genealogia
 */
function generateNodes(
  data: GenealogyData,
  hierarchy: Map<string, EntityHierarchy>,
  expansionState: NodeExpansionState,
  nodeWidth: number,
  nodeHeight: number,
  horizontalSpacing: number,
  verticalSpacing: number
): ReactFlowNode[] {
  const nodes: ReactFlowNode[] = [];

  // Calcular posições hierárquicas
  const positions = calculateHierarchicalPositions(
    data,
    hierarchy,
    nodeWidth,
    nodeHeight,
    horizontalSpacing,
    verticalSpacing
  );

  // Criar nodes com posições calculadas
  data.people.forEach((entity) => {
    const position = positions.get(entity.id) || { x: 0, y: 0 };
    const entityHierarchy = hierarchy.get(entity.id);

    nodes.push({
      id: entity.id,
      type: "genealogy",
      position,
      data: {
        person: entity,
        hierarchy: entityHierarchy,
        isExpanded: expansionState[entity.id] ?? false,
      },
    });
  });

  return nodes;
}

/**
 * Gera edges do ReactFlow a partir dos relacionamentos
 * Para hierarquia vertical: source (pai) -> target (filho)
 */
function generateEdges(
  data: GenealogyData,
  hierarchy: Map<string, EntityHierarchy>,
  expansionState: NodeExpansionState
): ReactFlowEdge[] {
  const edges: ReactFlowEdge[] = [];
  const edgeIds = new Set<string>();

  data.relationships.forEach((relationship) => {
    // Determinar source e target baseado no tipo de relacionamento
    let source: string;
    let target: string;

    switch (relationship.type) {
      case "father":
      case "mother": {
        // from é pai/mãe de to
        // source = pai (from), target = filho (to)
        source = relationship.from;
        target = relationship.to;
        break;
      }
      case "child": {
        // from é filho de to
        // source = pai (to), target = filho (from)
        source = relationship.to;
        target = relationship.from;
        break;
      }
      default: {
        source = relationship.from;
        target = relationship.to;
      }
    }

    // Criar edge ID único
    const edgeId = `e-${source}-${target}-${relationship.type}`;
    
    // Evitar duplicatas
    if (edgeIds.has(edgeId)) {
      return;
    }
    edgeIds.add(edgeId);

    // Verificar se ambos os nós existem
    const sourceHierarchy = hierarchy.get(source);
    const targetHierarchy = hierarchy.get(target);
    
    if (!sourceHierarchy || !targetHierarchy) {
      return;
    }

    // Só criar edge se ambos os nós estiverem visíveis (expandidos ou raiz)
    const sourceExpanded = expansionState[source] ?? true;
    const targetExpanded = expansionState[target] ?? true;

    // Para relacionamentos pai/filho, só mostrar se o nó pai estiver expandido
    if (relationship.type === "father" || relationship.type === "mother" || relationship.type === "child") {
      if (!sourceExpanded || !targetExpanded) return;
    }

    edges.push({
      id: edgeId,
      source,
      target,
      type: "animated",
      data: {
        relationship,
      },
    });
  });

  return edges;
}

/**
 * Constrói hierarquia de entidades a partir dos dados
 */
function buildHierarchy(data: GenealogyData): Map<string, EntityHierarchy> {
  const hierarchy = new Map<string, EntityHierarchy>();

  // Inicializar todas as entidades
  data.people.forEach((entity) => {
    hierarchy.set(entity.id, {
      person: entity,
      parents: [],
      children: [],
      adoptions: [],
      siblings: [],
    });
  });

  // Processar relacionamentos
  data.relationships.forEach((relationship) => {
    const fromHierarchy = hierarchy.get(relationship.from);
    const toHierarchy = hierarchy.get(relationship.to);

    if (!fromHierarchy || !toHierarchy) return;

    switch (relationship.type) {
      case "father":
      case "mother": {
        // from é pai/mãe de to
        if (!toHierarchy.parents.find((p) => p.id === relationship.from)) {
          toHierarchy.parents.push(fromHierarchy.person);
        }
        if (relationship.type === "father") {
          toHierarchy.father = fromHierarchy.person;
        } else if (relationship.type === "mother") {
          toHierarchy.mother = fromHierarchy.person;
        }
        if (!fromHierarchy.children.find((c) => c.id === relationship.to)) {
          fromHierarchy.children.push(toHierarchy.person);
        }
        break;
      }
      case "child": {
        // from é filho de to
        if (!toHierarchy.children.find((c) => c.id === relationship.from)) {
          toHierarchy.children.push(fromHierarchy.person);
        }
        if (!fromHierarchy.parents.find((p) => p.id === relationship.to)) {
          fromHierarchy.parents.push(toHierarchy.person);
        }
        break;
      }
    }
  });

  // Calcular irmãos (pessoas com os mesmos pais)
  hierarchy.forEach((personHierarchy) => {
    if (personHierarchy.parents.length > 0) {
      const parentIds = personHierarchy.parents.map((p) => p.id);
      hierarchy.forEach((otherHierarchy, otherId) => {
        if (otherId !== personHierarchy.person.id) {
          const hasCommonParent = otherHierarchy.parents.some((p) => parentIds.includes(p.id));
          if (hasCommonParent && !personHierarchy.siblings.find((s) => s.id === otherId)) {
            personHierarchy.siblings.push(otherHierarchy.person);
          }
        }
      });
    }
  });

  return hierarchy;
}

/**
 * Hook headless para gerenciar árvores genealógicas
 */
export function useGenealogy({
  data,
  initialExpanded = [],
  nodeWidth = 200,
  nodeHeight = 100,
  horizontalSpacing = 250,
  verticalSpacing = 150,
  onNodeSelect,
  onNodeExpand,
  onAddRelation,
}: UseGenealogyOptions): UseGenealogyReturn {
  // Estado de expansão dos nós
  const [expansionState, setExpansionState] = useState<NodeExpansionState>(() => {
    const state: NodeExpansionState = {};
    initialExpanded.forEach((id) => {
      state[id] = true;
    });
    return state;
  });

  // Estado de seleção
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Construir hierarquia
  const hierarchy = useMemo(() => buildHierarchy(data), [data]);

  // Gerar nodes e edges
  const nodes = useMemo(
    () =>
      generateNodes(data, hierarchy, expansionState, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing),
    [data, hierarchy, expansionState, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing]
  );

  const edges = useMemo(() => generateEdges(data, hierarchy, expansionState), [data, hierarchy, expansionState]);

  // Função para selecionar um nó
  const selectNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const entity = data.people.find((p) => p.id === nodeId);
      if (entity && onNodeSelect) {
        onNodeSelect(nodeId, entity);
      }
    },
    [data.people, onNodeSelect]
  );

  // Função para expandir/colapsar um nó
  const expandNode = useCallback(
    (nodeId: string, expanded?: boolean) => {
      setExpansionState((prev) => {
        const newState = { ...prev };
        const isCurrentlyExpanded = prev[nodeId] ?? false;
        newState[nodeId] = expanded ?? !isCurrentlyExpanded;

        if (onNodeExpand) {
          onNodeExpand(nodeId, newState[nodeId]);
        }

        return newState;
      });
    },
    [onNodeExpand]
  );

  // Função para colapsar um nó
  const collapseNode = useCallback(
    (nodeId: string) => {
      expandNode(nodeId, false);
    },
    [expandNode]
  );

  // Função para adicionar relacionamento
  const addRelation = useCallback(
    (fromId: string, toId: string, type: RelationshipType) => {
      if (onAddRelation) {
        onAddRelation(fromId, toId, type);
      }
    },
    [onAddRelation]
  );

  // Função para obter hierarquia de uma pessoa
  const getPersonHierarchy = useCallback(
    (personId: string) => {
      return hierarchy.get(personId);
    },
    [hierarchy]
  );

  // Função para obter relacionamentos de uma pessoa
  const getPersonRelations = useCallback(
    (personId: string) => {
      return data.relationships.filter((r) => r.from === personId || r.to === personId);
    },
    [data.relationships]
  );

  return {
    nodes,
    edges,
    hierarchy,
    selectedNodeId,
    expansionState,
    selectNode,
    expandNode,
    collapseNode,
    addRelation,
    getPersonHierarchy,
    getPersonRelations,
  };
}

