import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type StatusHistoryPoint, StatusList, type StatusListItem } from "./status-list";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const NOW = new Date("2026-10-12T12:00:00Z");
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3600 * 1000);

function history(total: number, bad = 0, nulls = 0): StatusHistoryPoint[] {
  return Array.from({ length: total + nulls }, (_, index) => ({
    label: `Dia ${index + 1}`,
    status: index >= total ? null : index < bad ? "degraded" : "operational",
  }));
}

const items: StatusListItem[] = [
  {
    id: "api",
    name: "API pública",
    status: "operational",
    updatedAt: hoursAgo(16),
    history: history(90, 1),
    content: <p>Nota da API</p>,
  },
  {
    id: "web",
    name: "Painel web",
    status: "degraded",
    content: <p>Nota do painel</p>,
  },
  { id: "csv", name: "Exportação CSV", status: "outage", updatedAt: hoursAgo(1) },
  { id: "man", name: "Registry", status: "maintenance" },
];

function setup(props: Partial<React.ComponentProps<typeof StatusList>> = {}) {
  const user = userEvent.setup({ skipHover: true });
  render(<StatusList items={items} now={NOW} {...props} />);
  return user;
}

describe("StatusList", () => {
  it("renderiza um li por item com número, nome e selo padrão", () => {
    setup();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getByText("001")).toBeInTheDocument();
    expect(within(rows[0]).getByText("API pública")).toBeInTheDocument();
    expect(within(rows[0]).getByText("Operacional")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Degradado")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Fora do ar")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Manutenção")).toBeInTheDocument();
  });

  it("statusLabel sobrescreve o texto do selo", () => {
    setup({ items: [{ id: "a", name: "A", status: "operational", statusLabel: "No ar" }] });
    expect(screen.getByText("No ar")).toBeInTheDocument();
    expect(screen.queryByText("Operacional")).not.toBeInTheDocument();
  });

  it("mostra Atualizado há com now fixo e esconde sem updatedAt", () => {
    setup();
    expect(screen.getByText("Atualizado há 16 horas")).toBeInTheDocument();
    expect(screen.getByText("Atualizado há 1 hora")).toBeInTheDocument();
    expect(screen.getAllByText(/Atualizado/)).toHaveLength(2);
  });

  it("escolhe a unidade mais grosseira que cabe", () => {
    setup({
      items: [
        { id: "s", name: "S", status: "operational", updatedAt: new Date(NOW.getTime() - 30_000) },
        {
          id: "m",
          name: "M",
          status: "operational",
          updatedAt: new Date(NOW.getTime() - 5 * 60_000),
        },
        { id: "d", name: "D", status: "operational", updatedAt: hoursAgo(72) },
      ],
    });
    expect(screen.getByText("Atualizado há 30 segundos")).toBeInTheDocument();
    expect(screen.getByText("Atualizado há 5 minutos")).toBeInTheDocument();
    expect(screen.getByText("Atualizado há 3 dias")).toBeInTheDocument();
  });

  it("item sem history e content não tem botão", () => {
    setup();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[2]).queryByRole("button")).not.toBeInTheDocument();
    expect(rows[2].querySelector("svg")).toBeNull();
    expect(rows[0].querySelector("svg")).not.toBeNull();
  });

  it("o nome acessível do botão junta nome, estado e atualização", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /API pública.*Operacional.*Atualizado há 16 horas/ })
    ).toBeInTheDocument();
  });

  it("clicar no cabeçalho abre e mostra barras e conteúdo", async () => {
    const user = setup();
    expect(screen.queryByText("Nota da API")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /API pública/ }));
    expect(await screen.findByText("Nota da API")).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="status-list-bar"]')).toHaveLength(90);
    const row = screen.getAllByRole("listitem")[0].querySelector('[data-slot="status-list-item"]');
    expect(row).toHaveAttribute("data-state", "open");
  });

  it("multiple deixa dois abertos", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /API pública/ }));
    await user.click(screen.getByRole("button", { name: /Painel web/ }));
    expect(await screen.findByText("Nota da API")).toBeInTheDocument();
    expect(await screen.findByText("Nota do painel")).toBeInTheDocument();
  });

  it("multiple={false} fecha o anterior", async () => {
    const user = setup({ multiple: false });
    await user.click(screen.getByRole("button", { name: /API pública/ }));
    expect(await screen.findByText("Nota da API")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Painel web/ }));
    expect(await screen.findByText("Nota do painel")).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.queryByText("Nota da API")).not.toBeInTheDocument());
  });

  it("calcula a disponibilidade", () => {
    setup({
      defaultValue: ["a", "b", "c"],
      items: [
        { id: "a", name: "A", status: "operational", history: history(90, 1) },
        { id: "b", name: "B", status: "operational", history: history(90) },
        { id: "c", name: "C", status: "operational", history: history(89, 1, 5) },
      ],
    });
    expect(screen.getByText("100% disponível")).toBeInTheDocument();
    expect(screen.getAllByText("98,9% disponível")).toHaveLength(2);
  });

  it("o grupo de barras tem aria-label com a contagem", () => {
    setup({ defaultValue: ["api"] });
    expect(
      screen.getByRole("img", { name: "Histórico: 89 de 90 períodos operacionais" })
    ).toBeInTheDocument();
  });

  it("mostra o título do detalhe", () => {
    setup({
      defaultValue: ["a"],
      items: [
        {
          id: "a",
          name: "A",
          status: "operational",
          history: history(3),
          detailTitle: "Últimos 3 dias",
        },
      ],
    });
    expect(screen.getByText("Últimos 3 dias")).toBeInTheDocument();
  });

  it("modo controlado chama onValueChange e não muda sozinho", async () => {
    const onValueChange = vi.fn();
    const user = setup({ value: [], onValueChange });
    await user.click(screen.getByRole("button", { name: /API pública/ }));
    expect(onValueChange).toHaveBeenCalledWith(["api"]);
    expect(screen.queryByText("Nota da API")).not.toBeInTheDocument();
  });

  it("modo controlado reflete o value", () => {
    setup({ value: ["web"] });
    expect(screen.getByText("Nota do painel")).toBeInTheDocument();
  });

  it("controlado com multiple={false} usa lista de um id", async () => {
    const onValueChange = vi.fn();
    const user = setup({ multiple: false, value: [], onValueChange });
    await user.click(screen.getByRole("button", { name: /Painel web/ }));
    expect(onValueChange).toHaveBeenCalledWith(["web"]);
  });

  it("numbered={false} esconde os números", () => {
    setup({ numbered: false });
    expect(screen.queryByText("001")).not.toBeInTheDocument();
  });

  it("data-slots e data-status", () => {
    setup({ defaultValue: ["api"] });
    expect(document.querySelector('[data-slot="status-list"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-slot="status-list-item"]')).toHaveLength(4);
    expect(
      document.querySelector('[data-slot="status-list-item"][data-status="degraded"]')
    ).not.toBeNull();
    expect(document.querySelectorAll('[data-slot="status-list-badge"]')).toHaveLength(4);
    expect(document.querySelector('[data-slot="status-list-history"]')).not.toBeNull();
    expect(
      document.querySelector('[data-slot="status-list-bar"][data-status="degraded"]')
    ).not.toBeNull();
  });

  it("ponto sem dado vira barra none", () => {
    setup({
      defaultValue: ["a"],
      items: [{ id: "a", name: "A", status: "operational", history: history(2, 0, 1) }],
    });
    expect(
      document.querySelectorAll('[data-slot="status-list-bar"][data-status="none"]')
    ).toHaveLength(1);
  });

  it("aceita updatedAt como número e string ISO e usa Date.now sem now", () => {
    render(
      <StatusList
        items={[
          { id: "a", name: "A", status: "operational", updatedAt: Date.now() - 2 * 3600 * 1000 },
          {
            id: "b",
            name: "B",
            status: "operational",
            updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          },
        ]}
      />
    );
    expect(screen.getByText("Atualizado há 2 horas")).toBeInTheDocument();
    expect(screen.getByText("Atualizado há 3 horas")).toBeInTheDocument();
  });

  it("repassa className e props para a raiz", () => {
    setup({ className: "extra", "aria-label": "Integrações" });
    const root = document.querySelector('[data-slot="status-list"]');
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("aria-label", "Integrações");
  });
});
