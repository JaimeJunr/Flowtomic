import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./bubble";

describe("Bubble", () => {
  it("mostra a mensagem da pessoa à direita, em fundo muted, por padrão", () => {
    render(
      <Bubble data-testid="bubble">
        <BubbleContent>Como faço o DataTable ordenar?</BubbleContent>
      </Bubble>
    );
    const bubble = screen.getByTestId("bubble");
    expect(bubble).toHaveAttribute("data-align", "end");
    expect(bubble).toHaveAttribute("data-variant", "muted");
    expect(bubble).toHaveClass("items-end", "max-w-[80%]");
    expect(screen.getByText("Como faço o DataTable ordenar?")).toHaveClass(
      "bg-muted",
      "text-foreground"
    );
  });

  it("alinha à esquerda e aplica cada variante só com tokens semânticos", () => {
    const { rerender } = render(
      <Bubble align="start" variant="outline" data-testid="bubble">
        <BubbleContent>Bate-papo entre pessoas</BubbleContent>
      </Bubble>
    );
    expect(screen.getByTestId("bubble")).toHaveClass("items-start", "self-start");
    expect(screen.getByText("Bate-papo entre pessoas")).toHaveClass("border", "border-border");

    rerender(
      <Bubble variant="tinted">
        <BubbleContent>Resposta fixada</BubbleContent>
      </Bubble>
    );
    expect(screen.getByText("Resposta fixada")).toHaveClass("bg-primary/10", "text-primary");

    rerender(
      <Bubble variant="destructive">
        <BubbleContent>Não foi enviada</BubbleContent>
      </Bubble>
    );
    expect(screen.getByText("Não foi enviada")).toHaveClass(
      "bg-destructive/10",
      "text-destructive"
    );
  });

  it("vira um botão de verdade com asChild, sem perder o visual do balão", async () => {
    const onClick = vi.fn();
    render(
      <Bubble variant="tinted">
        <BubbleContent asChild>
          <button type="button" onClick={onClick}>
            Abrir a resposta fixada
          </button>
        </BubbleContent>
      </Bubble>
    );
    const button = screen.getByRole("button", { name: "Abrir a resposta fixada" });
    expect(button).toHaveClass("bg-primary/10", "rounded-2xl", "focus-visible:ring-2");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("usa muted quando o conteúdo é usado fora de um Bubble", () => {
    render(<BubbleContent>Solto</BubbleContent>);
    expect(screen.getByText("Solto")).toHaveClass("bg-muted");
  });

  it("encosta as reações no lado do balão e mantém os botões acessíveis", async () => {
    const onReact = vi.fn();
    render(
      <BubbleGroup data-testid="group">
        <Bubble align="start" variant="outline">
          <BubbleContent>Bate-papo entre pessoas</BubbleContent>
          <BubbleReactions aria-label="Reações">
            <button type="button" aria-label="Curtir, 2 pessoas" onClick={onReact}>
              2
            </button>
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
    );
    expect(screen.getByTestId("group")).toHaveClass("flex", "flex-col");
    const reactions = screen.getByRole("group", { name: "Reações" });
    expect(reactions).toHaveClass("-mt-2.5", "self-start");
    await userEvent.click(screen.getByRole("button", { name: "Curtir, 2 pessoas" }));
    expect(onReact).toHaveBeenCalledTimes(1);
  });

  it("põe as reações à direita quando o balão está à direita", () => {
    render(
      <Bubble>
        <BubbleContent>Minha mensagem</BubbleContent>
        <BubbleReactions aria-label="Reações">
          <span>1</span>
        </BubbleReactions>
      </Bubble>
    );
    expect(screen.getByRole("group", { name: "Reações" })).toHaveClass("self-end");
  });
});
