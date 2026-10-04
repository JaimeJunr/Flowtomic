import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  DataTablePagination,
  type DataTablePaginationProps,
  DataTablePaginationSkeleton,
} from "./data-table-pagination";

interface Linha {
  nome: string;
}

const colunas: ColumnDef<Linha>[] = [{ accessorKey: "nome", header: "Nome" }];

const criarLinhas = (total: number): Linha[] =>
  Array.from({ length: total }, (_, i) => ({ nome: `item-${i + 1}` }));

// Tabela de verdade do TanStack, só com o que a paginação precisa; sem mock de table.
function Paginada({
  total,
  pageSize = 10,
  ...props
}: { total: number; pageSize?: number } & Omit<DataTablePaginationProps<Linha>, "table">) {
  // dados estáveis: um array novo a cada render faz o TanStack voltar para a página 1
  const data = useMemo(() => criarLinhas(total), [total]);
  const table = useReactTable({
    data,
    columns: colunas,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });
  return (
    <>
      <output aria-label="Página atual">{table.getState().pagination.pageIndex + 1}</output>
      <DataTablePagination table={table} {...props} />
    </>
  );
}

const paginaAtual = () => screen.getByLabelText("Página atual").textContent;

describe("DataTablePagination, modo texto", () => {
  it("mostra a faixa de itens e a página, e navega com Anterior e Próxima", async () => {
    render(<Paginada total={25} />);
    expect(screen.getByText(/Mostrando 1 a 10 de 25 itens/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(paginaAtual()).toBe("2");
    expect(screen.getByText(/Mostrando 11 a 20 de 25 itens/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText(/Mostrando 21 a 25 de 25 itens/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(paginaAtual()).toBe("2");
  });

  it("sem linhas, mostra 0 itens e deixa os dois botões desabilitados", () => {
    render(<Paginada total={0} />);
    expect(screen.getByText(/Mostrando 0 de 0 itens/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("com paginationInfo (servidor), mostra os números do servidor em vez de calcular", () => {
    render(
      <Paginada
        total={5}
        pageSize={5}
        paginationInfo={{ start: 41, end: 45, total: 200, pageCount: 40 }}
      />
    );
    expect(screen.getByText(/Mostrando 41 a 45 de 200 itens/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 40")).toBeInTheDocument();
  });

  it("com paginationInfo.start zerado, mostra só 0", () => {
    render(<Paginada total={0} paginationInfo={{ start: 0, end: 0, total: 0, pageCount: 1 }} />);
    expect(screen.getByText(/Mostrando 0 de 0 itens/)).toBeInTheDocument();
  });

  it("className vai para o rodapé", () => {
    const { container } = render(<Paginada total={5} className="meu-rodape" />);
    expect(container.querySelector(".meu-rodape")).toBeInTheDocument();
  });

  it("tamanho sm e md usam espaçamentos diferentes no rodapé", () => {
    const sm = render(<Paginada total={5} size="sm" />);
    expect(sm.container.querySelector(".py-3")).toBeInTheDocument();
    sm.unmount();
    const md = render(<Paginada total={5} size="md" />);
    expect(md.container.querySelector(".py-4")).toBeInTheDocument();
  });
});

describe("DataTablePagination, footerContent", () => {
  it("troca os controles pelo conteúdo que a pessoa passar", () => {
    render(<Paginada total={25} footerContent={<span>Total: 25 itens</span>} />);
    expect(screen.getByText("Total: 25 itens")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it("footerContent respeita size e className", () => {
    const { container } = render(
      <Paginada total={5} size="sm" className="meu-rodape" footerContent={<span>Rodapé</span>} />
    );
    expect(container.querySelector(".meu-rodape.py-3")).toBeInTheDocument();
  });
});

describe("DataTablePagination, modo botões", () => {
  it("com 7 páginas ou menos, mostra todos os números, sem reticências", () => {
    render(<Paginada total={70} paginationType="buttons" />);
    for (let n = 1; n <= 7; n++) {
      expect(screen.getByRole("button", { name: `Ir para página ${n}` })).toBeInTheDocument();
    }
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("com uma página só, mostra só a 1", () => {
    render(<Paginada total={3} paginationType="buttons" />);
    expect(screen.getAllByRole("button", { name: /Ir para página/ })).toHaveLength(1);
  });

  it("no começo, mostra as cinco primeiras, reticências e a última", () => {
    render(<Paginada total={100} paginationType="buttons" />);
    const numeros = screen
      .getAllByRole("button", { name: /Ir para página/ })
      .map((botao) => botao.textContent);
    expect(numeros).toEqual(["1", "2", "3", "4", "5", "10"]);
    expect(screen.getAllByText("...")).toHaveLength(1);
  });

  it("no meio, mostra a vizinhança da página atual com reticências dos dois lados", async () => {
    render(<Paginada total={100} paginationType="buttons" />);
    await userEvent.click(screen.getByRole("button", { name: "Ir para página 5" }));
    const numeros = screen
      .getAllByRole("button", { name: /Ir para página/ })
      .map((botao) => botao.textContent);
    expect(numeros).toEqual(["1", "4", "5", "6", "10"]);
    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Ir para página 5" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Ir para página 4" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("no fim, mostra a primeira, reticências e as cinco últimas", async () => {
    render(<Paginada total={100} paginationType="buttons" />);
    await userEvent.click(screen.getByRole("button", { name: "Ir para página 10" }));
    const numeros = screen
      .getAllByRole("button", { name: /Ir para página/ })
      .map((botao) => botao.textContent);
    expect(numeros).toEqual(["1", "6", "7", "8", "9", "10"]);
    expect(screen.getAllByText("...")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("as reticências ficam fora da árvore de acessibilidade", () => {
    render(<Paginada total={100} paginationType="buttons" />);
    expect(screen.getByText("...")).toHaveAttribute("aria-hidden", "true");
  });

  it("Próxima e Anterior andam uma página por vez também neste modo", async () => {
    render(<Paginada total={100} paginationType="buttons" />);
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(paginaAtual()).toBe("2");
    await userEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(paginaAtual()).toBe("1");
  });
});

describe("DataTablePagination, tamanho da página", () => {
  it("sem enablePageSizeSelector, não oferece o seletor", () => {
    render(<Paginada total={25} />);
    expect(
      screen.queryByRole("combobox", { name: "Selecionar tamanho de página" })
    ).not.toBeInTheDocument();
  });

  it("trocar o tamanho muda as linhas por página e volta para a primeira página", async () => {
    render(
      <Paginada total={100} pageSize={20} enablePageSizeSelector pageSizeOptions={[10, 20, 50]} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(paginaAtual()).toBe("2");
    await userEvent.click(screen.getByRole("combobox", { name: "Selecionar tamanho de página" }));
    await userEvent.click(await screen.findByRole("option", { name: "50" }));
    await waitFor(() => expect(screen.getByText("Página 1 de 2")).toBeInTheDocument());
    expect(paginaAtual()).toBe("1");
  });

  it("o tamanho atual entra nas opções mesmo que não esteja na lista, em ordem crescente", async () => {
    render(
      <Paginada total={100} pageSize={15} enablePageSizeSelector pageSizeOptions={[50, 10]} />
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Selecionar tamanho de página" }));
    const opcoes = (await screen.findAllByRole("option")).map((opcao) => opcao.textContent);
    expect(opcoes).toEqual(["10", "15", "50"]);
  });

  it("usa as opções padrão quando nenhuma é passada", async () => {
    render(<Paginada total={300} pageSize={20} enablePageSizeSelector />);
    await userEvent.click(screen.getByRole("combobox", { name: "Selecionar tamanho de página" }));
    const opcoes = (await screen.findAllByRole("option")).map((opcao) => opcao.textContent);
    expect(opcoes).toEqual(["20", "25", "50", "100", "200"]);
  });
});

describe("DataTablePaginationSkeleton", () => {
  it("é só um esqueleto: sem botões nem texto", () => {
    const { container } = render(<DataTablePaginationSkeleton />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
  });

  it("respeita size e className", () => {
    const { container } = render(
      <DataTablePaginationSkeleton size="sm" className="meu-esqueleto" />
    );
    expect(container.firstElementChild).toHaveClass("py-3", "meu-esqueleto");
    const md = render(<DataTablePaginationSkeleton />);
    expect(md.container.firstElementChild).toHaveClass("py-4");
  });
});

describe("DataTablePagination, acessibilidade", () => {
  it.each([
    "text",
    "buttons",
  ] as const)("modo %s com seletor de tamanho não tem violações", async (modo) => {
    const { container } = render(
      <Paginada total={100} paginationType={modo} enablePageSizeSelector />
    );
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
