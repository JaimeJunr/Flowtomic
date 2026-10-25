import type { ReactNode } from "react";
import { Button } from "@/components/atoms/actions/button";
import type { EnvDiffLine } from "@/components/atoms/code/env-diff";
import { EnvDiff } from "@/components/atoms/code/env-diff";
import type { CodeTabsAxis, CodeTabsSnippet } from "@/components/molecules/code/code-tabs";
import { CodeTabs } from "@/components/molecules/code/code-tabs";
import type {
  ComparisonFeature,
  ComparisonOption,
} from "@/components/molecules/data-display/comparison-table";
import { ComparisonTable } from "@/components/molecules/data-display/comparison-table";
import type { DayMoment } from "@/components/molecules/data-display/day-timeline";
import { DayTimeline } from "@/components/molecules/data-display/day-timeline";
import type { Metric } from "@/components/molecules/data-display/metric-strip";
import { MetricStrip } from "@/components/molecules/data-display/metric-strip";
import type { StatusListItem } from "@/components/molecules/data-display/status-list";
import { StatusList } from "@/components/molecules/data-display/status-list";
import { AnnouncementBar } from "@/components/organisms/announcement-bar";
import type { FaqSectionProps } from "@/components/organisms/faq-section";
import { FaqSection } from "@/components/organisms/faq-section";
import type { SiteFooterProps } from "@/components/organisms/site-footer";
import { SiteFooter } from "@/components/organisms/site-footer";
import type { SiteHeaderProps } from "@/components/organisms/site-header";
import { SiteHeader } from "@/components/organisms/site-header";

const REPO = "https://github.com/JaimeJunr/Flowtomic";

export type ProductLandingContent = {
  announcement: { text: string; actionLabel: string; href: string };
  header: {
    brand: string;
    nav: NonNullable<SiteHeaderProps["nav"]>;
    action: { label: string; href: string };
  };
  hero: {
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
    metrics: Metric[];
  };
  install: {
    title: string;
    description: string;
    axes: CodeTabsAxis[];
    snippets: CodeTabsSnippet[];
  };
  swap: { title: string; description: string; lines: EnvDiffLine[] };
  comparison: {
    title: string;
    options: ComparisonOption[];
    features: ComparisonFeature[];
    highlight: string;
    highlightLabel: string;
  };
  day: { title: string; moments: DayMoment[] };
  numbers: { title: string; metrics: Metric[] };
  upcoming: {
    title: string;
    items: (Pick<StatusListItem, "id" | "name" | "status" | "statusLabel"> & {
      description: string;
    })[];
  };
  faq: {
    title: string;
    items: FaqSectionProps["items"];
    contact: NonNullable<FaqSectionProps["contact"]>;
  };
  footer: { brand: string; tagline: string; columns: SiteFooterProps["columns"] };
};

