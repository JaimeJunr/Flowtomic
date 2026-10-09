import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ThinkingLine } from "./thinking-line";
import {
  formatThought,
  hasSettled,
  settledAnnouncement,
  settledLabel,
} from "./thinking-line-utils";

const ROOT = '[data-slot="thinking-line"]';
const GLYPH = '[data-slot="thinking-line-glyph"]';
const LABEL = '[data-slot="thinking-line-label"]';
const STEPS = '[data-slot="thinking-line-steps"]';
const TIMER = '[data-slot="thinking-line-timer"]';
const CHECK = '[data-slot="thinking-line-step-check"]';
const STEPS_LIST = ["Lendo a pergunta", "Buscando nas suas notas", "Comparando duas abordagens"];

type Props = Partial<React.ComponentProps<typeof ThinkingLine>>;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setInterval", "clearInterval", "setTimeout", "clearTimeout", "Date"],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function ui(props: Props, reduced: boolean) {
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <ThinkingLine {...props} />
    </MotionConfig>
  );
}

function setup(props: Props = {}, reduced = false) {
  const view = render(ui(props, reduced));
  const q = <T extends Element = HTMLElement>(selector: string) =>
    view.container.querySelector<T>(selector);
  return { ...view, q, rerenderWith: (next: Props) => view.rerender(ui(next, reduced)) };
}

describe("funções puras", () => {
  it("formatThought usa vírgula e uma casa decimal", () => {
    expect(formatThought(2.74)).toBe("2,7 s");
    expect(formatThought(0)).toBe("0,0 s");
  });

  it("formatThought rejeita valor inválido com o recebido e o esperado", () => {
    expect(() => formatThought(-1)).toThrow(/received -1.*non-negative/);
    expect(() => formatThought(Number.NaN)).toThrow(/received NaN/);
  });

  it("settledLabel prioriza doneLabel, depois cronômetro, depois texto genérico", () => {
    expect(settledLabel({ doneLabel: "Feito", showTimer: true, seconds: 2.74 })).toBe("Feito");
    expect(settledLabel({ doneLabel: "", showTimer: true, seconds: 2.74 })).toBe(
      "Pensou por 2,7 s"
    );
    expect(settledLabel({ doneLabel: "", showTimer: false, seconds: 2.74 })).toBe(
      "Pensamento concluído"
    );
  });

  it("settledAnnouncement fala segundos por extenso", () => {
    expect(settledAnnouncement({ doneLabel: "", showTimer: true, seconds: 2.74 })).toBe(
      "Pensou por 2,7 segundos"
    );
    expect(settledAnnouncement({ doneLabel: "Feito", showTimer: true, seconds: 2 })).toBe("Feito");
  });

  it("hasSettled: working=false assenta; settleAfterS assenta pelo relógio", () => {
    expect(hasSettled({ working: false, settleAfterS: 0, seconds: 0 })).toBe(true);
    expect(hasSettled({ working: true, settleAfterS: 0, seconds: 99 })).toBe(false);
    expect(hasSettled({ working: true, settleAfterS: 2, seconds: 1.9 })).toBe(false);
    expect(hasSettled({ working: true, settleAfterS: 2, seconds: 2 })).toBe(true);
  });
});

