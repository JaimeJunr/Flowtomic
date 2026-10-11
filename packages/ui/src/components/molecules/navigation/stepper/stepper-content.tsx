"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

const SLIDE = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${-direction * 100}%`, opacity: 0 }),
};

/** Mede o conteudo para o contêiner animar a altura ate ele. */
function useMeasuredHeight(onHeight: (height: number) => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => onHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [onHeight]);
  return ref;
}

function Measured({
  onHeight,
  children,
}: {
  onHeight: (h: number) => void;
  children: React.ReactNode;
}) {
  const ref = useMeasuredHeight(onHeight);
  return <div ref={ref}>{children}</div>;
}

export type StepperContentProps = {
  /** Chave unica do passo, para o AnimatePresence distinguir entrada e saida. */
  contentKey: string;
  direction: 1 | -1;
  reduced: boolean;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

export function StepperContent({
  contentKey,
  direction,
  reduced,
  children,
  ref,
}: StepperContentProps) {
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  return (
    <div ref={ref} tabIndex={-1} data-slot="stepper-content" className="outline-none">
      {reduced ? (
        <div key={contentKey}>{children}</div>
      ) : (
        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: height ?? "auto" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={contentKey}
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Measured onHeight={setHeight}>{children}</Measured>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
