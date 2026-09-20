import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { dateAndTimeToIso, InlineDateTimeEditor, isoToDateAndTime } from "./inline-datetime-editor";

describe("isoToDateAndTime", () => {
  it("converte ISO para date e time no formato de input", () => {
    expect(isoToDateAndTime("2025-03-04T14:30:00")).toEqual({
      date: "2025-03-04",
      time: "14:30",
    });
  });

  it("preenche com zero à esquerda em mês, dia, hora e minuto", () => {
    expect(isoToDateAndTime("2025-01-05T09:05:00")).toEqual({
      date: "2025-01-05",
      time: "09:05",
    });
  });
});

describe("dateAndTimeToIso", () => {
  it("monta string ISO a partir de date e time", () => {
    expect(dateAndTimeToIso("2025-03-04", "14:30")).toBe("2025-03-04T14:30:00");
  });

  it("retorna ISO com segundos :00", () => {
    expect(dateAndTimeToIso("2024-12-31", "23:59")).toBe("2024-12-31T23:59:00");
  });
});

describe("InlineDateTimeEditor", () => {
  const defaultProps = {
    value: "2025-03-04T14:30:00",
    isEditing: false,
    onStartEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  describe("Modo exibição (isEditing=false)", () => {
    it("renderiza botão com data/hora formatada", () => {
      render(<InlineDateTimeEditor {...defaultProps} />);
      const button = screen.getByRole("button", { name: /alterar data e hora/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("04/03/2025"); // pt-BR
    });

    it("chama onStartEdit ao clicar no botão", async () => {
      const onStartEdit = vi.fn();
      render(<InlineDateTimeEditor {...defaultProps} onStartEdit={onStartEdit} />);
      const button = screen.getByRole("button", { name: /alterar data e hora/i });
      await userEvent.click(button);
      expect(onStartEdit).toHaveBeenCalledTimes(1);
    });

    it("aplica className no botão de exibição", () => {
      render(<InlineDateTimeEditor {...defaultProps} className="minha-classe" />);
      const button = screen.getByRole("button", { name: /alterar data e hora/i });
      expect(button).toHaveClass("minha-classe");
    });

    it("usa locale para formatação quando informado", () => {
      render(<InlineDateTimeEditor {...defaultProps} locale="en-GB" />);
      const button = screen.getByRole("button", { name: /alterar data e hora/i });
      expect(button).toBeInTheDocument();
      // en-GB: 04/03/2025, 14:30:00 ou similar
      expect(button.textContent).toMatch(/04/);
      expect(button.textContent).toMatch(/03/);
      expect(button.textContent).toMatch(/2025/);
    });
  });

  describe("Modo edição (isEditing=true)", () => {
    it("renderiza input date e input time com valores do value", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing />);
      const dateInput = screen.getByLabelText(/data \(dia, mês e ano\)/i);
      const timeInput = screen.getByLabelText(/horário/i);
      expect(dateInput).toHaveAttribute("type", "date");
      expect(dateInput).toHaveValue("2025-03-04");
      expect(timeInput).toHaveAttribute("type", "time");
      expect(timeInput).toHaveValue("14:30");
    });

    it("renderiza botões Salvar e Cancelar", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing />);
      expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    });

    it("chama onSave com ISO ao clicar em Salvar", async () => {
      const onSave = vi.fn();
      render(<InlineDateTimeEditor {...defaultProps} isEditing onSave={onSave} />);
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
      expect(onSave).toHaveBeenCalledWith("2025-03-04T14:30:00");
    });

    it("chama onSave com novo ISO ao alterar date/time e clicar Salvar", async () => {
      const onSave = vi.fn();
      render(<InlineDateTimeEditor {...defaultProps} isEditing onSave={onSave} />);
      const dateInput = screen.getByLabelText(/data \(dia, mês e ano\)/i);
      const timeInput = screen.getByLabelText(/horário/i);
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "2025-06-15");
      await userEvent.clear(timeInput);
      await userEvent.type(timeInput, "09:45");
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
      expect(onSave).toHaveBeenCalledWith("2025-06-15T09:45:00");
    });

    it("chama onCancel ao clicar em Cancelar", async () => {
      const onCancel = vi.fn();
      render(<InlineDateTimeEditor {...defaultProps} isEditing onCancel={onCancel} />);
      await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("usa id nos inputs quando informado", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing id="history-date-1" />);
      expect(screen.getByLabelText(/data \(dia, mês e ano\)/i)).toHaveAttribute(
        "id",
        "history-date-1-date"
      );
      expect(screen.getByLabelText(/horário/i)).toHaveAttribute("id", "history-date-1-time");
    });

    it("usa saveLabel e cancelLabel customizados", () => {
      render(
        <InlineDateTimeEditor
          {...defaultProps}
          isEditing
          saveLabel="Guardar"
          cancelLabel="Descartar"
        />
      );
      expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Descartar" })).toBeInTheDocument();
    });
  });

  describe("Estado saving", () => {
    it("desabilita ambos os botões quando saving=true", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing saving />);
      expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    });

    it("exibe savingLabel no botão de salvar quando saving=true", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing saving savingLabel="A guardar…" />);
      expect(screen.getByRole("button", { name: "A guardar…" })).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("botão de exibição tem aria-label", () => {
      render(<InlineDateTimeEditor {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Alterar data e hora" })).toBeInTheDocument();
    });

    it("inputs de edição têm labels associados (sr-only)", () => {
      render(<InlineDateTimeEditor {...defaultProps} isEditing />);
      expect(screen.getByLabelText(/data \(dia, mês e ano\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário/i)).toBeInTheDocument();
    });
  });
});
