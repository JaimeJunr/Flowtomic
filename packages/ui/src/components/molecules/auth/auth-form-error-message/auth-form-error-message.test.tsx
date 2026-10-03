import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthFormErrorMessage } from "./auth-form-error-message";

describe("AuthFormErrorMessage", () => {
  it("o erro é anunciado ao leitor de tela assim que aparece", () => {
    render(<AuthFormErrorMessage message="E-mail ou senha inválidos." />);
    expect(screen.getByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
  });

  it("sem mensagem não renderiza nada", () => {
    const { container } = render(<AuthFormErrorMessage message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("animated entra com fade curto e respeita quem pediu menos movimento", () => {
    render(<AuthFormErrorMessage message="Campo obrigatório" animated />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toMatch(/\banimate-in\b/);
    expect(alert.className).toMatch(/motion-reduce:animate-none/);
  });

  it("sem animated não anima", () => {
    render(<AuthFormErrorMessage message="Campo obrigatório" />);
    expect(screen.getByRole("alert").className).not.toMatch(/animate-in/);
  });
});
