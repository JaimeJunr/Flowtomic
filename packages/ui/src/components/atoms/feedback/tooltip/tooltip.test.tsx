import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Button } from "../../actions/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipWithMouseFollow,
} from "./tooltip";

describe("Tooltip", () => {
  describe("Renderização", () => {
    it("deve renderizar o Tooltip", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const button = screen.getByRole("button", { name: "Hover me" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar TooltipTrigger", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Trigger</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });

    it("deve renderizar TooltipContent", async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Hover</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const button = screen.getByRole("button", { name: "Hover" });
      await user.hover(button);

      await waitFor(() => {
        const content = screen.getAllByText("Tooltip content");
        expect(content.length).toBeGreaterThan(0);
        expect(content[0]).toBeInTheDocument();
      });
    });
  });

  describe("Interação", () => {
    it("deve exibir tooltip ao passar o mouse", async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip appears</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const button = screen.getByRole("button", { name: "Hover me" });
      await user.hover(button);

      await waitFor(() => {
        const content = screen.getAllByText("Tooltip appears");
        expect(content.length).toBeGreaterThan(0);
        expect(content[0]).toBeInTheDocument();
      });
    });
  });

  describe("TooltipWithMouseFollow", () => {
    it("deve renderizar TooltipWithMouseFollow", () => {
      render(
        <TooltipWithMouseFollow content={<p>Follow mouse</p>}>
          <Button>Hover</Button>
        </TooltipWithMouseFollow>
      );
      const button = screen.getByRole("button", { name: "Hover" });
      expect(button).toBeInTheDocument();
    });

    it("deve aceitar minWidth customizado", () => {
      render(
        <TooltipWithMouseFollow content={<p>Content</p>} minWidth={300}>
          <Button>Hover</Button>
        </TooltipWithMouseFollow>
      );
      const button = screen.getByRole("button", { name: "Hover" });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura acessível", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Info button">Info</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const button = screen.getByRole("button", { name: "Info button" });
      expect(button).toBeInTheDocument();
    });
  });
});

describe("Tooltip - comportamento adicional", () => {
  it("deve aplicar className customizada ao conteúdo", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Ajuda</Button>
          </TooltipTrigger>
          <TooltipContent className="minha-classe">Texto de ajuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    await user.hover(screen.getByRole("button", { name: "Ajuda" }));

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.parentElement?.className).toContain("minha-classe");
  });

  it("deve esconder o tooltip ao apertar Escape", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Ajuda</Button>
          </TooltipTrigger>
          <TooltipContent>Texto de ajuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    await user.hover(screen.getByRole("button", { name: "Ajuda" }));
    await screen.findByRole("tooltip");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("deve expor data-follow-mouse no gatilho quando informado", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-follow-mouse>Gatilho</TooltipTrigger>
          <TooltipContent followMouse>Conteúdo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByRole("button", { name: "Gatilho" })).toHaveAttribute(
      "data-follow-mouse",
      "true"
    );
  });

  it("não deve renderizar conteúdo do Radix quando followMouse está ligado", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Ajuda</Button>
          </TooltipTrigger>
          <TooltipContent followMouse>Texto de ajuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    await user.hover(screen.getByRole("button", { name: "Ajuda" }));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.queryByText("Texto de ajuda")).not.toBeInTheDocument();
  });
});

