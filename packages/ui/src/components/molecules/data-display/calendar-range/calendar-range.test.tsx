import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { format } from "date-fns";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalendarRange } from "./calendar-range";

/**
 * Data de referência: quarta-feira, 12/03/2025 ao meio-dia. Fixada para que os
 * intervalos rápidos (Hoje, Últimos 7 dias, Mês anterior) tenham resultado
 * determinístico, independente de quando a suíte roda.
 */
const HOJE = new Date(2025, 2, 12, 12, 0, 0);

const intervaloDeMarco: DateRange = {
  from: new Date(2025, 2, 3),
  to: new Date(2025, 2, 7),
};

function setup() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

function iso(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

async function abrirCalendario(user: ReturnType<typeof setup>, nomeDoGatilho: RegExp) {
  await user.click(screen.getByRole("button", { name: nomeDoGatilho }));
}

describe("CalendarRange", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(HOJE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Exibição do gatilho", () => {
    it("exibe o placeholder padrão quando não há intervalo", () => {
      render(<CalendarRange value={null} onChange={vi.fn()} />);
      expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
    });

    it("exibe o placeholder customizado", () => {
      render(<CalendarRange value={null} onChange={vi.fn()} placeholder="Período" />);
      expect(screen.getByText("Período")).toBeInTheDocument();
    });

    it("exibe apenas a data inicial quando o intervalo está incompleto", () => {
      render(<CalendarRange value={{ from: new Date(2025, 2, 3) }} onChange={vi.fn()} />);
      expect(screen.getByRole("button", { name: /03\/03\/2025/ })).toBeInTheDocument();
      expect(screen.queryByText(/ - /)).not.toBeInTheDocument();
    });

    it("exibe as duas pontas do intervalo completo", () => {
      render(<CalendarRange value={intervaloDeMarco} onChange={vi.fn()} />);
      const gatilho = screen.getByRole("button", { name: /03\/03\/2025.*07\/03\/2025/ });
      expect(gatilho).toBeInTheDocument();
    });

    it("desabilita o gatilho quando disabled é booleano", () => {
      render(<CalendarRange value={null} onChange={vi.fn()} disabled />);
      expect(screen.getByRole("button", { name: /selecione uma data/i })).toBeDisabled();
    });
  });

  describe("Limpar seleção", () => {
    it("chama onChange com null ao limpar", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(<CalendarRange value={intervaloDeMarco} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "Limpar seleção" }));

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("não oferece a ação de limpar quando não há intervalo", () => {
      render(<CalendarRange value={null} onChange={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "Limpar seleção" })).not.toBeInTheDocument();
    });

    it("não oferece a ação de limpar com o gatilho desabilitado", () => {
      render(<CalendarRange value={intervaloDeMarco} onChange={vi.fn()} disabled />);
      expect(screen.queryByRole("button", { name: "Limpar seleção" })).not.toBeInTheDocument();
    });
  });

  describe("Calendários", () => {
    it("abre dois meses lado a lado, começando pelo mês da data inicial", async () => {
      const user = setup();
      render(<CalendarRange value={intervaloDeMarco} onChange={vi.fn()} />);

      await abrirCalendario(user, /03\/03\/2025/);

      const grids = screen.getAllByRole("grid");
      expect(grids).toHaveLength(2);
      expect(
        within(grids[0]).getByRole("button", { name: /segunda-feira, 3 de março de 2025/ })
      ).toBeVisible();
      expect(
        within(grids[1]).getByRole("button", { name: /quinta-feira, 3 de abril de 2025/ })
      ).toBeVisible();
    });

    it("propaga o intervalo escolhido no calendário", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(<CalendarRange value={null} onChange={onChange} />);

      await abrirCalendario(user, /selecione uma data/i);
      const grids = screen.getAllByRole("grid");
      await user.click(
        within(grids[0]).getByRole("button", { name: /quinta-feira, 6 de março de 2025/ })
      );

      expect(onChange).toHaveBeenCalledTimes(1);
      const range = onChange.mock.calls[0][0] as DateRange;
      expect(iso(range.from)).toBe("2025-03-06");
    });

    it("bloqueia as datas recusadas pelo matcher disabled", async () => {
      const user = setup();
      render(
        <CalendarRange
          value={null}
          onChange={vi.fn()}
          disabled={{ from: new Date(2025, 2, 5), to: new Date(2025, 2, 7) }}
        />
      );

      await abrirCalendario(user, /selecione uma data/i);
      const grid = screen.getAllByRole("grid")[0];

      expect(
        within(grid).getByRole("button", { name: /quinta-feira, 6 de março de 2025/ })
      ).toBeDisabled();
      expect(
        within(grid).getByRole("button", { name: /segunda-feira, 10 de março de 2025/ })
      ).toBeEnabled();
    });

    it("consulta disabledDateTooltip para os dias renderizados", async () => {
      const user = setup();
      const disabledDateTooltip = vi.fn(() => undefined);
      render(
        <CalendarRange value={null} onChange={vi.fn()} disabledDateTooltip={disabledDateTooltip} />
      );

      await abrirCalendario(user, /selecione uma data/i);

      const datasConsultadas = disabledDateTooltip.mock.calls.map(([date]) => iso(date as Date));
      expect(datasConsultadas).toContain("2025-03-12");
    });
  });

  describe("Intervalos rápidos", () => {
    it("não exibe os atalhos por padrão", async () => {
      const user = setup();
      render(<CalendarRange value={null} onChange={vi.fn()} />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
    });

    it("exibe os atalhos com showQuickRanges", async () => {
      const user = setup();
      render(<CalendarRange value={null} onChange={vi.fn()} showQuickRanges />);

      await abrirCalendario(user, /selecione uma data/i);

      for (const label of ["Hoje", "Esta Semana", "Últimos 7 dias", "Mês anterior", "Este ano"]) {
        expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
      }
    });

    it("aplica 'Hoje' como intervalo de um único dia", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(<CalendarRange value={null} onChange={onChange} showQuickRanges />);

      await abrirCalendario(user, /selecione uma data/i);
      await user.click(screen.getByRole("button", { name: "Hoje" }));

      const range = onChange.mock.calls[0][0] as DateRange;
      expect(iso(range.from)).toBe("2025-03-12");
      expect(iso(range.to)).toBe("2025-03-12");
    });

    it("aplica 'Últimos 7 dias' contando o dia corrente", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(<CalendarRange value={null} onChange={onChange} showQuickRanges />);

      await abrirCalendario(user, /selecione uma data/i);
      await user.click(screen.getByRole("button", { name: "Últimos 7 dias" }));

      const range = onChange.mock.calls[0][0] as DateRange;
      expect(iso(range.from)).toBe("2025-03-06");
      expect(iso(range.to)).toBe("2025-03-12");
    });

    it("aplica 'Mês anterior' do primeiro ao último dia", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(<CalendarRange value={null} onChange={onChange} showQuickRanges />);

      await abrirCalendario(user, /selecione uma data/i);
      await user.click(screen.getByRole("button", { name: "Mês anterior" }));

      const range = onChange.mock.calls[0][0] as DateRange;
      expect(iso(range.from)).toBe("2025-02-01");
      expect(iso(range.to)).toBe("2025-02-28");
    });

    it("desabilita o atalho cujo intervalo cai em datas bloqueadas", async () => {
      const user = setup();
      const onChange = vi.fn();
      render(
        <CalendarRange
          value={null}
          onChange={onChange}
          showQuickRanges
          disabled={{ from: new Date(2025, 2, 12), to: new Date(2025, 2, 12) }}
        />
      );

      await abrirCalendario(user, /selecione uma data/i);

      const hoje = screen.getByRole("button", { name: "Hoje" });
      expect(hoje).toBeDisabled();
      expect(screen.getByRole("button", { name: "Mês anterior" })).toBeEnabled();
    });
  });
});

