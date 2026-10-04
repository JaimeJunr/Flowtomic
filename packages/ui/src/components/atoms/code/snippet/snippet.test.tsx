import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Snippet, SnippetCopyButton } from "./snippet";

function definirClipboard(writeText: ((texto: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

describe("Snippet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    definirClipboard(undefined);
  });

  it("mostra o texto em linha por padrão, sem bloco pre", () => {
    const { container } = render(<Snippet>npm install</Snippet>);
    expect(screen.getByText("npm install")).toBeInTheDocument();
    expect(container.querySelector("pre")).toBeNull();
  });

  it("na variante multiline mostra o código dentro de um bloco pre", () => {
    const { container } = render(<Snippet variant="multiline">{"linha 1\nlinha 2"}</Snippet>);
    expect(container.querySelector("pre")).toHaveTextContent(/linha 1\s*linha 2/);
  });

  it("sem botão de copiar não renderiza a área de ações", () => {
    render(<Snippet>ls</Snippet>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("copiar põe o código na área de transferência e mostra Copiado", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);
    const onCopy = vi.fn();
    render(
      <Snippet>
        git status
        <SnippetCopyButton onCopy={onCopy} />
      </Snippet>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });

    expect(writeText).toHaveBeenCalledWith("git status");
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();
  });

  it("depois do tempo configurado o botão volta a dizer Copiar código", async () => {
    definirClipboard(vi.fn().mockResolvedValue(undefined));
    render(
      <Snippet>
        ls
        <SnippetCopyButton timeout={500} />
      </Snippet>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
  });

  it("sem API de área de transferência avisa o erro e não marca Copiado", async () => {
    definirClipboard(undefined);
    const onCopyError = vi.fn();
    render(
      <Snippet>
        ls
        <SnippetCopyButton onCopyError={onCopyError} />
      </Snippet>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });

    expect(onCopyError).toHaveBeenCalledTimes(1);
    expect(onCopyError.mock.calls[0][0].message).toMatch(/Clipboard API/);
    expect(screen.queryByRole("button", { name: "Copiado" })).not.toBeInTheDocument();
  });

  it("se a escrita na área de transferência falha, repassa o erro e não marca Copiado", async () => {
    const falha = new Error("negado");
    definirClipboard(vi.fn().mockRejectedValue(falha));
    const onCopyError = vi.fn();
    render(
      <Snippet>
        ls
        <SnippetCopyButton onCopyError={onCopyError} />
      </Snippet>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });

    expect(onCopyError).toHaveBeenCalledWith(falha);
    expect(screen.queryByRole("button", { name: "Copiado" })).not.toBeInTheDocument();
  });

  it("filhos que são elementos (como code) entram no texto copiado", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);
    render(
      <Snippet>
        <code>pnpm dev</code>
        <SnippetCopyButton />
      </Snippet>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });
    expect(writeText).toHaveBeenCalledWith("pnpm dev");
  });
});
