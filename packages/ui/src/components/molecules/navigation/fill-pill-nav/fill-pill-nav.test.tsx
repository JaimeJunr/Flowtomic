import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FillPillNav } from "./fill-pill-nav";

const ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Carteiras", href: "#carteiras" },
  { label: "Relatórios", href: "#relatorios", ariaLabel: "Abrir relatórios" },
];

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

// ResizeObserver falso: guarda os callbacks para o teste ditar o tamanho de cada elemento.
type Observed = { element: Element; callback: ResizeObserverCallback };
let observed: Observed[] = [];
class FakeResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(element: Element) {
    observed.push({ element, callback: this.callback });
  }
  unobserve() {}
  disconnect() {
    observed = observed.filter((entry) => entry.callback !== this.callback);
  }
}

function resize(element: Element, width: number, height = 40) {
  act(() => {
    for (const entry of observed.filter((item) => item.element === element)) {
      entry.callback(
        [{ target: element, contentRect: { width, height } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver
      );
    }
  });
}

const OriginalPointerEvent = window.PointerEvent;
const OriginalResizeObserver = global.ResizeObserver;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
  global.ResizeObserver = OriginalResizeObserver;
});
beforeEach(() => {
  observed = [];
  global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
});

function setup(
  props: Partial<React.ComponentProps<typeof FillPillNav>> = {},
  reducedMotion: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <FillPillNav items={ITEMS} {...props} />
    </MotionConfig>
  );
  const nav = view.container.querySelector('[data-slot="fill-pill-nav"]') as HTMLElement;
  return { ...view, nav };
}

const pills = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('[data-slot="fill-pill-nav-item"]'));

function pointer(element: Element, type: "pointerover" | "pointerout", pointerType = "mouse") {
  act(() => {
    element.dispatchEvent(new PointerTypeEvent(type, { bubbles: true, pointerType }));
  });
}

