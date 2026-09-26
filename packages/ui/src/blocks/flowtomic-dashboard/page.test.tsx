import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FlowtomicDashboardPage, { type Delivery } from "./page";

// "Hoje" é quarta, 23/09/2026; a sexta da semana é 25/09.
const today = new Date(2026, 8, 23, 10, 0);

const deliveries: Delivery[] = [
  {
    id: "1",
    title: "Endpoint de health no registry",
    owner: "Mantenedor",
    dueDate: new Date(2026, 8, 21),
    state: "em-andamento",
  },
  {
    id: "2",
    title: "Onboarding do flowtomic-cli init",
    owner: "Revisora",
    dueDate: new Date(2026, 8, 23),
    state: "em-revisao",
  },
  {
    id: "3",
    title: "Story do date-range-picker",
    owner: "você",
    dueDate: new Date(2026, 8, 24),
    state: "em-andamento",
  },
  {
    id: "4",
    title: "Build do registry na Vercel",
    owner: "Mantenedor",
    dueDate: new Date(2026, 8, 25),
    state: "em-andamento",
  },
  {
    id: "5",
    title: "Migrar docs do deploy",
    owner: "Revisora",
    dueDate: new Date(2026, 9, 8),
    state: "em-andamento",
  },
  {
    id: "6",
    title: "Tema Urucum",
    owner: "você",
    dueDate: new Date(2026, 8, 20),
    state: "concluida",
  },
];

describe("FlowtomicDashboardPage", () => {
  describe("Veredito da semana", () => {
    it("conta atrasadas e as que vencem até sexta", () => {
      render(<FlowtomicDashboardPage deliveries={deliveries} today={today} />);
      expect(screen.getByText("1 atrasada, 3 vencem até sexta")).toBeInTheDocument();
    });

    it("usa plural e omite a parte que não existe", () => {
      const twoLate = deliveries.map((d) =>
        d.id === "3" ? { ...d, dueDate: new Date(2026, 8, 22) } : d
      );
      render(<FlowtomicDashboardPage deliveries={twoLate} today={today} />);
      expect(screen.getByText("2 atrasadas, 2 vencem até sexta")).toBeInTheDocument();
    });

    it("sem nada atrasado, fala só do que vence", () => {
      const onTime = deliveries.filter((d) => d.id !== "1");
      render(<FlowtomicDashboardPage deliveries={onTime} today={today} />);
      expect(screen.getByText("3 vencem até sexta")).toBeInTheDocument();
    });

    it("semana livre vira frase, não zero", () => {
      render(<FlowtomicDashboardPage deliveries={[deliveries[4]]} today={today} />);
      expect(screen.getByText("Nada vence esta semana")).toBeInTheDocument();
    });

    it("resume andamento e meta do mês em uma linha", () => {
      render(<FlowtomicDashboardPage deliveries={deliveries} today={today} monthGoal={20} />);
      expect(screen.getByText("5 em andamento · 1 de 20 concluídas no mês")).toBeInTheDocument();
    });
  });

  describe("Tabela do que está vencendo", () => {
    it("lista só as abertas, da mais antiga para a mais nova", () => {
      render(<FlowtomicDashboardPage deliveries={deliveries} today={today} />);
      const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
      expect(rows.map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual([
        "Endpoint de health no registry",
        "Onboarding do flowtomic-cli init",
        "Story do date-range-picker",
        "Build do registry na Vercel",
        "Migrar docs do deploy",
      ]);
    });

    it("diz há quanto tempo a atrasada passou do prazo", () => {
      render(<FlowtomicDashboardPage deliveries={deliveries} today={today} />);
      expect(screen.getByText("atrasada 2 dias")).toBeInTheDocument();
      expect(screen.getByText("em revisão")).toBeInTheDocument();
    });

    it("sem entregas, o estado vazio diz o que fazer", () => {
      render(<FlowtomicDashboardPage deliveries={[]} today={today} />);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.getByText(/Nenhuma entrega aberta/)).toBeInTheDocument();
    });
  });

  describe("Coluna lateral", () => {
    it("agrupa por pessoa, com as atrasadas de cada uma", () => {
      render(<FlowtomicDashboardPage deliveries={deliveries} today={today} />);
      expect(screen.getByText("2 entregas, 1 atrasada")).toBeInTheDocument();
    });

    it("mostra o cronômetro em hh:mm:ss e o que está rodando", () => {
      render(
        <FlowtomicDashboardPage
          deliveries={deliveries}
          today={today}
          timer={{ elapsedSeconds: 5048, deliveryTitle: "Story do date-range-picker" }}
        />
      );
      expect(screen.getByText("01:24:08")).toBeInTheDocument();
      expect(screen.getByText("rodando em Story do date-range-picker")).toBeInTheDocument();
    });
  });

  describe("Sem cara de template", () => {
    it("não traz KPI em cards, nomes inventados nem app mobile", () => {
      render(<FlowtomicDashboardPage />);
      for (const text of [/Total Projects/, /Totok/, /Mobile App/, /Arc Company/]) {
        expect(screen.queryByText(text)).not.toBeInTheDocument();
      }
    });

    it("tem um botão sólido só, e ele chama onNewDelivery", async () => {
      const onNewDelivery = vi.fn();
      render(
        <FlowtomicDashboardPage
          deliveries={deliveries}
          today={today}
          onNewDelivery={onNewDelivery}
        />
      );
      await userEvent.click(screen.getByRole("button", { name: "Nova entrega" }));
      expect(onNewDelivery).toHaveBeenCalledOnce();
    });
  });
});
