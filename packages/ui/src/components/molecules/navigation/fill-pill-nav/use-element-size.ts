import { type RefObject, useLayoutEffect, useState } from "react";

export type ElementSize = { width: number; height: number };

function sizeOf(entry: ResizeObserverEntry): ElementSize {
  // A caixa de borda inclui o padding da pílula; contentRect só serve de reserva.
  const box = entry.borderBoxSize?.[0];
  if (box) return { width: box.inlineSize, height: box.blockSize };
  return { width: entry.contentRect.width, height: entry.contentRect.height };
}

export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize | null {
  const [size, setSize] = useState<ElementSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = (next: ElementSize) =>
      setSize((prev) =>
        prev && prev.width === next.width && prev.height === next.height ? prev : next
      );
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) update({ width: rect.width, height: rect.height });
    const observer = new ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last) update(sizeOf(last));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
