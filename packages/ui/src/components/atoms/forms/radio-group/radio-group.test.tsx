import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  describe("Renderização", () => {
    it("deve renderizar o RadioGroup", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
        </RadioGroup>
      );
      const radio = screen.getByRole("radiogroup");
      expect(radio).toBeInTheDocument();
    });

    it("deve renderizar múltiplos RadioGroupItems", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
          <RadioGroupItem value="option3" id="option3" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(3);
    });

    it("deve aplicar className customizada", () => {
      const { container } = render(
        <RadioGroup className="custom-class">
          <RadioGroupItem value="option1" id="option1" />
        </RadioGroup>
      );
      const radioGroup = container.querySelector('[data-slot="radio-group"]');
      expect(radioGroup).toHaveClass("custom-class");
    });
  });

  describe("Seleção", () => {
    it("deve permitir selecionar uma opção", async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[0]);
      await waitFor(() => {
        expect(radios[0]).toBeChecked();
        expect(radios[1]).not.toBeChecked();
      });
    });

    it("deve permitir apenas uma opção selecionada por vez", async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
          <RadioGroupItem value="option3" id="option3" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[0]);
      await user.click(radios[1]);
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
      expect(radios[2]).not.toBeChecked();
    });

    it("deve usar defaultValue quando fornecido", () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it("deve chamar onValueChange quando valor muda", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[1]);
      expect(handleChange).toHaveBeenCalledWith("option2");
    });
  });

  describe("Desabilitado", () => {
    it("deve desabilitar RadioGroupItem quando disabled", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" disabled />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).not.toBeDisabled();
    });

    it("não deve permitir selecionar opção desabilitada", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" id="option1" disabled />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[0]);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter role radiogroup", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
        </RadioGroup>
      );
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toBeInTheDocument();
    });

    it("deve ter role radio nos items", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option1" />
        </RadioGroup>
      );
      const radio = screen.getByRole("radio");
      expect(radio).toBeInTheDocument();
    });
  });
});
