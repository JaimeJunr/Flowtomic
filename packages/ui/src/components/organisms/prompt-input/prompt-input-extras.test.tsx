import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  PromptInput,
  PromptInputEffort,
  PromptInputFooter,
  type PromptInputMenuItem,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputTriggerMenu,
} from "./prompt-input";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(cleanup);

const SOURCES: PromptInputMenuItem[] = [
  { key: "files", label: "Arquivos", description: "anexar do computador" },
  { key: "drive", label: "Drive" },
  { key: "web", label: "Web" },
];
const COMMANDS: PromptInputMenuItem[] = [
  { key: "sum", label: "/resumir" },
  { key: "tr", label: "/traduzir" },
];

function renderMenus(onSubmit = vi.fn(), reduced: "always" | "never" = "always") {
  render(
    <MotionConfig reducedMotion={reduced}>
      <PromptInput onSubmit={onSubmit}>
        <PromptInputTextarea aria-label="Mensagem" />
        <PromptInputTriggerMenu trigger="@" items={SOURCES} />
        <PromptInputTriggerMenu trigger="/" items={COMMANDS} />
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </MotionConfig>
  );
  return {
    onSubmit,
    campo: screen.getByRole("textbox", { name: "Mensagem" }) as HTMLTextAreaElement,
  };
}

