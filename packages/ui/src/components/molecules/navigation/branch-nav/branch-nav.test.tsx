import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { BranchNav, type BranchNavItem } from "./branch-nav";
import {
  activePath,
  activePathLength,
  branchPath,
  initialValue,
  normalizeOpen,
  trunkPath,
} from "./branch-nav-utils";

const ITEMS: BranchNavItem[] = [
  {
    label: "Primeiros passos",
    children: [
      { value: "instalacao", label: "Instalação" },
      { value: "inicio-rapido", label: "Início rápido" },
      { value: "configuracao", label: "Configuração" },
    ],
  },
  {
    label: "Componentes",
    children: [
      { value: "botoes", label: "Botões", href: "/botoes" },
      { value: "tipografia", label: "Tipografia" },
    ],
  },
  { value: "changelog", label: "Changelog" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(
  props: Partial<React.ComponentProps<typeof BranchNav>> = {},
  mode: "always" | "never" = "always"
) {
  return render(
    <MotionConfig reducedMotion={mode}>
      <BranchNav items={ITEMS} {...props} />
    </MotionConfig>
  );
}

describe("utilitários de geometria", () => {
  it("branchPath começa no tronco, termina em indent-4 e desce com o índice", () => {
    const first = branchPath(0, 32, 12, 32, 8);
    const third = branchPath(2, 32, 12, 32, 8);
    expect(first.startsWith("M 12 ")).toBe(true);
    expect(first.endsWith("H 28")).toBe(true);
    const y = (d: string) => Number(d.split(" ")[2]);
    expect(y(third)).toBeGreaterThan(y(first));
    expect(y(third) - y(first)).toBe(64);
  });

  it("activePathLength cresce com o índice e casa com o path", () => {
    const lengths = [0, 1, 2].map((i) => activePathLength(i, 32, 12, 32, 8));
    expect(lengths[1]).toBeGreaterThan(lengths[0] as number);
    expect(lengths[2]).toBeGreaterThan(lengths[1] as number);
    expect(lengths[1] - lengths[0]).toBeCloseTo(32, 5);
    expect(activePath(1, 32, 12, 32, 8).startsWith("M 12 0 V ")).toBe(true);
  });

  it("limita o raio ao que cabe sem gerar coordenada negativa", () => {
    expect(branchPath(0, 10, 12, 32, 50)).toBe("M 12 0 Q 12 5 17 5 H 28");
  });

  it("trunkPath desce até o centro do último filho", () => {
    expect(trunkPath(3, 32, 12)).toBe("M 12 0 V 80");
  });

  it("normalizeOpen aceita número, lista e -1; recusa índice fora do intervalo", () => {
    expect([...normalizeOpen(0, 2)]).toEqual([0]);
    expect([...normalizeOpen([0, 1], 2)]).toEqual([0, 1]);
    expect(normalizeOpen(-1, 2).size).toBe(0);
    expect(() => normalizeOpen(5, 2)).toThrow(/received 5, expected an integer from -1 to 1/);
  });

  it("initialValue prefere o informado, depois o 1º filho aberto, depois a folha do topo", () => {
    expect(initialValue(ITEMS, new Set([1]), "x")).toBe("x");
    expect(initialValue(ITEMS, new Set([1]))).toBe("botoes");
    expect(initialValue(ITEMS, new Set())).toBe("changelog");
  });
});

describe("BranchNav", () => {
  it("renderiza nav acessível com ref, className, data-slot e aria-label padrão", () => {
    const ref = createRef<HTMLElement>();
    const { container } = setup({ ref, className: "extra" });
    const nav = container.querySelector('[data-slot="branch-nav"]') as HTMLElement;
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveClass("extra");
    expect(ref.current).toBe(nav);
    expect(nav).toHaveAttribute("aria-label", "Navegação");
  });

  it("abre a primeira seção por padrão e marca o primeiro filho como ativo", () => {
    setup();
    expect(screen.getByRole("button", { name: "Primeiros passos" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: "Componentes" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: "Instalação" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.queryByText("Tipografia")).not.toBeInTheDocument();
  });

  it("clicar num filho muda o aria-current e chama onValueChange(value, item)", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    fireEvent.click(screen.getByRole("button", { name: "Configuração" }));
    expect(onValueChange).toHaveBeenCalledWith("configuracao", {
      value: "configuracao",
      label: "Configuração",
    });
    expect(screen.getByRole("button", { name: "Configuração" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Instalação" })).not.toHaveAttribute("aria-current");
  });

  it("modo controlado só muda quando o pai muda value", () => {
    const { rerender } = setup({ value: "instalacao" });
    fireEvent.click(screen.getByRole("button", { name: "Configuração" }));
    expect(screen.getByRole("button", { name: "Instalação" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    rerender(
      <MotionConfig reducedMotion="always">
        <BranchNav items={ITEMS} value="configuracao" />
      </MotionConfig>
    );
    expect(screen.getByRole("button", { name: "Configuração" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("alterna a seção, chama onToggle e tira os filhos da árvore de a11y", () => {
    const onToggle = vi.fn();
    setup({ onToggle });
    const header = screen.getByRole("button", { name: "Primeiros passos" });
    fireEvent.click(header);
    expect(onToggle).toHaveBeenCalledWith(0, false);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Instalação" })).not.toBeInTheDocument();
    fireEvent.click(header);
    expect(onToggle).toHaveBeenLastCalledWith(0, true);
    expect(screen.getByRole("button", { name: "Instalação" })).toBeInTheDocument();
  });

  it("aria-controls aponta para o painel da seção aberta", () => {
    const { container } = setup();
    const header = screen.getByRole("button", { name: "Primeiros passos" });
    const panel = container.querySelector(`[id="${header.getAttribute("aria-controls")}"]`);
    expect(panel).toContainElement(screen.getByRole("button", { name: "Instalação" }));
  });

  it("dobra com animação: os filhos saem ao fechar", async () => {
    setup({}, "never");
    fireEvent.click(screen.getByRole("button", { name: "Primeiros passos" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Instalação" })).not.toBeInTheDocument()
    );
  });

  it("defaultOpen=-1 deixa tudo fechado; [0,1] abre duas", () => {
    const closed = setup({ defaultOpen: -1 });
    expect(screen.queryByRole("button", { name: "Instalação" })).not.toBeInTheDocument();
    closed.unmount();
    setup({ defaultOpen: [0, 1] });
    expect(screen.getByRole("button", { name: "Instalação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Botões" })).toBeInTheDocument();
  });

  it("filho com href vira link e dispara onValueChange", () => {
    const onValueChange = vi.fn();
    setup({ defaultOpen: 1, onValueChange });
    const link = screen.getByRole("link", { name: "Botões" });
    expect(link).toHaveAttribute("href", "/botoes");
    link.addEventListener("click", (event) => event.preventDefault()); // jsdom não implementa navegação
    fireEvent.click(link);
    expect(onValueChange).toHaveBeenCalledWith(
      "botoes",
      expect.objectContaining({ href: "/botoes" })
    );
  });

  it("folha no nível de cima é selecionável e não tem aria-expanded", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    const leaf = screen.getByRole("button", { name: "Changelog" });
    expect(leaf).not.toHaveAttribute("aria-expanded");
    fireEvent.click(leaf);
    expect(leaf).toHaveAttribute("aria-current", "page");
    expect(onValueChange).toHaveBeenCalledWith("changelog", expect.any(Object));
  });

  it("desenha tronco, galhos e a linha de destaque com o comprimento em px", () => {
    const { container } = setup({ defaultValue: "inicio-rapido" });
    const svg = container.querySelector('[data-slot="branch-nav-lines"]') as SVGElement;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("height", "96");
    expect(svg.querySelectorAll("path")).toHaveLength(5);
    const active = container.querySelector(
      '[data-slot="branch-nav-active-line"]'
    ) as SVGPathElement;
    const length = activePathLength(1, 32, 12, 32, 8);
    expect(Number(active.getAttribute("stroke-dasharray"))).toBeCloseTo(length, 5);
    expect(Number(active.getAttribute("stroke-dashoffset"))).toBe(0);
    expect(active).toHaveClass("stroke-primary");
  });

  it("respeita rowHeight, indent e trunkX nas linhas", () => {
    const { container } = setup({ rowHeight: 40, indent: 40, trunkX: 16 });
    const svg = container.querySelector('[data-slot="branch-nav-lines"]') as SVGElement;
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "120");
  });

  it("com movimento reduzido o destaque nasce pronto, sem deslocamento", () => {
    const { container } = setup();
    const active = container.querySelector(
      '[data-slot="branch-nav-active-line"]'
    ) as SVGPathElement;
    expect(active.getAttribute("stroke-dashoffset")).toBe("0");
  });

  it("com animação o destaque começa recolhido e vai a zero", async () => {
    const { container } = setup({}, "never");
    const active = () =>
      container.querySelector('[data-slot="branch-nav-active-line"]') as SVGPathElement;
    await act(async () => {});
    await waitFor(() => expect(Number(active().getAttribute("stroke-dashoffset") ?? 0)).toBe(0));
  });

  it("seção fechada não desenha linhas", () => {
    const { container } = setup({ defaultOpen: -1 });
    expect(container.querySelector('[data-slot="branch-nav-lines"]')).toBeNull();
  });

  it("marca partes com data-slot", () => {
    const { container } = setup();
    expect(container.querySelectorAll('[data-slot="branch-nav-section"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-slot="branch-nav-item"]').length).toBeGreaterThan(3);
    const nav = within(container).getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});