/** Todo o texto da página. Quem copia o block troca só este objeto. */
export const productLandingContent: ProductLandingContent = {
  announcement: {
    text: "Novas peças de página: tabela de comparação, FAQ e linha do tempo.",
    actionLabel: "Ver a documentação",
    href: `${REPO}/tree/main/docs/componentes`,
  },
  header: {
    brand: "Flowtomic",
    nav: [
      { label: "Componentes", href: `${REPO}/tree/main/docs/componentes`, external: true },
      { label: "Documentação", href: `${REPO}/tree/main/docs`, external: true },
      { label: "GitHub", href: REPO, external: true },
    ],
    action: { label: "Começar", href: "#instalacao" },
  },
  hero: {
    title: "Componentes que você copia, edita e entende",
    description:
      "O Flowtomic entrega o código de cada peça no seu repositório, com tokens de tema e acessibilidade já resolvidos.",
    primary: { label: "Começar", href: "#instalacao" },
    secondary: { label: "Ver no GitHub", href: REPO },
    metrics: [
      { id: "atoms", value: 155, label: "atoms" },
      { id: "molecules", value: 93, label: "molecules" },
      { id: "organisms", value: 39, label: "organisms" },
    ],
  },
  install: {
    title: "Instale do jeito que preferir",
    description:
      "O CLI copia o arquivo do componente para o seu projeto e ajusta os imports. Pelo npm, você importa do pacote.",
    axes: [
      {
        id: "via",
        label: "Forma de instalação",
        options: [
          { value: "cli", label: "flowtomic-cli" },
          { value: "npm", label: "npm" },
        ],
      },
    ],
    snippets: [
      { match: { via: "cli" }, language: "bash", code: "bunx flowtomic-cli add button" },
      {
        match: { via: "npm" },
        language: "bash",
        code: [
          "npm install @flowtomic/ui",
          "",
          "# no CSS de entrada, nesta ordem",
          '@import "@flowtomic/ui/styles/globals.css";',
          '@import "@flowtomic/ui/styles/theme.css";',
          '@import "@flowtomic/ui/styles/typography.css";',
        ].join("\n"),
      },
    ],
  },
  swap: {
    title: "Três bibliotecas viram uma",
    description:
      "No lugar de uma dependência por peça no package.json do app, fica o @flowtomic/ui. As primitivas do Radix vêm como dependências dele.",
    lines: [
      { type: "removed", name: "@radix-ui/react-dialog" },
      { type: "removed", name: "@radix-ui/react-tabs" },
      { type: "removed", name: "@radix-ui/react-tooltip" },
      { type: "added", name: "@flowtomic/ui" },
    ],
  },
  comparison: {
    title: "Onde o Flowtomic se encaixa",
    highlight: "flowtomic",
    highlightLabel: "Este projeto",
    options: [
      { id: "flowtomic", label: "Flowtomic" },
      { id: "scratch", label: "Escrever do zero" },
      { id: "closed", label: "Biblioteca fechada" },
    ],
    features: [
      {
        id: "code",
        label: "Código no seu repositório",
        values: { flowtomic: true, scratch: true, closed: false },
      },
      {
        id: "edit",
        label: "Edita sem fork",
        values: { flowtomic: true, scratch: true, closed: false },
      },
      {
        id: "a11y",
        label: "Acessível por padrão (Radix/Base UI)",
        values: { flowtomic: true, scratch: false, closed: "partial" },
      },
      {
        id: "tokens",
        label: "Tema por tokens",
        values: { flowtomic: true, scratch: false, closed: "partial" },
      },
      {
        id: "updates",
        label: "Atualização automática",
        description: "No Flowtomic, o código já copiado é seu e não muda sozinho.",
        values: { flowtomic: false, scratch: false, closed: true },
      },
    ],
  },
  day: {
    title: "O que muda no seu dia",
    moments: [
      {
        id: "fila",
        time: "08:30",
        eyebrow: "No trabalho",
        title: "Comece com a fila arrumada",
        description:
          "Os PRs chegam separados por risco, e o que bloqueia o resto aparece primeiro.",
        message: "Separei os PRs abertos por risco. Dois dependem de você hoje.",
      },
      {
        id: "revisao",
        time: "11:00",
        eyebrow: "No trabalho",
        title: "Revisão sem caça ao tesouro",
        description: "Os comentários vêm agrupados por arquivo, com o trecho ao lado de cada um.",
        message: "Agrupei 14 comentários em 5 arquivos e marquei os que já foram resolvidos.",
      },
      {
        id: "armadilha",
        time: "13:30",
        eyebrow: "No trabalho",
        title: "Uma armadilha a menos",
        description: "O que quebrou na CI vira uma linha no CLAUDE.md, para o próximo não repetir.",
        message: "Registrei no CLAUDE.md por que o type-check falhava sem o build do logic.",
      },
      {
        id: "build",
        time: "16:00",
        eyebrow: "No trabalho",
        title: "Build por pacote",
        description: "Só o que mudou é construído e testado, em série, sem travar a máquina.",
        message: "Rodei os testes só do pacote ui. 2171 passaram.",
      },
      {
        id: "changelog",
        time: "18:30",
        eyebrow: "No fim do dia",
        title: "Feche o dia com o changelog",
        description: "O rascunho já está pronto para revisar, com os PRs do dia em ordem.",
        message: "O rascunho do changelog está pronto. Falta só a sua leitura.",
      },
    ],
  },
  numbers: {
    title: "Testado antes de chegar a você",
    metrics: [
      {
        id: "tests",
        value: 2171,
        label: "testes no pacote ui",
        description: "Vitest, rodando a cada pull request.",
      },
      {
        id: "coverage",
        value: 96.9,
        suffix: "%",
        label: "cobertura de linhas",
        description: "Medida em 04/10/2026.",
        formatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      },
      {
        id: "files",
        value: 156,
        label: "arquivos de teste",
        description: "Um por componente, no mínimo.",
      },
    ],
  },
  upcoming: {
    title: "O que está chegando",
    items: [
      {
        id: "feature-tabs",
        name: "feature-tabs",
        status: "maintenance",
        statusLabel: "Planejado",
        description:
          "Abas verticais com régua, para apresentar recursos um de cada vez sem mudar a altura da seção na troca.",
      },
      {
        id: "process-steps",
        name: "process-steps",
        status: "maintenance",
        statusLabel: "Planejado",
        description:
          "Três a quatro passos numerados, com um mini-mock em cima e uma régua de ligação embaixo.",
      },
      {
        id: "docs-toc",
        name: "docs-toc",
        status: "degraded",
        statusLabel: "Em estudo",
        description:
          'Índice "Nesta página" que acompanha a rolagem. Em tela estreita, vira um botão que abre a lista.',
      },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        id: "shadcn",
        question: "Preciso do shadcn?",
        answer:
          "Não. O flowtomic-cli funciona sozinho. O registry no formato do shadcn existe no repositório, mas o caminho de hoje é o CLI ou o pacote do npm.",
      },
      {
        id: "react",
        question: "Funciona com React 18?",
        answer:
          "Não. A partir da 1.0 o React 19 é obrigatório: os componentes recebem ref como prop normal, sem forwardRef.",
      },
      {
        id: "atualizar",
        question: "Como atualizo um componente já copiado?",
        answer:
          "Não existe atualização automática: o código copiado é seu. Para trazer uma mudança, copie o componente de novo numa branch e compare com o que você editou pelo diff do Git.",
      },
      {
        id: "hooks",
        question: "Posso usar só os hooks?",
        answer:
          "Pode. O @flowtomic/logic tem hooks headless, sem markup nem estilo, e não depende do @flowtomic/ui.",
      },
    ],
    contact: {
      title: "Não achou a sua pergunta?",
      description: "Abra uma issue no GitHub. É lá que o projeto responde.",
      action: { label: "Abrir uma issue", href: `${REPO}/issues` },
    },
  },
  footer: {
    brand: "Flowtomic",
    tagline: "Componentes React que você copia para o seu repositório.",
    columns: [
      {
        title: "Produto",
        links: [
          { label: "Componentes", href: `${REPO}/tree/main/docs/componentes`, external: true },
          { label: "Blocks", href: `${REPO}/blob/main/docs/componentes/blocks.md`, external: true },
          { label: "CLI", href: `${REPO}/tree/main/docs/cli`, external: true },
        ],
      },
      {
        title: "Documentação",
        links: [
          { label: "Índice", href: `${REPO}/blob/main/docs/INDEX.md`, external: true },
          { label: "Pacote ui", href: `${REPO}/blob/main/docs/packages/ui.md`, external: true },
          {
            label: "Pacote logic",
            href: `${REPO}/blob/main/docs/packages/logic.md`,
            external: true,
          },
        ],
      },
      {
        title: "Projeto",
        links: [
          { label: "GitHub", href: REPO, external: true },
          { label: "Issues", href: `${REPO}/issues`, external: true },
          { label: "Pull requests", href: `${REPO}/pulls`, external: true },
        ],
      },
    ],
  },
};

