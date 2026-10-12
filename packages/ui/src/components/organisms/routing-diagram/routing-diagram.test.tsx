import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RoutingDiagram,
  RoutingDiagramDescription,
  RoutingDiagramProvider,
} from "./routing-diagram";
import type { RoutingScenario } from "./types";

const scenarios: RoutingScenario[] = [
  {
    value: "disp",
    label: "Disponibilidade",
    description: "Descricao da disponibilidade",
    root: {
      kind: "decision",
      id: "caiu",
      question: "O provedor caiu?",
      branches: [
        {
          label: "primário",
          to: {
            kind: "target",
            id: "a",
            title: "Modelo A",
            subtitle: "prov-a/modelo",
            badge: "Fora do ar",
            status: "down",
            fallback: {
              label: "reserva",
              to: { kind: "target", id: "b", title: "Modelo B", subtitle: "prov-b/modelo" },
            },
          },
        },
      ],
    },
    activePath: ["caiu", "a", "b"],
  },
  {
    value: "custo",
    label: "Custo",
    description: "Descricao do custo",
    root: {
      kind: "decision",
      id: "barato",
      question: "Menor custo?",
      branches: [
        { label: "sim", to: { kind: "target", id: "g", title: "Modelo G", badge: "R$ 150" } },
        {
          label: "não",
          to: {
            kind: "decision",
            id: "volume",
            question: "Volume alto?",
            branches: [
              { label: "sim", to: { kind: "target", id: "c", title: "Modelo C" } },
              { label: "não", to: { kind: "target", id: "d", title: "Modelo D" } },
            ],
          },
        },
      ],
    },
    activePath: ["barato", "volume", "c"],
  },
];

