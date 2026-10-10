import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Stepper, type StepperProps } from "./stepper";

const ROOT = '[data-slot="stepper"]';

class FakeStepRecorder {
  steps: number[] = [];
  completed = 0;
  onStepChange = (step: number) => {
    this.steps.push(step);
  };
  onComplete = () => {
    this.completed += 1;
  };
}

function setup(props: Partial<StepperProps> = {}, reduced: "never" | "always" = "never") {
  const recorder = new FakeStepRecorder();
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <Stepper
        steps={[<p key="a">Conteudo A</p>, <p key="b">Conteudo B</p>, <p key="c">Conteudo C</p>]}
        labels={["Dados", "Perfil", "Revisao"]}
        onStepChange={recorder.onStepChange}
        onComplete={recorder.onComplete}
        completedContent={<p>Conta aberta</p>}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  return { ...view, root, recorder };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const statuses = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('[data-slot="stepper-indicator"]')).map((el) =>
    el.getAttribute("data-status")
  );

describe("Stepper", () => {
  it("lanca erro quando steps e labels tem tamanhos diferentes", () => {
    expect(() => setup({ labels: ["Dados"] })).toThrow(/steps\.length=3.*labels\.length=1/);
  });

  it("lanca erro quando vazio", () => {
    expect(() => setup({ steps: [], labels: [] })).toThrow(/steps\.length=0/);
  });

  it("renderiza raiz com role group, data-slot e data-step", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("aria-label", "Etapas");
    expect(root).toHaveAttribute("data-step", "1");
    expect(screen.getByText("Conteudo A")).toBeInTheDocument();
  });

  it("Continuar avanca e chama onStepChange", () => {
    const { root, recorder } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Conteudo B")).toBeInTheDocument();
    expect(root).toHaveAttribute("data-step", "2");
    expect(recorder.steps).toEqual([2]);
  });

  it("Voltar volta um passo", () => {
    const { recorder } = setup({ initialStep: 2 });
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Conteudo A")).toBeInTheDocument();
    expect(recorder.steps).toEqual([1]);
  });

  it("Voltar fica invisivel no passo 1 e visivel depois", () => {
    setup();
    expect(screen.getByText("Voltar").closest("button")).toHaveClass("invisible");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Voltar").closest("button")).not.toHaveClass("invisible");
  });

  it("ultimo passo mostra Concluir, chama onComplete e mostra completedContent", () => {
    const { root, recorder } = setup({ initialStep: 3 });
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
    expect(recorder.completed).toBe(1);
    expect(screen.getByText("Conta aberta")).toBeInTheDocument();
    expect(statuses(root)).toEqual(["complete", "complete", "complete"]);
    expect(screen.queryByRole("button", { name: "Concluir" })).not.toBeInTheDocument();
  });

  it("rotulos dos botoes sao configuraveis", () => {
    setup({ backLabel: "Anterior", nextLabel: "Seguir", initialStep: 2 });
    expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seguir" })).toBeInTheDocument();
  });

  it("clicar no circulo pula para o passo e chama onStepChange", () => {
    const { root, recorder } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Passo 3: Revisao" }));
    expect(root).toHaveAttribute("data-step", "3");
    expect(recorder.steps).toEqual([3]);
  });

  it("disableIndicatorNavigation impede o pulo", () => {
    const { root, recorder } = setup({ disableIndicatorNavigation: true });
    const circle = screen.getByRole("button", { name: "Passo 3: Revisao" });
    expect(circle).toBeDisabled();
    fireEvent.click(circle);
    expect(root).toHaveAttribute("data-step", "1");
    expect(recorder.steps).toEqual([]);
  });

  it("marca aria-current no ativo e data-status corretos", () => {
    const { root } = setup({ initialStep: 2 });
    expect(statuses(root)).toEqual(["complete", "active", "upcoming"]);
    expect(screen.getByRole("button", { name: "Passo 2: Perfil" })).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(screen.getByRole("button", { name: "Passo 1: Dados" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("move o foco para a regiao de conteudo ao trocar de passo", () => {
    const { container } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    const content = container.querySelector('[data-slot="stepper-content"]');
    expect(content).toHaveAttribute("tabindex", "-1");
    expect(content).toHaveFocus();
  });

  it("movimento reduzido troca o conteudo direto", () => {
    const { root } = setup({}, "always");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Conteudo B")).toBeInTheDocument();
    expect(screen.queryByText("Conteudo A")).not.toBeInTheDocument();
    expect(root.querySelectorAll('[data-slot="stepper-connector"]')).toHaveLength(2);
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "custom-x" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom-x");
  });
});
