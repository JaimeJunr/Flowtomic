import { describe, expect, it } from "vitest";
import {
  chooseOrientation,
  computeLayout,
  estimateDecisionWidth,
  estimateLabelWidth,
  estimateTargetWidth,
  horizontalMinWidth,
  nodeText,
  pointOnCubic,
  resolvePath,
  SOURCE_ID,
} from "./layout";
import type { RoutingNode, RoutingScenario } from "./types";

const tree: RoutingNode = {
  kind: "decision",
  id: "d1",
  question: "Pago?",
  branches: [
    {
      label: "sim",
      to: {
        kind: "target",
        id: "a",
        title: "A",
        fallback: { label: "reserva", to: { kind: "target", id: "b", title: "B" } },
      },
    },
    {
      label: "não",
      to: {
        kind: "decision",
        id: "d2",
        question: "Volume?",
        branches: [
          { label: "sim", to: { kind: "target", id: "c", title: "C" } },
          { label: "não", to: { kind: "target", id: "d", title: "D" } },
        ],
      },
    },
  ],
};

const byId = (r: ReturnType<typeof computeLayout>, id: string) => {
  const found = r.nodes.find((n) => n.id === id);
  if (!found) throw new Error(`nó ${id} ausente`);
  return found;
};

describe("computeLayout horizontal", () => {
  const r = computeLayout(tree, { orientation: "horizontal", width: 1000 });

  it("cria a origem, todos os nós e uma aresta por vínculo", () => {
    expect(r.nodes.map((n) => n.id).sort()).toEqual(
      [SOURCE_ID, "a", "b", "c", "d", "d1", "d2"].sort()
    );
    expect(r.edges).toHaveLength(r.nodes.length - 1);
  });

  it("coloca uma coluna por profundidade, da esquerda para a direita", () => {
    expect(byId(r, SOURCE_ID).depth).toBe(0);
    expect(byId(r, "d1").depth).toBe(1);
    expect(byId(r, "b").depth).toBe(3);
    expect(byId(r, SOURCE_ID).x).toBeLessThan(byId(r, "d1").x);
    expect(byId(r, "d1").x).toBeLessThan(byId(r, "a").x);
    expect(byId(r, "a").x).toBeLessThan(byId(r, "b").x);
  });

  it("ordena as linhas pela ordem das folhas e centraliza o pai nos filhos", () => {
    const ys = ["b", "c", "d"].map((id) => byId(r, id).y);
    expect(ys[0]).toBeLessThan(ys[1]);
    expect(ys[1]).toBeLessThan(ys[2]);
    const mid = (id: string) => byId(r, id).y + byId(r, id).h / 2;
    expect(mid("d2")).toBeCloseTo((mid("c") + mid("d")) / 2, 1);
    expect(mid(SOURCE_ID)).toBeCloseTo(mid("d1"), 1);
  });

  it("nenhum nó ultrapassa a moldura", () => {
    for (const n of r.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.x + n.w).toBeLessThanOrEqual(r.width);
      expect(n.y + n.h).toBeLessThanOrEqual(r.height);
    }
  });

  it("arestas saem do lado direito e chegam no esquerdo, com rótulos", () => {
    const edge = r.edges.find((e) => e.id === "d1>a");
    expect(edge?.label).toBe("sim");
    expect(edge?.points[0].x).toBe(byId(r, "d1").x + byId(r, "d1").w);
    expect(edge?.points[3].x).toBe(byId(r, "a").x);
    expect(edge?.points[1].y).toBe(edge?.points[0].y);
    expect(edge?.points[2].y).toBe(edge?.points[3].y);
    expect(edge?.d.startsWith("M ")).toBe(true);
    expect(r.edges.find((e) => e.id === "a>b")?.label).toBe("reserva");
    expect(r.edges.find((e) => e.id === `${SOURCE_ID}>d1`)?.label).toBeUndefined();
  });

  it("o ponto médio da aresta fica entre as pontas", () => {
    const edge = r.edges.find((e) => e.id === "d1>a");
    if (!edge) throw new Error("aresta ausente");
    expect(edge.mid.x).toBeGreaterThan(edge.points[0].x);
    expect(edge.mid.x).toBeLessThan(edge.points[3].x);
  });

  it("a largura crescente aumenta o espaço entre colunas até o teto", () => {
    const narrow = computeLayout(tree, { orientation: "horizontal", width: 900 });
    const wide = computeLayout(tree, { orientation: "horizontal", width: 1600 });
    expect(byId(wide, "a").x).toBeGreaterThan(byId(narrow, "a").x);
    expect(wide.width).toBe(1600);
  });

  it("largura curta mantém o espaço mínimo e a moldura cresce além do contêiner", () => {
    const small = computeLayout(tree, { orientation: "horizontal", width: 300 });
    expect(small.width).toBeGreaterThan(300);
    expect(
      byId(small, "d1").x - (byId(small, SOURCE_ID).x + byId(small, SOURCE_ID).w)
    ).toBeGreaterThanOrEqual(48);
  });
});

