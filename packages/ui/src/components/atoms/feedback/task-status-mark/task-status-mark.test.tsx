import { render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TaskStatusMark } from "./task-status-mark";
import { dashPattern, markShape, statusText } from "./task-status-mark-utils";

const ROOT = '[data-slot="task-status-mark"]';
const ICON = '[data-slot="task-status-mark-icon"]';
const STRIKE = '[data-slot="task-status-mark-strike"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof TaskStatusMark>> = {}, reduced = false) {
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <TaskStatusMark label="Conciliar 42 lançamentos" {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const icon = view.container.querySelector(ICON) as SVGElement;
  return { ...view, root, icon };
}

const ring = (icon: Element) => icon.querySelector("circle") as SVGCircleElement;
const dasharray = (el: Element) =>
  el.getAttribute("stroke-dasharray") ?? (el as SVGElement).style.strokeDasharray;

describe("funções puras", () => {
  it("dashPattern gera n traços que somam 100", () => {
    const [dash, gap] = dashPattern(8).split(" ").map(Number);
    expect((dash + gap) * 8).toBeCloseTo(100);
    expect(dash).toBeGreaterThan(gap);
    const [d5, g5] = dashPattern(5).split(" ").map(Number);
    expect((d5 + g5) * 5).toBeCloseTo(100);
  });

  it("dashPattern rejeita quantidade inválida com o valor recebido", () => {
    expect(() => dashPattern(0)).toThrow("received dashes 0");
    expect(() => dashPattern(2.5)).toThrow("received dashes 2.5");
  });

  it("markShape cobre todos os status", () => {
    expect(markShape("pending")).toBe("dashes");
    expect(markShape("running")).toBe("spinner");
    expect(markShape("running", 0.4)).toBe("arc");
    expect(markShape("done")).toBe("check");
    expect(markShape("failed")).toBe("cross");
    expect(markShape("cancelled")).toBe("cross");
  });

  it("markShape ignora progress fora de running e rejeita NaN", () => {
    expect(markShape("pending", 0.5)).toBe("dashes");
    expect(() => markShape("running", Number.NaN)).toThrow("received progress NaN");
  });

  it("statusText descreve o estado e arredonda o percentual", () => {
    expect(statusText("pending")).toBe("pendente");
    expect(statusText("running")).toBe("em andamento");
    expect(statusText("running", 0.624)).toBe("em andamento, 62%");
    expect(statusText("running", 1.7)).toBe("em andamento, 100%");
    expect(statusText("done")).toBe("concluída");
    expect(statusText("failed")).toBe("falhou");
    expect(statusText("cancelled")).toBe("cancelada");
  });
});

describe("TaskStatusMark", () => {
  it("pendente é o padrão: anel tracejado e texto sr-only", () => {
    const { root, icon } = setup();
    expect(root).toHaveAttribute("data-status", "pending");
    expect(icon).toHaveAttribute("data-shape", "dashes");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(dasharray(ring(icon))).toBe(dashPattern(8));
    expect(ring(icon)).toHaveAttribute("pathLength", "100");
    expect(screen.getByText("pendente")).toHaveClass("sr-only");
  });

  it("dashes muda o padrão do anel", () => {
    const { icon } = setup({ dashes: 5 });
    expect(dasharray(ring(icon))).toBe(dashPattern(5));
  });

  it.each([
    ["running", "spinner", "em andamento"],
    ["done", "check", "concluída"],
    ["failed", "cross", "falhou"],
    ["cancelled", "cross", "cancelada"],
  ] as const)("%s renderiza %s com o texto %s", (status, shape, text) => {
    const { root, icon } = setup({ status });
    expect(root).toHaveAttribute("data-status", status);
    expect(icon).toHaveAttribute("data-shape", shape);
    expect(screen.getByText(text)).toHaveClass("sr-only");
  });

  it("progress 0.62 vira arco de 62 e anuncia 62%", () => {
    const { icon } = setup({ status: "running", progress: 0.62 });
    expect(icon).toHaveAttribute("data-shape", "arc");
    expect(dasharray(ring(icon))).toBe("62 100");
    expect(screen.getByText("em andamento, 62%")).toBeInTheDocument();
    expect(icon).toHaveAttribute("data-spinning", "false");
  });

  it("indeterminado gira com arcLength e, com movimento reduzido, fica parado", () => {
    const { icon } = setup({ status: "running", arcLength: 0.5 });
    expect(icon).toHaveAttribute("data-spinning", "true");
    expect(dasharray(ring(icon))).toBe("50 100");
    const reduced = setup({ status: "running" }, true);
    expect(reduced.icon).toHaveAttribute("data-spinning", "false");
    expect(dasharray(ring(reduced.icon))).toBe("68 100");
  });

  it("cores só por tokens: feito success, falhou destructive, demais herdam", () => {
    expect(setup({ status: "done" }).icon).toHaveClass("text-success");
    expect(setup({ status: "failed" }).icon).toHaveClass("text-destructive");
    const pending = setup({ status: "running" }).icon;
    expect(pending).not.toHaveClass("text-success");
    expect(pending).not.toHaveClass("text-destructive");
  });

  it("✓ e ✕ usam path com pathLength=1 como atributo", () => {
    const check = setup({ status: "done" }).icon.querySelector("path");
    expect(check).toHaveAttribute("pathLength", "1");
    const cross = setup({ status: "failed" }).icon.querySelector("path");
    expect(cross).toHaveAttribute("pathLength", "1");
  });

  it("feito com strike mostra o risco e apaga o rótulo", () => {
    const { container, root } = setup({ status: "done" });
    expect(container.querySelector(STRIKE)).not.toBeNull();
    const label = root.querySelector('[data-slot="task-status-mark-label"]');
    expect(label).toHaveClass("opacity-60");
  });

  it("strike=false não mostra o risco, mas mantém o rótulo apagado", () => {
    const { container, root } = setup({ status: "done", strike: false });
    expect(container.querySelector(STRIKE)).toBeNull();
    expect(root.querySelector('[data-slot="task-status-mark-label"]')).toHaveClass("opacity-60");
  });

  it("cancelado apaga o rótulo sem riscar; os outros estados não apagam", () => {
    const cancelled = setup({ status: "cancelled" });
    expect(cancelled.container.querySelector(STRIKE)).toBeNull();
    expect(cancelled.root.querySelector('[data-slot="task-status-mark-label"]')).toHaveClass(
      "opacity-60"
    );
    const running = setup({ status: "running" });
    expect(running.container.querySelector(STRIKE)).toBeNull();
    expect(running.root.querySelector('[data-slot="task-status-mark-label"]')).not.toHaveClass(
      "opacity-60"
    );
  });

  it("sem rótulo não renderiza o span do rótulo", () => {
    const { root } = setup({ label: undefined });
    expect(root.querySelector('[data-slot="task-status-mark-label"]')).toBeNull();
  });

  it("size escolhe o ícone e o texto", () => {
    expect(setup({ size: "sm" }).icon).toHaveClass("size-4");
    expect(setup({ size: "lg" }).icon).toHaveClass("size-6");
    expect(setup().icon).toHaveClass("size-5");
  });

  it("repassa ref, className e atributos para a raiz, sem role=status", () => {
    const ref = createRef<HTMLSpanElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "t1" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("id", "t1");
    expect(root).not.toHaveAttribute("role");
  });
});
