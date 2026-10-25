export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const DLX: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx",
};

const ADD: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

const RUN: Record<PackageManager, string> = {
  npm: "npm run",
  pnpm: "pnpm",
  yarn: "yarn",
  bun: "bun run",
};

const DEV_FLAGS = new Set(["-D", "--save-dev"]);

/**
 * Traduz um comando escrito no formato npm/npx para o gerenciador escolhido.
 * Só cobre os formatos comuns (npx, install/i, run, create); o resto volta igual.
 */
export function toPackageManager(command: string, manager: PackageManager): string {
  const trimmed = command.trim();
  const npx = /^npx\s+(.+)$/.exec(trimmed);
  if (npx) return `${DLX[manager]} ${npx[1]}`;

  const install = /^npm\s+(?:install|i)\s+(.+)$/.exec(trimmed);
  if (install) {
    const parts = (install[1] ?? "").split(/\s+/).map((p) => (DEV_FLAGS.has(p) ? "-D" : p));
    return manager === "npm"
      ? `npm install ${parts.map((p) => (p === "-D" ? "--save-dev" : p)).join(" ")}`
      : `${ADD[manager]} ${parts.join(" ")}`;
  }

  const run = /^npm\s+run\s+(.+)$/.exec(trimmed);
  if (run) return `${RUN[manager]} ${run[1]}`;

  const create = /^npm\s+create\s+(.+)$/.exec(trimmed);
  if (create) return `${manager} create ${create[1]}`;

  return command;
}
