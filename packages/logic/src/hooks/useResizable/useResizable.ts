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
import type { ImperativePanelHandle } from "react-resizable-panels";

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
  sidebarPanelRef: React.RefObject<ImperativePanelHandle>;
  sidebarSize: number;
  minSize: number;
  maxSize: number;
  handleResizeEnd: () => void;
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
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarSize, setSidebarSize] = useState(defaultSidebarPct * 100);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar tamanho persistido
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `resizable-sidebar-${persistKey}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.size === "number" && parsed.size > 0 && parsed.size < 100) {
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

  // Calcular tamanhos
  const minSize = useMemo(() => {
    if (!containerRef.current) return (minPx / 1920) * 100; // Assumir largura padrão
    const containerWidth = containerRef.current.offsetWidth;
    return (minPx / containerWidth) * 100;
  }, [minPx]);

  const maxSize = useMemo(() => {
    if (!containerRef.current) return maxPct * 100;
    const containerWidth = containerRef.current.offsetWidth;
    const maxPx = Math.min(maxPxCap, containerWidth * maxPct);
    return (maxPx / containerWidth) * 100;
  }, [maxPct, maxPxCap]);

  // Handler para toggle do sidebar (double click)
  const handleDoubleClick = useCallback(() => {
    if (sidebarOpen) {
      // Colapsar
      sidebarPanelRef.current?.collapse();
      setSidebarOpen(false);
    } else {
      // Expandir
      sidebarPanelRef.current?.expand();
      setSidebarOpen(true);
    }
  }, [sidebarOpen, setSidebarOpen]);

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
      sidebarPanelRef.current?.resize(targetSize);
    }
  }, [sidebarSize, tinySizePx, snapThreshold, saveSize]);

  const shouldUseMobileDrawer = mobileDrawer && isMobile;
  const autoSaveId = `resizable-${persistKey}`;

  return {
    handleDoubleClick,
    shouldUseMobileDrawer,
    containerRef,
    autoSaveId,
    handleLayout,
    sidebarPanelRef: sidebarPanelRef as React.RefObject<ImperativePanelHandle>,
    sidebarSize,
    minSize,
    maxSize,
    handleResizeEnd,
  };
}
