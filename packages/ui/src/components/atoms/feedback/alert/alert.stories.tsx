import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CheckCircle2, Info as InfoIcon, TriangleAlert } from "lucide-react";
import React from "react";
import { expect, within } from "storybook/test";
import { Alert, AlertDescription, AlertTitle } from "./alert";

/**
 * Stories do componente Alert.
 *
 * O Alert é usado para exibir mensagens importantes ao usuário,
 * como avisos, erros, sucessos ou informações. Fornece feedback visual claro
 * através de variantes semânticas.
 *
 * @see [Alert Component](../alert.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de alerta para exibir mensagens importantes. Suporta variantes: default, destructive, success, warning, info. Use para feedback visual claro ao usuário.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning", "info"],
      description: "Variante visual do alert",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Alert.
 * Demonstra o uso básico com título e descrição.
 */
export const Default: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>Mensagem de alerta</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const title = canvas.getByText("Atenção");
    const description = canvas.getByText("Mensagem de alerta");

    await expect(alert).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Alert com variante destructive.
 * Usado para erros e ações destrutivas.
 */
export const Destructive: Story = {
  render: (args) => (
    <Alert {...args} variant="destructive" className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>Sua sessão expirou. Por favor, faça login novamente.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const title = canvas.getByText("Erro");
    await expect(alert).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Alert com variante success.
 * Usado para mensagens de sucesso e confirmações.
 */
export const Success: Story = {
  render: (args) => (
    <Alert {...args} variant="success" className="w-[400px]">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Sucesso</AlertTitle>
      <AlertDescription>Suas alterações foram salvas com sucesso.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const title = canvas.getByText("Sucesso");
    await expect(alert).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Alert com variante warning.
 * Usado para avisos e alertas importantes.
 */
export const Warning: Story = {
  render: (args) => (
    <Alert {...args} variant="warning" className="w-[400px]">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>Aviso</AlertTitle>
      <AlertDescription>
        Sua conta expirará em 3 dias. Por favor, renove sua assinatura.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const title = canvas.getByText("Aviso");
    await expect(alert).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Alert com variante info.
 * Usado para informações gerais e notícias.
 */
export const Info: Story = {
  render: (args) => (
    <Alert {...args} variant="info" className="w-[400px]">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Informação</AlertTitle>
      <AlertDescription>
        Novos recursos estão disponíveis. Confira as últimas atualizações.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const title = canvas.getByText("Informação");
    await expect(alert).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Alert sem título.
 * O alert pode ser usado apenas com descrição quando o título não é necessário.
 */
export const WithoutTitle: Story = {
  render: (args) => (
    <Alert {...args} className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Você pode adicionar componentes ao seu app usando o cli.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const description = canvas.getByText(
      "Você pode adicionar componentes ao seu app usando o cli."
    );
    await expect(alert).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
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
