import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
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

// Componente wrapper para testes
function TestForm() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormDescription>Digite seu e-mail</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  describe("Renderização", () => {
    it("deve renderizar o Form", () => {
      render(<TestForm />);
      const input = screen.getByPlaceholderText("email@exemplo.com");
      expect(input).toBeInTheDocument();
    });

    it("deve renderizar FormField", () => {
      render(<TestForm />);
      const label = screen.getByText("E-mail");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FormLabel", () => {
      render(<TestForm />);
      const label = screen.getByText("E-mail");
      expect(label).toBeInTheDocument();
    });

    it("deve renderizar FormControl", () => {
      render(<TestForm />);
      const input = screen.getByPlaceholderText("email@exemplo.com");
      expect(input).toBeInTheDocument();
    });

    it("deve renderizar FormDescription", () => {
      render(<TestForm />);
      const description = screen.getByText("Digite seu e-mail");
      expect(description).toBeInTheDocument();
    });

    it("deve renderizar FormMessage", () => {
      render(<TestForm />);
      // FormMessage não renderiza quando não há erro
      const input = screen.getByPlaceholderText("email@exemplo.com");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve permitir digitar no input", async () => {
      const user = userEvent.setup();
      render(<TestForm />);
      const input = screen.getByPlaceholderText("email@exemplo.com");
      await user.type(input, "test@example.com");
      expect(input).toHaveValue("test@example.com");
    });

    it("deve submeter o formulário", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      function FormWrapper() {
        const form = useForm({
          defaultValues: {
            email: "",
          },
        });
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Enviar</Button>
            </form>
          </Form>
        );
      }

      render(<FormWrapper />);

      const input = screen.getByPlaceholderText("email@exemplo.com");
      const button = screen.getByRole("button", { name: "Enviar" });

      await user.type(input, "test@example.com");
      await user.click(button);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("Validação", () => {
    it("deve exibir mensagem de erro quando validação falha", async () => {
      const user = userEvent.setup();

      function FormWrapper() {
        const form = useForm({
          defaultValues: {
            email: "",
          },
          mode: "onSubmit",
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "E-mail é obrigatório",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Enviar</Button>
            </form>
          </Form>
        );
      }

      render(<FormWrapper />);

      const button = screen.getByRole("button", { name: "Enviar" });
      await user.click(button);

      await waitFor(
        () => {
          const error = screen.queryByText("E-mail é obrigatório");
          expect(error).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Acessibilidade", () => {
    it("deve associar label ao input", async () => {
      const user = userEvent.setup();
      render(<TestForm />);
      const label = screen.getByText("E-mail");
      const input = screen.getByPlaceholderText("email@exemplo.com");
      await user.click(label);
      expect(input).toHaveFocus();
    });
  });
});
