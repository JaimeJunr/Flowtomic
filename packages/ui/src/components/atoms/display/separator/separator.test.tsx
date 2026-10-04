import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("por padrão é decorativo: fica fora da árvore de acessibilidade", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("não decorativo expõe role separator horizontal", () => {
    render(<Separator decorative={false} />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    // Radix omite aria-orientation quando é horizontal (valor padrão do ARIA)
    expect(sep).not.toHaveAttribute("aria-orientation");
  });

  it("não decorativo e vertical informa aria-orientation vertical", () => {
    render(<Separator decorative={false} orientation="vertical" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
    expect(sep).toHaveAttribute("data-orientation", "vertical");
  });

  it("a orientação define a dimensão da linha", () => {
    const { rerender } = render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveClass("h-px", "w-full");
    rerender(<Separator data-testid="sep" orientation="vertical" />);
    expect(screen.getByTestId("sep")).toHaveClass("h-full", "w-px");
  });

  it("repassa className e ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="minha" data-testid="sep" />);
    expect(ref.current).toBe(screen.getByTestId("sep"));
    expect(ref.current).toHaveClass("minha");
  });
});
