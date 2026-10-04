import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
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

  describe("prazos, ícones e ações", () => {
    it("aceita o prazo como Date", () => {
      render(
        <ProjectList projects={[{ id: "d", name: "Com Date", dueDate: new Date(2026, 10, 3) }]} />
      );
      expect(screen.getByText("03/11/2026")).toBeInTheDocument();
    });

    it("aceita o prazo como data e hora ISO", () => {
      render(
        <ProjectList
          projects={[
            { id: "d", name: "Com ISO", dueDate: new Date(2026, 10, 3, 12).toISOString() },
          ]}
        />
      );
      expect(screen.getByText("03/11/2026")).toBeInTheDocument();
    });

    it("prazo no dia de hoje ainda não venceu", () => {
      render(
        <ProjectList
          projects={[{ id: "h", name: "Hoje", dueDate: "2026-09-27", status: "active" }]}
        />
      );
      expect(screen.getByText("27/09/2026").className).not.toMatch(/destructive/);
    });

    it("projeto sem estado também vence quando o prazo passou", () => {
      render(<ProjectList projects={[{ id: "s", name: "Sem estado", dueDate: "2026-09-01" }]} />);
      expect(screen.getByText("venceu 01/09/2026")).toBeInTheDocument();
    });

    it("projeto sem estado não mostra selo de estado", () => {
      render(<ProjectList projects={[{ id: "s", name: "Sem estado", dueDate: "2026-10-01" }]} />);
      for (const label of ["Ativo", "Pendente", "Concluído", "Em espera"]) {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
    });

    it("mostra o ícone do projeto, escondido do leitor de tela", () => {
      render(
        <ProjectList
          projects={[
            {
              id: "i",
              name: "Com ícone",
              dueDate: "2026-10-01",
              icon: <svg data-testid="icone-projeto" />,
            },
          ]}
        />
      );
      expect(screen.getByTestId("icone-projeto").parentElement).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it("usa o título passado por quem chama", () => {
      render(<ProjectList projects={projects} title="Entregas" />);
      expect(screen.getByRole("heading", { name: "Entregas" })).toBeInTheDocument();
    });

    it("o botão de adicionar usa o texto passado e dispara onAddNew", async () => {
      const onAddNew = vi.fn();
      render(<ProjectList projects={projects} onAddNew={onAddNew} addButtonText="Criar entrega" />);
      await userEvent.click(screen.getByRole("button", { name: "Criar entrega" }));
      expect(onAddNew).toHaveBeenCalledTimes(1);
    });

    it("sem onAddNew não há botão de adicionar", () => {
      render(<ProjectList projects={projects} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("com onProjectClick a linha abre pelo teclado", async () => {
      const onClick = vi.fn();
      render(<ProjectList projects={projects} onProjectClick={onClick} />);
      screen.getByRole("button", { name: /Registry de volta no ar/ }).focus();
      await userEvent.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledWith(projects[1]);
    });

    it("não tem violações de acessibilidade", async () => {
      const { container } = render(
        <ProjectList projects={projects} onProjectClick={() => {}} onAddNew={() => {}} />
      );
      const resultado = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(resultado.violations).toEqual([]);
    });
  });
});
