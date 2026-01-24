import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../actions/button/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

describe("Drawer", () => {
  describe("Renderização", () => {
    it("deve renderizar o Drawer", () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Open</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );
      const button = screen.getByRole("button", { name: "Open" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar DrawerTrigger", () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Trigger</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir drawer ao clicar no trigger", async () => {
      const user = userEvent.setup();
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );
      const button = screen.getByRole("button", { name: "Open Drawer" });
      await user.click(button);

      await waitFor(() => {
        const title = screen.getByText("Drawer Title");
        expect(title).toBeInTheDocument();
      });
    });
  });
});
