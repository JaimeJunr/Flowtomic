import { useDraggable, useDroppable } from "@dnd-kit/core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WidgetLayout } from "@/types/dashboard";
import { DraggableDashboardGrid } from "./draggable-dashboard-grid";

const widgets: WidgetLayout[] = [
  { id: "w1", type: "stats", x: 0, y: 0, w: 4, h: 3 },
  { id: "w2", type: "chart", x: 4, y: 0, w: 4, h: 3 },
];

const renderWidget = (widget: WidgetLayout) => <p>Conteúdo {widget.id}</p>;

// Uma célula + gap do grid padrão: 50px + 16px
const CELULA = 66;

// O jsdom não preenche isPrimary no PointerEvent e o PointerSensor do dnd-kit descarta o toque sem ele
function pressionarPonteiro(alvo: HTMLElement) {
  const evento = new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 0,
    clientY: 0,
  });
  Object.defineProperty(evento, "isPrimary", { value: true });
  fireEvent(alvo, evento);
}

// O dnd-kit despacha onDragMove em efeito: cada passo do ponteiro precisa de um ciclo do React.
// O sensor escuta o próprio alvo do pointerdown, então os movimentos saem da alça.
async function moverPonteiro(alca: HTMLElement, x: number, y = 0) {
  await act(async () => {
    fireEvent.pointerMove(alca, { clientX: x, clientY: y });
  });
}

async function soltarPonteiro(alca: HTMLElement, x: number, y = 0) {
  await act(async () => {
    fireEvent.pointerUp(alca, { clientX: x, clientY: y });
  });
}

// Começa o arrasto passando do limiar de 8px e leva o ponteiro até o deslocamento pedido
async function arrastarAte(alca: HTMLElement, x: number, y = 0) {
  pressionarPonteiro(alca);
  await moverPonteiro(alca, 20, 0);
  await moverPonteiro(alca, x, y);
}

// jsdom não faz layout: sem retângulo com área, o dnd-kit não acha onde o item foi solto
let medidaDeArea: ReturnType<typeof vi.spyOn> | null = null;

function medirComArea() {
  medidaDeArea = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  });
}

afterEach(() => {
  medidaDeArea?.mockRestore();
  medidaDeArea = null;
});

function alcaDo(id: string): HTMLElement {
  const widget = screen.getByText(`Conteúdo ${id}`).closest<HTMLElement>("[style*='grid-column']");
  return within(widget as HTMLElement).getByRole("button", { name: "Arrastar widget" });
}

function widgetNaGrade(id: string): HTMLElement {
  return screen
    .getAllByText(`Conteúdo ${id}`)[0]
    .closest<HTMLElement>("[style*='grid-column']") as HTMLElement;
}

