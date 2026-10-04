export type RgbColor = { r: number; g: number; b: number; a: number };

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

function readNumber(value: string, percentageScale?: number): number | null {
  if (value === "none") return 0;
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%)?$/i.exec(value);
  if (!match || (match[2] && percentageScale === undefined)) return null;
  const result = Number(match[1]) * (match[2] ? (percentageScale as number) / 100 : 1);
  return Number.isFinite(result) ? result : null;
}

function fromLinear(value: number): number {
  return clamp(value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);
}

export function parseCssColor(value: string): RgbColor | null {
  const input = value.trim().toLowerCase();
  const hex = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.exec(input);
  if (hex) {
    const digits = hex[1].length < 5 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    return {
      r: Number.parseInt(digits.slice(0, 2), 16) / 255,
      g: Number.parseInt(digits.slice(2, 4), 16) / 255,
      b: Number.parseInt(digits.slice(4, 6), 16) / 255,
      a: digits.length === 8 ? Number.parseInt(digits.slice(6, 8), 16) / 255 : 1,
    };
  }
  const isOklch = /^oklch\s*\(/.test(input);
  const functionMatch = /^(?:oklch|rgba?)\s*\(([^()]*)\)$/.exec(input);
  if (!functionMatch) return null;
  const body = functionMatch[1];
  let channels: string[];
  let alpha: string | undefined;
  if (body.includes(",")) {
    if (isOklch || body.includes("/")) return null;
    const parts = body.split(",").map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) return null;
    channels = parts.slice(0, 3);
    alpha = parts[3];
  } else {
    const parts = body.split("/");
    if (parts.length > 2) return null;
    channels = parts[0].trim().split(/\s+/);
    alpha = parts[1]?.trim();
  }
  if (channels.length !== 3) return null;
  const opacity = alpha === undefined ? 1 : readNumber(alpha, 1);
  if (opacity === null) return null;
  const first = readNumber(channels[0], isOklch ? 1 : 255);
  const second = readNumber(channels[1], isOklch ? undefined : 255);
  if (isOklch && channels[2].endsWith("deg") && channels[2].slice(0, -3) === "none") return null;
  const third = readNumber(
    isOklch ? channels[2].replace(/deg$/, "") : channels[2],
    isOklch ? undefined : 255
  );
  if (first === null || second === null || third === null) return null;
  if (!isOklch)
    return {
      r: clamp(first / 255),
      g: clamp(second / 255),
      b: clamp(third / 255),
      a: clamp(opacity),
    };

  const lightness = clamp(first);
  const chroma = Math.max(0, second);
  const hue = ((third % 360) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  if (![l, m, s].every(Number.isFinite)) return null;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: clamp(opacity),
  };
}

export function readThemeColor(token: string, element?: Element): RgbColor | null {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
  const value = getComputedStyle(element ?? document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value ? parseCssColor(value) : null;
}
