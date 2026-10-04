import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentEditor, type DocumentPage } from "./document-editor";

describe("DocumentEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 14, 5, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra o horário da última edição em pt-BR (24h, sem AM/PM)", () => {
    render(<DocumentEditor />);
    expect(screen.getByText("Última edição: 14:05:09")).toBeInTheDocument();
  });

  it("não usa o formato en-US (com AM/PM) para a última edição", () => {
    render(<DocumentEditor />);
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });
});

// jsdom não implementa medição de layout; o ProseMirror precisa disso para digitar.
const original = {
  elementFromPoint: document.elementFromPoint,
  getClientRects: Element.prototype.getClientRects,
  rangeRects: Range.prototype.getClientRects,
  rangeBox: Range.prototype.getBoundingClientRect,
};
const semRetangulos = () => [] as unknown as DOMRectList;
beforeAll(() => {
  document.elementFromPoint = () => null;
  Element.prototype.getClientRects = semRetangulos;
  Range.prototype.getClientRects = semRetangulos;
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
});
afterAll(() => {
  document.elementFromPoint = original.elementFromPoint;
  Element.prototype.getClientRects = original.getClientRects;
  Range.prototype.getClientRects = original.rangeRects;
  Range.prototype.getBoundingClientRect = original.rangeBox;
});

const editores = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>('[contenteditable="true"]'));

const duasPaginas: DocumentPage[] = [
  { id: "a", content: "um dois três" },
  { id: "b", content: "quatro" },
];

function Controlado({ readOnly = false }: { readOnly?: boolean }) {
  const [pages, setPages] = useState(duasPaginas);
  const [active, setActive] = useState(0);
  return (
    <DocumentEditor
      activePage={active}
      onActivePageChange={setActive}
      onPagesChange={setPages}
      pages={pages}
      readOnly={readOnly}
    />
  );
}

