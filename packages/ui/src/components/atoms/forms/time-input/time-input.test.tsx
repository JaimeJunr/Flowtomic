import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TimeInput } from "./time-input";

describe("TimeInput", () => {
  describe("Renderização", () => {
    it("renderiza input type time", () => {
      const { container } = render(<TimeInput />);
      const input = container.querySelector('input[type="time"]');
      expect(input).toBeInTheDocument();
    });

    it("aplica valor controlado", () => {
      const { container } = render(<TimeInput value="14:30" onChange={() => {}} />);
      const input = container.querySelector('input[type="time"]');
      expect(input).toHaveValue("14:30");
    });

    it("aplica className customizada", () => {
      const { container } = render(<TimeInput className="minha-classe" />);
      const input = container.querySelector('input[type="time"]');
      expect(input).toHaveClass("minha-classe");
    });

    it("aplica id e aria-label", () => {
      render(<TimeInput id="hora-inicio" aria-label="Hora de início" />);
      const input = document.getElementById("hora-inicio");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-label", "Hora de início");
    });
  });

  describe("Interação", () => {
    it("permite alterar valor", async () => {
      render(<TimeInput defaultValue="09:00" />);
      const input = document.querySelector('input[type="time"]') as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, "17:45");
      expect(input.value).toBe("17:45");
    });

    it("respeita disabled (overlay bloqueia interação, ícone permanece visível)", () => {
      const { container } = render(<TimeInput disabled value="14:30" />);
      const input = container.querySelector('input[type="time"]');
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
          <label htmlFor="campo-hora">Hora</label>
          <TimeInput id="campo-hora" />
        </>
      );
      const input = screen.getByLabelText("Hora");
      expect(input).toHaveAttribute("type", "time");
    });
  });
});
