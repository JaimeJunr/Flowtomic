import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import * as React from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CurvedInput } from "./curved-input";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const slot = (c: HTMLElement, name: string) => c.querySelector(`[data-slot="${name}"]`);

describe("CurvedInput", () => {
  it("digitar chama onValueChange e ecoa no textPath", async () => {
    const onValueChange = vi.fn();
    const { container } = render(<CurvedInput onValueChange={onValueChange} />);
    await userEvent.type(screen.getByRole("textbox"), "ab");
    expect(onValueChange).toHaveBeenLastCalledWith("ab");
    expect(slot(container, "curved-input-text")?.textContent).toBe("ab");
  });

  it("mostra o placeholder quando vazio e some ao digitar", async () => {
    const { container } = render(<CurvedInput />);
    expect(slot(container, "curved-input-text")?.textContent).toBe("Seu melhor e-mail");
    await userEvent.type(screen.getByRole("textbox"), "x");
    expect(slot(container, "curved-input-text")?.textContent).toBe("x");
  });

  it("Enter chama onSubmit com o valor", async () => {
    const onSubmit = vi.fn();
    render(<CurvedInput defaultValue="a@b.com" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("a@b.com");
  });

  it("clique no botao chama onSubmit", async () => {
    const onSubmit = vi.fn();
    render(<CurvedInput defaultValue="x@y.com" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onSubmit).toHaveBeenCalledWith("x@y.com");
  });

  it("showButton=false nao renderiza botao", () => {
    render(<CurvedInput showButton={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("modo controlado: value manda", async () => {
    const { container } = render(<CurvedInput value="fixo" />);
    await userEvent.type(screen.getByRole("textbox"), "z");
    expect(screen.getByRole("textbox")).toHaveValue("fixo");
    expect(slot(container, "curved-input-text")?.textContent).toBe("fixo");
  });

  it("icon=false esconde o chip", () => {
    const { container, rerender } = render(<CurvedInput />);
    expect(slot(container, "curved-input-chip")).not.toBeNull();
    rerender(<CurvedInput icon={false} />);
    expect(slot(container, "curved-input-chip")).toBeNull();
  });

  it("aria-label padrao e o placeholder", () => {
    render(<CurvedInput placeholder="Seu e-mail corporativo" />);
    expect(screen.getByRole("textbox", { name: "Seu e-mail corporativo" })).toBeInTheDocument();
  });

  it("repassa type ao input", () => {
    render(<CurvedInput type="search" />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("foco liga data-focused e o anel", () => {
    const { container } = render(<CurvedInput />);
    expect(container.firstElementChild).toHaveAttribute("data-focused", "false");
    expect(slot(container, "curved-input-ring")).toBeNull();
    fireEvent.focus(screen.getByRole("textbox"));
    expect(container.firstElementChild).toHaveAttribute("data-focused", "true");
    expect(slot(container, "curved-input-ring")).not.toBeNull();
  });

  it("cursor pisca por padrao e fica fixo com movimento reduzido", () => {
    const { container, unmount } = render(<CurvedInput />);
    fireEvent.focus(screen.getByRole("textbox"));
    expect(slot(container, "curved-input-caret")?.getAttribute("class")).toContain("animate-");
    unmount();
    const reduced = render(
      <MotionConfig reducedMotion="always">
        <CurvedInput />
      </MotionConfig>
    );
    fireEvent.focus(screen.getByRole("textbox"));
    expect(
      slot(reduced.container, "curved-input-caret")?.getAttribute("class") ?? ""
    ).not.toContain("animate-");
  });

  it("aplica ref, className e data-slot na raiz", () => {
    const ref = React.createRef<HTMLFormElement>();
    render(<CurvedInput ref={ref} className="minha-classe" />);
    expect(ref.current).toHaveAttribute("data-slot", "curved-input");
    expect(ref.current).toHaveClass("minha-classe");
  });
});
