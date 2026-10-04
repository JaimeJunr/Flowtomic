import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./reasoning";

describe("ReasoningTrigger", () => {
  describe("Mensagem padrão em pt-BR", () => {
    it("mostra 'Pensando…' enquanto está em streaming", () => {
      render(
        <Reasoning isStreaming>
          <ReasoningTrigger />
        </Reasoning>
      );
      expect(screen.getByText("Pensando…")).toBeInTheDocument();
    });

    it("mostra a duração em segundos quando o raciocínio já terminou", () => {
      render(
        <Reasoning duration={7} isStreaming={false}>
          <ReasoningTrigger />
        </Reasoning>
      );
      expect(screen.getByText("Pensou por 7 segundos")).toBeInTheDocument();
    });
  });
});

describe("Reasoning", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const montar = (props: Parameters<typeof Reasoning>[0] = {}) => (
    <Reasoning {...props}>
      <ReasoningTrigger />
      <ReasoningContent>Comparei as duas opções de tema.</ReasoningContent>
    </Reasoning>
  );

  it("sem duração conhecida, diz que pensou por alguns segundos", () => {
    render(montar());
    expect(screen.getByText("Pensou por alguns segundos")).toBeInTheDocument();
  });

  it("duração 0 ainda aparece como 'Pensando…'", () => {
    render(montar({ duration: 0 }));
    expect(screen.getByText("Pensando…")).toBeInTheDocument();
  });

  it("o gatilho expande e recolhe o raciocínio e avisa onOpenChange", async () => {
    const user = userEvent.setup();
    const aoMudar = vi.fn();
    render(montar({ onOpenChange: aoMudar, defaultOpen: false, duration: 3 }));
    const gatilho = screen.getByRole("button", { name: /Pensou por 3 segundos/ });
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
    await user.click(gatilho);
    expect(aoMudar).toHaveBeenLastCalledWith(true);
    expect(screen.getByText("Comparei as duas opções de tema.")).toBeInTheDocument();
    await user.click(gatilho);
    expect(aoMudar).toHaveBeenLastCalledWith(false);
    expect(screen.queryByText("Comparei as duas opções de tema.")).not.toBeInTheDocument();
  });

  it("no modo controlado, quem manda é a prop open", () => {
    const { rerender } = render(montar({ open: true }));
    expect(screen.getByText("Comparei as duas opções de tema.")).toBeInTheDocument();
    rerender(montar({ open: false }));
    expect(screen.queryByText("Comparei as duas opções de tema.")).not.toBeInTheDocument();
  });

  it("fecha sozinho 1s depois de parar de pensar", () => {
    vi.useFakeTimers();
    render(montar({ defaultOpen: true }));
    expect(screen.getByText("Comparei as duas opções de tema.")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Comparei as duas opções de tema.")).not.toBeInTheDocument();
  });

  it("enquanto pensa fica aberto; ao terminar, conta os segundos e só então fecha", () => {
    vi.useFakeTimers();
    const { rerender } = render(montar({ isStreaming: true }));
    expect(screen.getByText("Pensando…")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3200);
    });
    expect(screen.getByText("Comparei as duas opções de tema.")).toBeInTheDocument();
    rerender(montar({ isStreaming: false }));
    expect(screen.getByText("Pensou por 4 segundos")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Comparei as duas opções de tema.")).not.toBeInTheDocument();
  });

  it("com defaultOpen false não fecha sozinho nem abre sozinho", () => {
    vi.useFakeTimers();
    render(montar({ defaultOpen: false }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Comparei as duas opções de tema.")).not.toBeInTheDocument();
  });

  it("o gatilho aceita conteúdo próprio no lugar da mensagem padrão", () => {
    render(
      <Reasoning>
        <ReasoningTrigger>Ver raciocínio</ReasoningTrigger>
      </Reasoning>
    );
    expect(screen.getByRole("button", { name: "Ver raciocínio" })).toBeInTheDocument();
    expect(screen.queryByText(/Pensou/)).not.toBeInTheDocument();
  });

  it("gatilho fora do Reasoning lança erro explicando o uso", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ReasoningTrigger />)).toThrow(
      "Reasoning components must be used within Reasoning"
    );
    erro.mockRestore();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(montar({ defaultOpen: true, duration: 2 }));
    const resultado = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});
