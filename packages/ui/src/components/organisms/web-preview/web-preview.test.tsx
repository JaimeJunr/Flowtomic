import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WebPreview, WebPreviewConsole, WebPreviewUrl } from "./web-preview";

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

  it("mostra 'Nenhuma saída no console' em vez de 'No console output' quando não há logs", async () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={[]} />
      </WebPreview>
    );
    await userEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(screen.getByText("Nenhuma saída no console")).toBeInTheDocument();
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
