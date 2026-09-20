import { Button } from "@flowtomic/ui";
import { useEffect, useState } from "react";
import { BlocksShowcase } from "@/pages/BlocksShowcase";
import { ComponentsShowcase } from "@/pages/ComponentsShowcase";
import { HooksShowcase } from "@/pages/HooksShowcase";

type MainTab = "components" | "hooks" | "blocks";

function App() {
  const [tab, setTab] = useState<MainTab>("components");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-[1400px] mx-auto items-center justify-between px-4">
          <a href="/" className="font-semibold text-lg tracking-tight">
            Flowtomic
          </a>
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab("components")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                tab === "components" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              Componentes
            </button>
            <button
              type="button"
              onClick={() => setTab("hooks")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                tab === "hooks" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              Hooks
            </button>
            <button
              type="button"
              onClick={() => setTab("blocks")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                tab === "blocks" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              Blocks
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/40 py-16 md:py-24">
        <div className="container max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            A base do seu Design System
          </h1>
          <p className="mt-4 max-w-[600px] mx-auto text-lg text-muted-foreground">
            Componentes, hooks e blocks prontos para customizar e escalar. Código aberto, baseado em
            Radix UI e Tailwind. Comece aqui e faça do seu jeito.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <a href="https://github.com/JaimeJunr/Flowtomic" target="_blank" rel="noreferrer">
                Ver no GitHub
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setTab("components")}>
              Ver Componentes
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container max-w-[1400px] mx-auto px-4 py-10">
        {tab === "components" && <ComponentsShowcase />}
        {tab === "hooks" && <HooksShowcase />}
        {tab === "blocks" && <BlocksShowcase />}
      </main>
    </div>
  );
}

export default App;
