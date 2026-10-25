import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureTabs, type FeatureTabsProps } from "./feature-tabs";

const meta = {
  title: "Flowtomic UI/Organisms/FeatureTabs",
  component: FeatureTabs,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seção de recursos em abas do Radix. No contêiner largo (768 px ou mais) a lista fica na vertical, com uma régua fina e um trecho em `primary` na aba ativa; no estreito vira uma faixa horizontal rolável. Todos os painéis ficam montados e empilhados na mesma célula, então a seção mede o maior painel e não pula ao trocar de aba. `syncHash` grava `#<id>` da aba ativa sem empilhar histórico e abre a aba apontada pelo hash ao montar; `media` ganha uma segunda coluna a partir de 1024 px de contêiner.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
    syncHash: { control: "boolean" },
  },
} satisfies Meta<typeof FeatureTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const repo = "https://github.com/JaimeJunr/Flowtomic/tree/main/docs";

const tabs: FeatureTabsProps["tabs"] = [
  {
    id: "cli",
    label: "CLI",
    heading: "Copie só o que você usa",
    description:
      "O flowtomic-cli copia os arquivos do componente para o seu projeto e ajusta os imports para os seus aliases.",
    points: [
      "Comandos: init, add, add-block e list.",
      "Compatível com o shadcn CLI por meio do registry.",
      "Roda com bunx, sem instalar nada global.",
    ],
    link: { href: `${repo}/cli` },
  },
  {
    id: "pacote",
    label: "Pacote npm",
    heading: "Tudo em um pacote tipado",
    description: "O @flowtomic/ui entrega os componentes compilados, com os tipos exportados.",
    points: [
      "React 19 é obrigatório: ref é prop normal, sem forwardRef.",
      "Publicado pelo GitHub Actions, com proveniência.",
    ],
    link: { href: `${repo}/packages` },
  },
  {
    id: "hooks",
    label: "Hooks headless",
    heading: "Lógica sem interface atrelada",
    description: "O @flowtomic/logic guarda os hooks reutilizáveis, sem nenhuma dependência de UI.",
    points: [
      "Só React, zustand e dependências específicas, como o TanStack Table.",
      "Cada hook tem uma story com um componente de demonstração.",
    ],
    link: { href: `${repo}/componentes` },
  },
  {
    id: "tema",
    label: "Tema por tokens",
    heading: "Troque a marca em uma variável",
    description:
      "Os componentes só usam tokens semânticos, então um ajuste no tema chega em todos.",
    points: [
      "Variáveis CSS como --primary e --foreground.",
      "Importe globals.css, theme.css e typography.css, nessa ordem.",
      "Tailwind CSS v4 com @tailwindcss/postcss.",
    ],
    link: { href: `${repo}/packages` },
  },
  {
    id: "blocks",
    label: "Blocks",
    heading: "Telas prontas para adaptar",
    description: "Os blocks juntam organisms em telas inteiras que você instala com add-block.",
    points: [
      "Dashboard, painel de desenvolvedor e outros modelos.",
      "Cada block é só código seu depois de instalado.",
    ],
    link: { href: `${repo}/componentes` },
  },
];

const base = {
  title: "Cinco jeitos de usar o Flowtomic",
  description: "Do comando que copia um componente ao tema que muda a marca inteira.",
  tabs,
} satisfies FeatureTabsProps;

export const Default: Story = { args: base };

export const ComMidia: Story = {
  args: {
    ...base,
    tabs: tabs.map((tab) =>
      tab.id === "cli"
        ? {
            ...tab,
            media: (
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted p-4 font-mono text-sm text-foreground">
                <code>bunx flowtomic-cli add button</code>
              </pre>
            ),
          }
        : tab
    ),
  },
};

export const ComHash: Story = { args: { ...base, syncHash: true } };

export const Estreito: Story = {
  args: base,
  render: (args) => (
    <div className="w-[390px] max-w-full border border-dashed border-border">
      <FeatureTabs {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: base,
  render: (args) => (
    <div className="dark rounded-xl bg-background">
      <FeatureTabs {...args} />
    </div>
  ),
};
