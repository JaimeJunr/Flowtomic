import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { EditModeToggle } from "./edit-mode-toggle";

const modes = [
  [false, "Entrar no modo de edição", "Editar Dashboard", true],
  [true, "Sair do modo de edição", "Visualizar", false],
] as const;

describe("EditModeToggle", () => {
  it.each(
    modes
  )("isEditMode=%s anuncia a ação '%s' e emite o próximo estado", async (isEditMode, name, label, nextMode) => {
    const onToggle = vi.fn();
    render(<EditModeToggle isEditMode={isEditMode} onToggle={onToggle} />);
    const button = screen.getByRole("button", { name });
    expect(button).toHaveTextContent(label);
    expect(button).toHaveAttribute("aria-pressed", String(isEditMode));
    await userEvent.click(button);
    expect(onToggle.mock.calls).toEqual([[nextMode]]);
    expect(button).toHaveAttribute("aria-pressed", String(isEditMode));
    expect(button).toHaveAccessibleName(name);
  });

  it("o consumidor controla os dois sentidos e cada rerender atualiza rótulo e estado", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(<EditModeToggle isEditMode={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Entrar no modo de edição" }));
    rerender(<EditModeToggle isEditMode onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: "Sair do modo de edição" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Visualizar");
    await userEvent.click(button);
    rerender(<EditModeToggle isEditMode={false} onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Entrar no modo de edição" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(onToggle.mock.calls).toEqual([[true], [false]]);
  });

  it.each([
    [false, "Entrar no modo de edição", "Configurar componentes"],
    [true, "Sair do modo de edição", "Conferir componentes"],
  ] as const)("isEditMode=%s aceita texto customizado sem perder o nome da ação", (isEditMode, name, label) => {
    render(
      <EditModeToggle
        isEditMode={isEditMode}
        onToggle={() => {}}
        editLabel="Configurar componentes"
        viewLabel="Conferir componentes"
      />
    );
    expect(screen.getByRole("button", { name })).toHaveTextContent(label);
  });

  it.each([
    [false, "Entrar no modo de edição", "{Enter}", true],
    [true, "Sair do modo de edição", " ", false],
  ] as const)("isEditMode=%s é alcançável por Tab e ativado com %s / %s", async (isEditMode, name, key, nextMode) => {
    const onToggle = vi.fn();
    render(<EditModeToggle isEditMode={isEditMode} onToggle={onToggle} />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name })).toHaveFocus();
    await userEvent.keyboard(key);
    expect(onToggle.mock.calls).toEqual([[nextMode]]);
  });

  it.each(
    modes
  )("desabilitado em isEditMode=%s bloqueia clique e teclado (%s)", async (isEditMode, name) => {
    const onToggle = vi.fn();
    render(<EditModeToggle disabled isEditMode={isEditMode} onToggle={onToggle} />);
    const button = screen.getByRole("button", { name });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    await userEvent.tab();
    await userEvent.keyboard("{Enter} ");
    expect(document.body).toHaveFocus();
    expect(onToggle).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-pressed", String(isEditMode));
  });

  it.each(modes)("a ref permite focar o botão em isEditMode=%s (%s)", (isEditMode, name) => {
    const ref = createRef<HTMLButtonElement>();
    render(<EditModeToggle ref={ref} isEditMode={isEditMode} onToggle={() => {}} />);
    expect(ref.current).toBe(screen.getByRole("button", { name }));
    ref.current?.focus();
    expect(screen.getByRole("button", { name })).toHaveFocus();
  });
});
