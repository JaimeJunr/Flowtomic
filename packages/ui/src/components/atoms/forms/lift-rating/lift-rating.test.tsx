import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LiftRating } from "./lift-rating";
import { litCount, nextRating, tipOffset } from "./lift-rating-utils";

const ROOT = '[data-slot="lift-rating"]';
const TIP = '[data-slot="lift-rating-tip"]';
const LABELS = ["Ruim", "Fraco", "Ok", "Bom", "Ótimo"];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: React.ComponentProps<typeof LiftRating> = {}) {
  const view = render(
    <MotionConfig reducedMotion="never">
      <LiftRating {...props} />
    </MotionConfig>
  );
  return { ...view, root: view.container.querySelector(ROOT) as HTMLElement };
}

const star = (n: number, labels?: string[]) =>
  screen.getByRole("radio", { name: labels?.[n - 1] ?? (n === 1 ? "1 estrela" : `${n} estrelas`) });

describe("funções puras", () => {
  it("litCount prefere a prévia e cai no valor salvo", () => {
    expect(litCount(2, 4)).toBe(4);
    expect(litCount(2, null)).toBe(2);
    expect(litCount(0, 0)).toBe(0);
  });

  it("nextRating limpa só com allowClear; outra estrela troca", () => {
    expect(nextRating(4, 4, true)).toBe(0);
    expect(nextRating(4, 4, false)).toBe(4);
    expect(nextRating(4, 2, true)).toBe(2);
    expect(nextRating(0, 3, false)).toBe(3);
  });

  it("tipOffset centraliza o balão na estrela", () => {
    expect(tipOffset(1, 24, 4)).toBe(12);
    expect(tipOffset(3, 24, 4)).toBe(2 * 28 + 12);
  });

  it("tipOffset rejeita índice inválido com valor recebido", () => {
    expect(() => tipOffset(0, 24, 4)).toThrow(/received 0/);
  });
});

describe("LiftRating", () => {
  it("clicar na 4ª chama onValueChange(4) e clicar de novo limpa para 0", async () => {
    const calls: number[] = [];
    const user = userEvent.setup();
    const { root } = setup({ onValueChange: (v) => calls.push(v) });
    await user.click(star(4));
    expect(calls).toEqual([4]);
    expect(root.getAttribute("data-value")).toBe("4");
    await user.click(star(4));
    expect(calls).toEqual([4, 0]);
    expect(root.getAttribute("data-value")).toBe("0");
  });

  it("allowClear=false mantém a nota ao clicar de novo", async () => {
    const calls: number[] = [];
    const user = userEvent.setup();
    setup({ allowClear: false, onValueChange: (v) => calls.push(v) });
    await user.click(star(4));
    await user.click(star(4));
    expect(calls).toEqual([4, 4]);
    expect(star(4).getAttribute("data-lit")).toBe("true");
  });

  it("hover na 3ª acende 3, mostra o balão e avisa onPreview; sair limpa", async () => {
    const previews: Array<number | null> = [];
    const user = userEvent.setup();
    const { container } = setup({ labels: LABELS, onPreview: (v) => previews.push(v) });
    await user.hover(star(3, LABELS));
    expect([1, 2, 3, 4, 5].map((n) => star(n, LABELS).getAttribute("data-lit"))).toEqual([
      "true",
      "true",
      "true",
      "false",
      "false",
    ]);
    expect(container.querySelector(TIP)?.textContent).toBe("Ok");
    expect(previews).toEqual([3]);
    await user.unhover(star(3, LABELS));
    expect(previews).toEqual([3, null]);
    expect(container.querySelector(TIP)).toBeNull();
  });

  it("balão mostra o número quando não há rótulos", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    await user.hover(star(2));
    expect(container.querySelector(TIP)?.textContent).toBe("2");
  });

  it("showTip=false não renderiza balão", async () => {
    const user = userEvent.setup();
    const { container } = setup({ showTip: false });
    await user.hover(star(2));
    expect(container.querySelector(TIP)).toBeNull();
  });

  it("setas mudam o valor e Backspace limpa", async () => {
    const calls: number[] = [];
    const user = userEvent.setup();
    setup({ defaultValue: 2, onValueChange: (v) => calls.push(v) });
    star(2).focus();
    // O Radix só clica na estrela focada enquanto a seta está pressionada (keyup zera a flag).
    await user.keyboard("{ArrowRight>}");
    await waitFor(() => expect(calls).toEqual([3]));
    await user.keyboard("{/ArrowRight}");
    await user.keyboard("{Backspace}");
    expect(calls).toEqual([3, 0]);
  });

  it("controlado: reflete value", () => {
    const { rerender, root } = setup({ value: 2 });
    expect(root.getAttribute("data-value")).toBe("2");
    rerender(
      <MotionConfig reducedMotion="never">
        <LiftRating value={5} />
      </MotionConfig>
    );
    expect(root.getAttribute("data-value")).toBe("5");
  });

  it("readOnly vira img com nome e ignora clique", async () => {
    const calls: number[] = [];
    const user = userEvent.setup();
    const { root } = setup({
      readOnly: true,
      defaultValue: 3,
      onValueChange: (v) => calls.push(v),
    });
    const img = screen.getByRole("img", { name: "Avaliação: 3 de 5" });
    expect(img).toBe(root);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    await user.click(root.querySelectorAll('[data-slot="lift-rating-item"]')[4] as Element);
    expect(calls).toEqual([]);
    expect(root.getAttribute("data-value")).toBe("3");
  });

  it("disabled ignora clique", async () => {
    const calls: number[] = [];
    const user = userEvent.setup();
    setup({ disabled: true, onValueChange: (v) => calls.push(v) });
    await user.click(star(4));
    expect(calls).toEqual([]);
  });

  it("usa rótulos como nome acessível e respeita count e shape", () => {
    const { container } = setup({ count: 3, labels: ["A", "B", "C"], shape: "heart" });
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "B" })).toBeTruthy();
    expect(container.querySelector("svg.lucide-heart")).not.toBeNull();
  });

  it("icon substitui o shape", () => {
    setup({ icon: <span data-testid="meu-icone" />, count: 2 });
    expect(screen.getAllByTestId("meu-icone")).toHaveLength(2);
  });

  it("movimento reduzido continua acendendo e mostrando o balão", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <LiftRating labels={LABELS} />
      </MotionConfig>
    );
    fireEvent.pointerEnter(star(4, LABELS));
    expect(star(4, LABELS).getAttribute("data-lit")).toBe("true");
    expect(container.querySelector(TIP)?.textContent).toBe("Bom");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "extra" });
    expect(ref.current).toBe(root);
    expect(root.className).toContain("extra");
  });
});
