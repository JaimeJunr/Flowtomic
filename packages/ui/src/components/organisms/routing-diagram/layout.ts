import { isValidElement, type ReactNode } from "react";
import type { RoutingDecision, RoutingNode, RoutingScenario, RoutingTarget } from "./types";

export const SOURCE_ID = "__source__";
export const DEFAULT_FALLBACK_LABEL = "reserva";

export type Orientation = "horizontal" | "vertical";
export type LayoutKind = "source" | "decision" | "target";
export type Point = { x: number; y: number };

export type LayoutNode = {
  id: string;
  kind: LayoutKind;
  /** Ausente na origem. */
  node?: RoutingNode;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LayoutEdge = {
  /** `${from}>${to}` */
  id: string;
  from: string;
  to: string;
  kind: "root" | "branch" | "fallback";
  label?: string;
  /** Bézier cúbica: P0, P1, P2, P3. */
  points: [Point, Point, Point, Point];
  d: string;
  mid: Point;
};

export type LayoutResult = {
  orientation: Orientation;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
};

export const VERTICAL_BELOW = 640;

export type LayoutOptions = {
  orientation: Orientation;
  /** Largura disponível do contêiner, em px. */
  width: number;
  /** Largura do cartão de um destino (horizontal). Padrão: `estimateTargetWidth`. */
  targetWidth?: (node: RoutingTarget) => number;
  /** Largura da pílula de uma decisão (horizontal). Padrão: `estimateDecisionWidth`. */
  decisionWidth?: (node: RoutingDecision) => number;
  /** Largura da pílula de um rótulo de aresta (horizontal). Padrão: `estimateLabelWidth`. */
  labelWidth?: (label: string) => number;
};

const LABEL_LINE = 24;

/** text-[11px] ~6.2 px/caractere + px-2 e borda. */
export function estimateLabelWidth(label: string): number {
  return Math.ceil(label.length * 6.2 + 20);
}

export const TARGET_MIN_W = 240;
export const TARGET_MAX_W = 320;
/** Piso ao encolher os cartões quando falta largura. */
export const TARGET_SHRINK_MIN_W = 200;
export const DECISION_MIN_W = 120;
export const DECISION_MAX_W = 260;

/** Estimativa generosa (text-xs ~6.6 px/caractere) da largura que o cartão precisa para não truncar. */
export function estimateTargetWidth(node: RoutingTarget): number {
  const title = nodeText(node.title).length * 7;
  const subtitle = (node.subtitle?.length ?? 0) * 6.8;
  const badge = node.badge ? nodeText(node.badge).length * 6.4 + 26 : 0;
  const icon = node.icon ? 24 : 0;
  const text = Math.max(title, subtitle);
  const w = 20 + icon + text + (badge ? 8 + badge : 0);
  return Math.round(Math.min(TARGET_MAX_W, Math.max(TARGET_MIN_W, w)));
}

/** Pílula de uma linha até 260 px; passando disso o texto quebra. */
export function estimateDecisionWidth(node: RoutingDecision): number {
  const w = nodeText(node.question).length * 6.6 + 36;
  return Math.round(Math.min(DECISION_MAX_W, Math.max(DECISION_MIN_W, w)));
}

const PAD = 16;
const LANE_GAP = 12;

const H_SIZES = {
  source: { w: 128, h: 104 },
  decision: { w: 152, h: 44 },
  target: { w: 240, h: 56 },
};
const H_LANE_PITCH = 72;
const H_MIN_GAP = 48;
const H_MAX_GAP = 200;

const V_SOURCE_H = 40;
const V_DECISION_H = 44;
const V_TARGET_H = 56;
const V_LAYER_GAP = 64;
const V_MIN_LEAF_W = 72;
const V_MAX_LEAF_W = 208;

type TreeNode = {
  id: string;
  kind: LayoutKind;
  node?: RoutingNode;
  depth: number;
  lane: number;
  children: { child: TreeNode; kind: "root" | "branch" | "fallback"; label?: string }[];
};

type Counter = { leaves: number };

function buildTree(node: RoutingNode, depth: number, counter: Counter): TreeNode {
  const tree: TreeNode = { id: node.id, kind: node.kind, node, depth, lane: 0, children: [] };
  if (node.kind === "decision") {
    for (const branch of node.branches) {
      tree.children.push({
        child: buildTree(branch.to, depth + 1, counter),
        kind: "branch",
        label: branch.label,
      });
    }
  } else if (node.fallback) {
    tree.children.push({
      child: buildTree(node.fallback.to, depth + 1, counter),
      kind: "fallback",
      label: node.fallback.label ?? DEFAULT_FALLBACK_LABEL,
    });
  }
  if (tree.children.length === 0) {
    tree.lane = counter.leaves;
    counter.leaves += 1;
  } else {
    const first = tree.children[0].child.lane;
    const last = tree.children[tree.children.length - 1].child.lane;
    tree.lane = (first + last) / 2;
  }
  return tree;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function cubic(points: [Point, Point, Point, Point]): { d: string; mid: Point } {
  const [p0, p1, p2, p3] = points;
  const d = `M ${round(p0.x)} ${round(p0.y)} C ${round(p1.x)} ${round(p1.y)}, ${round(p2.x)} ${round(p2.y)}, ${round(p3.x)} ${round(p3.y)}`;
  return { d, mid: pointOnCubic(points, 0.5) };
}

/** Ponto da Bézier cúbica no parâmetro `t` (0 a 1). */
export function pointOnCubic(points: [Point, Point, Point, Point], t: number): Point {
  const [p0, p1, p2, p3] = points;
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + e * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + e * p3.y,
  };
}

function edgePoints(
  from: LayoutNode,
  to: LayoutNode,
  orientation: Orientation
): [Point, Point, Point, Point] {
  if (orientation === "horizontal") {
    const p0 = { x: from.x + from.w, y: from.y + from.h / 2 };
    const p3 = { x: to.x, y: to.y + to.h / 2 };
    const dx = (p3.x - p0.x) / 2;
    return [p0, { x: p0.x + dx, y: p0.y }, { x: p3.x - dx, y: p3.y }, p3];
  }
  const p0 = { x: from.x + from.w / 2, y: from.y + from.h };
  const p3 = { x: to.x + to.w / 2, y: to.y };
  const dy = (p3.y - p0.y) / 2;
  return [p0, { x: p0.x, y: p0.y + dy }, { x: p3.x, y: p3.y - dy }, p3];
}

function flatten(tree: TreeNode, out: TreeNode[] = []): TreeNode[] {
  out.push(tree);
  for (const { child } of tree.children) flatten(child, out);
  return out;
}

/**
 * Função pura: árvore de roteamento -> nós posicionados e arestas em pixels.
 * Colunas (ou camadas) por profundidade, linhas (ou faixas) pela ordem das folhas.
 * A origem fica na profundidade 0 e `root` na 1.
 */
export function computeLayout(root: RoutingNode, options: LayoutOptions): LayoutResult {
  const { orientation } = options;
  const width = Math.max(0, options.width);
  const counter: Counter = { leaves: 0 };
  const tree = buildTree(root, 1, counter);
  const leaves = Math.max(1, counter.leaves);
  const all = flatten(tree);
  const maxDepth = Math.max(...all.map((n) => n.depth));
  const sourceTree: TreeNode = {
    id: SOURCE_ID,
    kind: "source",
    depth: 0,
    lane: tree.lane,
    children: [{ child: tree, kind: "root" }],
  };
  const everyone = [sourceTree, ...all];

  const placed = new Map<string, LayoutNode>();
  let totalWidth = width;
  let totalHeight = 0;

  if (orientation === "horizontal") {
    const targetW = options.targetWidth ?? estimateTargetWidth;
    const decisionW = options.decisionWidth ?? estimateDecisionWidth;
    const sizeOf = (n: TreeNode) => {
      const base = H_SIZES[n.kind];
      if (n.node?.kind === "target") return { w: targetW(n.node), h: base.h };
      if (n.node?.kind === "decision") return { w: decisionW(n.node), h: base.h };
      return base;
    };
    const colW: number[] = [];
    for (const n of everyone) {
      colW[n.depth] = Math.max(colW[n.depth] ?? 0, sizeOf(n).w);
    }
    const cols = maxDepth + 1;
    const labelW = options.labelWidth ?? estimateLabelWidth;
    // Vão mínimo: 48 px, ou o maior rótulo que cruza o vão + 24 px de linha visível de cada lado.
    const minGap: number[] = [];
    for (let i = 0; i < cols - 1; i += 1) minGap[i] = H_MIN_GAP;
    for (const n of everyone) {
      for (const { label } of n.children) {
        if (label) minGap[n.depth] = Math.max(minGap[n.depth], labelW(label) + 2 * LABEL_LINE);
      }
    }
    // Largura mínima da coluna: destinos podem encolher até TARGET_SHRINK_MIN_W; o resto não encolhe.
    const colMin: number[] = colW.map(() => 0);
    for (const n of everyone) {
      const w = sizeOf(n).w;
      colMin[n.depth] = Math.max(
        colMin[n.depth],
        n.kind === "target" ? Math.min(w, TARGET_SHRINK_MIN_W) : w
      );
    }
    const sumMinGap = minGap.reduce((a, b) => a + b, 0);
    const avail = width - 2 * PAD;
    let deficit = colW.reduce((a, b) => a + b, 0) + sumMinGap - avail;
    // 1º os vãos ficam no mínimo; 2º os cartões encolhem em direção a 240 px; 3º a moldura rola.
    for (let guard = 0; deficit > 0.5 && guard < 20; guard += 1) {
      const shrinkable = colW.map((w, i) => w - colMin[i]).filter((v) => v > 0.5);
      if (shrinkable.length === 0) break;
      const share = deficit / shrinkable.length;
      let freed = 0;
      for (let i = 0; i < cols; i += 1) {
        const room = colW[i] - colMin[i];
        if (room <= 0.5) continue;
        const cut = Math.min(room, share);
        colW[i] -= cut;
        freed += cut;
      }
      deficit -= freed;
    }
    const sumW = colW.reduce((a, b) => a + b, 0);
    const extra = Math.max(0, avail - sumW - sumMinGap);
    const gaps = minGap.map((m) =>
      cols > 1 ? Math.min(Math.max(H_MAX_GAP, m), m + extra / (cols - 1)) : 0
    );
    const span = sumW + gaps.reduce((a, b) => a + b, 0);
    const colX: number[] = [];
    let cursor = Math.max(PAD, (width - span) / 2);
    for (let i = 0; i < cols; i += 1) {
      colX[i] = cursor;
      cursor += colW[i] + (gaps[i] ?? 0);
    }
    totalWidth = Math.max(width, cursor - (gaps[cols - 2] ?? 0) + PAD);
    totalHeight = Math.max(2 * PAD + leaves * H_LANE_PITCH, 2 * PAD + H_SIZES.source.h);
    const laneTop = (totalHeight - 2 * PAD - leaves * H_LANE_PITCH) / 2 + PAD;
    for (const n of everyone) {
      const { w: fullW, h } = sizeOf(n);
      const w = Math.min(fullW, colW[n.depth]);
      const centerY = laneTop + n.lane * H_LANE_PITCH + H_LANE_PITCH / 2;
      placed.set(n.id, {
        id: n.id,
        kind: n.kind,
        node: n.node,
        depth: n.depth,
        x: round(colX[n.depth] + (colW[n.depth] - w) / 2),
        y: round(centerY - h / 2),
        w,
        h,
      });
    }
  } else {
    const leafW = Math.min(
      V_MAX_LEAF_W,
      Math.max(V_MIN_LEAF_W, (width - 2 * PAD - (leaves - 1) * LANE_GAP) / leaves)
    );
    const pitch = leafW + LANE_GAP;
    const groupW = leaves * pitch - LANE_GAP;
    totalWidth = Math.max(width, groupW + 2 * PAD);
    const left = (totalWidth - groupW) / 2;
    const sourceW = Math.min(220, Math.max(V_MIN_LEAF_W, totalWidth - 2 * PAD));
    const heightOf = (kind: LayoutKind) =>
      kind === "source" ? V_SOURCE_H : kind === "decision" ? V_DECISION_H : V_TARGET_H;
    const layerH: number[] = [];
    for (const n of everyone) {
      layerH[n.depth] = Math.max(layerH[n.depth] ?? 0, heightOf(n.kind));
    }
    const layerY: number[] = [];
    let cursor = PAD;
    for (let i = 0; i <= maxDepth; i += 1) {
      layerY[i] = cursor;
      cursor += layerH[i] + V_LAYER_GAP;
    }
    totalHeight = cursor - V_LAYER_GAP + PAD;
    for (const n of everyone) {
      const h = heightOf(n.kind);
      const w =
        n.kind === "source" ? sourceW : n.kind === "decision" ? Math.min(152, leafW) : leafW;
      const centerX = left + n.lane * pitch + leafW / 2;
      placed.set(n.id, {
        id: n.id,
        kind: n.kind,
        node: n.node,
        depth: n.depth,
        x: round(n.kind === "source" ? totalWidth / 2 - w / 2 : centerX - w / 2),
        y: round(layerY[n.depth] + (layerH[n.depth] - h) / 2),
        w,
        h,
      });
    }
  }

  const edges: LayoutEdge[] = [];
  for (const parent of everyone) {
    const from = placed.get(parent.id);
    if (!from) continue;
    for (const { child, kind, label } of parent.children) {
      const to = placed.get(child.id);
      if (!to) continue;
      const points = edgePoints(from, to, orientation);
      const { d, mid } = cubic(points);
      edges.push({
        id: `${parent.id}>${child.id}`,
        from: parent.id,
        to: child.id,
        kind,
        label,
        points,
        d,
        mid,
      });
    }
  }

  return {
    orientation,
    nodes: everyone.map((n) => placed.get(n.id) as LayoutNode),
    edges,
    width: round(totalWidth),
    height: round(totalHeight),
  };
}

// ---------------------------------------------------------------------------
// Caminho ativo
// ---------------------------------------------------------------------------

/** Texto puro de um ReactNode (para aria-label e lista de passos). */
export function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return "";
}

