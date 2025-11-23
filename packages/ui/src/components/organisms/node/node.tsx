/**
 * Node Component - Flowtomic UI
 *
 * Componente Node para ReactFlow baseado em Card
 */

import { Handle, Position } from "@xyflow/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../atoms";

/**
 * Configuração de handles do Node
 *
 * Suporta dois modos:
 * 1. Modo simples: { target: boolean, source: boolean } - compatibilidade
 * 2. Modo avançado: { top, bottom, left, right } - controle completo
 *
 * @example
 * // Modo simples
 * { target: true, source: true }
 *
 * @example
 * // Modo avançado - todas as direções
 * {
 *   top: { type: "target" },
 *   bottom: { type: "source" },
 *   left: { type: "target" },
 *   right: { type: "source" }
 * }
 */
export type NodeHandlesConfig =
  | {
      // Modo simples (compatibilidade)
      target: boolean;
      source: boolean;
      top?: never;
      bottom?: never;
      left?: never;
      right?: never;
    }
  | {
      // Modo avançado
      target?: never;
      source?: never;
      top?: boolean | { type: "target" | "source" };
      bottom?: boolean | { type: "target" | "source" };
      left?: boolean | { type: "target" | "source" };
      right?: boolean | { type: "target" | "source" };
    };

/**
 * Props do componente Node
 *
 * @property {NodeHandlesConfig} handles - Configuração dos handles de conexão (obrigatório)
 * @property {string} className - Classes CSS adicionais
 * @property {ReactNode} children - Conteúdo do node
 */
export type NodeProps = ComponentProps<typeof Card> & {
  /** Configuração dos handles de conexão */
  handles: NodeHandlesConfig;
};

/**
 * Componente Node para ReactFlow
 *
 * Baseado em Card, suporta conexões em todas as direções (cima, baixo, esquerda, direita).
 *
 * @example
 * ```tsx
 * <Node handles={{ target: true, source: true }}>
 *   <NodeHeader>
 *     <NodeTitle>Título</NodeTitle>
 *   </NodeHeader>
 *   <NodeContent>Conteúdo</NodeContent>
 * </Node>
 * ```
 */
export const Node = ({ handles, className, ...props }: NodeProps) => {
  // Verificar se é modo simples (compatibilidade)
  const isSimpleMode = "target" in handles || "source" in handles;

  return (
    <Card
      className={cn(
        "node-container relative size-full h-auto w-sm gap-0 rounded-md p-0",
        className
      )}
      {...props}
    >
      {isSimpleMode ? (
        // Modo simples: compatibilidade com uso atual
        <>
          {handles.target && <Handle position={Position.Left} type="target" />}
          {handles.source && <Handle position={Position.Right} type="source" />}
        </>
      ) : (
        // Modo avançado: controle completo de todas as direções
        <>
          {handles.top && (
            <Handle
              position={Position.Top}
              type={typeof handles.top === "object" ? handles.top.type : "target"}
            />
          )}
          {handles.bottom && (
            <Handle
              position={Position.Bottom}
              type={typeof handles.bottom === "object" ? handles.bottom.type : "source"}
            />
          )}
          {handles.left && (
            <Handle
              position={Position.Left}
              type={typeof handles.left === "object" ? handles.left.type : "target"}
            />
          )}
          {handles.right && (
            <Handle
              position={Position.Right}
              type={typeof handles.right === "object" ? handles.right.type : "source"}
            />
          )}
        </>
      )}
      {props.children}
    </Card>
  );
};

export type NodeHeaderProps = ComponentProps<typeof CardHeader>;

export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
  <CardHeader
    className={cn("gap-0.5 rounded-t-md border-b bg-secondary p-3!", className)}
    {...props}
  />
);

export type NodeTitleProps = ComponentProps<typeof CardTitle>;

export const NodeTitle = (props: NodeTitleProps) => <CardTitle {...props} />;

export type NodeDescriptionProps = ComponentProps<typeof CardDescription>;

export const NodeDescription = (props: NodeDescriptionProps) => <CardDescription {...props} />;

export type NodeActionProps = ComponentProps<typeof CardAction>;

export const NodeAction = (props: NodeActionProps) => <CardAction {...props} />;

export type NodeContentProps = ComponentProps<typeof CardContent>;

export const NodeContent = ({ className, ...props }: NodeContentProps) => (
  <CardContent className={cn("p-3", className)} {...props} />
);

export type NodeFooterProps = ComponentProps<typeof CardFooter>;

export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
  <CardFooter className={cn("rounded-b-md border-t bg-secondary p-3!", className)} {...props} />
);
