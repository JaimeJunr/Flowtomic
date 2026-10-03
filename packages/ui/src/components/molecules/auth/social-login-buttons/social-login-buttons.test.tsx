import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { SocialLoginButtons } from "./social-login-buttons";

describe("SocialLoginButtons", () => {
  it.each([
    "Google",
    "Apple",
  ])("clicar em %s chama só o callback desse provedor com o evento do botão", async (provider) => {
    const onGoogleClick = vi.fn();
    const onAppleClick = vi.fn();
    render(<SocialLoginButtons onGoogleClick={onGoogleClick} onAppleClick={onAppleClick} />);
    const button = screen.getByRole("button", { name: `Entrar com ${provider}` });
    expect(button).toHaveTextContent(provider);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("ou")).toBeInTheDocument();
    await userEvent.click(button);
    const selected = provider === "Google" ? onGoogleClick : onAppleClick;
    const other = provider === "Google" ? onAppleClick : onGoogleClick;
    expect(selected.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: button })],
    ]);
    expect(other).not.toHaveBeenCalled();
  });

  it.each([
    ["Google", 1, "{Enter}"],
    ["Apple", 2, " "],
  ] as const)("%s é alcançável com %i Tab e ativado com %s", async (provider, tabs, key) => {
    const onGoogleClick = vi.fn();
    const onAppleClick = vi.fn();
    render(<SocialLoginButtons onGoogleClick={onGoogleClick} onAppleClick={onAppleClick} />);
    for (let i = 0; i < tabs; i++) await userEvent.tab();
    const button = screen.getByRole("button", { name: `Entrar com ${provider}` });
    expect(button).toHaveFocus();
    await userEvent.keyboard(key);
    const selected = provider === "Google" ? onGoogleClick : onAppleClick;
    const other = provider === "Google" ? onAppleClick : onGoogleClick;
    expect(selected.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: button })],
    ]);
    expect(other).not.toHaveBeenCalled();
  });

  it.each([
    "Google",
    "Apple",
  ])("%s sem callback continua seguro e não dispara o outro provedor", async (provider) => {
    const otherClick = vi.fn();
    const callbacks =
      provider === "Google" ? { onAppleClick: otherClick } : { onGoogleClick: otherClick };
    render(<SocialLoginButtons {...callbacks} />);
    await userEvent.click(screen.getByRole("button", { name: `Entrar com ${provider}` }));
    expect(otherClick).not.toHaveBeenCalled();
    const otherProvider = provider === "Google" ? "Apple" : "Google";
    const otherButton = screen.getByRole("button", { name: `Entrar com ${otherProvider}` });
    await userEvent.click(otherButton);
    expect(otherClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: otherButton })],
    ]);
  });

  it.each([
    "Google",
    "Apple",
  ])("%s dentro de um formulário não envia o formulário", async (provider) => {
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SocialLoginButtons />
        <button type="submit">Cadastrar</button>
      </form>
    );
    await userEvent.click(screen.getByRole("button", { name: `Entrar com ${provider}` }));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(onSubmit.mock.calls).toEqual([[]]);
  });

  it.each([
    "Outra forma de entrar",
    "",
  ])("dividerText='%s' substitui o divisor padrão sem mudar os nomes dos botões", (dividerText) => {
    render(<SocialLoginButtons dividerText={dividerText} />);
    expect(screen.queryByText("ou")).not.toBeInTheDocument();
    if (dividerText) expect(screen.getByText(dividerText)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar com Apple" })).toBeInTheDocument();
  });

  it.each([
    undefined,
    "Outra forma de entrar",
  ])("botões com dividerText=%s não têm violações automáticas de acessibilidade", async (dividerText) => {
    const { container } = render(<SocialLoginButtons dividerText={dividerText} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
