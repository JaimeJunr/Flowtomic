import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalendarPopover, normalizeDate } from "./calendar-popover";

/**
 * Data de referência: quarta-feira, 12/03/2025 ao meio-dia.
 * Escolhida para que o mês visível tenha, no passado, dias úteis (06/03) e
 * de fim de semana (08/03), e no futuro dias úteis (13/03) — cobrindo
 * disableFuture e disableWeekends sem depender da data real da execução.
 */
const HOJE = new Date(2025, 2, 12, 12, 0, 0);

const QUINTA_PASSADA = /quinta-feira, 6 de março de 2025/;
const SABADO_PASSADO = /sábado, 8 de março de 2025/;
const QUINTA_FUTURA = /quinta-feira, 13 de março de 2025/;

function setup() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

async function abrirCalendario(user: ReturnType<typeof setup>, nomeDoGatilho: RegExp) {
  await user.click(screen.getByRole("button", { name: nomeDoGatilho }));
}

describe("normalizeDate", () => {
  it("formata a data em yyyy-MM-dd", () => {
    expect(normalizeDate(new Date(2025, 2, 12))).toBe("2025-03-12");
  });

  it("preenche mês e dia com zero à esquerda", () => {
    expect(normalizeDate(new Date(2025, 0, 5))).toBe("2025-01-05");
  });
});

describe("CalendarPopover", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(HOJE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Exibição do gatilho", () => {
    it("exibe o placeholder padrão quando não há data", () => {
      render(<CalendarPopover date={null} setDate={vi.fn()} />);
      expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
    });

    it("exibe o placeholder customizado", () => {
      render(<CalendarPopover date={undefined} setDate={vi.fn()} placeholder="Data base" />);
      expect(screen.getByText("Data base")).toBeInTheDocument();
    });

    it("formata a data selecionada em pt-BR", () => {
      render(<CalendarPopover date={new Date(2025, 2, 6)} setDate={vi.fn()} />);
      expect(screen.getByText("06/03/2025")).toBeInTheDocument();
    });

    it("aceita data como string parseável", () => {
      render(<CalendarPopover date="2025-03-06T00:00:00" setDate={vi.fn()} />);
      expect(screen.getByText("06/03/2025")).toBeInTheDocument();
    });

    it("cai no placeholder quando a string é inválida", () => {
      render(<CalendarPopover date="data-invalida" setDate={vi.fn()} />);
      expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
    });

    it("exibe estado de carregamento no lugar da data", () => {
      render(<CalendarPopover date={new Date(2025, 2, 6)} setDate={vi.fn()} isLoading />);
      expect(screen.getByText("carregando...")).toBeInTheDocument();
      expect(screen.queryByText("06/03/2025")).not.toBeInTheDocument();
    });

    it("desabilita o gatilho quando disabled é booleano", () => {
      render(<CalendarPopover date={null} setDate={vi.fn()} disabled />);
      expect(screen.getByRole("button", { name: /selecione uma data/i })).toBeDisabled();
    });
  });

  describe("Limpar data", () => {
    it("chama setDate com null ao limpar", async () => {
      const user = setup();
      const setDate = vi.fn();
      render(<CalendarPopover date={new Date(2025, 2, 6)} setDate={setDate} />);

      await user.click(screen.getByRole("button", { name: "Limpar data" }));

      expect(setDate).toHaveBeenCalledWith(null);
    });

    it("não oferece a ação de limpar quando não há data", () => {
      render(<CalendarPopover date={null} setDate={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "Limpar data" })).not.toBeInTheDocument();
    });

    it("não oferece a ação de limpar durante o carregamento", () => {
      render(<CalendarPopover date={new Date(2025, 2, 6)} setDate={vi.fn()} isLoading />);
      expect(screen.queryByRole("button", { name: "Limpar data" })).not.toBeInTheDocument();
    });
  });

  describe("Seleção no calendário", () => {
    it("propaga a data escolhida e fecha o popover", async () => {
      const user = setup();
      const setDate = vi.fn();
      render(<CalendarPopover date={null} setDate={setDate} />);

      await abrirCalendario(user, /selecione uma data/i);
      await user.click(screen.getByRole("button", { name: QUINTA_PASSADA }));

      expect(setDate).toHaveBeenCalledTimes(1);
      expect(normalizeDate(setDate.mock.calls[0][0] as Date)).toBe("2025-03-06");
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });
  });

  describe("Datas bloqueadas", () => {
    it("bloqueia fim de semana por padrão", async () => {
      const user = setup();
      render(<CalendarPopover date={null} setDate={vi.fn()} />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: SABADO_PASSADO })).toBeDisabled();
    });

    it("libera fim de semana com disableWeekends={false}", async () => {
      const user = setup();
      render(<CalendarPopover date={null} setDate={vi.fn()} disableWeekends={false} />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: SABADO_PASSADO })).toBeEnabled();
    });

    it("bloqueia datas futuras por padrão, mantendo hoje disponível", async () => {
      const user = setup();
      render(<CalendarPopover date={null} setDate={vi.fn()} />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: QUINTA_FUTURA })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Today, quarta-feira, 12 de março/ })
      ).toBeEnabled();
    });

    it("libera datas futuras com disableFuture={false}", async () => {
      const user = setup();
      render(<CalendarPopover date={null} setDate={vi.fn()} disableFuture={false} />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: QUINTA_FUTURA })).toBeEnabled();
    });

    it("bloqueia as datas presentes em disabledDates", async () => {
      const user = setup();
      render(
        <CalendarPopover date={null} setDate={vi.fn()} disabledDates={new Set(["2025-03-06"])} />
      );

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: QUINTA_PASSADA })).toBeDisabled();
      expect(screen.getByRole("button", { name: /quinta-feira, 27 de fevereiro/ })).toBeEnabled();
    });

    it("bloqueia as datas recusadas pela função disabled", async () => {
      const user = setup();
      render(
        <CalendarPopover date={null} setDate={vi.fn()} disabled={(date) => date.getDate() === 6} />
      );

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: QUINTA_PASSADA })).toBeDisabled();
      expect(screen.getByRole("button", { name: /sexta-feira, 7 de março de 2025/ })).toBeEnabled();
    });

    it("bloqueia todos os dias enquanto a tabela carrega", async () => {
      const user = setup();
      render(<CalendarPopover date={null} setDate={vi.fn()} isLoadingTable />);

      await abrirCalendario(user, /selecione uma data/i);

      expect(screen.getByRole("button", { name: QUINTA_PASSADA })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Today, quarta-feira, 12 de março/ })
      ).toBeDisabled();
    });
  });
});
