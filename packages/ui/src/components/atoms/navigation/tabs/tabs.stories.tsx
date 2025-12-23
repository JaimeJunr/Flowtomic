import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Flowtomic UI/Atoms/Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `Componente de abas baseado em Radix UI com animações naturais e acessibilidade completa.

## Características

- **Indicador animado**: Indicador visual que segue suavemente a aba ativa
- **Transições suaves**: Animações de entrada/saída para o conteúdo das abas
- **Acessibilidade**: Suporte completo a navegação por teclado e leitores de tela
- **Modo controlado e não controlado**: Suporta ambos os padrões de gerenciamento de estado
- **Animações reduzidas**: Respeita preferências de movimento reduzido do usuário

## Quando usar

- Organizar conteúdo em seções relacionadas
- Navegação entre diferentes visualizações de dados
- Formulários com múltiplas seções
- Dashboards com diferentes métricas

## Estrutura do componente

O componente é composto por quatro partes principais:

- \`Tabs\`: Container raiz que gerencia o estado
- \`TabsList\`: Container para os botões de abas
- \`TabsTrigger\`: Botão individual de cada aba
- \`TabsContent\`: Conteúdo renderizado para cada aba

## Modo controlado vs não controlado

- **Não controlado**: Use \`defaultValue\` quando o estado interno do componente é suficiente
- **Controlado**: Use \`value\` e \`onValueChange\` quando precisar sincronizar com estado externo ou realizar ações quando a aba muda`,
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description:
        "Valor da aba que será ativa por padrão quando o componente é montado. Use este prop para modo não controlado (uncontrolled). O valor deve corresponder ao `value` de um `TabsTrigger`.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Estado",
      },
    },
    value: {
      control: "text",
      description:
        "Valor controlado da aba ativa. Use em conjunto com `onValueChange` para modo controlado. Quando fornecido, o componente se torna controlado e você é responsável por gerenciar o estado.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Estado",
      },
    },
    onValueChange: {
      action: "valueChanged",
      description:
        "Callback chamado sempre que o usuário muda a aba ativa. Recebe o novo valor como parâmetro. Use este callback para sincronizar o estado externo ou executar ações quando a aba muda.",
      table: {
        type: { summary: "(value: string) => void" },
        category: "Eventos",
      },
    },
    className: {
      control: "text",
      description:
        "Classes CSS adicionais para customização do componente. Use para ajustar espaçamento, largura ou outros aspectos visuais.",
      table: {
        type: { summary: "string" },
        category: "Estilização",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    defaultValue: "tab1",
    className: "w-[400px]",
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        <TabsTrigger value="tab3">Aba 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 1</p>
          <p className="text-xs text-muted-foreground mt-2">
            Use os controls para alterar o defaultValue e ver a aba inicial mudar.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 2</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 3</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Story interativa que permite testar o componente usando os controls do Storybook. Altere o `defaultValue` para ver diferentes abas sendo selecionadas inicialmente.",
      },
    },
  },
};

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 1</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 2</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Uso básico do componente Tabs com duas abas. Este é o exemplo mais simples e mostra a estrutura mínima necessária. O componente gerencia o estado internamente usando `defaultValue`.",
      },
    },
  },
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
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-lg font-semibold">Visão Geral</h3>
          <p className="text-sm text-muted-foreground">
            Obtenha uma visão de alto nível das métricas do seu negócio.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-lg font-semibold">Análises</h3>
          <p className="text-sm text-muted-foreground">
            Mergulhe profundamente nos seus dados com análises detalhadas.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-lg font-semibold">Relatórios</h3>
          <p className="text-sm text-muted-foreground">Gere e exporte relatórios personalizados.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo com três abas mostrando um caso de uso comum: dashboard com diferentes seções. Observe como o indicador animado se adapta automaticamente ao tamanho de cada aba.",
      },
    },
  },
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        <TabsTrigger value="tab3">Aba 3</TabsTrigger>
        <TabsTrigger value="tab4">Aba 4</TabsTrigger>
        <TabsTrigger value="tab5">Aba 5</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 1</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 2</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 3</p>
        </div>
      </TabsContent>
      <TabsContent value="tab4">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 4</p>
        </div>
      </TabsContent>
      <TabsContent value="tab5">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Conteúdo da aba 5</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o comportamento com múltiplas abas e o indicador animado se adaptando a diferentes larguras.",
      },
    },
  },
};