export type ProductLandingProps = {
  content?: ProductLandingContent;
};

const CONTAINER = "mx-auto w-full max-w-6xl px-4 @min-[768px]:px-8";
const SECTION = "py-16 @min-[1024px]:py-24";
const H2 = "font-display text-display-xs font-semibold text-balance @min-[1024px]:text-display-sm";

function Section({
  id,
  titleId,
  className,
  children,
}: {
  id?: string;
  titleId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={titleId} className={`${SECTION} ${className ?? ""}`}>
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

/** Página de produto inteira montada só com peças do Flowtomic. */
export default function ProductLanding({ content = productLandingContent }: ProductLandingProps) {
  const { announcement, header, hero, install, swap, comparison, day, numbers, upcoming, faq } =
    content;
  return (
    <div className="@container bg-background text-foreground">
      <AnnouncementBar action={{ label: announcement.actionLabel, href: announcement.href }}>
        {announcement.text}
      </AnnouncementBar>
      <SiteHeader
        logo={<span className="text-lg font-semibold tracking-tight">{header.brand}</span>}
        nav={header.nav}
        actions={[{ label: header.action.label, href: header.action.href, variant: "default" }]}
        skipToContent="#conteudo"
      />
      <main id="conteudo">
        <section aria-labelledby="hero-titulo" className={`${SECTION} border-b`}>
          <div className={CONTAINER}>
            <h1
              id="hero-titulo"
              className="max-w-4xl font-display text-display-md font-semibold text-balance @min-[1024px]:text-display-xl"
            >
              {hero.title}
            </h1>
            <p className="mt-6 max-w-[56ch] text-lg text-muted-foreground">{hero.description}</p>
            <div data-slot="hero-actions" className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <a href={hero.primary.href}>{hero.primary.label}</a>
              </Button>
              <Button asChild variant="link">
                <a href={hero.secondary.href} target="_blank" rel="noreferrer">
                  {hero.secondary.label}
                </a>
              </Button>
            </div>
            <MetricStrip
              items={hero.metrics}
              variant="inline"
              accent
              separator="dot"
              locale="pt-BR"
              aria-label="Tamanho da biblioteca"
              className="mt-12"
            />
          </div>
        </section>

        <Section id="instalacao" titleId="instalacao-titulo">
          <div className="grid grid-cols-1 items-start gap-8 @min-[1024px]:grid-cols-3 @min-[1024px]:gap-12">
            <div>
              <h2 id="instalacao-titulo" className={H2}>
                {install.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{install.description}</p>
            </div>
            <div className="min-w-0 @min-[1024px]:col-span-2">
              <CodeTabs
                axes={install.axes}
                snippets={install.snippets}
                defaultValue={{ via: "cli" }}
                minLines={6}
                showLineNumbers={false}
              />
            </div>
          </div>
        </Section>

        <Section titleId="troca-titulo">
          <div className="grid grid-cols-1 items-center gap-8 @min-[768px]:grid-cols-3 @min-[768px]:gap-12">
            <h2 id="troca-titulo" className={H2}>
              {swap.title}
            </h2>
            <div className="flex min-w-0 @min-[768px]:justify-center">
              <EnvDiff lines={swap.lines} label="Dependências antes e depois" />
            </div>
            <p className="text-muted-foreground">{swap.description}</p>
          </div>
        </Section>

        <Section titleId="comparacao-titulo">
          <h2 id="comparacao-titulo" className={`${H2} mb-8`}>
            {comparison.title}
          </h2>
          <ComparisonTable
            options={comparison.options}
            features={comparison.features}
            highlight={comparison.highlight}
            highlightLabel={comparison.highlightLabel}
            title="Recurso"
            caption={comparison.title}
          />
        </Section>

        <Section titleId="dia-titulo">
          <h2 id="dia-titulo" className={`${H2} mb-8`}>
            {day.title}
          </h2>
          <DayTimeline moments={day.moments} label="Um dia de trabalho" />
        </Section>

        <section
          aria-labelledby="numeros-titulo"
          className={`dark bg-background text-foreground ${SECTION}`}
        >
          <div className={CONTAINER}>
            <h2 id="numeros-titulo" className={`${H2} mb-10`}>
              {numbers.title}
            </h2>
            <MetricStrip
              items={numbers.metrics}
              variant="columns"
              dividers
              locale="pt-BR"
              aria-label="Números de teste"
            />
          </div>
        </section>

        <Section titleId="chegando-titulo">
          <h2 id="chegando-titulo" className={`${H2} mb-8`}>
            {upcoming.title}
          </h2>
          <StatusList
            items={upcoming.items.map(({ description, ...item }) => ({
              ...item,
              content: <p className="text-sm text-muted-foreground">{description}</p>,
            }))}
            numbered
          />
        </Section>

        <div className={`${SECTION} ${CONTAINER}`}>
          <FaqSection title={faq.title} items={faq.items} contact={faq.contact} />
        </div>
      </main>
      <SiteFooter
        brand={{
          logo: (
            <span className="text-lg font-semibold tracking-tight">{content.footer.brand}</span>
          ),
          tagline: content.footer.tagline,
        }}
        columns={content.footer.columns}
        headingLevel={3}
      />
    </div>
  );
}
