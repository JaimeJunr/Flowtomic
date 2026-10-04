import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChatInput, type ChatInputProps } from "./chat-input";

const modes = [
  { value: "write", label: "Escrever" },
  { value: "suggest", label: "Pedir sugestão" },
];

function Controlled(props: Partial<ChatInputProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return <ChatInput onSubmit={() => {}} {...props} value={value} onChange={setValue} />;
}

describe("ChatInput", () => {
  describe("Um botão sólido por tela", () => {
    it("o modo é uma escolha (radio), não um segundo botão sólido brigando com Enviar", () => {
      render(<Controlled modes={modes} selectedMode="write" />);
      const group = screen.getByRole("group", { name: "Modo" });
      const write = screen.getByRole("radio", { name: "Escrever" });
      expect(group).toContainElement(write);
      expect(write).toBeChecked();
      expect(screen.getByRole("radio", { name: "Pedir sugestão" })).not.toBeChecked();
      expect(group.innerHTML).not.toMatch(/bg-primary\b|shadow-/);
    });

    it("o tipo de mensagem segue o mesmo padrão e avisa a troca", async () => {
      const onMessageTypeChange = vi.fn();
      render(
        <Controlled
          messageTypes={[
            { value: "SAY", label: "Fala" },
            { value: "ACTION", label: "Ação" },
          ]}
          selectedMessageType="SAY"
          onMessageTypeChange={onMessageTypeChange}
        />
      );
      expect(screen.getByRole("group", { name: "Tipo de mensagem" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("radio", { name: "Ação" }));
      expect(onMessageTypeChange).toHaveBeenCalledWith("ACTION");
    });

    it("Enviar não é pílula", () => {
      render(<Controlled value="oi" />);
      expect(screen.getByRole("button", { name: /Enviar/ }).className).not.toMatch(/rounded-full/);
    });
  });

  describe("Campo e contador", () => {
    it("o campo tem nome acessível e o placeholder padrão em português", () => {
      render(<Controlled />);
      const field = screen.getByRole("textbox", { name: "Mensagem" });
      expect(field).toHaveAttribute("placeholder", "Escreva sua mensagem");
    });

    it("o contador é texto em mono com milhar em pt-BR, sem pílula nem sombra", () => {
      render(<Controlled />);
      const counter = screen.getByText("1.500 restantes");
      expect(counter.className).toMatch(/font-mono/);
      expect(counter.className).not.toMatch(/rounded-full|shadow/);
    });

    it("perto do limite o contador ganha cor de aviso", async () => {
      render(<Controlled maxLength={20} />);
      await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "a".repeat(19));
      expect(screen.getByText("1 restante").className).toMatch(/text-warning/);
    });
  });

  describe("Atalhos", () => {
    it("mostra os atalhos curtos em mono", () => {
      render(<Controlled />);
      expect(screen.getByText("Ctrl+Enter").className).toMatch(/font-mono/);
      expect(screen.getByText("Esc").className).toMatch(/font-mono/);
    });

    it("Ctrl+Enter envia o texto aparado e limpa o campo", async () => {
      const onSubmit = vi.fn();
      render(<Controlled onSubmit={onSubmit} />);
      const field = screen.getByRole("textbox", { name: "Mensagem" });
      await userEvent.type(field, "  oi  ");
      await userEvent.keyboard("{Control>}{Enter}{/Control}");
      expect(onSubmit).toHaveBeenCalledWith("oi", undefined, undefined);
      expect(field).toHaveValue("");
    });
  });

  it("o cabeçalho mostra só o título, sem glifo decorativo", () => {
    render(<Controlled showHeader headerTitle="Nova mensagem" />);
    expect(screen.getByText("Nova mensagem")).toBeInTheDocument();
    expect(screen.queryByText("■")).not.toBeInTheDocument();
  });
});

describe("ChatInput: envio, limites e estados", () => {
  const digitar = (texto: string) =>
    userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), texto);

  it("o botão Enviar envia o texto aparado com tipo e modo escolhidos e limpa o campo", async () => {
    const onSubmit = vi.fn();
    render(
      <Controlled
        onSubmit={onSubmit}
        messageTypes={[{ value: "SAY", label: "Fala" }]}
        selectedMessageType="SAY"
        modes={modes}
        selectedMode="suggest"
      />
    );
    await digitar("  olá  ");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledWith("olá", "SAY", "suggest");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("");
  });

  it("Cmd+Enter (Meta) também envia", async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    await digitar("oi");
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSubmit).toHaveBeenCalledWith("oi", undefined, undefined);
  });

  it("Enter sozinho não envia: quebra linha", async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    await digitar("oi{Enter}tchau");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("oi\ntchau");
  });

  it("Escape limpa o campo", async () => {
    render(<Controlled />);
    await digitar("rascunho");
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("");
  });

  it("com texto em branco o envio não acontece, nem por botão nem por atalho", async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await digitar("   ");
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("passou do limite: contador negativo em tom de erro e envio bloqueado", async () => {
    const onSubmit = vi.fn();
    render(<ChatInput value="abcdefgh" onChange={() => {}} onSubmit={onSubmit} maxLength={5} />);
    expect(screen.getByText("-3 restantes").className).toMatch(/text-destructive/);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    screen.getByRole("textbox", { name: "Mensagem" }).focus();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("no limite exato (0 restantes) o contador fica em erro, mas ainda dá para enviar", async () => {
    const onSubmit = vi.fn();
    render(<ChatInput value="abcde" onChange={() => {}} onSubmit={onSubmit} maxLength={5} />);
    expect(screen.getByText("0 restantes").className).toMatch(/text-destructive/);
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledWith("abcde", undefined, undefined);
  });

  it("longe do limite o contador fica em tom neutro", () => {
    render(<Controlled maxLength={100} />);
    expect(screen.getByText("100 restantes").className).toMatch(/text-muted-foreground/);
  });

  it("carregando, o botão diz Enviando..., o campo e o envio ficam bloqueados", async () => {
    const onSubmit = vi.fn();
    render(<ChatInput value="oi" onChange={() => {}} onSubmit={onSubmit} isLoading />);
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("desabilitado, não envia nem digita", () => {
    render(<ChatInput value="oi" onChange={() => {}} onSubmit={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toBeDisabled();
  });

  it("atalhos personalizados aparecem com os nomes que a pessoa vê no teclado", () => {
    render(<Controlled shortcuts={{ submit: "Meta+Enter", clear: "Escape" }} />);
    expect(screen.getByText("Cmd+Enter")).toBeInTheDocument();
    expect(screen.getByText("Esc")).toBeInTheDocument();
  });

  it("sem atalho de envio, Ctrl+Enter não envia e a dica some", async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} shortcuts={{ clear: "Escape" }} />);
    expect(screen.queryByText("Ctrl+Enter")).not.toBeInTheDocument();
    await digitar("oi");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sem atalho de limpar, Escape não limpa e a dica some", async () => {
    render(<Controlled shortcuts={{ submit: "Ctrl+Enter" }} />);
    expect(screen.queryByText("Esc")).not.toBeInTheDocument();
    await digitar("oi");
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("oi");
  });

  it("showCounter falso esconde o contador", () => {
    render(<Controlled showCounter={false} />);
    expect(screen.queryByText(/restantes/)).not.toBeInTheDocument();
  });

  it("mostra os indicadores passados no rodapé", () => {
    render(<Controlled indicators={<span>Rascunho salvo</span>} />);
    expect(screen.getByText("Rascunho salvo")).toBeInTheDocument();
  });

  it("o cabeçalho mostra a descrição e some quando showHeader é falso", () => {
    const { rerender } = render(
      <Controlled showHeader headerTitle="Nova mensagem" headerDescription="Fale com o mestre" />
    );
    expect(screen.getByText("Fale com o mestre")).toBeInTheDocument();
    rerender(<Controlled headerTitle="Nova mensagem" headerDescription="Fale com o mestre" />);
    expect(screen.queryByText("Nova mensagem")).not.toBeInTheDocument();
  });

  it("usa o placeholder passado", () => {
    render(<Controlled placeholder="Diga algo" />);
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveAttribute(
      "placeholder",
      "Diga algo"
    );
  });

  it("as opções com ícone mostram o ícone escondido do leitor de tela e a dica do modo", () => {
    render(
      <Controlled
        modes={[
          {
            value: "write",
            label: "Escrever",
            icon: <svg data-testid="icone" />,
            description: "Texto livre",
          },
        ]}
        selectedMode="write"
      />
    );
    expect(screen.getByTestId("icone").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("radio", { name: "Escrever" }).closest("label")).toHaveAttribute(
      "title",
      "Texto livre"
    );
  });

  it("trocar de modo sem onModeChange não quebra", async () => {
    render(<Controlled modes={modes} selectedMode="write" />);
    await userEvent.click(screen.getByRole("radio", { name: "Pedir sugestão" }));
    expect(screen.getByRole("radio", { name: "Escrever" })).toBeChecked();
  });

  it("avisa onModeChange ao escolher outro modo", async () => {
    const onModeChange = vi.fn();
    render(<Controlled modes={modes} selectedMode="write" onModeChange={onModeChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Pedir sugestão" }));
    expect(onModeChange).toHaveBeenCalledWith("suggest");
  });

  it("listas vazias de tipos e modos não desenham grupo nenhum", () => {
    render(<Controlled modes={[]} messageTypes={[]} />);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <Controlled
        modes={modes}
        selectedMode="write"
        showHeader
        headerTitle="Nova mensagem"
        indicators={<span>Rascunho</span>}
      />
    );
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