function walk(node: RoutingNode, visit: (node: RoutingNode) => void): void {
  visit(node);
  if (node.kind === "decision") {
    for (const branch of node.branches) walk(branch.to, visit);
  } else if (node.fallback) {
    walk(node.fallback.to, visit);
  }
}

export type PathStep = {
  id: string;
  kind: LayoutKind;
  /** Frase curta do passo, para a lista `sr-only`. */
  text: string;
  /** Rótulo da aresta que SAI deste nó em direção ao próximo passo. */
  outLabel?: string;
};

export type ResolvedPath = {
  /** Falso quando algum id do `activePath` não existe na árvore. */
  valid: boolean;
  missing: string[];
  /** Ids ativos na ordem (sem a origem). Vazio quando inválido. */
  ids: string[];
  /** Chaves `${from}>${to}` das arestas ativas, em ordem, começando pela origem. */
  edgeKeys: string[];
  steps: PathStep[];
  /** "App, depois O provedor caiu?: primário, depois Modelo X". */
  ariaLabel: string;
};

export function resolvePath(scenario: RoutingScenario, sourceLabel: string): ResolvedPath {
  const nodes = new Map<string, RoutingNode>();
  walk(scenario.root, (n) => nodes.set(n.id, n));
  const missing = scenario.activePath.filter((id) => !nodes.has(id));
  const origin: PathStep = { id: SOURCE_ID, kind: "source", text: `Origem: ${sourceLabel}` };
  if (missing.length > 0 || scenario.activePath.length === 0) {
    return {
      valid: false,
      missing,
      ids: [],
      edgeKeys: [],
      steps: [origin],
      ariaLabel: sourceLabel,
    };
  }
  const ids = scenario.activePath;
  const edgeKeys: string[] = [];
  const steps: PathStep[] = [origin];
  const parts: string[] = [sourceLabel];
  let previous = SOURCE_ID;
  ids.forEach((id, index) => {
    edgeKeys.push(`${previous}>${id}`);
    previous = id;
    const node = nodes.get(id) as RoutingNode;
    const nextId = ids[index + 1];
    let outLabel: string | undefined;
    if (node.kind === "decision") {
      outLabel = node.branches.find((b) => b.to.id === nextId)?.label;
      const question = nodeText(node.question);
      steps.push({
        id,
        kind: "decision",
        text: outLabel ? `Pergunta: ${question}, resposta: ${outLabel}` : `Pergunta: ${question}`,
        outLabel,
      });
      parts.push(`depois ${question}${outLabel ? `: ${outLabel}` : ""}`);
    } else {
      if (node.fallback && node.fallback.to.id === nextId) {
        outLabel = node.fallback.label ?? DEFAULT_FALLBACK_LABEL;
      }
      const title = nodeText(node.title);
      const named = node.subtitle ? `${title} (${node.subtitle})` : title;
      steps.push({
        id,
        kind: "target",
        text: `${nextId ? "Destino intermediário" : "Destino"}: ${named}${outLabel ? `, ${outLabel}` : ""}`,
        outLabel,
      });
      parts.push(`depois ${named}${outLabel ? `: ${outLabel}` : ""}`);
    }
  });
  return {
    valid: true,
    missing: [],
    ids,
    edgeKeys,
    steps,
    ariaLabel: parts.join(", "),
  };
}

// ---------------------------------------------------------------------------
// Orientação
// ---------------------------------------------------------------------------

type MeasureOptions = Omit<LayoutOptions, "orientation" | "width">;

/** Menor largura em que o layout horizontal cabe (vãos mínimos pelos rótulos e cartões encolhidos). */
export function horizontalMinWidth(root: RoutingNode, options: MeasureOptions = {}): number {
  return computeLayout(root, { ...options, orientation: "horizontal", width: 0 }).width;
}

/**
 * Horizontal só quando a largura é de pelo menos 640 px E o layout horizontal mais largo de todos
 * os cenários cabe; senão vertical. Olhar todos os cenários evita que trocar de aba vire a orientação.
 */
export function chooseOrientation(
  roots: RoutingNode[],
  width: number,
  options: MeasureOptions = {}
): Orientation {
  if (width < VERTICAL_BELOW) return "vertical";
  const widest = Math.max(0, ...roots.map((root) => horizontalMinWidth(root, options)));
  return widest > width ? "vertical" : "horizontal";
}
