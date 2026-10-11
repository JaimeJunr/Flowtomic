import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuroraGlow } from "./aurora-glow";

describe("AuroraGlow (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <AuroraGlow>
        <p>Conteúdo</p>
      </AuroraGlow>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "aurora-glow");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="aurora-glow-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="aurora-glow-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    const background = fallback.style.background || fallback.getAttribute("style") || "";
    for (const token of ["--primary", "--warning", "--info"]) {
      expect(background).toContain(`var(${token})`);
    }
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "aurora-glow-content"
    );
  });
  it("uses custom color tokens in the fallback", () => {
    const { container } = render(<AuroraGlow colors={["--success", "--info", "--primary"]} />);
    const fallback = container.querySelector('[data-slot="aurora-glow-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<AuroraGlow colors={["primary", "--info", "--primary"]} />)).toThrow(
        /"primary"/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<AuroraGlow ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});
