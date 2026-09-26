import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Image } from "./image";

// PNG mínimo (8x8, quadriculado) gerado só para os testes.
const base64Fixture =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAGUlEQVR4nGN4kGP169sHTJIBqyiQZBiUOgAVAYzBALw4hgAAAABJRU5ErkJggg==";

describe("Image", () => {
  it("renderiza a imagem quando há dados base64", () => {
    render(<Image base64={base64Fixture} mediaType="image/png" alt="Xadrez" />);
    const img = screen.getByRole("img", { name: "Xadrez" });
    expect(img).toHaveAttribute("src", `data:image/png;base64,${base64Fixture}`);
  });

  it("mostra aviso em português quando falta o base64", () => {
    render(<Image mediaType="image/png" alt="Xadrez" />);
    expect(
      screen.getByText("Sem imagem: o componente precisa de dados em base64")
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
