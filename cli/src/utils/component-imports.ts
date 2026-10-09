import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import ts from "typescript";
import { COMPONENT_MAP, type ComponentInfo, HOOK_MAP } from "./component-map";
import type { ComponentsConfig } from "./project-config";

type ExportInfo = { component: ComponentInfo; modulePath: string };

/** Arquivo fora de componente que vai junto: o destino é `specifier` resolvido no projeto + `suffix`. */
export type SharedFile = { source: string; specifier: string; suffix: string };

// Pastas de packages/ui/src sem componente, instaladas sob a pasta do alias de utils.
const SHARED_DIRS: Record<string, string> = { lib: "" };

function isInside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return !rel.startsWith("..") && !isAbsolute(rel);
}

/** Resolve imports pela origem; barrels são divididos só nos símbolos utilizados. */
export function createImportRewriter(repoPath: string, config: ComponentsConfig) {
  const components = [...Object.values(COMPONENT_MAP), ...Object.values(HOOK_MAP)];
  const exportsCache = new Map<string, Map<string, ExportInfo>>();
  const libAlias = config.aliases.utils.slice(0, config.aliases.utils.lastIndexOf("/"));

  function owner(path: string): ComponentInfo | undefined {
    return components.find((component) => {
      const root = join(repoPath, component.path);
      return path === root || path.startsWith(`${root}/`) || path.startsWith(`${root}\\`);
    });
  }

  function localModule(specifier: string, sourcePath: string): string | undefined {
    if (specifier.startsWith(".")) return resolve(dirname(sourcePath), specifier);
    if (specifier.startsWith("@/")) return join(repoPath, "packages/ui/src", specifier.slice(2));
    if (specifier.startsWith("flowtomic/ui/"))
      return join(repoPath, "packages/ui/src", specifier.slice(13));
    if (specifier.startsWith("flowtomic/logic/hooks/"))
      return join(repoPath, "packages/logic/src/hooks", specifier.slice(22));
    return undefined;
  }

  function sourceFile(path: string): string | undefined {
    return [
      path,
      `${path}.ts`,
      `${path}.tsx`,
      join(path, "index.ts"),
      join(path, "index.tsx"),
    ].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  }

  function exportedSymbols(modulePath: string): Map<string, ExportInfo> {
    const file = sourceFile(modulePath);
    if (!file) throw new Error(`Arquivo não encontrado: ${modulePath}`);
    const cached = exportsCache.get(file);
    if (cached) return cached;
    const symbols = new Map<string, ExportInfo>();
    exportsCache.set(file, symbols);
    const content = readFileSync(file, "utf-8");
    const ast = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    for (const node of ast.statements) {
      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const target = localModule(node.moduleSpecifier.text, file);
        if (!target) continue;
        const component = owner(target);
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const item of node.exportClause.elements) {
            const symbol = component
              ? { component, modulePath: target }
              : exportedSymbols(target).get((item.propertyName || item.name).text);
            if (symbol) symbols.set(item.name.text, symbol);
          }
        } else if (!node.exportClause) {
          for (const [name, symbol] of exportedSymbols(target)) symbols.set(name, symbol);
        }
      } else if (
        ts.canHaveModifiers(node) &&
        ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const component = owner(file);
        if (!component) continue;
        if (ts.isVariableStatement(node)) {
          for (const declaration of node.declarationList.declarations) {
            if (ts.isIdentifier(declaration.name))
              symbols.set(declaration.name.text, { component, modulePath });
          }
        } else if ("name" in node && node.name && ts.isIdentifier(node.name as ts.Node)) {
          symbols.set((node.name as ts.Identifier).text, { component, modulePath });
        }
      }
    }
    return symbols;
  }

  function aliasFor(component: ComponentInfo, modulePath: string): string {
    const base = component.path.includes("/hooks/") ? config.aliases.hooks : config.aliases.ui;
    const tail = relative(join(repoPath, component.path), modulePath)
      .replace(/\\/g, "/")
      .replace(/\.(tsx?|jsx?)$/, "");
    return `${base}/${component.name}${tail && tail !== "index" ? `/${tail}` : ""}`;
  }

  function sharedFile(modulePath: string): SharedFile | undefined {
    for (const [dir, prefix] of Object.entries(SHARED_DIRS)) {
      const root = join(repoPath, "packages/ui/src", dir);
      if (!isInside(root, modulePath)) continue;
      const source = sourceFile(modulePath);
      if (!source) throw new Error(`Arquivo não encontrado: ${relative(repoPath, modulePath)}`);
      const base = modulePath.replace(/\.tsx?$/, "");
      const tail = relative(root, base).replace(/\\/g, "/");
      return {
        source,
        specifier: [libAlias, prefix, tail].filter(Boolean).join("/"),
        suffix: source.slice(base.length),
      };
    }
    return undefined;
  }

  return function rewrite(content: string, sourcePath: string) {
    const ast = ts.createSourceFile(
      sourcePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const dependencies = new Map<string, ComponentInfo>();
    const npmDependencies = new Set<string>();
    const sharedFiles: SharedFile[] = [];
    const edits: { start: number; end: number; text: string }[] = [];
    const current = owner(sourcePath);
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) continue;
      if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const specifier = node.moduleSpecifier.text;
      const modulePath = localModule(specifier, sourcePath);
      if (!modulePath) {
        if (!specifier.startsWith("node:") && !specifier.startsWith(".")) {
          npmDependencies.add(
            specifier.startsWith("@")
              ? specifier.split("/").slice(0, 2).join("/")
              : specifier.split("/")[0]
          );
        }
        continue;
      }
      const libRoot = join(repoPath, "packages/ui/src/lib");
      const isUtils =
        modulePath === join(libRoot, "utils") || modulePath === join(libRoot, "utils.ts");
      const shared = isUtils ? undefined : sharedFile(modulePath);
      let replacement: string | undefined;
      if (isUtils) {
        replacement = config.aliases.utils;
      } else if (shared) {
        sharedFiles.push(shared);
        replacement = shared.specifier;
      } else {
        const component = owner(modulePath);
        if (component) {
          dependencies.set(component.name, component);
          if (component !== current || !specifier.startsWith("."))
            replacement = aliasFor(component, modulePath);
        } else if (modulePath.startsWith(join(repoPath, "packages/ui/src/components"))) {
          const bindings = ts.isImportDeclaration(node)
            ? node.importClause?.namedBindings
            : node.exportClause;
          if (
            !bindings ||
            (!ts.isNamedImports(bindings) && !ts.isNamedExports(bindings)) ||
            (ts.isImportDeclaration(node) && node.importClause?.name)
          ) {
            throw new Error(
              `Import de barrel não suportado em ${sourcePath}: ${specifier}. Use imports nomeados.`
            );
          }
          const symbols = exportedSymbols(modulePath);
          const groups = new Map<string, string[]>();
          for (const item of bindings.elements) {
            const name = (item.propertyName || item.name).text;
            const symbol = symbols.get(name);
            if (!symbol)
              throw new Error(`Export "${name}" não encontrado em ${specifier} (${sourcePath})`);
            dependencies.set(symbol.component.name, symbol.component);
            const alias = aliasFor(symbol.component, join(repoPath, symbol.component.path));
            const entries = groups.get(alias) || [];
            entries.push(item.getText(ast));
            groups.set(alias, entries);
          }
          const keyword = ts.isImportDeclaration(node) ? "import" : "export";
          const typeOnly = ts.isImportDeclaration(node)
            ? node.importClause?.isTypeOnly
            : node.isTypeOnly;
          edits.push({
            start: node.getStart(ast),
            end: node.end,
            text: [...groups]
              .map(
                ([alias, names]) =>
                  `${keyword}${typeOnly ? " type" : ""} { ${names.join(", ")} } from ${JSON.stringify(alias)};`
              )
              .join("\n"),
          });
        }
      }
      if (replacement)
        edits.push({
          start: node.moduleSpecifier.getStart(ast),
          end: node.moduleSpecifier.end,
          text: JSON.stringify(replacement),
        });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
    }
    return {
      content,
      dependencies: [...dependencies.values()],
      npmDependencies: [...npmDependencies],
      sharedFiles,
    };
  };
}
