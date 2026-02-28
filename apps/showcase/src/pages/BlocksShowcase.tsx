import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flowtomic/ui";

const BLOCKS = [
  {
    id: "dashboard-01",
    name: "Dashboard 01",
    description: "Dashboard simples com cards. Ideal para começar.",
    deps: "card, button",
  },
  {
    id: "flowtomic-dashboard",
    name: "Flowtomic Dashboard",
    description:
      "Dashboard completo: sidebar, header, estatísticas, gráficos, listas de projetos e equipe, timer.",
    deps: "button, card, input, avatar, badge, progress, stat-card, sidebar-navigation, e mais.",
  },
  {
    id: "developer-panel",
    name: "Developer Panel",
    description:
      "Painel de desenvolvedor: info do sistema, ambiente, Swagger, API Docs, editor de scripts.",
    deps: "button, card, badge, tabs, script-editor",
  },
];

export function BlocksShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Blocks</h2>
        <p className="mt-1 text-muted-foreground">
          Páginas pré-montadas para copiar e adaptar ao seu projeto.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BLOCKS.map((block) => (
          <Card key={block.id}>
            <CardHeader>
              <CardTitle>{block.name}</CardTitle>
              <CardDescription>{block.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Dependências:</span> {block.deps}
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://github.com/JaimeJunr/Flowtomic/tree/main/packages/ui/src/components/blocks/${block.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver código
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instalação</CardTitle>
          <CardDescription>Use o CLI para adicionar um block ao seu projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-sm">
            npx flowtomic@latest add-block dashboard-01
            {"\n"}npx flowtomic@latest add-block flowtomic-dashboard
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