describe("DraggableDashboardGrid", () => {
  describe("Renderização dos widgets", () => {
    it("renderiza o conteúdo de cada widget usando renderWidget", () => {
      render(
        <DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode={false} />
      );
      expect(screen.getByText("Conteúdo w1")).toBeInTheDocument();
      expect(screen.getByText("Conteúdo w2")).toBeInTheDocument();
    });

    it("posiciona cada widget na coluna e linha do grid a partir de x, y, w e h", () => {
      render(
        <DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode={false} />
      );
      const segundo = screen
        .getByText("Conteúdo w2")
        .closest<HTMLElement>("[style*='grid-column']");
      expect(segundo).toHaveStyle({
        gridColumnStart: "5",
        gridColumnEnd: "9",
        gridRowStart: "1",
        gridRowEnd: "4",
      });
    });

    it("usa 12 colunas e gap de 16px quando gridConfig não é informado", () => {
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode={false}
          className="meu-grid"
        />
      );
      const grid = document.querySelector<HTMLElement>(".meu-grid");
      expect(grid).toHaveStyle({
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        gap: "16px",
      });
    });

    it("respeita a configuração de colunas e gap passada, completando o resto com o padrão", () => {
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode={false}
          gridConfig={{ columns: 6, gap: 8 } as never}
          className="meu-grid"
        />
      );
      expect(document.querySelector(".meu-grid")).toHaveStyle({
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: "8px",
      });
    });

    it("acompanha a lista de widgets quando as props mudam", () => {
      const { rerender } = render(
        <DraggableDashboardGrid
          widgets={[widgets[0]]}
          renderWidget={renderWidget}
          isEditMode={false}
        />
      );
      expect(screen.queryByText("Conteúdo w2")).not.toBeInTheDocument();

      rerender(
        <DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode={false} />
      );
      expect(screen.getByText("Conteúdo w2")).toBeInTheDocument();
    });
  });

  describe("Estado vazio", () => {
    it("em modo de edição sem widgets, mostra a instrução padrão em português", () => {
      render(<DraggableDashboardGrid widgets={[]} renderWidget={renderWidget} isEditMode />);
      expect(
        screen.getByRole("heading", { name: "Nenhum widget configurado" })
      ).toBeInTheDocument();
      expect(screen.getByText(/Arraste widgets da paleta/)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Ícone de Dashboard Vazio" })).toBeInTheDocument();
    });

    it("em modo de edição sem widgets, prefere o estado vazio customizado", () => {
      render(
        <DraggableDashboardGrid
          widgets={[]}
          renderWidget={renderWidget}
          isEditMode
          emptyState={<p>Adicione o primeiro gráfico em Widgets</p>}
        />
      );
      expect(screen.getByText("Adicione o primeiro gráfico em Widgets")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Nenhum widget configurado" })
      ).not.toBeInTheDocument();
    });

    it("fora do modo de edição, sem widgets, não mostra o estado vazio", () => {
      render(
        <DraggableDashboardGrid widgets={[]} renderWidget={renderWidget} isEditMode={false} />
      );
      expect(
        screen.queryByRole("heading", { name: "Nenhum widget configurado" })
      ).not.toBeInTheDocument();
    });

    it("em modo de edição com widgets, não mostra o estado vazio", () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      expect(
        screen.queryByRole("heading", { name: "Nenhum widget configurado" })
      ).not.toBeInTheDocument();
    });

    it("sai do estado vazio quando chegam widgets", () => {
      const { rerender } = render(
        <DraggableDashboardGrid widgets={[]} renderWidget={renderWidget} isEditMode />
      );
      rerender(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      expect(screen.getByText("Conteúdo w1")).toBeInTheDocument();
    });
  });

  describe("Controles de edição", () => {
    it("fora do modo de edição, não mostra alças nem botões de edição", () => {
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode={false}
          onConfigureWidget={() => {}}
          onRemoveWidget={() => {}}
          onResizeWidget={() => {}}
        />
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("em modo de edição, cada widget ganha alça de arrastar", () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      expect(screen.getAllByRole("button", { name: "Arrastar widget" })).toHaveLength(2);
    });

    it("avisa o id do widget ao clicar em configurar", async () => {
      const onConfigureWidget = vi.fn();
      const user = userEvent.setup();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onConfigureWidget={onConfigureWidget}
        />
      );

      await user.click(screen.getAllByRole("button", { name: "Configurar widget" })[1]);
      expect(onConfigureWidget).toHaveBeenCalledTimes(1);
      expect(onConfigureWidget).toHaveBeenCalledWith("w2");
    });

    it("avisa o id do widget ao clicar em remover", async () => {
      const onRemoveWidget = vi.fn();
      const user = userEvent.setup();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onRemoveWidget={onRemoveWidget}
        />
      );

      await user.click(screen.getAllByRole("button", { name: "Remover widget" })[0]);
      expect(onRemoveWidget).toHaveBeenCalledTimes(1);
      expect(onRemoveWidget).toHaveBeenCalledWith("w1");
    });
  });

  describe("Redimensionar", () => {
    it("aumentar com a seta direita avisa a nova largura e mantém a altura", async () => {
      const onResizeWidget = vi.fn();
      const user = userEvent.setup();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onResizeWidget={onResizeWidget}
        />
      );

      screen.getAllByRole("button", { name: "Redimensionar widget" })[0].focus();
      await user.keyboard("{ArrowRight}");
      expect(onResizeWidget).toHaveBeenCalledTimes(1);
      expect(onResizeWidget).toHaveBeenCalledWith("w1", 5, 3);
    });

    it("redimensionar uma célula a mais alarga o widget no grid", async () => {
      const user = userEvent.setup();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onResizeWidget={() => {}}
        />
      );
      const segundo = () =>
        screen.getByText("Conteúdo w2").closest<HTMLElement>("[style*='grid-column']");
      expect(segundo()).toHaveStyle({ gridColumnEnd: "9" });

      screen.getAllByRole("button", { name: "Redimensionar widget" })[1].focus();
      await user.keyboard("{ArrowRight}");
      expect(segundo()).toHaveStyle({ gridColumnEnd: "10" });
    });
  });

  describe("Arrastar e soltar", () => {
    it("arrastar o widget duas células para a direita avisa a nova posição", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA * 2 + 4);
      await soltarPonteiro(alca, CELULA * 2 + 4);

      expect(onMoveWidget).toHaveBeenCalledTimes(1);
      expect(onMoveWidget).toHaveBeenCalledWith("w2", 6, 0);
    });

    it("o widget arrastado muda de coluna no grid", async () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA * 2);
      await soltarPonteiro(alca, CELULA * 2);

      expect(widgetNaGrade("w2")).toHaveStyle({ gridColumnStart: "7", gridColumnEnd: "11" });
    });

    it("arrastar para baixo muda a linha do widget", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w1");

      await arrastarAte(alca, 0, CELULA * 3);
      await soltarPonteiro(alca, 0, CELULA * 3);

      expect(onMoveWidget).toHaveBeenCalledWith("w1", 0, 3);
    });

    it("não deixa o widget passar da última coluna do grid", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA * 20);
      await soltarPonteiro(alca, CELULA * 20);

      // 12 colunas - largura 4 = última posição possível é a coluna 8
      expect(onMoveWidget).toHaveBeenCalledWith("w2", 8, 0);
    });

    it("não move o widget para cima de outro que já ocupa o lugar", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w1");

      await arrastarAte(alca, CELULA * 2);
      await soltarPonteiro(alca, CELULA * 2);

      expect(onMoveWidget).not.toHaveBeenCalled();
      expect(widgetNaGrade("w1")).toHaveStyle({ gridColumnStart: "1" });
    });

    it("arrasto menor que meia célula não muda a posição", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");

      await arrastarAte(alca, 20);
      await soltarPonteiro(alca, 20);

      expect(onMoveWidget).not.toHaveBeenCalled();
    });

    it("movimentos extras dentro da mesma célula não repetem o aviso", async () => {
      const onMoveWidget = vi.fn();
      render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA * 2);
      await moverPonteiro(alca, CELULA * 2 + 6);
      await soltarPonteiro(alca, CELULA * 2 + 6);

      expect(onMoveWidget).toHaveBeenCalledTimes(1);
    });

    it("arrastar sem onMoveWidget ainda reposiciona o widget no grid", async () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA * 2);
      await soltarPonteiro(alca, CELULA * 2);

      expect(widgetNaGrade("w2")).toHaveStyle({ gridColumnStart: "7" });
    });

    it("durante o arrasto, mostra uma cópia translúcida do widget; ao soltar, ela some", async () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA);
      expect(screen.getAllByText("Conteúdo w2")).toHaveLength(2);

      await soltarPonteiro(alca, CELULA);
      expect(screen.getAllByText("Conteúdo w2")).toHaveLength(1);
    });

    it("Escape cancela o arrasto e some com a cópia", async () => {
      render(<DraggableDashboardGrid widgets={widgets} renderWidget={renderWidget} isEditMode />);
      const alca = alcaDo("w2");

      await arrastarAte(alca, CELULA);
      expect(screen.getAllByText("Conteúdo w2")).toHaveLength(2);

      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
      });
      expect(screen.getAllByText("Conteúdo w2")).toHaveLength(1);
    });

    it("se o modo de edição acaba no meio do arrasto, o widget para de se mover", async () => {
      const onMoveWidget = vi.fn();
      const { rerender } = render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");
      pressionarPonteiro(alca);
      await moverPonteiro(alca, 20);

      rerender(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode={false}
          onMoveWidget={onMoveWidget}
        />
      );
      await moverPonteiro(alca, CELULA * 2);
      await soltarPonteiro(alca, CELULA * 2);

      expect(onMoveWidget).not.toHaveBeenCalled();
    });

    it("se o widget arrastado é removido no meio do arrasto, nada quebra nem é movido", async () => {
      const onMoveWidget = vi.fn();
      const { rerender } = render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      const alca = alcaDo("w2");
      pressionarPonteiro(alca);
      await moverPonteiro(alca, 20);

      rerender(
        <DraggableDashboardGrid
          widgets={[widgets[0]]}
          renderWidget={renderWidget}
          isEditMode
          onMoveWidget={onMoveWidget}
        />
      );
      await moverPonteiro(alca, CELULA * 2);
      await soltarPonteiro(alca, CELULA * 2);

      expect(onMoveWidget).not.toHaveBeenCalled();
      expect(screen.queryByText("Conteúdo w2")).not.toBeInTheDocument();
    });

    it("pelo teclado, Espaço pega o widget, Esc cancela, e o leitor de tela ouve em português", async () => {
      medirComArea();
      render(
        <DraggableDashboardGrid
          widgets={[{ id: "w1", type: "stats", x: 0, y: 0, w: 4, h: 3 }]}
          renderWidget={(w) => <div>Conteúdo {w.id}</div>}
          isEditMode
        />
      );
      expect(screen.getByText(/pressione Espaço ou Enter/)).toBeInTheDocument();
      screen.getByRole("button", { name: "Arrastar widget" }).focus();

      await userEvent.keyboard(" ");
      expect(await screen.findByText(/Widget w1 pego/)).toBeInTheDocument();

      await userEvent.keyboard("{Escape}");
      expect(await screen.findByText(/Movimento do widget w1 cancelado/)).toBeInTheDocument();
    });
  });

  describe("Arrastar da paleta", () => {
    function ItemDePaleta({ id }: { id: string }) {
      const { setNodeRef, listeners, attributes } = useDraggable({
        id,
        data: { type: "palette-widget", widgetType: "grafico", defaultSize: { w: 6, h: 4 } },
      });
      return (
        <button
          type="button"
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          aria-label="Item da paleta"
        >
          paleta
        </button>
      );
    }

    // O grid registra o próprio useDroppable("dashboard-grid") FORA do DndContext que ele mesmo
    // renderiza, então dentro dele não existe área de soltar. O teste dá uma área de soltar
    // dentro do contexto para exercitar o ramo de paleta de handleDragEnd.
    function AreaDeSoltar() {
      const { setNodeRef } = useDroppable({ id: "area-de-teste" });
      return <div ref={setNodeRef}>área</div>;
    }

    it("soltar um item de paleta sobre uma área de soltar pede a adição do widget com o tamanho padrão", async () => {
      const onAddWidget = vi.fn();
      medirComArea();
      render(
        <DraggableDashboardGrid
          widgets={[{ id: "w1", type: "stats", x: 0, y: 0, w: 4, h: 3 }]}
          renderWidget={() => (
            <>
              <ItemDePaleta id="paleta-1" />
              <AreaDeSoltar />
            </>
          )}
          isEditMode
          onAddWidget={onAddWidget}
        />
      );
      const item = screen.getByRole("button", { name: "Item da paleta" });

      pressionarPonteiro(item);
      await moverPonteiro(item, 20);
      await moverPonteiro(item, 40);
      // O dnd-kit mede as áreas de soltar com um timeout curto depois que o arrasto começa
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
      await soltarPonteiro(item, 40);

      expect(onAddWidget).toHaveBeenCalledTimes(1);
      expect(onAddWidget).toHaveBeenCalledWith("grafico", { w: 6, h: 4 });
    });

    it("soltar um item de paleta sobre o próprio grid pede a adição do widget", async () => {
      const onAddWidget = vi.fn();
      medirComArea();
      render(
        <DraggableDashboardGrid
          widgets={[{ id: "w1", type: "stats", x: 0, y: 0, w: 4, h: 3 }]}
          renderWidget={() => <ItemDePaleta id="paleta-1" />}
          isEditMode
          onAddWidget={onAddWidget}
        />
      );
      const item = screen.getByRole("button", { name: "Item da paleta" });

      pressionarPonteiro(item);
      await moverPonteiro(item, 20);
      await moverPonteiro(item, 40);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
      await soltarPonteiro(item, 40);

      expect(onAddWidget).toHaveBeenCalledWith("grafico", { w: 6, h: 4 });
    });

    it("soltar item de paleta sem onAddWidget não quebra", async () => {
      medirComArea();
      render(
        <DraggableDashboardGrid
          widgets={[{ id: "w1", type: "stats", x: 0, y: 0, w: 4, h: 3 }]}
          renderWidget={() => (
            <>
              <ItemDePaleta id="paleta-1" />
              <AreaDeSoltar />
            </>
          )}
          isEditMode
        />
      );
      const item = screen.getByRole("button", { name: "Item da paleta" });

      pressionarPonteiro(item);
      await moverPonteiro(item, 20);
      await soltarPonteiro(item, 20);

      expect(screen.getByRole("button", { name: "Item da paleta" })).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("em modo de edição com todos os controles, não tem violações", async () => {
      const { container } = render(
        <DraggableDashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          isEditMode
          onConfigureWidget={() => {}}
          onRemoveWidget={() => {}}
          onResizeWidget={() => {}}
        />
      );
      const resultado = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(resultado.violations).toEqual([]);
    });

    it("o estado vazio não tem violações", async () => {
      const { container } = render(
        <DraggableDashboardGrid widgets={[]} renderWidget={renderWidget} isEditMode />
      );
      const resultado = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(resultado.violations).toEqual([]);
    });
  });
});
