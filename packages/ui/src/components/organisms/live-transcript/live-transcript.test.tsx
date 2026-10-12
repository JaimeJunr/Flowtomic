import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  LiveTranscript,
  type LiveTranscriptEntry,
  type LiveTranscriptProps,
} from "./live-transcript";

const entries: LiveTranscriptEntry[] = [
  { id: "a", speaker: "Outros", time: "14:02", text: "We should ship the dark theme." },
  { id: "b", speaker: "Você", side: "me", time: "14:03", text: "Concordo." },
];

function setup(props: Partial<LiveTranscriptProps> = {}) {
  return render(<LiveTranscript title="Reunião de planejamento" entries={entries} {...props} />);
}

function setScroll(
  el: HTMLElement,
  { scrollHeight, clientHeight, scrollTop }: Record<string, number>
) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight });
  Object.defineProperty(el, "scrollTop", { configurable: true, writable: true, value: scrollTop });
}

describe("LiveTranscript", () => {
  it("renderiza a seção nomeada pelo título, uma fala por entrada, com nome e hora", () => {
    const { container, unmount } = setup();
    const section = screen.getByRole("region", { name: "Reunião de planejamento" });
    expect(section).toHaveAttribute("data-slot", "live-transcript");
    expect(container.querySelectorAll('[data-slot="live-transcript-entry"]')).toHaveLength(2);
    expect(screen.getByText("Outros")).toBeInTheDocument();
    expect(screen.getByText("14:02")).toHaveClass("font-mono");
    expect(container.querySelector('[data-slot="live-transcript-header"]')).toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveAttribute("data-slot", "live-transcript-log");
    unmount();

    render(<LiveTranscript entries={entries} />);
    expect(screen.getByRole("region", { name: "Transcrição ao vivo" })).toBeInTheDocument();
  });

  it("fala de terceiros em itálico; fala própria sem itálico", () => {
    const { container } = setup();
    const [them, me] = Array.from(
      container.querySelectorAll('[data-slot="live-transcript-entry"]')
    );
    expect(them).toHaveAttribute("data-side", "them");
    expect(me).toHaveAttribute("data-side", "me");
    expect(screen.getByText("We should ship the dark theme.")).toHaveClass("italic");
    expect(screen.getByText("Concordo.")).not.toHaveClass("italic");
  });

  it("annotation mostra rótulo e conteúdo; a ação chama onClick", async () => {
    const onClick = vi.fn();
    const { container } = setup({
      entries: [
        {
          ...entries[0],
          annotation: {
            label: "Tradução para português",
            content: "Deveríamos lançar o tema escuro.",
            action: { label: "Copiar", onClick },
          },
        },
      ],
    });
    const box = container.querySelector('[data-slot="live-transcript-annotation"]') as HTMLElement;
    expect(within(box).getByText("Tradução para português")).toBeInTheDocument();
    expect(within(box).getByText("Deveríamos lançar o tema escuro.")).toBeInTheDocument();
    await userEvent.click(within(box).getByRole("button", { name: "Copiar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("partial marca data-partial e aria-busy, e esconde o texto parcial do anúncio", () => {
    const { container } = setup({
      entries: [
        entries[0],
        { id: "p", speaker: "Outros", text: "Parcial em curso", partial: true },
      ],
    });
    const items = container.querySelectorAll('[data-slot="live-transcript-entry"]');
    expect(items[0]).toHaveAttribute("data-partial", "false");
    expect(items[0]).not.toHaveAttribute("aria-busy");
    expect(items[1]).toHaveAttribute("data-partial", "true");
    expect(items[1]).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Parcial em curso").closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("lista vazia mostra o emptyState padrão e o customizado", () => {
    const { unmount } = setup({ entries: [] });
    expect(
      screen.getByText(
        "Nada transcrito ainda. Fale ou compartilhe o áudio da reunião para começar."
      )
    ).toBeInTheDocument();
    unmount();
    setup({ entries: [], emptyState: <p>Abra o app da reunião.</p> });
    expect(screen.getByText("Abra o app da reunião.")).toBeInTheDocument();
  });

  it("status muda o texto do estado; elapsed formata mm:ss e h:mm:ss", () => {
    const { rerender } = setup({ status: "live", elapsed: 75 });
    expect(screen.getByText("Ao vivo")).toBeInTheDocument();
    expect(screen.getByText("01:15")).toBeInTheDocument();
    const props = { title: "Reunião de planejamento", entries };
    rerender(<LiveTranscript {...props} status="paused" elapsed={3725} />);
    expect(screen.getByText("Pausado")).toBeInTheDocument();
    expect(screen.getByText("1:02:05")).toBeInTheDocument();
    rerender(<LiveTranscript {...props} status="stopped" />);
    expect(screen.getByText("Encerrado")).toBeInTheDocument();
    rerender(<LiveTranscript {...props} status="connecting" />);
    expect(screen.getByText("Conectando…")).toBeInTheDocument();
  });

  it("medidores: role=meter com valor preso em 0..100; Ocultar e Mostrar", async () => {
    const user = userEvent.setup();
    const { container } = setup({
      meters: [
        { id: "m1", label: "Você", level: 0.42, language: "pt" },
        { id: "m2", label: "Outros", level: 1.7, language: "en" },
        { id: "m3", label: "Sala", level: -1 },
      ],
    });
    expect(container.querySelector('[data-slot="live-transcript-meters"]')).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Nível de áudio: Você" })).toHaveAttribute(
      "aria-valuenow",
      "42"
    );
    expect(screen.getByRole("meter", { name: "Nível de áudio: Outros" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    const sala = screen.getByRole("meter", { name: "Nível de áudio: Sala" });
    expect(sala).toHaveAttribute("aria-valuenow", "0");
    expect(sala).toHaveAttribute("aria-valuemin", "0");
    expect(sala).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("pt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ocultar" }));
    expect(screen.queryAllByRole("meter")).toHaveLength(0);
    expect(screen.getByText("Medidores de áudio")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mostrar" }));
    expect(screen.getAllByRole("meter")).toHaveLength(3);
  });

  it("metersCollapsible=false não mostra o botão; defaultMetersOpen=false começa recolhido", () => {
    const meters = [{ id: "m1", label: "Você", level: 0.5 }];
    const { unmount } = setup({ meters, metersCollapsible: false });
    expect(screen.queryByRole("button", { name: "Ocultar" })).not.toBeInTheDocument();
    expect(screen.getByRole("meter")).toBeInTheDocument();
    unmount();
    setup({ meters, defaultMetersOpen: false });
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mostrar" })).toBeInTheDocument();
  });

  it("controles: pausar, retomar e parar chamam os callbacks", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onStop = vi.fn();
    const props = { title: "Reunião", entries, onPause, onResume, onStop };
    const { rerender, container } = render(<LiveTranscript {...props} status="live" />);
    expect(container.querySelector('[data-slot="live-transcript-controls"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pausar" }));
    expect(onPause).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Parar" }));
    expect(onStop).toHaveBeenCalledTimes(1);

    rerender(<LiveTranscript {...props} status="paused" />);
    expect(screen.queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retomar" }));
    expect(onResume).toHaveBeenCalledTimes(1);

    rerender(<LiveTranscript {...props} status="stopped" />);
    expect(screen.getByRole("button", { name: "Pausar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Parar" })).toBeDisabled();
  });

  it("sem callbacks os botões de pausar e parar não existem", () => {
    const { container } = setup();
    expect(container.querySelector('[data-slot="live-transcript-controls"]')).toBeNull();
  });

  it("seletor de idioma chama onLanguageChange", async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    setup({
      languages: [
        { value: "pt-BR", label: "Português" },
        { value: "en", label: "Inglês" },
      ],
      language: "pt-BR",
      onLanguageChange,
    });
    await user.click(screen.getByRole("combobox", { name: "Idioma da tradução" }));
    await user.click(await screen.findByRole("option", { name: "Inglês" }));
    expect(onLanguageChange).toHaveBeenCalledWith("en");
  });

  it("primaryAction chama onClick, mostra o atalho e põe aria-keyshortcuts", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    setup({ primaryAction: { label: "Analisar transcrição", onClick, shortcut: "Ctrl D" } });
    const button = screen.getByRole("button", { name: /Analisar transcrição/ });
    expect(button).toHaveAttribute("aria-keyshortcuts", "Control+D");
    expect(within(button).getByText("Ctrl D").tagName).toBe("KBD");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("primaryAction sem atalho não tem aria-keyshortcuts", () => {
    setup({ primaryAction: { label: "Analisar", onClick: () => {} } });
    expect(screen.getByRole("button", { name: "Analisar" })).not.toHaveAttribute(
      "aria-keyshortcuts"
    );
  });

  it("rolagem: no fim não mostra o botão; longe do fim conta falas novas e clicar some", async () => {
    const user = userEvent.setup();
    const props = { title: "Reunião", entries };
    const extra = (n: number): LiveTranscriptEntry => ({
      id: `x${n}`,
      speaker: "Outros",
      text: `Fala extra ${n}`,
    });
    const { rerender } = render(<LiveTranscript {...props} />);
    const log = screen.getByRole("log");

    // No fim: fala nova não mostra o botão.
    setScroll(log, { scrollHeight: 1000, clientHeight: 400, scrollTop: 590 });
    fireEvent.scroll(log);
    rerender(<LiveTranscript {...props} entries={[...entries, extra(1)]} />);
    expect(screen.queryByRole("button", { name: /fala/ })).not.toBeInTheDocument();

    // Longe do fim: conta.
    setScroll(log, { scrollHeight: 1000, clientHeight: 400, scrollTop: 100 });
    fireEvent.scroll(log);
    rerender(<LiveTranscript {...props} entries={[...entries, extra(1), extra(2)]} />);
    expect(screen.getByRole("button", { name: "1 fala nova" })).toBeInTheDocument();
    expect(log.scrollTop).toBe(100);

    rerender(<LiveTranscript {...props} entries={[...entries, extra(1), extra(2), extra(3)]} />);
    const jump = screen.getByRole("button", { name: "2 falas novas" });
    expect(jump).toHaveAttribute("data-slot", "live-transcript-jump");

    await act(async () => {
      await user.click(jump);
    });
    expect(screen.queryByRole("button", { name: /falas? nova/ })).not.toBeInTheDocument();
    expect(log.scrollTop).toBe(1000);
  });

  it("autoScroll rola para o fim quando a pessoa está no fim", () => {
    const props = { title: "Reunião", entries };
    const { rerender } = render(<LiveTranscript {...props} />);
    const log = screen.getByRole("log");
    setScroll(log, { scrollHeight: 1000, clientHeight: 400, scrollTop: 590 });
    fireEvent.scroll(log);
    rerender(
      <LiveTranscript
        {...props}
        entries={[...entries, { id: "n", speaker: "Outros", text: "Nova" }]}
      />
    );
    expect(log.scrollTop).toBe(1000);
  });

  it("voltar ao fim por rolagem manual limpa o contador", () => {
    const props = { title: "Reunião", entries };
    const { rerender } = render(<LiveTranscript {...props} />);
    const log = screen.getByRole("log");
    setScroll(log, { scrollHeight: 1000, clientHeight: 400, scrollTop: 0 });
    fireEvent.scroll(log);
    rerender(
      <LiveTranscript
        {...props}
        entries={[...entries, { id: "n", speaker: "Outros", text: "Nova" }]}
      />
    );
    expect(screen.getByRole("button", { name: "1 fala nova" })).toBeInTheDocument();
    log.scrollTop = 580;
    fireEvent.scroll(log);
    expect(screen.queryByRole("button", { name: /fala nova/ })).not.toBeInTheDocument();
  });
});
