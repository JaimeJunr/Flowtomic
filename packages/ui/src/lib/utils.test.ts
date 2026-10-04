import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("junta classes condicionais, arrays e ignora valores falsos", () => {
    expect(cn(["flex", ["items-center"]], null, undefined, false, "gap-2")).toBe(
      "flex items-center gap-2"
    );
    expect(cn("h-9", { "h-8": true, hidden: false })).toBe("h-8");
  });

  it("a última classe vence quando duas brigam pela mesma propriedade", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("size-4", "size-6")).toBe("size-6");
    expect(cn("rounded-md", "rounded-3xl")).toBe("rounded-3xl");
    expect(cn("data-[size=sm]:h-8", "data-[size=sm]:h-7")).toBe("data-[size=sm]:h-7");
  });

  it("resolve conflito entre tokens semânticos do tema", () => {
    expect(cn("bg-primary", "bg-success-hover")).toBe("bg-success-hover");
    expect(cn("border-input", "border-destructive")).toBe("border-destructive");
    expect(cn("font-mono", "font-display")).toBe("font-display");
    expect(cn("text-display-lg", "text-display-sm")).toBe("text-display-sm");
  });

  it("não confunde largura do anel com cor do anel", () => {
    expect(cn("focus-visible:ring-[3px]", "focus-visible:ring-ring/50")).toBe(
      "focus-visible:ring-[3px] focus-visible:ring-ring/50"
    );
  });
});
