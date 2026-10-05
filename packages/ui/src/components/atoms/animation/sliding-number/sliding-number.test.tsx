import { render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { groupThousands, SlidingNumber } from "./sliding-number";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("SlidingNumber", () => {
  it("anuncia o número completo para leitores de tela", () => {
    render(<SlidingNumber number={1234} />);
    expect(screen.getByText("1234")).toHaveClass("sr-only");
  });

  it("desenha um rolo de dígitos para cada casa do número", () => {
    const { container } = render(<SlidingNumber number={305} />);
    expect(container.querySelectorAll('[data-slot="sliding-number-roller"]')).toHaveLength(3);
  });

  it("mostra o sinal de menos em número negativo", () => {
    const { container } = render(<SlidingNumber number={-8} />);
    expect(screen.getByText("-8")).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("-");
  });

  it("completa com zero à esquerda quando padStart está ligado", () => {
    render(<SlidingNumber number={7} padStart />);
    expect(screen.getByText("07")).toBeInTheDocument();
  });

  it("não completa com zero sem padStart", () => {
    const { container } = render(<SlidingNumber number={7} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^7$/);
  });

  it("formata casas decimais com o separador escolhido", () => {
    const { container } = render(
      <SlidingNumber number={3.5} decimalPlaces={2} decimalSeparator="," />
    );
    expect(screen.getByText("3,50")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="sliding-number-roller"]')).toHaveLength(3);
  });

  it("não desenha rolos de decimais quando decimalPlaces é 0", () => {
    const { container } = render(<SlidingNumber number={3.9} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^4$/);
    expect(container.querySelectorAll('[data-slot="sliding-number-roller"]')).toHaveLength(1);
  });

  it("com inView, mostra zero até o elemento aparecer na tela", () => {
    const { container } = render(<SlidingNumber number={99} inView />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^0$/);
    expect(screen.queryByText("99")).not.toBeInTheDocument();
  });

  it("com movimento reduzido mostra só o texto, sem rolos animados", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <SlidingNumber number={42} />
      </MotionConfig>
    );
    expect(screen.getByText("42")).not.toHaveClass("sr-only");
    expect(container.querySelector('[data-slot="sliding-number-roller"]')).toBeNull();
  });

  it("expõe o elemento pelo ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<SlidingNumber number={1} ref={ref} className="text-lg" />);
    expect(ref.current).toHaveAttribute("data-slot", "sliding-number");
    expect(ref.current).toHaveClass("text-lg");
  });
});

describe("groupThousands", () => {
  it("agrupa de 3 em 3 da direita para a esquerda", () => {
    expect(groupThousands("1234567", ".")).toBe("1.234.567");
    expect(groupThousands("12345", " ")).toBe("12 345");
  });

  it("não agrupa até 3 dígitos nem sem separador", () => {
    expect(groupThousands("999", ".")).toBe("999");
    expect(groupThousands("1234567", "")).toBe("1234567");
  });

  it("agrupa também com zero à esquerda do padStart", () => {
    expect(groupThousands("01234", ".")).toBe("01.234");
  });
});

describe("SlidingNumber thousandsSeparator", () => {
  it("1234567 com separador anuncia 1.234.567 e mantém 7 rolos", () => {
    const { container } = render(<SlidingNumber number={1234567} thousandsSeparator="." />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^1\.234\.567$/);
    expect(container.querySelectorAll('[data-slot="sliding-number-roller"]')).toHaveLength(7);
  });

  it("o separador é estático: aparece 2 vezes fora dos rolos", () => {
    const { container } = render(<SlidingNumber number={1234567} thousandsSeparator="." />);
    const separators = container.querySelectorAll('[data-slot="sliding-number-separator"]');
    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveTextContent(".");
    expect(separators[0]?.closest('[data-slot="sliding-number-roller"]')).toBeNull();
  });

  it("negativo com decimais usa os dois separadores", () => {
    render(
      <SlidingNumber
        number={-1234.5}
        decimalPlaces={1}
        thousandsSeparator="."
        decimalSeparator=","
      />
    );
    expect(screen.getByText("-1.234,5")).toBeInTheDocument();
  });

  it("999 não leva separador", () => {
    const { container } = render(<SlidingNumber number={999} thousandsSeparator="." />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^999$/);
    expect(container.querySelectorAll('[data-slot="sliding-number-separator"]')).toHaveLength(0);
  });

  it("com movimento reduzido o texto simples sai agrupado", () => {
    render(
      <MotionConfig reducedMotion="always">
        <SlidingNumber number={1234567} thousandsSeparator="." />
      </MotionConfig>
    );
    expect(screen.getByText("1.234.567")).not.toHaveClass("sr-only");
  });

  it("sem a prop a saída é igual à de antes", () => {
    const { container } = render(<SlidingNumber number={1234567} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent(/^1234567$/);
    expect(container.querySelectorAll('[data-slot="sliding-number-separator"]')).toHaveLength(0);
  });
});
