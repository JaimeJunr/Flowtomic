import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationFrame, type GenerationStatus } from "./generation-frame";
import { STAGE_STYLE, stageFilter } from "./generation-frame-utils";

const ROOT = '[data-slot="generation-frame"]';
const SWEEP = '[data-slot="generation-frame-sweep"]';

class FakeRetryHandler {
  calls = 0;
  handle = () => {
    this.calls += 1;
  };
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(
  props: Partial<React.ComponentProps<typeof GenerationFrame>> = {},
  reduced: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <GenerationFrame {...props}>
        <img alt="Capa do relatório mensal" src="data:," />
      </GenerationFrame>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("STAGE_STYLE tem os 5 estados", () => {
    expect(Object.keys(STAGE_STYLE).sort()).toEqual(
      ["complete", "error", "generating", "queued", "refining"].sort()
    );
  });

  it("o blur decresce da fila até a pronta", () => {
    const { queued, generating, refining, complete } = STAGE_STYLE;
    expect(queued.blur).toBeGreaterThan(generating.blur);
    expect(generating.blur).toBeGreaterThan(refining.blur);
    expect(refining.blur).toBeGreaterThan(complete.blur);
    expect(complete).toEqual({ blur: 0, saturate: 1, opacity: 1, scale: 1 });
  });

  it("stageFilter monta blur() e saturate()", () => {
    expect(stageFilter("queued")).toBe("blur(24px) saturate(0.2)");
    expect(stageFilter("complete")).toBe("blur(0px) saturate(1)");
  });
});

describe("GenerationFrame", () => {
  it("usa generating como padrão, com chip e aria-busy", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-status", "generating");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Gerando");
  });

  it.each([
    ["queued", "Na fila", "true"],
    ["generating", "Gerando", "true"],
    ["refining", "Refinando", "true"],
    ["complete", "Pronta", "false"],
    ["error", "Falhou", "false"],
  ] as [GenerationStatus, string, string][])("status %s mostra %s", (status, text, busy) => {
    const { root } = setup({ status });
    expect(root).toHaveAttribute("data-status", status);
    expect(root).toHaveAttribute("aria-busy", busy);
    expect(screen.getByRole("status")).toHaveTextContent(text);
  });

  it("aplica a proporção no figure e mantém o alt da mídia", () => {
    const { root } = setup({ aspectRatio: "16 / 9" });
    expect(root.style.aspectRatio).toBe("16 / 9");
    expect(screen.getByAltText("Capa do relatório mensal")).toBeInTheDocument();
  });

  it("aplica o tratamento do estágio na mídia", () => {
    const { container } = setup({ status: "queued" });
    const media = container.querySelector('[data-slot="generation-frame-media"]') as HTMLElement;
    expect(media.style.filter).toContain("blur(24px)");
    expect(media.style.opacity).toBe("0.35");
  });

  it("em complete o chip some após hideAfterMs", () => {
    setup({ status: "complete", hideAfterMs: 1200 });
    expect(screen.getByRole("status")).toBeInTheDocument();
    advance(1300);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hideAfterMs 0 mantém o chip", () => {
    setup({ status: "complete", hideAfterMs: 0 });
    advance(10000);
    expect(screen.getByRole("status")).toHaveTextContent("Pronta");
  });

  it("showStatus=false não renderiza o chip", () => {
    setup({ showStatus: false });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("error com onRetry mostra a pílula e chama onRetry", () => {
    const handler = new FakeRetryHandler();
    setup({ status: "error", onRetry: handler.handle });
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(handler.calls).toBe(1);
  });

  it("error sem onRetry não tem pílula", () => {
    setup({ status: "error" });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("onRetry fora de error não mostra a pílula", () => {
    setup({ status: "generating", onRetry: () => undefined });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("faixa aparece enquanto trabalha", () => {
    const { container } = setup({ status: "refining" });
    const sweep = container.querySelector(SWEEP);
    expect(sweep).toHaveAttribute("aria-hidden", "true");
  });

  it("sem faixa em complete, error, sweep=false e movimento reduzido", () => {
    expect(setup({ status: "complete" }).container.querySelector(SWEEP)).toBeNull();
    expect(setup({ status: "error" }).container.querySelector(SWEEP)).toBeNull();
    expect(setup({ sweep: false }).container.querySelector(SWEEP)).toBeNull();
    expect(setup({}, "always").container.querySelector(SWEEP)).toBeNull();
  });

  it("labels e retryLabel customizados", () => {
    setup({
      status: "error",
      labels: { error: "Deu ruim" },
      retryLabel: "Refazer",
      onRetry: () => undefined,
    });
    expect(screen.getByRole("status")).toHaveTextContent("Deu ruim");
    expect(screen.getByRole("button", { name: "Refazer" })).toBeInTheDocument();
  });

  it("renderiza caption em figcaption", () => {
    setup({ caption: "Capa do relatório de setembro" });
    expect(screen.getByText("Capa do relatório de setembro").tagName).toBe("FIGCAPTION");
  });

  it("repassa ref e className para a raiz", () => {
    const ref = createRef<HTMLElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root.tagName).toBe("FIGURE");
  });

  it("stageMs inválido lança erro com o valor recebido", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => setup({ stageMs: -5 })).toThrow("received stageMs -5");
    spy.mockRestore();
  });
});
