import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { ElevationMap } from "./elevation-map";

describe("ElevationMap (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <ElevationMap>
        <p>Conteúdo</p>
      </ElevationMap>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "elevation-map");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="elevation-map-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="elevation-map-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain(
      "repeating-radial-gradient(ellipse at 30% 40%"
    );
    expect(fallback.getAttribute("style")).toContain("var(--info)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "elevation-map-content"
    );
  });
  it("uses the middle color token in the fallback", () => {
    const { container } = render(<ElevationMap colors={["--success", "--warning", "--info"]} />);
    const fallback = container.querySelector('[data-slot="elevation-map-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--warning)");
  });
  it("throws for an invalid color token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<ElevationMap colors={["primary", "--info", "--success"]} />)).toThrow(
        /"primary"/
      );
      expect(() => render(<ElevationMap colors={["--primary", "info", "--success"]} />)).toThrow(
        /"info"/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("throws when the color list does not have three tokens", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<ElevationMap colors={["--primary", "--info"] as never} />)).toThrow(
        /exactly 3/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ElevationMap ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("ElevationMap (tema local)", () => {
  it("reads both tokens from the canvas element", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <ElevationMap colors={["--primary", "--success", "--warning"]} />
        </div>
      );
      const root = container.querySelector('[data-slot="elevation-map"]') as HTMLElement;
      const tokens = spy.mock.calls.map(([token]) => token);
      expect(tokens).toContain("--primary");
      expect(tokens).toContain("--success");
      for (const [, element] of spy.mock.calls) {
        expect(element).toBeInstanceOf(HTMLElement);
        expect(root.contains(element ?? null)).toBe(true);
      }
    } finally {
      spy.mockRestore();
    }
  });
  it("reads the second token", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      render(<ElevationMap colors={["--primary", "--success", "--warning"]} />);
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
      const view = render(<ElevationMap speed={0} />);
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
      const view = render(<ElevationMap speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<ElevationMap speed={0} colors={["--success", "--info", "--warning"]} />);
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
    }
  });
});
