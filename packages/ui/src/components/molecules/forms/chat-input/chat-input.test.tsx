import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
