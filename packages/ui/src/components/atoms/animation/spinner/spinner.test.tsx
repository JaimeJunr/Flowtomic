import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("anuncia o carregamento em português", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Carregando" })).toBeInTheDocument();
  });

  it("quem usa pode dar um nome mais específico", () => {
    render(<Spinner aria-label="Salvando" />);
    expect(screen.getByRole("status", { name: "Salvando" })).toBeInTheDocument();
  });
});
