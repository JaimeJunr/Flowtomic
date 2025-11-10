"use client";

import { GripVertical } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import { useResizable } from "@flowtomic/logic";
import { cn } from "@/lib/utils";

export interface ResizableProps {
  sidebar: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right";
  persistKey?: string;
  defaultSidebarPct?: number;
  minPx?: number;
  maxPct?: number;
  maxPxCap?: number;
  resizerThicknessPx?: number;
  mobileDrawer?: boolean;
  drawerWidthVw?: number;
  className?: string;
  tinySizePx?: number; // Tamanho do modo tiny (só ícones)
  snapThreshold?: number; // Distância máxima para fazer snap
}

/**
 * Resizable - Componente Visual
 *
 * Componente de apresentação que usa o hook headless useResizable.
 * Responsável apenas por renderizar o markup e aplicar estilos.
 */
export const Resizable: React.FC<ResizableProps> = ({
  sidebar,
  sidebarOpen,
  setSidebarOpen,
  children,
  side = "left",
  persistKey = "default",
  defaultSidebarPct = 0.28,
  minPx = 250,
  maxPct = 0.6,
  maxPxCap = 500,
  resizerThicknessPx = 8,
  mobileDrawer = true,
  drawerWidthVw = 90,
  className,
  tinySizePx,
  snapThreshold,
}) => {
  // Hook headless com toda a lógica
  const resizable = useResizable({
    sidebarOpen,
    setSidebarOpen,
    side,
    persistKey,
    defaultSidebarPct,
    minPx,
    maxPct,
    maxPxCap,
    mobileDrawer,
    tinySizePx,
    snapThreshold,
  });

  // Estado para detectar quando está redimensionando
  const [isResizing, setIsResizing] = useState(false);

  // Handler para detectar quando o resize termina e aplicar snap
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseUp = () => {
      setIsResizing(false);
      // Pequeno delay para garantir que o layout foi atualizado
      setTimeout(() => {
        resizable.handleResizeEnd();
      }, 50);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizable]);

  // Componente ResizableHandle customizado
  const ResizableHandle = (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 select-none cursor-col-resize z-40 group hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
      )}
      style={{ width: resizerThicknessPx }}
      onMouseDown={() => setIsResizing(true)}
    >
      {/* Área de clique expandida */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Área invisível de clique expandida para melhor UX no resize */}
      <div
        className="absolute inset-y-0 -left-3 -right-3 cursor-col-resize"
        onDoubleClick={resizable.handleDoubleClick}
      />
      {/* Handle visual com ícone GripVertical */}
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    </ResizablePrimitive.PanelResizeHandle>
  );

  // Renderização mobile (drawer)
  if (resizable.shouldUseMobileDrawer) {
    return (
      <div
        ref={resizable.containerRef}
        className={cn("relative flex-1 flex overflow-hidden", className)}
      >
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <div
          className={cn(
            "fixed top-16 bottom-0 z-50 bg-surface dark:bg-gray-800 transform transition-transform duration-200 border-r border-border",
            side === "right" ? "right-0" : "left-0"
          )}
          style={{
            width: `${drawerWidthVw}vw`,
            transform: sidebarOpen
              ? "translateX(0)"
              : side === "right"
                ? "translateX(100%)"
                : "translateX(-100%)",
          }}
        >
          {sidebar}
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    );
  }

  // Renderização desktop (sidebar fixa com react-resizable-panels)
  return (
    <div
      ref={resizable.containerRef}
      className={cn("relative flex-1 flex overflow-hidden", className)}
    >
      <ResizablePrimitive.PanelGroup
        direction="horizontal"
        className="flex h-full w-full"
        autoSaveId={resizable.autoSaveId}
        onLayout={resizable.handleLayout}
      >
        {side === "left" && (
          <>
            <ResizablePrimitive.Panel
              id={`sidebar-panel-${side}-${persistKey}`}
              ref={resizable.sidebarPanelRef}
              defaultSize={resizable.sidebarSize}
              minSize={resizable.minSize}
              maxSize={resizable.maxSize}
              collapsible={true}
              collapsedSize={0}
              className={cn(
                "min-h-full bg-surface dark:bg-gray-800 border-r border-border flex flex-col overflow-y-auto transition-all duration-200"
              )}
            >
              {sidebarOpen && sidebar}
            </ResizablePrimitive.Panel>
            {ResizableHandle}
          </>
        )}

        <ResizablePrimitive.Panel
          id={`content-panel-${side}-${persistKey}`}
          defaultSize={100 - resizable.sidebarSize}
          minSize={10}
          className="flex-1 flex flex-col overflow-hidden min-w-0"
        >
          {children}
        </ResizablePrimitive.Panel>

        {side === "right" && (
          <>
            {ResizableHandle}
            <ResizablePrimitive.Panel
              id={`sidebar-panel-${side}-${persistKey}`}
              ref={resizable.sidebarPanelRef}
              defaultSize={resizable.sidebarSize}
              minSize={resizable.minSize}
              maxSize={resizable.maxSize}
              collapsible={true}
              collapsedSize={0}
              className={cn(
                "min-h-full bg-surface dark:bg-gray-800 border-l border-border flex flex-col overflow-y-auto transition-all duration-200"
              )}
            >
              {sidebarOpen && sidebar}
            </ResizablePrimitive.Panel>
          </>
        )}
      </ResizablePrimitive.PanelGroup>
    </div>
  );
};

// Alias para compatibilidade com código existente
export const ResizableSplit = Resizable;
export type ResizableSplitProps = ResizableProps;
