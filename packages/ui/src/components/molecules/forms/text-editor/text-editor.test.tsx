import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { TextEditor } from "./text-editor";

// O ProseMirror mede posições ao digitar/rolar; o jsdom não implementa essas APIs de layout.
const semLayout = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
const originais = {
  elementFromPoint: document.elementFromPoint,
  rangeRects: Range.prototype.getClientRects,
  rangeBox: Range.prototype.getBoundingClientRect,
  textRects: (Text.prototype as unknown as { getClientRects?: () => DOMRectList }).getClientRects,
};
beforeAll(() => {
  document.elementFromPoint = () => null;
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => ({ ...semLayout, toJSON: () => semLayout });
  (Text.prototype as unknown as { getClientRects: () => DOMRectList }).getClientRects = () =>
    [] as unknown as DOMRectList;
});
afterAll(() => {
  document.elementFromPoint = originais.elementFromPoint;
  Range.prototype.getClientRects = originais.rangeRects;
  Range.prototype.getBoundingClientRect = originais.rangeBox;
  (Text.prototype as unknown as { getClientRects?: () => DOMRectList }).getClientRects =
    originais.textRects;
});

describe("TextEditor - toolbar acessível", () => {
  it("expõe nome acessível para o botão de negrito, sem depender só do tooltip", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
  });

  it("expõe nome acessível para outro botão da toolbar (itálico)", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Itálico" })).toBeInTheDocument();
  });

  it("marca aria-pressed=false quando o negrito não está ativo", () => {
    render(<TextEditor availableModes={["rich"]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("alterna aria-pressed do negrito a cada clique", async () => {
    render(<TextEditor availableModes={["rich"]} />);
    const bold = screen.getByRole("button", { name: "Negrito" });

    fireEvent.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));

    fireEvent.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "false"));
  });
});

describe("TextEditor - abas e cor em pt-BR", () => {
  it("as abas de modo têm nome em português", () => {
    render(<TextEditor availableModes={["rich", "markdown"]} />);
    expect(screen.getByRole("tab", { name: "Visual" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Markdown" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Prévia" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Rich|Preview/ })).not.toBeInTheDocument();
  });

  it("o botão de cor tem nome e as amostras são nomeadas, sem crescer no hover", async () => {
    render(<TextEditor availableModes={["rich"]} />);
    await userEvent.click(screen.getByRole("button", { name: "Cor do texto" }));
    const blue = await screen.findByRole("button", { name: "Azul" });
    expect(blue.className).not.toMatch(/scale/);
    const remove = screen.getByRole("button", { name: "Remover cor" });
    expect(remove).not.toHaveTextContent("✕");
  });
});

