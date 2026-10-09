import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { StarBorder } from "./star-border";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

const useFakeClock = () =>
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });

const root = () => screen.getByTestId("sb");
const stars = () => root().querySelectorAll('[data-slot="star-border-star"]');

describe("StarBorder", () => {
  it("renderiza button type=button por padrão com marcação do slot", () => {
    render(<StarBorder data-testid="sb">Assinar</StarBorder>);
    expect(root().tagName).toBe("BUTTON");
    expect(root()).toHaveAttribute("type", "button");
    expect(root()).toHaveAttribute("data-slot", "star-border");
    expect(root()).toHaveAttribute("data-hover", "lap");
    expect(root().querySelector('svg[data-slot="star-border-track"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("respeita type informado e renderiza link com as=a", () => {
    const { rerender } = render(
      <StarBorder data-testid="sb" type="submit">
        Enviar
      </StarBorder>
    );
    expect(root()).toHaveAttribute("type", "submit");
    rerender(
      <StarBorder as="a" href="/planos" data-testid="sb">
        Ver planos
      </StarBorder>
    );
    expect(root().tagName).toBe("A");
    expect(root()).toHaveAttribute("href", "/planos");
    expect(root()).not.toHaveAttribute("type");
  });

  it("stars={3} renderiza 3 estrelas e o limite é 6", () => {
    const { rerender } = render(
      <StarBorder data-testid="sb" stars={3}>
        Assinar
      </StarBorder>
    );
    expect(stars()).toHaveLength(3);
    rerender(
      <StarBorder data-testid="sb" stars={20}>
        Assinar
      </StarBorder>
    );
    expect(stars()).toHaveLength(6);
  });

  it("pathLength é atributo de cada rect e cada estrela tem 3 segmentos", () => {
    render(<StarBorder data-testid="sb">Assinar</StarBorder>);
    const rects = stars()[0].querySelectorAll("rect");
    expect(rects).toHaveLength(3);
    for (const r of rects) expect(r.getAttribute("pathLength")).toBe("1");
  });

  it("hover=reveal: opacidade 0 em repouso, 1 no pointerenter e no foco", () => {
    render(
      <StarBorder data-testid="sb" hover="reveal">
        Assinar
      </StarBorder>
    );
    const opacity = () => (stars()[0] as SVGElement).style.opacity;
    expect(opacity()).toBe("0");
    fireEvent.pointerEnter(root());
    expect(opacity()).toBe("1");
    fireEvent.pointerLeave(root());
    expect(opacity()).toBe("0");
    fireEvent.focus(root());
    expect(opacity()).toBe("1");
    fireEvent.blur(root());
    expect(opacity()).toBe("0");
  });

  it("hover=none não mexe na estrela e repassa handlers do usuário", () => {
    const onPointerEnter = vi.fn();
    render(
      <StarBorder data-testid="sb" hover="none" onPointerEnter={onPointerEnter}>
        Assinar
      </StarBorder>
    );
    fireEvent.pointerEnter(root());
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
    expect((stars()[0] as SVGElement).style.opacity).toBe("1");
  });

  it("clique chama onClick e, com clickPulse, o pointerdown cria o pulso e ele some em 600 ms", () => {
    useFakeClock();
    const onClick = vi.fn();
    render(
      <StarBorder data-testid="sb" onClick={onClick}>
        Assinar
      </StarBorder>
    );
    fireEvent.pointerDown(root(), { clientX: 10, clientY: 0 });
    fireEvent.click(root());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(root().querySelectorAll('[data-slot="star-border-pulse"]')).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(root().querySelectorAll('[data-slot="star-border-pulse"]')).toHaveLength(0);
  });

  it("clickPulse=false não cria pulso", () => {
    render(
      <StarBorder data-testid="sb" clickPulse={false}>
        Assinar
      </StarBorder>
    );
    fireEvent.pointerDown(root());
    expect(root().querySelector('[data-slot="star-border-pulse"]')).toBeNull();
  });

  it("a estrela orbita: o dashoffset muda com o tempo", () => {
    useFakeClock();
    render(<StarBorder data-testid="sb">Assinar</StarBorder>);
    expect(root()).toHaveAttribute("data-animated", "true");
    const seg = () => stars()[0].querySelector("rect")?.getAttribute("stroke-dashoffset");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const before = seg();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(seg()).not.toBe(before);
  });

  it("movimento reduzido: sem órbita nem pulso, data-animated=false", () => {
    useFakeClock();
    render(
      <MotionConfig reducedMotion="always">
        <StarBorder data-testid="sb">Assinar</StarBorder>
      </MotionConfig>
    );
    expect(root()).toHaveAttribute("data-animated", "false");
    const seg = () => stars()[0].querySelector("rect")?.getAttribute("stroke-dashoffset");
    const before = seg();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(seg()).toBe(before);
    fireEvent.pointerDown(root());
    expect(root().querySelector('[data-slot="star-border-pulse"]')).toBeNull();
    expect(stars()).toHaveLength(1);
  });

  it("aplica ref, className e brilho por token", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <StarBorder data-testid="sb" ref={ref} className="w-full" glow={0.5}>
        Assinar
      </StarBorder>
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveClass("w-full");
    expect((stars()[0] as SVGElement).style.filter).toContain(
      "drop-shadow(0 0 4px var(--primary))"
    );
  });

  it("hover=lap acelera a órbita: depois do pointerenter a fase passa da de hover=none", () => {
    const offsetAfterHover = (hover: "lap" | "none") => {
      useFakeClock();
      const { unmount } = render(
        <StarBorder data-testid="sb" hover={hover}>
          Assinar
        </StarBorder>
      );
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.pointerEnter(root());
      act(() => {
        vi.advanceTimersByTime(300);
      });
      const value = stars()[0].querySelector("rect")?.getAttribute("stroke-dashoffset");
      unmount();
      vi.useRealTimers();
      return Number(value);
    };
    expect(offsetAfterHover("lap")).not.toBeCloseTo(offsetAfterHover("none"), 3);
  });
});
