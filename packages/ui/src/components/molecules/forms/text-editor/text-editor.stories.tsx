import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { TextEditor } from "./text-editor";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/TextEditor",
  component: TextEditor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto exibido quando o editor está vazio",
    },
    editable: {
      control: "boolean",
      description: "Se o editor permite edição",
    },
    toolbar: {
      control: "boolean",
      description: "Exibe a barra de ferramentas",
    },
    outputFormat: {
      control: "select",
      options: ["markdown", "text"],
      description: "Formato de saída do onChange",
    },
    availableModes: {
      control: "object",
      description: "Modos disponíveis. Markdown sempre inclui preview automaticamente",
    },
  },
} satisfies Meta<typeof TextEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const INITIAL = `# Título\n\n**Negrito** e _itálico_.\n\n- Lista A\n- Lista B\n\n> Citação aqui.\n\n\`inline code\``;

/**
 * Editor de texto básico com todos os modos disponíveis (Rich, Markdown e Preview).
 * Modo padrão permite alternar entre edição WYSIWYG e código markdown.
 */
export const Basic: Story = {
  render: () => <TextEditor defaultValue={INITIAL} />,
};

/**
 * Editor controlado com feedback do valor atual.
 * Útil para integração com formulários e validação em tempo real.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(INITIAL);
    return (
      <div className="grid gap-4">
        <TextEditor value={value} onChange={setValue} />
        <div className="rounded-md border p-3 text-sm">
          <strong>Valor (markdown):</strong>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{value}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Editor com saída em texto plano (sem formatação markdown).
 * O outputFormat='text' remove as marcações e retorna apenas o texto puro.
 */
export const TextOutputFormat: Story = {
  render: () => {
    const [text, setText] = React.useState<string>("Texto plano inicial\nSegunda linha");
    return (
      <div className="grid gap-4">
        <TextEditor value={text} onChange={setText} outputFormat="text" />
        <div className="rounded-md border p-3 text-sm">
          <strong>Valor (text):</strong>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{text}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Modo único: apenas editor WYSIWYG sem abas.
 * Ideal para editores de documentos onde não é necessário visualizar ou editar markdown.
 */
export const RichModeOnly: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(INITIAL);
    return (
      <div className="grid gap-4">
        <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Modo único: <code>availableModes={["rich"]}</code>
          </p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            Apenas editor WYSIWYG, sem abas (ideal para editores de documentos).
          </p>
        </div>
        <TextEditor value={value} onChange={setValue} availableModes={["rich"]} />
        <div className="rounded-md border p-3 text-sm">
          <strong>Valor (markdown):</strong>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{value}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Modo único: Markdown + Preview com abas.
 * Perfeito para edição de README.md, documentação e arquivos markdown.
 * Markdown sempre inclui preview automaticamente.
 */
export const MarkdownModeOnly: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(INITIAL);
    return (
      <div className="grid gap-4">
        <div className="rounded-md border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-950">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Modo markdown: <code>availableModes={["markdown"]}</code>
          </p>
          <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
            Markdown sempre inclui preview em abas (ideal para README.md, documentação).
          </p>
        </div>
        <TextEditor value={value} onChange={setValue} availableModes={["markdown"]} />
      </div>
    );
  },
};

/**
 * Todos os modos disponíveis com sistema de abas.
 * Permite alternar entre Rich, Markdown e Preview conforme necessário.
 */
export const MultipleModesWithTabs: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(INITIAL);
    return (
      <div className="grid gap-4">
        <div className="rounded-md border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Todos os modos: <code>availableModes={["rich", "markdown"]}</code>
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            Rich + Markdown + Preview (markdown automaticamente adiciona preview).
          </p>
        </div>
        <TextEditor value={value} onChange={setValue} availableModes={["rich", "markdown"]} />
      </div>
    );
  },
};

/**
 * Controle externo do modo ativo.
 * Permite programaticamente alternar entre os modos usando props mode e onModeChange.
 */
export const ControlledMode: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(INITIAL);
    const [mode, setMode] = React.useState<"rich" | "markdown" | "preview">("rich");
    return (
      <div className="grid gap-4">
        <div className="rounded-md border-l-4 border-pink-500 bg-pink-50 p-4 dark:bg-pink-950">
          <p className="text-sm font-medium text-pink-900 dark:text-pink-100">
            Modo controlado externamente
          </p>
          <p className="mt-1 text-xs text-pink-700 dark:text-pink-300">
            Use <code>mode</code> e <code>onModeChange</code> para controlar o modo atual.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("rich")}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Rich
          </button>
          <button
            type="button"
            onClick={() => setMode("markdown")}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Markdown
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Preview
          </button>
        </div>
        <TextEditor value={value} onChange={setValue} mode={mode} onModeChange={setMode} />
        <div className="rounded-md border p-3 text-sm">
          <strong>Modo atual:</strong> {mode}
        </div>
      </div>
    );
  },
};

/**
 * Cores de texto personalizadas com seletor de paleta.
 * Grid com 28 cores predefinidas + opção para remover cor.
 * Use o botão de paleta (🎨) na toolbar para aplicar cores ao texto selecionado.
 */
export const TextColorFeature: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>(
      "Selecione este texto e mude a cor usando o botão de paleta na toolbar."
    );
    return (
      <div className="grid gap-4">
        <div className="rounded-md border-l-4 border-teal-500 bg-teal-50 p-4 dark:bg-teal-950">
          <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
            Cores de texto personalizadas
          </p>
          <p className="mt-1 text-xs text-teal-700 dark:text-teal-300">
            Selecione texto e use o botão de paleta (🎨) para aplicar cores. Grid com 28 cores
            predefinidas.
          </p>
        </div>
        <TextEditor value={value} onChange={setValue} availableModes={["rich"]} />
        <div className="rounded-md border p-3 text-sm">
          <strong>HTML gerado:</strong>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{value}</pre>
        </div>
      </div>
    );
  },
};
