import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../atoms";
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
          <CardTitle>Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <p>63 atoms, 47 molecules, 30 organisms e 14 hooks publicados.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithTitle: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Publicações no npm">
      <Card>
        <CardHeader>
          <CardTitle>@flowtomic/ui</CardTitle>
        </CardHeader>
        <CardContent>
          <p>1.240 downloads nos últimos 7 dias.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithTitleAndSubtitle: Story = {
  render: (args) => (
    <DashboardLayout
      {...args}
      title="Publicações no npm"
      subtitle="@flowtomic/ui, @flowtomic/logic e flowtomic-cli"
    >
      <Card>
        <CardHeader>
          <CardTitle>Build do registry</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Último build: 38s, sem falhas.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <DashboardLayout
      {...args}
      title="Publicações no npm"
      subtitle="Gerencie as versões publicadas de cada pacote"
      actions={
        <>
          <Button variant="outline">Exportar CSV</Button>
          <Button>Nova release</Button>
        </>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>@flowtomic/logic</CardTitle>
        </CardHeader>
        <CardContent>
          <p>812 downloads nos últimos 7 dias.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const SmallMaxWidth: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="flowtomic-cli" maxWidth="sm">
      <Card>
        <CardHeader>
          <CardTitle>Última versão</CardTitle>
        </CardHeader>
        <CardContent>
          <p>305 downloads nos últimos 7 dias.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};

export const FullWidth: Story = {
  render: (args) => (
    <DashboardLayout {...args} title="Registry" maxWidth="full">
      <Card>
        <CardHeader>
          <CardTitle>Todos os pacotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Visão em largura total, para comparar as três publicações lado a lado.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  ),
};
