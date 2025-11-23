import type { Meta, StoryObj } from "@storybook/react-vite";
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

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Form",
  component: Form,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

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
};

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