describe("ThinkingLine", () => {
  it("trabalhando mostra o rótulo, estado working e relógio aria-hidden", () => {
    const { q } = setup();
    expect(q(ROOT)?.getAttribute("data-state")).toBe("working");
    expect(q(LABEL)?.textContent).toBe("Pensando…");
    expect(q(TIMER)?.getAttribute("aria-hidden")).toBe("true");
  });

  it("working=false assenta com 'Pensou por X s' e chama onSettle uma vez", () => {
    const onSettle = vi.fn();
    const { q, rerenderWith } = setup({ onSettle });
    advance(2700);
    rerenderWith({ onSettle, working: false });
    expect(q(ROOT)?.getAttribute("data-state")).toBe("settled");
    expect(q(LABEL)?.textContent).toMatch(/^Pensou por 2,[67] s$/);
    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(onSettle.mock.calls[0]?.[0]).toBeGreaterThan(2.6);
    advance(5000);
    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(q("output")?.textContent).toMatch(/^Pensou por 2,[67] segundos$/);
  });

  it("settleAfterS assenta sozinho", () => {
    const onSettle = vi.fn();
    const { q } = setup({ settleAfterS: 2, onSettle });
    advance(1500);
    expect(q(ROOT)?.getAttribute("data-state")).toBe("working");
    advance(700);
    expect(q(ROOT)?.getAttribute("data-state")).toBe("settled");
    expect(onSettle).toHaveBeenCalledTimes(1);
  });

  it("voltar a working reinicia o relógio e assenta de novo", () => {
    const onSettle = vi.fn();
    const { q, rerenderWith } = setup({ onSettle });
    advance(1000);
    rerenderWith({ onSettle, working: false });
    rerenderWith({ onSettle, working: true });
    expect(q(ROOT)?.getAttribute("data-state")).toBe("working");
    expect(q(TIMER)?.textContent).toBe("0,0 s");
    advance(500);
    rerenderWith({ onSettle, working: false });
    expect(q(LABEL)?.textContent).toMatch(/^Pensou por 0,[45] s$/);
    expect(onSettle).toHaveBeenCalledTimes(2);
  });

  it("elapsed controla os segundos", () => {
    const { q } = setup({ working: false, elapsed: 4.26 });
    expect(q(LABEL)?.textContent).toBe("Pensou por 4,3 s");
  });

  it("showTimer=false mostra 'Pensamento concluído' e some o relógio", () => {
    const { q } = setup({ working: false, showTimer: false });
    expect(q(LABEL)?.textContent).toBe("Pensamento concluído");
    expect(q(TIMER)).toBeNull();
  });

  it("doneLabel customizado vence o cronômetro", () => {
    const { q } = setup({ working: false, doneLabel: "Resposta pronta" });
    expect(q(LABEL)?.textContent).toBe("Resposta pronta");
  });

  it("passos: o último não tem ✓ e os anteriores têm", () => {
    const { q } = setup({ steps: STEPS_LIST });
    const items = q(STEPS)?.querySelectorAll("li") ?? [];
    expect(items).toHaveLength(3);
    expect(items[0]?.querySelector(CHECK)).not.toBeNull();
    expect(items[1]?.querySelector(CHECK)).not.toBeNull();
    expect(items[2]?.querySelector(CHECK)).toBeNull();
  });

  it("collapseOnSettle dobra a trilha e o botão reabre", () => {
    const { q, rerenderWith } = setup({ steps: STEPS_LIST });
    expect(q("button")?.getAttribute("aria-expanded")).toBe("true");
    expect(q("button")?.getAttribute("aria-controls")).toBe(q(STEPS)?.id);
    rerenderWith({ steps: STEPS_LIST, working: false });
    expect(q("button")?.getAttribute("aria-expanded")).toBe("false");
    expect(q(STEPS)?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(q("button") as HTMLButtonElement);
    expect(q("button")?.getAttribute("aria-expanded")).toBe("true");
    expect(q(STEPS)?.getAttribute("aria-hidden")).toBeNull();
  });

  it("collapseOnSettle=false mantém a trilha aberta ao assentar", () => {
    const { q } = setup({ steps: STEPS_LIST, working: false, collapseOnSettle: false });
    expect(q("button")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("collapsible=false não renderiza botão e a trilha fica sempre aberta", () => {
    const { q } = setup({ steps: STEPS_LIST, working: false, collapsible: false });
    expect(q("button")).toBeNull();
    expect(q(STEPS)?.getAttribute("aria-hidden")).toBeNull();
  });

  it("sem passos não há trilha nem botão", () => {
    const { q } = setup();
    expect(q(STEPS)).toBeNull();
    expect(q("button")).toBeNull();
  });

  it("glyph: sparkle (padrão), dot, none e nó customizado", () => {
    expect(setup().q(`${GLYPH} svg`)).not.toBeNull();
    const dot = setup({ glyph: "dot" });
    expect(dot.q(`${GLYPH} svg`)).toBeNull();
    expect(dot.q(GLYPH)).not.toBeNull();
    expect(setup({ glyph: "none" }).q(GLYPH)).toBeNull();
    expect(setup({ glyph: <b data-testid="g">x</b> }).q('[data-testid="g"]')).not.toBeNull();
  });

  it("settled apaga o glifo; working respira", () => {
    const working = setup();
    expect(working.q(GLYPH)?.getAttribute("style")).toMatch(/animation/);
    const settled = setup({ working: false });
    expect(settled.q(GLYPH)?.className).toContain("opacity-40");
    expect(settled.q(GLYPH)?.getAttribute("style") ?? "").not.toMatch(/animation/);
  });

  it("shimmer varre o texto; shimmer=false faz o texto respirar", () => {
    expect(setup().q(LABEL)?.getAttribute("style")).toMatch(/background-image/);
    const plain = setup({ shimmer: false });
    expect(plain.q(LABEL)?.getAttribute("style")).not.toMatch(/background-image/);
    expect(plain.q(LABEL)?.getAttribute("style")).toMatch(/animation/);
  });

  it("movimento reduzido: sem respirar nem varredura", () => {
    const { q } = setup({ steps: STEPS_LIST }, true);
    expect(q(GLYPH)?.getAttribute("style") ?? "").not.toMatch(/animation/);
    expect(q(LABEL)?.getAttribute("style") ?? "").not.toMatch(/animation|background-image/);
    expect(q(STEPS)?.parentElement?.className).toContain("transition-none");
  });

  it("repassa ref, className e props ao root", () => {
    const ref = createRef<HTMLDivElement>();
    const { q } = setup({ ref, className: "extra", id: "tl" });
    expect(ref.current).toBe(q(ROOT));
    expect(q(ROOT)?.className).toContain("extra");
    expect(q(ROOT)?.id).toBe("tl");
  });
});
