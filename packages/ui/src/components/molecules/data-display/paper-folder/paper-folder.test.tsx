import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PaperFolder, type PaperFolderProps } from "./paper-folder";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const PAPERS = [<span key="a">Extrato</span>, <span key="b">Contrato</span>];

function setup(props: Partial<PaperFolderProps> = {}, reduced = false) {
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <PaperFolder label="Documentos" papers={PAPERS} {...props} />
    </MotionConfig>
  );
  const root = screen.getByRole("button") as HTMLButtonElement;
  const papers = Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-slot="paper-folder-paper"]')
  );
  return { ...view, root, papers };
}

describe("PaperFolder", () => {
  it("alterna aberto ao clicar e avisa", () => {
    const onOpenChange = vi.fn();
    const { root } = setup({ onOpenChange });
    expect(root).toHaveAttribute("aria-expanded", "false");
    expect(root).toHaveAttribute("data-state", "closed");
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-state", "open");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    fireEvent.click(root);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("modo controlado manda no estado", () => {
    const onOpenChange = vi.fn();
    const { root } = setup({ open: false, onOpenChange });
    fireEvent.click(root);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("respeita defaultOpen e rótulo", () => {
    const { root } = setup({ defaultOpen: true });
    expect(root).toHaveAttribute("data-state", "open");
    expect(root).toHaveAttribute("aria-label", "Documentos");
  });

  it("esconde folhas do leitor de tela quando fechada", () => {
    const { root, papers } = setup();
    expect(papers[0]).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(root);
    expect(papers[0]).not.toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza no máximo 3 folhas e avisa uma vez com mais", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const many = [1, 2, 3, 4].map((n) => <span key={n}>{n}</span>);
    const { papers } = setup({ papers: many });
    expect(papers).toHaveLength(3);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("4");
    warn.mockRestore();
  });

  it("não avisa com até 3 folhas", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setup();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("ímã: pointermove define --mx/--my e pointerleave zera", () => {
    const { papers } = setup({ defaultOpen: true });
    const paper = papers[0];
    paper.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;
    fireEvent.pointerMove(paper, { clientX: 100, clientY: 50 });
    expect(paper.style.getPropertyValue("--mx")).toBe("7.5px");
    expect(paper.style.getPropertyValue("--my")).toBe("0px");
    fireEvent.pointerLeave(paper);
    expect(paper.style.getPropertyValue("--mx")).toBe("0px");
  });

  it("ímã não age com a pasta fechada", () => {
    const { papers } = setup();
    papers[0].getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    fireEvent.pointerMove(papers[0], { clientX: 100, clientY: 50 });
    expect(papers[0].style.getPropertyValue("--mx")).not.toBe("7.5px");
  });

  it("tone muda a classe e size escala o layout", () => {
    const { root, container } = setup({ tone: "accent", size: 2 });
    expect(root).toHaveAttribute("data-tone", "accent");
    expect(container.querySelector('[data-slot="paper-folder-back"]')?.className).toContain(
      "bg-accent"
    );
    expect(root.style.width).toBe("200px");
    expect(root.style.height).toBe("160px");
  });

  it("movimento reduzido remove transições e ímã", () => {
    const { container, papers } = setup({ defaultOpen: true }, true);
    expect(container.querySelector('[data-slot="paper-folder-front"]')?.className).not.toContain(
      "transition"
    );
    expect(papers[0].className).not.toContain("transition");
    papers[0].getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    fireEvent.pointerMove(papers[0], { clientX: 100, clientY: 50 });
    expect(papers[0].style.getPropertyValue("--mx")).not.toBe("7.5px");
  });

  it("aceita ref e className", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<PaperFolder ref={ref} label="Pasta" className="extra" />);
    expect(ref.current).toHaveAttribute("data-slot", "paper-folder");
    expect(ref.current?.className).toContain("extra");
  });
});
