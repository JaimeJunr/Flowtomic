import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { IridescentFoil } from "./iridescent-foil";

// O React também registra pointermove na raiz do container; só conta o que vai no elemento do fundo.
function pointerMoveCalls(spy: { mock: { calls: unknown[][]; contexts: unknown[] } }): number {
  return spy.mock.calls.filter((call, index) => {
    const target = spy.mock.contexts[index] as HTMLElement;
    return call[0] === "pointermove" && target.dataset?.slot === "iridescent-foil";
  }).length;
}

describe("IridescentFoil (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <IridescentFoil>
        <p>Conteúdo</p>
      </IridescentFoil>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "iridescent-foil");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="iridescent-foil-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="iridescent-foil-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    const style = fallback.getAttribute("style") ?? "";
    for (const token of ["--info", "--primary", "--success", "--background"]) {
      expect(style).toContain(`var(${token})`);
    }
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "iridescent-foil-content"
    );
  });
  it("throws for an invalid tint token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<IridescentFoil tint="primary" />)).toThrow(/"primary"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<IridescentFoil ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("IridescentFoil (ponteiro)", () => {
  it("listens to pointermove by default", () => {
    const spy = vi.spyOn(EventTarget.prototype, "addEventListener");
    try {
      render(<IridescentFoil />);
      expect(pointerMoveCalls(spy)).toBeGreaterThan(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("does not register pointermove with pointer={false}", () => {
    const spy = vi.spyOn(EventTarget.prototype, "addEventListener");
    try {
      render(<IridescentFoil pointer={false} />);
      expect(pointerMoveCalls(spy)).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("does not register pointermove with reduced motion", () => {
    const spy = vi.spyOn(EventTarget.prototype, "addEventListener");
    try {
      render(
        <MotionConfig reducedMotion="always">
          <IridescentFoil />
        </MotionConfig>
      );
      expect(pointerMoveCalls(spy)).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("survives pointer events on the root", () => {
    const { container } = render(<IridescentFoil />);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10, clientY: 10 });
    fireEvent.pointerLeave(root);
    expect(root).toBeInTheDocument();
  });
});

describe("IridescentFoil (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <IridescentFoil tint={"--primary"} />
        </div>
      );
      const root = container.querySelector('[data-slot="iridescent-foil"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--background", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) {
        expect(element).toBeInstanceOf(HTMLElement);
        expect(root.contains(element ?? null)).toBe(true);
      }
    } finally {
      spy.mockRestore();
    }
  });
  it("redraws after rereading colors on a token change while frozen", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<IridescentFoil speed={0} tint={"--primary"} />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<IridescentFoil speed={0} tint={"--success"} />);
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(redraw.mock.invocationCallOrder[0]).toBeGreaterThan(
        Math.max(...readSpy.mock.invocationCallOrder)
      );
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
      document.documentElement.removeAttribute("data-theme");
    }
  });
  it("redraws after rereading colors on a html change while frozen", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<IridescentFoil speed={0} tint={"--primary"} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(redraw.mock.invocationCallOrder[0]).toBeGreaterThan(
        Math.max(...readSpy.mock.invocationCallOrder)
      );
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
      document.documentElement.removeAttribute("data-theme");
    }
  });
});
