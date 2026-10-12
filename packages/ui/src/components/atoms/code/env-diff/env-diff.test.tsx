import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { EnvDiff, type EnvDiffLine, parseEnvDiff } from "./env-diff";

const linhas: EnvDiffLine[] = [
  { type: "removed", name: "CHART_LIB_KEY" },
  { type: "removed", name: "TABLE_LIB_KEY" },
  { type: "context", name: "NODE_ENV", value: "production" },
  { type: "added", name: "FLOWTOMIC_REGISTRY_URL", value: "https://exemplo.dev/r" },
];

function definirClipboard(writeText: ((texto: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterEach(() => {
  vi.unstubAllGlobals();
  definirClipboard(undefined);
});

describe("EnvDiff", () => {
  it("renderiza uma li por linha com data-type, sinal e texto para leitor de tela", () => {
    const { container } = render(<EnvDiff lines={linhas} />);
    const itens = container.querySelectorAll("li[data-slot='env-diff-line']");
    expect(itens).toHaveLength(4);
    expect(Array.from(itens).map((li) => li.getAttribute("data-type"))).toEqual([
      "removed",
      "removed",
      "context",
      "added",
    ]);
    expect(itens[0]).toHaveTextContent("Removido: CHART_LIB_KEY");
    expect(itens[3]).toHaveTextContent("Adicionado: FLOWTOMIC_REGISTRY_URL");
    expect(itens[2]).not.toHaveTextContent("Removido");
    expect(itens[2]).not.toHaveTextContent("Adicionado");
    expect(itens[0].querySelector("[aria-hidden='true']")).toHaveTextContent("-");
    expect(itens[3].querySelector("[aria-hidden='true']")).toHaveTextContent("+");
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("mostra NOME=valor e esconde o valor mascarado dizendo valor oculto", () => {
    render(
      <EnvDiff
        lines={[
          { type: "added", name: "A", value: "um" },
          { type: "added", name: "SEGREDO", value: "sk-123", masked: true },
        ]}
      />
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("A=um");
    expect(itens[1]).toHaveTextContent("SEGREDO=");
    expect(itens[1]).toHaveTextContent("valor oculto");
    expect(itens[1]).not.toHaveTextContent("sk-123");
  });

  it("fade={false} troca o degradê por fundo chapado", () => {
    const { container, rerender } = render(<EnvDiff lines={linhas} />);
    const removida = () => container.querySelector("li[data-type='removed']") as HTMLElement;
    expect(removida().className).toContain("linear-gradient");
    rerender(<EnvDiff lines={linhas} fade={false} />);
    expect(removida().className).not.toContain("linear-gradient");
    expect(removida().className).toContain("color-mix(in_oklch,var(--destructive)_14%");
    const contexto = container.querySelector("li[data-type='context']") as HTMLElement;
    expect(contexto.className).not.toContain("color-mix(in_oklch,var(--destructive)_14%");
  });

  it("copyable copia só adicionadas e contexto, sem sinal, e chama onCopy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);
    const onCopy = vi.fn();
    render(<EnvDiff lines={linhas} copyable onCopy={onCopy} />);
    const botao = screen.getByRole("button", { name: "Copiar resultado" });
    expect(botao).toHaveAttribute("data-slot", "env-diff-copy");
    await act(async () => {
      fireEvent.click(botao);
    });
    const esperado = "NODE_ENV=production\nFLOWTOMIC_REGISTRY_URL=https://exemplo.dev/r";
    expect(writeText).toHaveBeenCalledWith(esperado);
    expect(onCopy).toHaveBeenCalledWith(esperado);
    expect(botao.querySelector("svg")).toHaveClass("lucide-check");
  });

  it("clipboard que rejeita anuncia que não deu para copiar", async () => {
    definirClipboard(vi.fn().mockRejectedValue(new Error("negado")));
    const onCopy = vi.fn();
    render(<EnvDiff lines={linhas} copyable onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar resultado" }));
    });
    await waitFor(() => expect(screen.getByText("Não deu para copiar")).toBeInTheDocument());
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("sem botão quando copyable não é passado", () => {
    render(<EnvDiff lines={linhas} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("animate com movimento reduzido mostra tudo sem esperar", () => {
    class FakeIO {
      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <EnvDiff lines={linhas} animate />
      </MotionConfig>
    );
    for (const li of container.querySelectorAll("li")) {
      expect((li as HTMLElement).style.opacity).not.toBe("0");
    }
  });

  it("animate sem IntersectionObserver mostra tudo", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<EnvDiff lines={linhas} animate />);
    for (const li of container.querySelectorAll("li")) {
      expect((li as HTMLElement).style.opacity).not.toBe("0");
    }
  });

  it("animate com observer começa escondido e revela quando entra na tela", async () => {
    let callback: IntersectionObserverCallback = () => {};
    class FakeIO {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const { container } = render(<EnvDiff lines={linhas} animate />);
    const primeira = container.querySelector("li") as HTMLElement;
    expect(primeira.style.opacity).toBe("0");
    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    await waitFor(() => expect(primeira.style.opacity).not.toBe("0"));
  });

  it("label customizado vira o aria-label do grupo", () => {
    render(<EnvDiff lines={linhas} label="Migração das chaves" />);
    expect(screen.getByRole("group", { name: "Migração das chaves" })).toBeInTheDocument();
  });

  it("rótulo padrão e data-slot na raiz; ref chega à raiz", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<EnvDiff lines={linhas} ref={ref} />);
    const grupo = screen.getByRole("group", { name: "Diferença nas variáveis de ambiente" });
    expect(grupo).toHaveAttribute("data-slot", "env-diff");
    expect(ref.current).toBe(grupo);
  });
});

describe("parseEnvDiff", () => {
  it("lê removidas, adicionadas e contexto, separa no primeiro = e ignora linhas vazias", () => {
    const texto = "- A=1\n\n+ B=x=y\n  C=3\n   \nSOLTA\n+ SEM_VALOR";
    expect(parseEnvDiff(texto)).toEqual([
      { type: "removed", name: "A", value: "1" },
      { type: "added", name: "B", value: "x=y" },
      { type: "context", name: "C", value: "3" },
      { type: "context", name: "SOLTA" },
      { type: "added", name: "SEM_VALOR" },
    ]);
  });
});
