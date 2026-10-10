import { fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GlareHover, type GlareHoverProps } from "./glare-hover";

const ROOT = '[data-slot="glare-hover"]';
const GLARE = '[data-slot="glare-hover-glare"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: GlareHoverProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <GlareHover {...props}>
        <button type="button">Assinar plano</button>
      </GlareHover>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const glare = view.container.querySelector(GLARE) as HTMLElement;
  return { ...view, root, glare };
}

describe("GlareHover", () => {
  it("expõe ref, className, data-slot e props nativas na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "plano", title: "Plano Pro" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "bg-card", "overflow-hidden", "rounded-lg");
    expect(root).toHaveAttribute("id", "plano");
    expect(root).toHaveAttribute("title", "Plano Pro");
  });

  it("a camada de reflexo é decorativa e não captura ponteiro", () => {
    const { glare } = setup();
    expect(glare).toHaveAttribute("aria-hidden", "true");
    expect(glare).toHaveClass("pointer-events-none");
  });

  it("usa o gradiente com ângulo, cor e tamanho informados", () => {
    const { glare } = setup({ glareAngle: -30, glareColor: "var(--primary)", glareSize: 300 });
    expect(glare.style.backgroundImage).toContain("-30deg");
    expect(glare.style.backgroundImage).toContain("var(--primary)");
    expect(glare.style.backgroundSize).toBe("300% 300%");
  });

  it("pointerenter ativa e pointerleave volta ao repouso", () => {
    const { root, glare } = setup({ duration: 400 });
    expect(root).toHaveAttribute("data-glare", "idle");
    expect(glare.style.backgroundPosition).toBe("-100% -100%");
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-glare", "active");
    expect(glare.style.backgroundPosition).toBe("100% 100%");
    expect(glare.style.transition).toContain("background-position 400ms");
    fireEvent.pointerLeave(root);
    expect(root).toHaveAttribute("data-glare", "idle");
    expect(glare.style.backgroundPosition).toBe("-100% -100%");
    expect(glare.style.transition).toContain("background-position 400ms");
  });

  it("playOnce: na saída a transição fica none, na entrada anima", () => {
    const { root, glare } = setup({ playOnce: true });
    fireEvent.pointerEnter(root);
    expect(glare.style.transition).toContain("background-position");
    fireEvent.pointerLeave(root);
    expect(glare.style.transition).toBe("none");
  });

  it("foco num filho ativa e o blur para fora desativa", () => {
    const { root, getByRole } = setup();
    fireEvent.focus(getByRole("button"));
    expect(root).toHaveAttribute("data-glare", "active");
    fireEvent.blur(getByRole("button"));
    expect(root).toHaveAttribute("data-glare", "idle");
  });

  it("foco continua ativo se o ponteiro sai", () => {
    const { root, getByRole } = setup();
    fireEvent.pointerEnter(root);
    fireEvent.focus(getByRole("button"));
    fireEvent.pointerLeave(root);
    expect(root).toHaveAttribute("data-glare", "active");
  });

  it("repassa os handlers do usuário", () => {
    const calls: string[] = [];
    const { root, getByRole } = setup({
      onPointerEnter: () => calls.push("enter"),
      onPointerLeave: () => calls.push("leave"),
      onFocus: () => calls.push("focus"),
      onBlur: () => calls.push("blur"),
    });
    fireEvent.pointerEnter(root);
    fireEvent.pointerLeave(root);
    fireEvent.focus(getByRole("button"));
    fireEvent.blur(getByRole("button"));
    expect(calls).toEqual(["enter", "leave", "focus", "blur"]);
  });

  it("movimento reduzido: sem transição e reflexo estático com metade da opacidade", () => {
    const { root, glare } = setup({ glareOpacity: 0.6 }, "always");
    expect(glare.style.transition).toBe("none");
    expect(glare.style.opacity).toBe("0");
    fireEvent.pointerEnter(root);
    expect(glare.style.transition).toBe("none");
    expect(glare.style.opacity).toBe("1");
    expect(glare.style.backgroundImage).toContain("30%");
  });
});