describe("computeLayout vertical", () => {
  const r = computeLayout(tree, { orientation: "vertical", width: 360 });

  it("empilha por profundidade, de cima para baixo", () => {
    expect(byId(r, SOURCE_ID).y).toBeLessThan(byId(r, "d1").y);
    expect(byId(r, "d1").y).toBeLessThan(byId(r, "a").y);
    expect(byId(r, "a").y).toBeLessThan(byId(r, "b").y);
  });

  it("espalha as folhas na horizontal e mantém tudo dentro de 360 px", () => {
    const xs = ["b", "c", "d"].map((id) => byId(r, id).x);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
    expect(r.width).toBeGreaterThanOrEqual(360);
  });

  it("a origem vira uma faixa estreita no topo", () => {
    const source = byId(r, SOURCE_ID);
    expect(source.h).toBeLessThanOrEqual(48);
    expect(source.y).toBeLessThan(byId(r, "d1").y);
  });

  it("arestas saem por baixo e chegam por cima, na vertical", () => {
    const edge = r.edges.find((e) => e.id === "d1>a");
    if (!edge) throw new Error("aresta ausente");
    expect(edge.points[0].y).toBe(byId(r, "d1").y + byId(r, "d1").h);
    expect(edge.points[3].y).toBe(byId(r, "a").y);
    expect(edge.points[1].x).toBe(edge.points[0].x);
    expect(edge.points[2].x).toBe(edge.points[3].x);
  });
});

describe("computeLayout casos pequenos", () => {
  it("um destino sozinho tem origem e uma aresta", () => {
    const r = computeLayout(
      { kind: "target", id: "t", title: "T" },
      { orientation: "horizontal", width: 800 }
    );
    expect(r.nodes).toHaveLength(2);
    expect(r.edges).toHaveLength(1);
  });
});

describe("pointOnCubic", () => {
  const pts = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 10 },
    { x: 30, y: 10 },
  ] as [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  it("t=0 e t=1 devolvem as pontas, t=0.5 o centro", () => {
    expect(pointOnCubic(pts, 0)).toEqual(pts[0]);
    expect(pointOnCubic(pts, 1)).toEqual(pts[3]);
    expect(pointOnCubic(pts, 0.5)).toEqual({ x: 15, y: 5 });
  });
});

describe("nodeText", () => {
  it("extrai texto de strings, números e elementos aninhados", () => {
    expect(nodeText("a")).toBe("a");
    expect(nodeText(3)).toBe("3");
    expect(nodeText(null)).toBe("");
    expect(nodeText(["x", 1])).toBe("x1");
  });
});

describe("resolvePath", () => {
  const scenario: RoutingScenario = {
    value: "s",
    label: "S",
    root: tree,
    activePath: ["d1", "a", "b"],
  };

  it("gera chaves de aresta, passos e aria-label", () => {
    const p = resolvePath(scenario, "App");
    expect(p.valid).toBe(true);
    expect(p.edgeKeys).toEqual([`${SOURCE_ID}>d1`, "d1>a", "a>b"]);
    expect(p.ariaLabel).toBe("App, depois Pago?: sim, depois A: reserva, depois B");
    expect(p.steps[0].text).toBe("Origem: App");
  });

  it("id inexistente invalida o caminho inteiro", () => {
    const p = resolvePath({ ...scenario, activePath: ["d1", "zzz"] }, "App");
    expect(p.valid).toBe(false);
    expect(p.missing).toEqual(["zzz"]);
    expect(p.ids).toEqual([]);
    expect(p.edgeKeys).toEqual([]);
  });
});