describe("TextEditor: modos e abas", () => {
  it("só com markdown mostra Markdown e Prévia, sem a aba Visual", () => {
    render(<TextEditor availableModes={["markdown"]} />);
    expect(screen.queryByRole("tab", { name: "Visual" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Markdown", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Prévia" })).toBeInTheDocument();
  });

  it("sem modos válidos cai no editor visual, sem abas", () => {
    render(<TextEditor availableModes={[]} aria-label="Descrição" />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
  });

  it("modos repetidos não duplicam abas", () => {
    render(<TextEditor availableModes={["markdown", "markdown", "rich", "rich"]} />);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("clicar numa aba troca o modo e avisa onModeChange", async () => {
    const onModeChange = vi.fn();
    render(<TextEditor onModeChange={onModeChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Markdown" }));
    expect(screen.getByRole("tab", { name: "Markdown", selected: true })).toBeInTheDocument();
    expect(onModeChange).toHaveBeenCalledWith("markdown");
  });

  it("as abas respondem às setas do teclado", async () => {
    const onModeChange = vi.fn();
    render(<TextEditor onModeChange={onModeChange} />);
    screen.getByRole("tab", { name: "Visual" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onModeChange).toHaveBeenCalledWith("markdown");
    expect(screen.getByRole("tab", { name: "Markdown", selected: true })).toBeInTheDocument();
  });

  it("começa no modo informado quando ele existe nos modos disponíveis", () => {
    render(<TextEditor mode="markdown" />);
    expect(screen.getByRole("tab", { name: "Markdown", selected: true })).toBeInTheDocument();
  });

  it("ignora um modo inicial que não está disponível e começa no primeiro", () => {
    render(<TextEditor mode="markdown" availableModes={["rich"]} />);
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
  });
});

describe("TextEditor: modo markdown e prévia", () => {
  it("digitar no modo markdown avisa onChange com o texto cru", async () => {
    const onChange = vi.fn();
    render(<TextEditor mode="markdown" onChange={onChange} aria-label="Texto" />);
    await userEvent.type(screen.getByRole("textbox", { name: "Texto" }), "# Oi");
    expect(onChange).toHaveBeenLastCalledWith("# Oi");
  });

  it("com outputFormat text, onChange recebe o markdown sem a marcação", async () => {
    const onChange = vi.fn();
    render(
      <TextEditor mode="markdown" outputFormat="text" onChange={onChange} aria-label="Texto" />
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Texto" }), "**forte**");
    expect(onChange).toHaveBeenLastCalledWith("forte");
  });

  it("mostra o valor controlado no campo markdown", () => {
    render(<TextEditor mode="markdown" value="## Título" aria-label="Texto" />);
    expect(screen.getByRole("textbox", { name: "Texto" })).toHaveValue("## Título");
  });

  it("usa defaultValue como texto inicial", () => {
    render(<TextEditor mode="markdown" defaultValue="rascunho" aria-label="Texto" />);
    expect(screen.getByRole("textbox", { name: "Texto" })).toHaveValue("rascunho");
  });

  it("a prévia renderiza o markdown digitado", async () => {
    render(<TextEditor aria-label="Texto" />);
    await userEvent.click(screen.getByRole("tab", { name: "Markdown" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Texto" }), "**forte**");
    await userEvent.click(screen.getByRole("tab", { name: "Prévia" }));
    const forte = await screen.findByText("forte");
    expect(forte.tagName).toBe("SPAN");
    expect(forte.closest('[data-streamdown="strong"], strong')).not.toBeNull();
  });

  it("o placeholder aparece no campo markdown vazio", () => {
    render(<TextEditor mode="markdown" placeholder="Conte a história" />);
    expect(screen.getByPlaceholderText("Conte a história")).toBeInTheDocument();
  });
});

describe("TextEditor: editor visual", () => {
  it("a área de digitação é um textbox com o nome passado em aria-label", async () => {
    render(<TextEditor availableModes={["rich"]} aria-label="Descrição" />);
    const area = await screen.findByRole("textbox", { name: "Descrição" });
    expect(area).toHaveAttribute("aria-multiline", "true");
  });

  it("digitar no editor avisa onChange com o markdown", async () => {
    const onChange = vi.fn();
    render(<TextEditor availableModes={["rich"]} onChange={onChange} aria-label="Texto" />);
    await userEvent.type(await screen.findByRole("textbox", { name: "Texto" }), "Olá");
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("Olá"));
  });

  it("com outputFormat text, onChange recebe só o texto", async () => {
    const onChange = vi.fn();
    render(
      <TextEditor
        availableModes={["rich"]}
        outputFormat="text"
        onChange={onChange}
        aria-label="Texto"
      />
    );
    const area = await screen.findByRole("textbox", { name: "Texto" });
    await userEvent.type(area, "Olá");
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("Olá"));
  });

  it("o botão de negrito formata o que se digita e o onChange sai em markdown", async () => {
    const onChange = vi.fn();
    render(<TextEditor availableModes={["rich"]} onChange={onChange} aria-label="Texto" />);
    const area = await screen.findByRole("textbox", { name: "Texto" });
    await userEvent.click(screen.getByRole("button", { name: "Negrito" }));
    await userEvent.type(area, "forte");
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("**forte**"));
  });

  it("reflete o valor controlado em markdown como conteúdo formatado", async () => {
    const { rerender } = render(
      <TextEditor availableModes={["rich"]} value="# Primeiro" aria-label="Texto" />
    );
    expect(await screen.findByRole("heading", { name: "Primeiro" })).toBeInTheDocument();

    rerender(<TextEditor availableModes={["rich"]} value="# Segundo" aria-label="Texto" />);
    expect(await screen.findByRole("heading", { name: "Segundo" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Primeiro" })).not.toBeInTheDocument();
  });

  it("com editable false a área não aceita digitação", async () => {
    render(<TextEditor availableModes={["rich"]} editable={false} aria-label="Texto" />);
    const area = await screen.findByRole("textbox", { name: "Texto" });
    expect(area).toHaveAttribute("contenteditable", "false");
  });

  it("toolbar false esconde todos os botões de formatação", () => {
    render(<TextEditor availableModes={["rich"]} toolbar={false} />);
    expect(screen.queryByRole("button", { name: "Negrito" })).not.toBeInTheDocument();
  });

  it("allowedActions limita os botões da toolbar", () => {
    render(<TextEditor availableModes={["rich"]} allowedActions={["bold", "image"]} />);
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inserir imagem" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Itálico" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cor do texto" })).not.toBeInTheDocument();
  });

  it.each([
    "Itálico",
    "Tachado",
    "Código inline",
    "Título H1",
    "Título H2",
    "Título H3",
    "Lista não ordenada",
    "Lista ordenada",
    "Citação",
    "Centralizar",
    "Alinhar à direita",
  ])("o botão %s fica ativo (aria-pressed) depois de clicado", async (nome) => {
    render(<TextEditor availableModes={["rich"]} />);
    await screen.findByRole("textbox");
    const botao = screen.getByRole("button", { name: nome });
    await userEvent.click(botao);
    await waitFor(() => expect(botao).toHaveAttribute("aria-pressed", "true"));
  });

  it("alinhar à esquerda volta o alinhamento depois de centralizar", async () => {
    render(<TextEditor availableModes={["rich"]} />);
    await screen.findByRole("textbox");
    await userEvent.click(screen.getByRole("button", { name: "Centralizar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Centralizar" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
    );
    await userEvent.click(screen.getByRole("button", { name: "Alinhar à esquerda" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Alinhar à esquerda" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
    );
    expect(screen.getByRole("button", { name: "Centralizar" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});

describe("TextEditor: cor do texto", () => {
  it("escolher uma cor pinta o que se digita; Remover cor desfaz", async () => {
    render(<TextEditor availableModes={["rich"]} aria-label="Texto" />);
    const area = await screen.findByRole("textbox", { name: "Texto" });

    await userEvent.click(screen.getByRole("button", { name: "Cor do texto" }));
    await userEvent.click(await screen.findByRole("button", { name: "Azul" }));
    await userEvent.type(area, "azul");
    await waitFor(() => expect(area.querySelector("span[style]")).not.toBeNull());
    expect((area.querySelector("span[style]") as HTMLElement).style.color).toBe(
      "rgb(59, 130, 246)"
    );

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Cor do texto" }));
    await userEvent.click(await screen.findByRole("button", { name: "Remover cor" }));
    await userEvent.type(area, " normal");
    await waitFor(() => expect(area.textContent).toBe("azul normal"));
    const spans = area.querySelectorAll("span[style]");
    expect(Array.from(spans).map((el) => el.textContent)).toEqual(["azul"]);
  });
});

describe("TextEditor: inserir imagem", () => {
  class FakeUploader {
    readonly arquivos: File[] = [];
    constructor(private readonly url: string) {}
    enviar = async (arquivo: File): Promise<string> => {
      this.arquivos.push(arquivo);
      return this.url;
    };
  }

  function interceptarInputDeArquivo(): { pegar: () => HTMLInputElement; restaurar: () => void } {
    const original = document.createElement.bind(document);
    const criados: HTMLInputElement[] = [];
    const spy = vi.spyOn(document, "createElement").mockImplementation(((
      tag: string,
      opcoes?: ElementCreationOptions
    ) => {
      const el = original(tag, opcoes);
      if (tag === "input") {
        criados.push(el as HTMLInputElement);
        (el as HTMLInputElement).click = () => {};
      }
      return el;
    }) as typeof document.createElement);
    return { pegar: () => criados[criados.length - 1], restaurar: () => spy.mockRestore() };
  }

  async function escolherArquivo(input: HTMLInputElement, arquivos: File[]) {
    Object.defineProperty(input, "files", { value: arquivos, configurable: true });
    await input.onchange?.(new Event("change"));
  }

  it("abre o seletor só de imagens ao clicar em Inserir imagem", async () => {
    const intercepta = interceptarInputDeArquivo();
    render(<TextEditor availableModes={["rich"]} />);
    await screen.findByRole("textbox");
    await userEvent.click(screen.getByRole("button", { name: "Inserir imagem" }));
    const input = intercepta.pegar();
    expect(input.type).toBe("file");
    expect(input.accept).toBe("image/*");
    intercepta.restaurar();
  });

  it("envia o arquivo por onUploadImage e põe a imagem devolvida no texto", async () => {
    const uploader = new FakeUploader("https://cdn.exemplo.com/foto.png");
    const intercepta = interceptarInputDeArquivo();
    render(
      <TextEditor availableModes={["rich"]} onUploadImage={uploader.enviar} aria-label="Texto" />
    );
    const area = await screen.findByRole("textbox", { name: "Texto" });
    await userEvent.click(screen.getByRole("button", { name: "Inserir imagem" }));

    const arquivo = new File(["x"], "foto.png", { type: "image/png" });
    await escolherArquivo(intercepta.pegar(), [arquivo]);

    await waitFor(() => expect(area.querySelector("img")).not.toBeNull());
    expect(uploader.arquivos).toEqual([arquivo]);
    expect(area.querySelector("img")).toHaveAttribute("src", "https://cdn.exemplo.com/foto.png");
    expect(area.querySelector("img")).toHaveAttribute("alt", "foto.png");
    intercepta.restaurar();
  });

  it("sem onUploadImage usa uma URL local do arquivo", async () => {
    const criarUrl = vi.fn(() => "blob:local/abc");
    const original = URL.createObjectURL;
    URL.createObjectURL = criarUrl;
    const intercepta = interceptarInputDeArquivo();
    render(<TextEditor availableModes={["rich"]} aria-label="Texto" />);
    const area = await screen.findByRole("textbox", { name: "Texto" });
    await userEvent.click(screen.getByRole("button", { name: "Inserir imagem" }));

    await escolherArquivo(intercepta.pegar(), [new File(["x"], "foto.png", { type: "image/png" })]);

    await waitFor(() => expect(area.querySelector("img")).toHaveAttribute("src", "blob:local/abc"));
    expect(criarUrl).toHaveBeenCalledTimes(1);
    URL.createObjectURL = original;
    intercepta.restaurar();
  });

  it("cancelar o seletor, sem arquivo, não insere nada", async () => {
    const uploader = new FakeUploader("https://cdn.exemplo.com/foto.png");
    const intercepta = interceptarInputDeArquivo();
    render(
      <TextEditor availableModes={["rich"]} onUploadImage={uploader.enviar} aria-label="Texto" />
    );
    const area = await screen.findByRole("textbox", { name: "Texto" });
    await userEvent.click(screen.getByRole("button", { name: "Inserir imagem" }));

    await escolherArquivo(intercepta.pegar(), []);

    expect(area.querySelector("img")).toBeNull();
    expect(uploader.arquivos).toHaveLength(0);
    intercepta.restaurar();
  });
});

describe("TextEditor: acessibilidade", () => {
  it("não tem violações no editor visual com a toolbar", async () => {
    const { container } = render(<TextEditor aria-label="Texto" />);
    await screen.findByRole("textbox", { name: "Texto" });
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
