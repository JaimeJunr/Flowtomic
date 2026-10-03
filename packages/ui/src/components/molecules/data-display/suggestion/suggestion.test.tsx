import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Suggestion, Suggestions } from "./suggestion";

describe("Suggestion", () => {
  it("oferece ação outline de 36px sem pílula e envia a sugestão ao clicar", async () => {
    const onClick = vi.fn();
    render(
      <Suggestions>
        <Suggestion suggestion="Mostrar o código do cabeçalho" onClick={onClick} />
      </Suggestions>
    );
    const button = screen.getByRole("button", { name: "Mostrar o código do cabeçalho" });
    expect(button).toHaveClass("border", "bg-background", "rounded-md", "h-9");
    expect(button).not.toHaveClass("rounded-full");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("Mostrar o código do cabeçalho");
  });

  it("preserva conteúdo customizado e não dispara a sugestão desabilitada", async () => {
    const onClick = vi.fn();
    render(
      <Suggestion suggestion="Rodar os testes do DataTable" disabled onClick={onClick}>
        Testes em execução
      </Suggestion>
    );
    const button = screen.getByRole("button", { name: "Testes em execução" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
