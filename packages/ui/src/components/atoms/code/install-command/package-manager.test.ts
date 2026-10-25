import { describe, expect, it } from "vitest";
import { type PackageManager, toPackageManager } from "./package-manager";

describe("toPackageManager", () => {
  it.each<[PackageManager, string]>([
    ["npm", "npx flowtomic-cli add button"],
    ["pnpm", "pnpm dlx flowtomic-cli add button"],
    ["yarn", "yarn dlx flowtomic-cli add button"],
    ["bun", "bunx flowtomic-cli add button"],
  ])("npx para %s", (manager, esperado) => {
    expect(toPackageManager("npx flowtomic-cli add button", manager)).toBe(esperado);
  });

  it.each<[PackageManager, string]>([
    ["npm", "npm install @flowtomic/ui react"],
    ["pnpm", "pnpm add @flowtomic/ui react"],
    ["yarn", "yarn add @flowtomic/ui react"],
    ["bun", "bun add @flowtomic/ui react"],
  ])("npm install para %s", (manager, esperado) => {
    expect(toPackageManager("npm install @flowtomic/ui react", manager)).toBe(esperado);
  });

  it("aceita npm i", () => {
    expect(toPackageManager("npm i zod", "pnpm")).toBe("pnpm add zod");
  });

  it.each<[PackageManager, string]>([
    ["npm", "npm install vitest --save-dev"],
    ["pnpm", "pnpm add vitest -D"],
    ["yarn", "yarn add vitest -D"],
    ["bun", "bun add vitest -D"],
  ])("traduz --save-dev para %s", (manager, esperado) => {
    expect(toPackageManager("npm install vitest --save-dev", manager)).toBe(esperado);
  });

  it("traduz -D para os outros gerenciadores", () => {
    expect(toPackageManager("npm i -D vitest", "bun")).toBe("bun add -D vitest");
  });

  it.each<[PackageManager, string]>([
    ["npm", "npm run dev"],
    ["pnpm", "pnpm dev"],
    ["yarn", "yarn dev"],
    ["bun", "bun run dev"],
  ])("npm run para %s", (manager, esperado) => {
    expect(toPackageManager("npm run dev", manager)).toBe(esperado);
  });

  it.each<[PackageManager, string]>([
    ["npm", "npm create vite@latest"],
    ["pnpm", "pnpm create vite@latest"],
    ["yarn", "yarn create vite@latest"],
    ["bun", "bun create vite@latest"],
  ])("npm create para %s", (manager, esperado) => {
    expect(toPackageManager("npm create vite@latest", manager)).toBe(esperado);
  });

  it("comando desconhecido volta igual", () => {
    expect(toPackageManager("git clone repo", "pnpm")).toBe("git clone repo");
  });
});
