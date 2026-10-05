import { motion, useInView } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";

export interface EncryptedTextProps {
  /**
   * O texto a ser criptografado e revelado
   */
  text: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Tempo em milissegundos entre revelar cada caractere real subsequente.
   * Menor é mais rápido. Padrão: 50ms por caractere.
   * @default 50
   */
  revealDelayMs?: number;
  /**
   * Conjunto de caracteres customizado para usar no efeito gibberish.
   * @default "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?"
   */
  charset?: string;
  /**
   * Tempo em milissegundos entre flips de gibberish para caracteres não revelados.
   * Menor é mais jittery. Padrão: 50ms.
   * @default 50
   */
  flipDelayMs?: number;
  /**
   * Classe CSS para estilizar caracteres criptografados/scrambled
   */
  encryptedClassName?: string;
  /**
   * Classe CSS para estilizar caracteres revelados
   */
  revealedClassName?: string;
  /**
   * O que dispara a revelação. "view" revela uma vez ao entrar na tela;
   * "hover" (ponteiro ou foco) e "click" (clique, Enter ou Espaço) começam legíveis e
   * embaralham de novo a cada disparo.
   * @default "view"
   */
  trigger?: "view" | "hover" | "click";
  /**
   * De onde a revelação começa.
   * @default "start"
   */
  revealFrom?: RevealFrom;
  /**
   * Embaralha só com os caracteres não-espaço do próprio texto, em vez do `charset`.
   * @default false
   */
  scrambleWithOwnCharacters?: boolean;
}

export type RevealFrom = "start" | "end" | "center";

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

/** Índices na ordem em que são revelados. */
export function buildRevealOrder(length: number, from: RevealFrom): number[] {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`invalid length: received ${length}, expected a non-negative integer`);
  }
  const indices = Array.from({ length }, (_, index) => index);
  if (from === "end") return indices.reverse();
  if (from === "start") return indices;
  const middle = (length - 1) / 2;
  // sort estável: em empate de distância, o índice menor sai primeiro
  return indices.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle));
}

export function resolveScrambleCharset(text: string, charset: string, ownOnly: boolean): string {
  if (!ownOnly) return charset;
  const own = Array.from(new Set(text.replace(/\s/g, ""))).join("");
  return own || charset;
}

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length);
  return charset.charAt(index);
}

function generateGibberishPreservingSpaces(original: string, charset: string): string {
  if (!original) return "";
  let result = "";
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    result += ch === " " ? " " : generateRandomCharacter(charset);
  }
  return result;
}

function invertOrder(order: number[]): number[] {
  const rank: number[] = [];
  order.forEach((index, position) => {
    rank[index] = position;
  });
  return rank;
}

/**
 * EncryptedText - Componente de texto com efeito de revelação gradual
 *
 * @example
 * ```tsx
 * <EncryptedText
 *   text="Texto secreto"
 *   revealDelayMs={30}
 *   flipDelayMs={50}
 * />
 * ```
 */
export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
  trigger = "view",
  revealFrom = "start",
  scrambleWithOwnCharacters = false,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useShouldReduceMotion();

  const activeCharset = useMemo(
    () => resolveScrambleCharset(text, charset, scrambleWithOwnCharacters),
    [text, charset, scrambleWithOwnCharacters]
  );
  const rank = useMemo(
    () => invertOrder(buildRevealOrder(text.length, revealFrom)),
    [text.length, revealFrom]
  );

  // hover/click: o texto nasce legível e cada disparo incrementa a rodada
  const [runCount, setRunCount] = useState<number>(0);
  const [revealCount, setRevealCount] = useState<number>(trigger === "view" ? 0 : text.length);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const scrambleCharsRef = useRef<string[]>(
    text ? generateGibberishPreservingSpaces(text, activeCharset).split("") : []
  );

  const shouldRun = !shouldReduceMotion && (trigger === "view" ? isInView : runCount > 0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runCount só serve para reiniciar a animação a cada disparo
  useEffect(() => {
    if (!shouldRun) return;

    // Reset state for a fresh animation whenever dependencies change
    const initial = text ? generateGibberishPreservingSpaces(text, activeCharset) : "";
    scrambleCharsRef.current = initial.split("");
    startTimeRef.current = performance.now();
    lastFlipTimeRef.current = startTimeRef.current;
    setRevealCount(0);

    let isCancelled = false;

    const update = (now: number) => {
      if (isCancelled) return;

      const elapsedMs = now - startTimeRef.current;
      const totalLength = text.length;
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor(elapsedMs / Math.max(1, revealDelayMs))
      );

      setRevealCount(currentRevealCount);

      if (currentRevealCount >= totalLength) {
        return;
      }

      // Re-randomize unrevealed scramble characters on an interval
      const timeSinceLastFlip = now - lastFlipTimeRef.current;
      if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
        for (let index = 0; index < totalLength; index += 1) {
          if (rank[index] >= currentRevealCount) {
            if (text[index] !== " ") {
              scrambleCharsRef.current[index] = generateRandomCharacter(activeCharset);
            } else {
              scrambleCharsRef.current[index] = " ";
            }
          }
        }
        lastFlipTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldRun, runCount, text, revealDelayMs, activeCharset, flipDelayMs, rank]);

  if (!text) return null;

  const fire = () => setRunCount((count) => count + 1);
  const interactionProps =
    trigger === "hover"
      ? { tabIndex: 0, onPointerEnter: fire, onFocus: fire }
      : trigger === "click"
        ? {
            tabIndex: 0,
            onClick: fire,
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fire();
              }
            },
          }
        : {};

  const visibleRevealCount = shouldReduceMotion ? text.length : revealCount;

  return (
    <motion.span
      data-slot="encrypted-text"
      ref={ref}
      className={cn(className)}
      aria-label={text}
      {...interactionProps}
    >
      <span aria-hidden="true">
        {text.split("").map((char, index) => {
          const isRevealed = rank[index] < visibleRevealCount;
          const displayChar = isRevealed
            ? char
            : char === " "
              ? " "
              : (scrambleCharsRef.current[index] ?? generateRandomCharacter(activeCharset));

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: O índice é estável para esta animação de caracteres
            <span key={index} className={cn(isRevealed ? revealedClassName : encryptedClassName)}>
              {displayChar}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
};
