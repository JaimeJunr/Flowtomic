/**
 * InlineDateTimeEditor - Editor inline de data e hora.
 * Exibe a data/hora formatada; ao clicar, alterna para modo edição com input date + input time + Salvar/Cancelar.
 */

import { useEffect, useState } from "react";
import { Button, DateInput, TimeInput } from "../../../atoms";

/** Converte ISO para valores de input date e time (locale local). */
export function isoToDateAndTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

/** Monta ISO local a partir de date (yyyy-mm-dd) e time (hh:mm). */
export function dateAndTimeToIso(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`;
}

export interface InlineDateTimeEditorProps {
  /** Valor atual em ISO-8601 (ex: 2025-03-04T14:30:00). */
  value: string;
  /** Se true, exibe os campos de edição em vez do texto. */
  isEditing: boolean;
  /** Chamado quando o usuário clica na data (para o parent ativar isEditing). */
  onStartEdit: () => void;
  /** Chamado ao confirmar com a nova data/hora em ISO-8601. */
  onSave: (iso: string) => void | Promise<void>;
  /** Chamado ao cancelar a edição. */
  onCancel: () => void;
  /** Indica que onSave está em andamento (desabilita botões). */
  saving?: boolean;
  /** Locale para formatação da exibição (ex: pt-BR). */
  locale?: string;
  /** Rótulo do botão Salvar. */
  saveLabel?: string;
  /** Rótulo do botão Cancelar. */
  cancelLabel?: string;
  /** Texto exibido no botão durante o salvamento. */
  savingLabel?: string;
  /** Id do elemento (para acessibilidade, ex: history-date-123). */
  id?: string;
  /** Classes adicionais no container do modo exibição. */
  className?: string;
}

export function InlineDateTimeEditor({
  value,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  saving = false,
  locale = "pt-BR",
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  savingLabel = "Salvando…",
  id,
  className = "",
}: InlineDateTimeEditorProps) {
  const { date, time } = isoToDateAndTime(value);
  const [editDate, setEditDate] = useState(date);
  const [editTime, setEditTime] = useState(time);

  useEffect(() => {
    if (isEditing) {
      const { date: d, time: t } = isoToDateAndTime(value);
      setEditDate(d);
      setEditTime(t);
    }
  }, [isEditing, value]);

  const handleSave = () => {
    const iso = dateAndTimeToIso(editDate, editTime);
    void Promise.resolve(onSave(iso));
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onStartEdit}
        className={`text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer text-left ${className}`.trim()}
        aria-label="Alterar data e hora"
      >
        {new Date(value).toLocaleString(locale)}
      </button>
    );
  }

  const baseId = id ?? "inline-datetime";
  return (
    <span className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`${baseId}-date`}>
        Data (dia, mês e ano)
      </label>
      <DateInput
        id={`${baseId}-date`}
        value={editDate}
        onChange={(e) => setEditDate(e.target.value)}
        aria-label="Dia, mês e ano"
      />
      <label className="sr-only" htmlFor={`${baseId}-time`}>
        Hora
      </label>
      <TimeInput
        id={`${baseId}-time`}
        value={editTime}
        onChange={(e) => setEditTime(e.target.value)}
        aria-label="Horário"
      />
      <Button type="button" variant="default" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? savingLabel : saveLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
        {cancelLabel}
      </Button>
    </span>
  );
}
