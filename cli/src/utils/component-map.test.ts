import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPONENT_MAP, type ComponentInfo, HOOK_MAP } from "./component-map";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function arquivosAusentes(entrada: ComponentInfo): string[] {
  return entrada.files
    .map((file) => join(entrada.path, file))
    .filter((relativo) => !existsSync(join(rootDir, relativo)));
}

// Pasta de componente = tem `index.ts` e um arquivo principal com o nome da pasta.
function pastasDeComponente(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .flatMap((entrada) => {
      const pasta = join(dir, entrada.name);
      const nome = basename(pasta);
      const ehComponente =
        existsSync(join(pasta, "index.ts")) &&
        (existsSync(join(pasta, `${nome}.tsx`)) || existsSync(join(pasta, `${nome}.ts`)));
      return [...(ehComponente ? [relative(rootDir, pasta)] : []), ...pastasDeComponente(pasta)];
    });
}

describe("COMPONENT_MAP", () => {
  // O guard de baixo só olha do mapa pro disco. O caminho inverso também falha
  // calado: componente novo sem entrada some do `flowtomic add` e do registry,
  // embora o docs/cli/README.md o liste como instalável (team-member-list e
  // project-list, 27/09/2026).
  it("tem uma entrada para cada componente em packages/ui/src/components", () => {
    const mapeados = new Set(Object.values(COMPONENT_MAP).map((entrada) => entrada.path));
    const semEntrada = pastasDeComponente(join(rootDir, "packages/ui/src/components")).filter(
      (pasta) => !mapeados.has(pasta)
    );

    expect(semEntrada).toEqual([]);
  });

  // O `path` de cada entrada é copiado direto pro registry e pro `flowtomic add`.
  // Quando um componente muda de pasta e o mapa não acompanha, nada estoura: o
  // registry emite `content: ""` e o add copia zero arquivo. Este guard é o que
  // transforma esse silêncio em falha.
  it.each(
    Object.entries(COMPONENT_MAP)
  )("%s aponta para arquivos que existem", (_chave, entrada) => {
    expect(arquivosAusentes(entrada)).toEqual([]);
  });

  it.each(
    Object.entries(HOOK_MAP)
  )("hook %s aponta para arquivos que existem", (_chave, entrada) => {
    expect(arquivosAusentes(entrada)).toEqual([]);
  });
});
