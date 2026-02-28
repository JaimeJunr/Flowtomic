import { Card, CardDescription, CardHeader, CardTitle } from "@flowtomic/ui";

const HOOKS = [
  {
    name: "useAnimatedIndicator",
    description: "Indicadores animados com estados e transições (idle, loading, success, error).",
  },
  {
    name: "useGenealogy",
    description: "Hierarquia e relacionamentos pai-filho entre elementos.",
  },
  {
    name: "useStatCard",
    description: "Estado e lógica do componente StatCard.",
  },
  {
    name: "useIsMobile",
    description: "Detecção de dispositivo móvel (breakpoint 768px).",
  },
  {
    name: "useReactTableBack",
    description: "TanStack Table com paginação e ordenação no backend.",
  },
  {
    name: "useReactTableFront",
    description: "TanStack Table com paginação e ordenação no frontend.",
  },
  {
    name: "useResizable",
    description: "Lógica de painéis redimensionáveis.",
  },
  {
    name: "useScriptEditor",
    description: "Editor de scripts com estado e execução.",
  },
  {
    name: "useTimeTracker",
    description: "Controle de tempo e cronômetro.",
  },
  {
    name: "useProjectProgress",
    description: "Progresso de projetos.",
  },
  {
    name: "useProjectStats",
    description: "Estatísticas de projetos.",
  },
  {
    name: "useDashboardLayout",
    description: "Layout de dashboard com widgets.",
  },
  {
    name: "useAutocomplete",
    description: "Autocomplete com busca e seleção.",
  },
];

export function HooksShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Hooks</h2>
        <p className="mt-1 text-muted-foreground">
          Hooks headless do @flowtomic/logic — lógica reutilizável sem UI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOOKS.map((hook) => (
          <Card key={hook.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-mono">{hook.name}</CardTitle>
              <CardDescription className="text-sm">{hook.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uso</CardTitle>
          <CardDescription>
            Instale o package{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">@flowtomic/logic</code> e importe:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              import &#123; useAnimatedIndicator &#125; from &quot;@flowtomic/logic&quot;
            </code>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
