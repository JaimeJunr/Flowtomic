import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DomeGallery, type DomeGalleryProps, type DomeItem } from "./dome-gallery";

const ROOT = '[data-slot="dome-gallery"]';
const SPHERE = '[data-slot="dome-gallery-sphere"]';

const ITEMS: DomeItem[] = [
  { id: "a", label: "Previdência", image: "/a.png" },
  { id: "b", label: "Câmbio", content: <span>CB</span> },
  { id: "c", label: "Crédito", image: "/c.png" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<DomeGalleryProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <DomeGallery items={ITEMS} segments={8} aria-label="Segmentos" {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const sphere = view.container.querySelector(SPHERE) as HTMLDivElement;
  return { ...view, root, sphere };
}

function drag(root: HTMLElement, from: [number, number], to: [number, number]) {
  fireEvent.pointerDown(root, { clientX: from[0], clientY: from[1], pointerId: 1 });
  fireEvent.pointerMove(root, { clientX: to[0], clientY: to[1], pointerId: 1 });
  fireEvent.pointerUp(root, { clientX: to[0], clientY: to[1], pointerId: 1 });
}

describe("DomeGallery", () => {
  it("expõe a região com papel e rótulo", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "galeria");
    expect(root).toHaveAttribute("aria-label", "Segmentos");
    expect(root).toHaveClass("select-none", "relative", "overflow-hidden");
  });

  it("repassa ref e className por último", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "h-96" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("h-96");
  });

  it("renderiza segments x 5 ladrilhos", () => {
    const { container } = setup();
    expect(container.querySelectorAll('[data-slot="dome-gallery-tile"]')).toHaveLength(40);
  });

  it("deixa as repetições fora da árvore de acessibilidade", () => {
    const { container } = setup();
    expect(screen.getAllByRole("button", { name: "Câmbio" })).toHaveLength(1);
    const hidden = container.querySelectorAll(
      '[data-slot="dome-gallery-tile"][aria-hidden="true"]'
    );
    expect(hidden).toHaveLength(37);
    expect(hidden[0]).toHaveAttribute("tabindex", "-1");
  });

  it("mostra a imagem com alt e sem arraste nativo", () => {
    setup();
    const img = screen.getAllByAltText("Previdência")[0];
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("aplica grayscale por padrão e permite desligar", () => {
    const { container, rerender } = setup();
    const tile = container.querySelector('[data-slot="dome-gallery-tile"]') as HTMLElement;
    expect(tile.className).toContain("grayscale");
    rerender(<DomeGallery items={ITEMS} segments={8} grayscale={false} aria-label="x" />);
    const tile2 = container.querySelector('[data-slot="dome-gallery-tile"]') as HTMLElement;
    expect(tile2.className).not.toMatch(/(^|\s)grayscale(\s|$)/);
  });

  it("lança erro para props inválidas", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<DomeGallery items={[]} />)).toThrow(/items/);
    expect(() => render(<DomeGallery items={ITEMS} segments={5} />)).toThrow(/segments.*5/);
    expect(() => render(<DomeGallery items={ITEMS} fit={3} />)).toThrow(/fit.*3/);
    spy.mockRestore();
  });

  describe("arraste", () => {
    it("altera o transform da esfera", () => {
      const { root, sphere } = setup();
      const before = sphere.style.transform;
      drag(root, [100, 100], [300, 100]);
      expect(sphere.style.transform).not.toBe(before);
      expect(sphere.style.transform).toContain("rotateY(-10deg)");
    });

    it("respeita o limite vertical", () => {
      const { root, sphere } = setup({ maxVerticalRotation: 5 });
      drag(root, [100, 100], [100, 5000]);
      expect(sphere.style.transform).toContain("rotateX(5deg)");
    });

    it("não abre depois de um arraste longo", () => {
      const { root } = setup();
      const button = screen.getByRole("button", { name: "Previdência" });
      drag(root, [100, 100], [300, 100]);
      fireEvent.click(button);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("mantém inércia depois de soltar", () => {
      vi.useFakeTimers({
        toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
      });
      const { root, sphere } = setup();
      fireEvent.pointerDown(root, { clientX: 100, clientY: 100, pointerId: 1 });
      act(() => {
        vi.advanceTimersByTime(16);
      });
      fireEvent.pointerMove(root, { clientX: 140, clientY: 100, pointerId: 1 });
      fireEvent.pointerUp(root, { clientX: 140, clientY: 100, pointerId: 1 });
      const atRelease = sphere.style.transform;
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(sphere.style.transform).not.toBe(atRelease);
    });

    it("para ao soltar com movimento reduzido", () => {
      vi.useFakeTimers({
        toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
      });
      const { root, sphere } = setup({}, "always");
      fireEvent.pointerDown(root, { clientX: 100, clientY: 100, pointerId: 1 });
      act(() => {
        vi.advanceTimersByTime(16);
      });
      fireEvent.pointerMove(root, { clientX: 140, clientY: 100, pointerId: 1 });
      fireEvent.pointerUp(root, { clientX: 140, clientY: 100, pointerId: 1 });
      const atRelease = sphere.style.transform;
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(sphere.style.transform).toBe(atRelease);
    });

    it("gira uma unidade com as setas do teclado", () => {
      const { root, sphere } = setup();
      fireEvent.keyDown(root, { key: "ArrowRight" });
      expect(sphere.style.transform).toContain("rotateY(-45deg)");
    });
  });

  describe("abrir e fechar", () => {
    it("abre o diálogo ao clicar e avisa onOpenChange", () => {
      const onOpenChange = vi.fn();
      setup({ onOpenChange });
      fireEvent.click(screen.getByRole("button", { name: "Câmbio" }));
      const dialog = screen.getByRole("dialog", { name: "Câmbio" });
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog.getAttribute("data-slot")).toBe("dome-gallery-viewer");
      expect(onOpenChange).toHaveBeenCalledWith(ITEMS[1]);
    });

    it("fecha com Esc e devolve o foco ao ladrilho", async () => {
      const onOpenChange = vi.fn();
      setup({ onOpenChange });
      const tile = screen.getByRole("button", { name: "Câmbio" });
      tile.focus();
      fireEvent.click(tile);
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(onOpenChange).toHaveBeenLastCalledWith(null);
      expect(tile).toHaveFocus();
    });

    it("fecha pelo botão Fechar", async () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: "Previdência" }));
      fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("fecha ao clicar no véu", async () => {
      const { container } = setup();
      fireEvent.click(screen.getByRole("button", { name: "Previdência" }));
      const veil = container.querySelector('[data-slot="dome-gallery-veil"]') as HTMLElement;
      fireEvent.click(veil);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("aplica openedSize ao diálogo", () => {
      setup({ openedSize: { width: "320px", height: "200px" } });
      fireEvent.click(screen.getByRole("button", { name: "Previdência" }));
      const dialog = screen.getByRole("dialog");
      expect(dialog.style.width).toBe("320px");
      expect(dialog.style.height).toBe("200px");
    });

    it("abre sem mola com movimento reduzido", () => {
      setup({}, "always");
      fireEvent.click(screen.getByRole("button", { name: "Previdência" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
