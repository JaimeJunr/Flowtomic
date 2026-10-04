import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { CopyIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "./artifact";

describe("Artifact", () => {
  it("usa contêiner com régua e cantos de 10px sem sombra em repouso", () => {
    const { container } = render(
      <Artifact>
        <ArtifactContent>6 testes, todos passando</ArtifactContent>
      </Artifact>
    );
    expect(screen.getByText("6 testes, todos passando")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("border-border", "rounded-[10px]");
    expect(container.firstElementChild?.className).not.toMatch(/\bshadow(?:-\S+)?\b/);
  });

  it("separa o cabeçalho com borda e fundo de superfície", () => {
    render(
      <ArtifactHeader>
        <ArtifactTitle>data-table.test.tsx</ArtifactTitle>
      </ArtifactHeader>
    );
    expect(screen.getByText("data-table.test.tsx").parentElement).toHaveClass(
      "bg-surface",
      "border-b",
      "border-border"
    );
  });

  it("nomeia a ação Fechar em pt-BR e preserva o callback", async () => {
    const onClick = vi.fn();
    render(<ArtifactClose onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Fechar" });
    expect(button).toHaveAttribute("aria-label", "Fechar");
    expect(screen.getByText("Fechar")).toHaveClass("sr-only");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Artifact, peças e ações", () => {
  it("título e descrição aparecem no cabeçalho", () => {
    render(
      <ArtifactHeader>
        <div>
          <ArtifactTitle>data-table.test.tsx</ArtifactTitle>
          <ArtifactDescription>6 testes, todos passando</ArtifactDescription>
        </div>
      </ArtifactHeader>
    );
    expect(screen.getByText("data-table.test.tsx")).toBeInTheDocument();
    expect(screen.getByText("6 testes, todos passando")).toBeInTheDocument();
  });

  it("className e atributos de cada peça chegam ao elemento", () => {
    render(
      <Artifact className="a" aria-label="Resultado">
        <ArtifactHeader className="h">cabeçalho</ArtifactHeader>
        <ArtifactActions className="x">ações</ArtifactActions>
        <ArtifactContent className="c">conteúdo</ArtifactContent>
      </Artifact>
    );
    expect(screen.getByLabelText("Resultado")).toHaveClass("a", "flex-col");
    expect(screen.getByText("cabeçalho")).toHaveClass("h");
    expect(screen.getByText("ações")).toHaveClass("x", "flex");
    expect(screen.getByText("conteúdo")).toHaveClass("c", "overflow-auto");
  });

  it("Fechar aceita conteúdo próprio, mas continua com o nome Fechar", () => {
    render(<ArtifactClose>x</ArtifactClose>);
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveTextContent("x");
  });

  it("Fechar desabilitado não dispara o callback", async () => {
    const onClick = vi.fn();
    render(<ArtifactClose disabled onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("ação com ícone e rótulo é um botão nomeado e dispara o clique", async () => {
    const onClick = vi.fn();
    render(<ArtifactAction icon={CopyIcon} label="Copiar resultado" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Copiar resultado" });
    expect(button.querySelector("svg")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ação sem ícone mostra o conteúdo que a pessoa passar", () => {
    render(<ArtifactAction label="Baixar">⬇</ArtifactAction>);
    expect(screen.getByRole("button", { name: /Baixar/ })).toHaveTextContent("⬇");
  });

  it("com ícone, o conteúdo filho é ignorado", () => {
    render(
      <ArtifactAction icon={CopyIcon} label="Copiar">
        texto-ignorado
      </ArtifactAction>
    );
    expect(screen.queryByText("texto-ignorado")).not.toBeInTheDocument();
  });

  it("o rótulo vence a dica quando os dois existem, e a dica serve de nome sozinha", () => {
    const { unmount } = render(
      <ArtifactAction
        icon={CopyIcon}
        label="Copiar"
        tooltip="Copiar para a área de transferência"
      />
    );
    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
    unmount();
    render(<ArtifactAction icon={CopyIcon} tooltip="Compartilhar" />);
    expect(screen.getByRole("button", { name: "Compartilhar" })).toBeInTheDocument();
  });

  it("com dica, ela aparece quando o botão recebe foco pelo teclado", async () => {
    render(<ArtifactAction icon={CopyIcon} tooltip="Copiar resultado" />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Copiar resultado" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Copiar resultado");
  });

  it("sem dica, nada de tooltip aparece no foco", async () => {
    render(<ArtifactAction icon={CopyIcon} label="Copiar" />);
    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade com título, ações e fechar", async () => {
    const { container } = render(
      <Artifact aria-label="Resultado dos testes" role="region">
        <ArtifactHeader>
          <ArtifactTitle>data-table.test.tsx</ArtifactTitle>
          <ArtifactActions>
            <ArtifactAction icon={CopyIcon} tooltip="Copiar resultado" />
            <ArtifactClose />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent>6 testes</ArtifactContent>
      </Artifact>
    );
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
