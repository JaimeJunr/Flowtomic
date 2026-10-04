import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewConsole,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "./web-preview";

const logs = [
  { level: "log" as const, message: "app iniciado", timestamp: new Date(2026, 8, 26, 14, 5, 9) },
];

describe("WebPreviewConsole", () => {
  it("mostra o horário do log em pt-BR (24h, sem AM/PM)", async () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={logs} />
      </WebPreview>
    );
    await userEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(screen.getByText("14:05:09")).toBeInTheDocument();
  });

  it("não usa o formato en-US (com AM/PM) para o horário do log", async () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={logs} />
      </WebPreview>
    );
    await userEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });

  it("sem logs, diz quando o console vai aparecer", async () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={[]} />
      </WebPreview>
    );
    await userEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(
      screen.getByText("O console aparece aqui quando a página registrar algo.")
    ).toBeInTheDocument();
  });

  it("mostra os logs normalmente quando a prop 'logs' é preenchida (não usa a instrução de estado vazio)", async () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={logs} />
      </WebPreview>
    );
    await userEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(
      screen.queryByText("O console aparece aqui quando a página registrar algo.")
    ).not.toBeInTheDocument();
  });
});

describe("WebPreviewNavigationButton", () => {
  it("tem aria-label descritivo baseado no texto do tooltip", () => {
    render(
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton tooltip="Abrir em nova aba">
            <span>icon</span>
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
      </WebPreview>
    );
    expect(screen.getByRole("button", { name: "Abrir em nova aba" })).toBeInTheDocument();
  });

  it("permite sobrescrever o aria-label explicitamente, mesmo com tooltip definido", () => {
    render(
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton aria-label="Recarregar página" tooltip="Reload">
            <span>icon</span>
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
      </WebPreview>
    );
    expect(screen.getByRole("button", { name: "Recarregar página" })).toBeInTheDocument();
  });
});

describe("WebPreviewUrl", () => {
  describe("Placeholder em pt-BR", () => {
    it("mostra 'Digite a URL...' quando nenhum placeholder é passado", () => {
      render(
        <WebPreview>
          <WebPreviewUrl />
        </WebPreview>
      );
      expect(screen.getByPlaceholderText("Digite a URL...")).toBeInTheDocument();
    });
  });
});

describe("WebPreview: navegação e iframe", () => {
  it("o iframe carrega a defaultUrl, tem título e roda em sandbox", () => {
    render(
      <WebPreview defaultUrl="https://exemplo.dev/app">
        <WebPreviewBody />
      </WebPreview>
    );
    const quadro = screen.getByTitle("Pré-visualização");
    expect(quadro).toHaveAttribute("src", "https://exemplo.dev/app");
    expect(quadro).toHaveAttribute("sandbox", expect.stringContaining("allow-scripts"));
  });

  it("sem URL, o iframe não recebe src; com src próprio, ele vence a URL do preview", () => {
    const { unmount } = render(
      <WebPreview>
        <WebPreviewBody />
      </WebPreview>
    );
    expect(screen.getByTitle("Pré-visualização")).not.toHaveAttribute("src");
    unmount();
    render(
      <WebPreview defaultUrl="https://a.dev">
        <WebPreviewBody src="https://b.dev" />
      </WebPreview>
    );
    expect(screen.getByTitle("Pré-visualização")).toHaveAttribute("src", "https://b.dev");
  });

  it("mostra o conteúdo de carregamento ao lado do iframe", () => {
    render(
      <WebPreview>
        <WebPreviewBody loading={<p>Carregando página…</p>} />
      </WebPreview>
    );
    expect(screen.getByText("Carregando página…")).toBeInTheDocument();
  });

  it("Enter no campo de URL navega o iframe e avisa onUrlChange", async () => {
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    render(
      <WebPreview defaultUrl="https://a.dev" onUrlChange={aoMudar}>
        <WebPreviewNavigation>
          <WebPreviewUrl aria-label="Endereço" />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    );
    const campo = screen.getByRole("textbox", { name: "Endereço" });
    await user.clear(campo);
    await user.type(campo, "https://b.dev");
    expect(aoMudar).not.toHaveBeenCalled();
    expect(screen.getByTitle("Pré-visualização")).toHaveAttribute("src", "https://a.dev");
    await user.keyboard("{Enter}");
    expect(aoMudar).toHaveBeenCalledWith("https://b.dev");
    expect(screen.getByTitle("Pré-visualização")).toHaveAttribute("src", "https://b.dev");
  });

  it("o campo de URL repassa onKeyDown do chamador", async () => {
    const user = userEvent.setup();
    const aoTecla = vi.fn();
    render(
      <WebPreview>
        <WebPreviewUrl aria-label="Endereço" onKeyDown={aoTecla} />
      </WebPreview>
    );
    await user.type(screen.getByRole("textbox", { name: "Endereço" }), "a");
    expect(aoTecla).toHaveBeenCalled();
  });

  it("com value controlado, o campo mostra o valor recebido", () => {
    render(
      <WebPreview defaultUrl="https://a.dev">
        <WebPreviewUrl aria-label="Endereço" onChange={() => {}} value="https://fixo.dev" />
      </WebPreview>
    );
    expect(screen.getByRole("textbox", { name: "Endereço" })).toHaveValue("https://fixo.dev");
  });

  it("passar só onChange (sem value) não congela o texto digitado no campo", async () => {
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    render(
      <WebPreview>
        <WebPreviewUrl aria-label="Endereço" onChange={aoMudar} />
      </WebPreview>
    );
    await user.type(screen.getByRole("textbox", { name: "Endereço" }), "abc");
    expect(screen.getByRole("textbox", { name: "Endereço" })).toHaveValue("abc");
    expect(aoMudar).toHaveBeenCalledTimes(3);
  });

  it("o botão de navegação dispara onClick e respeita disabled", async () => {
    const user = userEvent.setup();
    const aoClicar = vi.fn();
    render(
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton onClick={aoClicar} tooltip="Recarregar">
            R
          </WebPreviewNavigationButton>
          <WebPreviewNavigationButton disabled onClick={aoClicar} tooltip="Voltar">
            V
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
      </WebPreview>
    );
    await user.click(screen.getByRole("button", { name: "Recarregar" }));
    expect(aoClicar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();
  });

  it("o tooltip do botão aparece ao focar com o teclado", async () => {
    const user = userEvent.setup();
    render(
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton tooltip="Recarregar">R</WebPreviewNavigationButton>
        </WebPreviewNavigation>
      </WebPreview>
    );
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Recarregar");
  });

  it("peças fora do WebPreview lançam erro explicando o uso", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<WebPreviewBody />)).toThrow(
      "WebPreview components must be used within a WebPreview"
    );
    erro.mockRestore();
  });
});

