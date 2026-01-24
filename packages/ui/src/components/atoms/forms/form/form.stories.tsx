import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../actions/button/button";
import { Input } from "../input/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

/**
 * Stories do componente Form.
 *
 * O Form é um sistema de composição para formulários baseado em React Hook Form.
 * Fornece integração completa com validação, gerenciamento de estado e acessibilidade.
 *
 * @see [Form Component](../form.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Form",
  component: Form,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Sistema de composição para formulários baseado em React Hook Form. Fornece integração completa com validação e gerenciamento de estado.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Form.
 * Demonstra o uso básico com um campo de e-mail.
 */
export const Default: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        email: "",
      },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-4 w-96">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormDescription>Digite seu endereço de e-mail</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Enviar</Button>
        </form>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("email@exemplo.com");
    const label = canvas.getByText("E-mail");
    const button = canvas.getByRole("button", { name: "Enviar" });

    await expect(input).toBeInTheDocument();
    await expect(label).toBeInTheDocument();
    await expect(button).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Form com validação.
 * O formulário valida o e-mail e exibe mensagens de erro quando necessário.
 */
export const WithValidation: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        email: "",
      },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-4 w-96">
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "E-mail inválido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormDescription>Digite um e-mail válido</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Enviar</Button>
        </form>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("email@exemplo.com");
    const button = canvas.getByRole("button", { name: "Enviar" });

    await expect(input).toBeInTheDocument();
    await expect(button).toBeInTheDocument();

    // Testa validação: tenta submeter sem preencher
    await userEvent.click(button);
    // Aguarda um pouco para a validação aparecer
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
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
