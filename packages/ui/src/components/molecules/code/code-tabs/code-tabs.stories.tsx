import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLink } from "lucide-react";
import { Button } from "../../../atoms/actions/button";
import { CodeTabs } from "./code-tabs";

const meta = {
  title: "Flowtomic UI/Molecules/CodeTabs",
  component: CodeTabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Um mesmo exemplo de código em várias combinações de abas, com valores trocáveis dentro do código por chips de variável. Opções sem exemplo somem; copiar leva o código já substituído.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    showLineNumbers: { control: "boolean" },
    minLines: { control: { type: "number", min: 1, max: 30 } },
    highlightChanges: { control: "boolean" },
  },
} satisfies Meta<typeof CodeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    axes: [
      {
        id: "pm",
        label: "Gerenciador de pacotes",
        options: [
          { value: "bun", label: "bun" },
          { value: "npm", label: "npm" },
          { value: "pnpm", label: "pnpm" },
        ],
      },
    ],
    snippets: [
      { match: { pm: "bun" }, code: "bunx flowtomic-cli add button", language: "bash" },
      { match: { pm: "npm" }, code: "npx flowtomic-cli add button", language: "bash" },
      { match: { pm: "pnpm" }, code: "pnpm dlx flowtomic-cli add button", language: "bash" },
    ],
    minLines: 3,
  },
};

const importSnippet = (lang: "ts" | "js", fw: "vite" | "next") => {
  const ext = lang === "ts" ? "tsx" : "jsx";
  const first = fw === "next" ? '"use client";\n\n' : "";
  return {
    match: { framework: fw, language: lang },
    language: (lang === "ts" ? "tsx" : "jsx") as "tsx" | "jsx",
    code: `${first}import { Button } from "@flowtomic/ui";\n\nexport function Salvar() {\n  return <Button>Salvar</Button>;\n}\n// arquivo: salvar.${ext}`,
  };
};

export const ImportarComponente: Story = {
  args: {
    axes: [
      {
        id: "framework",
        label: "Framework",
        options: [
          { value: "vite", label: "Vite" },
          { value: "next", label: "Next" },
        ],
      },
      {
        id: "language",
        label: "Linguagem",
        placement: "end",
        options: [
          { value: "ts", label: "TypeScript" },
          { value: "js", label: "JavaScript" },
        ],
      },
    ],
    snippets: [
      importSnippet("ts", "vite"),
      importSnippet("js", "vite"),
      importSnippet("ts", "next"),
      importSnippet("js", "next"),
    ],
  },
};

export const ComVariaveis: Story = {
  args: {
    axes: [
      {
        id: "client",
        label: "Cliente",
        options: [
          { value: "http", label: "HTTP" },
          { value: "sdk", label: "SDK" },
        ],
      },
    ],
    snippets: [
      {
        match: { client: "http" },
        language: "bash",
        code: `curl https://api.exemplo.dev/v1/respostas \\\n  -H "Authorization: Bearer $CHAVE" \\\n  -d '{"model": "{{model}}", "input": "Olá"}'`,
      },
      {
        match: { client: "sdk" },
        language: "typescript",
        code: `const resposta = await cliente.respostas.criar({\n  model: "{{model}}",\n  input: "Olá",\n});`,
      },
    ],
    variables: [
      {
        id: "model",
        label: "Modelo",
        options: [
          { value: "modelo-rapido", label: "Rápido" },
          { value: "modelo-grande", label: "Grande" },
        ],
        more: { label: "E mais", href: "#modelos" },
      },
    ],
    footerStart: (
      <Button variant="ghost" size="sm">
        Copiar para agente
      </Button>
    ),
    footerEnd: (
      <a
        href="#doc"
        className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        Ler a doc
        <ExternalLink aria-hidden="true" size={14} />
      </a>
    ),
  },
};

export const UmEixo: Story = {
  args: {
    axes: [
      {
        id: "arquivo",
        label: "Arquivo",
        options: [{ value: "css", label: "globals.css" }],
      },
    ],
    snippets: [
      {
        match: {},
        language: "css",
        code: '@import "@flowtomic/styles/globals.css";\n@import "@flowtomic/styles/theme.css";\n@import "@flowtomic/styles/typography.css";',
      },
    ],
    minLines: 3,
  },
};
