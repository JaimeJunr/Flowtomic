import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggleButton } from "./theme-toggle-button";

const themes = [
  ["light", "Alternar para tema escuro", "dark", false],
  ["dark", "Alternar para tema claro", "light", true],
] as const;

// Espera a limpeza que o fallback de transição faz no documento real do jsdom.
afterEach(async () => {
  await waitFor(() => expect(document.documentElement).not.toHaveClass("theme-transitioning"));
});

describe("ThemeToggleButton", () => {
  it.each(
    themes
  )("theme=%s anuncia '%s' e emite exatamente %s sem assumir a atualização do dono", async (theme, name, nextTheme, pressed) => {
    const onThemeChange = vi.fn();
    render(<ThemeToggleButton theme={theme} onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button", { name });
    expect(button).toHaveAttribute("aria-pressed", String(pressed));
    await userEvent.click(button);
    expect(onThemeChange.mock.calls).toEqual([[nextTheme]]);
    expect(button).toHaveAccessibleName(name);
    expect(button).toHaveAttribute("aria-pressed", String(pressed));
  });

  it("rerender controlado troca a ação nos dois sentidos sem emitir callback sozinho", () => {
    const onThemeChange = vi.fn();
    const { rerender } = render(<ThemeToggleButton theme="light" onThemeChange={onThemeChange} />);
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    rerender(<ThemeToggleButton theme="dark" onThemeChange={onThemeChange} />);
    expect(screen.getByRole("button", { name: "Alternar para tema claro" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    rerender(<ThemeToggleButton theme="light" onThemeChange={onThemeChange} />);
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(onThemeChange).not.toHaveBeenCalled();
  });

  it.each([
    "{Enter}",
    " ",
  ])("Tab e %s alternam o tema controlado nas duas direções", async (key) => {
    const onThemeChange = vi.fn();
    function Consumer() {
      const [theme, setTheme] = useState<"light" | "dark">("light");
      return (
        <ThemeToggleButton
          theme={theme}
          onThemeChange={(nextTheme) => {
            onThemeChange(nextTheme);
            setTheme(nextTheme);
          }}
        />
      );
    }
    render(<Consumer />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveFocus();
    await userEvent.keyboard(key);
    const lightAction = screen.getByRole("button", { name: "Alternar para tema claro" });
    expect(lightAction).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(lightAction).toBeEnabled());
    await userEvent.keyboard(key);
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(onThemeChange.mock.calls).toEqual([["dark"], ["light"]]);
  });

  it.each(themes)("disabled com theme=%s bloqueia clique e teclado (%s)", async (theme, name) => {
    const onThemeChange = vi.fn();
    render(<ThemeToggleButton disabled theme={theme} onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button", { name });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    await userEvent.tab();
    await userEvent.keyboard("{Enter} ");
    expect(document.body).toHaveFocus();
    expect(onThemeChange).not.toHaveBeenCalled();
    expect(document.documentElement).not.toHaveClass("theme-transitioning");
  });

  it.each(
    themes
  )("durante a transição de theme=%s bloqueia reentrada e reabilita o botão (%s)", async (theme, name, nextTheme) => {
    const onThemeChange = vi.fn();
    render(<ThemeToggleButton theme={theme} onThemeChange={onThemeChange} />);
    const button = screen.getByRole("button", { name });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    expect(onThemeChange.mock.calls).toEqual([[nextTheme]]);
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    expect(onThemeChange.mock.calls).toEqual([[nextTheme], [nextTheme]]);
  });

  it("sem callback usa o tema interno e atualiza o nome da próxima ação", async () => {
    render(<ThemeToggleButton />);
    await userEvent.click(screen.getByRole("button", { name: "Alternar para tema escuro" }));
    const lightAction = screen.getByRole("button", { name: "Alternar para tema claro" });
    expect(lightAction).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(lightAction).toBeEnabled());
    await userEvent.click(lightAction);
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
