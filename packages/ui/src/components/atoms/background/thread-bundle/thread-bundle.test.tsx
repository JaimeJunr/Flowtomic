import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { ThreadBundle } from "./thread-bundle";

describe("ThreadBundle (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <ThreadBundle>
        <p>Conteúdo</p>
      </ThreadBundle>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "thread-bundle");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="thread-bundle-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="thread-bundle-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain("linear-gradient(155deg");
    expect(fallback.getAttribute("style")).toContain("var(--foreground)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "thread-bundle-content"
    );
  });
  it("uses the custom color token in the fallback", () => {
    const { container } = render(<ThreadBundle color="--success" />);
    const fallback = container.querySelector('[data-slot="thread-bundle-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid color token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<ThreadBundle color="primary" />)).toThrow(/"primary"/);
      expect(() => render(<ThreadBundle accentColor="success" />)).toThrow(/"success"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ThreadBundle ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("ThreadBundle (tema local)", () => {
  it("reads color and accent from the canvas element, reusing the main color when no accent", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <ThreadBundle color="--primary" />
        </div>
      );
      const root = container.querySelector('[data-slot="thread-bundle"]') as HTMLElement;
      const tokens = spy.mock.calls.map(([token]) => token);
      expect(tokens).toContain("--primary");
      expect(tokens).not.toContain("--accent");
      for (const [, element] of spy.mock.calls) {
        expect(element).toBeInstanceOf(HTMLElement);
        expect(root.contains(element ?? null)).toBe(true);
      }
    } finally {
      spy.mockRestore();
    }
  });
  it("reads the accent token when given", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      render(<ThreadBundle color="--primary" accentColor="--success" />);
      expect(spy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
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
      const view = render(<ThreadBundle speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
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
  it("redraws after rereading colors on a token change", () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<ThreadBundle speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<ThreadBundle speed={0} color="--success" />);
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
    }
  });
});
