export type LiquidState = { level: number; velocity: number };
export type LiquidPhysics = { viscosity: number; splash: number };

const MAX_LEVEL = 100;
const MAX_STEP_SECONDS = 1 / 20;
const SUBSTEPS = 4;
// Base da mola: viscosidade 0.15 dá ~10 rad/s (um balanço de ~0,6 s).
const BASE_STIFFNESS = 400;
const VISCOSITY_STIFFNESS_DROP = 20;
const MIN_DAMPING_RATIO = 0.12;
const MAX_DAMPING_RATIO = 0.5;
const SETTLED_DISTANCE = 0.05;
const SETTLED_VELOCITY = 0.5;
// Fração da altura que a superfície pode inclinar para cada lado.
const MAX_SLOPE_RATIO = 0.1;
const MAX_RIPPLE_PX = 6;
const RIPPLE_GAIN = 0.15;
const RIPPLE_PERIOD_MS = 90;
const PAGE_STEP = 10;

export function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(0, level));
}

function springConstants(viscosity: number): { stiffness: number; damping: number } {
  const stiffness = BASE_STIFFNESS / (1 + viscosity * VISCOSITY_STIFFNESS_DROP);
  const ratio = Math.max(MIN_DAMPING_RATIO, MAX_DAMPING_RATIO - viscosity);
  return { stiffness, damping: 2 * ratio * Math.sqrt(stiffness) };
}

function clampWithSplash(state: LiquidState, splash: number): LiquidState {
  if (state.level < 0) return { level: 0, velocity: Math.abs(state.velocity) * splash };
  if (state.level > MAX_LEVEL)
    return { level: MAX_LEVEL, velocity: -Math.abs(state.velocity) * splash };
  return state;
}

/** Mola amortecida até `target`; `dt` em segundos. Viscosidade 0 = ponteiro rígido. */
export function stepLiquid(
  state: LiquidState,
  target: number,
  dt: number,
  { viscosity, splash }: LiquidPhysics
): LiquidState {
  const goal = clampLevel(target);
  if (viscosity <= 0) return { level: goal, velocity: 0 };
  const { stiffness, damping } = springConstants(viscosity);
  const h = Math.min(dt, MAX_STEP_SECONDS) / SUBSTEPS;
  let next = state;
  for (let i = 0; i < SUBSTEPS; i++) {
    const accel = stiffness * (goal - next.level) - damping * next.velocity;
    const velocity = next.velocity + accel * h;
    next = clampWithSplash({ level: next.level + velocity * h, velocity }, splash);
  }
  return next;
}

export function isSettled(state: LiquidState, target: number): boolean {
  return (
    Math.abs(state.level - target) < SETTLED_DISTANCE && Math.abs(state.velocity) < SETTLED_VELOCITY
  );
}

/** Inclinação (px) da borda de cima: positiva = esquerda mais baixa. */
export function surfaceSlope(velocity: number, tilt: number, height: number): number {
  const limit = height * MAX_SLOPE_RATIO;
  return Math.min(limit, Math.max(-limit, velocity * tilt));
}

export function rippleOffset(velocity: number, tilt: number, timeMs: number): number {
  const amplitude = Math.min(MAX_RIPPLE_PX, Math.abs(velocity) * tilt * RIPPLE_GAIN);
  if (amplitude === 0) return 0;
  return amplitude * Math.sin((timeMs / RIPPLE_PERIOD_MS) * Math.PI);
}

function px(value: number, height: number): string {
  const clamped = Math.min(height, Math.max(0, value));
  return `${Math.round(clamped * 100) / 100}px`;
}

/** clip-path do líquido: só a borda de cima (3 pontos) muda com a inclinação. */
export function surfacePolygon(level: number, slope: number, height: number, ripple = 0): string {
  const top = height * (1 - clampLevel(level) / MAX_LEVEL);
  const floor = `${px(height, height)}`;
  return [
    `polygon(0% ${px(top + slope, height)}`,
    `50% ${px(top + ripple, height)}`,
    `100% ${px(top - slope, height)}`,
    `100% ${floor}`,
    `0% ${floor})`,
  ].join(", ");
}

export function levelFromPointer(clientY: number, rectTop: number, rectHeight: number): number {
  if (!(rectHeight > 0)) {
    throw new Error(`levelFromPointer: received height ${rectHeight}, expected a number > 0`);
  }
  return Math.round(clampLevel(MAX_LEVEL - ((clientY - rectTop) / rectHeight) * MAX_LEVEL));
}

export function keyboardLevel(key: string, value: number): number | null {
  switch (key) {
    case "ArrowUp":
    case "ArrowRight":
      return clampLevel(value + 1);
    case "ArrowDown":
    case "ArrowLeft":
      return clampLevel(value - 1);
    case "PageUp":
      return clampLevel(value + PAGE_STEP);
    case "PageDown":
      return clampLevel(value - PAGE_STEP);
    case "Home":
      return 0;
    case "End":
      return MAX_LEVEL;
    default:
      return null;
  }
}
