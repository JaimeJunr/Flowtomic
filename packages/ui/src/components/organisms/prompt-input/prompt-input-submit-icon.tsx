"use client";

import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";

const MORPH_SECONDS = 0.24;
const TILT_DEGREES = 8;

/**
 * Seta que afina, inclina e vira quadrado (e volta). O ícone só troca no meio da
 * transição, quando a forma está mais achatada; com movimento reduzido a troca é direta.
 */
export function PromptInputSubmitIcon({ busy }: { busy: boolean }) {
  const reduceMotion = useShouldReduceMotion();
  const [shownBusy, setShownBusy] = useState(busy);
  const [turn, setTurn] = useState(0);
  const previousBusy = useRef(busy);

  useEffect(() => {
    if (previousBusy.current !== busy) {
      previousBusy.current = busy;
      setTurn((current) => current + 1);
    }
  }, [busy]);

  useEffect(() => {
    if (shownBusy === busy) {
      return;
    }
    if (reduceMotion) {
      setShownBusy(busy);
      return;
    }
    const id = setTimeout(() => setShownBusy(busy), (MORPH_SECONDS / 2) * 1000);
    return () => clearTimeout(id);
  }, [busy, shownBusy, reduceMotion]);

  const icon = shownBusy ? (
    <SquareIcon aria-hidden="true" className="size-3.5 fill-current" />
  ) : (
    <ArrowUpIcon aria-hidden="true" className="size-4" />
  );

  if (reduceMotion) {
    return (
      <span data-slot="prompt-input-submit-icon" className="inline-flex">
        {icon}
      </span>
    );
  }

  // O sentido do giro inverte na volta (busy → ocioso)
  const tilt = busy ? TILT_DEGREES : -TILT_DEGREES;

  return (
    <motion.span
      // key novo a cada mudança de estado reinicia os keyframes
      key={turn}
      data-slot="prompt-input-submit-icon"
      className="inline-flex"
      initial={false}
      animate={
        turn === 0
          ? undefined
          : { scaleX: [1, 0.88, 1], scaleY: [1, 1.12, 1], rotate: [0, tilt, 0] }
      }
      transition={{ duration: MORPH_SECONDS, times: [0, 0.5, 1], ease: "easeInOut" }}
    >
      {icon}
    </motion.span>
  );
}
