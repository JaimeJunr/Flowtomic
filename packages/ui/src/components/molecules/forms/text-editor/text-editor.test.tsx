import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextEditor } from "./text-editor";

describe("TextEditor - toolbar acessível", () => {
  it("expõe nome acessível para o botão de negrito, sem depender só do tooltip", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
  });

  it("expõe nome acessível para outro botão da toolbar (itálico)", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Itálico" })).toBeInTheDocument();
  });

  it("marca aria-pressed=false quando o negrito não está ativo", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("alterna aria-pressed do negrito a cada clique", async () => {
    render(<TextEditor availableModes={["rich"]} />);
    const bold = screen.getByRole("button", { name: "Negrito" });

    fireEvent.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));

    fireEvent.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "false"));
  });
});
