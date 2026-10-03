import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

function Paleta({
  onSelect = () => {},
  comSeparador = true,
}: {
  onSelect?: (v: string) => void;
  comSeparador?: boolean;
}) {
  return (
    <Command label="Paleta de comandos">
      <CommandInput placeholder="Buscar comando" aria-label="Buscar comando" />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Arquivo">
          <CommandItem onSelect={onSelect}>
            Abrir <CommandShortcut>Ctrl+O</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onSelect}>Salvar</CommandItem>
        </CommandGroup>
        {comSeparador && <CommandSeparator />}
        <CommandGroup heading="Edição">
          <CommandItem disabled onSelect={onSelect}>
            Desfazer
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("lista os itens por grupo com o atalho ao lado", () => {
    render(<Paleta />);
    expect(screen.getByText("Arquivo")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Abrir/ })).toHaveTextContent("Ctrl+O");
    expect(screen.getByRole("option", { name: "Salvar" })).toBeInTheDocument();
  });

  it("digitar filtra os itens e esconde o que não combina", async () => {
    render(<Paleta />);
    await userEvent.type(screen.getByRole("combobox", { name: "Paleta de comandos" }), "salv");
    expect(screen.getByRole("option", { name: "Salvar" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Abrir/ })).not.toBeInTheDocument();
  });

  it("sem correspondência mostra a mensagem de vazio", async () => {
    render(<Paleta />);
    await userEvent.type(screen.getByRole("combobox", { name: "Paleta de comandos" }), "zzzz");
    expect(screen.getByText("Nenhum resultado.")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("clicar num item dispara onSelect com o valor dele", async () => {
    const onSelect = vi.fn();
    render(<Paleta onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("option", { name: "Salvar" }));
    expect(onSelect).toHaveBeenCalledWith("Salvar");
  });

  it("item desabilitado não dispara onSelect", async () => {
    const onSelect = vi.fn();
    render(<Paleta onSelect={onSelect} />);
    const item = screen.getByRole("option", { name: "Desfazer" });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Enter confirma o item destacado pelo teclado", async () => {
    const onSelect = vi.fn();
    render(<Paleta onSelect={onSelect} />);
    await userEvent.type(
      screen.getByRole("combobox", { name: "Paleta de comandos" }),
      "salv{Enter}"
    );
    expect(onSelect).toHaveBeenCalledWith("Salvar");
  });

  it("sem separador, não tem violações automáticas de acessibilidade", async () => {
    const { container } = render(<Paleta comSeparador={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("com separador entre grupos, também não tem violações automáticas", async () => {
    const { container } = render(<Paleta />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("o separador some durante a busca, a menos que alwaysRender peça", async () => {
    const { container, rerender } = render(<Paleta />);
    expect(container.querySelector("[cmdk-separator]")).not.toBeNull();
    await userEvent.type(screen.getByRole("combobox", { name: "Paleta de comandos" }), "a");
    expect(container.querySelector("[cmdk-separator]")).toBeNull();
    rerender(
      <Command label="Paleta de comandos">
        <CommandInput aria-label="Buscar comando" />
        <CommandList>
          <CommandItem>Salvar</CommandItem>
          <CommandSeparator alwaysRender />
        </CommandList>
      </Command>
    );
    await userEvent.type(screen.getByRole("combobox", { name: "Paleta de comandos" }), "s");
    expect(container.querySelector("[cmdk-separator]")).not.toBeNull();
  });
});
