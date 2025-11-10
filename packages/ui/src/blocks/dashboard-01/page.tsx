/**
 * Exemplo de Block - Dashboard 01
 *
 * Este é um exemplo de block que pode ser instalado via CLI
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Card 1</h2>
          <p className="text-muted-foreground mb-4">Este é um exemplo de card no dashboard.</p>
          <Button>Ver mais</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Card 2</h2>
          <p className="text-muted-foreground mb-4">Outro exemplo de card.</p>
          <Button variant="outline">Ação</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Card 3</h2>
          <p className="text-muted-foreground mb-4">Mais um card de exemplo.</p>
          <Button variant="secondary">Explorar</Button>
        </Card>
      </div>
    </div>
  );
}
