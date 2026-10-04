import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "./task";

describe("Task", () => {
  it("mostra o arquivo em mono e mantém os detalhes colapsáveis", async () => {
    render(
      <Task>
        <TaskTrigger title="Consultar o DataTable">
          <button type="button">Consultar o DataTable</button>
        </TaskTrigger>
        <TaskContent>
          <TaskItem>
            Conferindo a ordenação pelo teclado em <TaskItemFile>data-table.tsx</TaskItemFile>
          </TaskItem>
        </TaskContent>
      </Task>
    );
    const file = screen.getByText("data-table.tsx");
    expect(file).toBeVisible();
    expect(file).toHaveClass("font-mono", "bg-secondary", "text-foreground");
    await userEvent.click(screen.getByRole("button", { name: "Consultar o DataTable" }));
    expect(screen.queryByText("data-table.tsx")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Consultar o DataTable" }));
    expect(screen.getByText("data-table.tsx")).toBeVisible();
  });
});

describe("Task: gatilho padrão e estado inicial", () => {
  it("sem filho no gatilho, mostra o título e recolhe/expande os detalhes ao clicar", async () => {
    render(
      <Task>
        <TaskTrigger title="Buscar no repositório" />
        <TaskContent>
          <TaskItem>Resultado da busca</TaskItem>
        </TaskContent>
      </Task>
    );
    expect(screen.getByText("Buscar no repositório")).toBeInTheDocument();
    expect(screen.getByText("Resultado da busca")).toBeVisible();

    await userEvent.click(screen.getByText("Buscar no repositório"));
    expect(screen.queryByText("Resultado da busca")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Buscar no repositório"));
    expect(screen.getByText("Resultado da busca")).toBeVisible();
  });

  it("o gatilho padrão informa o estado aberto/fechado em aria-expanded", async () => {
    render(
      <Task>
        <TaskTrigger title="Buscar no repositório" />
        <TaskContent>
          <TaskItem>Resultado da busca</TaskItem>
        </TaskContent>
      </Task>
    );
    const gatilho = screen.getByText("Buscar no repositório").parentElement as HTMLElement;
    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(gatilho);
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
  });

  it("defaultOpen={false} começa com os detalhes escondidos", () => {
    render(
      <Task defaultOpen={false}>
        <TaskTrigger title="Buscar no repositório" />
        <TaskContent>
          <TaskItem>Resultado da busca</TaskItem>
        </TaskContent>
      </Task>
    );
    expect(screen.queryByText("Resultado da busca")).not.toBeInTheDocument();
  });

  it("repassa className ao item e ao arquivo", () => {
    render(
      <TaskItem className="extra-item">
        <TaskItemFile className="extra-arquivo">a.ts</TaskItemFile>
      </TaskItem>
    );
    expect(screen.getByText("a.ts")).toHaveClass("extra-arquivo");
    expect(screen.getByText("a.ts").parentElement).toHaveClass("extra-item");
  });

  it("com gatilho próprio (botão) não tem violações de acessibilidade", async () => {
    const { container } = render(
      <Task>
        <TaskTrigger title="Consultar">
          <button type="button">Consultar</button>
        </TaskTrigger>
        <TaskContent>
          <TaskItem>Detalhe</TaskItem>
        </TaskContent>
      </Task>
    );
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });

  it("o gatilho padrão (sem filhos) é um botão focável e abre/fecha pelo teclado", async () => {
    const user = userEvent.setup();
    render(
      <Task>
        <TaskTrigger title="Consultar" />
        <TaskContent>
          <TaskItem>Detalhe</TaskItem>
        </TaskContent>
      </Task>
    );
    const gatilho = screen.getByRole("button", { name: "Consultar" });
    await user.tab();
    expect(gatilho).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Detalhe")).not.toBeInTheDocument();
    await user.keyboard(" ");
    expect(screen.getByText("Detalhe")).toBeVisible();
  });
});
