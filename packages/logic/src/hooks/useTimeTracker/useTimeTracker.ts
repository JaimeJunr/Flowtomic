/**
 * useTimeTracker - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyTimer() {
 *   const { time, formattedTime, isRunning, start, pause, stop, reset } = useTimeTracker({
 *     initialTime: 0,
 *   })
 *
 *   return (
 *     <div>
 *       <span>{formattedTime}</span>
 *       <button onClick={start}>Start</button>
 *       <button onClick={pause}>Pause</button>
 *       <button onClick={stop}>Stop</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   )
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTimeTrackerOptions {
  /**
   * Tempo inicial em segundos
   * @default 0
   */
  initialTime?: number;

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
   * Callback quando o timer é resetado
   */
  onReset?: () => void;

  /**
   * Formato de tempo customizado
   * @default "HH:mm:ss"
   */
  format?: "HH:mm:ss" | "mm:ss" | "ss" | ((seconds: number) => string);
}

export interface UseTimeTrackerReturn {
  /**
   * Tempo atual em segundos
   */
  time: number;

  /**
   * Tempo formatado como string (HH:mm:ss por padrão)
   */
  formattedTime: string;

  /**
   * Se o timer está rodando
   */
  isRunning: boolean;

  /**
   * Se o timer está pausado
   */
  isPaused: boolean;

  /**
   * Se o timer está parado (não iniciado ou resetado)
   */
  isStopped: boolean;

  /**
   * Inicia o timer
   */
  start: () => void;

  /**
   * Pausa o timer
   */
  pause: () => void;

  /**
   * Para o timer (pausa e mantém o tempo)
   */
  stop: () => void;

  /**
   * Retoma o timer após pausa
   */
  resume: () => void;

  /**
   * Reseta o timer para o tempo inicial
   */
  reset: () => void;
}

/**
 * Hook headless para gerenciar timer
 */
export function useTimeTracker(options: UseTimeTrackerOptions = {}): UseTimeTrackerReturn {
  const {
    initialTime = 0,
    onPause,
    onStop,
    onStart,
    onResume,
    onReset,
    format = "HH:mm:ss",
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Formatar tempo
  const formatTime = useCallback(
    (seconds: number): string => {
      if (typeof format === "function") {
        return format(seconds);
      }

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      switch (format) {
        case "HH:mm:ss":
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        case "mm:ss":
          return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        case "ss":
          return String(seconds);
        default:
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
    },
    [format]
  );

  const formattedTime = formatTime(time);

  // Limpar intervalo
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Iniciar timer
  const start = useCallback(() => {
    if (isRunning) return;

    clearTimerInterval();

    // Se estava pausado, continuar de onde parou
    const startFrom = isPaused ? time : initialTime;
    setTime(startFrom);
    setIsRunning(true);
    setIsPaused(false);
    pausedTimeRef.current = startFrom;

    startTimeRef.current = Date.now() - startFrom * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
      setTime(elapsed);
    }, 100);

    if (!isPaused) {
      onStart?.(startFrom);
    } else {
      onResume?.(startFrom);
    }
  }, [isRunning, isPaused, time, initialTime, onStart, onResume, clearTimerInterval]);

  // Pausar timer
  const pause = useCallback(() => {
    if (!isRunning) return;

    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(true);
    onPause?.(time);
  }, [isRunning, time, onPause, clearTimerInterval]);

  // Parar timer
  const stop = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(false);
    onStop?.(time);
  }, [time, onStop, clearTimerInterval]);

  // Retomar timer
  const resume = useCallback(() => {
    if (!isPaused) return;
    start();
  }, [isPaused, start]);

  // Resetar timer
  const reset = useCallback(() => {
    clearTimerInterval();
    setTime(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    onReset?.();
  }, [initialTime, onReset, clearTimerInterval]);

  return {
    time,
    formattedTime,
    isRunning,
    isPaused,
    isStopped: !isRunning && !isPaused,
    start,
    pause,
    stop,
    resume,
    reset,
  };
}