function ComEstado({
  inicial = null,
  ...props
}: {
  inicial?: DateRange | null;
  showQuickRanges?: boolean;
}) {
  const [valor, setValor] = React.useState<DateRange | null | undefined>(inicial);
  return <CalendarRange value={valor} onChange={setValor} {...props} />;
}

describe("CalendarRange: teclado, meses e dicas", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(HOJE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(["{Enter}", " "])("limpar a seleção funciona pelo teclado (%s)", async (tecla) => {
    const user = setup();
    const onChange = vi.fn();
    render(<CalendarRange value={intervaloDeMarco} onChange={onChange} />);

    screen.getByRole("button", { name: "Limpar seleção" }).focus();
    await user.keyboard(tecla);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("outras teclas no botão de limpar não limpam a seleção", async () => {
    const user = setup();
    const onChange = vi.fn();
    render(<CalendarRange value={intervaloDeMarco} onChange={onChange} />);

    screen.getByRole("button", { name: "Limpar seleção" }).focus();
    await user.keyboard("a");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("limpar com o mouse não abre o calendário", async () => {
    const user = setup();
    render(<CalendarRange value={intervaloDeMarco} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("sem valor, abre no mês de defaultMonth e no seguinte", async () => {
    const user = setup();
    render(<CalendarRange value={null} onChange={vi.fn()} defaultMonth={new Date(2025, 0, 15)} />);

    await abrirCalendario(user, /selecione uma data/i);

    const grids = screen.getAllByRole("grid");
    expect(
      within(grids[0]).getByRole("button", { name: /quarta-feira, 1 de janeiro de 2025/ })
    ).toBeVisible();
    expect(
      within(grids[1]).getByRole("button", { name: /sábado, 1 de fevereiro de 2025/ })
    ).toBeVisible();
  });

  it("com só a data inicial, o segundo calendário mostra o mês seguinte", async () => {
    const user = setup();
    render(<CalendarRange value={{ from: new Date(2025, 2, 3) }} onChange={vi.fn()} />);

    await abrirCalendario(user, /03\/03\/2025/);

    const grids = screen.getAllByRole("grid");
    expect(
      within(grids[1]).getByRole("button", { name: /terça-feira, 1 de abril de 2025/ })
    ).toBeVisible();
  });

  it("aplicar um atalho leva os calendários ao mês do intervalo escolhido", async () => {
    const user = setup();
    render(<ComEstado showQuickRanges />);

    await abrirCalendario(user, /selecione uma data/i);
    await user.click(screen.getByRole("button", { name: "Mês anterior" }));

    const grids = screen.getAllByRole("grid");
    expect(
      within(grids[0]).getByRole("button", { name: /sábado, 1 de fevereiro de 2025/ })
    ).toBeVisible();
    expect(
      within(grids[1]).getByRole("button", { name: /sábado, 1 de março de 2025/ })
    ).toBeVisible();
  });

  it("com disabled booleano e o gatilho liberado por buttonProps, todos os atalhos ficam bloqueados", async () => {
    const user = setup();
    render(
      <CalendarRange
        value={null}
        onChange={vi.fn()}
        showQuickRanges
        disabled
        buttonProps={{ disabled: false }}
      />
    );

    await abrirCalendario(user, /selecione uma data/i);

    expect(screen.getByRole("button", { name: "Hoje" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Este ano" })).toBeDisabled();
  });

  it("matchers em lista também bloqueiam atalhos que atravessam a data recusada", async () => {
    const user = setup();
    render(
      <CalendarRange
        value={null}
        onChange={vi.fn()}
        showQuickRanges
        disabled={[new Date(2025, 2, 10), { dayOfWeek: [0] }]}
      />
    );

    await abrirCalendario(user, /selecione uma data/i);

    expect(screen.getByRole("button", { name: "Últimos 7 dias" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hoje" })).toBeEnabled();
  });

  it("mostra a dica de uma data recusada ao passar o mouse nela", async () => {
    const user = setup();
    render(
      <CalendarRange
        value={null}
        onChange={vi.fn()}
        disabled={{ from: new Date(2025, 2, 5), to: new Date(2025, 2, 7) }}
        disabledDateTooltip={(date) =>
          date.getDate() === 6 && date.getMonth() === 2 ? "Feriado da empresa" : undefined
        }
      />
    );

    await abrirCalendario(user, /selecione uma data/i);
    const dia = within(screen.getAllByRole("grid")[0]).getByRole("button", {
      name: /quinta-feira, 6 de março de 2025/,
    });
    await user.hover(dia.parentElement as HTMLElement);

    await waitFor(() =>
      expect(screen.getAllByText("Feriado da empresa").length).toBeGreaterThan(0)
    );
  });

  it("o gatilho fechado, sem seleção, não tem violações de acessibilidade", async () => {
    const { container } = render(<CalendarRange value={null} onChange={vi.fn()} />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });

  // BUG (calendar-range.tsx:205-224): com intervalo selecionado, o "Limpar seleção" é um
  // <div role="button"> dentro do <button> do gatilho; o axe reprova com "nested-interactive"
  // (leitores de tela podem não alcançar o botão interno).
  it.todo(
    "com intervalo selecionado o gatilho não tem violações de acessibilidade (nested-interactive)"
  );
});
