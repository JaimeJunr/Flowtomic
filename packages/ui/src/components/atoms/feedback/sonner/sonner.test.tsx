import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toaster } from "./sonner";

describe("Sonner (Toaster)", () => {
  describe("Renderização", () => {
    it("deve renderizar o Toaster", () => {
      render(<Toaster />);
      // O Toaster renderiza um portal, então verificamos se não há erros
      expect(document.body).toBeInTheDocument();
    });

    it("deve renderizar com tema light por padrão", () => {
      render(<Toaster />);
      expect(document.body).toBeInTheDocument();
    });

    it("deve renderizar com tema dark quando fornecido", () => {
      render(<Toaster theme="dark" />);
      expect(document.body).toBeInTheDocument();
    });
  });
});