export const Controlled: Story = {
  args: {
    className: "w-[600px]",
  },
  render: (args) => {
    const [value, setValue] = useState("general");
    return (
      <Tabs {...args} value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            <div className="space-y-2">
              <label htmlFor="display-name" className="text-sm font-medium">
                Nome de Exibição
              </label>
              <input
                id="display-name"
                type="text"
                defaultValue="João Silva"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Aba ativa: <strong>{value}</strong>
            </p>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Senha Atual
              </label>
              <input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Aba ativa: <strong>{value}</strong>
            </p>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
            <p className="text-sm text-muted-foreground">Gerencie como você recebe notificações.</p>
            <p className="text-xs text-muted-foreground">
              Aba ativa: <strong>{value}</strong>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Exemplo de uso controlado com estado externo usando React hooks.

**Quando usar modo controlado:**
- Quando você precisa sincronizar a aba ativa com estado externo
- Quando precisa executar ações quando a aba muda (ex: salvar dados, fazer requisições)
- Quando a aba ativa é determinada por lógica externa (ex: URL, localStorage)

**Como funciona:**
1. O estado é gerenciado externamente com \`useState\`
2. O componente recebe \`value\` e \`onValueChange\`
3. Cada mudança de aba atualiza o estado externo
4. O callback \`onValueChange\` é registrado na aba de Actions do Storybook para debug

**Dica:** Use este padrão quando precisar de controle total sobre o estado das abas.`,
      },
    },
  },
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
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Configurações Gerais</h3>
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Nome de Exibição
            </label>
            <input
              id="display-name"
              type="text"
              defaultValue="João Silva"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">
              Senha Atual
            </label>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
          <p className="text-sm text-muted-foreground">Gerencie como você recebe notificações.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: `Exemplo prático de uso em formulários com múltiplas seções.

**Casos de uso:**
- Formulários de configuração com muitas opções
- Perfis de usuário com diferentes categorias
- Wizards multi-etapa (quando combinado com navegação programática)

**Vantagens:**
- Organiza campos relacionados em grupos lógicos
- Reduz sobrecarga visual
- Melhora a experiência do usuário em formulários longos

**Nota:** Este exemplo usa modo não controlado (\`defaultValue\`). Para formulários complexos, considere usar modo controlado para sincronizar com o estado do formulário.`,
      },
    },
  },
};

export const WithRichContent: Story = {
  render: () => (
    <Tabs defaultValue="dashboard" className="w-[700px]">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Dashboard</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">Vendas</p>
              <p className="text-2xl font-bold">R$ 12.450</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">Usuários</p>
              <p className="text-2xl font-bold">1.234</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">Crescimento</p>
              <p className="text-2xl font-bold">+12%</p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Analytics</h3>
          <div className="h-48 rounded-md border bg-muted/50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Gráfico de analytics aqui</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Configurações</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificações por email</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Modo escuro</span>
              <input type="checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Idioma</span>
              <select className="rounded-md border px-2 py-1 text-sm">
                <option>Português</option>
                <option>English</option>
                <option>Español</option>
              </select>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra o uso com conteúdo rico e complexo em cada aba, incluindo cards, gráficos e formulários.",
      },
    },
  },
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="active">Ativa</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Desabilitada
        </TabsTrigger>
        <TabsTrigger value="another">Outra</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Esta aba está ativa e funcional.</p>
        </div>
      </TabsContent>
      <TabsContent value="disabled">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Esta aba está desabilitada.</p>
        </div>
      </TabsContent>
      <TabsContent value="another">
        <div className="rounded-lg border p-4">
          <p className="text-sm">Outra aba funcional.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: `Demonstra o comportamento quando uma aba está desabilitada usando a prop \`disabled\` no \`TabsTrigger\`.

**Quando desabilitar abas:**
- Quando o conteúdo da aba não está disponível
- Quando o usuário não tem permissão para acessar determinada seção
- Durante estados de loading ou processamento
- Para indicar funcionalidades em desenvolvimento

**Comportamento:**
- A aba desabilitada não pode ser clicada
- Tem aparência visual diferente (opacidade reduzida)
- Não recebe foco via teclado
- O conteúdo da aba ainda pode ser renderizado, mas não é acessível via navegação

**Acessibilidade:** O componente automaticamente adiciona atributos ARIA apropriados para indicar o estado desabilitado.`,
      },
    },
  },
};
