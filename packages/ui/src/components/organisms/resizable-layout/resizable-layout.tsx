"use client";

import type { ResizableSidebarConfig } from "@flowtomic/logic";
import { useResizable } from "@flowtomic/logic";
import type React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/atoms/layout/resizable";
import { cn } from "@/lib/utils";

export type { ResizableSidebarConfig } from "@flowtomic/logic";

export interface ResizableLayoutProps
  extends ResizableSidebarConfig,
    Pick<React.HTMLAttributes<HTMLDivElement>, "className"> {
  children: React.ReactNode;
  persistKey?: string;
  setSidebarOpen: (open: boolean) => void;
  sidebar: React.ReactNode;
  sidebarOpen: boolean;
  side?: "left" | "right";
  drawerWidthVw?: number;
  resizerThicknessPx?: number;
}

/**
 * ResizableLayout - Componente de apresentação
 *
 * Usa o hook headless useResizable (@flowtomic/logic). Toda a lógica de layout,
 * persistência e estado está no hook; este componente apenas renderiza o markup e estilos.
 */
export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
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

  const ResizableHandleEl = (
    <ResizableHandle
      withHandle
      className={cn(
        "select-none cursor-col-resize z-40 group hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
      )}
      style={{ width: resizerThicknessPx }}
      onMouseDown={resizable.onResizeHandleMouseDown}
      onDoubleClick={resizable.handleDoubleClick}
    />
  );

  if (resizable.shouldUseMobileDrawer) {
    return (
      <div
        ref={resizable.containerRef}
        className={cn("relative flex-1 flex overflow-hidden", className)}
      >
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
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
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={resizable.containerRef}
      className={cn("relative flex-1 flex overflow-hidden", className)}
    >
      <ResizablePanelGroup
        groupRef={
          resizable.groupRef as React.RefObject<
            import("react-resizable-panels").GroupImperativeHandle | null
          >
        }
        orientation="horizontal"
        className="flex h-full w-full"
        id={resizable.autoSaveId}
        defaultLayout={resizable.stableDefaultLayout}
        resizeTargetMinimumSize={{ coarse: 8, fine: 8 }}
        onLayoutChanged={resizable.onLayoutChanged}
      >
        {side === "left" && (
          <>
            <ResizablePanel
              id={resizable.sidebarPanelId}
              panelRef={
                resizable.sidebarPanelRef as unknown as React.RefObject<
                  import("react-resizable-panels").PanelImperativeHandle | null
                >
              }
              defaultSize={`${resizable.sidebarSize}%`}
              minSize={`${resizable.minSize}%`}
              maxSize={`${resizable.maxSize}%`}
              collapsible={true}
              collapsedSize={0}
              className={cn(
                "min-h-full bg-surface dark:bg-gray-800 border-r border-border flex flex-col overflow-y-auto transition-all duration-200"
              )}
            >
              {sidebarOpen && sidebar}
            </ResizablePanel>
            {ResizableHandleEl}
          </>
        )}

        <ResizablePanel
          id={resizable.contentPanelId}
          defaultSize={`${100 - resizable.sidebarSize}%`}
          minSize="10%"
          className="flex-1 flex flex-col overflow-hidden min-w-0"
        >
          {children}
        </ResizablePanel>

        {side === "right" && (
          <>
            {ResizableHandleEl}
            <ResizablePanel
              id={resizable.sidebarPanelId}
              panelRef={
                resizable.sidebarPanelRef as unknown as React.RefObject<
                  import("react-resizable-panels").PanelImperativeHandle | null
                >
              }
              defaultSize={`${resizable.sidebarSize}%`}
              minSize={`${resizable.minSize}%`}
              maxSize={`${resizable.maxSize}%`}
              collapsible={true}
              collapsedSize={0}
              className={cn(
                "min-h-full bg-surface dark:bg-gray-800 border-l border-border flex flex-col overflow-y-auto transition-all duration-200"
              )}
            >
              {sidebarOpen && sidebar}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export const ResizableSplit = ResizableLayout;
export type ResizableSplitProps = ResizableLayoutProps;
