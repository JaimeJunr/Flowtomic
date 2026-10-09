import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { COMPONENT_MAP } from "./component-map";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const cli = join(repo, "cli");
const bundle = process.env.FLOWTOMIC_TEST_CLI || join(cli, "dist/cli.js");
const config = {
  tailwind: { css: "src/app/globals.css", cssVariables: true },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    hooks: "@/hooks",
  },
};

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

describe("instalação pela CLI compilada em um projeto consumidor", () => {
  let root: string;
  let project: string;

  beforeAll(() => {
    if (!process.env.FLOWTOMIC_TEST_CLI) {
      execFileSync("bun", ["run", "build"], { cwd: cli, stdio: "pipe" });
    }
  });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "flowtomic-install-"));
    project = join(root, "project");
    write(join(project, "components.json"), JSON.stringify(config));
    write(
      join(project, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } })
    );
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  function run(args: string[], source = repo) {
    const result = spawnSync(process.execPath, [bundle, ...args], {
      cwd: project,
      env: { ...process.env, FLOWTOMIC_REPO_PATH: source, NO_COLOR: "1" },
      encoding: "utf-8",
      timeout: 30_000,
    });
    expect(result.error).toBeUndefined();
    return result;
  }

  function fakeRepo(blockPath = "blocks/chatbot/page.tsx") {
    const source = join(root, "repo");
    write(join(source, "packages/ui/src/lib/utils.ts"), 'export { cn } from "cn";\n');
    write(
      join(source, "packages/ui/src/blocks/registry-blocks.json"),
      JSON.stringify({
        blocks: [
          {
            name: "chatbot",
            title: "Chatbot",
            type: "registry:block",
            registryDependencies: [],
            dependencies: [],
            files: [{ path: blockPath, type: "registry:page", target: "app/chat/page.tsx" }],
          },
        ],
      })
    );
    return source;
  }

  function fakeButton(source: string, code: string): void {
    write(join(source, COMPONENT_MAP.button.path, "button.tsx"), code);
    write(
      join(source, COMPONENT_MAP.button.path, "index.ts"),
      'export { Button } from "./button";\n'
    );
  }

  it("resolve o alias de utils em src, sem criar lib na raiz", () => {
    const result = run(["add", "button"]);
    expect(result.status).toBe(0);
    expect(existsSync(join(project, "src/lib/utils.ts"))).toBe(true);
    expect(existsSync(join(project, "lib"))).toBe(false);
  });

  it.each(
    Object.values(COMPONENT_MAP).filter((entry) => entry.path.includes("/atoms/display/"))
  )("instala $name de atoms/display no alias ui", (entry) => {
    const result = run(["add", entry.name]);
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("pulando");
    for (const file of entry.files) {
      expect(existsSync(join(project, "src/components/ui", entry.name, file))).toBe(true);
    }
    expect(existsSync(join(project, "components"))).toBe(false);
  });

  it("copia chatbot do caminho blocks/chatbot e resolve a página em src/app", () => {
    const result = run(["add-block", "chatbot"]);
    expect(result.status).toBe(0);
    expect(existsSync(join(project, "src/app/chat/page.tsx"))).toBe(true);
    expect(existsSync(join(project, "src/lib/utils.ts"))).toBe(true);
    const page = readFileSync(join(project, "src/app/chat/page.tsx"), "utf-8");
    expect(page).toContain('from "@/components/ui/button"');
    expect(page).not.toMatch(/@\/components\/(atoms|molecules|organisms)/);
  });

  it("instala dependências transitivas do chatbot e resolve todos os imports locais", () => {
    const result = run(["add-block", "chatbot"]);
    expect(result.status).toBe(0);
    // tooltip e input-group são dependências das dependências do block.
    for (const name of [
      "button",
      "shimmer",
      "bubble",
      "message",
      "sources",
      "suggestion",
      "tool-status-line",
      "conversation",
      "prompt-input",
      "questionnaire",
      "tooltip",
      "input-group",
    ]) {
      expect(existsSync(join(project, "src/components/ui", name, "index.ts"))).toBe(true);
    }
    const files = filesUnder(join(project, "src"));
    const unresolved: string[] = [];
    let scanned = 0;
    for (const file of files) {
      const text = readFileSync(file, "utf-8");
      for (const match of text.matchAll(/(?:from\s+|import\s*)["'](@\/[^"']+)["']/g)) {
        scanned++;
        const path = join(project, "src", match[1].slice(2));
        if (
          ![".ts", ".tsx", "/index.ts", "/index.tsx"].some((suffix) => existsSync(path + suffix))
        ) {
          unresolved.push(`${file}: ${match[1]}`);
        }
      }
    }
    expect(scanned).toBeGreaterThan(20);
    expect(unresolved).toEqual([]);
    expect(result.stdout).toContain("npm install");
    expect(result.stdout).toContain("katex");
  });

  it("falha com código não zero se faltar arquivo de block, sem anunciar sucesso", () => {
    const result = run(["add-block", "chatbot"], fakeRepo());
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("blocks/chatbot/page.tsx");
    expect(result.stderr).toContain("não encontrado");
    expect(result.stdout).not.toContain("sucesso");
    expect(existsSync(join(project, "src"))).toBe(false);
  });

  it("falha com código não zero se faltar arquivo de componente", () => {
    const result = run(["add", "table"], fakeRepo());
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("table.tsx");
    expect(result.stdout).not.toContain("sucesso");
  });

  it.each(["add", "add-block"])("%s falha para nome desconhecido", (command) => {
    const result = run([command, "nao-existe"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("nao-existe");
    expect(result.stdout).not.toContain("sucesso");
  });

  it("preserva componentes e página editados e avisa ao instalar de novo", () => {
    const button = join(project, "src/components/ui/button/button.tsx");
    const page = join(project, "src/app/chat/page.tsx");
    write(button, "// botão editado\n");
    write(page, "// página editada\n");
    const result = run(["add-block", "chatbot"]);
    expect(result.status).toBe(0);
    expect(readFileSync(button, "utf-8")).toBe("// botão editado\n");
    expect(readFileSync(page, "utf-8")).toBe("// página editada\n");
    expect(result.stdout).toContain("preservado");
    const before = statSync(button).mtimeMs;
    expect(run(["add", "button", "button"]).status).toBe(0);
    expect(statSync(button).mtimeMs).toBe(before);
  });

  it("respeita aliases personalizados e tsconfig com comentários, extends e baseUrl", () => {
    write(
      join(project, "config/base.json"),
      '{ "compilerOptions": { "baseUrl": "../src", "paths": { "~/*": ["*"] } } }'
    );
    write(
      join(project, "tsconfig.json"),
      '{\n// configuração Next.js\n"extends": "./config/base.json",\n}'
    );
    write(
      join(project, "components.json"),
      JSON.stringify({
        ...config,
        aliases: {
          components: "~/widgets",
          ui: "~/widgets/ui",
          hooks: "~/hooks",
          utils: "~/helpers/cn",
        },
      })
    );
    const result = run(["add", "button"]);
    expect(result.status).toBe(0);
    expect(existsSync(join(project, "src/helpers/cn.ts"))).toBe(true);
    expect(readFileSync(join(project, "src/widgets/ui/button/button.tsx"), "utf-8")).toContain(
      'from "~/helpers/cn"'
    );
  });

  it("mantém projetos com jsconfig e projetos antigos sem tsconfig", () => {
    rmSync(join(project, "tsconfig.json"));
    write(join(project, "jsconfig.json"), '{"compilerOptions":{"paths":{"@/*":["src/*"]}}}');
    expect(run(["add", "table"]).status).toBe(0);
    expect(existsSync(join(project, "src/components/ui/table/table.tsx"))).toBe(true);
    rmSync(join(project, "jsconfig.json"));
    expect(run(["add", "table"]).status).toBe(0);
    expect(existsSync(join(project, "components/ui/table/table.tsx"))).toBe(true);
  });

  it("falha se components.json não existir", () => {
    rmSync(join(project, "components.json"));
    const result = run(["add", "table"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("components.json");
  });

  it("deduplica dependências e termina mesmo com imports circulares", () => {
    const source = fakeRepo();
    write(
      join(source, "packages/ui/src/blocks/chatbot/page.tsx"),
      'import { Button } from "@/components/atoms/actions/button";\nexport default Button;\n'
    );
    write(
      join(source, COMPONENT_MAP.button.path, "button.tsx"),
      'import { Shimmer } from "@/components/atoms/animation/shimmer";\nexport const Button = Shimmer;\n'
    );
    write(
      join(source, COMPONENT_MAP.button.path, "index.ts"),
      'export { Button } from "./button";\n'
    );
    write(
      join(source, COMPONENT_MAP.shimmer.path, "shimmer.tsx"),
      'import { Button } from "@/components/atoms/actions/button";\nexport const Shimmer = Button;\n'
    );
    write(
      join(source, COMPONENT_MAP.shimmer.path, "index.ts"),
      'export { Shimmer } from "./shimmer";\n'
    );
    const result = run(["add-block", "chatbot", "chatbot"], source);
    expect(result.status, result.stderr).toBe(0);
    expect(filesUnder(join(project, "src"))).toHaveLength(6);
    expect(result.stdout.match(/✅ src\/components\/ui\/button\/button.tsx/g)).toHaveLength(1);
  });

  it("valida dependência declarada ausente antes de escrever o block", () => {
    const source = fakeRepo();
    write(
      join(source, "packages/ui/src/blocks/chatbot/page.tsx"),
      "export default function Page() { return null; }\n"
    );
    const path = join(source, "packages/ui/src/blocks/registry-blocks.json");
    const data = JSON.parse(readFileSync(path, "utf-8"));
    data.blocks[0].registryDependencies = ["button"];
    write(path, JSON.stringify(data));
    const result = run(["add-block", "chatbot"], source);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("button.tsx");
    expect(existsSync(join(project, "src"))).toBe(false);
  });

  it("usa o diretório do tsconfig herdado para paths sem baseUrl", () => {
    write(join(project, "config/base.json"), '{"compilerOptions":{"paths":{"@/*":["../src/*"]}}}');
    write(join(project, "tsconfig.json"), '{"extends":"./config/base.json"}');
    const result = run(["add", "table"]);
    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(join(project, "src/components/ui/table/table.tsx"))).toBe(true);
  });

  it("prioriza mapeamento exato de utils em relação ao wildcard", () => {
    write(
      join(project, "tsconfig.json"),
      '{"compilerOptions":{"paths":{"@/*":["src/*"],"@/lib/utils":["src/helpers/utils"]}}}'
    );
    const result = run(["add", "table"]);
    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(join(project, "src/helpers/utils.ts"))).toBe(true);
    expect(existsSync(join(project, "src/lib/utils.ts"))).toBe(false);
  });

  it("resolve hooks pelo alias configurado", () => {
    const result = run(["add", "use-dashboard-layout"]);
    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(join(project, "src/hooks/useDashboardLayout/useDashboardLayout.ts"))).toBe(
      true
    );
  });

  it("recusa alias não mapeado sem escrever em um caminho inventado", () => {
    write(join(project, "tsconfig.json"), '{"compilerOptions":{"paths":{"~/*":["src/*"]}}}');
    const result = run(["add", "table"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Não foi possível resolver o alias");
    expect(existsSync(join(project, "src"))).toBe(false);
    expect(existsSync(join(project, "components"))).toBe(false);
  });

  it("respeita target explícito em src sem acrescentar src duas vezes", () => {
    const source = fakeRepo();
    write(
      join(source, "packages/ui/src/blocks/chatbot/page.tsx"),
      "export default function Page() { return null; }\n"
    );
    const path = join(source, "packages/ui/src/blocks/registry-blocks.json");
    const data = JSON.parse(readFileSync(path, "utf-8"));
    data.blocks[0].files[0].target = "src/app/chat/page.tsx";
    write(path, JSON.stringify(data));
    expect(run(["add-block", "chatbot"], source).status).toBe(0);
    expect(existsSync(join(project, "src/app/chat/page.tsx"))).toBe(true);
  });

  it("mostra a mesma versão do package.json", () => {
    expect(run(["--version"]).stdout.trim()).toBe(
      JSON.parse(readFileSync(join(cli, "package.json"), "utf-8")).version
    );
  });

  it.each([
    "dashboard-01",
    "flowtomic-dashboard",
    "developer-panel",
  ])("continua instalando o block %s, preservando imports de pacotes npm", (name) => {
    const result = run(["add-block", name]);
    expect(result.status, result.stderr).toBe(0);
    const target =
      name === "developer-panel" ? "src/app/developer/page.tsx" : "src/app/dashboard/page.tsx";
    expect(existsSync(join(project, target))).toBe(true);
    if (name === "developer-panel") {
      expect(readFileSync(join(project, target), "utf-8")).toContain('from "@flowtomic/logic"');
      expect(result.stdout).toContain("@flowtomic/logic");
    }
  });

  it("copia helpers transitivos com os aliases personalizados e preserva utils existente", () => {
    const source = fakeRepo();
    write(
      join(source, COMPONENT_MAP.button.path, "button.tsx"),
      'import { x } from "@/lib/helper";\nexport const Button = x;\n'
    );
    write(
      join(source, COMPONENT_MAP.button.path, "index.ts"),
      'export { Button } from "./button";\n'
    );
    write(
      join(source, "packages/ui/src/lib/helper.ts"),
      'import { cn } from "@/lib/utils";\nimport { value } from "@/lib/nested/value";\nexport const x = cn(value);\n'
    );
    write(join(source, "packages/ui/src/lib/nested/value.ts"), 'export const value = "teste";\n');
    write(
      join(project, "components.json"),
      JSON.stringify({
        ...config,
        aliases: {
          components: "~/widgets",
          ui: "~/widgets/ui",
          hooks: "~/hooks",
          utils: "~/helpers/cn",
        },
      })
    );
    write(join(project, "tsconfig.json"), '{"compilerOptions":{"paths":{"~/*":["src/*"]}}}');
    write(join(project, "src/helpers/cn.ts"), "// utils do dono\n");
    const result = run(["add", "button"], source);
    expect(result.status, result.stderr).toBe(0);
    const helper = readFileSync(join(project, "src/helpers/helper.ts"), "utf-8");
    expect(helper).toContain('from "~/helpers/cn"');
    expect(helper).toContain('from "~/helpers/nested/value"');
    expect(existsSync(join(project, "src/helpers/nested/value.ts"))).toBe(true);
    expect(readFileSync(join(project, "src/helpers/cn.ts"), "utf-8")).toBe("// utils do dono\n");
    expect(result.stdout).toContain("preservado");
  });

  // Pasta de helper com index que reexporta irmãos, import relativo para fora dela e ciclo.
  it("copia pasta de helper com index, segue imports relativos e termina com ciclo", () => {
    const source = fakeRepo();
    const lib = join(source, "packages/ui/src/lib");
    fakeButton(source, 'import { canvas } from "@/lib/webgl";\nexport const Button = canvas;\n');
    write(join(lib, "webgl/index.ts"), 'export { canvas } from "./canvas";\n');
    write(
      join(lib, "webgl/canvas.ts"),
      'import { motion } from "../motion";\nimport { theme } from "@/lib/theme";\nexport const canvas = [motion, theme];\n'
    );
    write(
      join(lib, "motion.ts"),
      'import { canvas } from "./webgl/canvas";\nexport const motion = () => canvas;\n'
    );
    write(join(lib, "theme.ts"), "export const theme = 1;\n");
    const result = run(["add", "button"], source);
    expect(result.status, result.stderr).toBe(0);
    for (const path of ["webgl/index.ts", "webgl/canvas.ts", "motion.ts", "theme.ts"]) {
      expect(existsSync(join(project, "src/lib", path)), path).toBe(true);
    }
  });

  // components-foo cobre o prefixo de string que casava a pasta irmã de components.
  it.each([
    ["./extra", `${COMPONENT_MAP.button.path}/extra.tsx`],
    ["@/foo/bar", "packages/ui/src/foo/bar.ts"],
    ["@/components-foo/x", "packages/ui/src/components-foo/x.ts"],
  ])("falha antes de escrever com import local %s sem regra de instalação", (specifier, file) => {
    const source = fakeRepo();
    write(join(source, file), "export const x = 1;\n");
    fakeButton(source, `import { x } from "${specifier}";\nexport const Button = x;\n`);
    const result = run(["add", "button"], source);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`Import local "${specifier}"`);
    expect(existsSync(join(project, "src"))).toBe(false);
  });

  it("falha antes de escrever se faltar helper de lib", () => {
    const source = fakeRepo();
    fakeButton(source, 'import { x } from "@/lib/nao-existe";\nexport const Button = x;\n');
    const result = run(["add", "button"], source);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("nao-existe");
    expect(existsSync(join(project, "src"))).toBe(false);
  });

  it("avisa ao preservar helper de lib com conteúdo diferente e soma as dependências dele", () => {
    const source = fakeRepo();
    fakeButton(source, 'import { x } from "@/lib/helper";\nexport const Button = x;\n');
    write(
      join(source, "packages/ui/src/lib/helper.ts"),
      'import { animate } from "motion/react";\nexport const x = animate;\n'
    );
    write(join(project, "src/lib/helper.ts"), "// helper do dono\n");
    const result = run(["add", "button"], source);
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(join(project, "src/lib/helper.ts"), "utf-8")).toBe("// helper do dono\n");
    expect(result.stdout).toContain("conteúdo diferente): src/lib/helper.ts");
    expect(result.stdout).toMatch(/npm install .*motion/);
  });

  it("emite Repositório, Dependências e check em UTF-8 válido no bundle", () => {
    const result = spawnSync(process.execPath, [bundle, "add", "button"], {
      cwd: project,
      env: { ...process.env, FLOWTOMIC_REPO_PATH: repo, NO_COLOR: "1" },
    });
    const output = new TextDecoder("utf-8", { fatal: true }).decode(result.stdout);
    for (const expected of ["Repositório", "Dependências", "✅"]) {
      expect(output).toContain(expected);
      expect(result.stdout.includes(Buffer.from(expected, "utf-8"))).toBe(true);
    }
    expect(output).not.toMatch(/RepositÃ|DependÃ|âœ|�/);
  });
});
