import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, type MockInstance, vi } from "vitest";
import {
  Message,
  MessageAttachment,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "./message";

const spies: MockInstance[] = [];
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
});

describe("Message", () => {
  it("navega pelas versões com nomes e contador em pt-BR", async () => {
    const onBranchChange = vi.fn();
    render(
      <MessageBranch defaultBranch={1} onBranchChange={onBranchChange}>
        <MessageBranchContent>
          <p key="cabecalho">Use um botão no cabeçalho.</p>
          <p key="teclado">Ative a ordenação com Enter.</p>
          <p key="label">Dê um nome acessível à busca.</p>
        </MessageBranchContent>
        <MessageBranchSelector from="assistant">
          <MessageBranchPrevious />
          <MessageBranchPage />
          <MessageBranchNext />
        </MessageBranchSelector>
      </MessageBranch>
    );
    const previous = screen.getByRole("button", { name: "Versão anterior" });
    const next = screen.getByRole("button", { name: "Próxima versão" });
    expect(screen.getByText("2 de 3")).toHaveClass("font-mono", "text-muted-foreground");
    expect(screen.getByText("Ative a ordenação com Enter.")).toBeVisible();
    await userEvent.click(next);
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
    expect(screen.getByText("Dê um nome acessível à busca.")).toBeVisible();
    await userEvent.click(next);
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
    await userEvent.click(previous);
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
    expect(onBranchChange.mock.calls).toEqual([[2], [0], [2]]);
  });

  it("oculta os controles quando há apenas uma versão", () => {
    render(
      <MessageBranch>
        <MessageBranchContent>
          <p>Uma resposta sobre o DataTable.</p>
        </MessageBranchContent>
        <MessageBranchSelector from="assistant">
          <MessageBranchPrevious />
          <MessageBranchPage />
          <MessageBranchNext />
        </MessageBranchSelector>
      </MessageBranch>
    );
    expect(screen.getByText("Uma resposta sobre o DataTable.")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    { filename: undefined, label: "Imagem" },
    { filename: "data-table.png", label: "data-table.png" },
  ])("nomeia a imagem como $label", ({ filename, label }) => {
    render(
      <MessageAttachment
        data={{ type: "file", mediaType: "image/png", url: "/data-table.png", filename }}
      />
    );
    expect(screen.getByRole("img", { name: label })).toHaveAttribute("src", "/data-table.png");
  });

  it.each([
    { filename: undefined, label: "Anexo" },
    { filename: "data-table.test.tsx", label: "data-table.test.tsx" },
  ])("nomeia o arquivo e seu tooltip como $label", async ({ filename, label }) => {
    render(
      <MessageAttachment
        data={{ type: "file", mediaType: "text/plain", url: "/data-table.test.tsx", filename }}
      />
    );
    await userEvent.hover(screen.getByRole("img", { name: label }));
    expect(await screen.findByRole("tooltip", { name: label })).toBeInTheDocument();
  });

  it.each([
    "image/png",
    "text/plain",
  ])("permite remover o anexo %s pelo teclado sem depender do hover", async (mediaType) => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(
      <MessageAttachment
        data={{ type: "file", mediaType, url: "/data-table" }}
        onRemove={onRemove}
        onClick={onClick}
      />
    );
    const button = screen.getByRole("button", { name: "Remover anexo" });
    expect(screen.getByText("Remover")).toHaveClass("sr-only");
    expect(button).toHaveClass("focus-visible:opacity-100", "group-hover:opacity-100");
    expect(button.className).not.toMatch(/backdrop-blur/);
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("aplica bolha muted de 10px só à mensagem do usuário", () => {
    render(
      <>
        <Message from="user">
          <MessageContent>Como faço o DataTable ordenar pelo teclado?</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>Use um botão no cabeçalho da coluna.</MessageContent>
        </Message>
      </>
    );
    const user = screen.getByText("Como faço o DataTable ordenar pelo teclado?");
    const assistant = screen.getByText("Use um botão no cabeçalho da coluna.");
    expect(user.parentElement).toHaveClass("is-user");
    expect(user).toHaveClass("group-[.is-user]:bg-muted", "group-[.is-user]:rounded-[10px]");
    expect(assistant.parentElement).toHaveClass("is-assistant");
    expect(assistant.className).not.toMatch(
      /(?:^|\s)(?:bg-|rounded-)|group-\[\.is-assistant\]:(?:bg-|rounded-)/
    );
  });

  it("copia o código Markdown sem emitir log de debug", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    spies.push(writeText, log);
    render(<MessageResponse>{'```typescript\nconst nome = "data-table";\n```'}</MessageResponse>);
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('const nome = "data-table";\n'));
    expect(log).not.toHaveBeenCalled();
  });

  it("trata falha ao copiar sem emitir erro de debug", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Sem acesso à área de transferência"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    spies.push(writeText, error);
    render(<MessageResponse>{'```typescript\nconst nome = "data-table";\n```'}</MessageResponse>);
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });
});
