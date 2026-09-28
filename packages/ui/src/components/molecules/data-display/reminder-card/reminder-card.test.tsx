import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type Reminder, ReminderCard } from "./reminder-card";

const reminders: Reminder[] = [
  {
    id: "1",
    title: "Revisão de PR com a mantenedora",
    time: "14:00–14:30",
    description: "PR #30, molecules sem template",
  },
  { id: "2", title: "Publicar @flowtomic/ui 0.9.0", time: "16:00–16:15" },
];

describe("ReminderCard", () => {
  it("usa 'Lembretes' como título padrão e mostra a contagem", () => {
    render(<ReminderCard reminders={reminders} />);
    expect(screen.getByRole("heading", { name: "Lembretes" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("uma linha por lembrete, com horário, título e descrição", () => {
    render(<ReminderCard reminders={reminders} />);
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("14:00–14:30");
    expect(rows[0]).toHaveTextContent("PR #30, molecules sem template");
  });

  it("a ação de cada lembrete é contornada, não sólida, e chama o callback", () => {
    const onStart = vi.fn();
    render(<ReminderCard reminders={reminders} onStartMeeting={onStart} />);
    const buttons = screen.getAllByRole("button", { name: "Começar" });
    expect(buttons).toHaveLength(2);
    expect(buttons[0].className).not.toMatch(/\bbg-primary\b/);
    fireEvent.click(buttons[1]);
    expect(onStart).toHaveBeenCalledWith(reminders[1]);
  });

  it("sem onStartMeeting não há botão de ação", () => {
    render(<ReminderCard reminders={reminders} />);
    expect(screen.queryByRole("button", { name: "Começar" })).not.toBeInTheDocument();
  });

  it("o botão de dispensar tem nome acessível com o lembrete", () => {
    const onDismiss = vi.fn();
    render(<ReminderCard reminders={reminders} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Dispensar Publicar @flowtomic/ui 0.9.0" }));
    expect(onDismiss).toHaveBeenCalledWith(reminders[1]);
  });

  it("respeita title e actionButtonText", () => {
    render(
      <ReminderCard
        reminders={reminders}
        title="Hoje"
        actionButtonText="Entrar"
        onStartMeeting={() => {}}
      />
    );
    expect(screen.getByRole("heading", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Entrar" })).toHaveLength(2);
  });

  it("vazio diz que não há lembrete, sem lista", () => {
    render(<ReminderCard reminders={[]} />);
    expect(screen.getByText("Nenhum lembrete.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
