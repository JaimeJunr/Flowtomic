import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./loader";

describe("Loader", () => {
  it("anuncia o carregamento em português, sem o título em inglês do svg", () => {
    const { container } = render(<Loader />);
    expect(screen.getByRole("status", { name: "Carregando" })).toBeInTheDocument();
    expect(container.querySelector("title")).toBeNull();
  });

  it("quem usa pode dar um nome mais específico e mudar o tamanho", () => {
    const { container } = render(<Loader aria-label="Buscando componentes" size={24} />);
    expect(screen.getByRole("status", { name: "Buscando componentes" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
  });
});
