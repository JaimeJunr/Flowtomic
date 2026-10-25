import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProcessStepFrame } from "./process-step-frame";
import { ProcessSteps } from "./process-steps";
import type { ProcessStep } from "./process-steps-types";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const steps: ProcessStep[] = [
  { id: "a", title: "Observe", description: "Só a tela" },
  { id: "b", title: "Escreva", description: "Pela spec" },
  {
    id: "c",
    title: "Prove",
    description: "No navegador",
    detail: {
      title: "Prova",
      slides: [
        { media: <p>Mídia um</p>, title: "Primeiro", description: "Larguras" },
        { media: <p>Mídia dois</p>, title: "Segundo" },
      ],
    },
  },
];

describe("ProcessSteps", () => {
  it("renderiza a seção nomeada, a lista ordenada e os números aria-hidden", () => {
    render(<ProcessSteps steps={steps} title="Como funciona" />);
    const section = screen.getByRole("region", { name: "Como funciona" });
    const list = within(section).getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Observe",
      "Escreva",
      "Prove",
    ]);
    expect(screen.getByText("Só a tela")).toBeInTheDocument();
    for (const n of ["01", "02", "03"]) {
      expect(screen.getByText(n)).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("numbering={false} esconde os números e headingLevel={3} desce os títulos", () => {
    render(<ProcessSteps steps={steps} title="Como funciona" headingLevel={3} numbering={false} />);
    expect(screen.queryByText("01")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Como funciona" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("preview como função recebe active true sem IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const preview = vi.fn(() => <span>mock</span>);
    render(<ProcessSteps steps={[{ ...steps[0], preview }, steps[1]]} />);
    vi.unstubAllGlobals();
    expect(preview).toHaveBeenLastCalledWith({ active: true });
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-active", "true");
  });

  it("com movimento reduzido o preview recebe active false", () => {
    const preview = vi.fn(() => <span>mock</span>);
    render(
      <MotionConfig reducedMotion="always">
        <ProcessSteps steps={[{ ...steps[0], preview }, steps[1]]} />
      </MotionConfig>
    );
    expect(preview).toHaveBeenLastCalledWith({ active: false });
  });

  it("acompanha o IntersectionObserver quando ele existe", async () => {
    let callback: IntersectionObserverCallback = () => {};
    class FakeObserver {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    try {
      // O callback guardado é o do último passo montado.
      render(<ProcessSteps steps={[steps[0], steps[1]]} />);
      const last = screen.getAllByRole("listitem")[1];
      expect(last).toHaveAttribute("data-active", "false");
      act(() => {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });
      expect(last).toHaveAttribute("data-active", "true");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("mostra a legenda só quando há caption", () => {
    const { container, rerender } = render(<ProcessSteps steps={steps} caption="Cada rodada" />);
    expect(screen.getByText("Cada rodada")).toBeInTheDocument();
    rerender(<ProcessSteps steps={steps} />);
    expect(container.querySelector("[data-slot=process-steps-caption]")).toBeNull();
  });

  it("só o passo com detail tem botão", () => {
    render(<ProcessSteps steps={steps} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Ver detalhes de Prove" })).toBeInTheDocument();
  });

  it("abre o diálogo, navega por botão e teclado e marca o slide atual", async () => {
    const user = userEvent.setup();
    render(<ProcessSteps steps={steps} />);
    await user.click(screen.getByRole("button", { name: "Ver detalhes de Prove" }));
    const dialog = await screen.findByRole("dialog", { name: "Prova" });
    expect(within(dialog).getByText("Mídia um")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Slide 1 de 2" })).toHaveAttribute(
      "aria-current",
      "true"
    );

    await user.click(within(dialog).getByRole("button", { name: "Próximo" }));
    expect(within(dialog).getByText("Mídia dois")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Próximo" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Slide 2 de 2" })).toHaveAttribute(
      "aria-current",
      "true"
    );

    await user.keyboard("{ArrowLeft}");
    expect(within(dialog).getByText("Mídia um")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByText("Mídia dois")).toBeInTheDocument();
  });

  it("Esc fecha o diálogo e o foco volta ao botão do passo", async () => {
    const user = userEvent.setup();
    render(<ProcessSteps steps={steps} />);
    const trigger = screen.getByRole("button", { name: "Ver detalhes de Prove" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe("ProcessStepFrame", () => {
  it("tone dark põe a classe dark, decorative esconde e title aparece", () => {
    const { container } = render(
      <ProcessStepFrame tone="dark" title="arquivo.tsx">
        corpo
      </ProcessStepFrame>
    );
    const frame = container.querySelector("[data-slot=process-step-frame]");
    expect(frame).toHaveClass("dark");
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame).toHaveAttribute("inert");
    expect(frame).toHaveTextContent("arquivo.tsx");
  });

  it("decorative={false} mantém o quadro acessível e claro", () => {
    const { container } = render(<ProcessStepFrame decorative={false}>corpo</ProcessStepFrame>);
    const frame = container.querySelector("[data-slot=process-step-frame]");
    expect(frame).not.toHaveAttribute("aria-hidden");
    expect(frame).not.toHaveClass("dark");
  });
});
