"use client";

import * as React from "react";

export function frameIntervalMs(fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`frameIntervalMs: received ${JSON.stringify(fps)}, expected a number > 0`);
  }
  return 1000 / fps;
}

/**
 * Loop de requestAnimationFrame limitado a `fps`, que para com a aba escondida
 * e retoma ao voltar. O callback mais recente é usado sem reiniciar o loop.
 */
export function useFrameLoop(onFrame: (now: number) => void, active: boolean, fps = 60): void {
  const frameRef = React.useRef(onFrame);
  React.useEffect(() => {
    frameRef.current = onFrame;
  });

  React.useEffect(() => {
    if (!active) return;
    // 1ms de folga: rAF a 60Hz chega com jitter e perderia quadros de 16,67ms.
    const interval = frameIntervalMs(fps) - 1;
    let handle = 0;
    let last = Number.NEGATIVE_INFINITY;
    const tick = (now: number) => {
      handle = 0;
      if (document.hidden) return;
      if (now - last >= interval) {
        last = now;
        frameRef.current(now);
      }
      handle = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!handle && !document.hidden) handle = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (handle) cancelAnimationFrame(handle);
      handle = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [active, fps]);
}
