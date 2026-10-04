import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResizableLayout } from "./resizable-layout";

// Bug: o container raiz do ResizableLayout usava só `flex-1` pra ocupar a altura.
// `flex-1` só tem efeito quando o PAI é `display:flex` — sem isso (ex.: um wrapper
// `h-screen` comum, como o da story), o elemento não recebe altura nenhuma e vira
// 0px, colapsando os painéis (ResizablePanelGroup é `h-full`, então herda o 0).
// `h-full` resolve porque funciona por qualquer pai com altura definida, seja ele
// flex ou não.
// A variante desktop (com <ResizablePanelGroup>) não é exercitada aqui: o
// react-resizable-panels precisa de medidas reais de layout (ResizeObserver) pra
// montar, e o jsdom não faz layout de verdade — mesmo com o ResizeObserver mockado
// (packages/ui/src/test/setup.ts), o mount trava num assert interno da lib
// ("Panel constraints not found"), sem relação com o bug daqui. A raiz das duas
// variantes compartilha o mesmo className, então o teste do drawer mobile já cobre
// a classe; a variante desktop foi conferida manualmente no Storybook (ver prints).
describe("ResizableLayout", () => {
  it("no modo mobile drawer, o container raiz também usa h-full", () => {
    window.innerWidth = 375;
    window.dispatchEvent(new Event("resize"));

    render(
      <div style={{ height: 400 }} data-testid="parent-mobile">
        <ResizableLayout
          sidebar={<div>Sidebar</div>}
          sidebarOpen={true}
          setSidebarOpen={() => {}}
          mobileDrawer
        >
          <div>Conteúdo</div>
        </ResizableLayout>
      </div>
    );

    const root = screen.getByTestId("parent-mobile").firstElementChild as HTMLElement;
    expect(root).toHaveClass("h-full");

    window.innerWidth = 1024;
    window.dispatchEvent(new Event("resize"));
  });
});

function definirLargura(px: number) {
  window.innerWidth = px;
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

// O react-resizable-panels soma offsetWidth dos painéis para saber o tamanho do grupo; o jsdom devolve 0.
function simularLayoutDeDesktop() {
  const largura = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(500);
  const altura = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400);
  return () => {
    largura.mockRestore();
    altura.mockRestore();
  };
}

function Tela({
  aberta = true,
  aoMudar = () => {},
  lado = "left",
  mobileDrawer,
}: {
  aberta?: boolean;
  aoMudar?: (open: boolean) => void;
  lado?: "left" | "right";
  mobileDrawer?: boolean;
}) {
  return (
    <ResizableLayout
      sidebar={<nav aria-label="Menu lateral">Barra lateral</nav>}
      sidebarOpen={aberta}
      setSidebarOpen={aoMudar}
      side={lado}
      mobileDrawer={mobileDrawer}
      persistKey="teste"
    >
      <main>Conteúdo principal</main>
    </ResizableLayout>
  );
}

describe("ResizableLayout no celular (drawer)", () => {
  beforeEach(() => {
    localStorage.clear();
    definirLargura(375);
  });
  afterEach(() => {
    definirLargura(1024);
  });

  it("com a barra aberta, mostra a barra e o conteúdo e fecha ao tocar no fundo escurecido", async () => {
    const aoMudar = vi.fn();
    const { container } = render(<Tela aberta aoMudar={aoMudar} />);

    expect(screen.getByRole("navigation", { name: "Menu lateral" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo principal");

    const fundo = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await userEvent.setup().click(fundo);

    expect(aoMudar).toHaveBeenCalledWith(false);
  });

  it("com a barra fechada, não renderiza o fundo escurecido e esconde a gaveta fora da tela", () => {
    const { container } = render(<Tela aberta={false} />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    const gaveta = screen.getByRole("navigation", { name: "Menu lateral" })
      .parentElement as HTMLElement;
    expect(gaveta.style.transform).toBe("translateX(-100%)");
  });

  it("com a barra à direita fechada, a gaveta sai pelo lado direito", () => {
    render(<Tela aberta={false} lado="right" />);

    const gaveta = screen.getByRole("navigation", { name: "Menu lateral" })
      .parentElement as HTMLElement;
    expect(gaveta.style.transform).toBe("translateX(100%)");
    expect(gaveta).toHaveClass("right-0");
  });

  it("com a barra à direita aberta, a gaveta fica encostada à direita e visível", () => {
    render(<Tela aberta lado="right" />);

    const gaveta = screen.getByRole("navigation", { name: "Menu lateral" })
      .parentElement as HTMLElement;
    expect(gaveta.style.transform).toBe("translateX(0)");
    expect(gaveta).toHaveClass("right-0");
  });

  it("com mobileDrawer desligado, mantém o layout de painéis mesmo em tela estreita", () => {
    const restaurar = simularLayoutDeDesktop();
    render(<Tela aberta mobileDrawer={false} />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
    restaurar();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Tela aberta />);

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

describe("ResizableLayout no desktop (painéis redimensionáveis)", () => {
  let restaurarLayout: () => void;
  beforeEach(() => {
    localStorage.clear();
    definirLargura(1024);
    restaurarLayout = simularLayoutDeDesktop();
  });
  afterEach(() => {
    restaurarLayout();
  });

  it("com a barra à esquerda, mostra a barra antes do conteúdo e um separador entre eles", () => {
    render(<Tela aberta lado="left" />);

    const barra = screen.getByRole("navigation", { name: "Menu lateral" });
    const conteudo = screen.getByRole("main");
    const separador = screen.getByRole("separator");
    expect(
      barra.compareDocumentPosition(separador) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      separador.compareDocumentPosition(conteudo) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("com a barra à direita, mostra o conteúdo antes do separador e da barra", () => {
    render(<Tela aberta lado="right" />);

    const conteudo = screen.getByRole("main");
    const separador = screen.getByRole("separator");
    const barra = screen.getByRole("navigation", { name: "Menu lateral" });
    expect(
      conteudo.compareDocumentPosition(separador) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      separador.compareDocumentPosition(barra) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("com a barra fechada, não renderiza o conteúdo da barra, só o principal", () => {
    render(<Tela aberta={false} lado="left" />);

    expect(screen.queryByRole("navigation", { name: "Menu lateral" })).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("com a barra à direita fechada, também não renderiza o conteúdo da barra", () => {
    render(<Tela aberta={false} lado="right" />);

    expect(screen.queryByRole("navigation", { name: "Menu lateral" })).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("clique duplo no separador fecha a barra aberta", async () => {
    const aoMudar = vi.fn();
    render(<Tela aberta aoMudar={aoMudar} />);

    await userEvent.setup().dblClick(screen.getByRole("separator"));

    expect(aoMudar).toHaveBeenCalledWith(false);
  });

  it("clique duplo no separador reabre a barra fechada", async () => {
    const aoMudar = vi.fn();
    render(<Tela aberta={false} aoMudar={aoMudar} />);

    await userEvent.setup().dblClick(screen.getByRole("separator"));

    expect(aoMudar).toHaveBeenCalledWith(true);
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Tela aberta />);

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
