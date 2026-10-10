import { describe, expect, it } from "vitest";
import { displacementMapSvg, supportsSvgBackdrop } from "./glass-surface-utils";

const CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const FIREFOX_UA = "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0";
const yes = () => true;

describe("displacementMapSvg", () => {
  it("gera SVG com as dimensões, o raio e dois gradientes lineares", () => {
    const svg = displacementMapSvg(300, 120, 20, 0.07);
    expect(svg).toContain('width="300"');
    expect(svg).toContain('height="120"');
    expect(svg).toContain('rx="20"');
    expect(svg.match(/<linearGradient/g)).toHaveLength(2);
  });

  it("usa margem de edge vezes o menor lado no retângulo interno", () => {
    const svg = displacementMapSvg(300, 100, 20, 0.1);
    expect(svg).toContain('x="10"');
    expect(svg).toContain('width="280"');
  });

  it("não contém hex nem rgb(", () => {
    const svg = displacementMapSvg(300, 120, 20, 0.07);
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(svg).not.toMatch(/rgba?\(/);
  });

  it("lança erro com o valor recebido quando edge sai de 0..0.5", () => {
    expect(() => displacementMapSvg(300, 120, 20, 0.7)).toThrow(/0\.7/);
    expect(() => displacementMapSvg(300, 120, 20, -0.1)).toThrow(/-0\.1/);
  });
});

describe("supportsSvgBackdrop", () => {
  it("é verdadeiro no Chromium", () => {
    expect(supportsSvgBackdrop({ userAgent: CHROME_UA, supports: yes })).toBe(true);
  });
  it("é falso no Safari e no Firefox", () => {
    expect(supportsSvgBackdrop({ userAgent: SAFARI_UA, supports: yes })).toBe(false);
    expect(supportsSvgBackdrop({ userAgent: FIREFOX_UA, supports: yes })).toBe(false);
  });
  it("é falso sem CSS.supports ou quando ele recusa", () => {
    expect(supportsSvgBackdrop({ userAgent: CHROME_UA })).toBe(false);
    expect(supportsSvgBackdrop({ userAgent: CHROME_UA, supports: () => false })).toBe(false);
  });
});
