import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { useState } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CodeTabs, type CodeTabsProps } from "./code-tabs";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const axes: CodeTabsProps["axes"] = [
  {
    id: "pm",
    label: "Gerenciador",
    options: [
      { value: "bun", label: "bun" },
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
    ],
  },
  {
    id: "lang",
    label: "Linguagem",
    placement: "end",
    options: [
      { value: "ts", label: "TypeScript" },
      { value: "js", label: "JavaScript" },
    ],
  },
];

const snippets: CodeTabsProps["snippets"] = [
  { match: { pm: "bun", lang: "ts" }, code: "bunx add-ts", language: "bash" },
  { match: { pm: "bun", lang: "js" }, code: "bunx add-js", language: "bash" },
  { match: { pm: "npm", lang: "ts" }, code: "npx add-ts", language: "bash" },
  { match: { pm: "pnpm" }, code: "pnpm dlx add", language: "bash" },
];

function panel() {
  return screen.getByRole("tabpanel");
}

// o userEvent.setup() instala o próprio clipboard: o spy entra depois dele
function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

describe("CodeTabs", () => {
  it("renderiza o snippet do primeiro valor de cada eixo", async () => {
    render(<CodeTabs axes={axes} snippets={snippets} />);
    expect(await within(panel()).findByText("bunx add-ts")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "bun" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "TypeScript" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("trocar o eixo primário troca o código", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<CodeTabs axes={axes} snippets={snippets} />);
    await user.click(screen.getByRole("tab", { name: "npm" }));
    expect(await within(panel()).findByText("npx add-ts")).toBeInTheDocument();
  });

  it("move entre abas com as setas", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<CodeTabs axes={axes} snippets={snippets} />);
    screen.getByRole("tab", { name: "bun" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(await within(panel()).findByText("npx add-ts")).toBeInTheDocument();
  });

  it("esconde opção sem exemplo e faz o eixo posterior pular ao trocar o anterior", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<CodeTabs axes={axes} snippets={snippets} defaultValue={{ pm: "bun", lang: "js" }} />);
    expect(await within(panel()).findByText("bunx add-js")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "npm" }));
    // npm só tem exemplo em TypeScript
    expect(screen.queryByRole("tab", { name: "JavaScript" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "TypeScript" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(await within(panel()).findByText("npx add-ts")).toBeInTheDocument();
  });

  it("eixo placement end fica na última linha, depois do eixo primário", () => {
    render(<CodeTabs axes={axes} snippets={snippets} />);
    const lists = screen.getAllByRole("tablist");
    expect(lists).toHaveLength(2);
    expect(lists[0]).toHaveAttribute("data-axis", "pm");
    expect(lists[1]).toHaveAttribute("data-axis", "lang");
    expect(lists[0].closest("div.justify-between")).toBe(lists[1].closest("div.justify-between"));
  });

  it("chip de variável troca {{id}} no código exibido", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(
      <CodeTabs
        axes={[{ id: "a", label: "Exemplo", options: [{ value: "x", label: "X" }] }]}
        snippets={[{ match: {}, code: 'model: "{{model}}"', language: "typescript" }]}
        variables={[
          {
            id: "model",
            label: "Modelo",
            options: [
              { value: "rapido", label: "Rápido" },
              { value: "grande", label: "Grande" },
            ],
          },
        ]}
      />
    );
    expect(await within(panel()).findByText(/model: "rapido"/)).toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: "Modelo" });
    await user.click(within(group).getByRole("radio", { name: "Grande" }));
    expect(await within(panel()).findByText(/model: "grande"/)).toBeInTheDocument();
  });

  it("chips de variável respondem às setas", async () => {
    render(
      <CodeTabs
        axes={[]}
        snippets={[{ match: {}, code: "{{v}}", language: "text" }]}
        variables={[
          {
            id: "v",
            label: "Valor",
            options: [
              { value: "um", label: "Um" },
              { value: "dois", label: "Dois" },
            ],
          },
        ]}
      />
    );
    screen.getByRole("radio", { name: "Um" }).focus();
    fireEvent.keyDown(screen.getByRole("radio", { name: "Um" }), { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Dois" })).toBeChecked());
  });

  it("copiar escreve o código substituído e chama onCopy com ele", async () => {
    const user = userEvent.setup({ skipHover: true });
    const writeText = mockClipboard();
    const onCopy = vi.fn();
    render(
      <CodeTabs
        axes={[]}
        snippets={[{ match: {}, code: "usar {{v}}", language: "text" }]}
        variables={[{ id: "v", label: "Valor", options: [{ value: "abc", label: "ABC" }] }]}
        onCopy={onCopy}
      />
    );
    await user.click(screen.getByRole("button", { name: "Copiar código" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("usar abc"));
    expect(onCopy).toHaveBeenCalledWith("usar abc");
    expect(await screen.findByRole("button", { name: "Copiado" })).toBeInTheDocument();
  });

  it("controlado: onValueChange recebe a seleção e o componente só muda com value novo", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CodeTabs
        axes={axes}
        snippets={snippets}
        value={{ pm: "bun", lang: "ts" }}
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("tab", { name: "npm" }));
    expect(onValueChange).toHaveBeenCalledWith({ pm: "npm", lang: "ts" });
    expect(screen.getByRole("tab", { name: "bun" })).toHaveAttribute("aria-selected", "true");
    expect(await within(panel()).findByText("bunx add-ts")).toBeInTheDocument();
    rerender(
      <CodeTabs
        axes={axes}
        snippets={snippets}
        value={{ pm: "npm", lang: "ts" }}
        onValueChange={onValueChange}
      />
    );
    expect(await within(panel()).findByText("npx add-ts")).toBeInTheDocument();
  });

  it("não controlado mantém a seleção interna", async () => {
    const user = userEvent.setup({ skipHover: true });
    function Harness() {
      const [last, setLast] = useState("");
      return (
        <>
          <CodeTabs
            axes={axes}
            snippets={snippets}
            onValueChange={(v) => setLast(JSON.stringify(v))}
          />
          <output>{last}</output>
        </>
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole("tab", { name: "pnpm" }));
    expect(await within(panel()).findByText("pnpm dlx add")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent('"pm":"pnpm"');
  });

  it("um eixo só: uma linha de abas", () => {
    render(<CodeTabs axes={[axes[0]]} snippets={snippets} />);
    expect(screen.getAllByRole("tablist")).toHaveLength(1);
  });

  it("sem casamento mostra o estado vazio", () => {
    render(<CodeTabs axes={axes} snippets={[]} />);
    expect(screen.getByText("Sem exemplo para esta combinação.")).toBeInTheDocument();
  });

  it("rodapé só aparece com footerStart ou footerEnd", () => {
    const { container, rerender } = render(<CodeTabs axes={axes} snippets={snippets} />);
    expect(container.querySelector("[data-slot=code-tabs-footer]")).toBeNull();
    rerender(
      <CodeTabs axes={axes} snippets={snippets} footerStart={<span>Copiar para agente</span>} />
    );
    expect(container.querySelector("[data-slot=code-tabs-footer]")).toHaveTextContent(
      "Copiar para agente"
    );
    rerender(<CodeTabs axes={axes} snippets={snippets} footerEnd={<a href="/doc">Ler a doc</a>} />);
    expect(screen.getByRole("link", { name: "Ler a doc" })).toBeInTheDocument();
  });

  it("chip 'mais' é link fora do grupo de rádio", () => {
    render(
      <CodeTabs
        axes={[]}
        snippets={[{ match: {}, code: "x", language: "text" }]}
        variables={[
          {
            id: "v",
            label: "Valor",
            options: [{ value: "a", label: "A" }],
            more: { label: "E mais", href: "/mais" },
          },
        ]}
      />
    );
    const link = screen.getByRole("link", { name: "E mais" });
    expect(link).toHaveAttribute("href", "/mais");
    expect(screen.getByRole("radiogroup").contains(link)).toBe(false);
  });

  it("eixo end com mais de 3 opções vira select", async () => {
    const user = userEvent.setup({ skipHover: true });
    const many: CodeTabsProps["axes"] = [
      {
        id: "lang",
        label: "Linguagem",
        placement: "end",
        options: ["a", "b", "c", "d"].map((v) => ({ value: v, label: v.toUpperCase() })),
      },
    ];
    const list = many[0].options.map((o) => ({
      match: { lang: o.value },
      code: `codigo-${o.value}`,
      language: "text" as const,
    }));
    render(<CodeTabs axes={many} snippets={list} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Linguagem" }), "c");
    expect(await within(panel()).findByText("codigo-c")).toBeInTheDocument();
  });

  it("marca o valor trocado por variável quando a API de highlight existe", async () => {
    const user = userEvent.setup({ skipHover: true });
    const set = vi.fn();
    const remove = vi.fn();
    class FakeHighlight {}
    if (!globalThis.CSS) vi.stubGlobal("CSS", {});
    Object.defineProperty(globalThis.CSS, "highlights", {
      value: { set, delete: remove },
      configurable: true,
    });
    vi.stubGlobal("Highlight", FakeHighlight);
    try {
      render(
        <CodeTabs
          axes={[]}
          snippets={[{ match: {}, code: "valor {{v}}", language: "text" }]}
          variables={[
            {
              id: "v",
              label: "Valor",
              options: [
                { value: "aaa", label: "A" },
                { value: "bbb", label: "B" },
              ],
            },
          ]}
        />
      );
      await user.click(screen.getByRole("radio", { name: "B" }));
      await waitFor(() =>
        expect(set).toHaveBeenCalledWith("code-tabs-change", expect.any(FakeHighlight))
      );
      await waitFor(() => expect(remove).toHaveBeenCalledWith("code-tabs-change"), {
        timeout: 2000,
      });
    } finally {
      vi.unstubAllGlobals();
      Reflect.deleteProperty(globalThis.CSS, "highlights");
    }
  });
});
