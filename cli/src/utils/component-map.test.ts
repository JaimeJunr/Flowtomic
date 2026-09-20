import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPONENT_MAP, type ComponentInfo, HOOK_MAP } from "./component-map";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function arquivosAusentes(entrada: ComponentInfo): string[] {
  return entrada.files
    .map((file) => join(entrada.path, file))
    .filter((relativo) => !existsSync(join(rootDir, relativo)));
}

describe("COMPONENT_MAP", () => {
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
