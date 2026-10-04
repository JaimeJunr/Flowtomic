import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("compõe título, descrição, ação, conteúdo e rodapé", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Receita</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
          <CardAction>
            <button type="button">Editar</button>
          </CardAction>
        </CardHeader>
        <CardContent>R$ 10 mil</CardContent>
        <CardFooter>Atualizado hoje</CardFooter>
      </Card>
    );
    expect(screen.getByRole("heading", { level: 3, name: "Receita" })).toBeInTheDocument();
    expect(screen.getByText("Últimos 30 dias")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByText("R$ 10 mil")).toBeInTheDocument();
    expect(screen.getByText("Atualizado hoje")).toBeInTheDocument();
  });

  it("repassa className, props e ref em cada parte", () => {
    const refCard = createRef<HTMLDivElement>();
    const refTitulo = createRef<HTMLParagraphElement>();
    render(
      <Card ref={refCard} className="c-card" aria-label="Resumo">
        <CardHeader className="c-header" data-testid="header" />
        <CardTitle ref={refTitulo} className="c-titulo">
          T
        </CardTitle>
        <CardDescription className="c-desc">D</CardDescription>
        <CardAction className="c-acao" data-testid="acao" />
        <CardContent className="c-conteudo" data-testid="conteudo" />
        <CardFooter className="c-rodape" data-testid="rodape" />
      </Card>
    );
    expect(refCard.current).toHaveClass("c-card");
    expect(refCard.current).toHaveAttribute("aria-label", "Resumo");
    expect(refTitulo.current?.tagName).toBe("H3");
    expect(screen.getByTestId("header")).toHaveClass("c-header");
    expect(screen.getByRole("heading", { name: "T" })).toHaveClass("c-titulo");
    expect(screen.getByText("D")).toHaveClass("c-desc");
    expect(screen.getByTestId("acao")).toHaveClass("c-acao");
    expect(screen.getByTestId("conteudo")).toHaveClass("c-conteudo");
    expect(screen.getByTestId("rodape")).toHaveClass("c-rodape");
  });
});
