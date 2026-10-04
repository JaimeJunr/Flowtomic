import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInItem,
  OpenInLabel,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
} from "./open-in-chat";

describe("OpenIn", () => {
  describe("Rótulos em pt-BR", () => {
    it("o gatilho padrão mostra 'Abrir no chat'", () => {
      render(
        <OpenIn open query="bug no registry:build">
          <OpenInTrigger />
          <OpenInContent>
            <OpenInClaude />
          </OpenInContent>
        </OpenIn>
      );
      expect(screen.getByText("Abrir no chat")).toBeInTheDocument();
    });

    it("cada provedor mostra 'Abrir no <Provedor>' em vez de 'Open in <Provider>'", () => {
      render(
        <OpenIn open query="bug no registry:build">
          <OpenInTrigger />
          <OpenInContent>
            <OpenInClaude />
            <OpenInT3 />
          </OpenInContent>
        </OpenIn>
      );
      expect(screen.getByText("Abrir no Claude")).toBeInTheDocument();
      expect(screen.getByText("Abrir no T3 Chat")).toBeInTheDocument();
    });
  });
});

describe("OpenIn: links para cada chat", () => {
  const consulta = "erro no build: 100% & mais";

  const abrir = (extra?: React.ReactNode) =>
    render(
      <OpenIn open query={consulta}>
        <OpenInTrigger />
        <OpenInContent>
          <OpenInLabel>Perguntar em</OpenInLabel>
          <OpenInChatGPT />
          <OpenInClaude />
          <OpenInT3 />
          <OpenInSeparator />
          {extra}
        </OpenInContent>
      </OpenIn>
    );

  it("o link do Claude leva a consulta codificada na URL e abre em nova aba", () => {
    abrir();
    const link = screen.getByRole("menuitem", { name: /Abrir no Claude/ });
    const url = new URL(link.getAttribute("href") as string);
    expect(url.origin + url.pathname).toBe("https://claude.ai/new");
    expect(url.searchParams.get("q")).toBe(consulta);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("o link do ChatGPT pede busca e leva a consulta como prompt", () => {
    abrir();
    const link = screen.getByRole("menuitem", { name: /Abrir no ChatGPT/ });
    const url = new URL(link.getAttribute("href") as string);
    expect(url.origin).toBe("https://chatgpt.com");
    expect(url.searchParams.get("hints")).toBe("search");
    expect(url.searchParams.get("prompt")).toBe(consulta);
  });

  it("o link do T3 Chat leva a consulta em q", () => {
    abrir();
    const link = screen.getByRole("menuitem", { name: /Abrir no T3 Chat/ });
    const url = new URL(link.getAttribute("href") as string);
    expect(url.origin + url.pathname).toBe("https://t3.chat/new");
    expect(url.searchParams.get("q")).toBe(consulta);
  });

  it("mostra rótulo e aceita itens próprios, que disparam onSelect", async () => {
    const user = userEvent.setup();
    const aoEscolher = vi.fn();
    abrir(<OpenInItem onSelect={aoEscolher}>Copiar prompt</OpenInItem>);
    expect(screen.getByText("Perguntar em")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Copiar prompt" }));
    expect(aoEscolher).toHaveBeenCalledTimes(1);
  });

  it("começa fechado, o gatilho abre o menu e Esc devolve o foco ao gatilho", async () => {
    const user = userEvent.setup();
    render(
      <OpenIn query="oi">
        <OpenInTrigger />
        <OpenInContent>
          <OpenInClaude />
        </OpenInContent>
      </OpenIn>
    );
    const gatilho = screen.getByRole("button", { name: "Abrir no chat" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(gatilho);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });

  it("abre pelo teclado e navega até o item com as setas", async () => {
    const user = userEvent.setup();
    render(
      <OpenIn query="oi">
        <OpenInTrigger />
        <OpenInContent>
          <OpenInClaude />
          <OpenInT3 />
        </OpenInContent>
      </OpenIn>
    );
    screen.getByRole("button", { name: "Abrir no chat" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Abrir no T3 Chat/ })).toHaveFocus();
  });

  it("aceita um gatilho próprio no lugar do botão padrão", () => {
    render(
      <OpenIn query="oi">
        <OpenInTrigger>
          <button type="button">Perguntar fora</button>
        </OpenInTrigger>
      </OpenIn>
    );
    expect(screen.getByRole("button", { name: "Perguntar fora" })).toBeInTheDocument();
    expect(screen.queryByText("Abrir no chat")).not.toBeInTheDocument();
  });

  it.each([
    ["OpenInChatGPT", OpenInChatGPT],
    ["OpenInClaude", OpenInClaude],
    ["OpenInT3", OpenInT3],
  ])("%s fora do OpenIn lança erro explicando o uso", (_nome, Item) => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Item />)).toThrow(
      "OpenIn components must be used within an OpenIn provider"
    );
    erro.mockRestore();
  });

  it("o menu aberto não tem violações de acessibilidade", async () => {
    abrir();
    const resultado = await axe.run(screen.getByRole("menu"), {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});
