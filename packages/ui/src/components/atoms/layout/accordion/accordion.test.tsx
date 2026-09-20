import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
  describe("Renderização", () => {
    it("deve renderizar o Accordion", () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const item = screen.getByText("Item 1");
      expect(item).toBeInTheDocument();
    });

    it("deve renderizar múltiplos AccordionItems", () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const item1 = screen.getByText("Item 1");
      const item2 = screen.getByText("Item 2");
      expect(item1).toBeInTheDocument();
      expect(item2).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir item ao clicar no trigger (single)", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const trigger = screen.getByText("Item 1");
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText("Content 1");
        expect(content).toBeInTheDocument();
      });
    });

    it("deve permitir múltiplos itens abertos (multiple)", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const trigger1 = screen.getByText("Item 1");
      const trigger2 = screen.getByText("Item 2");

      await user.click(trigger1);
      await user.click(trigger2);

      await waitFor(() => {
        const content1 = screen.getByText("Content 1");
        const content2 = screen.getByText("Content 2");
        expect(content1).toBeInTheDocument();
        expect(content2).toBeInTheDocument();
      });
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura acessível", () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });
  });
});
