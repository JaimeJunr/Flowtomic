import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef, useState } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CascadeCodeInput, type CascadeCodeInputProps } from "./cascade-code-input";

const ROOT = '[data-slot="cascade-code-input"]';
const SLOT = '[data-slot="cascade-code-input-slot"]';

class FakeCodeListener {
  changes: string[] = [];
  completes: string[] = [];
  onChange = (code: string) => {
    this.changes.push(code);
  };
  onComplete = (code: string) => {
    this.completes.push(code);
  };
}

function setup(props: Partial<CascadeCodeInputProps> = {}, reduced: "always" | "never" = "always") {
  const listener = new FakeCodeListener();
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <CascadeCodeInput
        onValueChange={listener.onChange}
        onComplete={listener.onComplete}
        {...props}
      />
    </MotionConfig>
  );
  const input = screen.getByLabelText("Código de verificação") as HTMLInputElement;
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, input, root, listener };
}

const slots = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>(SLOT));

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  // jsdom não implementa; a lib input-otp chama ao digitar (detecção de badge de gerenciador de senhas).
  document.elementFromPoint = () => null;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("CascadeCodeInput", () => {
  it("renderiza 6 casas por padrão e length=4 renderiza 4", () => {
    const first = setup();
    expect(slots(first.container)).toHaveLength(6);
    first.unmount();
    const second = setup({ length: 4 });
    expect(slots(second.container)).toHaveLength(4);
  });

  it("digitar chama onValueChange a cada dígito e onComplete uma vez", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, listener, container } = setup();
    await user.type(input, "123456");
    expect(listener.changes).toEqual(["1", "12", "123", "1234", "12345", "123456"]);
    expect(listener.completes).toEqual(["123456"]);
    expect(slots(container).every((s) => s.dataset.filled === "true")).toBe(true);
  });

  it("ignora letras", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, listener } = setup();
    await user.type(input, "ab1c2");
    expect(listener.changes).toEqual(["1", "12"]);
  });

  it("mask mostra pontos no lugar dos dígitos", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, container } = setup({ mask: true });
    await user.type(input, "12");
    expect(slots(container)[0]).toHaveTextContent("•");
    expect(slots(container)[0]).not.toHaveTextContent("1");
  });

  it("mostra o dígito quando não está mascarado", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, container } = setup();
    await user.type(input, "7");
    expect(slots(container)[0]).toHaveTextContent("7");
  });

  it("aceita defaultValue e value controlado", () => {
    const { container, rerender } = setup({ defaultValue: "12" });
    expect(slots(container).filter((s) => s.dataset.filled === "true")).toHaveLength(2);
    rerender(
      <MotionConfig reducedMotion="always">
        <CascadeCodeInput value="1234" />
      </MotionConfig>
    );
    expect(slots(container).filter((s) => s.dataset.filled === "true")).toHaveLength(4);
  });

  it("status=error esvazia depois dos timers e chama onValueChange('')", () => {
    const { listener, container, rerender, root } = setup({ defaultValue: "000000" });
    rerender(
      <MotionConfig reducedMotion="never">
        <CascadeCodeInput defaultValue="000000" status="error" onValueChange={listener.onChange} />
      </MotionConfig>
    );
    expect(root).toHaveAttribute("data-status", "error");
    expect(screen.getByText("Código incorreto")).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(2000));
    expect(listener.changes.at(-1)).toBe("");
    expect(slots(container).every((s) => s.dataset.filled === "false")).toBe(true);
  });

  it("status=success desabilita o input", () => {
    const { input, root } = setup({ defaultValue: "123456", status: "success" });
    expect(input).toBeDisabled();
    expect(root).toHaveAttribute("data-status", "success");
  });

  it("disabled desabilita o input", () => {
    const { input } = setup({ disabled: true });
    expect(input).toBeDisabled();
  });

  it("anuncia o progresso em região aria-live", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, container } = setup();
    await user.type(input, "123");
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("3 de 6 dígitos");
  });

  it("movimento reduzido: o cursor não pisca", () => {
    const { container, input } = setup();
    act(() => input.focus());
    expect(container.querySelector(".animate-caret-blink")).toBeNull();
    expect(container.querySelector('[data-slot="cascade-code-input-caret"]')).toBeInTheDocument();
  });

  it("com movimento normal o cursor pisca", () => {
    const { container, input } = setup({}, "never");
    act(() => input.focus());
    expect(container.querySelector(".animate-caret-blink")).toBeInTheDocument();
  });

  it("caret=false não renderiza cursor", () => {
    const { container, input } = setup({ caret: false });
    act(() => input.focus());
    expect(container.querySelector('[data-slot="cascade-code-input-caret"]')).toBeNull();
  });

  it("marca a casa ativa ao focar", () => {
    const { container, input } = setup();
    act(() => input.focus());
    expect(slots(container)[0].dataset.active).toBe("true");
  });

  it("ref chega no input e className na raiz", () => {
    const ref = createRef<HTMLInputElement>();
    const { input, root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(input);
    expect(root).toHaveClass("minha-classe");
  });

  it("aria-label customizado", () => {
    render(<CascadeCodeInput aria-label="Código SMS" />);
    expect(screen.getByLabelText("Código SMS")).toBeInTheDocument();
  });

  it("colar o código inteiro completa", () => {
    const { input, listener } = setup();
    fireEvent.change(input, { target: { value: "654321" } });
    expect(listener.completes).toEqual(["654321"]);
  });

  it("fluxo interativo: código errado vira erro e limpa", async () => {
    function Harness() {
      const [status, setStatus] = useState<"idle" | "error">("idle");
      return (
        <MotionConfig reducedMotion="always">
          <CascadeCodeInput
            status={status}
            onValueChange={(c) => c !== "" && setStatus("idle")}
            onComplete={(c) => setStatus(c === "000000" ? "error" : "idle")}
          />
        </MotionConfig>
      );
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<Harness />);
    await user.type(screen.getByLabelText("Código de verificação"), "000000");
    act(() => void vi.advanceTimersByTime(1000));
    expect(slots(container).every((s) => s.dataset.filled === "false")).toBe(true);
  });
});
