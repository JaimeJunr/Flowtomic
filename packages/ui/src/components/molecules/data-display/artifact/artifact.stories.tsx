import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/actions/button";
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "./artifact";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Artifact",
  component: Artifact,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Resultado da revisão dos testes de ordenação e busca do DataTable.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Artifact>;
export default meta;
type Story = StoryObj<typeof meta>;

const verificacoes = [
  "Nome acessível do cabeçalho",
  "Ordenação com Enter",
  "Alternância entre crescente e decrescente",
  "Nome acessível da busca",
  "Filtro por nome do componente",
  "Estado vazio com instrução",
];
const resumo = verificacoes.map((teste) => `Passou: ${teste}`).join("\n");
function ArtifactExample({ withActions = false }: { withActions?: boolean }) {
  const [aberto, setAberto] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const baixar = () => {
    const url = URL.createObjectURL(new Blob([resumo], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-table-testes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  if (!aberto)
    return (
      <Button variant="outline" onClick={() => setAberto(true)}>
        Abrir resultado dos testes
      </Button>
    );
  return (
    <Artifact className="w-[560px] max-w-[calc(100vw-2rem)]">
      <ArtifactHeader>
        <div className="min-w-0">
          <ArtifactTitle className="truncate font-mono">data-table.test.tsx</ArtifactTitle>
          <ArtifactDescription>6 testes, todos passando</ArtifactDescription>
        </div>
        <ArtifactActions>
          {withActions && (
            <>
              <ArtifactAction
                icon={Copy}
                tooltip={copiado ? "Resumo copiado" : "Copiar resumo"}
                onClick={async () => {
                  await navigator.clipboard.writeText(resumo);
                  setCopiado(true);
                }}
              />
              <ArtifactAction icon={Download} tooltip="Baixar resumo dos testes" onClick={baixar} />
            </>
          )}
          <ArtifactClose onClick={() => setAberto(false)} />
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent>
        <p className="mb-3 font-mono text-muted-foreground text-[13px]">
          bunx vitest run data-table.test.tsx
        </p>
        <ul className="divide-y divide-border">
          {verificacoes.map((teste) => (
            <li key={teste} className="flex items-center justify-between gap-3 py-2 text-[13px]">
              <span>{teste}</span>
              <span className="text-success">Passou</span>
            </li>
          ))}
        </ul>
      </ArtifactContent>
    </Artifact>
  );
}
export const Default: Story = { name: "Resultado dos testes", render: () => <ArtifactExample /> };
export const WithActions: Story = {
  name: "Copiar ou baixar o resultado",
  render: () => <ArtifactExample withActions />,
};
