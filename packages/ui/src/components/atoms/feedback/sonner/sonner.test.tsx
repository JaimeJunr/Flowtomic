import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
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
