/**
 * DocumentEditor - Flowtomic UI
 *
 * Editor de documentos multi-página similar ao Google Docs.
 * Combina TextEditor com gerenciamento de páginas, título e metadata.
 *
 * Features:
 * - Múltiplas páginas com navegação
 * - Título editável do documento
 * - Metadata (última edição, palavras, caracteres)
 * - Adicionar/remover páginas
 * - Navegação entre páginas
 * - Modo de edição Rich apenas (sem abas)
 */

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns,
  FileText,
  List,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms";
import { TextEditor } from "../../molecules/forms/text-editor";

export interface DocumentPage {
  id: string;
  content: string;
}

export interface DocumentEditorProps {
  /** Título do documento */
  title?: string;
  /** Callback quando o título muda */
  onTitleChange?: (title: string) => void;
  /** Páginas do documento */
  pages?: DocumentPage[];
  /** Callback quando as páginas mudam */
  onPagesChange?: (pages: DocumentPage[]) => void;
  /** Página ativa (índice) */
  activePage?: number;
  /** Callback quando a página ativa muda */
  onActivePageChange?: (index: number) => void;
  /** Se o documento é somente leitura */
  readOnly?: boolean;
  /** Modo de visualização: 'single' (paginado) ou 'continuous' (scroll contínuo) */
  viewMode?: "single" | "continuous";
  /** Callback quando o modo de visualização muda */
  onViewModeChange?: (mode: "single" | "continuous") => void;
  /** Classe CSS adicional */
  className?: string;
}

