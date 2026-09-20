import { describe, expect, it } from "vitest";
import { COMPONENT_MAP, HOOK_MAP } from "../cli/src/utils/component-map";
import { loadComponentMap } from "./build-registry";

describe("loadComponentMap", () => {
  it("carrega todos os componentes do COMPONENT_MAP, não só o primeiro", () => {
    const { components, hooks } = loadComponentMap();

    // O total tem que bater com a fonte de verdade que o CLI já usa; qualquer
    // parsing que pare no meio do mapa cai aqui.
    const esperado = Object.keys(COMPONENT_MAP).length;
    expect(components.length + hooks.length).toBeGreaterThanOrEqual(esperado);
  });

  it("carrega os hooks do HOOK_MAP", () => {
    const { hooks } = loadComponentMap();

    expect(hooks.length).toBeGreaterThanOrEqual(Object.keys(HOOK_MAP).length);
  });

  it("preenche os campos de cada componente, não só o nome", () => {
    const { components } = loadComponentMap();
    const button = components.find((c) => c.name === "button");

    expect(button).toBeDefined();
    expect(button?.type).toBe("atom");
    expect(button?.path).toBe("packages/ui/src/components/atoms/button");
    expect(button?.files).toContain("button.tsx");
    expect(button?.dependencies).toContain("@radix-ui/react-slot");
  });

  it("classifica entrada com chave entre aspas, não só chave nua", () => {
    // `button:` é chave nua e `"use-stat-card":` é citada — um parser que só
    // reconhece um dos formatos perde metade do mapa em silêncio.
    const { hooks } = loadComponentMap();

    expect(hooks.map((h) => h.name)).toContain("useStatCard");
  });
});
