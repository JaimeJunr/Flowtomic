import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "./context";

describe("Context", () => {
  describe("Rótulos e locale em pt-BR", () => {
    it("mostra o percentual usado com vírgula decimal, no padrão pt-BR", () => {
      render(
        <Context maxTokens={200_000} usedTokens={50_000}>
          <ContextTrigger />
        </Context>
      );
      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("o cabeçalho compacta os tokens no padrão pt-BR (vírgula, não ponto)", () => {
      render(
        <Context maxTokens={200_000} open usedTokens={1_500}>
          <ContextContent>
            <ContextContentHeader />
          </ContextContent>
        </Context>
      );
      expect(screen.getByText("1,5 mil / 200 mil")).toBeInTheDocument();
    });

    it("o rodapé mostra 'Custo total' em vez de 'Total cost'", () => {
      render(
        <Context maxTokens={200_000} open usedTokens={0}>
          <ContextContent>
            <ContextContentFooter />
          </ContextContent>
        </Context>
      );
      expect(screen.getByText("Custo total")).toBeInTheDocument();
    });

    it("o uso de entrada mostra 'Entrada' em vez de 'Input'", () => {
      render(
        <Context maxTokens={200_000} usedTokens={100} usage={{ inputTokens: 100 }}>
          <ContextInputUsage />
        </Context>
      );
      expect(screen.getByText("Entrada")).toBeInTheDocument();
    });
  });
});

const MODELO = "anthropic/claude-sonnet-4";

describe("Context: uso detalhado", () => {
  it("o gatilho padrão é um botão com o percentual e o ícone nomeado", () => {
    render(
      <Context maxTokens={200_000} usedTokens={100_000}>
        <ContextTrigger />
      </Context>
    );
    expect(screen.getByRole("button", { name: /50%/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Uso do contexto do modelo" })).toBeInTheDocument();
  });

  it("o gatilho aceita filho próprio no lugar do botão padrão", () => {
    render(
      <Context maxTokens={200_000} usedTokens={100_000}>
        <ContextTrigger>
          <button type="button">Ver contexto</button>
        </ContextTrigger>
      </Context>
    );
    expect(screen.getByRole("button", { name: "Ver contexto" })).toBeInTheDocument();
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("passar o mouse no gatilho abre o painel com o uso", async () => {
    render(
      <Context maxTokens={200_000} usedTokens={100_000}>
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
        </ContextContent>
      </Context>
    );
    expect(screen.queryByText("100 mil / 200 mil")).not.toBeInTheDocument();
    await userEvent.hover(screen.getByRole("button", { name: /50%/ }));
    expect(await screen.findByText("100 mil / 200 mil")).toBeInTheDocument();
  });

  it("o cabeçalho mostra a barra de progresso com o percentual usado", () => {
    render(
      <Context maxTokens={200_000} open usedTokens={50_000}>
        <ContextContent>
          <ContextContentHeader />
        </ContextContent>
      </Context>
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("cabeçalho, corpo e rodapé aceitam conteúdo próprio", () => {
    render(
      <Context maxTokens={200_000} open usedTokens={50_000}>
        <ContextContent>
          <ContextContentHeader>Cabeçalho próprio</ContextContentHeader>
          <ContextContentBody>Corpo próprio</ContextContentBody>
          <ContextContentFooter>Rodapé próprio</ContextContentFooter>
        </ContextContent>
      </Context>
    );
    expect(screen.getByText("Cabeçalho próprio")).toBeInTheDocument();
    expect(screen.getByText("Corpo próprio")).toBeInTheDocument();
    expect(screen.getByText("Rodapé próprio")).toBeInTheDocument();
    expect(screen.queryByText("Custo total")).not.toBeInTheDocument();
  });

  it("o rodapé calcula o custo total em dólar a partir do modelo e do uso", () => {
    render(
      <Context
        maxTokens={2_000_000}
        modelId={MODELO}
        open
        usage={{ inputTokens: 1_000_000 } as never}
        usedTokens={1_000_000}
      >
        <ContextContent>
          <ContextContentFooter />
        </ContextContent>
      </Context>
    );
    expect(screen.getByText(/US\$\s3,00/)).toBeInTheDocument();
  });

  it("sem modelo, o custo total é zero", () => {
    render(
      <Context maxTokens={200_000} open usage={{ inputTokens: 500 } as never} usedTokens={500}>
        <ContextContent>
          <ContextContentFooter />
        </ContextContent>
      </Context>
    );
    expect(screen.getByText(/US\$\s0,00/)).toBeInTheDocument();
  });

  it("entrada, saída, raciocínio e cache mostram tokens compactados e custo", () => {
    render(
      <Context
        maxTokens={2_000_000}
        modelId={MODELO}
        usage={
          {
            inputTokens: 1_000_000,
            outputTokens: 2_000,
            reasoningTokens: 3_000,
            cachedInputTokens: 4_000,
          } as never
        }
        usedTokens={1_009_000}
      >
        <ContextInputUsage />
        <ContextOutputUsage />
        <ContextReasoningUsage />
        <ContextCacheUsage />
      </Context>
    );
    expect(screen.getByText("Entrada")).toBeInTheDocument();
    expect(screen.getByText(/1 mi/)).toBeInTheDocument();
    expect(screen.getByText("Saída")).toBeInTheDocument();
    expect(screen.getByText("Raciocínio")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
    expect(screen.getByText(/•\sUS\$\s3,00/)).toBeInTheDocument();
  });

  it("sem modelo, o custo de cada linha aparece como zero", () => {
    render(
      <Context
        maxTokens={200_000}
        usage={{ outputTokens: 2_000, reasoningTokens: 3_000, cachedInputTokens: 4_000 } as never}
        usedTokens={9_000}
      >
        <ContextOutputUsage />
        <ContextReasoningUsage />
        <ContextCacheUsage />
      </Context>
    );
    expect(screen.getAllByText(/•\sUS\$\s0,00/)).toHaveLength(3);
  });

  it("sem tokens naquela categoria, a linha não aparece", () => {
    const { container } = render(
      <Context maxTokens={200_000} usage={{} as never} usedTokens={0}>
        <ContextInputUsage />
        <ContextOutputUsage />
        <ContextReasoningUsage />
        <ContextCacheUsage />
      </Context>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("cada linha de uso aceita conteúdo próprio", () => {
    render(
      <Context maxTokens={200_000} usedTokens={0}>
        <ContextInputUsage>
          <span>entrada própria</span>
        </ContextInputUsage>
        <ContextOutputUsage>
          <span>saída própria</span>
        </ContextOutputUsage>
        <ContextReasoningUsage>
          <span>raciocínio próprio</span>
        </ContextReasoningUsage>
        <ContextCacheUsage>
          <span>cache próprio</span>
        </ContextCacheUsage>
      </Context>
    );
    for (const t of ["entrada própria", "saída própria", "raciocínio próprio", "cache próprio"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it("os subcomponentes avisam quando usados fora de <Context>", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<ContextContentHeader />)).toThrow(/within Context/);
    erro.mockRestore();
  });

  it("aberto, não tem violações automáticas de acessibilidade", async () => {
    const { baseElement } = render(
      <Context
        maxTokens={2_000_000}
        modelId={MODELO}
        open
        usage={{ inputTokens: 1_000 } as never}
        usedTokens={1_000}
      >
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
          <ContextContentBody>
            <ContextInputUsage />
          </ContextContentBody>
          <ContextContentFooter />
        </ContextContent>
      </Context>
    );
    // "region" é artefato do portal do HoverCard em teste.
    const result = await axe.run(baseElement, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
      },
    });
    expect(result.violations).toEqual([]);
  });

  it("a barra de progresso do cabeçalho tem nome acessível", () => {
    render(
      <Context maxTokens={2_000_000} modelId={MODELO} open usedTokens={500_000}>
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
        </ContextContent>
      </Context>
    );
    expect(screen.getByRole("progressbar", { name: "Uso do contexto" })).toBeInTheDocument();
  });
});
