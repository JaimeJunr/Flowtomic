import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Project, ProjectList } from "./project-list";

const projects: Project[] = [
  { id: "1", name: "Release 0.9.0 do @flowtomic/ui", dueDate: "2026-10-06", status: "active" },
  { id: "2", name: "Registry de volta no ar", dueDate: "2026-09-22", status: "pending" },
  { id: "3", name: "Tema Urucum", dueDate: "2026-09-20", status: "completed" },
  { id: "4", name: "flowtomic-cli com proveniência", dueDate: "2026-10-17", status: "on-hold" },
];

describe("ProjectList", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 27, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("usa 'Projetos' como título padrão e mostra a contagem", () => {
    render(<ProjectList projects={projects} />);
    expect(screen.getByRole("heading", { name: "Projetos" })).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("o botão de adicionar tem um único '+', que é o ícone", () => {
    render(<ProjectList projects={projects} onAddNew={() => {}} />);
    const button = screen.getByRole("button", { name: "Novo projeto" });
    expect(button.textContent).not.toContain("+");
  });

  it("mostra o prazo em pt-BR, sem trocar o dia por fuso horário", () => {
    render(<ProjectList projects={[projects[0]]} />);
    expect(screen.getByText("06/10/2026")).toBeInTheDocument();
    expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
  });

  it("prazo vencido de projeto não concluído vira 'venceu' em cor de erro", () => {
    render(<ProjectList projects={projects} />);
    const late = screen.getByText("venceu 22/09/2026");
    expect(late.className).toMatch(/text-destructive/);
  });

  it("projeto concluído com prazo passado não conta como vencido", () => {
    render(<ProjectList projects={projects} />);
    expect(screen.getByText("20/09/2026").className).not.toMatch(/destructive/);
  });

  it("mostra o estado em português", () => {
    render(<ProjectList projects={projects} />);
    for (const label of ["Ativo", "Pendente", "Concluído", "Em espera"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("é uma lista; com onProjectClick cada linha vira botão", () => {
    const onClick = vi.fn();
    render(<ProjectList projects={projects} onProjectClick={onClick} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: /Tema Urucum/ }));
    expect(onClick).toHaveBeenCalledWith(projects[2]);
  });

  it("vazio diz que não há projeto, sem lista", () => {
    render(<ProjectList projects={[]} />);
    expect(screen.getByText("Nenhum projeto ainda.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
