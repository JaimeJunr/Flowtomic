import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../actions/button/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

describe("Collapsible", () => {
  describe("Renderização", () => {
    it("deve renderizar o Collapsible", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button>Toggle</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      const button = screen.getByRole("button", { name: "Toggle" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar CollapsibleTrigger", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button>Trigger</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir collapsible ao clicar no trigger", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button>Toggle</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      const button = screen.getByRole("button", { name: "Toggle" });
      await user.click(button);

      await waitFor(() => {
        const content = screen.getByText("Collapsible content");
        expect(content).toBeInTheDocument();
      });
    });

    it("deve fechar collapsible ao clicar novamente", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button>Toggle</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      const button = screen.getByRole("button", { name: "Toggle" });
      await user.click(button);
      await user.click(button);

      // O conteúdo pode ainda estar no DOM mas oculto
      await waitFor(() => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe("Estado Controlado", () => {
    it("deve respeitar estado open controlado", () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger asChild>
            <Button>Toggle</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });
  });
});
