import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tool, ToolInput, ToolOutput } from "./tool";

describe("Tool", () => {
  describe("Eyebrows dos rótulos internos (Parameters/Result)", () => {
    it("mostra 'Parameters' sem uppercase/tracking forçados", () => {
      render(
        <Tool open>
          <ToolInput input={{ query: "flowtomic-cli add button" }} />
        </Tool>
      );
      const label = screen.getByText("Parameters");
      expect(label.className).not.toMatch(/\buppercase\b/);
      expect(label.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
    });

    it("mostra 'Result' sem uppercase/tracking forçados", () => {
      render(
        <Tool open>
          <ToolOutput output={{ ok: true }} errorText={undefined} />
        </Tool>
      );
      const label = screen.getByText("Result");
      expect(label.className).not.toMatch(/\buppercase\b/);
      expect(label.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
    });
  });
});
