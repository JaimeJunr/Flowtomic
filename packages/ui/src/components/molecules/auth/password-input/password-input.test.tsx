import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PasswordInput } from "./password-input";

const user = () => userEvent.setup();

describe("PasswordInput", () => {
  it("mostrar e ocultar por clique mudam o tipo, o nome acessível e preservam a senha", async () => {
    render(<PasswordInput id="senha" label="Senha" value="flowtomic123" onChange={() => {}} />);
    const field = screen.getByLabelText("Senha");
    expect(field).toHaveAttribute("type", "password");
    const keyboard = user();
    await keyboard.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(field).toHaveAttribute("type", "text");
    expect(field).toHaveValue("flowtomic123");
    await keyboard.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(field).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
    expect(field).toHaveValue("flowtomic123");
  });

  it("ocultar funciona com o campo focado e não rouba seu foco", async () => {
    render(<PasswordInput id="senha" label="Senha" />);
    const field = screen.getByLabelText("Senha");
    const keyboard = user();
    await keyboard.click(field);
    expect(field).toHaveAttribute("type", "text");
    await keyboard.click(screen.getByRole("button", { name: "Ocultar senha" }));
    await waitFor(() => expect(field).toHaveAttribute("type", "password"));
    expect(field).toHaveFocus();
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });

  it.each([
    "{Enter}",
    " ",
  ])("o toggle é alcançável por Tab e alterna nos dois sentidos com %s", async (key) => {
    render(<PasswordInput id="senha" label="Senha" />);
    const keyboard = user();
    await keyboard.tab();
    const field = screen.getByRole("textbox", { name: "Senha" });
    expect(field).toHaveFocus();
    await keyboard.tab();
    const toggle = screen.getByRole("button", { name: "Ocultar senha" });
    expect(toggle).toHaveFocus();
    await keyboard.keyboard(key);
    await waitFor(() => expect(field).toHaveAttribute("type", "password"));
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveFocus();
    await keyboard.keyboard(key);
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveFocus();
  });

  it("recebe value controlado e aguarda o consumidor antes de mudar a senha", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PasswordInput id="senha" label="Senha" value="" onChange={onChange} />
    );
    const field = screen.getByLabelText("Senha");
    await user().type(field, "a");
    expect(onChange.mock.calls).toEqual([
      [expect.objectContaining({ type: "change", target: field })],
    ]);
    expect(field).toHaveValue("");
    rerender(<PasswordInput id="senha" label="Senha" value="nova-senha" onChange={onChange} />);
    expect(field).toHaveValue("nova-senha");
  });

  it("o consumidor recebe cada edição e pode devolver os valores sem perder caracteres", async () => {
    const onValue = vi.fn();
    function Consumer() {
      const [value, setValue] = useState("");
      return (
        <PasswordInput
          id="senha"
          label="Senha"
          value={value}
          onChange={(event) => {
            onValue(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Consumer />);
    const field = screen.getByLabelText("Senha");
    const keyboard = user();
    await keyboard.type(field, "ab");
    await keyboard.clear(field);
    expect(onValue.mock.calls).toEqual([["a"], ["ab"], [""]]);
    expect(field).toHaveValue("");
  });

  it("encaminha os eventos de foco e blur e volta a ocultar ao focar outro campo", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <PasswordInput id="senha" label="Senha" onFocus={onFocus} onBlur={onBlur} />
        <label htmlFor="email">E-mail</label>
        <input id="email" />
      </>
    );
    const field = screen.getByLabelText("Senha");
    const keyboard = user();
    await keyboard.click(field);
    expect(onFocus.mock.calls).toEqual([
      [expect.objectContaining({ type: "focus", target: field })],
    ]);
    await keyboard.click(screen.getByRole("textbox", { name: "E-mail" }));
    await waitFor(() => expect(field).toHaveAttribute("type", "password"));
    expect(onBlur.mock.calls).toEqual([[expect.objectContaining({ type: "blur", target: field })]]);
    expect(field).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });

  it("focar um botão alheio também oculta a senha revelada só pelo foco", async () => {
    render(
      <>
        <PasswordInput id="senha" label="Senha" />
        <button type="button">Continuar</button>
      </>
    );
    const field = screen.getByLabelText("Senha");
    const keyboard = user();
    await keyboard.click(field);
    await keyboard.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() => expect(field).toHaveAttribute("type", "password"));
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });

  it("a escolha manual de mostrar continua ativa depois de sair do campo", async () => {
    render(
      <>
        <PasswordInput id="senha" label="Senha" />
        <button type="button">Continuar</button>
      </>
    );
    const keyboard = user();
    await keyboard.click(screen.getByRole("button", { name: "Mostrar senha" }));
    await keyboard.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("textbox", { name: "Senha" })).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();
  });

  it("register recebe a referência, nome e eventos exatos de edição e blur", async () => {
    const register = { name: "senhaCadastro", ref: vi.fn(), onChange: vi.fn(), onBlur: vi.fn() };
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <PasswordInput
          id="senha"
          label="Senha"
          register={register}
          onChange={onChange}
          onBlur={onBlur}
        />
        <button type="button">Continuar</button>
      </>
    );
    const field = screen.getByLabelText("Senha");
    expect(register.ref).toHaveBeenCalledWith(field);
    expect(field).toHaveAttribute("name", "senhaCadastro");
    const keyboard = user();
    await keyboard.type(field, "a");
    expect(register.onChange.mock.calls).toEqual([
      [expect.objectContaining({ type: "change", target: field })],
    ]);
    expect(onChange).not.toHaveBeenCalled();
    await keyboard.click(screen.getByRole("button", { name: "Continuar" }));
    expect(register.onBlur.mock.calls).toEqual([
      [expect.objectContaining({ type: "blur", target: field })],
    ]);
    expect(onBlur.mock.calls).toEqual([[expect.objectContaining({ type: "blur", target: field })]]);
    expect(field).toHaveValue("a");
  });

  it.each([
    "",
    "senha123",
  ])("fieldset disabled bloqueia edição e toggle com value='%s'", async (value) => {
    const onChange = vi.fn();
    render(
      <fieldset disabled>
        <legend>Cadastro</legend>
        <PasswordInput id="senha" label="Senha" value={value} onChange={onChange} />
      </fieldset>
    );
    const field = screen.getByLabelText("Senha");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    expect(field).toBeDisabled();
    expect(toggle).toBeDisabled();
    const keyboard = user();
    await keyboard.type(field, "nova");
    await keyboard.click(toggle);
    await keyboard.tab();
    expect(document.body).toHaveFocus();
    expect(field).toHaveAttribute("type", "password");
    expect(field).toHaveValue(value);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("mostra o erro fornecido e o retira quando o consumidor limpa error", () => {
    const { rerender } = render(
      <PasswordInput id="senha" label="Senha" error="Use pelo menos 8 caracteres." required />
    );
    expect(screen.getByText("Use pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeRequired();
    rerender(<PasswordInput id="senha" label="Senha" />);
    expect(screen.queryByText("Use pelo menos 8 caracteres.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).not.toBeRequired();
  });

  it.each([
    undefined,
    "Use pelo menos 8 caracteres.",
  ])("campo com error=%s não tem violações automáticas de acessibilidade", async (error) => {
    const { container } = render(<PasswordInput id="senha" label="Senha" error={error} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
