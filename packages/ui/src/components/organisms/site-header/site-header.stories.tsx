import type { Meta, StoryObj } from "@storybook/react-vite";
import { Blocks, Github, Layers, Search, Shapes, Sparkles } from "lucide-react";
import { Kbd, KbdGroup } from "@/components/atoms/display/kbd";
import { AnnouncementBar } from "../announcement-bar";
import { SiteFooter, SiteFooterNewsletter } from "../site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";

const meta = {
  title: "Flowtomic UI/Organisms/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'Cabeçalho de página de produto: logo, navegação principal com painéis, busca, redes e ações (uma sólida), com sub-navegação opcional. Fica fixo no topo ao rolar. Abaixo de 768 px de contêiner (container query) a navegação some e um botão de menu abre um Sheet pela direita com tudo. O primeiro foco é o link "Pular para o conteúdo". A prop `layout` força o modo, útil em teste e em story de largura fixa.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center"] },
    layout: { control: "inline-radio", options: ["auto", "desktop", "mobile"] },
    sticky: { control: "boolean" },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const logo = <span className="text-lg font-semibold tracking-tight">flowtomic</span>;

const nav: NonNullable<SiteHeaderProps["nav"]> = [
  {
    label: "Componentes",
    columns: 2,
    items: [
      {
        label: "Atoms",
        href: "#atoms",
        description: "Botões, campos e outras peças pequenas.",
        icon: <Shapes />,
      },
      {
        label: "Molecules",
        href: "#molecules",
        description: "Peças pequenas combinadas com um propósito.",
        icon: <Layers />,
      },
      {
        label: "Organisms",
        href: "#organisms",
        description: "Seções inteiras: tabela de preços, rodapé.",
        icon: <Blocks />,
        badge: "Novo",
      },
      {
        label: "Blocks",
        href: "#blocks",
        description: "Telas prontas para copiar.",
        icon: <Sparkles />,
      },
    ],
  },
  { label: "Blocks", href: "#blocks", active: true },
  { label: "Docs", href: "https://example.com/docs", external: true },
  { label: "Changelog", href: "#changelog" },
];

const search = (
  <button
    type="button"
    className="flex h-8 w-56 items-center gap-2 rounded-md border bg-background px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Search className="size-4" aria-hidden="true" />
    <span className="flex-1 text-left">Buscar</span>
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  </button>
);

const social = (
  <a
    href="https://github.com"
    aria-label="GitHub"
    className="inline-flex size-8 items-center justify-center rounded-md hover:text-foreground"
  >
    <Github className="size-4" />
  </a>
);

const baseArgs = {
  logo,
  nav,
  search,
  social,
  actions: [
    { label: "GitHub", href: "https://github.com", variant: "outline" },
    { label: "Instalar", href: "#instalar", variant: "default" },
  ],
} satisfies SiteHeaderProps;

export const Default: Story = { args: baseArgs };

export const NavegacaoCentralizada: Story = { args: { ...baseArgs, align: "center" } };

export const ComSubNavegacao: Story = {
  args: {
    ...baseArgs,
    subnav: {
      title: "Gateway",
      items: [
        { label: "Visão geral", href: "#visao", active: true },
        { label: "Modelos", href: "#modelos" },
        { label: "Preços", href: "#precos" },
        { label: "Limites", href: "#limites" },
        { label: "Documentação", href: "https://example.com/docs", external: true },
      ],
    },
  },
};

export const Minimo: Story = {
  args: { logo, actions: [{ label: "Entrar", href: "#entrar", variant: "default" }] },
};

export const Estreito: Story = {
  args: {
    ...baseArgs,
    subnav: {
      title: "Gateway",
      items: [
        { label: "Visão geral", href: "#visao" },
        { label: "Modelos", href: "#modelos" },
        { label: "Preços", href: "#precos", active: true },
        { label: "Limites", href: "#limites" },
        { label: "Documentação", href: "#docs" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[390px] border-x">
        <Story />
        <p className="p-6 text-sm text-muted-foreground">
          Contêiner de 390 px: a navegação some e o menu abre pela direita.
        </p>
      </div>
    ),
  ],
};

export const PaginaCompleta: Story = {
  args: baseArgs,
  render: (args) => (
    <div className="min-h-screen bg-background">
      <SiteHeader {...args} />
      <AnnouncementBar
        icon={<Sparkles />}
        action={{ label: "Ler o changelog", href: "#changelog" }}
      >
        A 1.0 saiu: React 19 em todos os componentes.
      </AnnouncementBar>
      <main id="conteudo" className="mx-auto max-w-3xl space-y-4 px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Interfaces de produto, sem começar do zero
        </h1>
        <p className="text-lg text-muted-foreground">
          Copie os componentes para o seu projeto ou instale o pacote. Tudo usa os tokens do tema,
          então a marca entra por variáveis CSS.
        </p>
        <div className="h-[60vh]" />
      </main>
      <SiteFooter
        brand={{
          logo,
          href: "#",
          tagline: "Componentes React para produto, em português.",
        }}
        social={social}
        columns={[
          {
            title: "Biblioteca",
            links: [
              { label: "Atoms", href: "#atoms" },
              { label: "Molecules", href: "#molecules" },
              { label: "Organisms", href: "#organisms", badge: "Novo" },
              { label: "Blocks", href: "#blocks" },
            ],
          },
          {
            title: "Recursos",
            links: [
              { label: "Documentação", href: "https://example.com/docs", external: true },
              { label: "Changelog", href: "#changelog" },
              { label: "Storybook", href: "https://example.com/storybook", external: true },
            ],
          },
          {
            title: "Projeto",
            links: [
              { label: "GitHub", href: "https://github.com", external: true },
              { label: "Contribuir", href: "#contribuir" },
              { label: "Licença", href: "#licenca" },
            ],
          },
        ]}
        band={
          <SiteFooterNewsletter
            title="Novidades da biblioteca"
            description="Um e-mail por mês com o que entrou e o que mudou."
            finePrint="Você pode sair a qualquer momento."
            onSubmit={async () => {
              await new Promise((resolve) => setTimeout(resolve, 600));
            }}
          />
        }
        copyright="Copyright 2026 Flowtomic"
        legal={[
          { label: "Privacidade", href: "#privacidade" },
          { label: "Termos", href: "#termos" },
        ]}
      />
    </div>
  ),
};
