import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "./checkpoint";

describe("Checkpoint", () => {
  it("abre o tooltip sem exigir TooltipProvider do consumidor", async () => {
    expect(() =>
      render(
        <Checkpoint>
          <CheckpointTrigger tooltip="Voltar à resposta sobre ordenação">
            <CheckpointIcon />
            Restaurar até aqui
          </CheckpointTrigger>
        </Checkpoint>
      )
    ).not.toThrow();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Restaurar até aqui" })).toHaveFocus();
    expect(
      await screen.findByRole("tooltip", { name: "Voltar à resposta sobre ordenação" })
    ).toBeInTheDocument();
  });

  it("separa a ação ghost com régua dos dois lados e preserva o clique", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Checkpoint>
        <CheckpointTrigger onClick={onClick}>
          <CheckpointIcon />
          Restaurar até aqui
        </CheckpointTrigger>
      </Checkpoint>
    );
    const lines = container.querySelectorAll('[data-orientation="horizontal"]');
    expect(lines).toHaveLength(2);
    expect(container.firstElementChild?.firstElementChild).toBe(lines[0]);
    expect(container.firstElementChild?.lastElementChild).toBe(lines[1]);
    const button = screen.getByRole("button", { name: "Restaurar até aqui" });
    expect(button).toHaveClass("hover:bg-accent");
    expect(button).not.toHaveClass("bg-primary");
    expect(button.querySelector("svg")).toHaveClass("lucide-bookmark");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
