import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import type { DocumentPage } from "./document-editor";
import { DocumentEditor } from "./document-editor";

const meta = {
  title: "Flowtomic UI/Organisms/DocumentEditor",
  component: DocumentEditor,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Título do documento",
    },
    readOnly: {
      control: "boolean",
      description: "Se o documento é somente leitura",
    },
    viewMode: {
      control: "select",
      options: ["single", "continuous"],
      description: "Modo de visualização: paginado ou scroll contínuo",
    },
  },
} satisfies Meta<typeof DocumentEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Editor de documentos básico sem conteúdo inicial.
 * Similar ao Google Docs, permite criar e editar múltiplas páginas.
 */
export const Default: Story = {
  render: () => (
    <div className="h-screen">
      <DocumentEditor />
    </div>
  ),
};

/**
 * Editor com título e conteúdo inicial.
 * Demonstra o uso controlado do componente.
 */
export const WithInitialContent: Story = {
  render: () => {
    const [pages, setPages] = React.useState<DocumentPage[]>([
      {
        id: "page-1",
        content:
          "# Introdução\n\nBem-vindo ao editor de documentos!\n\nEste é um exemplo de conteúdo inicial.",
      },
      {
        id: "page-2",
        content: "# Segunda Página\n\nConteúdo da segunda página com **formatação** e _itálico_.",
      },
    ]);

    return (
      <div className="h-screen">
        <DocumentEditor title="Meu Documento" pages={pages} onPagesChange={setPages} />
      </div>
    );
  },
};

/**
 * Editor em modo somente leitura.
 * Útil para visualização de documentos sem permitir edição.
 */
export const ReadOnly: Story = {
  render: () => {
    const pages: DocumentPage[] = [
      {
        id: "page-1",
        content:
          "# Documento Somente Leitura\n\nEste documento não pode ser editado.\n\n> Este é um exemplo de citação.",
      },
    ];

    return (
      <div className="h-screen">
        <DocumentEditor title="Documento Protegido" pages={pages} readOnly={true} />
      </div>
    );
  },
};

/**
 * Editor totalmente controlado com navegação externa.
 * Demonstra controle completo de título, páginas e navegação.
 */
export const FullyControlled: Story = {
  render: () => {
    const [title, setTitle] = React.useState("Relatório Anual 2025");
    const [pages, setPages] = React.useState<DocumentPage[]>([
      { id: "1", content: "# Sumário Executivo\n\nResumo do relatório..." },
      { id: "2", content: "# Análise Financeira\n\nDados financeiros do ano..." },
      { id: "3", content: "# Conclusão\n\nConsiderações finais..." },
    ]);
    const [activePage, setActivePage] = React.useState(0);

    return (
      <div className="flex h-screen flex-col">
        {/* Controles externos */}
        <div className="border-b bg-slate-800 p-4 text-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Controles Externos:</span>
              <button
                onClick={() => setActivePage(Math.max(0, activePage - 1))}
                className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
              >
                ← Anterior
              </button>
              <span className="text-sm">
                Página {activePage + 1}/{pages.length}
              </span>
              <button
                onClick={() => setActivePage(Math.min(pages.length - 1, activePage + 1))}
                className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
              >
                Próxima →
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded bg-slate-700 px-3 py-1 text-sm"
              />
              <span className="text-sm text-slate-300">
                {pages.reduce((sum, p) => sum + p.content.split(/\s+/).filter(Boolean).length, 0)}{" "}
                palavras
              </span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <DocumentEditor
            title={title}
            onTitleChange={setTitle}
            pages={pages}
            onPagesChange={setPages}
            activePage={activePage}
            onActivePageChange={setActivePage}
          />
        </div>
      </div>
    );
  },
};

/**
 * Editor com múltiplas páginas pré-populadas.
 * Demonstra navegação entre várias páginas de conteúdo.
 */
export const MultiplePages: Story = {
  render: () => {
    const initialPages: DocumentPage[] = [
      {
        id: "chapter-1",
        content:
          "# Capítulo 1: Introdução\n\nEsta é a primeira página do livro.\n\n**Lorem ipsum** dolor sit amet.",
      },
      {
        id: "chapter-2",
        content:
          "# Capítulo 2: Desenvolvimento\n\nSegunda página com mais conteúdo.\n\n- Item 1\n- Item 2\n- Item 3",
      },
      {
        id: "chapter-3",
        content:
          "# Capítulo 3: Conclusão\n\nTerceira página finalizando o documento.\n\n> Citação importante aqui.",
      },
      {
        id: "chapter-4",
        content: "# Referências\n\nQuarta página com referências bibliográficas.",
      },
    ];

    return (
      <div className="h-screen">
        <DocumentEditor title="Livro Digital - Edição 2025" pages={initialPages} />
      </div>
    );
  },
};

/**
 * Modo de visualização contínua (scroll).
 * Todas as páginas aparecem empilhadas verticalmente, similar ao Google Docs.
 * Ideal para leitura e edição fluida sem necessidade de navegar entre páginas.
 */
export const ContinuousMode: Story = {
  render: () => {
    const initialPages: DocumentPage[] = [
      {
        id: "page-1",
        content:
          "# Página 1\n\nEste é o conteúdo da primeira página.\n\nNo modo contínuo, você pode rolar para ver todas as páginas.",
      },
      {
        id: "page-2",
        content:
          "# Página 2\n\nSegunda página do documento.\n\n**Role para baixo** para ver a próxima página.",
      },
      {
        id: "page-3",
        content:
          "# Página 3\n\nTerceira página.\n\n> Todas as páginas são editáveis simultaneamente.",
      },
      {
        id: "page-4",
        content:
          "# Página 4\n\nQuarta e última página.\n\nModo contínuo facilita a edição de documentos longos.",
      },
    ];

    return (
      <div className="h-screen">
        <DocumentEditor
          title="Documento em Modo Contínuo"
          pages={initialPages}
          viewMode="continuous"
        />
      </div>
    );
  },
};

/**
 * Exemplo de uso em sistema colaborativo.
 * Simula um editor com informações de colaboração.
 */
export const CollaborativeExample: Story = {
  render: () => {
    const [pages] = React.useState<DocumentPage[]>([
      {
        id: "doc-1",
        content:
          "# Projeto Q4 2025\n\n## Objetivos\n\nDefinir metas e estratégias para o último trimestre.\n\n**Participantes**: João, Maria, Pedro",
      },
    ]);

    return (
      <div className="flex h-screen flex-col">
        {/* Header de colaboração */}
        <div className="border-b bg-blue-50 p-3 dark:bg-blue-950">
          <div className="mx-auto flex max-w-4xl items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full bg-blue-500 ring-2 ring-white" />
                <div className="size-8 rounded-full bg-green-500 ring-2 ring-white" />
                <div className="size-8 rounded-full bg-purple-500 ring-2 ring-white" />
              </div>
              <span className="text-muted-foreground">3 pessoas editando</span>
            </div>
            <button type="button" className="rounded bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700">
              Compartilhar
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <DocumentEditor title="Projeto Q4 2025 - Planejamento Estratégico" pages={pages} />
        </div>
      </div>
    );
  },
};
