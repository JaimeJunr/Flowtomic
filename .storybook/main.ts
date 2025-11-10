// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path, { dirname } from "path";
import tailwindcssPostcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const config: StorybookConfig = {
  stories: [
    "../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)",
    "../packages/logic/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  outputDir: path.resolve(rootDir, "storybook-static"),

  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  async viteFinal(config) {
    const logicPath = path.resolve(__dirname, "../packages/logic/src");
    const uiPath = path.resolve(__dirname, "../packages/ui/src");
    
    return mergeConfig(config, {
      root: rootDir,
      resolve: {
        alias: {
          "@": uiPath,
          "@/lib": path.resolve(uiPath, "lib"),
          "flowtomic/ui": uiPath,
          "flowtomic/logic": logicPath,
          "@flowtomic/logic": logicPath,
          "@flowtomic/ui": uiPath,
        },
        preserveSymlinks: false,
      },
      optimizeDeps: {
        include: ["react-resizable-panels", "@flowtomic/logic"],
      },
      css: {
        postcss: {
          plugins: [
            tailwindcssPostcss(),
            autoprefixer(),
          ],
        },
      },
    });
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

