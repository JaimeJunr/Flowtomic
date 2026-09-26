import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardHeaderActions } from "./dashboard-header-actions";

const dashboards = [
  { id: "a", name: "Dashboard A" },
  { id: "b", name: "Dashboard B" },
];

describe("DashboardHeaderActions", () => {
  describe("Seletor de dashboard acessível", () => {
    it("expõe o select de dashboard ativo com nome acessível", () => {
      render(<DashboardHeaderActions dashboards={dashboards} activeDashboardId="a" />);
      expect(screen.getByRole("combobox", { name: "Painel ativo" })).toBeInTheDocument();
    });
  });
});
