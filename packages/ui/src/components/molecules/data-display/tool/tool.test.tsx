import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tool, ToolContent, ToolHeader, type ToolHeaderProps, ToolInput, ToolOutput } from "./tool";

describe("Tool", () => {
  describe("Rótulos internos em pt-BR", () => {
    it("mostra 'Parâmetros' sem uppercase/tracking forçados", () => {
      render(
        <Tool open>
          <ToolInput input={{ query: "flowtomic-cli add button" }} />
        </Tool>
      );
      const label = screen.getByText("Parâmetros");
      expect(label.className).not.toMatch(/\buppercase\b/);
      expect(label.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
      expect(label).toHaveClass("text-[13px]", "text-muted-foreground");
      expect(label.nextElementSibling).toHaveClass("rounded-md", "bg-surface");
      expect(label.nextElementSibling?.firstElementChild).toHaveClass("font-mono", "text-[12.5px]");
    });

    it("mostra 'Resultado' sem uppercase/tracking forçados", () => {
      render(
        <Tool open>
          <ToolOutput output={{ ok: true }} errorText={undefined} />
        </Tool>
      );
      const label = screen.getByText("Resultado");
      expect(label.className).not.toMatch(/\buppercase\b/);
      expect(label.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
      expect(label).toHaveClass("text-[13px]", "text-muted-foreground");
      expect(label.nextElementSibling).toHaveClass("rounded-md", "bg-surface");
      expect(label.nextElementSibling?.firstElementChild).toHaveClass("font-mono", "text-[12.5px]");
    });
  });

  it.each([
    ["input-streaming", "Preparando", "muted-foreground"],
    ["input-available", "Executando", "muted-foreground"],
    ["approval-requested", "Aguardando aprovação", "warning"],
    ["approval-responded", "Respondida", "muted-foreground"],
    ["output-available", "Concluída", "success"],
    ["output-error", "Falhou", "destructive"],
    ["output-denied", "Negada", "muted-foreground"],
  ])("mostra o estado %s em pt-BR, com tom semântico e sem pílula", (state, label, tone) => {
    render(
      <Tool>
        <ToolHeader type="tool-buscar_componente" state={state as ToolHeaderProps["state"]} />
      </Tool>
    );
    expect(screen.getByRole("button", { name: `buscar_componente ${label}` })).toBeInTheDocument();
    const status = screen.getByText(label);
    expect(status).toHaveClass(`text-${tone}`);
    expect(status).not.toHaveClass("rounded-full");
    const indicator = status.firstElementChild;
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    if (state === "input-available") {
      expect(indicator).toHaveClass("lucide-loader-circle", "animate-spin");
    } else {
      expect(indicator).toHaveClass("size-[7px]", `bg-${tone}`);
    }
  });

  it("mantém o nome em mono e abre o conteúdo em um contêiner sem sombra", async () => {
    const { container } = render(
      <Tool>
        <ToolHeader type="tool-buscar_componente" state="output-available" />
        <ToolContent>
          <p>Componente encontrado</p>
        </ToolContent>
      </Tool>
    );
    expect(container.firstElementChild).toHaveClass("rounded-[10px]", "border-border");
    expect(container.firstElementChild?.className).not.toMatch(/\bshadow-/);
    expect(screen.getByText("buscar_componente")).toHaveClass("font-mono", "text-[13px]");
    expect(screen.queryByText("Componente encontrado")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "buscar_componente Concluída" }));
    expect(screen.getByText("Componente encontrado")).toBeVisible();
  });

  it("identifica o erro com rótulo e bloco no tom destrutivo", () => {
    render(<ToolOutput output={null} errorText="Não foi possível consultar o componente." />);
    const label = screen.getByRole("heading", { name: "Erro" });
    expect(label).toHaveClass("text-[13px]", "text-destructive");
    expect(label.nextElementSibling).toHaveClass("bg-destructive/10", "text-destructive");
    expect(screen.getByText("Não foi possível consultar o componente.")).toBeInTheDocument();
  });

  it("não mostra resultado quando não há saída nem erro", () => {
    const { container } = render(<ToolOutput output={null} errorText={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
