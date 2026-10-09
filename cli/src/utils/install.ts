import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import chalk from "chalk";
import { type Block, blockSourcePath, blockTargetPath } from "./block-utils";
import { createImportRewriter } from "./component-imports";
import { type ComponentInfo, findComponent } from "./component-map";
import { type ComponentsConfig, createProjectResolver } from "./project-config";

/** Planeja e valida todas as origens antes de escrever no projeto consumidor. */
export function createInstaller(
  config: ComponentsConfig,
  repoPath: string,
  projectDir = process.cwd()
) {
  const resolver = createProjectResolver(projectDir);
  const utils = resolver.alias(config.aliases.utils).replace(/(?:\.tsx?)?$/, ".ts");
  const paths = {
    ui: resolver.alias(config.aliases.ui),
    hooks: resolver.alias(config.aliases.hooks),
    utils,
    page: (target: string) => resolver.page(target, config.aliases.components),
  };
  const rewrite = createImportRewriter(repoPath, config);
  const visited = new Set<string>();
  const npmDependencies = new Set<string>();
  const files = new Map<string, { source: string; content: string }>();

  function file(source: string, target: string): void {
    if (!existsSync(source))
      throw new Error(`Arquivo não encontrado: ${relative(repoPath, source)}`);
    const previous = files.get(target);
    if (previous) {
      if (previous.source !== source)
        throw new Error(`Dois arquivos usam o mesmo destino: ${target}`);
      return;
    }
    const result = rewrite(readFileSync(source, "utf-8"), source);
    files.set(target, { source, content: result.content });
    for (const name of result.npmDependencies) npmDependencies.add(name);
    // O destino sai do mesmo specifier que o rewriter gravou no import.
    for (const shared of result.sharedFiles)
      file(shared.source, resolver.alias(shared.specifier) + shared.suffix);
    for (const dependency of result.dependencies) component(dependency);
  }

  function component(entry: ComponentInfo): void {
    if (visited.has(entry.path)) return;
    visited.add(entry.path);
    const root = entry.path.includes("/hooks/") ? paths.hooks : paths.ui;
    for (const name of entry.files)
      file(join(repoPath, entry.path, name), join(root, entry.name, name));
  }

  function namedComponent(name: string): void {
    const entry = findComponent(name);
    if (!entry)
      throw new Error(
        `Componente "${name}" não encontrado. Use "flowtomic list" para ver os disponíveis.`
      );
    component(entry);
  }

  function preserveOrWrite(target: string, content: string): void {
    const path = relative(projectDir, target);
    if (existsSync(target)) {
      if (readFileSync(target, "utf-8") !== content) {
        console.log(
          chalk.yellow(`   ⚠️  Arquivo preservado (já existe com conteúdo diferente): ${path}`)
        );
      } else {
        console.log(chalk.gray(`   ${path} já existe, preservado`));
      }
      return;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf-8");
    console.log(chalk.green(`   ✅ ${path}`));
  }

  return {
    component: namedComponent,
    block(block: Block): void {
      if (!Array.isArray(block.files) || block.files.length === 0) {
        throw new Error(`Block "${block.name}" não possui arquivos`);
      }
      for (const entry of block.files) {
        file(blockSourcePath(entry, repoPath), blockTargetPath(entry, block, paths));
      }
      for (const name of block.registryDependencies || []) namedComponent(name);
      for (const name of block.dependencies || []) npmDependencies.add(name);
    },
    apply(): void {
      file(join(repoPath, "packages/ui/src/lib/utils.ts"), utils);
      for (const [target, entry] of files) preserveOrWrite(target, entry.content);
      if (npmDependencies.size) {
        const dependencies = [...npmDependencies].sort();
        console.log(chalk.blue(`\nDependências npm necessárias: ${dependencies.join(", ")}`));
        console.log(chalk.yellow(`Execute: npm install ${dependencies.join(" ")}`));
      }
    },
  };
}
