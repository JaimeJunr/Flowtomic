import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
