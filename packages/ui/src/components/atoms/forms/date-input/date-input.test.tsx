import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DateInput } from "./date-input";

describe("DateInput", () => {
  describe("Renderização", () => {
    it("renderiza input type date", () => {
      const { container } = render(<DateInput />);
      const input = container.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });

    it("aplica valor controlado", () => {
      const { container } = render(<DateInput value="2025-03-04" onChange={() => {}} />);
      const input = container.querySelector('input[type="date"]');
      expect(input).toHaveValue("2025-03-04");
    });

    it("aplica className customizada", () => {
      const { container } = render(<DateInput className="minha-classe" />);
      const input = container.querySelector('input[type="date"]');
      expect(input).toHaveClass("minha-classe");
    });

    it("aplica id e aria-label", () => {
      render(<DateInput id="data-nascimento" aria-label="Data de nascimento" />);
      const input = document.getElementById("data-nascimento");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-label", "Data de nascimento");
    });
  });

  describe("Interação", () => {
    it("permite alterar valor", async () => {
      render(<DateInput defaultValue="2025-01-01" />);
      const input = document.querySelector('input[type="date"]') as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, "2025-06-15");
      expect(input.value).toBe("2025-06-15");
    });

    it("respeita disabled (overlay bloqueia interação, ícone permanece visível)", () => {
      const { container } = render(<DateInput disabled value="2025-03-04" />);
      const input = container.querySelector('input[type="date"]');
      const wrapper = container.querySelector("span.relative");
      expect(input).toHaveAttribute("aria-disabled", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
      expect(wrapper?.querySelector("span[aria-hidden]")).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Acessibilidade", () => {
    it("pode ser referenciado por label externa via id", () => {
      render(
        <>
          <label htmlFor="campo-data">Data</label>
          <DateInput id="campo-data" />
        </>
      );
      const input = screen.getByLabelText("Data");
      expect(input).toHaveAttribute("type", "date");
    });
  });
});
