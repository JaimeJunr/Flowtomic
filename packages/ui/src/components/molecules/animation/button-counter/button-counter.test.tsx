import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ButtonCounter } from "./button-counter";

class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ButtonCounter", () => {
  it.each([
    0, 42,
  ])("sem controles, value=%i compõe prefixo/número/sufixo e encaminha só onClick", async (value) => {
    const onValueChange = vi.fn();
    const onClick = vi.fn();
    render(
      <ButtonCounter
        value={value}
        onValueChange={onValueChange}
        onClick={onClick}
        prefix="Total:"
        suffix="itens"
      />
    );
    const button = screen.getByRole("button", { name: `Total: ${value} itens` });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "+" })).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: button })],
    ]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, 4, 6],
    [2.5, 2.5, 7.5],
  ])("step=%s calcula decremento=%s e incremento=%s sem alterar value controlado", async (step, lower, upper) => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ButtonCounter value={5} onValueChange={onValueChange} step={step} showControls />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "-" }));
    expect(onValueChange.mock.calls).toEqual([[upper], [lower]]);
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    rerender(
      <ButtonCounter value={upper} onValueChange={onValueChange} step={step} showControls />
    );
    expect(screen.getByRole("button", { name: String(upper.toFixed(0)) })).toBeInTheDocument();
  });

  it.each([
    [0, "-", "+", undefined],
    [10, "+", "-", undefined],
    [0, "-", "+", false],
    [10, "+", "-", false],
  ] as const)("value=%i desabilita %s e mantém %s utilizável mesmo com disabled=%s", async (value, blocked, allowed, disabled) => {
    const onValueChange = vi.fn();
    render(
      <ButtonCounter
        value={value}
        onValueChange={onValueChange}
        min={0}
        max={10}
        disabled={disabled}
        showControls
      />
    );
    const blockedButton = screen.getByRole("button", { name: blocked });
    expect(blockedButton).toBeDisabled();
    expect(screen.getByRole("button", { name: allowed })).toBeEnabled();
    const user = userEvent.setup();
    await user.click(blockedButton);
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: allowed }));
    expect(onValueChange.mock.calls).toEqual([[value === 0 ? 1 : 9]]);
  });

  it.each([
    [4, 0, 5, "+", "-", 2],
    [6, 5, 10, "-", "+", 8],
  ] as const)("value=%i e step=2 bloqueiam ultrapassar [%i,%i] por %s, mas aceitam %s", async (value, min, max, blocked, allowed, expected) => {
    const onValueChange = vi.fn();
    render(
      <ButtonCounter
        value={value}
        onValueChange={onValueChange}
        step={2}
        min={min}
        max={max}
        showControls
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: blocked }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: allowed }));
    expect(onValueChange.mock.calls).toEqual([[expected]]);
  });

  it.each([
    ["+", 5],
    ["-", 1],
  ])("%s aceita atingir exatamente o limite %i", async (name, expected) => {
    const onValueChange = vi.fn();
    render(
      <ButtonCounter
        value={3}
        onValueChange={onValueChange}
        step={2}
        min={1}
        max={5}
        showControls
      />
    );
    await userEvent.click(screen.getByRole("button", { name }));
    expect(onValueChange.mock.calls).toEqual([[expected]]);
  });

  it.each([0, 5])("disabled bloqueia os três botões e o teclado em value=%i", async (value) => {
    const onValueChange = vi.fn();
    const onClick = vi.fn();
    render(
      <ButtonCounter
        value={value}
        onValueChange={onValueChange}
        onClick={onClick}
        min={0}
        max={10}
        disabled
        showControls
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
    for (const name of ["-", String(value), "+"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await userEvent.tab();
    expect(document.body).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    "{Enter}",
    " ",
  ])("Tab alcança os controles e %s envia números exatos nos dois sentidos", async (key) => {
    const onValueChange = vi.fn();
    render(<ButtonCounter value={4} onValueChange={onValueChange} showControls />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "-" })).toHaveFocus();
    await user.keyboard(key);
    await user.tab();
    expect(screen.getByRole("button", { name: "4" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "+" })).toHaveFocus();
    await user.keyboard(key);
    expect(onValueChange.mock.calls).toEqual([[3], [5]]);
  });

  it("onClick do consumidor não substitui os callbacks de incremento e decremento", async () => {
    const onValueChange = vi.fn();
    const onClick = vi.fn();
    render(
      <ButtonCounter value={5} onValueChange={onValueChange} onClick={onClick} showControls />
    );
    const buttons = ["+", "-", "5"].map((name) => screen.getByRole("button", { name }));
    for (const button of buttons) await userEvent.click(button);
    expect(onClick.mock.calls).toEqual(
      buttons.map((button) => [expect.objectContaining({ type: "click", target: button })])
    );
    expect(onValueChange.mock.calls).toEqual([[6], [4]]);
  });

  it.each([
    "+",
    "-",
  ])("preventDefault no onClick cancela a mudança pelo controle %s", async (name) => {
    const onValueChange = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
    render(
      <ButtonCounter value={5} onValueChange={onValueChange} onClick={onClick} showControls />
    );
    const button = screen.getByRole("button", { name });
    await userEvent.click(button);
    expect(onClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: button, defaultPrevented: true })],
    ]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("ButtonCounter: aparência do número e do contêiner", () => {
  it("com controles, hideNumberBackground tira fundo e borda só do botão do número", () => {
    render(<ButtonCounter value={7} onValueChange={vi.fn()} showControls hideNumberBackground />);
    const numero = screen.getByRole("button", { name: "7" });
    expect(numero).toHaveClass("bg-transparent", "border-none", "shadow-none");
    expect(screen.getByRole("button", { name: "+" })).not.toHaveClass("bg-transparent");
    expect(screen.getByRole("button", { name: "-" })).not.toHaveClass("bg-transparent");
  });

  it("sem hideNumberBackground o botão do número mantém o visual do botão", () => {
    render(<ButtonCounter value={7} onValueChange={vi.fn()} showControls />);
    expect(screen.getByRole("button", { name: "7" })).not.toHaveClass("bg-transparent");
  });

  it.each([
    false,
    true,
  ])("o número herda a cor do botão por padrão (showControls=%s)", (showControls) => {
    render(<ButtonCounter value={7} onValueChange={vi.fn()} showControls={showControls} />);
    const botao = screen.getByRole("button", { name: "7" });
    expect(botao.querySelector(".font-medium")).not.toBeNull();
    expect(botao.querySelector(".text-primary, .text-foreground, .text-success")).toBeNull();
  });

  it.each([
    false,
    true,
  ])("animatedNumberProps muda cor e classe do número (showControls=%s)", (showControls) => {
    render(
      <ButtonCounter
        value={7}
        onValueChange={vi.fn()}
        showControls={showControls}
        animatedNumberProps={{ color: "primary", className: "numero-extra" }}
      />
    );
    const numero = screen.getByRole("button", { name: "7" }).querySelector(".numero-extra");
    expect(numero).toHaveClass("font-medium");
    expect(numero?.closest(".text-primary")).not.toBeNull();
  });

  it("sem controles, className vai para o botão; com controles, para o contêiner", () => {
    const { rerender } = render(
      <ButtonCounter value={7} onValueChange={vi.fn()} className="classe-de-fora" />
    );
    expect(screen.getByRole("button", { name: "7" })).toHaveClass("classe-de-fora");

    rerender(
      <ButtonCounter value={7} onValueChange={vi.fn()} className="classe-de-fora" showControls />
    );
    expect(screen.getByRole("button", { name: "7" })).not.toHaveClass("classe-de-fora");
    expect(screen.getByRole("button", { name: "7" }).parentElement).toHaveClass("classe-de-fora");
  });

  it("prefixo e sufixo também aparecem no botão do número com controles", () => {
    render(
      <ButtonCounter value={7} onValueChange={vi.fn()} showControls prefix="R$" suffix="un" />
    );
    expect(screen.getByRole("button", { name: "R$ 7 un" })).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade com os controles", async () => {
    const { container } = render(<ButtonCounter value={7} onValueChange={vi.fn()} showControls />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
