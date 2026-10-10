export type FadeEase = "linear" | "easeIn" | "easeOut" | "easeInOut";

export type FadeVariantsOptions = {
  blur: boolean;
  initialOpacity: number;
  duration: number;
  delay: number;
  ease: FadeEase;
  disappearDuration: number;
  disappearEase: FadeEase;
};

export type FadeState = "hidden" | "shown" | "gone";

type FadeVariant = {
  opacity: number;
  filter?: string;
  transition?: { duration: number; delay?: number; ease?: FadeEase };
};

export function fadeVariants(opts: FadeVariantsOptions): Record<FadeState, FadeVariant> {
  const blurred = opts.blur ? "blur(10px)" : undefined;
  const clear = opts.blur ? "blur(0px)" : undefined;
  return {
    hidden: { opacity: opts.initialOpacity, filter: blurred, transition: { duration: 0 } },
    shown: {
      opacity: 1,
      filter: clear,
      transition: { duration: opts.duration, delay: opts.delay, ease: opts.ease },
    },
    gone: {
      opacity: 0,
      filter: clear,
      transition: { duration: opts.disappearDuration, ease: opts.disappearEase },
    },
  };
}

/** Segundos entre o início da entrada e o início da saída. */
export function disappearTimerSeconds(
  delay: number,
  duration: number,
  disappearAfter: number
): number {
  return delay + duration + disappearAfter;
}
