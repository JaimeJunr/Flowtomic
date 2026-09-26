import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentEditor } from "./document-editor";

describe("DocumentEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 14, 5, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra o horário da última edição em pt-BR (24h, sem AM/PM)", () => {
    render(<DocumentEditor />);
    expect(screen.getByText("Última edição: 14:05:09")).toBeInTheDocument();
  });

  it("não usa o formato en-US (com AM/PM) para a última edição", () => {
    render(<DocumentEditor />);
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });
});
