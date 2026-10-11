import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { GrainGradient } from "./grain-gradient";

describe("GrainGradient (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <GrainGradient>
        <p>Conteúdo</p>
      </GrainGradient>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "grain-gradient");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="grain-gradient-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="grain-gradient-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    const background = fallback.style.background || fallback.getAttribute("style") || "";
    for (const token of ["--primary", "--info", "--warning"]) {
      expect(background).toContain(`var(${token})`);
    }
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "grain-gradient-content"
    );
  });
  it("uses custom color tokens in the fallback", () => {
    const { container } = render(<GrainGradient colors={["--success", "--info", "--primary"]} />);
    const fallback = container.querySelector(
      '[data-slot="grain-gradient-fallback"]'
    ) as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<GrainGradient colors={["primary", "--info", "--primary"]} />)).toThrow(
        /"primary"/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("throws when the amount of colors is not three", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const colors = ["--primary", "--info"] as unknown as [string, string, string];
      expect(() => render(<GrainGradient colors={colors} />)).toThrow(/2.*3/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<GrainGradient ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("GrainGradient (tema local)", () => {
  it("reads every color from a component element, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <GrainGradient />
        </div>
      );
      const root = container.querySelector('[data-slot="grain-gradient"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
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
      const view = render(<GrainGradient speed={0} />);
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
