import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useRef } from "react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputCommand,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandInput,
  PromptInputCommandItem,
  PromptInputCommandList,
  PromptInputCommandSeparator,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputHoverCard,
  PromptInputHoverCardContent,
  PromptInputHoverCardTrigger,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  type PromptInputProps,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  type PromptInputSubmitProps,
  PromptInputTab,
  PromptInputTabBody,
  PromptInputTabItem,
  PromptInputTabLabel,
  PromptInputTabsList,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
  usePromptInputController,
  useProviderAttachments,
} from "./prompt-input";

function renderPrompt(onSubmit = vi.fn(), submitProps: PromptInputSubmitProps = {}) {
  render(
    <PromptInput onSubmit={onSubmit}>
      <PromptInputTextarea aria-label="Mensagem" />
      <PromptInputFooter>
        <PromptInputSubmit {...submitProps} />
      </PromptInputFooter>
    </PromptInput>
  );
  return onSubmit;
}

describe("PromptInput", () => {
  it("não envia mensagem vazia com Enter", async () => {
    const onSubmit = renderPrompt();
    await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "   {Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia o texto com Enter e Shift+Enter só quebra a linha", async () => {
    const onSubmit = renderPrompt();
    const campo = screen.getByRole("textbox", { name: "Mensagem" });
    await userEvent.type(campo, "Linha 1{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(campo, "Linha 2{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ text: "Linha 1\nLinha 2" });
  });

  it("não usa sombra no contêiner (Hairline Rule)", () => {
    renderPrompt();
    const form = screen.getByRole("textbox", { name: "Mensagem" }).closest("form");
    expect(form).not.toHaveClass("shadow-sm");
  });
});

describe("PromptInputSubmit", () => {
  it("parado, é o botão de enviar, com nome e texto visíveis", () => {
    renderPrompt();
    const botao = screen.getByRole("button", { name: "Enviar" });
    expect(botao).toHaveAttribute("type", "submit");
    expect(botao).toHaveTextContent("Enviar");
  });

  it("fica desabilitado com o campo vazio, liga ao digitar e desliga de novo depois de enviar", async () => {
    const onSubmit = renderPrompt();
    const enviar = screen.getByRole("button", { name: "Enviar" });
    expect(enviar).toBeDisabled();
    const campo = screen.getByRole("textbox", { name: "Mensagem" });
    await userEvent.type(campo, "   ");
    expect(enviar).toBeDisabled();
    await userEvent.type(campo, "oi");
    expect(enviar).toBeEnabled();
    await userEvent.type(campo, "{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(enviar).toBeDisabled());
  });

  it("fora de um PromptInput não se desabilita sozinho", () => {
    render(<PromptInputSubmit />);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled();
  });

  it("com erro, continua sendo Enviar, para tentar de novo", () => {
    renderPrompt(vi.fn(), { status: "error" });
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
  });

  it.each([
    "submitted",
    "streaming",
  ] as const)("em %s, vira Parar no mesmo lugar e para sem reenviar", async (status) => {
    const onStop = vi.fn();
    const onSubmit = renderPrompt(vi.fn(), { status, onStop });
    await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "oi");
    const botao = screen.getByRole("button", { name: "Parar" });
    expect(botao).toHaveAttribute("type", "button");
    await userEvent.click(botao);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("respondendo sem onStop, o Parar fica desabilitado em vez de reenviar", () => {
    renderPrompt(vi.fn(), { status: "streaming" });
    expect(screen.getByRole("button", { name: "Parar" })).toBeDisabled();
  });
});

describe("PromptInputTextarea", () => {
  describe("Placeholder padrão em pt-BR", () => {
    it("mostra 'O que você gostaria de saber?' quando nenhum placeholder é passado", () => {
      render(
        <PromptInput onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>
        </PromptInput>
      );
      expect(screen.getByPlaceholderText("O que você gostaria de saber?")).toBeInTheDocument();
    });

    it("aceita um placeholder customizado no lugar do padrão", () => {
      render(
        <PromptInput onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Pergunte sobre o registry" />
          </PromptInputBody>
        </PromptInput>
      );
      expect(screen.getByPlaceholderText("Pergunte sobre o registry")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("O que você gostaria de saber?")
      ).not.toBeInTheDocument();
    });
  });
});

describe("PromptInputActionMenuTrigger", () => {
  it("expõe nome acessível 'Adicionar anexo' sem depender do tooltip", () => {
    render(
      <PromptInputActionMenu>
        <PromptInputActionMenuTrigger />
      </PromptInputActionMenu>
    );
    expect(screen.getByRole("button", { name: "Adicionar anexo" })).toBeInTheDocument();
  });
});

// Stub mínimo de SpeechRecognition: só o suficiente pra alternar isListening
// via onstart/onend, sem depender de reconhecimento de fala real do browser.
class FakeSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  start() {
    this.onstart?.();
  }
  stop() {
    this.onend?.();
  }
}

describe("PromptInputSpeechButton", () => {
  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: stub de API de browser não tipada no jsdom
    (window as any).SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: stub de API de browser não tipada no jsdom
    delete (window as any).SpeechRecognition;
  });

  it("expõe nome acessível 'Ditar por voz' e aria-pressed=false em repouso", () => {
    render(<PromptInputSpeechButton />);
    const button = screen.getByRole("button", { name: "Ditar por voz" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("marca aria-pressed=true enquanto está ditando", () => {
    render(<PromptInputSpeechButton />);
    const button = screen.getByRole("button", { name: "Ditar por voz" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});

// ---------------------------------------------------------------------------
// Anexos, colar, soltar e envio
// ---------------------------------------------------------------------------

// jsdom não tem URL.createObjectURL/revokeObjectURL nem fetch de blob: — só essas
// bordas do navegador são falsas; o resto do componente roda de verdade.
const criarUrlOriginal = URL.createObjectURL;
const revogarUrlOriginal = URL.revokeObjectURL;
let urlsRevogadas: string[] = [];

class FakeBlobResponse {
  async blob() {
    return new Blob(["conteudo"], { type: "image/png" });
  }
}

beforeEach(() => {
  let n = 0;
  urlsRevogadas = [];
  URL.createObjectURL = (() => `blob:fake-${++n}`) as typeof URL.createObjectURL;
  URL.revokeObjectURL = ((url: string) => {
    urlsRevogadas.push(url);
  }) as typeof URL.revokeObjectURL;
  vi.stubGlobal("fetch", async () => new FakeBlobResponse());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// O cleanup do RTL desmonta o componente depois do afterEach e ainda revoga URLs,
// então a restauração só pode vir ao fim do arquivo.
afterAll(() => {
  URL.createObjectURL = criarUrlOriginal;
  URL.revokeObjectURL = revogarUrlOriginal;
});

const imagem = (nome = "foto.png") => new File(["x"], nome, { type: "image/png" });
const pdf = (nome = "relatorio.pdf") => new File(["x"], nome, { type: "application/pdf" });

function renderComAnexos(props: Partial<PromptInputProps> = {}) {
  // vi.fn em volta do onSubmit recebido: devolve sempre um mock, com .mock tipado
  const onSubmit = vi.fn(props.onSubmit);
  render(
    <PromptInput {...props} onSubmit={onSubmit}>
      <PromptInputAttachments>{(a) => <PromptInputAttachment data={a} />}</PromptInputAttachments>
      <PromptInputTextarea aria-label="Mensagem" />
      <PromptInputFooter>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
  return {
    onSubmit,
    seletor: screen.getByLabelText("Enviar arquivos") as HTMLInputElement,
    campo: screen.getByRole("textbox", { name: "Mensagem" }) as HTMLTextAreaElement,
  };
}

describe("PromptInput: anexos pelo seletor de arquivos", () => {
  it("anexa a imagem escolhida e mostra a miniatura com o nome do arquivo", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComAnexos();
    await user.upload(seletor, imagem());
    expect(screen.getByRole("img", { name: "foto.png" })).toBeInTheDocument();
    expect(screen.getByText("foto.png")).toBeInTheDocument();
  });

  it("arquivo que não é imagem aparece só com o nome, sem miniatura", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComAnexos();
    await user.upload(seletor, pdf());
    expect(screen.getByText("relatorio.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("repassa accept e multiple ao seletor nativo", () => {
    const { seletor } = renderComAnexos({ accept: "image/*", multiple: true });
    expect(seletor).toHaveAttribute("accept", "image/*");
    expect(seletor).toHaveAttribute("multiple");
  });

  it("remove o anexo pelo botão 'Remover anexo' e libera a URL temporária", async () => {
    const user = userEvent.setup({ applyAccept: false, skipHover: true });
    const { seletor } = renderComAnexos();
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Remover anexo" }));
    expect(screen.queryByText("foto.png")).not.toBeInTheDocument();
    expect(urlsRevogadas).toContain("blob:fake-1");
  });

  it("Backspace com o campo vazio tira o último anexo", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor, campo } = renderComAnexos({ multiple: true });
    await user.upload(seletor, [imagem("a.png"), imagem("b.png")]);
    await user.click(campo);
    await user.keyboard("{Backspace}");
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.queryByText("b.png")).not.toBeInTheDocument();
  });

  it("Backspace com texto digitado só apaga o texto, os anexos ficam", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor, campo } = renderComAnexos();
    await user.upload(seletor, imagem());
    await user.type(campo, "ab{Backspace}");
    expect(campo).toHaveValue("a");
    expect(screen.getByText("foto.png")).toBeInTheDocument();
  });

  it("avisa com onError quando nenhum arquivo tem o tipo aceito", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onError = vi.fn();
    const { seletor } = renderComAnexos({ accept: "image/*", onError });
    await user.upload(seletor, pdf());
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: "accept" }));
    expect(screen.queryByText("relatorio.pdf")).not.toBeInTheDocument();
  });

  it("accept que não é de imagem não filtra nada", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComAnexos({ accept: ".pdf" });
    await user.upload(seletor, pdf());
    expect(screen.getByText("relatorio.pdf")).toBeInTheDocument();
  });

  it("com maxFileSize, descarta o arquivo grande e avisa", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onError = vi.fn();
    const grande = new File(["conteudo grande"], "grande.png", { type: "image/png" });
    const { seletor } = renderComAnexos({ maxFileSize: 3, onError });
    await user.upload(seletor, grande);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: "max_file_size" }));
    expect(screen.queryByText("grande.png")).not.toBeInTheDocument();
  });

  it("respeita maxFiles: anexa o que cabe e avisa dos que sobraram", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onError = vi.fn();
    const { seletor } = renderComAnexos({ maxFiles: 1, multiple: true, onError });
    await user.upload(seletor, [imagem("a.png"), imagem("b.png")]);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: "max_files" }));
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.queryByText("b.png")).not.toBeInTheDocument();
  });
});

