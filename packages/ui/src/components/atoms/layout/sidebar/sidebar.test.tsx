import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

describe("Sidebar", () => {
  describe("Renderização", () => {
    it("deve renderizar o SidebarProvider", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar o Sidebar", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Sidebar Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Sidebar Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar SidebarTrigger", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      );
      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });

    it("deve renderizar SidebarMenu", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Item 1</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const item = screen.getByText("Item 1");
      expect(item).toBeInTheDocument();
    });
  });

  describe("Estados", () => {
    it("deve renderizar com defaultOpen true", () => {
      render(
        <SidebarProvider defaultOpen>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar com defaultOpen false", () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });
  });
});
