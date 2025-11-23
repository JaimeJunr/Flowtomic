/**
 * ReminderCard - Componente Visual
 *
 * Card de lembretes com horário e botão de ação
 */

import { Clock, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../atoms";

export interface Reminder {
  id: string;
  title: string;
  time: string; // Formato: "02.00 pm - 04.00 pm"
  description?: string;
}

export interface ReminderCardProps {
  /**
   * Lista de lembretes
   */
  reminders: Reminder[];

  /**
   * Título do card
   */
  title?: string;

  /**
   * Texto do botão de ação principal
   * @default "Start Meeting"
   */
  actionButtonText?: string;

  /**
   * Callback quando o botão de ação é clicado
   */
  onStartMeeting?: (reminder: Reminder) => void;

  /**
   * Callback quando um lembrete é dispensado
   */
  onDismiss?: (reminder: Reminder) => void;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente de card de lembretes
 */
export function ReminderCard({
  reminders,
  title = "Reminders",
  actionButtonText = "Start Meeting",
  onStartMeeting,
  onDismiss,
  className,
}: ReminderCardProps) {
  if (!reminders || reminders.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No reminders</div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar apenas o primeiro lembrete (ou todos se necessário)
  const primaryReminder = reminders[0];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="space-y-3">
              {/* Título do lembrete */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{reminder.title}</div>
                  {reminder.description && (
                    <div className="text-xs text-muted-foreground mt-1">{reminder.description}</div>
                  )}
                </div>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onDismiss(reminder)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Horário */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{reminder.time}</span>
              </div>

              {/* Botão de ação */}
              {onStartMeeting && (
                <Button onClick={() => onStartMeeting(reminder)} className="w-full" size="sm">
                  {actionButtonText}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