describe("FillPillNav", () => {
  it("renderiza nav nomeada com links reais e raiz com data-slot e ref", () => {
    const ref = createRef<HTMLElement>();
    const view = render(<FillPillNav ref={ref} items={ITEMS} className="extra" />);
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toHaveAttribute("data-slot", "fill-pill-nav");
    expect(nav).toHaveClass("extra");
    expect(ref.current).toBe(nav);
    expect(view.container.querySelectorAll("a[data-slot='fill-pill-nav-item']")).toHaveLength(3);
  });

  it("deixa sobrescrever o aria-label da nav", () => {
    render(<FillPillNav items={ITEMS} aria-label="Seções" />);
    expect(screen.getByRole("navigation", { name: "Seções" })).toBeInTheDocument();
  });

  it("marca o ativo com aria-current=page e só ele", () => {
    const { container } = setup({ activeHref: "#carteiras" });
    const [a, b, c] = pills(container);
    expect(a).not.toHaveAttribute("aria-current");
    expect(b).toHaveAttribute("aria-current", "page");
    expect(c).not.toHaveAttribute("aria-current");
  });

  it("esconde a cópia do rótulo dos leitores de tela e respeita ariaLabel", () => {
    const { container } = setup();
    const copies = container.querySelectorAll(
      '[data-slot="fill-pill-nav-item"] [aria-hidden="true"]'
    );
    expect(copies.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole("link", { name: "Abrir relatórios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carteiras" })).toBeInTheDocument();
  });

  it("hover com mouse marca data-hovered e sair desmarca", () => {
    const { container } = setup();
    const [pill] = pills(container);
    pointer(pill, "pointerover");
    expect(pill).toHaveAttribute("data-hovered", "true");
    pointer(pill, "pointerout");
    expect(pill).not.toHaveAttribute("data-hovered", "true");
  });

  it("toque não aciona o hover", () => {
    const { container } = setup();
    const [pill] = pills(container);
    pointer(pill, "pointerover", "touch");
    expect(pill).not.toHaveAttribute("data-hovered", "true");
  });

  it("foco por teclado aplica o mesmo estado", () => {
    const { container } = setup();
    const [pill] = pills(container);
    fireEvent.focus(pill);
    expect(pill).toHaveAttribute("data-hovered", "true");
    fireEvent.blur(pill);
    expect(pill).not.toHaveAttribute("data-hovered", "true");
  });

  it("monta o círculo de enchimento a partir do tamanho medido", () => {
    const { container } = setup();
    const [pill] = pills(container);
    resize(pill, 100, 40);
    const fill = pill.querySelector('[data-slot="fill-pill-nav-fill"]') as HTMLElement;
    expect(fill).not.toBeNull();
    const diameter = parseFloat(fill.style.width);
    expect(diameter).toBeCloseTo(Math.hypot(100, 40) + 2, 3);
  });

  it("com movimento reduzido não há círculo, só a troca de cor pelo estado", () => {
    const { container } = setup({}, "always");
    const [pill] = pills(container);
    expect(pill.querySelector('[data-slot="fill-pill-nav-fill"]')).toBeNull();
    pointer(pill, "pointerover");
    expect(pill).toHaveAttribute("data-hovered", "true");
  });

  it("logo usa logoLabel e logoHref", () => {
    const { container } = setup({ logoLabel: "Voltar ao topo", logoHref: "#topo" });
    const logo = container.querySelector('[data-slot="fill-pill-nav-logo"]');
    expect(logo).toHaveAttribute("href", "#topo");
    expect(logo).toHaveAttribute("aria-label", "Voltar ao topo");
  });

  it("em tela larga não mostra o botão de menu", () => {
    const { nav } = setup();
    resize(nav, 1024);
    expect(screen.queryByRole("button", { name: "Abrir menu" })).toBeNull();
  });

  describe("mobile", () => {
    it("largura estreita troca a cápsula pelo botão de menu", () => {
      const { nav, container } = setup();
      resize(nav, 360);
      const button = screen.getByRole("button", { name: "Abrir menu" });
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(pills(container)).toHaveLength(0);
    });

    it("abre e fecha por clique e avisa onMobileMenuToggle", async () => {
      const onToggle = vi.fn();
      const { nav } = setup({ onMobileMenuToggle: onToggle });
      resize(nav, 360);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      const button = screen.getByRole("button", { name: "Fechar menu" });
      expect(button).toHaveAttribute("aria-expanded", "true");
      const menu = document.querySelector('[data-slot="fill-pill-nav-menu"]') as HTMLElement;
      expect(menu).not.toBeNull();
      expect(button.getAttribute("aria-controls")).toBe(menu.id);
      expect(menu.querySelectorAll("a")).toHaveLength(3);
      expect(onToggle).toHaveBeenLastCalledWith(true);
      fireEvent.click(button);
      expect(onToggle).toHaveBeenLastCalledWith(false);
      await waitFor(() =>
        expect(document.querySelector('[data-slot="fill-pill-nav-menu"]')).toBeNull()
      );
    });

    it("Esc fecha o painel", async () => {
      const onToggle = vi.fn();
      const { nav } = setup({ onMobileMenuToggle: onToggle });
      resize(nav, 360);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onToggle).toHaveBeenLastCalledWith(false);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument()
      );
    });

    it("clicar num link fecha o painel", () => {
      const onToggle = vi.fn();
      const { nav } = setup({ onMobileMenuToggle: onToggle });
      resize(nav, 360);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      const menu = document.querySelector('[data-slot="fill-pill-nav-menu"]') as HTMLElement;
      fireEvent.click(menu.querySelectorAll("a")[1]);
      expect(onToggle).toHaveBeenLastCalledWith(false);
    });

    it("marca o link ativo também no painel", () => {
      const { nav } = setup({ activeHref: "#inicio" });
      resize(nav, 360);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      const menu = document.querySelector('[data-slot="fill-pill-nav-menu"]') as HTMLElement;
      expect(menu.querySelector('a[aria-current="page"]')).toHaveAttribute("href", "#inicio");
    });

    it("voltar a uma tela larga fecha o painel sem avisar", () => {
      const onToggle = vi.fn();
      const { nav } = setup({ onMobileMenuToggle: onToggle });
      resize(nav, 360);
      fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
      onToggle.mockClear();
      resize(nav, 1024);
      expect(document.querySelector('[data-slot="fill-pill-nav-menu"]')).toBeNull();
      expect(onToggle).not.toHaveBeenCalled();
    });
  });
});
