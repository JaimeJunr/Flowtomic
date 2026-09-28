import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimeTracker } from "./time-tracker";

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("TimeTracker", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("usa 'Tempo' como título padrão", () => {
    render(<TimeTracker />);
    expect(screen.getByRole("heading", { name: "Tempo" })).toBeInTheDocument();
  });

  it("parado: mostra o estado e só o botão Iniciar", () => {
    render(<TimeTracker />);
    expect(screen.getByText("Parado")).toBeInTheDocument();
    expect(screen.getByText("00:00:00")).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Iniciar"]);
  });

  it("contando: Pausar no lugar do Iniciar, e Parar contornado, não vermelho", () => {
    render(<TimeTracker />);
    click("Iniciar");
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("Contando")).toBeInTheDocument();
    expect(screen.getByText("00:00:03")).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Pausar", "Parar"]);
    expect(screen.getByRole("button", { name: "Parar" }).className).not.toMatch(/destructive/);
  });

  it("pausado: Retomar no mesmo lugar e o tempo congela", () => {
    render(<TimeTracker />);
    click("Iniciar");
    act(() => vi.advanceTimersByTime(2000));
    click("Pausar");
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("Pausado")).toBeInTheDocument();
    expect(screen.getByText("00:00:02")).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Retomar", "Parar"]);
  });

  it("Parar volta para parado", () => {
    render(<TimeTracker />);
    click("Iniciar");
    click("Parar");
    expect(screen.getByText("Parado")).toBeInTheDocument();
  });
});
