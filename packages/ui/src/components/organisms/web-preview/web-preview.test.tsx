import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  WebPreview,
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
