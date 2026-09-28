/**
 * ReminderCard - Componente Visual
 *
 * Lista de lembretes: horário em mono na frente, título e descrição, e uma ação
 * contornada por linha (DESIGN.md: ação de linha é outline, não sólida).
 */

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms";

export interface Reminder {
  id: string;
  title: string;
  time: string; // Texto livre, ex.: "14:00–14:30"
  description?: string;
}

export interface ReminderCardProps {
  /**
   * Lista de lembretes
   */
  reminders: Reminder[];

  /**
   * Título da seção
   * @default "Lembretes"
   */
  title?: string;

  /**
   * Texto do botão de ação de cada lembrete
   * @default "Começar"
   */
  actionButtonText?: string;

  /**
   * Callback quando o botão de ação é clicado. Sem ele, o botão não aparece.
   */
  onStartMeeting?: (reminder: Reminder) => void;

  /**
   * Callback quando um lembrete é dispensado. Sem ele, o botão de dispensar não aparece.
   */
  onDismiss?: (reminder: Reminder) => void;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente de lista de lembretes
 */
export function ReminderCard({
  reminders,
  title = "Lembretes",
  actionButtonText = "Começar",
  onStartMeeting,
  onDismiss,
  className,
}: ReminderCardProps) {
  const list = reminders ?? [];

  return (
    <section className={cn("text-sm", className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="font-mono text-[13px] text-muted-foreground">{list.length}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhum lembrete.</p>
      ) : (
        <ul className="mt-3">
          {list.map((reminder) => (
            <li
              key={reminder.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-2 py-3 first:border-t-0"
            >
              <span className="w-24 shrink-0 font-mono text-[13px]">{reminder.time}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{reminder.title}</span>
                {reminder.description && (
                  <span className="block text-muted-foreground">{reminder.description}</span>
                )}
              </span>
              {(onStartMeeting || onDismiss) && (
                <span className="flex shrink-0 items-center gap-1">
                  {onStartMeeting && (
                    <Button variant="outline" size="sm" onClick={() => onStartMeeting(reminder)}>
                      {actionButtonText}
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Dispensar ${reminder.title}`}
                      className="size-8 text-muted-foreground"
                      onClick={() => onDismiss(reminder)}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
