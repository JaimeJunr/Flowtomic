import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // streamdown importa katex/dist/katex.min.css no nível do módulo; sem inline
    // o Vitest externaliza o pacote e o loader nativo do Node quebra em
    // "Unknown file extension .css" (ver TextEditor/DocumentEditor).
    server: {
      deps: {
        inline: [/streamdown/],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/test/**",
      ],
      // Piso decidido em 04/10/2026, com a medição em 96,9% de linhas e 94,4% de branches.
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
