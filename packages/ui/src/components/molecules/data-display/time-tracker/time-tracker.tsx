/**
 * TimeTracker - Componente Visual
 *
 * Timer com controles usando o hook headless useTimeTracker
 */

import { useTimeTracker } from "@flowtomic/logic";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../atoms";

export interface TimeTrackerProps {
  /**
   * Tempo inicial em segundos
   * @default 0
   */
  initialTime?: number;

  /**
   * Título do card
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
   * Cor de fundo do card
   */
  backgroundColor?: string;
}

/**
 * Componente de timer com controles
 */
export function TimeTracker({
  initialTime = 0,
  title = "Time Tracker",
  format = "HH:mm:ss",
  onPause,
  onStop,
  onStart,
  onResume,
  className,
  backgroundColor,
}: TimeTrackerProps) {
  const { formattedTime, isRunning, isPaused, isStopped, start, pause, stop, resume } =
    useTimeTracker({
      initialTime,
      format,
      onPause,
      onStop,
      onStart,
      onResume,
    });

  return (
    <Card className={cn(className)} style={backgroundColor ? { backgroundColor } : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Display do tempo */}
          <div className="text-4xl font-mono font-bold text-foreground">{formattedTime}</div>

          {/* Controles */}
          <div className="flex gap-2">
            {isStopped && (
              <Button onClick={start} size="sm" variant="default">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}

            {isRunning && (
              <>
                <Button onClick={pause} size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={stop} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button onClick={resume} size="sm" variant="default">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                <Button onClick={stop} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
