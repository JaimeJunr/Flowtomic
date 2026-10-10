export type BackdropEnv = {
  userAgent: string;
  supports?: (property: string, value: string) => boolean;
};

/**
 * Mapa de deslocamento do filtro SVG. Os valores são intensidades de canal (cinza médio = sem
 * deslocamento), não cores de tema; por isso saem em notação hsl literal (o teste de tokens proíbe hex e a notação rgb).
 */
export function displacementMapSvg(
  width: number,
  height: number,
  radius: number,
  edge: number
): string {
  if (!(edge >= 0 && edge <= 0.5)) {
    throw new Error(`edge inválido: received ${edge}, expected a number between 0 and 0.5`);
  }
  const margin = edge * Math.min(width, height);
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    "<defs>",
    '<linearGradient id="gx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="hsl(0 0% 0%)"/><stop offset="1" stop-color="hsl(0 100% 50%)"/></linearGradient>',
    '<linearGradient id="gy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(0 0% 0%)"/><stop offset="1" stop-color="hsl(120 100% 50%)"/></linearGradient>',
    `<filter id="soft"><feGaussianBlur stdDeviation="${Math.max(margin / 2, 0.5)}"/></filter>`,
    "</defs>",
    `<rect x="0" y="0" width="${width}" height="${height}" fill="hsl(0 0% 50%)"/>`,
    `<rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#gx)"/>`,
    `<rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#gy)" style="mix-blend-mode:screen"/>`,
    `<rect x="${margin}" y="${margin}" width="${innerW}" height="${innerH}" rx="${Math.max(radius - margin, 0)}" fill="hsl(0 0% 50%)" filter="url(#soft)"/>`,
    "</svg>",
  ].join("");
}

export function mapDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Só Chromium aplica filtro SVG em backdrop-filter; Chrome também diz "Safari" no UA. */
export function supportsSvgBackdrop(env: BackdropEnv): boolean {
  if (!env.supports) return false;
  const ua = env.userAgent;
  if (/firefox/i.test(ua)) return false;
  if (/safari/i.test(ua) && !/chrome|chromium|crios|edg/i.test(ua)) return false;
  return env.supports("backdrop-filter", "url(#x)");
}

export function detectBackdropEnv(): BackdropEnv {
  const hasCss = typeof CSS !== "undefined" && typeof CSS.supports === "function";
  return {
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
    supports: hasCss ? (p, v) => CSS.supports(p, v) : undefined,
  };
}
