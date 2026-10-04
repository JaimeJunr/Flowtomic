import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

const OUTUBRO = new Date(2026, 9, 3);

function Escolha({ onSelecionar }: { onSelecionar?: (d: Date | undefined) => void }) {
  const [dia, setDia] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      defaultMonth={OUTUBRO}
      selected={dia}
      onSelect={(d) => {
        setDia(d);
        onSelecionar?.(d);
      }}
    />
  );
}

function diaButton(texto: RegExp | string): HTMLElement {
  return screen.getByRole("button", { name: texto });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Calendar", () => {
  it("mostra o mês pedido com seus dias", () => {
    render(<Calendar mode="single" defaultMonth={OUTUBRO} />);
    expect(screen.getByRole("grid", { name: /October 2026/ })).toBeInTheDocument();
    expect(diaButton(/October 15th, 2026/)).toBeInTheDocument();
  });

  it("os botões de navegação trocam de mês", async () => {
    render(<Calendar defaultMonth={OUTUBRO} />);
    await userEvent.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByRole("grid", { name: /November 2026/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /previous month/i }));
    await userEvent.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByRole("grid", { name: /September 2026/ })).toBeInTheDocument();
  });

  it("avisa o mês novo ao navegar", async () => {
    const onMonthChange = vi.fn();
    render(<Calendar defaultMonth={OUTUBRO} onMonthChange={onMonthChange} />);
    await userEvent.click(screen.getByRole("button", { name: /next month/i }));
    const novo = onMonthChange.mock.calls[0]?.[0] as Date;
    expect(novo.getMonth()).toBe(10);
    expect(novo.getFullYear()).toBe(2026);
  });

  it("clicar num dia o seleciona e entrega a data", async () => {
    const onSelecionar = vi.fn();
    render(<Escolha onSelecionar={onSelecionar} />);
    const dia = diaButton(/October 15th, 2026/);
    await userEvent.click(dia);
    const escolhida = onSelecionar.mock.calls[0]?.[0] as Date;
    expect([escolhida.getFullYear(), escolhida.getMonth(), escolhida.getDate()]).toEqual([
      2026, 9, 15,
    ]);
    expect(diaButton(/October 15th, 2026/)).toHaveAttribute("data-selected-single", "true");
  });

  it("clicar noutro dia move a seleção", async () => {
    render(<Escolha />);
    await userEvent.click(diaButton(/October 15th, 2026/));
    await userEvent.click(diaButton(/October 20th, 2026/));
    expect(diaButton(/October 20th, 2026/)).toHaveAttribute("data-selected-single", "true");
    expect(diaButton(/October 15th, 2026/)).not.toHaveAttribute("data-selected-single", "true");
  });

  it("setas do teclado movem o foco entre dias e Enter seleciona", async () => {
    const onSelecionar = vi.fn();
    render(<Escolha onSelecionar={onSelecionar} />);
    diaButton(/October 15th, 2026/).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(diaButton(/October 16th, 2026/)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(diaButton(/October 23rd, 2026/)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect((onSelecionar.mock.calls[0]?.[0] as Date).getDate()).toBe(23);
  });

  it("dia desabilitado não pode ser escolhido", async () => {
    const onSelecionar = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={OUTUBRO}
        disabled={{ before: new Date(2026, 9, 10) }}
        onSelect={onSelecionar}
      />
    );
    expect(diaButton(/October 5th, 2026/)).toBeDisabled();
    await userEvent.click(diaButton(/October 5th, 2026/));
    expect(onSelecionar).not.toHaveBeenCalled();
  });

  it("destaca o dia de hoje", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(OUTUBRO);
    render(<Calendar mode="single" />);
    const hoje = diaButton(/Today, Saturday, October 3rd, 2026|October 3rd, 2026/);
    expect(hoje.closest("td")).toHaveClass("bg-accent");
  });

  it("mostra dias de fora do mês por padrão e os esconde com showOutsideDays=false", () => {
    const { rerender } = render(<Calendar mode="single" defaultMonth={OUTUBRO} />);
    // 1º de outubro/2026 é quinta: a grade começa com dias de setembro
    expect(screen.getByRole("button", { name: /September 28th, 2026/ })).toBeInTheDocument();
    rerender(<Calendar mode="single" defaultMonth={OUTUBRO} showOutsideDays={false} />);
    expect(screen.queryByRole("button", { name: /September 28th, 2026/ })).not.toBeInTheDocument();
  });

  it("modo intervalo marca início, meio e fim", async () => {
    function Intervalo() {
      const [r, setR] = useState<{ from?: Date; to?: Date } | undefined>();
      return (
        <Calendar
          mode="range"
          defaultMonth={OUTUBRO}
          selected={r as never}
          onSelect={(v) => setR(v as never)}
        />
      );
    }
    render(<Intervalo />);
    await userEvent.click(diaButton(/October 12th, 2026/));
    await userEvent.click(diaButton(/October 14th, 2026/));
    expect(diaButton(/October 12th, 2026/)).toHaveAttribute("data-range-start", "true");
    expect(diaButton(/October 13th, 2026/)).toHaveAttribute("data-range-middle", "true");
    expect(diaButton(/October 14th, 2026/)).toHaveAttribute("data-range-end", "true");
  });

  it("com legenda em dropdown oferece seletores de mês e ano limitados", async () => {
    render(
      <Calendar defaultMonth={OUTUBRO} captionLayout="dropdown" fromYear={2020} toYear={2030} />
    );
    const ano = screen.getByRole("combobox", { name: /year/i });
    expect(within(ano).getAllByRole("option")).toHaveLength(11);
    await userEvent.selectOptions(ano, "2028");
    expect(screen.getByRole("grid", { name: /October 2028/ })).toBeInTheDocument();
  });

  it("legenda 'buttons' mantém a navegação por botões, sem dropdown", () => {
    render(<Calendar defaultMonth={OUTUBRO} captionLayout="buttons" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Escolha />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
