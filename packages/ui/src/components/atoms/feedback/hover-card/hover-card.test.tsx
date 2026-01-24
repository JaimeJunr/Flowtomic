import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../actions/button/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
  describe("Renderização", () => {
    it("deve renderizar o HoverCard", () => {
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Content</p>
          </HoverCardContent>
        </HoverCard>
      );
      const button = screen.getByRole("button", { name: "Hover me" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar HoverCardTrigger", () => {
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Trigger</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Content</p>
          </HoverCardContent>
        </HoverCard>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve exibir hover card ao passar o mouse", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Hover card content</p>
          </HoverCardContent>
        </HoverCard>
      );
      const button = screen.getByRole("button", { name: "Hover me" });
      await user.hover(button);

      await waitFor(() => {
        const content = screen.getByText("Hover card content");
        expect(content).toBeInTheDocument();
      });
    });
  });
});