describe("tamanhos pelo conteúdo", () => {
  const fixed = { targetWidth: () => 260, decisionWidth: () => 200 };
  const colGap = (r: ReturnType<typeof computeLayout>, a: string, b: string) => {
    const left = byId(r, a);
    return byId(r, b).x - (left.x + left.w);
  };

  it("destino ajusta a largura ao conteúdo, entre 240 e 320 px", () => {
    const short = estimateTargetWidth({ kind: "target", id: "x", title: "A" });
    const long = estimateTargetWidth({
      kind: "target",
      id: "x",
      title: "Modelo Compacto",
      subtitle: "provedor-b/modelo-compacto",
      badge: "R$ 1,40 / 1M",
      icon: "i",
    });
    const huge = estimateTargetWidth({ kind: "target", id: "x", title: "T".repeat(200) });
    expect(short).toBe(240);
    expect(long).toBeGreaterThan(240);
    expect(long).toBeLessThanOrEqual(320);
    expect(huge).toBe(320);
  });

  it("o layout usa a largura medida de cada destino e decisão", () => {
    const r = computeLayout(tree, { orientation: "horizontal", width: 1400, ...fixed });
    expect(byId(r, "a").w).toBe(260);
    expect(byId(r, "d1").w).toBe(200);
  });

  it("decisão cabe em uma linha até 260 px e só passa disso quando o texto é enorme", () => {
    const d = (question: string) =>
      estimateDecisionWidth({ kind: "decision", id: "q", question, branches: [] });
    expect(d("Menor custo por token?")).toBeGreaterThanOrEqual(150);
    expect(d("Mais de 1,5 pedido por segundo?")).toBeGreaterThanOrEqual(220);
    expect(d("Mais de 1,5 pedido por segundo?")).toBeLessThanOrEqual(260);
    expect(d("x".repeat(200))).toBe(260);
    expect(d("?")).toBe(120);
  });

  it("espalha as colunas quando o contêiner é largo, com teto de 200 px por vão", () => {
    const base = computeLayout(tree, { orientation: "horizontal", width: 1100, ...fixed });
    const wide = computeLayout(tree, { orientation: "horizontal", width: 1500, ...fixed });
    expect(colGap(wide, "d1", "a")).toBeGreaterThan(colGap(base, "d1", "a"));
    const huge = computeLayout(tree, { orientation: "horizontal", width: 4000, ...fixed });
    expect(colGap(huge, "d1", "a")).toBe(200);
    expect(colGap(huge, SOURCE_ID, "d1")).toBe(200);
    // o resto é dividido nas pontas (centralizado)
    const left = byId(huge, SOURCE_ID).x;
    const last = byId(huge, "b");
    expect(left).toBeGreaterThan(16);
    expect(left).toBeCloseTo(huge.width - (last.x + last.w), 0);
  });

  it("estreita (>= 640) encolhe os vãos até o mínimo (48 px + rótulo) antes de qualquer outra coisa", () => {
    const natural = computeLayout(tree, { orientation: "horizontal", width: 1500, ...fixed });
    const tight = computeLayout(tree, { orientation: "horizontal", width: 900, ...fixed });
    expect(colGap(tight, "d1", "a")).toBeLessThan(colGap(natural, "d1", "a"));
    expect(byId(tight, "a").w).toBeGreaterThanOrEqual(200);
    const min = computeLayout(tree, { orientation: "horizontal", width: 640, ...fixed });
    expect(colGap(min, "d1", "a")).toBe(estimateLabelWidth("sim") + 48);
    expect(colGap(min, SOURCE_ID, "d1")).toBe(48);
    expect(min.width).toBeGreaterThan(640);
  });
});

