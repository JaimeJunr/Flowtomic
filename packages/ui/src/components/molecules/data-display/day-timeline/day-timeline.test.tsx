import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { type DayMoment, DayTimeline } from "./day-timeline";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

const moments: DayMoment[] = [
  {
    id: "a",
    time: "08:00",
    eyebrow: "No trabalho",
    title: "Abre o dia",
    description: "Fila arrumada",
    message: "Separei os PRs",
    reaction: "ok",
  },
  {
    id: "b",
    time: "12:00",
    title: "Meio do dia",
    description: "Revisão agrupada",
    message: "Agrupei os comentários",
  },
  { id: "c", time: "18:00", title: "Fim do dia", message: "Changelog pronto" },
];

const slider = () => screen.getByRole("slider", { name: "Momento do dia" });

describe("DayTimeline", () => {
  it("renderiza a régua com o valuetext do primeiro momento e o texto dele", () => {
    render(<DayTimeline moments={moments} />);
    expect(slider()).toHaveAttribute("aria-valuetext", "08:00, Abre o dia");
    expect(slider()).toHaveAttribute("aria-valuemin", "0");
    expect(slider()).toHaveAttribute("aria-valuemax", "2");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Abre o dia")).toBeInTheDocument();
    expect(screen.getByText("Fila arrumada")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
  });

  it("setas avançam e voltam, e desabilitam nas pontas", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<DayTimeline moments={moments} />);
    const prev = screen.getByRole("button", { name: "Momento anterior" });
    const next = screen.getByRole("button", { name: "Próximo momento" });
    expect(prev).toBeDisabled();
    await user.click(next);
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
    await user.click(next);
    expect(next).toBeDisabled();
    await user.click(prev);
    expect(slider()).toHaveAttribute("aria-valuetext", "12:00, Meio do dia");
  });

  it("teclado: ArrowRight, ArrowLeft, End e Home", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<DayTimeline moments={moments} />);
    act(() => slider().focus());
    await user.keyboard("{ArrowRight}");
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
    await user.keyboard("{ArrowLeft}");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(slider()).toHaveAttribute("aria-valuenow", "2");
    await user.keyboard("{Home}");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
  });

  it("clique num ponto vai para aquele momento", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<DayTimeline moments={moments} />);
    await user.click(screen.getByRole("button", { name: "18:00: Fim do dia" }));
    expect(slider()).toHaveAttribute("aria-valuetext", "18:00, Fim do dia");
    expect(screen.getByText("Changelog pronto")).toBeInTheDocument();
  });

  it("controlado: avisa o id e só muda quando o value muda", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DayTimeline moments={moments} value="a" onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("button", { name: "Próximo momento" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(slider()).toHaveAttribute("aria-valuenow", "0");
    rerender(<DayTimeline moments={moments} value="b" onValueChange={onValueChange} />);
    expect(slider()).toHaveAttribute("aria-valuenow", "1");
  });

  it("posiciona pelo horário: o momento das 12:00 fica a 40% do trilho", () => {
    render(<DayTimeline moments={moments} />);
    const dots = screen.getAllByRole("button", { name: /^\d\d:\d\d: / });
    expect(dots[0].style.left).toBe("0%");
    expect(dots[1].style.left).toBe("40%");
    expect(dots[2].style.left).toBe("100%");
  });

  it("arrastar o cursor mostra a hora da posição e encaixa no momento mais próximo", () => {
    render(<DayTimeline moments={moments} />);
    const track = document.querySelector('[data-slot="day-timeline-track"]') as HTMLElement;
    track.getBoundingClientRect = () => ({
      width: 1000,
      left: 0,
      right: 1000,
      top: 0,
      bottom: 72,
      height: 72,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const cursor = document.querySelector('[data-slot="day-timeline-cursor"]') as HTMLElement;
    fireEvent.pointerDown(cursor, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(cursor, { clientX: 500, pointerId: 1 });
    expect(screen.getByText("13:00")).toBeInTheDocument();
    fireEvent.pointerMove(cursor, { clientX: 950, pointerId: 1 });
    fireEvent.pointerUp(cursor, { clientX: 950, pointerId: 1 });
    expect(slider()).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("18:00")).toBeInTheDocument();
  });

  describe("autoPlay", () => {
    it("avança sozinho e volta ao início no fim", () => {
      vi.useFakeTimers();
      render(<DayTimeline moments={moments} autoPlay={1000} />);
      expect(slider()).toHaveAttribute("aria-valuenow", "0");
      act(() => void vi.advanceTimersByTime(1000));
      expect(slider()).toHaveAttribute("aria-valuenow", "1");
      act(() => void vi.advanceTimersByTime(1000));
      expect(slider()).toHaveAttribute("aria-valuenow", "2");
      act(() => void vi.advanceTimersByTime(1000));
      expect(slider()).toHaveAttribute("aria-valuenow", "0");
    });

    it("pausa com o ponteiro sobre a seção e o botão alterna", () => {
      vi.useFakeTimers();
      const { container } = render(<DayTimeline moments={moments} autoPlay={1000} />);
      const section = container.querySelector("section") as HTMLElement;
      fireEvent.pointerEnter(section);
      act(() => void vi.advanceTimersByTime(3000));
      expect(slider()).toHaveAttribute("aria-valuenow", "0");
      fireEvent.pointerLeave(section);
      act(() => void vi.advanceTimersByTime(1000));
      expect(slider()).toHaveAttribute("aria-valuenow", "1");

      fireEvent.click(screen.getByRole("button", { name: "Pausar apresentação" }));
      act(() => void vi.advanceTimersByTime(3000));
      expect(slider()).toHaveAttribute("aria-valuenow", "1");
      fireEvent.click(screen.getByRole("button", { name: "Retomar apresentação" }));
      act(() => void vi.advanceTimersByTime(1000));
      expect(slider()).toHaveAttribute("aria-valuenow", "2");
    });

    it("não toca com movimento reduzido e a região viva avisa quando toca", () => {
      vi.useFakeTimers();
      const { unmount } = render(<DayTimeline moments={moments} autoPlay={1000} />);
      expect(document.querySelector('[data-slot="day-timeline-content"]')).toHaveAttribute(
        "aria-live",
        "off"
      );
      unmount();
      render(
        <MotionConfig reducedMotion="always">
          <DayTimeline moments={moments} autoPlay={1000} />
        </MotionConfig>
      );
      act(() => void vi.advanceTimersByTime(3000));
      expect(slider()).toHaveAttribute("aria-valuenow", "0");
      expect(document.querySelector('[data-slot="day-timeline-content"]')).toHaveAttribute(
        "aria-live",
        "polite"
      );
    });
  });

  it("o balão mostra a message do momento ativo e a reação", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<DayTimeline moments={moments} avatar={<span>avatar</span>} />);
    const bubble = document.querySelector('[data-slot="day-timeline-bubble"]') as HTMLElement;
    expect(bubble).toHaveTextContent("Separei os PRs");
    expect(bubble).toHaveTextContent("ok");
    expect(screen.getByText("avatar")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Próximo momento" }));
    expect(screen.getByText("Agrupei os comentários")).toBeInTheDocument();
    expect(screen.queryByText("Separei os PRs")).not.toBeInTheDocument();
  });

  it("não renderiza nada sem momentos", () => {
    const { container } = render(<DayTimeline moments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
