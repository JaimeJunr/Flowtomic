/**
 * Canvas Component - Flowtomic UI
 *
 * Wrapper do ReactFlow do @xyflow/react
 */

import { Background, ReactFlow, type ReactFlowProps } from "@xyflow/react";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";
import { Connection } from "../connection";

export type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
};

export const Canvas = ({ children, connectionLineComponent, ...props }: CanvasProps) => (
  <ReactFlow
    deleteKeyCode={["Backspace", "Delete"]}
    fitView
    panOnDrag={[1, 2]} // Permite pan apenas com botão do meio (1) ou direito (2), deixando botão esquerdo (0) para arrastar nós
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    nodesDraggable={true}
    connectionLineComponent={connectionLineComponent ?? Connection}
    {...props}
  >
    <Background bgColor="var(--sidebar)" />
    {children}
  </ReactFlow>
);
