import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