describe("PromptInput: colar e soltar arquivos", () => {
  const colar = (campo: HTMLElement, itens: unknown) =>
    fireEvent.paste(campo, { clipboardData: { items: itens } });

  it("colar um arquivo no campo anexa o arquivo e não cola texto", () => {
    const { campo } = renderComAnexos();
    const naoCancelado = colar(campo, [
      { kind: "string", getAsFile: () => null },
      { kind: "file", getAsFile: () => null },
      { kind: "file", getAsFile: () => imagem("colada.png") },
    ]);
    expect(naoCancelado).toBe(false);
    expect(screen.getByText("colada.png")).toBeInTheDocument();
  });

  it("colar só texto deixa o navegador colar normalmente", () => {
    const { campo } = renderComAnexos();
    const naoCancelado = colar(campo, [{ kind: "string", getAsFile: () => null }]);
    expect(naoCancelado).toBe(true);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("colar sem dados da área de transferência não quebra", () => {
    const { campo } = renderComAnexos();
    expect(colar(campo, undefined)).toBe(true);
  });

  it("com globalDrop, soltar um arquivo em qualquer lugar da página anexa", () => {
    renderComAnexos({ globalDrop: true });
    fireEvent.drop(document.body, {
      dataTransfer: { files: [imagem("solta.png")], types: ["Files"] },
    });
    expect(screen.getByText("solta.png")).toBeInTheDocument();
  });

  it("com globalDrop, arrastar arquivo sobre a página libera o drop", () => {
    renderComAnexos({ globalDrop: true });
    const naoCancelado = fireEvent.dragOver(document.body, { dataTransfer: { types: ["Files"] } });
    expect(naoCancelado).toBe(false);
  });

  it("com globalDrop, arrastar texto não é interceptado e nada é anexado", () => {
    renderComAnexos({ globalDrop: true });
    expect(fireEvent.dragOver(document.body, { dataTransfer: { types: ["text/plain"] } })).toBe(
      true
    );
    expect(fireEvent.drop(document.body, { dataTransfer: { files: [], types: [] } })).toBe(true);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("sem globalDrop, soltar arquivo na página não anexa", () => {
    renderComAnexos();
    fireEvent.drop(document.body, {
      dataTransfer: { files: [imagem("solta.png")], types: ["Files"] },
    });
    expect(screen.queryByText("solta.png")).not.toBeInTheDocument();
  });

  it("soltar arquivo direto no formulário (sem globalDrop) anexa o arquivo", () => {
    const { campo } = renderComAnexos();
    const formulario = campo.closest("form") as HTMLFormElement;
    expect(fireEvent.dragOver(formulario, { dataTransfer: { types: ["Files"] } })).toBe(false);
    fireEvent.drop(formulario, {
      dataTransfer: { files: [imagem("solta.png")], types: ["Files"] },
    });
    expect(screen.getByText("solta.png")).toBeInTheDocument();
  });

  it("anexar um segundo arquivo não revoga a URL do primeiro, e sair da tela revoga as duas", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComAnexos();
    await user.upload(seletor, imagem("um.png"));
    await user.upload(seletor, imagem("dois.png"));
    expect(screen.getByText("um.png")).toBeInTheDocument();
    expect(urlsRevogadas).toEqual([]);
    cleanup();
    expect(urlsRevogadas).toEqual(expect.arrayContaining(["blob:fake-1", "blob:fake-2"]));
  });
});

describe("PromptInput: envio", () => {
  it("envia só o anexo, sem texto, com a URL já convertida em data URL", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor, onSubmit } = renderComAnexos();
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const mensagem = onSubmit.mock.calls[0][0];
    expect(mensagem.text).toBe("");
    expect(mensagem.files).toHaveLength(1);
    expect(mensagem.files?.[0]).toMatchObject({
      type: "file",
      mediaType: "image/png",
      filename: "foto.png",
    });
    expect(mensagem.files?.[0].url).toMatch(/^data:/);
    expect(mensagem.files?.[0]).not.toHaveProperty("id");
  });

  it("depois de enviar, os anexos e o texto somem do campo", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor, campo, onSubmit } = renderComAnexos();
    await user.upload(seletor, imagem());
    await user.type(campo, "olha isso");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.queryByText("foto.png")).not.toBeInTheDocument());
    expect(onSubmit.mock.calls[0][0].text).toBe("olha isso");
    expect(campo).toHaveValue("");
  });

  it("se o envio assíncrono falha, os anexos continuam para tentar de novo", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn().mockRejectedValue(new Error("falhou"));
    const { seletor } = renderComAnexos({ onSubmit });
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await act(async () => {});
    expect(screen.getByText("foto.png")).toBeInTheDocument();
  });

  it("se o envio assíncrono dá certo, limpa os anexos", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { seletor } = renderComAnexos({ onSubmit });
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.queryByText("foto.png")).not.toBeInTheDocument());
  });

  it("se onSubmit lança erro, os anexos continuam", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn(() => {
      throw new Error("boom");
    });
    const { seletor } = renderComAnexos({ onSubmit });
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.getByText("foto.png")).toBeInTheDocument();
  });

  it("com syncHiddenInput, o seletor nativo é esvaziado depois do envio", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComAnexos({ syncHiddenInput: true });
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.queryByText("foto.png")).not.toBeInTheDocument());
    expect(seletor.value).toBe("");
  });

  it("Enter durante composição de IME não envia, e envia depois que termina", async () => {
    const user = userEvent.setup();
    const { campo, onSubmit } = renderComAnexos();
    await user.type(campo, "ni");
    fireEvent.compositionStart(campo);
    fireEvent.keyDown(campo, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(campo);
    fireEvent.keyDown(campo, { key: "Enter", isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("outras teclas não enviam", async () => {
    const user = userEvent.setup();
    const { campo, onSubmit } = renderComAnexos();
    await user.type(campo, "a{Tab}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("PromptInputProvider", () => {
  function Sonda() {
    const c = usePromptInputController();
    return (
      <>
        <output aria-label="texto atual">{c.textInput.value}</output>
        <output aria-label="total de anexos">{c.attachments.files.length}</output>
        <button onClick={() => c.attachments.add([])} type="button">
          Adicionar vazio
        </button>
        <button onClick={() => c.attachments.clear()} type="button">
          Limpar anexos
        </button>
        <button onClick={() => c.attachments.openFileDialog()} type="button">
          Abrir seletor
        </button>
        <button onClick={() => c.textInput.setInput("de fora")} type="button">
          Preencher de fora
        </button>
      </>
    );
  }

  function renderComProvider(props: Partial<PromptInputProps> = {}) {
    const onSubmit = vi.fn(props.onSubmit);
    render(
      <PromptInputProvider initialInput="olá">
        <Sonda />
        <PromptInput {...props} onSubmit={onSubmit}>
          <PromptInputAttachments>
            {(a) => <PromptInputAttachment data={a} />}
          </PromptInputAttachments>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputSubmit />
        </PromptInput>
      </PromptInputProvider>
    );
    return {
      onSubmit,
      seletor: screen.getByLabelText("Enviar arquivos") as HTMLInputElement,
      campo: screen.getByRole("textbox", { name: "Mensagem" }),
    };
  }

  it("começa com o texto inicial e acompanha o que a pessoa digita", async () => {
    const user = userEvent.setup();
    const { campo } = renderComProvider();
    expect(campo).toHaveValue("olá");
    await user.type(campo, " mundo");
    expect(screen.getByLabelText("texto atual")).toHaveTextContent("olá mundo");
  });

  it("deixa quem está fora do formulário preencher o campo", async () => {
    const user = userEvent.setup();
    const { campo } = renderComProvider();
    await user.click(screen.getByRole("button", { name: "Preencher de fora" }));
    expect(campo).toHaveValue("de fora");
  });

  it("envia o texto do provider e limpa o campo depois", async () => {
    const user = userEvent.setup();
    const { campo, onSubmit } = renderComProvider();
    await user.type(campo, "{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ text: "olá" });
    await waitFor(() => expect(campo).toHaveValue(""));
  });

  it("com envio assíncrono que falha, o texto continua no campo", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("falhou"));
    const { campo } = renderComProvider({ onSubmit });
    await user.type(campo, "{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await act(async () => {});
    expect(campo).toHaveValue("olá");
  });

  it("anexos ficam no provider, visíveis fora do formulário, e podem ser limpos", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor } = renderComProvider();
    await user.upload(seletor, imagem());
    expect(screen.getByLabelText("total de anexos")).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "Limpar anexos" }));
    expect(screen.getByLabelText("total de anexos")).toHaveTextContent("0");
    expect(urlsRevogadas).toContain("blob:fake-1");
  });

  it("remover um anexo libera a URL e adicionar lista vazia não muda nada", async () => {
    const user = userEvent.setup({ applyAccept: false, skipHover: true });
    const { seletor } = renderComProvider();
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Adicionar vazio" }));
    expect(screen.getByLabelText("total de anexos")).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "Remover anexo" }));
    expect(screen.getByLabelText("total de anexos")).toHaveTextContent("0");
    expect(urlsRevogadas).toContain("blob:fake-1");
  });

  it("abrir o seletor pelo provider clica no input de arquivo do formulário", async () => {
    const user = userEvent.setup();
    const { seletor } = renderComProvider();
    const aoClicar = vi.fn();
    seletor.addEventListener("click", aoClicar);
    await user.click(screen.getByRole("button", { name: "Abrir seletor" }));
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("globalDrop também anexa pelo provider", () => {
    renderComProvider({ globalDrop: true });
    fireEvent.drop(document.body, {
      dataTransfer: { files: [imagem("solta.png")], types: ["Files"] },
    });
    expect(screen.getByLabelText("total de anexos")).toHaveTextContent("1");
  });

  it("anexar só um arquivo permite enviar sem texto", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { seletor, campo, onSubmit } = renderComProvider();
    await user.clear(campo);
    await user.upload(seletor, imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].files).toHaveLength(1);
  });

  describe("fora do provider", () => {
    it.each([
      ["usePromptInputController", () => usePromptInputController()],
      ["useProviderAttachments", () => useProviderAttachments()],
      ["usePromptInputAttachments", () => usePromptInputAttachments()],
    ])("%s sem o provider lança erro explicando como corrigir", (_nome, hook) => {
      function Quebrado() {
        hook();
        return null;
      }
      const erro = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<Quebrado />)).toThrow(/PromptInput/);
      erro.mockRestore();
    });
  });
});

