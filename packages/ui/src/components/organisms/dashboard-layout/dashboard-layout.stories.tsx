import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/card/card";
import { DashboardLayout } from "./dashboard-layout";

const meta = {
  title: "Flowtomic UI/Organisms/DashboardLayout",
  component: DashboardLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "7xl", "full"],
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DashboardLayout {...args}>
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este é o conteúdo principal do dashboard.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithTitle: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Dashboard">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard com título.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithTitleAndSubtitle: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Dashboard" subtitle="Bem-vindo ao seu dashboard">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard com título e subtítulo.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <DashboardLayout
      {...args}
      title="Dashboard"
      subtitle="Gerencie seu dashboard"
      actions={
        <>
          <Button variant="outline">Exportar</Button>
          <Button>Criar Novo</Button>
        </>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard com ações no cabeçalho.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const SmallMaxWidth: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Dashboard" maxWidth="sm">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard com largura máxima pequena.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const FullWidth: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Dashboard" maxWidth="full">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard com largura total.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};
