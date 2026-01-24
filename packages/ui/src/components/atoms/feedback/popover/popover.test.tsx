import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../../actions/button/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  describe("Renderização", () => {
    it("deve renderizar o Popover", () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Content</p>
          </PopoverContent>
        </Popover>
      );
      const button = screen.getByRole("button", { name: "Open" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar PopoverTrigger", () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Trigger</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Content</p>
          </PopoverContent>
        </Popover>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir popover ao clicar no trigger", async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>
      );
      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      await waitFor(() => {
        const content = screen.getByText("Popover content");
        expect(content).toBeInTheDocument();
      });
    });
  });
});