function generateId(): string {
  return `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countCharacters(text: string): number {
  return text.length;
}

export const DocumentEditor = React.forwardRef<HTMLDivElement, DocumentEditorProps>(
  (
    {
      title: controlledTitle,
      onTitleChange,
      pages: controlledPages,
      onPagesChange,
      activePage: controlledActivePage,
      onActivePageChange,
      readOnly = false,
      viewMode: controlledViewMode,
      onViewModeChange,
      className,
    },
    ref
  ) => {
    // Estado interno para título
    const [internalTitle, setInternalTitle] = React.useState("Documento sem título");
    const title = controlledTitle ?? internalTitle;
    const handleTitleChange = (newTitle: string) => {
      if (!readOnly) {
        setInternalTitle(newTitle);
        onTitleChange?.(newTitle);
      }
    };

    // Estado interno para páginas
    const [internalPages, setInternalPages] = React.useState<DocumentPage[]>([
      { id: generateId(), content: "" },
    ]);
    const pages = controlledPages ?? internalPages;
    const handlePagesChange = (newPages: DocumentPage[]) => {
      setInternalPages(newPages);
      onPagesChange?.(newPages);
    };

    // Estado interno para página ativa
    const [internalActivePage, setInternalActivePage] = React.useState(0);
    const activePage = controlledActivePage ?? internalActivePage;
    const handleActivePageChange = (index: number) => {
      setInternalActivePage(index);
      onActivePageChange?.(index);
    };

    // Última edição (timestamp)
    const [lastEdit, setLastEdit] = React.useState<Date>(new Date());

    // Estado interno para modo de visualização
    const [internalViewMode, setInternalViewMode] = React.useState<"single" | "continuous">(
      "single"
    );
    const viewMode = controlledViewMode ?? internalViewMode;
    const handleViewModeChange = (mode: "single" | "continuous") => {
      setInternalViewMode(mode);
      onViewModeChange?.(mode);
    };

    // Atualizar conteúdo da página ativa
    const handlePageContentChange = (content: string) => {
      if (readOnly) return;
      const newPages = [...pages];
      newPages[activePage] = { ...newPages[activePage], content };
      handlePagesChange(newPages);
      setLastEdit(new Date());
    };

    // Atualizar conteúdo de uma página específica (modo contínuo)
    const handleSpecificPageContentChange = (index: number, content: string) => {
      if (readOnly) return;
      const newPages = [...pages];
      newPages[index] = { ...newPages[index], content };
      handlePagesChange(newPages);
      setLastEdit(new Date());
    };

    // Adicionar nova página
    const handleAddPage = () => {
      if (readOnly) return;
      const newPage: DocumentPage = { id: generateId(), content: "" };
      handlePagesChange([...pages, newPage]);
      handleActivePageChange(pages.length); // Ir para a nova página
    };

    // Remover página atual
    const handleRemovePage = () => {
      if (readOnly || pages.length <= 1) return;
      const newPages = pages.filter((_, i) => i !== activePage);
      handlePagesChange(newPages);
      // Ajustar página ativa
      if (activePage >= newPages.length) {
        handleActivePageChange(newPages.length - 1);
      }
    };

    // Navegar para página anterior
    const handlePreviousPage = () => {
      if (activePage > 0) {
        handleActivePageChange(activePage - 1);
      }
    };

    // Navegar para próxima página
    const handleNextPage = () => {
      if (activePage < pages.length - 1) {
        handleActivePageChange(activePage + 1);
      }
    };

    // Calcular estatísticas do documento
    const totalWords = React.useMemo(() => {
      return pages.reduce((sum, page) => sum + countWords(page.content), 0);
    }, [pages]);

    const totalCharacters = React.useMemo(() => {
      return pages.reduce((sum, page) => sum + countCharacters(page.content), 0);
    }, [pages]);

    // Garantir que activePage está dentro do range válido
    const safeActivePage = Math.min(Math.max(0, activePage), pages.length - 1);
    const currentPage = pages[safeActivePage];

    // Sincronizar activePage se estiver fora do range
    React.useEffect(() => {
      if (activePage !== safeActivePage) {
        handleActivePageChange(safeActivePage);
      }
    }, [activePage, safeActivePage, handleActivePageChange]);

    if (!currentPage) {
      return null; // Fallback de segurança
    }

    return (
      <div ref={ref} className={cn("flex h-full flex-col", className)}>
        {/* Header com título e metadata */}
        <div className="border-b bg-background p-4">
          <div className="mx-auto max-w-4xl space-y-3">
            {/* Título editável */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={readOnly}
              className="w-full border-none bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              placeholder="Documento sem título"
            />

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>Última edição: {lastEdit.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>
                  {pages.length} página{pages.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Type className="size-3.5" />
                <span>
                  {totalWords} palavras · {totalCharacters} caracteres
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar de navegação */}
        <div className="border-b bg-muted/30 px-4 py-2">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Modo de visualização */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "single" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("single")}
              >
                <Columns className="size-4" />
                Paginado
              </Button>
              <Button
                variant={viewMode === "continuous" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("continuous")}
              >
                <List className="size-4" />
                Contínuo
              </Button>
            </div>

            {/* Navegação (apenas em modo single) */}
            {viewMode === "single" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={safeActivePage === 0}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {safeActivePage + 1} de {pages.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={safeActivePage === pages.length - 1}
                >
                  Próxima
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}

            {/* Ações de página */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleAddPage} disabled={readOnly}>
                <Plus className="size-4" />
                Adicionar página
              </Button>
              {viewMode === "single" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePage}
                  disabled={readOnly || pages.length <= 1}
                >
                  <Trash2 className="size-4" />
                  Remover página
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Área do editor */}
        <div className="flex-1 overflow-auto bg-muted/20 p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {viewMode === "single" ? (
              /* Modo paginado - apenas página ativa */
              <div className="min-h-[297mm] rounded-lg border bg-background p-16 shadow-sm">
                <TextEditor
                  key={currentPage.id}
                  value={currentPage.content}
                  onChange={handlePageContentChange}
                  availableModes={["rich"]}
                  editable={!readOnly}
                  placeholder="Comece a digitar..."
                />
              </div>
            ) : (
              /* Modo contínuo - todas as páginas */
              pages.map((page, index) => (
                <div key={page.id} className="relative">
                  {/* Indicador de número da página */}
                  <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Página {index + 1}</span>
                    {!readOnly && pages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (pages.length <= 1) return;
                          const newPages = pages.filter((_, i) => i !== index);
                          handlePagesChange(newPages);
                        }}
                      >
                        <Trash2 className="size-3" />
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="min-h-[297mm] rounded-lg border bg-background p-16 shadow-sm">
                    <TextEditor
                      key={page.id}
                      value={page.content}
                      onChange={(content: string) =>
                        handleSpecificPageContentChange(index, content)
                      }
                      availableModes={["rich"]}
                      editable={!readOnly}
                      placeholder="Comece a digitar..."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

DocumentEditor.displayName = "DocumentEditor";
