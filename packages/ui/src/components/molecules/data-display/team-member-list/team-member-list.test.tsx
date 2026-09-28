import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type TeamMember, TeamMemberList } from "./team-member-list";

const members: TeamMember[] = [
  { id: "1", name: "Mantenedor", task: "Tema Urucum no theme.css", status: "completed" },
  { id: "2", name: "Revisora", task: "Revisão do PR do flowtomic-cli init", status: "in-progress" },
  { id: "3", name: "Você", task: "Story do date-range-picker", status: "pending" },
];

const withPhoto = (list: TeamMember[]): TeamMember[] =>
  list.map((m) => ({ ...m, avatar: `/fotos/${m.id}.png` }));

describe("TeamMemberList", () => {
  describe("cabeçalho", () => {
    it("usa 'Equipe' como título padrão e mostra quantas pessoas há", () => {
      render(<TeamMemberList members={members} />);
      expect(screen.getByRole("heading", { name: "Equipe" })).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("o botão de adicionar tem um único '+', que é o ícone, não o texto", () => {
      render(<TeamMemberList members={members} onAddMember={() => {}} />);
      const button = screen.getByRole("button", { name: "Adicionar pessoa" });
      expect(button.textContent).not.toContain("+");
    });

    it("não mostra botão de adicionar sem onAddMember", () => {
      render(<TeamMemberList members={members} />);
      expect(screen.queryByRole("button", { name: /adicionar/i })).not.toBeInTheDocument();
    });

    it("respeita title e addButtonText de quem usa", () => {
      const onAdd = vi.fn();
      render(
        <TeamMemberList
          members={members}
          title="Revisores"
          addButtonText="Convidar"
          onAddMember={onAdd}
        />
      );
      expect(screen.getByRole("heading", { name: "Revisores" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Convidar" }));
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe("linhas", () => {
    it("é uma lista com uma linha por pessoa, com nome e tarefa sem prefixo em inglês", () => {
      render(<TeamMemberList members={members} />);
      const rows = within(screen.getByRole("list")).getAllByRole("listitem");
      expect(rows).toHaveLength(3);
      expect(rows[1]).toHaveTextContent("Revisora");
      expect(rows[1]).toHaveTextContent("Revisão do PR do flowtomic-cli init");
      expect(screen.queryByText(/working on/i)).not.toBeInTheDocument();
    });

    it("mostra o estado uma vez só por pessoa, em português", () => {
      render(<TeamMemberList members={members} />);
      expect(screen.getAllByText("Concluída")).toHaveLength(1);
      expect(screen.getAllByText("Em andamento")).toHaveLength(1);
      expect(screen.getAllByText("Pendente")).toHaveLength(1);
      expect(screen.queryByText(/status:/i)).not.toBeInTheDocument();
    });

    it("pendente não usa a cor de erro", () => {
      render(<TeamMemberList members={members} />);
      expect(screen.getByText("Pendente").className).not.toMatch(/destructive/);
    });
  });

  describe("linhas clicáveis", () => {
    it("com onMemberClick cada linha vira um botão com o nome da pessoa", () => {
      const onClick = vi.fn();
      render(<TeamMemberList members={members} onMemberClick={onClick} />);
      fireEvent.click(screen.getByRole("button", { name: /Revisora/ }));
      expect(onClick).toHaveBeenCalledWith(members[1]);
    });

    it("sem onMemberClick nenhuma linha é botão", () => {
      render(<TeamMemberList members={members} />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });

  describe("foto", () => {
    it("mostra a foto de todo mundo quando todos têm avatar", () => {
      const { container } = render(<TeamMemberList members={withPhoto(members)} />);
      expect(container.querySelectorAll("img")).toHaveLength(3);
    });

    it("não mostra foto de ninguém quando falta avatar em alguém", () => {
      const mixed = [...withPhoto(members.slice(0, 2)), members[2]];
      const { container } = render(<TeamMemberList members={mixed} />);
      expect(container.querySelectorAll("img")).toHaveLength(0);
    });
  });

  describe("vazio", () => {
    it("diz que não há ninguém, em português, e não desenha lista", () => {
      render(<TeamMemberList members={[]} onAddMember={() => {}} />);
      expect(screen.getByText("Ninguém na equipe ainda.")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Adicionar pessoa" })).toBeInTheDocument();
    });
  });
});
