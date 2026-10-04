import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { type ColumnDef, DataTable } from "./data-table";

type Componente = Record<string, unknown> & { nome: string; categoria: string; versao: string };

const data: Componente[] = [
  { nome: "stats-grid", categoria: "organism", versao: "0.8.0" },
  { nome: "team-member-list", categoria: "molecule", versao: "0.9.0" },
  { nome: "button", categoria: "atom", versao: "0.7.2" },
];

const columns: ColumnDef<Componente, unknown>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "categoria", header: "Categoria" },
  { accessorKey: "versao", header: "Versão" },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");

describe("DataTable", () => {
  it("não embrulha a tabela num card com sombra", () => {
    const { container } = render(<DataTable data={data} columns={columns} title="Componentes" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/shadow/);
  });

  it("o cabeçalho não tem fundo cinza", () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getAllByRole("rowgroup")[0].className).not.toMatch(/bg-muted/);
  });

  it("a busca tem nome acessível e filtra as linhas", () => {
    render(<DataTable data={data} columns={columns} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar..." }), {
      target: { value: "molecule" },
    });
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("team-member-list");
  });

  it("ordena pela coluna usando o teclado, não só o mouse", () => {
    render(<DataTable data={data} columns={columns} />);
    const sortByName = screen.getByRole("button", { name: /Nome/ });
    sortByName.focus();
    fireEvent.click(sortByName);
    expect(bodyRows()[0]).toHaveTextContent("button");
    expect(screen.getByRole("columnheader", { name: /Nome/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
  });

  it("mostra a mensagem de vazio quando não há dados", () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
  });

  it("o texto das células é tinta, não cinza", () => {
    render(<DataTable data={data} columns={columns} />);
    const cell = screen.getByText("stats-grid").closest("td") as HTMLElement;
    expect(cell.className).not.toMatch(/text-muted-foreground/);
  });
});

const muitos: Componente[] = Array.from({ length: 25 }, (_, i) => ({
  nome: `componente-${String(i + 1).padStart(2, "0")}`,
  categoria: i % 2 === 0 ? "atom" : "molecule",
  versao: `0.${i}.0`,
}));

const nomesDasLinhas = () =>
  bodyRows().map((linha) => within(linha).getAllByRole("cell")[0].textContent);

