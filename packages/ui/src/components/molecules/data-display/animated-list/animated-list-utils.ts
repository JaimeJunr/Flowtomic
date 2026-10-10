const FADE_DISTANCE = 50;

export type EdgeFade = { top: number; bottom: number };

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function edgeFade(scrollTop: number, scrollHeight: number, clientHeight: number): EdgeFade {
  const remaining = scrollHeight - (scrollTop + clientHeight);
  return {
    top: clamp01(scrollTop / FADE_DISTANCE),
    bottom: clamp01(remaining / FADE_DISTANCE),
  };
}

/** Novo índice para a tecla, ou null se a tecla não move a seleção. */
export function moveIndex(current: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  const last = count - 1;
  switch (key) {
    case "ArrowDown":
      return Math.min(current + 1, last);
    case "ArrowUp":
      return Math.max(current - 1, 0);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return null;
  }
}

// Isolada para o teste: o jsdom não implementa scrollIntoView.
export function scrollItemIntoView(element: HTMLElement | null, reduceMotion: boolean): void {
  if (!element || typeof element.scrollIntoView !== "function") return;
  element.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
}
