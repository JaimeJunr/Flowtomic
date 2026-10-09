import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GlidePicker, type GlidePickerProps } from "./glide-picker";
import { exitDuration, normalizeOption, pillTarget } from "./glide-picker-utils";

const OPTIONS = [
  { value: "png", label: "PNG", tag: "imagem" },
  { value: "svg", label: "SVG", tag: "vetor" },
  { value: "pdf", label: "PDF", tag: "documento" },
];

class FakeValueListener {
  calls: Array<[string, string]> = [];
  handle: NonNullable<GlidePickerProps["onValueChange"]> = (value, option) => {
    this.calls.push([value, String(option.label)]);
  };
}

function setup(props: Partial<GlidePickerProps> = {}) {
  const listener = new FakeValueListener();
  const view = render(
    <MotionConfig reducedMotion="always">
      <GlidePicker options={OPTIONS} onValueChange={listener.handle} {...props} />
    </MotionConfig>
  );
  const chip = view.container.querySelector('[data-slot="glide-picker"]') as HTMLButtonElement;
  return { ...view, chip, listener, user: userEvent.setup() };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("utils", () => {
  it("exitDuration é 2/3 da entrada", () => {
    expect(exitDuration(180)).toBe(120);
    expect(exitDuration(0)).toBe(0);
  });

  it("pillTarget prioriza destaque, depois lembrança, depois escolhida", () => {
    expect(pillTarget(2, 0, true, 1)).toBe(2);
    expect(pillTarget(null, 0, true, 1)).toBe(1);
    expect(pillTarget(null, 0, false, 1)).toBe(0);
    expect(pillTarget(null, null, true, null)).toBeNull();
  });

  it("normalizeOption converte string e rejeita valor inválido", () => {
    expect(normalizeOption("a")).toEqual({ value: "a", label: "a" });
    expect(() => normalizeOption({} as never)).toThrow(/received/);
  });
});

describe("GlidePicker", () => {
  it("mostra o placeholder sem valor", () => {
    const { chip } = setup();
    expect(chip).toHaveTextContent("Selecionar…");
    expect(chip).toHaveAttribute("aria-label", "Selecionar");
  });

  it("abre no clique, escolhe, fecha e mostra o rótulo", async () => {
    const { chip, user, listener } = setup();
    await user.click(chip);
    expect(await screen.findAllByRole("menuitemradio")).toHaveLength(3);
    await user.click(screen.getByRole("menuitemradio", { name: /SVG/ }));
    expect(listener.calls).toEqual([["svg", "SVG"]]);
    expect(chip).toHaveTextContent("SVG");
    expect(screen.queryByRole("menuitemradio")).not.toBeInTheDocument();
  });

  it("showTags=false esconde etiquetas", async () => {
    const { chip, user } = setup({ showTags: false });
    await user.click(chip);
    await screen.findAllByRole("menuitemradio");
    expect(screen.queryByText("imagem")).not.toBeInTheDocument();
  });

  it("mostra etiquetas por padrão e a pílula na escolhida", async () => {
    const { chip, user } = setup({ defaultValue: "pdf" });
    await user.click(chip);
    expect(await screen.findByText("documento")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="glide-picker-pill"]')).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /PDF/ })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("teclado: ArrowDown abre, move e Enter escolhe", async () => {
    const { chip, user, listener } = setup();
    chip.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findAllByRole("menuitemradio");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(listener.calls.length).toBe(1);
    expect(chip).not.toHaveTextContent("Selecionar…");
  });

  it("modo controlado respeita value", async () => {
    const { chip, user } = setup({ value: "png" });
    expect(chip).toHaveTextContent("PNG");
    await user.click(chip);
    await user.click(await screen.findByRole("menuitemradio", { name: /PDF/ }));
    expect(chip).toHaveTextContent("PNG");
  });

  it("aceita opções em string", () => {
    const { chip } = setup({ options: ["a", "b"], defaultValue: "b" });
    expect(chip).toHaveTextContent("b");
  });

  it("disabled não abre", async () => {
    const { chip, user } = setup({ disabled: true });
    await user.click(chip);
    expect(screen.queryByRole("menuitemradio")).not.toBeInTheDocument();
    expect(chip).toBeDisabled();
    expect(chip.className).toContain("opacity-50");
  });

  it("repassa ref e className, com glideMs 0", async () => {
    const ref = createRef<HTMLButtonElement>();
    const { chip, user } = setup({ ref, className: "extra", glideMs: 0, rememberPosition: false });
    expect(ref.current).toBe(chip);
    expect(chip.className).toContain("extra");
    await user.click(chip);
    expect(await screen.findAllByRole("menuitemradio")).toHaveLength(3);
  });
});
