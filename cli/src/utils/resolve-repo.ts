/**
 * Utilitários para resolver o caminho do repositório Flowtomic
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Resolve o caminho do repositório Flowtomic
 *
 * Tenta encontrar o repositório de várias formas:
 * 1. Via variável de ambiente FLOWTOMIC_REPO_PATH
 * 2. Via caminho relativo do CLI (se executado do repositório)
 * 3. Via GitHub (clonando temporariamente)
 */
export function resolveFlowtomicRepo(): string | null {
  // 1. Tentar via variável de ambiente
  if (process.env.FLOWTOMIC_REPO_PATH) {
    const repoPath = process.env.FLOWTOMIC_REPO_PATH;
    if (existsSync(join(repoPath, "packages", "ui"))) {
      return repoPath;
    }
  }

  // 2. Tentar encontrar relativo ao CLI (se executado do repositório)
  try {
    // Quando executado via bunx/npx, o CLI está em node_modules ou cache
    // Tentar encontrar o repositório a partir do diretório atual
    let currentDir = process.cwd();

    // Subir até encontrar o diretório flowtomic
    for (let i = 0; i < 10; i++) {
      if (existsSync(join(currentDir, "packages", "ui"))) {
        return currentDir;
      }
      const parent = dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }

    // Tentar a partir do diretório do executável
    if (process.argv[1]) {
      currentDir = dirname(process.argv[1]);
      for (let i = 0; i < 10; i++) {
        if (existsSync(join(currentDir, "packages", "ui"))) {
          return currentDir;
        }
        const parent = dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
      }
    }
  } catch {
    // Ignorar erros
  }

  // 3. Tentar via caminho padrão (desenvolvimento local)
  const defaultPaths = [
    join(process.cwd(), "..", ".."), // Se executado de dentro do flowtomic
    join(process.env.HOME || "", "Amanhecer", "flowtomic"),
    "/home/jaime/Amanhecer/flowtomic",
  ];

  for (const path of defaultPaths) {
    if (existsSync(join(path, "packages", "ui"))) {
      return path;
    }
  }

  // 4. Tentar baixar do GitHub (síncrono via execSync para manter compatibilidade)
  try {
    // Usar git clone que é mais confiável
    const repoUrl = "https://github.com/JaimeJunr/Flowtomic.git";
    const cacheDir = join(tmpdir(), "flowtomic-cli-cache");
    const repoPath = join(cacheDir, "Flowtomic");

    // Se já existe e é válido, usar cache
    if (existsSync(repoPath) && existsSync(join(repoPath, "packages", "ui"))) {
      return repoPath;
    }

    // Criar diretório de cache
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    // Limpar cache antigo se existir
    if (existsSync(repoPath)) {
      rmSync(repoPath, { recursive: true, force: true });
    }

    // Clonar repositório
    console.log("📥 Baixando repositório Flowtomic do GitHub...");
    execSync(`git clone --depth 1 ${repoUrl} "${repoPath}"`, {
      stdio: "pipe",
      cwd: cacheDir,
    });

    // Verificar se foi clonado corretamente
    if (existsSync(join(repoPath, "packages", "ui"))) {
      return repoPath;
    }
  } catch {
    // Se git clone falhar, tentar via tarball
    try {
      const cacheDir = join(tmpdir(), "flowtomic-cli-cache");
      const repoPath = join(cacheDir, "Flowtomic");

      if (existsSync(repoPath)) {
        rmSync(repoPath, { recursive: true, force: true });
      }

      const tarballUrl = "https://github.com/JaimeJunr/Flowtomic/archive/refs/heads/main.tar.gz";
      const tarballPath = join(cacheDir, "flowtomic.tar.gz");

      // Baixar tarball usando curl (mais confiável que fetch em alguns ambientes)
      execSync(`curl -L -f ${tarballUrl} -o "${tarballPath}"`, {
        stdio: "pipe",
      });

      // Extrair
      execSync(`tar -xzf "${tarballPath}" -C "${cacheDir}"`, {
        stdio: "pipe",
      });

      // Renomear se necessário
      const extractedPath = join(cacheDir, "Flowtomic-main");
      if (existsSync(extractedPath)) {
        if (existsSync(repoPath)) {
          rmSync(repoPath, { recursive: true, force: true });
        }
        execSync(`mv "${extractedPath}" "${repoPath}"`, {
          stdio: "pipe",
        });
      }

      // Limpar tarball
      if (existsSync(tarballPath)) {
        rmSync(tarballPath);
      }

      if (existsSync(join(repoPath, "packages", "ui"))) {
        return repoPath;
      }
    } catch {
      // Ignorar erros
    }
  }

  return null;
}

/**
 * Resolve o caminho do componente no repositório
 */
export function resolveComponentPath(
  componentPath: string,
  repoPath: string | null
): string | null {
  if (!repoPath) {
    repoPath = resolveFlowtomicRepo();
    if (!repoPath) return null;
  }

  const fullPath = join(repoPath, componentPath);
  return existsSync(fullPath) ? fullPath : null;
}
