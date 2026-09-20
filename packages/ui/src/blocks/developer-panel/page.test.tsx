import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DeveloperPanel from "./page";

const health = { status: "UP", timestamp: "2026-09-20T17:52:22Z", service: "api-service" };
const systemInfo = { name: "Flowtomic App", version: "1.0.0", description: "" };
const environmentInfo = {
  apiBaseUrl: "http://localhost:8080/api",
  nodeEnv: "development",
  timestamp: "2026-09-20T17:52:22Z",
  userAgent: "Mozilla/5.0",
  screenResolution: "2560x1440",
  timezone: "America/Sao_Paulo",
};

describe("DeveloperPanel", () => {
  describe("Veredito do ambiente", () => {
    it("diz que a API está no ar quando o health check responde UP", () => {
      render(<DeveloperPanel health={health} systemInfo={systemInfo} />);
      expect(screen.getByText("API no ar")).toBeInTheDocument();
    });

    it("diz que a API está fora do ar quando o health check responde DOWN", () => {
      render(<DeveloperPanel health={{ ...health, status: "DOWN" }} />);
      expect(screen.getByText("API fora do ar")).toBeInTheDocument();
    });

    it("sem health check, diz que não houve resposta e aponta a URL a conferir", () => {
      render(<DeveloperPanel health={null} apiBaseUrl="http://localhost:8080/api" />);
      expect(screen.getByText("Sem resposta")).toBeInTheDocument();
      expect(screen.getByText(/localhost:8080\/api\/health/)).toBeInTheDocument();
    });
  });

  describe("Leitura densa, sem vitrine de cards", () => {
    it("não repete o título como subtítulo em nenhuma seção", () => {
      render(
        <DeveloperPanel health={health} systemInfo={systemInfo} environmentInfo={environmentInfo} />
      );
      for (const redundante of [
        "Informações da sessão atual",
        "Health check da API",
        "Versão e detalhes do sistema",
        "Configurações do cliente",
        "Informações do cliente web",
      ]) {
        expect(screen.queryByText(redundante)).not.toBeInTheDocument();
      }
    });

    it("expõe usuário, ambiente e navegador como listas de definição", () => {
      render(
        <DeveloperPanel
          user={{ username: "dev.user", email: "dev.user@localhost", role: "admin" }}
          environmentInfo={environmentInfo}
        />
      );
      // <dt> tem role "term", mas o nome acessível não vem do conteúdo — checa a tag direto
      expect(screen.getByText("usuário").tagName).toBe("DT");
      expect(screen.getByText("dev.user").tagName).toBe("DD");
      expect(screen.getByText("America/Sao_Paulo")).toBeInTheDocument();
    });
  });

  describe("Atalhos", () => {
    it("são links de texto, não botões com emoji", () => {
      render(<DeveloperPanel apiBaseUrl="http://localhost:8080/api" />);
      expect(screen.getByRole("link", { name: /swagger ui/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /health check/i })).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2764}]/u);
    });
  });

  describe("Estados de borda", () => {
    it("mostra a mensagem de carregamento", () => {
      render(<DeveloperPanel loading />);
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    it("mostra o erro recebido", () => {
      render(<DeveloperPanel error="Falha ao buscar o sistema" />);
      expect(screen.getByText("Falha ao buscar o sistema")).toBeInTheDocument();
    });
  });
});

describe("DeveloperPanel — o que a tela faz", () => {
  const apiBaseUrl = "http://localhost:8080/api";

  it("deriva as URLs dos atalhos a partir da base da API", () => {
    render(<DeveloperPanel apiBaseUrl={apiBaseUrl} />);
    expect(screen.getByRole("link", { name: /swagger ui/i })).toHaveAttribute(
      "href",
      "http://localhost:8080/swagger-ui.html"
    );
    expect(screen.getByRole("link", { name: /openapi/i })).toHaveAttribute(
      "href",
      "http://localhost:8080/v3/api-docs"
    );
    expect(screen.getByRole("link", { name: /health check/i })).toHaveAttribute(
      "href",
      "http://localhost:8080/api/health"
    );
  });

  it("com callback customizado, o atalho chama o callback em vez de navegar", async () => {
    const onOpenSwagger = vi.fn();
    render(<DeveloperPanel apiBaseUrl={apiBaseUrl} onOpenSwagger={onOpenSwagger} />);
    const link = screen.getByRole("link", { name: /swagger ui/i });
    await userEvent.click(link);
    expect(onOpenSwagger).toHaveBeenCalledOnce();
    // o href continua lá — a semântica de link (abrir em nova aba, copiar endereço) não se perde
    expect(link).toHaveAttribute("href", "http://localhost:8080/swagger-ui.html");
  });

  it("copia o token para a área de transferência e confirma no botão", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<DeveloperPanel user={{ username: "dev.user", token: "eyJhbGci.token" }} />);

    await userEvent.click(screen.getByRole("button", { name: /copiar token/i }));

    expect(writeText).toHaveBeenCalledWith("eyJhbGci.token");
    // o botão troca de ícone (Copy → Check) mas mantém o nome acessível
    expect(screen.getByRole("button", { name: /copiar token/i })).toBeInTheDocument();
  });

  it("a aba Editor de scripts abre o editor", async () => {
    render(<DeveloperPanel scriptEditorProps={{ defaultScript: "1 + 1" }} />);
    await userEvent.click(screen.getByRole("tab", { name: /editor de scripts/i }));
    expect(await screen.findByText("script.groovy")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("1 + 1");
  });
});
