import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DriftWall, type DriftWallItem } from "./drift-wall";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

const items: DriftWallItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `t${i}`,
  label: `Tela ${i}`,
  content: <span>Painel {i}</span>,
}));

function renderWall(
  props: Partial<React.ComponentProps<typeof DriftWall>> = {},
  reducedMotion: "never" | "always" = "never"
) {
  return render(
    <MotionConfig reducedMotion={reducedMotion}>
      <DriftWall items={items} columns={3} {...props} />
    </MotionConfig>
  );
}

const root = (c: HTMLElement) => c.querySelector('[data-slot="drift-wall"]') as HTMLDivElement;
const plane = (c: HTMLElement) =>
  c.querySelector('[data-slot="drift-wall-plane"]') as HTMLDivElement;
const lists = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>('[data-slot="drift-wall-column"] > div'));

const translateY = (s: string) => Number(/translateY\((-?[\d.]+)px\)/.exec(s)?.[1]);

function useFakeLoop() {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
}

describe("DriftWall", () => {
  it("marca a raiz e as partes", () => {
    const { container } = renderWall();
    expect(root(container)).toBeInTheDocument();
    expect(plane(container)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="drift-wall-column"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-slot="drift-wall-tile"]').length).toBeGreaterThan(6);
  });

  it("repassa ref e className por ultimo", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWall({ ref, className: "h-96" });
    expect(ref.current).toBe(root(container));
    expect(root(container)).toHaveClass("relative", "overflow-hidden", "h-96");
  });

  it("aplica perspectiva e a transformacao 3D da parede", () => {
    const { container } = renderWall({ perspective: 900, depth: 100, tilt: 10, turn: -8, roll: 2 });
    expect(root(container).style.perspective).toBe("900px");
    expect(plane(container).style.transform).toBe(
      "translateZ(-100px) rotateX(10deg) rotateY(-8deg) rotateZ(2deg)"
    );
  });

  it("aplica mascara de esmaecer e a remove com fade 0", () => {
    const { container, rerender } = renderWall({ fade: 0.6 });
    expect(root(container).style.maskImage || root(container).style.webkitMaskImage).toBeTruthy();
    rerender(
      <MotionConfig reducedMotion="never">
        <DriftWall items={items} columns={3} fade={0} />
      </MotionConfig>
    );
    expect(root(container).style.maskImage).toBe("");
  });

  it("dimensiona o ladrilho e mostra a imagem com alt", () => {
    const { container } = renderWall({
      items: [
        { id: "a", label: "Fluxo de caixa", image: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
      ],
      columns: 1,
      tileWidth: 220,
      tileHeight: 140,
    });
    const tile = container.querySelector('[data-slot="drift-wall-tile"]') as HTMLElement;
    expect(tile.style.width).toBe("220px");
    expect(tile.style.height).toBe("140px");
    expect(container.querySelector("img")).toHaveAttribute("alt", "Fluxo de caixa");
  });

  it("cai no rotulo quando nao ha imagem nem conteudo", () => {
    renderWall({ items: [{ id: "a", label: "Conciliacao" }], columns: 1 });
    expect(screen.getAllByText("Conciliacao").length).toBeGreaterThan(0);
  });

  it("e decorativa quando nenhum item tem href", () => {
    const { container } = renderWall();
    expect(root(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("com href expoe cada link uma vez e esconde as duplicatas", () => {
    const linked = items.map((it, i) => ({ ...it, href: `/tela/${i}` }));
    const { container } = renderWall({ items: linked });
    expect(root(container)).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByRole("link")).toHaveLength(6);
    const hidden = container.querySelectorAll('a[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThan(0);
    for (const a of hidden) expect(a).toHaveAttribute("tabindex", "-1");
  });

  it("veu em repouso usa 1 - dim", () => {
    const { container } = renderWall({ dim: 0.25 });
    const veil = container.querySelector('[data-slot="drift-wall-veil"]') as HTMLElement;
    expect(Number(veil.style.opacity)).toBeCloseTo(0.75);
  });

  it("lança erro para opcoes invalidas", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DriftWall items={[]} />)).toThrow(/items/);
    expect(() => render(<DriftWall items={items} columns={13} />)).toThrow(/13/);
    spy.mockRestore();
  });

  it("o laco move a coluna com o tempo", () => {
    useFakeLoop();
    const { container } = renderWall({ speed: 60 });
    const before = lists(container).map((l) => l.style.transform);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const after = lists(container).map((l) => l.style.transform);
    expect(after[0]).not.toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
  });

  it("colunas vizinhas andam em sentidos opostos", () => {
    useFakeLoop();
    const { container } = renderWall({ speed: 60, variance: 0 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const [up, down] = lists(container).map((l) => translateY(l.style.transform));
    // altura da lista = 4 linhas de (132 + 18); o offset vive em (-altura, 0]
    expect(up).toBeGreaterThan(-300);
    expect(down).toBeLessThan(-300);
  });

  it("pauseOnHover para o laco enquanto o ponteiro esta na raiz", () => {
    useFakeLoop();
    const { container } = renderWall({ speed: 60, pauseOnHover: true });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.pointerEnter(root(container));
    const frozen = lists(container)[0].style.transform;
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(lists(container)[0].style.transform).toBe(frozen);
    fireEvent.pointerLeave(root(container));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(lists(container)[0].style.transform).not.toBe(frozen);
  });

  it("movimento reduzido nao move o laco", () => {
    useFakeLoop();
    const { container } = renderWall({ speed: 60 }, "always");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    for (const l of lists(container)) expect(l.style.transform).toBe("translateY(0px)");
  });

  it("paralaxe inclina a parede com o ponteiro", async () => {
    const { container } = renderWall({ parallax: 1 });
    const r = root(container);
    r.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 400,
        bottom: 200,
        width: 400,
        height: 200,
        x: 0,
        y: 0,
      }) as DOMRect;
    const base = plane(container).style.transform;
    fireEvent.pointerMove(r, { clientX: 400, clientY: 0 });
    await waitFor(() => expect(plane(container).style.transform).not.toBe(base));
    fireEvent.pointerLeave(r);
    await waitFor(() => expect(plane(container).style.transform).toBe(base));
  });

  it("parallax 0 e movimento reduzido nao mexem na parede", () => {
    const a = renderWall({ parallax: 0 });
    const base = plane(a.container).style.transform;
    fireEvent.pointerMove(root(a.container), { clientX: 10, clientY: 10 });
    expect(plane(a.container).style.transform).toBe(base);
    a.unmount();
    const b = renderWall({ parallax: 1 }, "always");
    const base2 = plane(b.container).style.transform;
    fireEvent.pointerMove(root(b.container), { clientX: 10, clientY: 10 });
    expect(plane(b.container).style.transform).toBe(base2);
  });

  it("movimento reduzido zera a elevacao no hover", () => {
    const { container } = renderWall({ lift: 80 }, "always");
    expect(root(container).style.getPropertyValue("--drift-lift")).toBe("0px");
    const normal = renderWall({ lift: 80 });
    expect(root(normal.container).style.getPropertyValue("--drift-lift")).toBe("80px");
  });
});
