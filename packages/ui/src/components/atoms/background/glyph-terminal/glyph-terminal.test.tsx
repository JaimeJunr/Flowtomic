import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { GlyphTerminal } from "./glyph-terminal";

describe("GlyphTerminal (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <GlyphTerminal>
        <p>Conteúdo</p>
      </GlyphTerminal>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "glyph-terminal");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="glyph-terminal-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="glyph-terminal-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain("var(--success)");
    expect(fallback.getAttribute("style")).toContain("repeating-linear-gradient");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "glyph-terminal-content"
    );
  });
  it("uses a custom tint token in the fallback", () => {
    const { container } = render(<GlyphTerminal tint="--info" />);
    const fallback = container.querySelector(
      '[data-slot="glyph-terminal-fallback"]'
    ) as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--info)");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<GlyphTerminal tint="success" />)).toThrow(/"success"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<GlyphTerminal ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("GlyphTerminal (tema local)", () => {
  it("reads colors from an element inside the component", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <GlyphTerminal />
        </div>
      );
      const root = container.querySelector('[data-slot="glyph-terminal"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) {
        expect(root.contains(element ?? null)).toBe(true);
      }
    } finally {
      spy.mockRestore();
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
      const view = render(<GlyphTerminal speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
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
});
