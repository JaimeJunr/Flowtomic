import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ToolCallChip, type ToolCallChipProps } from "./tool-call-chip";
import { formatDuration, parkedProgress, statusText } from "./tool-call-chip-utils";

const ROOT = '[data-slot="tool-call-chip"]';
const TIMER = '[data-slot="tool-call-chip-timer"]';
const FILL = '[data-slot="tool-call-chip-fill"]';
const ICON = '[data-slot="tool-call-chip-icon"]';

class FakeRetryHandler {
  calls = 0;
  handle = () => {
    this.calls += 1;
  };
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(props: Partial<ToolCallChipProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <ToolCallChip name="bash" argument="npm test" {...props} />
    </MotionConfig>
  );
  return { ...view, root: view.container.querySelector(ROOT) as HTMLElement };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
      "Date",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("parkedProgress sobe, desacelera e nunca passa de 0.9", () => {
    expect(parkedProgress(0, 2500)).toBe(0);
    const atExpected = parkedProgress(2500, 2500);
    expect(atExpected).toBeGreaterThan(0.84);
    expect(atExpected).toBeLessThanOrEqual(0.9);
    expect(parkedProgress(1000, 2500)).toBeLessThan(parkedProgress(2000, 2500));
    expect(parkedProgress(600000, 2500)).toBeLessThanOrEqual(0.9);
    expect(parkedProgress(-5, 2500)).toBe(0);
  });

  it("parkedProgress rejeita expectedMs inválido com o valor recebido", () => {
    expect(() => parkedProgress(100, 0)).toThrow(/received expectedMs 0/);
  });

  it("formatDuration usa ms até 999 e segundos com vírgula depois", () => {
    expect(formatDuration(0)).toBe("0 ms");
    expect(formatDuration(850)).toBe("850 ms");
    expect(formatDuration(1234)).toBe("1,2 s");
    expect(formatDuration(12000)).toBe("12,0 s");
  });

  it("statusText descreve cada estado em português", () => {
    expect(statusText("running", "bash", "npm test", 0)).toBe("bash npm test, em execução");
    expect(statusText("done", "bash", "npm test", 1234)).toContain("concluído em 1,2 segundos");
    expect(statusText("done", "bash", undefined, 850)).toContain("concluído em 850 milissegundos");
    expect(statusText("error", "bash", "npm test", 10)).toContain("falhou");
    expect(statusText("idle", "bash", "npm test", 0)).toContain("aguardando");
  });
});

describe("ToolCallChip", () => {
  it("mostra nome, argumento e marcação básica", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-status", "running");
    expect(root).toHaveTextContent("bash");
    expect(root).toHaveTextContent("npm test");
    expect(root.querySelector(FILL)).toBeInTheDocument();
    expect(root.querySelector(ICON)).toBeInTheDocument();
    expect(root).toHaveAttribute("role", "status");
  });

  it("o contador sobe enquanto running", () => {
    const { root } = setup();
    expect(root.querySelector(TIMER)).toHaveTextContent("0 ms");
    advance(600);
    const value = Number.parseInt(root.querySelector(TIMER)?.textContent ?? "0", 10);
    expect(value).toBeGreaterThan(300);
    advance(1000);
    expect(root.querySelector(TIMER)?.textContent).toMatch(/s$/);
  });

  it("done mostra o ✓ e o texto sr-only de conclusão, congelando o contador", () => {
    const { root, rerender } = setup();
    advance(1200);
    rerender(
      <MotionConfig reducedMotion="never">
        <ToolCallChip name="bash" argument="npm test" status="done" />
      </MotionConfig>
    );
    expect(root).toHaveAttribute("data-status", "done");
    expect(screen.getByText(/concluído em/)).toBeInTheDocument();
    advance(300);
    expect(root.querySelector(`${ICON} svg.text-success`)).toBeInTheDocument();
    const frozen = root.querySelector(TIMER)?.textContent;
    advance(2000);
    expect(root.querySelector(TIMER)?.textContent).toBe(frozen);
  });

  it("error com onRetry vira botão e reexecuta", () => {
    const retry = new FakeRetryHandler();
    const { root } = setup({ status: "error", onRetry: retry.handle });
    expect(root.tagName).toBe("BUTTON");
    expect(screen.getByRole("button", { name: "Reexecutar bash npm test" })).toBe(root);
    fireEvent.click(root);
    expect(retry.calls).toBe(1);
  });

  it("error sem onRetry não é botão", () => {
    setup({ status: "error" });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText(/falhou/)).toBeInTheDocument();
  });

  it("onRetry só vira botão em erro", () => {
    const { root } = setup({ status: "running", onRetry: () => {} });
    expect(root.tagName).toBe("DIV");
  });

  it("aceita ícone por nome e ícone customizado", () => {
    const { root, rerender } = setup({ icon: "search" });
    expect(root.querySelector(`${ICON} svg`)).toBeInTheDocument();
    rerender(
      <MotionConfig reducedMotion="never">
        <ToolCallChip name="x" icon={<i data-testid="custom" />} />
      </MotionConfig>
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("showTimer=false esconde o contador", () => {
    const { root } = setup({ showTimer: false });
    expect(root.querySelector(TIMER)).not.toBeInTheDocument();
  });

  it("size sm e default mudam a altura", () => {
    const small = setup({ size: "sm" });
    expect(small.root).toHaveClass("h-7");
    small.unmount();
    expect(setup().root).toHaveClass("h-[34px]");
  });

  it("movimento reduzido: sem preenchimento animado, só o contador", () => {
    const { root } = setup({}, "always");
    expect(root.querySelector(FILL)).not.toBeInTheDocument();
    expect(root.querySelector(TIMER)).toBeInTheDocument();
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "custom-x" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom-x");
  });
});
