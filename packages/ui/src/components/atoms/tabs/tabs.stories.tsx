import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Flowtomic UI/Atoms/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Conta</h3>
          <p className="text-sm text-muted-foreground">
            Faça alterações na sua conta aqui. Clique em salvar quando terminar.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Senha</h3>
          <p className="text-sm text-muted-foreground">
            Altere sua senha aqui. Após salvar, você será desconectado.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="analytics">Análises</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Visão Geral</h3>
          <p className="text-sm text-muted-foreground">
            Obtenha uma visão de alto nível das métricas do seu negócio.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Análises</h3>
          <p className="text-sm text-muted-foreground">
            Mergulhe profundamente nos seus dados com análises detalhadas.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Relatórios</h3>
          <p className="text-sm text-muted-foreground">Gere e exporte relatórios personalizados.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="security">Segurança</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurações Gerais</h3>
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Nome de Exibição
            </label>
            <input
              id="display-name"
              type="text"
              defaultValue="João Silva"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">
              Senha Atual
            </label>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
          <p className="text-sm text-muted-foreground">Gerencie como você recebe notificações.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
