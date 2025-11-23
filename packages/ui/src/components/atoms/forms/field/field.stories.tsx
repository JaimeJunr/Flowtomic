import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Input } from "../input/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email">E-mail</FieldLabel>
      <FieldDescription>Digite seu endereço de e-mail</FieldDescription>
      <Input id="email" type="email" placeholder="email@exemplo.com" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email-error">E-mail</FieldLabel>
      <FieldDescription>Digite seu endereço de e-mail</FieldDescription>
      <Input id="email-error" type="email" placeholder="email@exemplo.com" variant="error" />
      <FieldError>Este e-mail é inválido</FieldError>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="name-h">Nome</FieldLabel>
      <Input id="name-h" type="text" placeholder="Seu nome" />
    </Field>
  ),
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
