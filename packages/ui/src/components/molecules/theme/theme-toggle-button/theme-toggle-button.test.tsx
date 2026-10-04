import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type StartPosition, ThemeToggleButton } from "./theme-toggle-button";

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

// Nome claro: simula a View Transitions API do navegador, que o jsdom não tem.
type FakeViewTransition = {
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  ready: Promise<void>;
};
type DocumentWithTransition = {
  startViewTransition?: (callback: () => void) => FakeViewTransition | undefined;
};

function installFakeViewTransitions(returnsTransition = true) {
  const documentWithTransition = document as unknown as DocumentWithTransition;
  const startViewTransition = vi.fn((callback: () => void) => {
    callback();
    if (!returnsTransition) return undefined;
    return {
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      ready: Promise.resolve(),
    };
  });
  documentWithTransition.startViewTransition = startViewTransition;
  return {
    startViewTransition,
    uninstall: () => {
      delete documentWithTransition.startViewTransition;
    },
  };
}

const transitionStyle = () => document.head.querySelector("style[id^='theme-transition-']");

describe("ThemeToggleButton com View Transitions", () => {
  it("troca o tema dentro da transição do navegador e reabilita o botão no fim", async () => {
    const fake = installFakeViewTransitions();
    try {
      const onThemeChange = vi.fn();
      render(<ThemeToggleButton theme="light" onThemeChange={onThemeChange} />);
      const button = screen.getByRole("button", { name: "Alternar para tema escuro" });
      await userEvent.click(button);
      expect(fake.startViewTransition).toHaveBeenCalledTimes(1);
      expect(onThemeChange.mock.calls).toEqual([["dark"]]);
      await waitFor(() => expect(button).toBeEnabled());
      // não usa o fallback por classe quando a API existe
      expect(document.documentElement).not.toHaveClass("theme-transitioning");
    } finally {
      fake.uninstall();
    }
  });

  it("remove o estilo da animação depois que a transição termina", async () => {
    const fake = installFakeViewTransitions();
    try {
      render(<ThemeToggleButton theme="light" onThemeChange={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: "Alternar para tema escuro" }));
      expect(transitionStyle()).toBeInTheDocument();
      await waitFor(() => expect(transitionStyle()).not.toBeInTheDocument());
    } finally {
      fake.uninstall();
    }
  });

  it.each([
    ["center", "50% 50%"],
    ["top-left", "0% 0%"],
    ["top-right", "100% 0%"],
    ["bottom-left", "0% 100%"],
    ["bottom-right", "100% 100%"],
  ] as [StartPosition, string][])("start=%s abre o círculo em %s", async (start, origem) => {
    const fake = installFakeViewTransitions();
    try {
      render(<ThemeToggleButton theme="light" start={start} onThemeChange={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: "Alternar para tema escuro" }));
      expect(transitionStyle()?.textContent).toContain(`circle(0% at ${origem})`);
      await waitFor(() => expect(transitionStyle()).not.toBeInTheDocument());
    } finally {
      fake.uninstall();
    }
  });

  it("se o navegador não devolver a transição, reabilita o botão e limpa o estilo mesmo assim", async () => {
    const fake = installFakeViewTransitions(false);
    try {
      const onThemeChange = vi.fn();
      render(<ThemeToggleButton theme="dark" onThemeChange={onThemeChange} />);
      const button = screen.getByRole("button", { name: "Alternar para tema claro" });
      await userEvent.click(button);
      expect(onThemeChange.mock.calls).toEqual([["light"]]);
      expect(button).toBeDisabled();
      await waitFor(() => expect(button).toBeEnabled(), { timeout: 2000 });
      expect(transitionStyle()).not.toBeInTheDocument();
    } finally {
      fake.uninstall();
    }
  });

  it("sem tema nem callback, a transição também alterna o tema interno", async () => {
    const fake = installFakeViewTransitions();
    try {
      render(<ThemeToggleButton />);
      await userEvent.click(screen.getByRole("button", { name: "Alternar para tema escuro" }));
      const claro = await screen.findByRole("button", { name: "Alternar para tema claro" });
      await waitFor(() => expect(claro).toBeEnabled());
    } finally {
      fake.uninstall();
    }
  });
});

describe("ThemeToggleButton, tema do sistema e tamanhos", () => {
  it("sem a prop theme, começa no escuro quando o sistema prefere escuro", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      render(<ThemeToggleButton />);
      expect(screen.getByRole("button", { name: "Alternar para tema claro" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    } finally {
      window.matchMedia = original;
    }
  });

  it("sem a prop theme e com o sistema claro, começa no claro", () => {
    render(<ThemeToggleButton />);
    expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("a prop theme vale mais que a preferência do sistema", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      render(<ThemeToggleButton theme="light" />);
      expect(screen.getByRole("button", { name: "Alternar para tema escuro" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    } finally {
      window.matchMedia = original;
    }
  });

  it.each([
    ["sm", "16"],
    ["md", "24"],
    ["lg", "24"],
    ["icon", "24"],
  ] as const)("size=%s desenha os ícones com %spx", (size, px) => {
    render(<ThemeToggleButton size={size} theme="light" />);
    const icones = screen.getByRole("button").querySelectorAll("svg");
    expect(icones).toHaveLength(2);
    for (const icone of icones) {
      expect(icone).toHaveAttribute("width", px);
    }
  });

  it("className chega ao botão", () => {
    render(<ThemeToggleButton className="minha-classe" theme="light" />);
    expect(screen.getByRole("button")).toHaveClass("minha-classe");
  });

  it("não tem violações de acessibilidade nos dois temas", async () => {
    const { container, rerender } = render(<ThemeToggleButton theme="light" />);
    const claro = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(claro.violations).toEqual([]);
    rerender(<ThemeToggleButton theme="dark" />);
    const escuro = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(escuro.violations).toEqual([]);
  });
});
