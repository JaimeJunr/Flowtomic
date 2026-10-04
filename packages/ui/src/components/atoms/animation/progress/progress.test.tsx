import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";

function preenchimento(): HTMLElement {
  return screen.getByRole("progressbar").firstElementChild as HTMLElement;
}

describe("Progress", () => {
  it("expõe o valor atual e os limites para leitores de tela", () => {
    render(<Progress value={40} aria-label="Upload" />);
    const barra = screen.getByRole("progressbar", { name: "Upload" });
    expect(barra).toHaveAttribute("aria-valuenow", "40");
    expect(barra).toHaveAttribute("aria-valuemin", "0");
    expect(barra).toHaveAttribute("aria-valuemax", "100");
  });

  it("desloca o preenchimento proporcionalmente ao valor", () => {
    render(<Progress value={25} aria-label="Upload" />);
    expect(preenchimento()).toHaveStyle({ transform: "translateX(-75%)" });
  });

  it("sem valor começa vazia", () => {
    render(<Progress aria-label="Upload" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(preenchimento()).toHaveStyle({ transform: "translateX(-100%)" });
  });

  it("calcula a porcentagem a partir do máximo informado", () => {
    render(<Progress value={5} max={10} aria-label="Etapas" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "10");
    expect(preenchimento()).toHaveStyle({ transform: "translateX(-50%)" });
  });

  it("não passa de 100% quando o valor excede o máximo", () => {
    render(<Progress value={250} aria-label="Upload" />);
    expect(preenchimento()).toHaveStyle({ transform: "translateX(-0%)" });
  });

  it("não fica abaixo de 0% com valor negativo", () => {
    render(<Progress value={-30} aria-label="Upload" />);
    expect(preenchimento()).toHaveStyle({ transform: "translateX(-100%)" });
  });

  it("aceita className extra sem perder o estilo base", () => {
    render(<Progress value={10} className="h-4" aria-label="Upload" />);
    expect(screen.getByRole("progressbar")).toHaveClass("h-4", "rounded-full");
  });
});
