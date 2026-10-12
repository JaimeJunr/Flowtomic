import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { NeonBends } from "./neon-bends";

describe("NeonBends (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <NeonBends>
        <p>Conteúdo</p>
      </NeonBends>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "neon-bends");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="neon-bends-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="neon-bends-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain("radial-gradient(ellipse 80% 30%");
    expect(fallback.getAttribute("style")).toContain("var(--primary)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "neon-bends-content"
    );
  });
  it("uses the first color token in the fallback", () => {
    const { container } = render(<NeonBends colors={["--success"]} />);
    const fallback = container.querySelector('[data-slot="neon-bends-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid color token or count with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<NeonBends colors={["primary"]} />)).toThrow(/"primary"/);
      expect(() => render(<NeonBends colors={[]} />)).toThrow(/1 to 4/);
      expect(() => render(<NeonBends colors={["--a", "--b", "--c", "--d", "--e"]} />)).toThrow(
        /1 to 4/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<NeonBends ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("NeonBends (tema local)", () => {
  it("reads every token from the canvas element", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <NeonBends colors={["--primary", "--success", "--info"]} />
        </div>
      );
      const root = container.querySelector('[data-slot="neon-bends"]') as HTMLElement;
      const tokens = spy.mock.calls.map(([token]) => token);
      expect(tokens).toEqual(expect.arrayContaining(["--primary", "--success", "--info"]));
      for (const [, element] of spy.mock.calls) {
        expect(element).toBeInstanceOf(HTMLElement);
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
      const view = render(<NeonBends speed={0} />);
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
      const view = render(<NeonBends speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<NeonBends speed={0} colors={["--success"]} />);
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
    }
  });
});
