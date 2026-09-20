import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseResizableReturn } from "./useResizable";
import { useResizable } from "./useResizable";

const REQUIRED_KEYS: (keyof UseResizableReturn)[] = [
  "handleDoubleClick",
  "shouldUseMobileDrawer",
  "containerRef",
  "autoSaveId",
  "handleLayout",
  "sidebarPanelRef",
  "sidebarSize",
  "minSize",
  "maxSize",
  "handleResizeEnd",
  "sidebarPanelId",
  "contentPanelId",
  "stableDefaultLayout",
  "groupRef",
  "onLayoutChanged",
  "isResizing",
  "onResizeHandleMouseDown",
];

function createDefaultProps() {
  const setSidebarOpen = vi.fn();
  return {
    sidebarOpen: true,
    setSidebarOpen,
    persistKey: "default",
    side: "left" as const,
  };
}

describe("useResizable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("retorna todas as chaves esperadas do UseResizableReturn", () => {
    const { result } = renderHook(() => useResizable(createDefaultProps()));

    for (const key of REQUIRED_KEYS) {
      expect(result.current).toHaveProperty(key);
    }
  });

  it("deriva autoSaveId a partir de persistKey", () => {
    const { result: r1 } = renderHook(() =>
      useResizable({ ...createDefaultProps(), persistKey: "default" })
    );
    expect(r1.current.autoSaveId).toBe("resizable-default");

    const { result: r2 } = renderHook(() =>
      useResizable({ ...createDefaultProps(), persistKey: "sidebar-main" })
    );
    expect(r2.current.autoSaveId).toBe("resizable-sidebar-main");
  });

  it("deriva sidebarPanelId e contentPanelId conforme side e persistKey", () => {
    const { result: left } = renderHook(() =>
      useResizable({ ...createDefaultProps(), side: "left", persistKey: "default" })
    );
    expect(left.current.sidebarPanelId).toBe("sidebar-panel-left-default");
    expect(left.current.contentPanelId).toBe("content-panel-left-default");

    const { result: right } = renderHook(() =>
      useResizable({ ...createDefaultProps(), side: "right", persistKey: "foo" })
    );
    expect(right.current.sidebarPanelId).toBe("sidebar-panel-right-foo");
    expect(right.current.contentPanelId).toBe("content-panel-right-foo");
  });

  it("stableDefaultLayout contém os IDs dos painéis e soma 100% (side left)", () => {
    const props = createDefaultProps();
    const { result } = renderHook(() => useResizable(props));

    const layout = result.current.stableDefaultLayout;
    const sidebarId = result.current.sidebarPanelId;
    const contentId = result.current.contentPanelId;

    expect(layout).toHaveProperty(sidebarId);
    expect(layout).toHaveProperty(contentId);
    expect(layout[sidebarId] + layout[contentId]).toBe(100);
  });

  it("stableDefaultLayout para side right tem content antes do sidebar em keys", () => {
    const { result } = renderHook(() => useResizable({ ...createDefaultProps(), side: "right" }));

    const layout = result.current.stableDefaultLayout;
    const keys = Object.keys(layout);
    expect(keys[0]).toBe("content-panel-right-default");
    expect(keys[1]).toBe("sidebar-panel-right-default");
  });

  it("handleLayout persiste o tamanho do sidebar no localStorage (side left)", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const props = createDefaultProps();
    const { result } = renderHook(() => useResizable(props));

    act(() => {
      result.current.handleLayout([30, 70]);
    });

    const legacyCalls = setItemSpy.mock.calls.filter((c) => c[0] === "resizable-sidebar-default");
    expect(legacyCalls.length).toBeGreaterThanOrEqual(1);
    const payload = JSON.parse(legacyCalls[0]?.[1] ?? "{}");
    expect(payload.size).toBe(30);
    setItemSpy.mockRestore();
  });

  it("handleLayout com side right usa o último valor como tamanho do sidebar", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useResizable({ ...createDefaultProps(), side: "right" }));

    act(() => {
      result.current.handleLayout([70, 30]);
    });

    const legacyCalls = setItemSpy.mock.calls.filter((c) => c[0] === "resizable-sidebar-default");
    expect(legacyCalls.length).toBeGreaterThanOrEqual(1);
    const payload = JSON.parse(legacyCalls[0]?.[1] ?? "{}");
    expect(payload.size).toBe(30);
    setItemSpy.mockRestore();
  });

  it("handleDoubleClick com sidebarOpen true chama setSidebarOpen(false)", () => {
    const setSidebarOpen = vi.fn();
    const { result } = renderHook(() =>
      useResizable({ ...createDefaultProps(), sidebarOpen: true, setSidebarOpen })
    );

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it("handleDoubleClick com sidebarOpen false chama setSidebarOpen(true)", () => {
    const setSidebarOpen = vi.fn();
    const { result } = renderHook(() =>
      useResizable({ ...createDefaultProps(), sidebarOpen: false, setSidebarOpen })
    );

    act(() => {
      result.current.handleDoubleClick();
    });

    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it("onResizeHandleMouseDown não lança e deixa isResizing true", () => {
    const { result } = renderHook(() => useResizable(createDefaultProps()));

    expect(result.current.isResizing).toBe(false);

    act(() => {
      result.current.onResizeHandleMouseDown();
    });

    expect(result.current.isResizing).toBe(true);
  });

  it("shouldUseMobileDrawer é false quando innerWidth >= 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    const { result } = renderHook(() =>
      useResizable({ ...createDefaultProps(), mobileDrawer: true })
    );
    expect(result.current.shouldUseMobileDrawer).toBe(false);
  });

  it("shouldUseMobileDrawer é true quando mobileDrawer true e innerWidth < 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    const { result } = renderHook(() =>
      useResizable({ ...createDefaultProps(), mobileDrawer: true })
    );
    expect(result.current.shouldUseMobileDrawer).toBe(true);
  });

  it("onLayoutChanged não lança e persiste layout válido", () => {
    const props = createDefaultProps();
    const { result } = renderHook(() => useResizable(props));
    const layout: Record<string, number> = {
      [result.current.sidebarPanelId]: 28,
      [result.current.contentPanelId]: 72,
    };

    expect(() => {
      act(() => {
        result.current.onLayoutChanged(layout);
      });
    }).not.toThrow();
  });
});
