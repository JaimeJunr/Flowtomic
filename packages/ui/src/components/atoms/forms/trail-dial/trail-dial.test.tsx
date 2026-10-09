import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { TrailDial } from "./trail-dial";
import {
  angleToValue,
  arcPath,
  bounceForVelocity,
  clampDragAngle,
  cometSegments,
  energyFromAngularVelocity,
  pointToAngle,
  releaseTarget,
  valueToAngle,
} from "./trail-dial-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof TrailDial>> = {}, reduced = false) {
  return render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <TrailDial aria-label="Meta de alocação" {...props} />
    </MotionConfig>
  );
}

const getDial = () => screen.getByRole("slider");

function mockRect(el: HTMLElement) {
  return vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    right: 200,
    bottom: 200,
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe("funções puras", () => {
  it("valueToAngle e angleToValue fazem ida e volta", () => {
    expect(valueToAngle(0, 0, 100, 320)).toBe(-160);
    expect(valueToAngle(50, 0, 100, 320)).toBe(0);
    expect(valueToAngle(100, 0, 100, 320)).toBe(160);
    expect(valueToAngle(500, 0, 100, 320)).toBe(160);
    for (const v of [0, 13, 50, 87, 100]) {
      expect(angleToValue(valueToAngle(v, 0, 100, 320), 0, 100, 320, 1)).toBe(v);
    }
  });

  it("angleToValue respeita step e limites", () => {
    expect(angleToValue(0, 0, 100, 320, 10)).toBe(50);
    expect(angleToValue(-10, 0, 100, 320, 10)).toBe(50);
    expect(angleToValue(-170, 0, 100, 320, 1)).toBe(0);
    expect(angleToValue(170, 0, 100, 320, 1)).toBe(100);
    expect(() => angleToValue(0, 10, 10, 320, 1)).toThrow(/received min 10, max 10/);
  });

  it("pointToAngle cobre os 4 quadrantes (0 = topo, horário)", () => {
    expect(pointToAngle(100, 0, 100, 100)).toBeCloseTo(0);
    expect(pointToAngle(200, 100, 100, 100)).toBeCloseTo(90);
    expect(pointToAngle(100, 200, 100, 100)).toBeCloseTo(180);
    expect(pointToAngle(0, 100, 100, 100)).toBeCloseTo(-90);
    expect(pointToAngle(150, 50, 100, 100)).toBeCloseTo(45);
  });

  it("clampDragAngle limita pelo lado mais próximo da abertura", () => {
    expect(clampDragAngle(170, 100, 320)).toBe(160);
    expect(clampDragAngle(-170, -100, 320)).toBe(-160);
    expect(clampDragAngle(30, 20, 320)).toBe(30);
  });

  it("clampDragAngle em 360 não salta de um extremo ao outro", () => {
    expect(clampDragAngle(-175, 175, 360)).toBe(180);
    expect(clampDragAngle(175, -175, 360)).toBe(-180);
    expect(clampDragAngle(100, 90, 360)).toBe(100);
  });

  it("arcPath gera o d do SVG e trata arco completo e vazio", () => {
    expect(arcPath(100, 100, 50, 0, 90)).toBe("M 100 50 A 50 50 0 0 1 150 100");
    expect(arcPath(100, 100, 50, -160, 160)).toContain("A 50 50 0 1 1");
    const full = arcPath(100, 100, 50, -180, 180);
    expect(full).toContain("A 50 50 0 1 1");
    expect(full).not.toContain("NaN");
    expect(arcPath(100, 100, 50, 10, 10)).toMatch(/^M [\d.-]+ [\d.-]+ L /);
  });

  it("releaseTarget: momentum 0 não tem inércia e o destino é limitado", () => {
    expect(releaseTarget(40, 200, 0, 0, 100, 1)).toBe(40);
    expect(releaseTarget(40, 100, 1, 0, 100, 1)).toBeGreaterThan(40);
    expect(releaseTarget(40, -100, 1, 0, 100, 1)).toBeLessThan(40);
    expect(releaseTarget(90, 5000, 1, 0, 100, 1)).toBe(100);
    expect(releaseTarget(10, -5000, 1, 0, 100, 1)).toBe(0);
    expect(releaseTarget(40, 100, 1, 0, 100, 10) % 10).toBe(0);
  });

  it("bounceForVelocity interpola entre toque e flick", () => {
    expect(bounceForVelocity(0, 0, 100, 0.2, 0.1)).toBeCloseTo(0.2);
    expect(bounceForVelocity(100000, 0, 100, 0.2, 0.1)).toBeCloseTo(0.1);
    const mid = bounceForVelocity(75, 0, 100, 0.2, 0.1);
    expect(mid).toBeLessThan(0.2);
    expect(mid).toBeGreaterThan(0.1);
  });

  it("energyFromAngularVelocity fica entre 0 e 1", () => {
    expect(energyFromAngularVelocity(0)).toBe(0);
    expect(energyFromAngularVelocity(-100000)).toBe(1);
    expect(energyFromAngularVelocity(200)).toBeGreaterThan(0);
  });

  it("cometSegments afina a cauda e some sem energia", () => {
    expect(
      cometSegments({
        angle: 0,
        direction: 1,
        energy: 0,
        reach: 180,
        thickness: 6,
        width: 10,
        sweep: 320,
      })
    ).toEqual([]);
    const segs = cometSegments({
      angle: 100,
      direction: 1,
      energy: 1,
      reach: 180,
      thickness: 6,
      width: 10,
      sweep: 320,
    });
    expect(segs.length).toBeGreaterThanOrEqual(6);
    expect(segs.length).toBeLessThanOrEqual(10);
    expect(segs[0].opacity).toBeGreaterThan(segs[segs.length - 1].opacity);
    expect(segs[0].width).toBeGreaterThan(segs[segs.length - 1].width);
    expect(segs[0].width).toBeCloseTo(16);
    for (const s of segs) {
      expect(s.from).toBeGreaterThanOrEqual(-160);
      expect(s.to).toBeLessThanOrEqual(160);
    }
  });
});

describe("TrailDial", () => {
  it("expõe o slider com aria e valuetext com unidade", () => {
    setup({ defaultValue: 62 });
    const dial = getDial();
    expect(dial).toHaveAttribute("aria-label", "Meta de alocação");
    expect(dial).toHaveAttribute("aria-valuemin", "0");
    expect(dial).toHaveAttribute("aria-valuemax", "100");
    expect(dial).toHaveAttribute("aria-valuenow", "62");
    expect(dial).toHaveAttribute("aria-valuetext", "62 %");
    expect(dial).toHaveAttribute("data-slot", "trail-dial");
  });

  it("unit vazio mostra só o número", () => {
    setup({ defaultValue: 62, unit: "" });
    expect(getDial()).toHaveAttribute("aria-valuetext", "62");
    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });

  it("usa o aria-label padrão", () => {
    render(<TrailDial />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-label", "Nível");
  });

  it("teclado: setas, PageUp, Home e End chamam onValueChange e onValueCommit", async () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    setup({ defaultValue: 50, onValueChange, onValueCommit });
    const user = userEvent.setup();
    getDial().focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(51);
    await user.keyboard("{ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith(50);
    await user.keyboard("{PageUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(60);
    await user.keyboard("{PageDown}");
    expect(onValueChange).toHaveBeenLastCalledWith(50);
    await user.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    expect(onValueCommit).toHaveBeenLastCalledWith(100, { velocity: 0, bounce: 0.2 });
    expect(getDial()).toHaveAttribute("aria-valuenow", "100");
  });

  it("não passa dos limites pelo teclado", async () => {
    const onValueChange = vi.fn();
    setup({ defaultValue: 100, onValueChange });
    const user = userEvent.setup();
    getDial().focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disabled ignora teclado e ponteiro", async () => {
    const onValueChange = vi.fn();
    setup({ defaultValue: 50, disabled: true, onValueChange });
    const dial = getDial();
    expect(dial).toHaveAttribute("aria-disabled", "true");
    expect(dial).toHaveClass("opacity-50");
    mockRect(dial);
    fireEvent.keyDown(dial, { key: "ArrowRight" });
    fireEvent.pointerDown(dial, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerUp(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clicar no arco leva o valor até o ponto", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    setup({ defaultValue: 50, onValueChange, onValueCommit });
    const dial = getDial();
    mockRect(dial);
    fireEvent.pointerDown(dial, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerUp(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(onValueChange).toHaveBeenCalledWith(78);
    expect(onValueCommit).toHaveBeenCalledWith(78, { velocity: 0, bounce: 0.2 });
    expect(dial).toHaveAttribute("aria-valuenow", "78");
  });

  it("arrastar muda o valor e soltar sem momentum confirma onde parou", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    setup({ defaultValue: 50, momentum: 0, onValueChange, onValueCommit });
    const dial = getDial();
    mockRect(dial);
    fireEvent.pointerDown(dial, { clientX: 100, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(onValueChange).toHaveBeenLastCalledWith(78);
    fireEvent.pointerUp(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit.mock.calls[0][0]).toBe(78);
    expect(onValueCommit.mock.calls[0][1]).toEqual({
      velocity: expect.any(Number),
      bounce: expect.any(Number),
    });
  });

  it("valor controlado vindo de fora atualiza o slider", () => {
    const { rerender } = render(
      <MotionConfig reducedMotion="never">
        <TrailDial value={20} />
      </MotionConfig>
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "20");
    rerender(
      <MotionConfig reducedMotion="never">
        <TrailDial value={70} />
      </MotionConfig>
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "70");
  });

  it("movimento reduzido não desenha cauda e vai direto ao valor", () => {
    const { container } = setup({ defaultValue: 50 }, true);
    const dial = getDial();
    mockRect(dial);
    fireEvent.pointerDown(dial, { clientX: 100, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(dial, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(container.querySelector('[data-slot="trail-dial-comet"]')).toBeNull();
    expect(dial).toHaveAttribute("aria-valuenow", "78");
  });

  it("renderiza as partes marcadas", () => {
    const { container } = setup({ defaultValue: 50 });
    for (const slot of ["trail-dial-arc", "trail-dial-bead", "trail-dial-value"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "custom" });
    expect(ref.current).toBe(getDial());
    expect(getDial()).toHaveClass("custom");
  });

  it("sweep 360 renderiza sem NaN", () => {
    const { container } = setup({ defaultValue: 100, sweep: 360 });
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("o texto central acompanha o teclado", async () => {
    setup({ defaultValue: 10 });
    getDial().focus();
    await act(async () => {
      fireEvent.keyDown(getDial(), { key: "End" });
    });
    expect(await screen.findByText("100")).toBeInTheDocument();
  });
});
