import { render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ScrollExpandMedia, type ScrollExpandMediaProps } from "./scroll-expand-media";

const ROOT = '[data-slot="scroll-expand-media"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<ScrollExpandMediaProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <ScrollExpandMedia
        media={<div data-testid="media">Painel da carteira</div>}
        title="Veja a plataforma"
        scrollHint="Role para ver"
        {...props}
      >
        <p>Abrir conta institucional</p>
      </ScrollExpandMedia>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

describe("ScrollExpandMedia", () => {
  it("renderiza mídia, título como h2 e dica", () => {
    setup();
    expect(screen.getByTestId("media")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Veja a plataforma" })).toBeTruthy();
    expect(
      screen
        .getByText("Role para ver")
        .closest('[data-slot="scroll-expand-media-hint"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true");
  });

  it("calcula a altura da raiz com scrollDistance e holdDistance", () => {
    const { root } = setup({ scrollDistance: 2, holdDistance: 0.5 });
    expect(root.style.height).toBe("calc(350vh)");
  });

  it("usa os padrões 1,2 e 0,35 na altura", () => {
    const { root } = setup();
    expect(root.style.height).toBe("calc(255vh)");
  });

  it("começa com o conteúdo final aria-hidden e inert", () => {
    const { root } = setup();
    const content = root.querySelector('[data-slot="scroll-expand-media-content"]') as HTMLElement;
    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(content.hasAttribute("inert")).toBe(true);
  });

  it("em movimento reduzido: sem sticky, conteúdo visível e sem aria-hidden", () => {
    const { root } = setup({}, "always");
    expect(root.style.height).toBe("");
    expect(root.querySelector(".sticky")).toBeNull();
    const content = root.querySelector('[data-slot="scroll-expand-media-content"]') as HTMLElement;
    expect(content.hasAttribute("aria-hidden")).toBe(false);
    expect(content.hasAttribute("inert")).toBe(false);
    expect(screen.getByText("Abrir conta institucional")).toBeTruthy();
    expect(root.querySelector('[data-slot="scroll-expand-media-frame"]')?.className).toContain(
      "aspect-video"
    );
  });

  it("repassa ref, className e props nativas", () => {
    const ref = createRef<HTMLElement>();
    const { root } = setup({ ref, className: "minha-classe", "aria-label": "Hero" });
    expect(ref.current).toBe(root);
    expect(root.className).toContain("minha-classe");
    expect(root.getAttribute("aria-label")).toBe("Hero");
  });
});
