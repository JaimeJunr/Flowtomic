import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { StatCard } from "./stat-card";

// SlidingNumber (via motion/react) usa IntersectionObserver para animar quando entra na tela.
// jsdom não implementa isso, então precisa de um stub mínimo só para este teste.
beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

const receita = { title: "Receita total", value: 121890, prefix: "R$ ", locale: "pt-BR" };

describe("StatCard", () => {
  describe("Título (eyebrow) sem caixa alta forçada", () => {
    it("renderiza o título em texto normal, sem uppercase/tracking", () => {
      render(<StatCard title="Receita total" value={1000} />);
      const title = screen.getByText("Receita total");
      expect(title.className).not.toMatch(/\buppercase\b/);
      expect(title.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
    });

    it("mantém o título truncado em uma linha", () => {
      render(<StatCard title="Receita total" value={1000} />);
      expect(screen.getByText("Receita total").className).toMatch(/truncate/);
    });
  });

  describe("Métrica no padrão do stats-grid (DESIGN.md)", () => {
    it("o valor sai inteiro, em mono e na cor do texto, mesmo com color", () => {
      render(<StatCard {...receita} color="success" />);
      const value = screen.getByText("R$ 121.890");
      expect(value.className).toMatch(/font-mono/);
      expect(value.className).not.toMatch(/text-(primary|success|warning|error|destructive)/);
    });

    it("variação boa é verde, com seta e contexto do mês anterior", () => {
      render(<StatCard {...receita} lastMonth={105922} />);
      expect(screen.getByText("↑ 15,1%").className).toMatch(/text-success/);
      expect(screen.getByText("sobre R$ 105.922")).toBeInTheDocument();
    });

    it("quando subir é ruim (positive: false), a alta fica vermelha", () => {
      render(<StatCard title="Builds com falha" value={7} delta={40} positive={false} />);
      expect(screen.getByText("↑ 40%").className).toMatch(/text-destructive/);
    });

    it("não cresce nem ganha sombra no hover", () => {
      const { container } = render(<StatCard {...receita} />);
      expect((container.firstChild as HTMLElement).className).not.toMatch(
        /hover:(shadow|scale)|shadow-/
      );
    });
  });

  describe("Menu de ações", () => {
    it("o botão fica visível sem depender do hover e tem nome acessível", async () => {
      const onPin = vi.fn();
      render(<StatCard {...receita} showActions onPin={onPin} onAddAlert={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: "Mais opções" }));
      expect(await screen.findByRole("menuitem", { name: "Adicionar alerta" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("menuitem", { name: "Fixar no painel" }));
      expect(onPin).toHaveBeenCalledTimes(1);
    });

    it("sem showActions não há botão de ações", () => {
      render(<StatCard {...receita} />);
      expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
    });
  });
});

describe("StatCard: variações de layout e conteúdo", () => {
  it("na variante compacta esconde subtítulo, conteúdo extra e o mês anterior", () => {
    render(
      <StatCard {...receita} lastMonth={105922} variant="compact" subtitle="Últimos 30 dias">
        <span>Detalhe extra</span>
      </StatCard>
    );
    expect(screen.queryByText("Últimos 30 dias")).not.toBeInTheDocument();
    expect(screen.queryByText("Detalhe extra")).not.toBeInTheDocument();
    expect(screen.queryByText(/sobre R\$/)).not.toBeInTheDocument();
    expect(screen.getByText("↑ 15,1%")).toBeInTheDocument();
  });

  it("na variante padrão mostra subtítulo e conteúdo extra abaixo da métrica", () => {
    render(
      <StatCard {...receita} subtitle="Últimos 30 dias">
        <span>Detalhe extra</span>
      </StatCard>
    );
    expect(screen.getByText("Últimos 30 dias")).toBeInTheDocument();
    expect(screen.getByText("Detalhe extra")).toBeInTheDocument();
  });

  it("na variante detalhada o subtítulo ganha corpo maior em telas largas", () => {
    render(<StatCard {...receita} variant="detailed" subtitle="Últimos 30 dias" />);
    expect(screen.getByText("Últimos 30 dias").className).toMatch(/sm:text-base/);
  });

  it("valor em texto é exibido como veio, sem formatação numérica", () => {
    render(<StatCard title="Status" value="Em dia" />);
    expect(screen.getByText("Em dia")).toBeInTheDocument();
  });

  it("sem delta nem mês anterior não mostra variação", () => {
    render(<StatCard title="Clientes" value={42} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("variação zero fica em tom neutro, sem verde nem vermelho", () => {
    render(<StatCard title="Clientes" value={42} delta={0} />);
    const variacao = screen.getByText("↑ 0%");
    expect(variacao.className).toMatch(/text-muted-foreground/);
    expect(variacao.className).not.toMatch(/text-(success|destructive)/);
  });

  it("queda com positive: false é boa e fica verde, com seta para baixo", () => {
    render(<StatCard title="Churn" value={3} delta={-12.5} positive={false} />);
    const variacao = screen.getByText("↓ 12,5%");
    expect(variacao.className).toMatch(/text-success/);
  });

  it("queda no padrão (subir é bom) fica vermelha", () => {
    render(<StatCard title="Receita" value={3} delta={-5} />);
    expect(screen.getByText("↓ 5%").className).toMatch(/text-destructive/);
  });
});

describe("StatCard: menu de ações completo", () => {
  it("lista só as ações com callback e dispara cada uma ao escolher", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onSettings = vi.fn();
    const onShare = vi.fn();
    render(<StatCard {...receita} showActions onSettings={onSettings} onShare={onShare} />);

    await user.click(screen.getByRole("button", { name: "Mais opções" }));
    expect(screen.queryByRole("menuitem", { name: "Fixar no painel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Remover" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("menuitem", { name: "Configurações" }));
    expect(onSettings).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Mais opções" }));
    await user.click(await screen.findByRole("menuitem", { name: "Compartilhar" }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it("Remover só aparece quando há onRemove e dispara o callback", async () => {
    const user = userEvent.setup({ skipHover: true });
    const onRemove = vi.fn();
    render(<StatCard {...receita} showActions onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Mais opções" }));
    await user.click(await screen.findByRole("menuitem", { name: "Remover" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("o menu abre pelo teclado e o menu fecha com Escape", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<StatCard {...receita} showActions onPin={() => {}} />);
    screen.getByRole("button", { name: "Mais opções" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Fixar no painel" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menuitem", { name: "Fixar no painel" })).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade com o menu de ações", async () => {
    const { container } = render(<StatCard {...receita} lastMonth={105922} showActions />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
