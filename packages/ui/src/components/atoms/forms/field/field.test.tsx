import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { Input } from "../input/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

describe("Field", () => {
  describe("Renderização", () => {
    it("deve renderizar o Field", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Teste</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const label = screen.getByText("Teste");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FieldLabel", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
        </Field>
      );
      const label = screen.getByText("Label");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FieldDescription", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldDescription>Descrição do campo</FieldDescription>
        </Field>
      );
      const description = screen.getByText("Descrição do campo");
      expect(description).toBeInTheDocument();
    });

    it("deve renderizar FieldError", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldError>Erro no campo</FieldError>
        </Field>
      );
      const error = screen.getByText("Erro no campo");
      expect(error).toBeInTheDocument();
    });
  });

  describe("Associação Label-Input", () => {
    it("deve associar label ao input via htmlFor", async () => {
      const user = userEvent.setup();
      render(
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" placeholder="email@exemplo.com" />
        </Field>
      );
      const label = screen.getByText("E-mail");
      const input = screen.getByPlaceholderText("email@exemplo.com");
      await user.click(label);
      expect(input).toHaveFocus();
    });
  });

  describe("Orientação", () => {
    it("deve renderizar com orientação vertical por padrão", () => {
      const { container } = render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
    });

    it("deve renderizar com orientação horizontal", () => {
      const { container } = render(
        <Field orientation="horizontal">
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <Input id="test" />
        </Field>
      );
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura semântica correta", () => {
      render(
        <Field>
          <FieldLabel htmlFor="test">Label</FieldLabel>
          <FieldDescription>Descrição</FieldDescription>
          <Input id="test" />
          <FieldError>Erro</FieldError>
        </Field>
      );
      const label = screen.getByText("Label");
      const input = screen.getByLabelText("Label");
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});
