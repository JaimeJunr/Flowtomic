/**
 * Ângulo, em graus, que um traço vertical precisa girar para apontar ao ponteiro.
 * O +90 existe porque o traço em repouso é vertical e atan2 mede a partir do eixo x.
 */
export function pointAngle(cx: number, cy: number, px: number, py: number): number {
  return (Math.atan2(py - cy, px - cx) * 180) / Math.PI + 90;
}