describe("WebPreviewConsole: níveis e conteúdo extra", () => {
  const agora = new Date(2026, 8, 26, 9, 0, 0);
  const todos = [
    { level: "log" as const, message: "ok", timestamp: agora },
    { level: "warn" as const, message: "atenção", timestamp: new Date(2026, 8, 26, 9, 0, 1) },
    { level: "error" as const, message: "falhou", timestamp: new Date(2026, 8, 26, 9, 0, 2) },
  ];

  it("começa recolhido e o botão Console abre e fecha a lista", async () => {
    const user = userEvent.setup();
    render(
      <WebPreview>
        <WebPreviewConsole logs={todos} />
      </WebPreview>
    );
    const botao = screen.getByRole("button", { name: "Console" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("falhou")).not.toBeInTheDocument();
    await user.click(botao);
    expect(screen.getByText("falhou")).toBeInTheDocument();
    await user.click(botao);
    expect(screen.queryByText("falhou")).not.toBeInTheDocument();
  });

  it("destaca erro e aviso e deixa o log comum na cor normal", async () => {
    const user = userEvent.setup();
    render(
      <WebPreview>
        <WebPreviewConsole logs={todos}>
          <p>Fim do console</p>
        </WebPreviewConsole>
      </WebPreview>
    );
    await user.click(screen.getByRole("button", { name: "Console" }));
    expect(screen.getByText("falhou").closest("div")).toHaveClass("text-destructive");
    expect(screen.getByText("atenção").closest("div")).toHaveClass("text-warning");
    expect(screen.getByText("ok").closest("div")).toHaveClass("text-foreground");
    expect(screen.getByText("Fim do console")).toBeInTheDocument();
  });
});

describe("WebPreview: acessibilidade", () => {
  // O axe não consegue inspecionar o <iframe> no jsdom ("Respondable target must be a
  // frame"), então o corpo fica de fora; o título do iframe é coberto no teste de navegação.
  it("barra de navegação e console não têm violações de acessibilidade", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WebPreview defaultUrl="https://a.dev">
        <WebPreviewNavigation>
          <WebPreviewNavigationButton tooltip="Recarregar">R</WebPreviewNavigationButton>
          <WebPreviewUrl aria-label="Endereço" />
        </WebPreviewNavigation>
        <WebPreviewConsole logs={todosOsLogs} />
      </WebPreview>
    );
    await user.click(screen.getByRole("button", { name: "Console" }));
    const resultado = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});

const todosOsLogs = [{ level: "log" as const, message: "ok", timestamp: new Date(2026, 8, 26) }];
