import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CheckCircle2, Info as InfoIcon, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning", "info"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>Mensagem de alerta</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Alert {...args} variant="destructive" className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>Sua sessão expirou. Por favor, faça login novamente.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: (args) => (
    <Alert {...args} variant="success" className="w-[400px]">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Sucesso</AlertTitle>
      <AlertDescription>Suas alterações foram salvas com sucesso.</AlertDescription>
    </Alert>
  ),
};

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
};

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
};

export const WithoutTitle: Story = {
  render: (args) => (
    <Alert {...args} className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Você pode adicionar componentes ao seu app usando o cli.</AlertDescription>
    </Alert>
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