describe("PromptInput: menu de anexos e botões", () => {
  function renderMenu(label?: string, onSelectOutro = vi.fn()) {
    const onSubmit = vi.fn();
    render(
      <PromptInput onSubmit={onSubmit}>
        <PromptInputTextarea aria-label="Mensagem" />
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label={label} />
                <PromptInputActionMenuItem onSelect={onSelectOutro}>
                  Colar da área de transferência
                </PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>
    );
    return { seletor: screen.getByLabelText("Enviar arquivos"), onSelectOutro, onSubmit };
  }

  it("'Adicionar fotos ou arquivos' abre o seletor de arquivos", async () => {
    const user = userEvent.setup();
    const { seletor } = renderMenu();
    const aoClicar = vi.fn();
    seletor.addEventListener("click", aoClicar);
    await user.click(screen.getByRole("button", { name: "Adicionar anexo" }));
    await user.click(await screen.findByRole("menuitem", { name: "Adicionar fotos ou arquivos" }));
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("funciona só pelo teclado e aceita rótulo próprio", async () => {
    const user = userEvent.setup();
    const { seletor } = renderMenu("Escolher no computador");
    const aoClicar = vi.fn();
    seletor.addEventListener("click", aoClicar);
    screen.getByRole("button", { name: "Adicionar anexo" }).focus();
    await user.keyboard("{Enter}");
    const item = await screen.findByRole("menuitem", { name: "Escolher no computador" });
    expect(item).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("outro item do menu dispara o seu próprio onSelect", async () => {
    const user = userEvent.setup();
    const { onSelectOutro } = renderMenu();
    await user.click(screen.getByRole("button", { name: "Adicionar anexo" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Colar da área de transferência" })
    );
    expect(onSelectOutro).toHaveBeenCalledTimes(1);
  });

  it("PromptInputButton não envia o formulário ao ser clicado", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <PromptInput onSubmit={onSubmit}>
        <PromptInputTextarea aria-label="Mensagem" defaultValue="oi" />
        <PromptInputButton aria-label="Pesquisar na web">Pesquisar</PromptInputButton>
      </PromptInput>
    );
    await user.click(screen.getByRole("button", { name: "Pesquisar na web" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("PromptInputButton respeita o size informado (ex.: icon-sm)", () => {
    render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputButton aria-label="Pesquisar na web" size="icon-sm">
          <span>P</span>
          <span>W</span>
        </PromptInputButton>
      </PromptInput>
    );
    // o tamanho é o comportamento aqui: icon-sm desenha um quadrado size-8
    expect(screen.getByRole("button", { name: "Pesquisar na web" })).toHaveClass("size-8");
  });

  it("clicar em Enviar desabilitado não envia", async () => {
    const user = userEvent.setup();
    const onSubmit = renderPrompt(vi.fn(), { disabled: true });
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Enter no campo não envia enquanto o botão Enviar está desabilitado", async () => {
    const user = userEvent.setup();
    const onSubmit = renderPrompt(vi.fn(), { disabled: true });
    await user.type(screen.getByRole("textbox", { name: "Mensagem" }), "oi{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Enviar e Parar aceitam conteúdo próprio", () => {
    const { unmount } = render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputSubmit aria-label="Mandar">Mandar</PromptInputSubmit>
      </PromptInput>
    );
    expect(screen.getByRole("button", { name: "Mandar" })).toBeInTheDocument();
    unmount();
    render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputSubmit onStop={vi.fn()} status="streaming">
          Interromper
        </PromptInputSubmit>
      </PromptInput>
    );
    expect(screen.getByRole("button", { name: "Interromper" })).toBeEnabled();
  });
});

// Stub de SpeechRecognition que guarda a instância criada, para o teste emitir eventos.
class FakeSpeechRecognitionRastreavel {
  static ultima: FakeSpeechRecognitionRastreavel | null = null;
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  constructor() {
    FakeSpeechRecognitionRastreavel.ultima = this;
  }
  start() {
    this.onstart?.();
  }
  stop() {
    this.onend?.();
  }
}

type Janela = { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };

describe("PromptInputSpeechButton: ditado", () => {
  const janela = window as unknown as Janela;
  const aoMudar = vi.fn();

  function CampoComVoz({ comRef = true }: { comRef?: boolean }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    return (
      <>
        <textarea aria-label="Campo" ref={ref} />
        <PromptInputSpeechButton
          onTranscriptionChange={aoMudar}
          textareaRef={comRef ? ref : undefined}
        />
      </>
    );
  }

  const falar = (...resultados: { final: boolean; texto?: string }[]) =>
    act(() => {
      FakeSpeechRecognitionRastreavel.ultima?.onresult?.({
        results: resultados.map((r) => ({
          isFinal: r.final,
          length: r.texto === undefined ? 0 : 1,
          0: r.texto === undefined ? undefined : { transcript: r.texto, confidence: 1 },
        })),
      });
    });

  beforeEach(() => {
    FakeSpeechRecognitionRastreavel.ultima = null;
    aoMudar.mockClear();
    janela.SpeechRecognition = FakeSpeechRecognitionRastreavel;
  });

  afterEach(() => {
    delete janela.SpeechRecognition;
    delete janela.webkitSpeechRecognition;
  });

  it("sem suporte do navegador, o botão fica desabilitado", () => {
    delete janela.SpeechRecognition;
    render(<CampoComVoz />);
    expect(screen.getByRole("button", { name: "Ditar por voz" })).toBeDisabled();
  });

  it("usa webkitSpeechRecognition quando é a única disponível", () => {
    delete janela.SpeechRecognition;
    janela.webkitSpeechRecognition = FakeSpeechRecognitionRastreavel;
    render(<CampoComVoz />);
    expect(screen.getByRole("button", { name: "Ditar por voz" })).toBeEnabled();
  });

  it("configura o reconhecimento em pt-BR, contínuo e com resultados parciais", () => {
    render(<CampoComVoz />);
    expect(FakeSpeechRecognitionRastreavel.ultima).toMatchObject({
      lang: "pt-BR",
      continuous: true,
      interimResults: true,
    });
  });

  it("clicar de novo para de ouvir", async () => {
    const user = userEvent.setup();
    render(<CampoComVoz />);
    const botao = screen.getByRole("button", { name: "Ditar por voz" });
    await user.click(botao);
    expect(botao).toHaveAttribute("aria-pressed", "true");
    await user.click(botao);
    expect(botao).toHaveAttribute("aria-pressed", "false");
  });

  it("escreve só o trecho final no campo e avisa onTranscriptionChange", () => {
    render(<CampoComVoz />);
    falar({ final: true, texto: "olá mundo" }, { final: false, texto: "provisório" });
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveValue("olá mundo");
    expect(aoMudar).toHaveBeenCalledWith("olá mundo");
  });

  it("o segundo trecho entra depois do texto existente, separado por espaço", () => {
    render(<CampoComVoz />);
    falar({ final: true, texto: "primeiro" });
    falar({ final: true, texto: "segundo" });
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveValue("primeiro segundo");
  });

  it("resultado final vazio ou só provisório não escreve nada", () => {
    render(<CampoComVoz />);
    falar({ final: true }, { final: false, texto: "quase" });
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveValue("");
    expect(aoMudar).not.toHaveBeenCalled();
  });

  it("sem textareaRef, a fala não quebra nada", () => {
    render(<CampoComVoz comRef={false} />);
    falar({ final: true, texto: "oi" });
    expect(aoMudar).not.toHaveBeenCalled();
  });

  it("erro de reconhecimento registra no console e para de ouvir", async () => {
    const user = userEvent.setup();
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CampoComVoz />);
    const botao = screen.getByRole("button", { name: "Ditar por voz" });
    await user.click(botao);
    act(() => FakeSpeechRecognitionRastreavel.ultima?.onerror?.({ error: "not-allowed" }));
    expect(botao).toHaveAttribute("aria-pressed", "false");
    expect(erro).toHaveBeenCalledWith("Speech recognition error:", "not-allowed");
    erro.mockRestore();
  });

  it("ao desmontar, interrompe o reconhecimento", () => {
    const { unmount } = render(<CampoComVoz />);
    const instancia = FakeSpeechRecognitionRastreavel.ultima;
    const parar = vi.spyOn(instancia as FakeSpeechRecognitionRastreavel, "stop");
    unmount();
    expect(parar).toHaveBeenCalled();
    parar.mockRestore();
  });

  it("no modo controlado (PromptInputProvider), o texto ditado chega ao provider", () => {
    const ref: { current: HTMLTextAreaElement | null } = { current: null };
    function Espiao() {
      return <output aria-label="No provider">{usePromptInputController().textInput.value}</output>;
    }
    render(
      <PromptInputProvider>
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputSpeechButton textareaRef={ref} />
        </PromptInput>
        <Espiao />
      </PromptInputProvider>
    );
    ref.current = screen.getByRole("textbox", { name: "Mensagem" }) as HTMLTextAreaElement;
    falar({ final: true, texto: "oi" });
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("oi");
    expect(screen.getByRole("status", { name: "No provider" })).toHaveTextContent("oi");
  });
});

describe("PromptInput: peças de composição", () => {
  it("o seletor de modelo mostra o valor e deixa escolher outra opção", async () => {
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputToolbar>
          <PromptInputModelSelect defaultValue="rapido" onValueChange={aoMudar}>
            <PromptInputModelSelectTrigger aria-label="Modelo">
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              <PromptInputModelSelectItem value="rapido">Rápido</PromptInputModelSelectItem>
              <PromptInputModelSelectItem value="preciso">Preciso</PromptInputModelSelectItem>
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputToolbar>
      </PromptInput>
    );
    const gatilho = screen.getByRole("combobox", { name: "Modelo" });
    expect(gatilho).toHaveTextContent("Rápido");
    await user.click(gatilho);
    await user.click(await screen.findByRole("option", { name: "Preciso" }));
    expect(aoMudar).toHaveBeenCalledWith("preciso");
  });

  it("a lista de comandos filtra ao digitar e mostra o vazio quando nada casa", async () => {
    const user = userEvent.setup();
    render(
      <PromptInputCommand>
        <PromptInputCommandInput aria-label="Buscar comando" placeholder="Buscar" />
        <PromptInputCommandList>
          <PromptInputCommandEmpty>Nenhum comando</PromptInputCommandEmpty>
          <PromptInputCommandGroup heading="Arquivos">
            <PromptInputCommandItem>Abrir arquivo</PromptInputCommandItem>
          </PromptInputCommandGroup>
          <PromptInputCommandSeparator />
          <PromptInputCommandGroup heading="Ajuda">
            <PromptInputCommandItem>Ver atalhos</PromptInputCommandItem>
          </PromptInputCommandGroup>
        </PromptInputCommandList>
      </PromptInputCommand>
    );
    await user.type(screen.getByPlaceholderText("Buscar"), "atalhos");
    expect(screen.getByText("Ver atalhos")).toBeInTheDocument();
    expect(screen.queryByText("Abrir arquivo")).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar"), "zzz");
    expect(screen.getByText("Nenhum comando")).toBeInTheDocument();
  });

  it("o hover card abre com o conteúdo ao passar o mouse", async () => {
    const user = userEvent.setup();
    render(
      <PromptInputHoverCard>
        <PromptInputHoverCardTrigger asChild>
          <button type="button">Contexto</button>
        </PromptInputHoverCardTrigger>
        <PromptInputHoverCardContent>Detalhes do contexto</PromptInputHoverCardContent>
      </PromptInputHoverCard>
    );
    await user.hover(screen.getByRole("button", { name: "Contexto" }));
    expect(await screen.findByText("Detalhes do contexto")).toBeInTheDocument();
  });

  it("cabeçalho, corpo e abas renderizam o conteúdo recebido", () => {
    render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputHeader>Cabeçalho</PromptInputHeader>
        <PromptInputBody>
          <PromptInputTabsList>
            <PromptInputTab>
              <PromptInputTabLabel>Recentes</PromptInputTabLabel>
              <PromptInputTabBody>
                <PromptInputTabItem>plano.md</PromptInputTabItem>
              </PromptInputTabBody>
            </PromptInputTab>
          </PromptInputTabsList>
        </PromptInputBody>
      </PromptInput>
    );
    expect(screen.getByText("Cabeçalho")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recentes" })).toBeInTheDocument();
    expect(screen.getByText("plano.md")).toBeInTheDocument();
  });
});

describe("PromptInputAttachment: pré-visualização", () => {
  const dados = (extra: Record<string, unknown>) => ({
    id: "a1",
    type: "file" as const,
    url: "blob:x",
    mediaType: "image/png",
    filename: "foto.png",
    ...extra,
  });

  function renderAnexo(data: ReturnType<typeof dados>) {
    render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputAttachment data={data} />
      </PromptInput>
    );
  }

  it("ao passar o mouse, mostra a pré-visualização, o nome e o tipo do arquivo", async () => {
    const user = userEvent.setup();
    renderAnexo(dados({}));
    await user.hover(screen.getByText("foto.png"));
    expect(await screen.findByText("image/png")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "foto.png" })).toHaveLength(2);
  });

  it("imagem sem nome é chamada de 'Imagem' e arquivo sem nome de 'Anexo'", () => {
    const { unmount } = render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputAttachment data={dados({ filename: undefined })} />
      </PromptInput>
    );
    expect(screen.getByText("Imagem")).toBeInTheDocument();
    unmount();
    renderAnexo(dados({ filename: undefined, mediaType: "application/pdf" }));
    expect(screen.getByText("Anexo")).toBeInTheDocument();
  });

  it("sem tipo de mídia, a pré-visualização não mostra a linha do tipo", async () => {
    const user = userEvent.setup();
    renderAnexo(dados({ mediaType: undefined, filename: "solto" }));
    await user.hover(screen.getByText("solto"));
    expect(await screen.findByRole("heading", { name: "solto" })).toBeInTheDocument();
    expect(screen.queryByText("image/png")).not.toBeInTheDocument();
  });
});

describe("PromptInput: acessibilidade", () => {
  it("o formulário completo não tem violações de acessibilidade", async () => {
    const { container } = render(
      <PromptInput onSubmit={vi.fn()}>
        <PromptInputTextarea aria-label="Mensagem" />
        <PromptInputFooter>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
          </PromptInputActionMenu>
          <PromptInputSpeechButton />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    );
    const resultado = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});

describe("PromptInput: casos de borda do provider e do formulário", () => {
  function SondaDeAnexos() {
    const anexos = useProviderAttachments();
    return <output aria-label="anexos do provider">{anexos.files.length}</output>;
  }

  it("useProviderAttachments devolve os anexos dentro do provider", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(
      <PromptInputProvider>
        <SondaDeAnexos />
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
        </PromptInput>
      </PromptInputProvider>
    );
    await user.upload(screen.getByLabelText("Enviar arquivos"), imagem());
    expect(screen.getByLabelText("anexos do provider")).toHaveTextContent("1");
  });

  it("com provider e envio assíncrono que dá certo, limpa o texto e os anexos", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <PromptInputProvider initialInput="olá">
        <SondaDeAnexos />
        <PromptInput onSubmit={onSubmit}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputSubmit />
        </PromptInput>
      </PromptInputProvider>
    );
    await user.upload(screen.getByLabelText("Enviar arquivos"), imagem());
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue(""));
    expect(screen.getByLabelText("anexos do provider")).toHaveTextContent("0");
  });

  it("com provider, o onChange do campo também é chamado", async () => {
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    render(
      <PromptInputProvider>
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" onChange={aoMudar} />
        </PromptInput>
      </PromptInputProvider>
    );
    await user.type(screen.getByRole("textbox", { name: "Mensagem" }), "a");
    expect(aoMudar).toHaveBeenCalledTimes(1);
  });

  it("o formulário só intercepta arrasto de arquivo; texto passa direto", () => {
    const { campo } = renderComAnexos();
    const formulario = campo.closest("form") as HTMLFormElement;
    expect(fireEvent.dragOver(formulario, { dataTransfer: { types: ["text/plain"] } })).toBe(true);
    fireEvent.drop(formulario, { dataTransfer: { files: [], types: [] } });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
