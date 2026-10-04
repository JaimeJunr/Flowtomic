import { describe, expect, it } from "vitest";
import { parseCssColor, readThemeColor } from "./index";

describe("parseCssColor", () => {
  it.each([
    ["oklch(1 0 0)", [1, 1, 1, 1]],
    ["oklch(0 0 0)", [0, 0, 0, 1]],
    ["oklch(0.628 0.2577 29.23)", [1, 0, 0, 1]],
    ["oklch(62.8% 0.2577 29.23deg / 50%)", [1, 0, 0, 0.5]],
    ["oklch(none none none / none)", [0, 0, 0, 0]],
    ["oklch(1 0 0 / .25)", [1, 1, 1, 0.25]],
    ["oklch(0.5 0 0)", [0.38857, 0.38857, 0.38857, 1]],
    ["#fff", [1, 1, 1, 1]],
    ["#000", [0, 0, 0, 1]],
    ["#f008", [1, 0, 0, 136 / 255]],
    ["#ff0000", [1, 0, 0, 1]],
    ["#00ff0080", [0, 1, 0, 128 / 255]],
    [" #AbC ", [170 / 255, 187 / 255, 204 / 255, 1]],
    ["rgb(255, 0, 128)", [1, 0, 128 / 255, 1]],
    ["rgba(255, 0, 0, 0.5)", [1, 0, 0, 0.5]],
    ["rgb(100%, 0%, 50%)", [1, 0, 0.5, 1]],
    ["rgba(100%, 0%, 0%, 50%)", [1, 0, 0, 0.5]],
    ["rgb(255 0 0 / 25%)", [1, 0, 0, 0.25]],
    ["rgb(255 0 0)", [1, 0, 0, 1]],
    ["rgba(0 255 0 / .75)", [0, 1, 0, 0.75]],
    ["rgb(none none none / none)", [0, 0, 0, 0]],
    ["rgb(300 -20 0 / 2)", [1, 0, 0, 1]],
    ["oklch(2 0 0 / -1)", [1, 1, 1, 0]],
    ["RGB(255 0 0)", [1, 0, 0, 1]],
  ])("parses %s", (input, expected) => {
    const result = parseCssColor(input);
    expect(result).not.toBeNull();
    for (const [index, channel] of (["r", "g", "b", "a"] as const).entries()) {
      expect(result?.[channel]).toBeCloseTo(expected[index], 2);
    }
  });
  it.each([
    "",
    "red",
    "transparent",
    "hsl(0 100% 50%)",
    "#12",
    "#ggg",
    "#12345",
    "rgb(1 2)",
    "rgb(1 2 3 4)",
    "rgb(1, 2 3)",
    "rgb(1,,2,3)",
    "rgb(1 2 3 /)",
    "rgb(1 2 3 / 1 / 2)",
    "rgb(NaN 0 0)",
    "rgb(1px 2 3)",
    "oklch(1 0)",
    "oklch(1 0 0 1)",
    "oklch(1 0 1rad)",
    "oklch(1 0% 0)",
    "oklch(1 nope 0)",
    "oklch(1, 0, 0)",
    "rgb(1, 2, 3 / 0.5)",
    "rgb(1, 2, 3, 4, 5)",
    "oklch(1 0 nonedeg)",
    "oklch(0.5 1e300 0)",
    "oklch(1 0 0 / bad)",
    "rgb(1e999 0 0)",
    "rgb(1 2 3) trailing",
  ])("rejects %s", (input) => {
    expect(parseCssColor(input)).toBeNull();
  });
});

describe("readThemeColor", () => {
  it("reads a custom property from the supplied element", () => {
    const element = document.createElement("div");
    element.style.setProperty("--tone", " rgb(255 0 0 / 50%) ");
    expect(readThemeColor("--tone", element)).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
  });
  it("defaults to the document root", () => {
    document.documentElement.style.setProperty("--test-tone", "#000");
    try {
      expect(readThemeColor("--test-tone")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    } finally {
      document.documentElement.style.removeProperty("--test-tone");
    }
  });
  it("returns null for an empty property", () => {
    expect(readThemeColor("--missing", document.createElement("div"))).toBeNull();
  });
  it("returns null for an unsupported property value", () => {
    const element = document.createElement("div");
    element.style.setProperty("--tone", "red");
    expect(readThemeColor("--tone", element)).toBeNull();
  });
  it("reports the received token and expected format", () => {
    expect(() => readThemeColor("primary")).toThrow(/primary.*--token-name/);
  });
});
