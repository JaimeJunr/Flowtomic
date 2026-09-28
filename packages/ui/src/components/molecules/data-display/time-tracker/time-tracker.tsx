/**
 * TimeTracker - Componente Visual
 *
 * Timer com controles usando o hook headless useTimeTracker. O tempo é a resposta da
 * tela (mono grande); o botão principal troca de rótulo no mesmo lugar
 * (Iniciar → Pausar → Retomar), e Parar fica contornado ao lado.
 */

import { useTimeTracker } from "@flowtomic/logic";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms";

export interface TimeTrackerProps {
  /**
   * Tempo inicial em segundos
   * @default 0
   */
  initialTime?: number;

  /**
   * Título da seção
   * @default "Tempo"
   */
  title?: string;

  /**
   * Formato de tempo
   * @default "HH:mm:ss"
   */
  format?: "HH:mm:ss" | "mm:ss" | "ss";

  /**
   * Callback quando o timer é pausado
   */
  onPause?: (time: number) => void;

  /**
   * Callback quando o timer é parado
   */
  onStop?: (time: number) => void;

  /**
   * Callback quando o timer é iniciado
   */
  onStart?: (time: number) => void;

  /**
   * Callback quando o timer é retomado
   */
  onResume?: (time: number) => void;

  /**
   * Classe CSS adicional
   */
  className?: string;

  /**
   * Cor de fundo da seção
   */
  backgroundColor?: string;
}

/**
 * Componente de timer com controles
 */
export function TimeTracker({
  initialTime = 0,
  title = "Tempo",
  format = "HH:mm:ss",
  onPause,
  onStop,
  onStart,
  onResume,
  className,
  backgroundColor,
}: TimeTrackerProps) {
  const { formattedTime, isRunning, isPaused, start, pause, stop, resume } = useTimeTracker({
    initialTime,
    format,
    onPause,
    onStop,
    onStart,
    onResume,
  });

  const state = isRunning
    ? { label: "Contando", dot: "bg-success" }
    : isPaused
      ? { label: "Pausado", dot: "bg-warning" }
      : { label: "Parado", dot: "bg-border" };

  return (
    <section
      className={cn("text-sm", className)}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-5 flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className={cn("size-2 rounded-full", state.dot)} aria-hidden="true" />
        {state.label}
      </div>
      <div className="mt-1 font-mono text-[40px] font-medium leading-none tracking-tight">
        {formattedTime}
      </div>

      <div className="mt-5 flex gap-2">
        {isRunning ? (
          <Button onClick={pause}>
            <Pause className="size-4" aria-hidden="true" />
            Pausar
          </Button>
        ) : isPaused ? (
          <Button onClick={resume}>
            <Play className="size-4" aria-hidden="true" />
            Retomar
          </Button>
        ) : (
          <Button onClick={start}>
            <Play className="size-4" aria-hidden="true" />
            Iniciar
          </Button>
        )}
        {(isRunning || isPaused) && (
          <Button variant="outline" onClick={stop}>
            <Square className="size-4" aria-hidden="true" />
            Parar
          </Button>
        )}
      </div>
    </section>
  );
}