describe("DocumentEditor: título, páginas e modos", () => {
  it("começa com título padrão e uma página, e o título é editável", async () => {
    const onTitleChange = vi.fn();
    render(<DocumentEditor onTitleChange={onTitleChange} />);
    const titulo = screen.getByPlaceholderText("Documento sem título");
    expect(titulo).toHaveValue("Documento sem título");
    expect(screen.getByText("1 página")).toBeInTheDocument();
    await userEvent.type(titulo, "!");
    expect(titulo).toHaveValue("Documento sem título!");
    expect(onTitleChange).toHaveBeenLastCalledWith("Documento sem título!");
  });

  it("título controlado vem da prop", () => {
    render(<DocumentEditor title="Relatório" />);
    expect(screen.getByDisplayValue("Relatório")).toBeInTheDocument();
  });

  it("somente leitura trava o título e as ações de página", () => {
    render(<DocumentEditor readOnly />);
    expect(screen.getByPlaceholderText("Documento sem título")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Adicionar página/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Remover página/ })).toBeDisabled();
  });

  it("conta páginas, palavras e caracteres do conteúdo", () => {
    render(<DocumentEditor pages={duasPaginas.map((p) => ({ ...p, content: "um dois três" }))} />);
    expect(screen.getByText("2 páginas")).toBeInTheDocument();
    expect(screen.getByText("6 palavras · 24 caracteres")).toBeInTheDocument();
  });

  it("Adicionar página cria e vai para a nova; Remover volta e não deixa zerar", async () => {
    const onPagesChange = vi.fn();
    render(<DocumentEditor onPagesChange={onPagesChange} />);
    expect(screen.getByRole("button", { name: /Remover página/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Adicionar página/ }));
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    expect(onPagesChange).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object)]));
    await userEvent.click(screen.getByRole("button", { name: /Remover página/ }));
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
    expect(screen.getByText("1 página")).toBeInTheDocument();
  });

  it("Remover a última página ajusta a página ativa para a anterior", async () => {
    render(<Controlado />);
    await userEvent.click(screen.getByRole("button", { name: /Próxima/ }));
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Remover página/ }));
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("Anterior e Próxima navegam e se desabilitam nas pontas", async () => {
    const onActivePageChange = vi.fn();
    render(<DocumentEditor onActivePageChange={onActivePageChange} pages={duasPaginas} />);
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Próxima/ }));
    expect(onActivePageChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Próxima/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Anterior/ }));
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("página ativa fora do intervalo é corrigida e avisada", () => {
    const onActivePageChange = vi.fn();
    render(
      <DocumentEditor activePage={9} onActivePageChange={onActivePageChange} pages={duasPaginas} />
    );
    expect(onActivePageChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("sem páginas, não renderiza nada", () => {
    const { container } = render(<DocumentEditor pages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("modo Contínuo mostra todas as páginas e esconde a navegação", async () => {
    const onViewModeChange = vi.fn();
    render(<DocumentEditor onViewModeChange={onViewModeChange} pages={duasPaginas} />);
    await userEvent.click(screen.getByRole("button", { name: /Contínuo/ }));
    expect(onViewModeChange).toHaveBeenCalledWith("continuous");
    expect(screen.getByText("Página 1")).toBeInTheDocument();
    expect(screen.getByText("Página 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Próxima/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover página/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Paginado/ }));
    expect(onViewModeChange).toHaveBeenLastCalledWith("single");
  });

  it("no modo Contínuo, Remover tira aquela página", async () => {
    const onPagesChange = vi.fn();
    render(
      <DocumentEditor onPagesChange={onPagesChange} pages={duasPaginas} viewMode="continuous" />
    );
    await userEvent.click(screen.getAllByRole("button", { name: /^Remover$/ })[0]);
    expect(onPagesChange).toHaveBeenCalledWith([duasPaginas[1]]);
  });

  it("no modo Contínuo, somente leitura ou página única não oferece Remover", () => {
    const { rerender } = render(
      <DocumentEditor pages={duasPaginas} readOnly viewMode="continuous" />
    );
    expect(screen.queryByRole("button", { name: /^Remover$/ })).not.toBeInTheDocument();
    rerender(<DocumentEditor pages={[duasPaginas[0]]} viewMode="continuous" />);
    expect(screen.queryByRole("button", { name: /^Remover$/ })).not.toBeInTheDocument();
  });

  it("digitar na página ativa atualiza o conteúdo, as estatísticas e avisa onPagesChange", async () => {
    const onPagesChange = vi.fn();
    const { container } = render(<DocumentEditor onPagesChange={onPagesChange} />);
    await userEvent.type(editores(container)[0], "ola");
    await waitFor(() => expect(onPagesChange).toHaveBeenCalled());
    expect(screen.getByText(/3 caracteres/)).toBeInTheDocument();
  });

  it("no modo Contínuo, digitar numa página atualiza só aquela", async () => {
    const onPagesChange = vi.fn();
    const { container } = render(
      <DocumentEditor onPagesChange={onPagesChange} pages={duasPaginas} viewMode="continuous" />
    );
    await userEvent.type(editores(container)[1], " cinco");
    await waitFor(() => expect(onPagesChange).toHaveBeenCalled());
    const novas = onPagesChange.mock.calls.at(-1)?.[0] as DocumentPage[];
    expect(novas[0].content).toBe("um dois três");
    expect(novas[1].content).toContain("cinco");
  });

  it("somente leitura não deixa o editor da página editável", async () => {
    const onPagesChange = vi.fn();
    const { container } = render(
      <DocumentEditor onPagesChange={onPagesChange} pages={duasPaginas} readOnly />
    );
    expect(editores(container)).toHaveLength(0);
    expect(onPagesChange).not.toHaveBeenCalled();
  });

  it("não tem violações automáticas de acessibilidade", async () => {
    const { container } = render(<DocumentEditor pages={duasPaginas} />);
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('estatísticas flexionam o singular ("1 palavra · 1 caractere")', () => {
    render(<DocumentEditor pages={[{ id: "p1", content: "a" }]} />);
    expect(screen.getByText("1 palavra · 1 caractere")).toBeInTheDocument();
  });

  it("o editor de cada página é nomeado pelo número da página", async () => {
    // O TipTap monta a área editável depois do primeiro render
    const { unmount } = render(<DocumentEditor pages={duasPaginas} />);
    expect(await screen.findByRole("textbox", { name: "Página 1" })).toBeInTheDocument();
    unmount();
    render(<DocumentEditor pages={duasPaginas} viewMode="continuous" />);
    expect(await screen.findByRole("textbox", { name: "Página 1" })).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Página 2" })).toBeInTheDocument();
  });
});
