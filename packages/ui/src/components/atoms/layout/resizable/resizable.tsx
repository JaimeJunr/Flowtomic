/**
 * # Resizable Component
 *
 * O componente `Resizable` é usado para criar painéis redimensionáveis que
 * podem ser ajustados pelo usuário arrastando as bordas. É baseado em
 * react-resizable-panels para funcionalidade completa.
 *
 * ## Características Principais
 *
 * - **Redimensionável**: Painéis podem ser redimensionados arrastando
 * - **Orientação**: Suporta horizontal e vertical
 * - **Handle**: Handle visual para indicar área redimensionável
 * - **Composição**: ResizablePanelGroup + ResizablePanel + ResizableHandle
 *
 * ## Componentes
 *
 * - **ResizablePanelGroup**: Container principal que agrupa painéis
 * - **ResizablePanel**: Painel individual redimensionável
 * - **ResizableHandle**: Handle para redimensionar entre painéis
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@flowtomic/ui/components/atoms/layout/resizable";
 *
 * function MyComponent() {
 *   return (
 *     <ResizablePanelGroup direction="horizontal">
 *       <ResizablePanel defaultSize={50}>Painel 1</ResizablePanel>
 *       <ResizableHandle />
 *       <ResizablePanel defaultSize={50}>Painel 2</ResizablePanel>
 *     </ResizablePanelGroup>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado
 * - Handle acessível com foco
 * - Suporta leitores de tela
 *
 * @see [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) para mais detalhes
 */

import { GripVerticalIcon } from "lucide-react";
import type * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

/**
 * ResizablePanelGroup - Container principal que agrupa painéis redimensionáveis.
 *
 * Componente usado para agrupar múltiplos painéis redimensionáveis.
 *
 * @param {React.ComponentProps<typeof ResizablePrimitive.PanelGroup>} props - Props do componente
 * @returns {JSX.Element} Componente ResizablePanelGroup
 */
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  );
}

/**
 * ResizablePanel - Painel individual redimensionável.
 *
 * Componente usado para representar um painel que pode ser redimensionado.
 *
 * @param {React.ComponentProps<typeof ResizablePrimitive.Panel>} props - Props do componente
 * @returns {JSX.Element} Componente ResizablePanel
 */
function ResizablePanel({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

/**
 * Props do componente ResizableHandle.
 *
 * @property {boolean} [withHandle=false] - Se deve exibir handle visual
 */
interface ResizableHandleProps extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  /** Se deve exibir handle visual */
  withHandle?: boolean;
}

/**
 * ResizableHandle - Handle para redimensionar entre painéis.
 *
 * Componente usado para criar uma área redimensionável entre dois painéis.
 *
 * @param {ResizableHandleProps} props - Props do componente
 * @returns {JSX.Element} Componente ResizableHandle
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
