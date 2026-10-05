/**
 * CountUp Component - Flowtomic UI
 *
 * Número que conta de um valor a outro quando entra na tela, desacelerando
 * perto do fim. Diferente do SlidingNumber, que rola os dígitos como odômetro.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/count-up.md
 */

"use client";

import { animate, useInView } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

type CountUpProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Valor final. */
  to: number;
  /** Valor inicial. Se maior que `to`, a contagem é para baixo. */
  from?: number;
  durationMs?: number;
  delayMs?: number;
  /** Casas decimais fixas. Padrão: a maior quantidade entre `from` e `to`. */
  decimalPlaces?: number;
  /** Locale do Intl.NumberFormat. */
  locale?: string;
  /** Opções do Intl.NumberFormat (moeda, porcentagem...). Vencem as casas decimais. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Portão externo: só começa quando true e visível. */
  start?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
};

const MAX_DECIMALS = 20;

/** Casas decimais de um número, inclusive em notação científica (1e-7). */
function countDecimals(value: number): number {
  const [mantissa = "", exponent = "0"] = String(value).split("e");
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  return Math.min(Math.max(fraction - Number(exponent), 0), MAX_DECIMALS);
}

function formatCountUp(
  value: number,
  locale: string,
  decimals: number,
  formatOptions?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...formatOptions,
  }).format(value);
}

function CountUp({
  to,
  from = 0,
  durationMs = 1500,
  delayMs = 0,
  decimalPlaces,
  locale = "pt-BR",
  formatOptions,
  start = true,
  onStart,
  onEnd,
  className,
  ref,
  ...props
}: CountUpProps) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);
  const isInView = useInView(rootRef, { once: true });
  const reduceMotion = useShouldReduceMotion();
  const [current, setCurrent] = React.useState(from);
  // Valor mais recente fora do estado: um novo `to` conta a partir de onde parou.
  const currentRef = React.useRef(from);

  // Guarda os callbacks mais recentes: trocar a função não deve reiniciar a contagem.
  const onStartRef = React.useRef(onStart);
  onStartRef.current = onStart;
  const onEndRef = React.useRef(onEnd);
  onEndRef.current = onEnd;

  const decimals = decimalPlaces ?? Math.max(countDecimals(from), countDecimals(to));
  const ready = start && (reduceMotion || isInView);

  React.useEffect(() => {
    if (!ready) return;
    if (reduceMotion) {
      onEndRef.current?.();
      return;
    }
    const update = (value: number) => {
      currentRef.current = value;
      setCurrent(value);
    };
    onStartRef.current?.();
    const controls = animate(currentRef.current, to, {
      duration: durationMs / 1000,
      delay: delayMs / 1000,
      ease: "easeOut",
      onUpdate: update,
      onComplete: () => {
        update(to);
        onEndRef.current?.();
      },
    });
    return () => controls.stop();
  }, [ready, reduceMotion, to, durationMs, delayMs]);

  const rootClassName = cn("tabular-nums", className);
  const finalText = formatCountUp(to, locale, decimals, formatOptions);

  if (reduceMotion) {
    return (
      <span ref={rootRef} data-slot="count-up" className={rootClassName} {...props}>
        {finalText}
      </span>
    );
  }

  return (
    <span ref={rootRef} data-slot="count-up" className={rootClassName} {...props}>
      <span className="sr-only">{finalText}</span>
      <span aria-hidden="true">{formatCountUp(current, locale, decimals, formatOptions)}</span>
    </span>
  );
}

CountUp.displayName = "CountUp";

export type { CountUpProps };
export { CountUp, countDecimals, formatCountUp };
