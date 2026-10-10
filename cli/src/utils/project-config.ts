import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import ts from "typescript";

export interface ComponentsConfig {
  aliases: {
    components: string;
    utils: string;
    ui: string;
    hooks: string;
  };
}

export function readComponentsConfig(projectDir = process.cwd()): ComponentsConfig {
  const path = join(projectDir, "components.json");
  if (!existsSync(path)) {
    throw new Error('components.json não encontrado. Execute "flowtomic init" primeiro.');
  }
  const config = JSON.parse(readFileSync(path, "utf-8")) as ComponentsConfig;
  for (const name of ["components", "utils", "ui", "hooks"] as const) {
    if (typeof config.aliases?.[name] !== "string" || !config.aliases[name]) {
      throw new Error(`Alias "${name}" ausente ou inválido em components.json`);
    }
  }
  return config;
}

/** Usa o parser do TypeScript para respeitar JSONC, extends, paths e baseUrl. */
export function createProjectResolver(projectDir = process.cwd()) {
  const configPath = ["tsconfig.json", "jsconfig.json"]
    .map((name) => join(projectDir, name))
    .find(existsSync);
  const parsed = configPath
    ? ts.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        {
          ...ts.sys,
          onUnRecoverableConfigFileDiagnostic(diagnostic) {
            throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
          },
        }
      )
    : undefined;
  // Um projeto ainda vazio é válido para instalação de componentes.
  const error = parsed?.errors.find((diagnostic) => ![18002, 18003].includes(diagnostic.code));
  if (error) throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
  const options = parsed?.options as (ts.CompilerOptions & { pathsBasePath?: string }) | undefined;
  const base = options?.baseUrl || options?.pathsBasePath || dirname(configPath || projectDir);
  const paths = Object.entries(options?.paths || {}).sort(
    ([a], [b]) => b.split("*")[0].length - a.split("*")[0].length
  );

  function insideProject(path: string): string {
    const result = resolve(path);
    const local = relative(projectDir, result);
    if (
      local === ".." ||
      local.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
      isAbsolute(local)
    ) {
      throw new Error(`Destino fora do projeto: ${result}`);
    }
    return result;
  }

  function mappedPath(alias: string): string | undefined {
    // Mapeamentos exatos têm precedência sobre padrões com *.
    const exact = paths.find(([pattern]) => pattern === alias);
    if (exact?.[1][0]) return resolve(base, exact[1][0]);
    for (const [pattern, targets] of paths) {
      const star = pattern.indexOf("*");
      if (star < 0 || !targets[0]) continue;
      const prefix = pattern.slice(0, star);
      const suffix = pattern.slice(star + 1);
      if (alias.startsWith(prefix) && alias.endsWith(suffix)) {
        const value = alias.slice(prefix.length, suffix ? -suffix.length : undefined);
        return resolve(base, targets[0].replace("*", value));
      }
    }
    return undefined;
  }

  return {
    alias(alias: string): string {
      const mapped = mappedPath(alias);
      if (mapped) return insideProject(mapped);
      if (!configPath && alias.startsWith("@/"))
        return insideProject(join(projectDir, alias.slice(2)));
      if (!alias.startsWith("@") && !alias.startsWith("~"))
        return insideProject(resolve(projectDir, alias));
      throw new Error(
        `Não foi possível resolver o alias "${alias}" em tsconfig.json ou jsconfig.json`
      );
    },
    page(target: string, componentsAlias: string): string {
      // Targets explícitos em src/ já são relativos à raiz do projeto.
      const prefix = componentsAlias.match(/^[^/]+\//)?.[0];
      const mapped = target.startsWith("app/") && prefix ? mappedPath(prefix + target) : undefined;
      return insideProject(mapped || join(projectDir, target));
    },
  };
}
