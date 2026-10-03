import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("TextEditor - abas e cor em pt-BR", () => {
  it("as abas de modo têm nome em português", () => {
    render(<TextEditor availableModes={["rich", "markdown"]} />);
    expect(screen.getByRole("tab", { name: "Visual" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Markdown" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Prévia" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Rich|Preview/ })).not.toBeInTheDocument();
  });

  it("o botão de cor tem nome e as amostras são nomeadas, sem crescer no hover", async () => {
    render(<TextEditor availableModes={["rich"]} />);
    await userEvent.click(screen.getByRole("button", { name: "Cor do texto" }));
    const blue = await screen.findByRole("button", { name: "Azul" });
    expect(blue.className).not.toMatch(/scale/);
    const remove = screen.getByRole("button", { name: "Remover cor" });
    expect(remove).not.toHaveTextContent("✕");
  });
});