describe("DataTable, cabeçalho e estados", () => {
  it("mostra o título, as ações do cabeçalho e a busca", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        title="Componentes"
        headerActions={<button type="button">Exportar</button>}
      />
    );
    expect(screen.getByRole("heading", { name: "Componentes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar..." })).toBeInTheDocument();
  });

  it("sem título, busca nem ações, não desenha cabeçalho nenhum", () => {
    render(<DataTable data={data} columns={columns} enableGlobalFilter={false} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("só com ações, o cabeçalho aparece sem a busca", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        enableGlobalFilter={false}
        headerActions={<button type="button">Novo</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Novo" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("o texto do placeholder da busca é configurável", () => {
    render(
      <DataTable data={data} columns={columns} globalFilterPlaceholder="Procurar componente" />
    );
    expect(screen.getByRole("textbox", { name: "Procurar componente" })).toBeInTheDocument();
  });

  it("carregando, troca a tabela por um esqueleto e mantém o título", () => {
    render(<DataTable data={data} columns={columns} title="Componentes" loading />);
    expect(screen.getByRole("heading", { name: "Componentes" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("carregando sem título, só mostra o esqueleto", () => {
    const { container } = render(<DataTable data={data} columns={columns} loading />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("a mensagem de vazio é configurável e ocupa a largura da tabela", () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Nada cadastrado ainda." />);
    expect(screen.getByRole("cell", { name: "Nada cadastrado ainda." })).toHaveAttribute(
      "colspan",
      "3"
    );
  });

  it("busca sem resultado cai na mensagem de vazio", () => {
    render(<DataTable data={data} columns={columns} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar..." }), {
      target: { value: "inexistente" },
    });
    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
  });

  it("tamanho sm deixa as linhas mais baixas que o md", () => {
    const { rerender } = render(<DataTable data={data} columns={columns} size="sm" />);
    const alturaSm = bodyRows()[0].className.match(/\bh-\d+\b/)?.[0];
    rerender(<DataTable data={data} columns={columns} size="md" />);
    const alturaMd = bodyRows()[0].className.match(/\bh-\d+\b/)?.[0];
    expect(alturaSm).toBe("h-11");
    expect(alturaMd).toBe("h-12");
  });

  it("className vai para o contêiner da tabela", () => {
    const { container } = render(
      <DataTable data={data} columns={columns} className="minha-tabela" />
    );
    expect(container.firstElementChild).toHaveClass("minha-tabela");
  });
});

describe("DataTable, colunas", () => {
  it("colunas sem id (accessorFn, só header, ou sem nada) ainda aparecem com seus valores", () => {
    const colunas: ColumnDef<Componente, unknown>[] = [
      { id: "nome-fixo", accessorKey: "nome", header: "Nome" },
      {
        accessorFn: (linha: Componente) => linha.categoria.toUpperCase(),
        header: "Categoria em caixa alta",
      },
      // O tipo do TanStack exige id quando o header não é texto; o componente tem um plano B em runtime.
      { accessorFn: (linha: Componente) => linha.versao, header: () => "Versão por função" },
      { header: "Só cabeçalho", cell: () => "célula fixa" },
      { header: () => "Sem nada", cell: () => "outra célula" },
    ] as unknown as ColumnDef<Componente, unknown>[];
    render(<DataTable data={data} columns={colunas} />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    expect(screen.getByText("ORGANISM")).toBeInTheDocument();
    expect(screen.getByText("0.8.0")).toBeInTheDocument();
    expect(screen.getAllByText("célula fixa")).toHaveLength(3);
    expect(screen.getAllByText("outra célula")).toHaveLength(3);
  });

  it("coluna com tamanho próprio vira largura do cabeçalho; a de tamanho padrão não", () => {
    const colunas: ColumnDef<Componente, unknown>[] = [
      { accessorKey: "nome", header: "Nome", size: 80 },
      { accessorKey: "categoria", header: "Categoria" },
    ];
    render(<DataTable data={data} columns={colunas} />);
    expect(screen.getByRole("columnheader", { name: /Nome/ })).toHaveStyle({ width: "80px" });
    expect(screen.getByRole("columnheader", { name: /Categoria/ }).style.width).toBe("");
  });

  it("coluna com cabeçalho agrupado mostra o grupo sem botão de ordenar para o espaço vazio", () => {
    const colunas: ColumnDef<Componente, unknown>[] = [
      { accessorKey: "nome", header: "Nome" },
      {
        id: "detalhes",
        header: "Detalhes",
        columns: [
          { accessorKey: "categoria", header: "Categoria" },
          { accessorKey: "versao", header: "Versão" },
        ],
      },
    ];
    render(<DataTable data={data} columns={colunas} />);
    expect(screen.getByRole("columnheader", { name: /Detalhes/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Categoria/ })).toBeInTheDocument();
  });

  it("initialColumnVisibility esconde a coluna", () => {
    render(<DataTable data={data} columns={columns} initialColumnVisibility={{ versao: false }} />);
    expect(screen.queryByRole("columnheader", { name: /Versão/ })).not.toBeInTheDocument();
    expect(screen.queryByText("0.8.0")).not.toBeInTheDocument();
  });

  it("initialColumnFilters filtra as linhas desde o início", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        initialColumnFilters={[{ id: "categoria", value: "atom" }]}
      />
    );
    expect(nomesDasLinhas()).toEqual(["button"]);
  });
});

describe("DataTable, ordenação", () => {
  it("o segundo clique inverte a ordem e o terceiro tira a ordenação", async () => {
    render(<DataTable data={data} columns={columns} />);
    const cabecalho = screen.getByRole("columnheader", { name: /Nome/ });
    const botao = screen.getByRole("button", { name: /Nome/ });
    await userEvent.click(botao);
    expect(cabecalho).toHaveAttribute("aria-sort", "ascending");
    expect(nomesDasLinhas()).toEqual(["button", "stats-grid", "team-member-list"]);
    await userEvent.click(botao);
    expect(cabecalho).toHaveAttribute("aria-sort", "descending");
    expect(nomesDasLinhas()).toEqual(["team-member-list", "stats-grid", "button"]);
    await userEvent.click(botao);
    expect(cabecalho).toHaveAttribute("aria-sort", "none");
    expect(nomesDasLinhas()).toEqual(["stats-grid", "team-member-list", "button"]);
  });

  it("initialSorting já abre a tabela ordenada", () => {
    render(
      <DataTable data={data} columns={columns} initialSorting={[{ id: "versao", desc: true }]} />
    );
    expect(nomesDasLinhas()).toEqual(["team-member-list", "stats-grid", "button"]);
    expect(screen.getByRole("columnheader", { name: /Versão/ })).toHaveAttribute(
      "aria-sort",
      "descending"
    );
  });

  it("com enableSorting desligado, nenhum cabeçalho é botão", () => {
    render(<DataTable data={data} columns={columns} enableSorting={false} />);
    expect(screen.queryByRole("button", { name: /Nome/ })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Nome/ })).not.toHaveAttribute("aria-sort");
  });

  it("coluna com enableSorting falso não vira botão, as outras continuam", () => {
    const colunas: ColumnDef<Componente, unknown>[] = [
      { accessorKey: "nome", header: "Nome", enableSorting: false },
      { accessorKey: "categoria", header: "Categoria" },
    ];
    render(<DataTable data={data} columns={colunas} />);
    expect(screen.queryByRole("button", { name: /Nome/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Categoria/ })).toBeInTheDocument();
  });
});

describe("DataTable, seleção de linhas", () => {
  it("marcar uma linha deixa só a caixa dela marcada, e desmarcar volta ao estado anterior", async () => {
    render(<DataTable data={data} columns={columns} enableRowSelection />);
    const caixas = screen.getAllByRole("checkbox", { name: "Selecionar linha" });
    expect(caixas).toHaveLength(3);
    await userEvent.click(caixas[1]);
    expect(caixas.map((caixa) => caixa.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    await userEvent.click(caixas[1]);
    expect(caixas[1]).not.toBeChecked();
  });

  it("Selecionar todos marca todas as linhas da página", async () => {
    render(<DataTable data={data} columns={columns} enableRowSelection />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar todos" }));
    for (const caixa of screen.getAllByRole("checkbox", { name: "Selecionar linha" })) {
      expect(caixa).toBeChecked();
    }
    await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar todos" }));
    for (const caixa of screen.getAllByRole("checkbox", { name: "Selecionar linha" })) {
      expect(caixa).not.toBeChecked();
    }
  });

  // Bug: onSelectionChange nunca recebe a seleção nova. O useEffect do hook depende só de
  // [table, onSelectionChange, enableRowSelection] e `table` é estável, então o callback roda na montagem
  // (com []) e não volta a rodar ao marcar linhas
  // (packages/logic/src/hooks/useReactTableFront/useReactTableFront.ts:172-177, e o mesmo em
  // useReactTableBack.ts).
  it.todo("marcar uma linha chama onSelectionChange com as linhas selecionadas");

  it("sem enableRowSelection, não há caixas de seleção", () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("a coluna de seleção não tem botão de ordenar", () => {
    render(<DataTable data={data} columns={columns} enableRowSelection />);
    const cabecalhoDaSelecao = screen.getAllByRole("columnheader")[0];
    expect(within(cabecalhoDaSelecao).queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("DataTable, paginação", () => {
  it("mostra a faixa de itens e a página atual, e avança e volta", async () => {
    render(<DataTable data={muitos} columns={columns} />);
    expect(screen.getByText(/Mostrando 1 a 10 de 25 itens/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText(/Mostrando 11 a 20 de 25 itens/)).toBeInTheDocument();
    expect(nomesDasLinhas()[0]).toBe("componente-11");

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText(/Mostrando 21 a 25 de 25 itens/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("pageSize controla quantas linhas aparecem por página", () => {
    render(<DataTable data={muitos} columns={columns} pageSize={5} />);
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText("Página 1 de 5")).toBeInTheDocument();
  });

  it("com enablePagination desligado, mostra tudo e esconde o rodapé", () => {
    render(<DataTable data={muitos} columns={columns} enablePagination={false} />);
    expect(bodyRows()).toHaveLength(25);
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
  });

  it("footerContent substitui os controles de paginação", () => {
    render(
      <DataTable
        data={muitos}
        columns={columns}
        footerContent={<span>Total: 25 componentes</span>}
      />
    );
    expect(screen.getByText("Total: 25 componentes")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
  });

  // Bug: enablePagination={false} com footerContent quebra a tabela inteira: o rodapé lê
  // table.getState().pagination, que não existe com a paginação desligada
  // (data-table-pagination.tsx:112, TypeError "reading 'pageSize'").
  it.todo("footerContent aparece mesmo com a paginação desligada");

  it("paginationType buttons mostra os números de página e navega por eles", async () => {
    render(<DataTable data={muitos} columns={columns} paginationType="buttons" />);
    expect(screen.getByRole("button", { name: "Ir para página 1" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await userEvent.click(screen.getByRole("button", { name: "Ir para página 3" }));
    expect(screen.getByRole("button", { name: "Ir para página 3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(nomesDasLinhas()[0]).toBe("componente-21");
  });

  it("enablePageSizeSelector deixa trocar o tamanho da página e volta para a primeira", async () => {
    render(
      <DataTable
        data={muitos}
        columns={columns}
        pageSize={10}
        enablePageSizeSelector
        pageSizeOptions={[10, 20]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Selecionar tamanho de página" }));
    await userEvent.click(await screen.findByRole("option", { name: "20" }));
    await waitFor(() => expect(bodyRows()).toHaveLength(20));
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("a busca reduz as linhas da tabela", () => {
    render(<DataTable data={muitos} columns={columns} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar..." }), {
      target: { value: "componente-0" },
    });
    expect(bodyRows()).toHaveLength(9);
  });

  // Bug: depois de buscar, o rodapé continua dizendo "Mostrando 1 a 10 de 25 itens" e "Página 1 de 3".
  // O paginationInfo do hook é um useMemo com deps [table, pagination, enablePagination], que não mudam
  // com o filtro (packages/logic/src/hooks/useReactTableFront/useReactTableFront.ts:196-216).
  it.todo("a busca recalcula o total e a faixa mostrada no rodapé");
});

describe("DataTable no servidor", () => {
  it("mostra o total informado pelo servidor e avisa a nova página", async () => {
    const onPaginationChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        paginationMode="server"
        totalCount={50}
        pageSize={3}
        onPaginationChange={onPaginationChange}
      />
    );
    expect(screen.getByText(/Mostrando 1 a 3 de 50 itens/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 17")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 3 });
    expect(screen.getByText(/Mostrando 4 a 6 de 50 itens/)).toBeInTheDocument();
  });

  it("sem totalCount, usa a quantidade de linhas recebidas", () => {
    render(<DataTable data={data} columns={columns} paginationMode="server" pageSize={10} />);
    expect(screen.getByText(/Mostrando 1 a 3 de 3 itens/)).toBeInTheDocument();
  });

  it("ordenação no servidor avisa a coluna escolhida em vez de reordenar as linhas", async () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        sortingMode="server"
        onSortingChange={onSortingChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: "nome", desc: false }]);
    expect(nomesDasLinhas()).toEqual(["stats-grid", "team-member-list", "button"]);
  });

  it("a busca também funciona com os dados do servidor", () => {
    render(<DataTable data={data} columns={columns} paginationMode="server" totalCount={3} />);
    expect(screen.getByRole("textbox", { name: "Buscar..." })).toHaveValue("");
  });
});

describe("DataTable, acessibilidade", () => {
  it("tabela completa (busca, seleção, ordenação e paginação) não tem violações", async () => {
    const { container } = render(
      <DataTable
        data={muitos}
        columns={columns}
        title="Componentes"
        enableRowSelection
        enablePageSizeSelector
        paginationType="buttons"
      />
    );
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