describe("PromptInputTriggerMenu", () => {
  it("@dr abre o listbox só com Drive e o textarea aponta para o listbox sem aria-expanded (inválido em textbox)", async () => {
    const { campo } = renderMenus();
    expect(campo).not.toHaveAttribute("aria-expanded");
    await userEvent.type(campo, "@dr");
    const lista = await screen.findByRole("listbox");
    const opcoes = screen.getAllByRole("option");
    expect(opcoes).toHaveLength(1);
    expect(opcoes[0]).toHaveTextContent("Drive");
    expect(campo).not.toHaveAttribute("aria-expanded");
    expect(campo).toHaveAttribute("aria-controls", lista.id);
    expect(campo).toHaveAttribute("aria-activedescendant", opcoes[0].id);
    expect(opcoes[0]).toHaveAttribute("aria-selected", "true");
  });

  it("↓ + Enter insere '@Drive ' e não envia o formulário", async () => {
    const { campo, onSubmit } = renderMenus();
    await userEvent.type(campo, "@");
    await screen.findByRole("listbox");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await userEvent.keyboard("{ArrowDown}");
    const opcoes = screen.getAllByRole("option");
    expect(campo).toHaveAttribute("aria-activedescendant", opcoes[1].id);
    await userEvent.keyboard("{Enter}");
    expect(campo.value).toBe("@Drive ");
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("comando '/' não repete a barra ao inserir", async () => {
    const { campo } = renderMenus();
    await userEvent.type(campo, "/res");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Tab}");
    expect(campo.value).toBe("/resumir ");
  });

  it("Escape fecha o menu e o Enter seguinte volta a enviar", async () => {
    const { campo, onSubmit } = renderMenus();
    await userEvent.type(campo, "oi @dr");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(campo).not.toHaveAttribute("aria-expanded");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("gatilho no meio de palavra não abre o menu", async () => {
    const { campo } = renderMenus();
    await userEvent.type(campo, "a/b mail@dr");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("mostra o texto vazio quando nada casa", async () => {
    const { campo } = renderMenus();
    await userEvent.type(campo, "@zzz");
    expect(await screen.findByText("Nada encontrado")).toBeInTheDocument();
  });

  it("onSelect próprio recebe o item e a API insert", async () => {
    const onSelect = vi.fn((_item: PromptInputMenuItem, api: { insert: (t: string) => void }) =>
      api.insert("#web ")
    );
    render(
      <MotionConfig reducedMotion="always">
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputTriggerMenu trigger="@" items={SOURCES} onSelect={onSelect} />
        </PromptInput>
      </MotionConfig>
    );
    const campo = screen.getByRole("textbox", { name: "Mensagem" }) as HTMLTextAreaElement;
    await userEvent.type(campo, "ver @we");
    await userEvent.click(await screen.findByRole("option", { name: /Web/ }));
    expect(onSelect).toHaveBeenCalledWith(SOURCES[2], expect.any(Object));
    expect(campo.value).toBe("ver #web ");
  });
});

describe("PromptInputEffort", () => {
  const STEPS = ["Baixo", "Médio", "Alto", "Máximo"];

  function renderEffort(reduced: "always" | "never", sparks = true) {
    const onValueChange = vi.fn();
    render(
      <MotionConfig reducedMotion={reduced}>
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputEffort steps={STEPS} sparks={sparks} onValueChange={onValueChange} />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </MotionConfig>
    );
    return { onValueChange, form: document.querySelector("form") as HTMLFormElement };
  }

  async function goToMax() {
    await userEvent.click(screen.getByRole("button", { name: /Esforço/ }));
    const thumb = await screen.findByRole("slider");
    thumb.focus();
    fireEvent.keyDown(thumb, { key: "End" });
    return thumb;
  }

  it("começa no passo do meio, sem data-effort=max", async () => {
    const { form } = renderEffort("always");
    expect(form).toHaveAttribute("data-effort", "default");
    expect(screen.getByRole("button", { name: /Esforço/ })).toHaveTextContent("Médio");
  });

  it("último passo põe data-effort=max, avisa a mudança e expõe aria-valuetext", async () => {
    const { form, onValueChange } = renderEffort("never");
    const thumb = await goToMax();
    await waitFor(() => expect(form).toHaveAttribute("data-effort", "max"));
    expect(onValueChange).toHaveBeenCalledWith("Máximo");
    expect(thumb).toHaveAttribute("aria-valuetext", "Máximo");
    expect(form.querySelectorAll('[data-slot="prompt-input-spark"]').length).toBeGreaterThanOrEqual(
      10
    );
    expect(form.querySelectorAll('[data-slot="prompt-input-spark"]').length).toBeLessThanOrEqual(
      14
    );
  });

  it("com movimento reduzido mantém o brilho (data-effort) mas sem faíscas", async () => {
    const { form } = renderEffort("always");
    await goToMax();
    await waitFor(() => expect(form).toHaveAttribute("data-effort", "max"));
    expect(form.querySelectorAll('[data-slot="prompt-input-spark"]')).toHaveLength(0);
  });

  it("sparks=false não renderiza faíscas no máximo", async () => {
    const { form } = renderEffort("never", false);
    await goToMax();
    await waitFor(() => expect(form).toHaveAttribute("data-effort", "max"));
    expect(form.querySelectorAll('[data-slot="prompt-input-spark"]')).toHaveLength(0);
  });

  it("aceita value controlado", async () => {
    render(
      <MotionConfig reducedMotion="always">
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputEffort steps={STEPS} value="Máximo" />
        </PromptInput>
      </MotionConfig>
    );
    expect(document.querySelector("form")).toHaveAttribute("data-effort", "max");
  });
});

describe("PromptInputSubmit morph", () => {
  it("troca o ícone entre enviar e parar ao mudar o status, direto com movimento reduzido", () => {
    const view = (status: "ready" | "streaming") => (
      <MotionConfig reducedMotion="always">
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputSubmit status={status} onStop={() => {}} />
        </PromptInput>
      </MotionConfig>
    );
    const { rerender } = render(view("ready"));
    expect(screen.getByRole("button", { name: "Enviar" }).querySelector("svg")).toHaveClass(
      "lucide-arrow-up"
    );
    rerender(view("streaming"));
    expect(screen.getByRole("button", { name: "Parar" }).querySelector("svg")).toHaveClass(
      "lucide-square"
    );
    rerender(view("ready"));
    expect(screen.getByRole("button", { name: "Enviar" }).querySelector("svg")).toHaveClass(
      "lucide-arrow-up"
    );
  });

  it("com animação, o ícone troca no meio da transição", async () => {
    const view = (status: "ready" | "streaming") => (
      <MotionConfig reducedMotion="never">
        <PromptInput onSubmit={vi.fn()}>
          <PromptInputTextarea aria-label="Mensagem" />
          <PromptInputSubmit status={status} onStop={() => {}} />
        </PromptInput>
      </MotionConfig>
    );
    const { rerender } = render(view("ready"));
    rerender(view("streaming"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Parar" }).querySelector("svg")).toHaveClass(
        "lucide-square"
      )
    );
  });
});
