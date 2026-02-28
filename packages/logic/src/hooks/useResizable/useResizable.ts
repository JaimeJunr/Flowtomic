/**
 * useResizable - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API para componentes resizable
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 */

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GroupImperativeHandle, PanelImperativeHandle } from "react-resizable-panels";
import { useDefaultLayout } from "react-resizable-panels";

const MIN_VALID_SIDEBAR_PCT = 5;
const REVERT_DEBOUNCE_MS = 150;

export interface UseResizableOptions {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  side?: "left" | "right";
  persistKey?: string;
  defaultSidebarPct?: number;
  minPx?: number;
  maxPct?: number;
  maxPxCap?: number;
  mobileDrawer?: boolean;
  tinySizePx?: number;
  snapThreshold?: number;
}

export interface UseResizableReturn {
  handleDoubleClick: () => void;
  shouldUseMobileDrawer: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  autoSaveId: string;
  handleLayout: (sizes: number[]) => void;
  sidebarPanelRef: React.RefObject<PanelImperativeHandle>;
  sidebarSize: number;
  minSize: number;
  maxSize: number;
  handleResizeEnd: () => void;
  /** IDs para painéis (sidebar e content) usados pelo Group */
  sidebarPanelId: string;
  contentPanelId: string;
  /** Layout inicial estável (não muda após mount) para o Group */
  stableDefaultLayout: Record<string, number>;
  /** Ref a ser passada ao ResizablePanelGroup */
  groupRef: React.RefObject<GroupImperativeHandle | null>;
  /** Handler para onLayoutChanged do ResizablePanelGroup */
  onLayoutChanged: (layout: Record<string, number>) => void;
  /** Indica se o usuário está arrastando o resize handle */
  isResizing: boolean;
  /** Deve ser chamado no onMouseDown do resize handle */
  onResizeHandleMouseDown: () => void;
}

const MOBILE_BREAKPOINT = 768;

