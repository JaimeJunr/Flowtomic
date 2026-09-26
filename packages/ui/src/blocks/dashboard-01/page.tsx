/**
 * Dashboard 01 — Esqueleto de app
 *
 * Sidebar, cabeçalho e uma área de conteúdo vazia que ensina o próximo passo.
 * É o ponto de partida de quem instala o block via CLI.
 */

import { ExternalLink } from "lucide-react";

export interface DashboardPageProps {
  /** @default "Seu app" */
  appName?: string;
  /** Onde o conteúdo desta página mora no projeto de quem instalou. @default "app/dashboard/page.tsx" */
  pagePath?: string;
  /** @default "https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/README.md" */
  componentsUrl?: string;
}

export default function DashboardPage({
  appName = "Seu app",
  pagePath = "app/dashboard/page.tsx",
  componentsUrl = "https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/README.md",
}: DashboardPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <nav
        aria-label="Principal"
        className="flex shrink-0 items-center gap-4 border-b border-border bg-surface px-4 py-3 md:w-58 md:flex-col md:items-stretch md:gap-6 md:border-r md:border-b-0 md:py-6"
      >
        <span className="font-display px-2 text-lg font-bold">{appName}</span>
        <a
          href="/"
          aria-current="page"
          className="flex min-h-11 items-center rounded-md bg-accent px-2 text-sm font-semibold text-accent-foreground"
        >
          Início
        </a>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col gap-8 px-4 py-6 md:px-10 md:py-8">
        <h1 className="font-display text-base font-semibold text-muted-foreground">Início</h1>

        <section className="mt-8 flex max-w-140 flex-col gap-4 md:mt-20">
          <h2 className="font-display text-[26px] font-bold leading-tight sm:text-[32px] tracking-tight">
            Página vazia, pronta para o primeiro componente
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground/80">
            A sidebar e o cabeçalho já estão montados. O conteúdo desta área fica em{" "}
            <code className="font-mono text-sm text-foreground">{pagePath}</code>.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-foreground px-4 py-4 font-mono text-sm text-background">
            <code>bunx flowtomic-cli add stat-card data-table</code>
          </pre>
          <a
            href={componentsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-medium text-accent-foreground hover:underline"
          >
            Ver os componentes
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        </section>
      </main>
    </div>
  );
}
