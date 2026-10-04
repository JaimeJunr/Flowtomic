import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock, CodeBlockCopyButton } from "./code-block";

function definirClipboard(writeText: ((texto: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  definirClipboard(undefined);
});

describe("CodeBlock", () => {
  it("destaca o código com o shiki e mostra o texto na tela", async () => {
    const { container } = render(<CodeBlock code={"const x = 1;"} language="typescript" />);
    await waitFor(() => expect(container.querySelector("pre.shiki")).not.toBeNull());
    expect(container).toHaveTextContent("const x = 1;");
  });

  it("com showLineNumbers numera cada linha", async () => {
    const { container } = render(
      <CodeBlock code={"a\nb\nc"} language="javascript" showLineNumbers />
    );
    await waitFor(() => expect(container.querySelector("pre.shiki")).not.toBeNull());
    const numeros = Array.from(container.querySelectorAll(".select-none")).map(
      (n) => n.textContent
    );
    expect(numeros).toEqual(expect.arrayContaining(["1", "2", "3"]));
  });

  it("sem showLineNumbers não aparece numeração", async () => {
    const { container } = render(<CodeBlock code={"a\nb"} language="javascript" />);
    await waitFor(() => expect(container.querySelector("pre.shiki")).not.toBeNull());
    expect(container.querySelector(".select-none")).toBeNull();
  });

  it("maxHeight limita a altura e liga a rolagem", () => {
    const { container } = render(<CodeBlock code="x" language="javascript" maxHeight={120} />);
    const raiz = container.firstElementChild as HTMLElement;
    expect(raiz.style.maxHeight).toBe("120px");
    expect(raiz).toHaveClass("overflow-auto");
  });

  it("sem maxHeight nem showScrollbars o conteúdo é cortado, sem rolagem", () => {
    const { container } = render(<CodeBlock code="x" language="javascript" />);
    const raiz = container.firstElementChild as HTMLElement;
    expect(raiz.style.maxHeight).toBe("");
    expect(raiz).toHaveClass("overflow-hidden");
  });

  it("showScrollbars liga a rolagem mesmo sem maxHeight", () => {
    const { container } = render(<CodeBlock code="x" language="javascript" showScrollbars />);
    expect(container.firstElementChild).toHaveClass("overflow-auto");
  });

  it("copiar põe o código inteiro na área de transferência e chama onCopy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);
    const onCopy = vi.fn();
    render(
      <CodeBlock code="echo oi" language="bash">
        <CodeBlockCopyButton onCopy={onCopy} aria-label="Copiar" />
      </CodeBlock>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });
    expect(writeText).toHaveBeenCalledWith("echo oi");
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("sem API de área de transferência chama onError e não chama onCopy", async () => {
    definirClipboard(undefined);
    const onError = vi.fn();
    const onCopy = vi.fn();
    render(
      <CodeBlock code="x" language="bash">
        <CodeBlockCopyButton onError={onError} onCopy={onCopy} aria-label="Copiar" />
      </CodeBlock>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });
    expect(onError.mock.calls[0][0].message).toMatch(/Clipboard API/);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("quando a escrita falha repassa o erro original", async () => {
    const falha = new Error("negado");
    definirClipboard(vi.fn().mockRejectedValue(falha));
    const onError = vi.fn();
    render(
      <CodeBlock code="x" language="bash">
        <CodeBlockCopyButton onError={onError} aria-label="Copiar" />
      </CodeBlock>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });
    expect(onError).toHaveBeenCalledWith(falha);
  });

  it("sem filhos não renderiza a área de ações", () => {
    render(<CodeBlock code="x" language="bash" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("mostra o código em texto puro enquanto o realce não chega, sem piscar vazio", () => {
    const { container } = render(<CodeBlock code="const x = 1;" language="typescript" />);
    expect(container.querySelector("pre.shiki")).toBeNull();
    expect(container.querySelector("[data-slot=code-block-fallback]")).toHaveTextContent(
      "const x = 1;"
    );
  });

  it("mostra a linguagem no cabeçalho, junto das ações", () => {
    render(
      <CodeBlock code="echo oi" language="bash">
        <CodeBlockCopyButton />
      </CodeBlock>
    );
    const cabecalho = screen.getByText("bash").closest("[data-slot=code-block-header]");
    expect(cabecalho).not.toBeNull();
    expect(cabecalho).toContainElement(screen.getByRole("button", { name: "Copiar código" }));
  });

  it("o botão diz Copiado depois de copiar e volta sozinho", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    definirClipboard(vi.fn().mockResolvedValue(undefined));
    render(
      <CodeBlock code="echo oi" language="bash">
        <CodeBlockCopyButton timeout={1000} />
      </CodeBlock>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    });
    expect(screen.getByRole("button", { name: "Copiado" })).toHaveTextContent("Copiado");
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("linguagem que o realce não conhece fica em texto puro, sem quebrar", async () => {
    const { container } = render(<CodeBlock code="x := 1" language="text" />);
    await waitFor(() => expect(container.querySelector("pre.shiki")).not.toBeNull());
    expect(container).toHaveTextContent("x := 1");
  });

  it("com showLanguage desligado e sem ações, não desenha cabeçalho", () => {
    const { container } = render(<CodeBlock code="{}" language="json" showLanguage={false} />);
    expect(container.querySelector("[data-slot=code-block-header]")).toBeNull();
  });

  it("linha comprida rola de lado em vez de ser cortada", async () => {
    const { container } = render(
      <CodeBlock code={"bunx vitest run ".repeat(20)} language="bash" />
    );
    expect(container.querySelector("[data-slot=code-block-fallback]")).toHaveClass(
      "overflow-x-auto"
    );
    await waitFor(() => expect(container.querySelector("pre.shiki")).not.toBeNull());
    expect(container.querySelector("pre.shiki")?.parentElement).toHaveClass(
      "[&>pre]:overflow-x-auto"
    );
  });
});
