export type Pixel = {
  x: number;
  y: number;
  /** Índice na lista de cores da variante. */
  color: number;
  maxSize: number;
  /** Distância ao centro em px: quem está mais longe acende depois. */
  delay: number;
  speed: number;
  size: number;
  counter: number;
  shimmering: boolean;
  reverse: boolean;
};

export type PixelMode = "appear" | "disappear";

const GROW_STEP = 0.1;
const MIN_SHIMMER = 0.5;
// Quanto o contador de atraso avança por quadro, em px de distância.
const COUNTER_STEP = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Converte a velocidade 0..100 do componente no fator por quadro. */
export function throttledSpeed(speed: number): number {
  return (clamp(speed, 0, 100) / 100) * 0.1;
}

function makePixel(
  x: number,
  y: number,
  center: { x: number; y: number },
  colorCount: number,
  rand: () => number,
  factor: number
): Pixel {
  return {
    x,
    y,
    color: Math.min(colorCount - 1, Math.floor(rand() * colorCount)),
    maxSize: 0.5 + rand() * 1.5,
    delay: Math.hypot(x - center.x, y - center.y),
    speed: (0.1 + rand() * 0.8) * factor,
    size: 0,
    counter: 0,
    shimmering: false,
    reverse: false,
  };
}

export function buildPixels(
  width: number,
  height: number,
  gap: number,
  colorCount: number,
  rand: () => number,
  speed: number
): Pixel[] {
  if (!Number.isFinite(gap) || gap <= 0) {
    throw new Error(`buildPixels: received gap ${JSON.stringify(gap)}, expected a number > 0`);
  }
  const center = { x: width / 2, y: height / 2 };
  const factor = throttledSpeed(speed);
  const pixels: Pixel[] = [];
  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      pixels.push(makePixel(x, y, center, colorCount, rand, factor));
    }
  }
  return pixels;
}

function shimmer(pixel: Pixel): Pixel {
  let { size, reverse } = pixel;
  size += reverse ? -pixel.speed : pixel.speed;
  if (size >= pixel.maxSize) {
    size = pixel.maxSize;
    reverse = true;
  } else if (size <= MIN_SHIMMER) {
    size = Math.min(MIN_SHIMMER, pixel.maxSize);
    reverse = false;
  }
  return { ...pixel, size, reverse };
}

function appear(pixel: Pixel): Pixel {
  const counter = pixel.counter + COUNTER_STEP;
  if (counter <= pixel.delay) return { ...pixel, counter };
  if (pixel.shimmering) return shimmer({ ...pixel, counter });
  const size = Math.min(pixel.maxSize, pixel.size + GROW_STEP);
  const done = size >= pixel.maxSize;
  return { ...pixel, counter, size, shimmering: done, reverse: done };
}

function disappear(pixel: Pixel): Pixel {
  const size = Math.max(0, pixel.size - GROW_STEP);
  return { ...pixel, counter: 0, shimmering: false, reverse: false, size };
}

/** Avança um quadro; devolve um pixel novo. */
export function stepPixel(pixel: Pixel, mode: PixelMode): Pixel {
  return mode === "appear" ? appear(pixel) : disappear(pixel);
}

/** Movimento reduzido: mostra no tamanho final ou esconde de uma vez. */
export function settlePixel(pixel: Pixel, visible: boolean): Pixel {
  return {
    ...pixel,
    counter: 0,
    shimmering: false,
    reverse: false,
    size: visible ? pixel.maxSize : 0,
  };
}

export function allPixelsGone(pixels: Pixel[]): boolean {
  return pixels.every((pixel) => pixel.size === 0);
}

/** Gerador pseudoaleatório determinístico em [0, 1), injetável em buildPixels. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
