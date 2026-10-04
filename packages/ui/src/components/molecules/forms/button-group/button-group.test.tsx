import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../../atoms";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";

function renderGroup(props: Partial<React.ComponentProps<typeof ButtonGroup>> = {}) {
  return render(
    <ButtonGroup aria-label="Período" {...props}>
      <Button variant="outline">Dia</Button>
      <Button variant="outline">Semana</Button>
      <Button variant="outline">Mês</Button>
    </ButtonGroup>
  );
}

describe("ButtonGroup", () => {
  it("agrupa os botões num grupo com nome", () => {
    renderGroup();
    const grupo = screen.getByRole("group", { name: "Período" });
    expect(grupo).toContainElement(screen.getByRole("button", { name: "Dia" }));
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("é horizontal por padrão e vertical quando pedido", () => {
    const { rerender } = renderGroup();
    expect(screen.getByRole("group")).toHaveClass("flex-row");
    expect(screen.getByRole("group")).not.toHaveClass("flex-col");
    rerender(
      <ButtonGroup aria-label="Período" orientation="vertical">
        <Button>Dia</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("group")).toHaveClass("flex-col");
    expect(screen.getByRole("group")).not.toHaveClass("flex-row");
  });

  it("equalWidth faz os botões dividirem a largura, e sem ele não", () => {
    const { rerender } = renderGroup();
    expect(screen.getByRole("group").className).not.toContain("[&>*]:flex-1");
    rerender(
      <ButtonGroup aria-label="Período" equalWidth>
        <Button>Dia</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("group").className).toContain("[&>*]:flex-1");
  });

  it("junta className e atributos nativos", () => {
    renderGroup({ className: "minha-classe", id: "periodo" });
    const grupo = screen.getByRole("group", { name: "Período" });
    expect(grupo).toHaveClass("minha-classe", "inline-flex");
    expect(grupo).toHaveAttribute("id", "periodo");
  });

  it("cada botão responde ao clique e ao teclado, em ordem de tabulação", async () => {
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="Período">
        <Button onClick={() => onClick("dia")}>Dia</Button>
        <Button onClick={() => onClick("semana")}>Semana</Button>
      </ButtonGroup>
    );
    await userEvent.click(screen.getByRole("button", { name: "Semana" }));
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Dia" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick.mock.calls).toEqual([["semana"], ["dia"]]);
  });
});

describe("ButtonGroupSeparator", () => {
  it("é um separador vertical por padrão", () => {
    render(<ButtonGroupSeparator />);
    const separador = screen.getByRole("separator");
    expect(separador).toHaveAttribute("aria-orientation", "vertical");
    expect(separador).toHaveClass("w-px", "h-full");
  });

  it("na horizontal ocupa a largura toda", () => {
    render(<ButtonGroupSeparator orientation="horizontal" className="meu" />);
    const separador = screen.getByRole("separator");
    expect(separador).toHaveAttribute("aria-orientation", "horizontal");
    expect(separador).toHaveClass("h-px", "w-full", "meu");
  });
});

describe("ButtonGroupText", () => {
  it("mostra o texto ao lado dos botões e aceita className", () => {
    render(<ButtonGroupText className="extra">Ordenar por</ButtonGroupText>);
    expect(screen.getByText("Ordenar por")).toHaveClass("text-muted-foreground", "extra");
  });
});

describe("ButtonGroup, acessibilidade", () => {
  it("grupo com botões, separador e texto não tem violações", async () => {
    const { container } = render(
      <ButtonGroup aria-label="Ações do documento">
        <ButtonGroupText>Ordenar por</ButtonGroupText>
        <Button variant="outline">Nome</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Data</Button>
      </ButtonGroup>
    );
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