describe("TooltipWithMouseFollow - interação", () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalRect = Element.prototype.getBoundingClientRect;

  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    Element.prototype.getBoundingClientRect = originalRect;
    vi.useRealTimers();
  });

  function renderFollow(props: { minWidth?: number; className?: string } = {}) {
    return render(
      <TooltipWithMouseFollow content="Dica flutuante" {...props}>
        <span>Alvo</span>
      </TooltipWithMouseFollow>
    );
  }

  function getContainer() {
    return screen.getByText("Alvo").parentElement as HTMLElement;
  }

  it("deve mostrar a dica ao entrar com o mouse e escondê-la ao sair", async () => {
    renderFollow();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(getContainer(), { clientX: 10, clientY: 10 });
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Dica flutuante");

    fireEvent.mouseLeave(getContainer());
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("deve acompanhar o mouse enquanto a dica está visível", async () => {
    renderFollow();
    fireEvent.mouseEnter(getContainer(), { clientX: 10, clientY: 10 });
    const tooltip = await screen.findByRole("tooltip");

    fireEvent.mouseMove(getContainer(), { clientX: 50, clientY: 70 });

    await waitFor(() => {
      expect(tooltip.style.left).toBe("62px");
      expect(tooltip.style.top).toBe("82px");
    });
  });

  it("deve ignorar o movimento do mouse quando a dica não está visível", () => {
    renderFollow();

    fireEvent.mouseMove(getContainer(), { clientX: 50, clientY: 70 });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("deve aplicar className e minWidth na dica", async () => {
    renderFollow({ className: "dica-custom", minWidth: 320 });
    fireEvent.mouseEnter(getContainer(), { clientX: 5, clientY: 5 });

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveClass("dica-custom");
    expect(tooltip.style.minWidth).toBe("320px");
  });

  it("deve virar a dica para a esquerda quando estoura a borda direita", async () => {
    window.innerWidth = 300;
    Element.prototype.getBoundingClientRect = () =>
      ({ left: 200, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 200, y: 0 }) as DOMRect;
    renderFollow({ minWidth: 240 });

    fireEvent.mouseEnter(getContainer(), { clientX: 300, clientY: 10 });

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(tooltip.style.left).toBe(`${100 - 240 - 12}px`));
  });

  it("deve subir a dica quando estoura a borda inferior", async () => {
    window.innerHeight = 100;
    renderFollow();

    fireEvent.mouseEnter(getContainer(), { clientX: 10, clientY: 90 });

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(Number.parseFloat(tooltip.style.top)).toBeLessThan(90));
  });

  it("deve manter a dica dentro da tela quando o container está colado na borda esquerda", async () => {
    window.innerWidth = 300;
    Element.prototype.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;
    renderFollow({ minWidth: 240 });

    fireEvent.mouseEnter(getContainer(), { clientX: 100, clientY: 10 });

    const tooltip = await screen.findByRole("tooltip");
    // flip para a esquerda daria x negativo; deve ser reposicionada em +12
    await waitFor(() => expect(tooltip.style.left).toBe("12px"));
  });

  it("deve manter a dica dentro da tela quando estoura a borda superior", async () => {
    window.innerHeight = 5;
    renderFollow();
    Element.prototype.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;

    fireEvent.mouseEnter(getContainer(), { clientX: 10, clientY: 2 });

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(tooltip.style.top).toBe("12px"));
  });

  it("deve mostrar a dica ao tocar e escondê-la 2 segundos depois de soltar", async () => {
    renderFollow();

    fireEvent.touchStart(getContainer(), { touches: [{ clientX: 20, clientY: 20 }] });
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    vi.useFakeTimers();
    fireEvent.touchEnd(getContainer());
    act(() => {
      vi.advanceTimersByTime(2000);
      vi.advanceTimersByTime(1000); // atraso de fechamento do React Aria
    });
    vi.useRealTimers();

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("deve alternar a dica por clique em dispositivo sem hover", async () => {
    window.matchMedia = ((query: string) => ({
      matches: query === "(hover: none)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    renderFollow();

    fireEvent.click(getContainer(), { clientX: 10, clientY: 10 });
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    fireEvent.click(getContainer(), { clientX: 10, clientY: 10 });
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("não deve abrir a dica por clique quando o dispositivo tem hover", () => {
    renderFollow();

    fireEvent.click(getContainer(), { clientX: 10, clientY: 10 });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("deve reposicionar a dica quando o flip para a esquerda a deixa fora da tela", async () => {
    window.innerWidth = 300;
    Element.prototype.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;
    renderFollow({ minWidth: 200 });

    // Mouse no meio: estoura a direita (150 + 12 + 200 > 300), e o flip daria x = -62
    fireEvent.mouseEnter(getContainer(), { clientX: 150, clientY: 10 });

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(tooltip.style.left).toBe("12px"));
  });

  it("deve reposicionar a dica quando o flip para cima a deixa fora da tela", async () => {
    window.innerHeight = 100;
    Element.prototype.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;
    renderFollow();
    const container = getContainer();
    fireEvent.mouseEnter(container, { clientX: 10, clientY: 10 });
    const tooltip = await screen.findByRole("tooltip");
    // O conteúdo medido é o filho direto do role="tooltip" (contentRef)
    Object.defineProperty(tooltip.firstElementChild as HTMLElement, "scrollHeight", {
      configurable: true,
      value: 80,
    });

    // Estoura embaixo (50 + 12 + 80 > 100), e o flip daria y = 50 - 80 - 12 = -42
    fireEvent.mouseMove(container, { clientX: 10, clientY: 50 });

    await waitFor(() => expect(tooltip.style.top).toBe("12px"));
  });

  it("deve tratar Enter e Espaço como clique pelo teclado", () => {
    const originalMM = window.matchMedia;
    const spy = vi.fn().mockImplementation((query: string) => ({ matches: false, media: query }));
    window.matchMedia = spy as unknown as typeof window.matchMedia;
    renderFollow();

    fireEvent.keyDown(getContainer(), { key: "Enter" });
    fireEvent.keyDown(getContainer(), { key: " " });
    fireEvent.keyDown(getContainer(), { key: "a" });

    expect(spy).toHaveBeenCalledTimes(2);
    window.matchMedia = originalMM;
  });
});
