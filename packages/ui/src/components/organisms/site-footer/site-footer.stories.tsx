import type { Meta, StoryObj } from "@storybook/react-vite";
import { Github } from "lucide-react";
import { SiteFooter, SiteFooterNewsletter, type SiteFooterProps } from "./site-footer";

const meta = {
  title: "Flowtomic UI/Organisms/SiteFooter",
  component: SiteFooter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Rodapé de página de produto: coluna de marca (logo, frase, redes), de quatro a seis colunas de links com título (cada uma é uma `nav` nomeada), faixa opcional (`band`) e linha final com copyright e links legais. Link pode ter selo e ícone de saída. A grade responde ao contêiner: abaixo de 640 px a marca fica em cima e as colunas em 2 por linha; entre 640 e 1024 px, até 4 colunas; a partir de 1024 px tudo numa linha. `SiteFooterNewsletter` é uma faixa pronta para o slot `band`, com estados de envio.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    contained: { control: "boolean" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns: SiteFooterProps["columns"] = [
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
      { label: "Vagas", href: "#vagas", badge: "3" },
    ],
  },
];

const base = {
  brand: {
    logo: <span className="text-lg font-semibold tracking-tight">flowtomic</span>,
    href: "#",
    tagline: "Componentes React para produto, em português.",
  },
  social: (
    <a
      href="https://github.com"
      aria-label="GitHub"
      className="inline-flex size-8 items-center justify-center rounded-md hover:text-foreground"
    >
      <Github className="size-4" />
    </a>
  ),
  columns,
  copyright: "Copyright 2026 Flowtomic",
  legal: [
    { label: "Privacidade", href: "#privacidade" },
    { label: "Termos", href: "#termos" },
  ],
} satisfies SiteFooterProps;

const newsletter = (
  <SiteFooterNewsletter
    title="Novidades da biblioteca"
    description="Um e-mail por mês com o que entrou e o que mudou."
    finePrint="Você pode sair a qualquer momento."
    onSubmit={async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }}
  />
);

export const Default: Story = { args: base };

export const ComNewsletter: Story = { args: { ...base, band: newsletter } };

export const ComApoio: Story = {
  args: {
    ...base,
    band: (
      <p className="text-sm text-muted-foreground">
        Apoiado por quem usa a biblioteca em produção. Veja a lista no GitHub.
      </p>
    ),
  },
};

export const NewsletterComErro: Story = {
  args: {
    ...base,
    band: (
      <SiteFooterNewsletter
        title="Novidades da biblioteca"
        description="Digite qualquer e-mail para ver o estado de erro."
        onSubmit={async () => {
          await new Promise((_, reject) => setTimeout(() => reject(new Error("falhou")), 400));
        }}
      />
    ),
  },
};

export const Estreito: Story = {
  args: { ...base, band: newsletter },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[390px] border-x">
        <Story />
      </div>
    ),
  ],
};

export const SemMarca: Story = {
  args: { columns, copyright: base.copyright, legal: base.legal },
};
