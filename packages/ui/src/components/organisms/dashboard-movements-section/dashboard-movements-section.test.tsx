import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashboardMovementsSection, type Movement } from "./dashboard-movements-section";

const movements: Movement[] = [
  {
    id: "ui",
    name: "@flowtomic/ui",
    price: "0.8.0",
    tag: "Publicado",
    buttonText: "Ver no npm",
  },
  {
    id: "logic",
    name: "@flowtomic/logic",
    price: "0.1.8",
    tag: "Aguardando CI",
    buttonText: "Ver build",
  },
];

describe("DashboardMovementsSection", () => {
  describe("Lista densa, sem vitrine", () => {
    it("não desenha avatar com a inicial nem card dentro de card", () => {
      const { container } = render(<DashboardMovementsSection movements={movements} />);
      expect(container.querySelector("[class*='gradient']")).not.toBeInTheDocument();
      expect(screen.queryByText("@")).not.toBeInTheDocument();
      expect(container.querySelectorAll("li.rounded-lg")).toHaveLength(0);
    });

    it("o valor sai em mono e sem cor de marca", () => {
      render(<DashboardMovementsSection movements={movements} />);
      const value = screen.getByText("0.8.0");
      expect(value).toHaveClass("font-mono");
      expect(value).not.toHaveClass("text-primary");
    });
  });

  describe("Um botão sólido por tela, não um por linha", () => {
    it("por padrão as ações das linhas são outline", () => {
      render(<DashboardMovementsSection movements={movements} />);
      for (const name of ["Ação: Ver no npm", "Ação: Ver build"]) {
        expect(screen.getByRole("button", { name })).not.toHaveClass("bg-primary");
        expect(screen.getByRole("button", { name })).not.toHaveClass("bg-success");
      }
    });

    it("getButtonVariant ainda decide quando é passado, e o clique chega", async () => {
      const onButtonClick = vi.fn();
      render(
        <DashboardMovementsSection
          movements={[{ ...movements[0], onButtonClick }]}
          getButtonVariant={() => "default"}
        />
      );
      const button = screen.getByRole("button", { name: "Ação: Ver no npm" });
      expect(button).toHaveClass("bg-primary");
      await userEvent.click(button);
      expect(onButtonClick).toHaveBeenCalledOnce();
    });
  });

  describe("Estado vazio", () => {
    it("diz que não há nada no período, sem lista", () => {
      render(<DashboardMovementsSection />);
      expect(screen.getByText("Nada novo neste período.")).toBeInTheDocument();
      expect(screen.queryByText("Nenhuma movimentação encontrada")).not.toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("Cor do status por tag", () => {
    function tagDe(tag: string) {
      render(
        <DashboardMovementsSection
          movements={[{ id: "x", name: "Item", price: "1", tag, buttonText: "Abrir" }]}
        />
      );
      return screen.getByText(tag);
    }

    it.each(["Disponível", "available"])("'%s' aparece em verde de sucesso", (tag) => {
      expect(tagDe(tag)).toHaveClass("text-success");
    });

    it.each(["Reservado", "RESERVED"])("'%s' aparece com a cor de destaque", (tag) => {
      expect(tagDe(tag)).toHaveClass("text-accent-foreground");
    });

    it.each(["Vendido", "sold"])("'%s' aparece esmaecido", (tag) => {
      const el = tagDe(tag);
      expect(el).toHaveClass("text-muted-foreground");
      expect(el).not.toHaveClass("text-success");
    });

    it("uma tag desconhecida cai na cor neutra", () => {
      const el = tagDe("Aguardando CI");
      expect(el).toHaveClass("bg-muted", "text-foreground");
    });

    it("getStatusColor customizado substitui a cor padrão", () => {
      render(
        <DashboardMovementsSection
          movements={movements}
          getStatusColor={(tag) => (tag === "Publicado" ? "text-info" : "text-warning")}
        />
      );
      expect(screen.getByText("Publicado")).toHaveClass("text-info");
      expect(screen.getByText("Aguardando CI")).toHaveClass("text-warning");
      expect(screen.getByText("Aguardando CI")).not.toHaveClass("bg-muted");
    });
  });

  describe("Cabeçalho e conteúdo configuráveis", () => {
    it("usa título e período padrão e nomeia a lista pelo título", () => {
      render(<DashboardMovementsSection movements={movements} />);
      expect(screen.getByRole("heading", { name: "Movimentações Semanais" })).toBeInTheDocument();
      expect(screen.getByText("7 dias")).toBeInTheDocument();
      expect(
        screen.getByRole("list", { name: "Lista de movimentações semanais" })
      ).toBeInTheDocument();
    });

    it("título e período customizados aparecem no cabeçalho e no nome da lista", () => {
      render(
        <DashboardMovementsSection
          movements={movements}
          title="Publicações do mês"
          periodBadge="30 dias"
        />
      );
      expect(screen.getByRole("heading", { name: "Publicações do mês" })).toBeInTheDocument();
      expect(screen.getByText("30 dias")).toBeInTheDocument();
      expect(screen.queryByText("7 dias")).not.toBeInTheDocument();
      expect(screen.getByRole("list", { name: "Lista de publicações do mês" })).toBeInTheDocument();
    });

    it("com periodBadge vazio, não mostra o selo de período", () => {
      render(<DashboardMovementsSection movements={movements} periodBadge="" />);
      expect(screen.queryByText("7 dias")).not.toBeInTheDocument();
    });

    it("mostra cada movimentação com nome, valor e tag", () => {
      render(<DashboardMovementsSection movements={movements} />);
      const itens = screen.getAllByRole("listitem");
      expect(itens).toHaveLength(2);
      expect(itens[0]).toHaveTextContent("@flowtomic/ui");
      expect(itens[0]).toHaveTextContent("0.8.0");
      expect(itens[0]).toHaveTextContent("Publicado");
    });

    it("mensagem de vazio customizada substitui a padrão", () => {
      render(<DashboardMovementsSection emptyMessage="Sem publicações esta semana." />);
      expect(screen.getByText("Sem publicações esta semana.")).toBeInTheDocument();
      expect(screen.queryByText("Nada novo neste período.")).not.toBeInTheDocument();
    });

    it("getButtonVariant recebe o texto do botão de cada linha", () => {
      const escolher = vi.fn(() => "outline" as const);
      render(<DashboardMovementsSection movements={movements} getButtonVariant={escolher} />);
      expect(escolher).toHaveBeenCalledWith("Ver no npm");
      expect(escolher).toHaveBeenCalledWith("Ver build");
    });

    it("repassa className e ref ao contêiner", () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(
        <DashboardMovementsSection ref={ref} movements={movements} className="mt-8" />
      );
      expect(container.firstElementChild).toHaveClass("mt-8");
      expect(ref.current).toBe(container.firstElementChild);
    });
  });
});
