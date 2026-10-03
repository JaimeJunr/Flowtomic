import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
