import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstallCommand } from "./install-command";

const CHAVE = "flowtomic:package-manager";

function definirClipboard(writeText: ((texto: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  vi.useRealTimers();
  definirClipboard(undefined);
  window.localStorage.clear();
});

describe("InstallCommand", () => {
  it("renderiza o grupo nomeado com prompt aria-hidden e o comando", () => {
    render(<InstallCommand command="npx flowtomic-cli add button" />);
    const grupo = screen.getByRole("group", { name: "Comando de instalação" });
    expect(grupo).toHaveAttribute("data-slot", "install-command");
    expect(screen.getByText("$")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("npx flowtomic-cli add button")).toBeInTheDocument();
  });

  it("prompt null esconde o prompt", () => {
    render(<InstallCommand command="ls" prompt={null} />);
    expect(screen.queryByText("$")).not.toBeInTheDocument();
  });

  it("usa o label customizado no grupo", () => {
    render(<InstallCommand command="ls" label="Instalar" />);
    expect(screen.getByRole("group", { name: "Instalar" })).toBeInTheDocument();
  });

  it("copia só o comando, chama onCopy, anuncia e volta depois do tempo", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);
    const onCopy = vi.fn();
    render(<InstallCommand command="npm install @flowtomic/ui" onCopy={onCopy} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar comando" }));
    });

    expect(writeText).toHaveBeenCalledWith("npm install @flowtomic/ui");
    expect(onCopy).toHaveBeenCalledWith("npm install @flowtomic/ui");
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();
    expect(screen.getByText("Comando copiado")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: "Copiar comando" })).toBeInTheDocument();
    expect(screen.queryByText("Comando copiado")).not.toBeInTheDocument();
  });

  it("clipboard que rejeita chama onCopyError e anuncia a falha", async () => {
    const erro = new Error("negado");
    definirClipboard(vi.fn().mockRejectedValue(erro));
    const onCopyError = vi.fn();
    render(<InstallCommand command="ls" onCopyError={onCopyError} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar comando" }));
    });

    expect(onCopyError).toHaveBeenCalledWith(erro);
    expect(screen.getByText("Não deu para copiar")).toBeInTheDocument();
  });

  it("sem Clipboard API chama onCopyError", async () => {
    definirClipboard(undefined);
    const onCopyError = vi.fn();
    render(<InstallCommand command="ls" onCopyError={onCopyError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar comando" }));
    });
    expect(onCopyError).toHaveBeenCalledTimes(1);
  });

  it("size muda data-size e comando longo tem title com o texto inteiro", () => {
    const longo = "npx flowtomic-cli add button card dialog dropdown-menu select tabs tooltip";
    render(<InstallCommand command={longo} size="lg" />);
    expect(screen.getByRole("group")).toHaveAttribute("data-size", "lg");
    expect(screen.getByText(longo)).toHaveAttribute("title", longo);
  });
});

describe("InstallCommand com gerenciadores", () => {
  const gerenciadores = ["npm", "pnpm", "yarn", "bun"] as const;

  async function escolher(nome: string) {
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: "Gerenciador de pacotes" }));
    await user.click(await screen.findByRole("option", { name: nome }));
  }

  it("trocar para pnpm muda o texto exibido e o copiado e avisa onManagerChange", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onManagerChange = vi.fn();
    render(
      <InstallCommand
        command="npm install @flowtomic/ui"
        managers={[...gerenciadores]}
        onManagerChange={onManagerChange}
      />
    );
    expect(screen.getByText("npm install @flowtomic/ui")).toBeInTheDocument();

    await escolher("pnpm");

    expect(onManagerChange).toHaveBeenCalledWith("pnpm");
    expect(screen.getByText("pnpm add @flowtomic/ui")).toBeInTheDocument();
    // userEvent.setup() troca o clipboard; o stub entra depois da escolha
    definirClipboard(writeText);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar comando" }));
    });
    expect(writeText).toHaveBeenCalledWith("pnpm add @flowtomic/ui");
  });

  it("controlado sem manager novo não muda o texto", async () => {
    render(
      <InstallCommand
        command="npm install @flowtomic/ui"
        managers={[...gerenciadores]}
        manager="npm"
      />
    );
    await escolher("bun");
    expect(screen.getByText("npm install @flowtomic/ui")).toBeInTheDocument();
  });

  it("defaultManager define o gerenciador inicial", () => {
    render(
      <InstallCommand
        command="npx flowtomic-cli add button"
        managers={[...gerenciadores]}
        defaultManager="bun"
      />
    );
    expect(screen.getByText("bunx flowtomic-cli add button")).toBeInTheDocument();
  });

  it("persistManager grava a escolha e lê a chave ao montar", async () => {
    const { unmount } = render(
      <InstallCommand
        command="npm install @flowtomic/ui"
        managers={[...gerenciadores]}
        persistManager
      />
    );
    await escolher("yarn");
    expect(window.localStorage.getItem(CHAVE)).toBe("yarn");
    unmount();

    render(
      <InstallCommand
        command="npm install @flowtomic/ui"
        managers={[...gerenciadores]}
        persistManager
      />
    );
    await waitFor(() => expect(screen.getByText("yarn add @flowtomic/ui")).toBeInTheDocument());
  });

  it("ignora valor guardado fora da lista de gerenciadores", () => {
    window.localStorage.setItem(CHAVE, "deno");
    render(<InstallCommand command="npm install x" managers={["npm", "pnpm"]} persistManager />);
    expect(screen.getByText("npm install x")).toBeInTheDocument();
  });

  it("localStorage que lança erro não quebra o componente", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    render(
      <InstallCommand
        command="npm install @flowtomic/ui"
        managers={[...gerenciadores]}
        persistManager
      />
    );
    await escolher("pnpm");
    expect(screen.getByText("pnpm add @flowtomic/ui")).toBeInTheDocument();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