const slot = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`));
const target = (container: HTMLElement, text: string) => {
  const found = slot(container, "routing-diagram-target").find((el) =>
    el.textContent?.includes(text)
  );
  if (!found) throw new Error(`destino ${text} ausente`);
  return found;
};

function fireIntersection(isIntersecting: boolean) {
  const observed = vi.fn();
  const original = global.IntersectionObserver;
  global.IntersectionObserver = vi
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => ({
      observe: (el: Element) => {
        observed(el);
        callback(
          [{ isIntersecting, target: el } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      },
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    })) as unknown as typeof IntersectionObserver;
  return () => {
    global.IntersectionObserver = original;
  };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("RoutingDiagram", () => {
  it("1. renderiza origem, decisões, destinos e rótulos do cenário inicial", () => {
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(slot(container, "routing-diagram")).toHaveLength(1);
    expect(slot(container, "routing-diagram-source")).toHaveLength(1);
    expect(
      within(slot(container, "routing-diagram-source")[0]).getByText("App")
    ).toBeInTheDocument();
    expect(slot(container, "routing-diagram-decision")).toHaveLength(1);
    expect(screen.getByText("O provedor caiu?")).toBeInTheDocument();
    expect(slot(container, "routing-diagram-target")).toHaveLength(2);
    expect(screen.getByText("prov-a/modelo")).toBeInTheDocument();
    expect(screen.getByText("Fora do ar")).toBeInTheDocument();
    expect(slot(container, "routing-diagram-edge-label").map((l) => l.textContent)).toEqual(
      expect.arrayContaining(["primário", "reserva"])
    );
    expect(slot(container, "routing-diagram-canvas")).toHaveLength(1);
  });

  it("usa sourceLabel e aceita um nó de origem próprio", () => {
    const { container, rerender } = render(
      <RoutingDiagram scenarios={scenarios} sourceLabel="Cliente" />
    );
    expect(
      within(slot(container, "routing-diagram-source")[0]).getByText("Cliente")
    ).toBeInTheDocument();
    rerender(<RoutingDiagram scenarios={scenarios} source={<b>Minha origem</b>} />);
    expect(screen.getByText("Minha origem")).toBeInTheDocument();
  });

  it("2. destino e rótulos do activePath têm data-active=true; os demais, false", () => {
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(target(container, "Modelo B")).toHaveAttribute("data-active", "true");
    expect(target(container, "Modelo A")).toHaveAttribute("data-active", "false");
    const labels = slot(container, "routing-diagram-edge-label");
    expect(labels.every((l) => l.getAttribute("data-active") === "true")).toBe(true);
  });

  it("2b. rótulos fora do caminho ficam com data-active=false", async () => {
    const user = userEvent.setup({ skipHover: true });
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    await user.click(screen.getByRole("tab", { name: "Custo" }));
    const byText = (t: string) =>
      slot(container, "routing-diagram-edge-label").filter((l) => l.textContent === t);
    // "sim" sai de "Menor custo?" (fora) e de "Volume alto?" (no caminho); "não" de "Menor custo?" (no caminho) e de "Volume alto?" (fora)
    expect(
      byText("sim")
        .map((l) => l.getAttribute("data-active"))
        .sort()
    ).toEqual(["false", "true"]);
    expect(
      byText("não")
        .map((l) => l.getAttribute("data-active"))
        .sort()
    ).toEqual(["false", "true"]);
    expect(target(container, "Modelo C")).toHaveAttribute("data-active", "true");
    expect(target(container, "Modelo D")).toHaveAttribute("data-active", "false");
    expect(target(container, "Modelo G")).toHaveAttribute("data-active", "false");
  });

  it("3. trocar de aba troca o caminho ativo e a descrição", async () => {
    const user = userEvent.setup({ skipHover: true });
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Custo" }));
    expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
    expect(screen.queryByText("Descricao da disponibilidade")).not.toBeInTheDocument();
    expect(target(container, "Modelo C")).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("tablist", { name: "Cenários" })).toBeInTheDocument();
  });

  it("4. controlado: chama onValueChange e, sem value novo, nada muda", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <RoutingDiagram scenarios={scenarios} value="disp" onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("tab", { name: "Custo" }));
    expect(onValueChange).toHaveBeenCalledWith("custo");
    expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
    expect(target(container, "Modelo B")).toHaveAttribute("data-active", "true");
    rerender(<RoutingDiagram scenarios={scenarios} value="custo" onValueChange={onValueChange} />);
    expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
  });

  it("aceita defaultValue", () => {
    render(<RoutingDiagram scenarios={scenarios} defaultValue="custo" />);
    expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
  });

  it("5. com um cenário só, não há abas", () => {
    render(<RoutingDiagram scenarios={[scenarios[0]]} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("6. aria-label descreve o caminho ativo e muda ao trocar de cenário", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<RoutingDiagram scenarios={scenarios} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "aria-label",
      "App, depois O provedor caiu?: primário, depois Modelo A (prov-a/modelo): reserva, depois Modelo B (prov-b/modelo)"
    );
    await user.click(screen.getByRole("tab", { name: "Custo" }));
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "App, depois Menor custo?: não, depois Volume alto?: sim, depois Modelo C"
    );
  });

  it("ariaLabel sobrescreve o texto gerado e o svg é decorativo", () => {
    const { container } = render(<RoutingDiagram scenarios={scenarios} ariaLabel="Meu texto" />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Meu texto");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("lista sr-only com aria-live descreve os passos do caminho ativo", () => {
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    const list = slot(container, "routing-diagram-steps")[0];
    expect(list).toHaveAttribute("aria-live", "polite");
    expect(list).toHaveClass("sr-only");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent)
    ).toEqual([
      "Origem: App",
      "Pergunta: O provedor caiu?, resposta: primário",
      "Destino intermediário: Modelo A (prov-a/modelo), reserva",
      "Destino: Modelo B (prov-b/modelo)",
    ]);
  });

  it("7. árvore com decisão aninhada e destino com fallback renderiza todos os nós", async () => {
    const user = userEvent.setup({ skipHover: true });
    const { container } = render(<RoutingDiagram scenarios={scenarios} defaultValue="custo" />);
    expect(slot(container, "routing-diagram-decision")).toHaveLength(2);
    expect(slot(container, "routing-diagram-target")).toHaveLength(3);
    await user.click(screen.getByRole("tab", { name: "Disponibilidade" }));
    expect(target(container, "Modelo A")).toBeInTheDocument();
    expect(target(container, "Modelo B")).toBeInTheDocument();
  });

  it("8. status down marca data-status=down no destino", () => {
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(target(container, "Modelo A")).toHaveAttribute("data-status", "down");
    expect(target(container, "Modelo B")).toHaveAttribute("data-status", "ok");
  });

  it("9. movimento reduzido: sem pulso", () => {
    const restore = fireIntersection(true);
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <RoutingDiagram scenarios={scenarios} />
      </MotionConfig>
    );
    expect(slot(container, "routing-diagram-pulse")).toHaveLength(0);
    restore();
  });

  it("com a tela visível e sem movimento reduzido, há o ponto de pulso; pulse=false o remove", () => {
    const restore = fireIntersection(true);
    const { container, rerender } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(slot(container, "routing-diagram-pulse")).toHaveLength(1);
    rerender(<RoutingDiagram scenarios={scenarios} pulse={false} />);
    expect(slot(container, "routing-diagram-pulse")).toHaveLength(0);
    restore();
  });

  it("sem aparecer na tela, o caminho não se desenha nem pulsa", () => {
    const restore = fireIntersection(false);
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(slot(container, "routing-diagram-pulse")).toHaveLength(0);
    expect(slot(container, "routing-diagram-edge-active")).toHaveLength(0);
    restore();
  });

  it("desenha o traço ativo quando entra na tela", () => {
    const restore = fireIntersection(true);
    const { container } = render(<RoutingDiagram scenarios={scenarios} />);
    expect(slot(container, "routing-diagram-edge-active")).toHaveLength(3);
    restore();
  });

  describe("10. autoPlay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("avança de cenário a cada 5 s", () => {
      render(<RoutingDiagram scenarios={scenarios} autoPlay />);
      expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
    });

    it("pausa no hover e retoma ao sair", () => {
      const { container } = render(<RoutingDiagram scenarios={scenarios} autoPlay />);
      const root = slot(container, "routing-diagram")[0];
      fireEvent.pointerEnter(root);
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
      fireEvent.pointerLeave(root);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
    });

    it("para de vez depois de um clique em aba", () => {
      render(<RoutingDiagram scenarios={scenarios} autoPlay />);
      const tab = screen.getByRole("tab", { name: "Disponibilidade" });
      fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
      fireEvent.mouseDown(screen.getByRole("tab", { name: "Custo" }), {
        button: 0,
        ctrlKey: false,
      });
      expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(screen.getByText("Descricao do custo")).toBeInTheDocument();
    });

    it("não troca sozinho com movimento reduzido", () => {
      render(
        <MotionConfig reducedMotion="always">
          <RoutingDiagram scenarios={scenarios} autoPlay />
        </MotionConfig>
      );
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(screen.getByText("Descricao da disponibilidade")).toBeInTheDocument();
    });
  });

  it("11. activePath com id inexistente não quebra: nada ativo e console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const broken = [{ ...scenarios[0], activePath: ["caiu", "nao-existe"] }];
    const { container } = render(<RoutingDiagram scenarios={broken} />);
    const nodes = [
      ...slot(container, "routing-diagram-target"),
      ...slot(container, "routing-diagram-decision"),
      ...slot(container, "routing-diagram-edge-label"),
    ];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((n) => n.getAttribute("data-active") === "false")).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("nao-existe"));
    warn.mockRestore();
  });

  it("tone brand pinta o destino ativo com --primary", () => {
    const restore = fireIntersection(true);
    const { container } = render(<RoutingDiagram scenarios={scenarios} tone="brand" />);
    expect(target(container, "Modelo B")).toHaveClass("border-primary");
    expect(slot(container, "routing-diagram-edge-active")[0]).toHaveAttribute(
      "stroke",
      "var(--primary)"
    );
    restore();
  });

  it("renderDescription substitui o parágrafo padrão", () => {
    render(
      <RoutingDiagram
        scenarios={scenarios}
        renderDescription={(d) => <aside data-testid="desc">{d}</aside>}
      />
    );
    expect(screen.getByTestId("desc")).toHaveTextContent("Descricao da disponibilidade");
  });

  it("RoutingDiagramDescription fora do diagrama acompanha o cenário via provider", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(
      <RoutingDiagramProvider scenarios={scenarios}>
        <RoutingDiagramDescription data-testid="fora" />
        <RoutingDiagram renderDescription={() => null} />
      </RoutingDiagramProvider>
    );
    expect(screen.getByTestId("fora")).toHaveTextContent("Descricao da disponibilidade");
    await user.click(screen.getByRole("tab", { name: "Custo" }));
    expect(screen.getByTestId("fora")).toHaveTextContent("Descricao do custo");
    expect(screen.getAllByText("Descricao do custo")).toHaveLength(1);
  });

  it("sem cenários, renderiza a moldura vazia sem quebrar", () => {
    const { container } = render(<RoutingDiagram scenarios={[]} />);
    expect(slot(container, "routing-diagram")).toHaveLength(1);
  });

  it("repassa ref, className e atributos para a raiz", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <RoutingDiagram scenarios={scenarios} ref={ref} className="extra" id="rd" />
    );
    const root = slot(container, "routing-diagram")[0];
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("id", "rd");
  });
});
