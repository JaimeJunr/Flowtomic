import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProfileCard, type ProfileCardProps } from "./profile-card";

const ROOT = '[data-slot="profile-card"]';
const INNER = '[data-slot="profile-card-inner"]';

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});

function setup(props: Partial<ProfileCardProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <ProfileCard
        avatar={<div>avatar</div>}
        name="Marina Albuquerque"
        title="Gestora de relacionamento"
        handle="marina.albuquerque"
        status="Disponível"
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const inner = view.container.querySelector(INNER) as HTMLElement;
  inner.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 200, bottom: 300, width: 200, height: 300, x: 0, y: 0 }) as DOMRect;
  return { ...view, root, inner };
}

describe("ProfileCard", () => {
  it("renderiza nome, cargo, handle e status", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Marina Albuquerque" })).toBeTruthy();
    expect(screen.getByText("Gestora de relacionamento")).toBeTruthy();
    expect(screen.getByText("@marina.albuquerque")).toBeTruthy();
    expect(screen.getByText("Disponível")).toBeTruthy();
    expect(screen.getByRole("article", { name: "Perfil de Marina Albuquerque" })).toBeTruthy();
  });

  it("showInfo=false esconde a barra", () => {
    const { container } = setup({ showInfo: false });
    expect(container.querySelector('[data-slot="profile-card-info"]')).toBeNull();
  });

  it("botão chama onContact e tem aria-label", () => {
    const onContact = vi.fn();
    setup({ onContact });
    const button = screen.getByRole("button", { name: "Falar com Marina Albuquerque" });
    fireEvent.click(button);
    expect(onContact).toHaveBeenCalledTimes(1);
  });

  it("usa contactLabel no aria-label", () => {
    setup({ contactLabel: "Agendar" });
    expect(screen.getByRole("button", { name: "Agendar com Marina Albuquerque" })).toBeTruthy();
  });

  it("pointerenter de mouse ativa e pointerleave desativa", () => {
    const { root } = setup();
    expect(root.getAttribute("data-active")).toBe("false");
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    expect(root.getAttribute("data-active")).toBe("true");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    expect(root.getAttribute("data-active")).toBe("false");
  });

  it("toque não ativa", () => {
    const { root } = setup();
    fireEvent.pointerEnter(root, { pointerType: "touch" });
    expect(root.getAttribute("data-active")).toBe("false");
  });

  it("move escreve as variáveis de inclinação", async () => {
    const { root } = setup({ maxTilt: 10 });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    act(() => {
      fireEvent.pointerMove(root, { pointerType: "mouse", clientX: 200, clientY: 0 });
    });
    await waitFor(() => expect(root.style.getPropertyValue("--ry")).toBe("10deg"));
    expect(root.style.getPropertyValue("--rx")).toBe("10deg");
    expect(root.style.getPropertyValue("--px")).toBe("100%");
  });

  it("pointerleave devolve as variáveis ao repouso", async () => {
    const { root } = setup();
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    fireEvent.pointerMove(root, { pointerType: "mouse", clientX: 200, clientY: 0 });
    await waitFor(() => expect(root.style.getPropertyValue("--ry")).not.toBe(""));
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    await waitFor(() => expect(root.style.getPropertyValue("--px")).toBe("50%"));
    expect(Number.parseFloat(root.style.getPropertyValue("--ry"))).toBeCloseTo(0);
  });

  it("glow=false não renderiza o halo", () => {
    const { container } = setup({ glow: false });
    expect(container.querySelector('[data-slot="profile-card-glow"]')).toBeNull();
  });

  it("tilt=false não escreve rotação", async () => {
    const { root } = setup({ tilt: false });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    fireEvent.pointerMove(root, { pointerType: "mouse", clientX: 200, clientY: 0 });
    await waitFor(() => expect(root.style.getPropertyValue("--px")).toBe("100%"));
    expect(root.style.getPropertyValue("--rx")).toBe("");
    expect(root.style.getPropertyValue("--ry")).toBe("");
  });

  it("movimento reduzido não ativa", () => {
    const { root } = setup({}, "always");
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    expect(root.getAttribute("data-active")).toBe("false");
  });

  it("repassa ref, className e handlers do usuário", () => {
    const ref = createRef<HTMLElement>();
    const onPointerEnter = vi.fn();
    const { root } = setup({ ref, className: "extra", onPointerEnter });
    expect(ref.current).toBe(root);
    expect(root.className).toContain("extra");
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    expect(onPointerEnter).toHaveBeenCalled();
  });
});
