#!/usr/bin/env bun

/**
 * Script para gerar o registry completo
 *
 * Este script gera o registry.json completo com todos os componentes e blocks
 * seguindo o schema do shadcn/ui
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENT_MAP, type ComponentInfo, HOOK_MAP } from "../cli/src/utils/component-map";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

interface BlockFile {
  path: string;
  type: "registry:page" | "registry:component" | "registry:hook" | "registry:lib";
  target?: string;
}

interface Block {
  name: string;
  author: string;
  title: string;
  description: string;
  type: "registry:block";
  registryDependencies?: string[];
  dependencies?: string[];
  files: BlockFile[];
  categories: string[];
}

interface RegistryItem {
  name: string;
  type: string;
  files: Array<{
    path: string;
    type: string;
    content?: string;
    target?: string;
  }>;
  dependencies?: string[];
  registryDependencies?: string[];
  [key: string]: unknown;
}

/**
 * Carrega o component map do CLI
 */
export function loadComponentMap(): { components: ComponentInfo[]; hooks: ComponentInfo[] } {
  const components: ComponentInfo[] = [];
  const hooks: ComponentInfo[] = [];

  // O mapa é importado, não extraído do texto do arquivo: a versão anterior lia
  // `component-map.ts` como string e o regex não-guloso parava no primeiro `}`,
  // devolvendo 0 componentes em silêncio.
  for (const component of Object.values(COMPONENT_MAP)) {
    if (component.type === "atom" && component.path.includes("hooks")) {
      hooks.push(component);
    } else {
      components.push(component);
    }
  }

  hooks.push(...Object.values(HOOK_MAP));

  return { components, hooks };
}

/**
 * Carrega blocks do JSON
 */
function loadBlocks(): Block[] {
  const blocksPath = join(rootDir, "packages/ui/src/blocks/registry-blocks.json");
  if (existsSync(blocksPath)) {
    try {
      const content = readFileSync(blocksPath, "utf-8");
      const data = JSON.parse(content);
      return data.blocks || [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Converte ComponentInfo para RegistryItem
 */
function componentToRegistryItem(component: ComponentInfo, repoPath: string): RegistryItem {
  const files = component.files.map((file) => {
    const filePath = join(repoPath, component.path, file);
    let content = "";

    if (existsSync(filePath)) {
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        // Ignorar erros de leitura
      }
    }

    return {
      path: `${component.path}/${file}`,
      type: file.endsWith(".tsx") || file.endsWith(".ts") ? "registry:component" : "registry:lib",
      content,
    };
  });

  return {
    name: component.name,
    type: `registry:${component.type}`,
    files,
    dependencies: component.dependencies || [],
  };
}

/**
 * Gera o registry completo
 */
function generateRegistry() {
  const repoPath = rootDir;
  const { components, hooks } = loadComponentMap();
  const blocks = loadBlocks();

  // Converter componentes para formato do registry
  const componentsRegistry = components.map((c) => componentToRegistryItem(c, repoPath));
  const hooksRegistry = hooks.map((h) => componentToRegistryItem(h, repoPath));

  // Converter blocks para formato do registry
  const blocksRegistry = blocks.map((block) => ({
    ...block,
    files: block.files.map((file) => ({
      ...file,
      path: `blocks/${file.path}`,
    })),
  }));

  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    components: [...componentsRegistry, ...hooksRegistry],
    blocks: blocksRegistry,
  };
}

/**
 * Gera e salva o registry
 */
function main() {
  console.log("📦 Gerando registry completo...");

  const registry = generateRegistry();

  const outputPath = join(rootDir, "registry", "registry.json");
  writeFileSync(outputPath, JSON.stringify(registry, null, 2), "utf-8");

  console.log(`✅ Registry gerado em: ${outputPath}`);
  console.log(`   - ${registry.components.length} componentes`);
  console.log(`   - ${registry.blocks.length} blocks`);
}

// Só executa quando rodado como script (`bun run build-registry.ts`); sob o
// test runner o módulo é importado e não deve escrever registry.json.
if (import.meta.main) {
  main();
}