describe("vão mínimo pelo rótulo", () => {
  const chain: RoutingNode = {
    kind: "decision",
    id: "q",
    question: "Caiu?",
    branches: [
      {
        label: "primário",
        to: {
          kind: "target",
          id: "p",
          title: "P",
          fallback: { label: "reserva", to: { kind: "target", id: "r", title: "R" } },
        },
      },
    ],
  };
  const fixed = { targetWidth: () => 300, decisionWidth: () => 160, labelWidth: () => 70 };
  const gap = (r: ReturnType<typeof computeLayout>, a: string, b: string) => {
    const left = byId(r, a);
    return byId(r, b).x - (left.x + left.w);
  };

  it("o estimador cresce com o texto", () => {
    expect(estimateLabelWidth("primário")).toBeGreaterThan(estimateLabelWidth("sim"));
  });

  it("vão com rótulo tem no mínimo rótulo + 2 x 24 px; vão sem rótulo, 48 px", () => {
    const r = computeLayout(chain, { orientation: "horizontal", width: 1050, ...fixed });
    expect(gap(r, "q", "p")).toBeGreaterThanOrEqual(70 + 48);
    expect(gap(r, "p", "r")).toBeGreaterThanOrEqual(70 + 48);
    expect(gap(r, SOURCE_ID, "q")).toBeGreaterThanOrEqual(48);
    const tight = computeLayout(chain, { orientation: "horizontal", width: 640, ...fixed });
    expect(gap(tight, "q", "p")).toBeGreaterThanOrEqual(118);
    expect(gap(tight, "p", "r")).toBeGreaterThanOrEqual(118);
    expect(gap(tight, SOURCE_ID, "q")).toBe(48);
  });

  it("sem espaço, os cartões encolhem em direção a 200 px antes da moldura rolar", () => {
    // 128 + 160 + 300 + 300 + vãos (48 + 118 + 118) + 32 = 1204
    const r = computeLayout(chain, { orientation: "horizontal", width: 1050, ...fixed });
    expect(byId(r, "p").w).toBeLessThan(300);
    expect(byId(r, "p").w).toBeGreaterThanOrEqual(200);
    expect(r.width).toBe(1050);
    const tiny = computeLayout(chain, { orientation: "horizontal", width: 600, ...fixed });
    expect(byId(tiny, "p").w).toBe(200);
    expect(byId(tiny, "r").w).toBe(200);
    expect(tiny.width).toBeGreaterThan(700);
    expect(gap(tiny, "q", "p")).toBe(118);
  });
});

describe("nada passa da borda quando os mínimos cabem", () => {
  const chain: RoutingNode = {
    kind: "decision",
    id: "q",
    question: "O provedor caiu?",
    branches: [
      {
        label: "primário",
        to: {
          kind: "target",
          id: "p",
          title: "Modelo Rápido",
          subtitle: "provedor-a/modelo-rapido",
          badge: "Fora do ar",
          icon: "i",
          fallback: {
            label: "reserva",
            to: {
              kind: "target",
              id: "r",
              title: "Modelo Rápido",
              subtitle: "provedor-b/modelo-rapido",
              icon: "i",
            },
          },
        },
      },
    ],
  };

  it.each([1000, 1026, 1050, 1100, 1400])("largura %i: o nó mais à direita cabe", (width) => {
    const r = computeLayout(chain, { orientation: "horizontal", width });
    const right = Math.max(...r.nodes.map((n) => n.x + n.w));
    expect(right).toBeLessThanOrEqual(width - 16);
    expect(r.width).toBe(width);
    for (const n of r.nodes) expect(n.x).toBeGreaterThanOrEqual(16);
  });
});

describe("chooseOrientation", () => {
  const small: RoutingNode = { kind: "target", id: "t", title: "T" };
  const roots = [small, tree];

  it("horizontal só quando o mínimo do mais largo cabe", () => {
    const need = horizontalMinWidth(tree);
    expect(need).toBeGreaterThan(640);
    expect(chooseOrientation(roots, need)).toBe("horizontal");
    expect(chooseOrientation(roots, need - 1)).toBe("vertical");
  });

  it("a mesma orientação para todos os cenários, mesmo o que caberia sozinho", () => {
    expect(chooseOrientation([small], 700)).toBe("horizontal");
    expect(chooseOrientation([small, tree], 700)).toBe("vertical");
    expect(chooseOrientation([tree, small], 700)).toBe("vertical");
  });

  it("abaixo de 640 px é sempre vertical", () => {
    expect(chooseOrientation([small], 639)).toBe("vertical");
  });

  it("o layout vertical cabe na largura, sem rolagem, até com 3 folhas em 360 px", () => {
    const r = computeLayout(tree, { orientation: "vertical", width: 360 });
    expect(r.width).toBe(360);
    for (const n of r.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x + n.w).toBeLessThanOrEqual(360);
    }
  });
});
