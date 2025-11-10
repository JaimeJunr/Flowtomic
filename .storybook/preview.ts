// Importar estilos na ordem correta:
// 1. globals.css - DEVE vir primeiro para inicializar Tailwind v4 com @import 'tailwindcss'
import "../packages/styles/globals.css";
// 2. theme.css - Define variáveis do tema usando @theme (Tailwind v4)
import "../packages/styles/theme.css";
// 3. typography.css - Estilos de tipografia que dependem das variáveis
import "../packages/styles/typography.css";

import type { Preview } from "@storybook/react-vite";


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    layout: "centered",

    backgrounds: {
      options: {
        light: {
          name: "light",
          value: "#ffffff",
        },

        dark: {
          name: "dark",
          value: "#0a0a0a",
        }
      }
    },

    docs: {
      toc: true,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
      config: {
        rules: {
          // Ignorar violação de aria-hidden no body
          // Radix UI Dialog aplica aria-hidden ao body quando dialog está aberto
          // Isso é um comportamento padrão e necessário para acessibilidade de dialogs
          // A regra do axe-core é "aria-hidden-body"
          "aria-hidden-body": {
            enabled: false,
          },
        },
      },
    }
  },

  tags: ["autodocs"],

  initialGlobals: {
    backgrounds: {
      value: "light"
    }
  }
};

export default preview;