export function useResizable({
  sidebarOpen,
  setSidebarOpen,
  side = "left",
  persistKey = "default",
  defaultSidebarPct = 0.28,
  minPx = 250,
  maxPct = 0.6,
  maxPxCap = 500,
  mobileDrawer = true,
  tinySizePx,
  snapThreshold = 50,
}: UseResizableOptions): UseResizableReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarPanelRef = useRef<PanelImperativeHandle>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarSize, setSidebarSize] = useState(defaultSidebarPct * 100);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Observar largura do container para recalcular min/max (ref não dispara re-render)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Carregar tamanho persistido
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `resizable-sidebar-${persistKey}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.size === "number" && parsed.size >= 5 && parsed.size < 100) {
          setSidebarSize(parsed.size);
        }
      } catch {
        // Ignorar erros de parsing
      }
    }
  }, [persistKey]);

  // Salvar tamanho no localStorage
  const saveSize = useCallback(
    (size: number) => {
      if (typeof window === "undefined") return;

      const storageKey = `resizable-sidebar-${persistKey}`;
      localStorage.setItem(storageKey, JSON.stringify({ size, timestamp: Date.now() }));
    },
    [persistKey]
  );

  // Calcular tamanhos (usa containerWidth do ResizeObserver para atualizar quando container monta)
  const minSize = useMemo(() => {
    const w = containerWidth ?? 1920;
    return (minPx / w) * 100;
  }, [minPx, containerWidth]);

  const maxSize = useMemo(() => {
    const w = containerWidth ?? 1920;
    const maxPx = Math.min(maxPxCap, w * maxPct);
    return (maxPx / w) * 100;
  }, [maxPct, maxPxCap, containerWidth]);

  // Handler para toggle do sidebar (double click)
  const handleDoubleClick = useCallback(() => {
    if (sidebarOpen) {
      // Colapsar
      sidebarPanelRef.current?.collapse();
      setSidebarOpen(false);
    } else {
      // Expandir: restaurar tamanho padrão (evita library reportar valor bogus em onLayoutChanged)
      const defaultSize = defaultSidebarPct * 100;
      setSidebarSize(defaultSize);
      saveSize(defaultSize);
      sidebarPanelRef.current?.expand();
      // v4 interprets number as px; pass "N%" for percentage (logic uses v3 types but UI uses v4 at runtime)
      (sidebarPanelRef.current as { resize(s: number | string): void } | null)?.resize(
        `${defaultSize}%`
      );
      setSidebarOpen(true);
    }
  }, [sidebarOpen, setSidebarOpen, defaultSidebarPct, saveSize]);

  // Handler para mudanças de layout
  const handleLayout = useCallback(
    (sizes: number[]) => {
      if (sizes.length > 0) {
        const newSize = side === "left" ? sizes[0] : sizes[sizes.length - 1];
        setSidebarSize(newSize);
        saveSize(newSize);
      }
    },
    [side, saveSize]
  );

  // Handler para fim do resize (snap automático)
  const handleResizeEnd = useCallback(() => {
    if (!tinySizePx || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const currentSizePx = (sidebarSize / 100) * containerWidth;
    const tinySizePercent = (tinySizePx / containerWidth) * 100;

    // Verificar se está próximo do tamanho tiny
    if (
      Math.abs(currentSizePx - tinySizePx) <= snapThreshold &&
      currentSizePx < tinySizePx + snapThreshold
    ) {
      // Snap para tiny
      const targetSize = tinySizePercent;
      setSidebarSize(targetSize);
      saveSize(targetSize);
      (sidebarPanelRef.current as { resize(s: number | string): void } | null)?.resize(
        `${targetSize}%`
      );
    }
  }, [sidebarSize, tinySizePx, snapThreshold, saveSize]);

  const shouldUseMobileDrawer = mobileDrawer && isMobile;
  const autoSaveId = `resizable-${persistKey}`;
  const sidebarPanelId = `sidebar-panel-${side}-${persistKey}`;
  const contentPanelId = `content-panel-${side}-${persistKey}`;

  const layoutStorage = useMemo(() => {
    const key = `react-resizable-panels:${autoSaveId}`;
    return {
      getItem: () => {
        try {
          let raw = localStorage.getItem(key);
          if (!raw) {
            const oldKey = `resizable-sidebar-${persistKey}`;
            const old = localStorage.getItem(oldKey);
            if (old) {
              const parsed = JSON.parse(old) as { size?: number };
              if (typeof parsed.size === "number" && parsed.size >= 5 && parsed.size < 100) {
                const layout =
                  side === "left"
                    ? {
                        [sidebarPanelId]: parsed.size,
                        [contentPanelId]: 100 - parsed.size,
                      }
                    : {
                        [contentPanelId]: 100 - parsed.size,
                        [sidebarPanelId]: parsed.size,
                      };
                raw = JSON.stringify(layout);
                localStorage.setItem(key, raw);
              }
            }
          }
          if (!raw) return null;
          const layout = JSON.parse(raw) as Record<string, number>;
          const pct = layout[sidebarPanelId] ?? 0;
          if (pct > 0 && pct < MIN_VALID_SIDEBAR_PCT) return null;
          return raw;
        } catch {
          return null;
        }
      },
      setItem: (_k: string, value: string) => {
        try {
          const layout = JSON.parse(value) as Record<string, number>;
          const pct = layout[sidebarPanelId] ?? 0;
          if (pct > 0 && pct < MIN_VALID_SIDEBAR_PCT) return;
          localStorage.setItem(key, value);
          if (pct != null) {
            localStorage.setItem(
              `resizable-sidebar-${persistKey}`,
              JSON.stringify({ size: pct, timestamp: Date.now() })
            );
          }
        } catch {
          // ignore
        }
      },
    };
  }, [autoSaveId, sidebarPanelId, contentPanelId, side, persistKey]);

  const { defaultLayout: storedLayout, onLayoutChanged: persistLayout } = useDefaultLayout({
    id: autoSaveId,
    storage: layoutStorage,
  });

  const computedDefaultLayout =
    side === "left"
      ? {
          [sidebarPanelId]: sidebarSize,
          [contentPanelId]: 100 - sidebarSize,
        }
      : {
          [contentPanelId]: 100 - sidebarSize,
          [sidebarPanelId]: sidebarSize,
        };

  const effectiveDefaultLayout =
    sidebarOpen && (storedLayout?.[sidebarPanelId] ?? 0) === 0
      ? computedDefaultLayout
      : (storedLayout ?? computedDefaultLayout);

  const initialDefaultLayoutRef = useRef<Record<string, number> | null>(null);
  if (initialDefaultLayoutRef.current === null) {
    initialDefaultLayoutRef.current = effectiveDefaultLayout;
  }
  const stableDefaultLayout = initialDefaultLayoutRef.current;
  const layoutRef = useRef(stableDefaultLayout);
  layoutRef.current = stableDefaultLayout;
  const groupRef = useRef<GroupImperativeHandle | null>(null);
  const hasAppliedInitialLayoutRef = useRef(false);
  const lastLayoutTimeRef = useRef(0);
  const lastLayoutSidebarRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldUseMobileDrawer) return;
    if (hasAppliedInitialLayoutRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (hasAppliedInitialLayoutRef.current) return;
      hasAppliedInitialLayoutRef.current = true;
      const grp = groupRef.current;
      const layoutToApply = layoutRef.current;
      if (grp) grp.setLayout(layoutToApply);
    });
    return () => cancelAnimationFrame(raf);
  }, [shouldUseMobileDrawer]);

  const onLayoutChanged = useCallback(
    (layout: Record<string, number>) => {
      const layoutSidebar = layout[sidebarPanelId] ?? 0;
      const panel = sidebarPanelRef.current;
      const raw = typeof panel?.getSize === "function" ? panel.getSize() : undefined;
      const sizeFromRef =
        typeof raw === "number"
          ? raw
          : raw && typeof (raw as { asPercentage?: number }).asPercentage === "number"
            ? (raw as { asPercentage: number }).asPercentage
            : undefined;
      const validFromLayout = layoutSidebar >= 0 && layoutSidebar <= 100 ? layoutSidebar : null;
      const validFromRef =
        sizeFromRef != null && sizeFromRef >= 0 && sizeFromRef <= 100 ? sizeFromRef : null;
      const sidebarPct = validFromLayout ?? validFromRef ?? layoutSidebar;

      const now = Date.now();
      const isRevertToStable =
        Math.abs(layoutSidebar - stableDefaultLayout[sidebarPanelId]) < 0.01 &&
        lastLayoutSidebarRef.current != null &&
        Math.abs(lastLayoutSidebarRef.current - stableDefaultLayout[sidebarPanelId]) > 0.01 &&
        now - lastLayoutTimeRef.current < REVERT_DEBOUNCE_MS;
      lastLayoutSidebarRef.current = layoutSidebar;
      lastLayoutTimeRef.current = now;

      if (isRevertToStable) return;
      if (sidebarPct > 0 && sidebarPct < MIN_VALID_SIDEBAR_PCT) return;
      const contentPct = 100 - sidebarPct;
      const sizes = side === "left" ? [sidebarPct, contentPct] : [contentPct, sidebarPct];
      handleLayout(sizes);
      persistLayout(layout);
    },
    [sidebarPanelId, side, stableDefaultLayout, handleLayout, persistLayout]
  );

  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseUp = () => {
      setIsResizing(false);
      setTimeout(() => {
        handleResizeEnd();
      }, 50);
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [isResizing, handleResizeEnd]);

  const onResizeHandleMouseDown = useCallback(() => setIsResizing(true), []);

  return {
    handleDoubleClick,
    shouldUseMobileDrawer,
    containerRef,
    autoSaveId,
    handleLayout,
    sidebarPanelRef: sidebarPanelRef as React.RefObject<PanelImperativeHandle>,
    sidebarSize,
    minSize,
    maxSize,
    handleResizeEnd,
    sidebarPanelId,
    contentPanelId,
    stableDefaultLayout,
    groupRef,
    onLayoutChanged,
    isResizing,
    onResizeHandleMouseDown,
  };
}
