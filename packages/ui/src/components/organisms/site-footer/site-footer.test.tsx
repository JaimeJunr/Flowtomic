import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  SiteFooter,
  SiteFooterNewsletter,
  type SiteFooterNewsletterProps,
  type SiteFooterProps,
} from "./site-footer";

const columns: SiteFooterProps["columns"] = [
  {
    title: "Biblioteca",
    links: [
      { label: "Atoms", href: "/atoms" },
      { label: "Vagas", href: "/vagas", badge: "Novo" },
    ],
  },
  {
    title: "Recursos",
    links: [{ label: "GitHub", href: "https://github.com/x", external: true }],
  },
];

function setup(props: Partial<SiteFooterProps> = {}) {
  return render(
    <SiteFooter
      brand={{ logo: <span>flowtomic</span>, href: "/", tagline: "Componentes para produto." }}
      social={<a href="/x">Rede</a>}
      columns={columns}
      copyright="Copyright 2026 Flowtomic"
      legal={[
        { label: "Privacidade", href: "/privacidade" },
        { label: "Termos", href: "/termos" },
      ]}
      {...props}
    />
  );
}

describe("SiteFooter", () => {
  it("uma nav por coluna, nomeada pelo título", () => {
    setup();
    const biblioteca = screen.getByRole("navigation", { name: "Biblioteca" });
    expect(biblioteca).toHaveAttribute("data-slot", "site-footer-column");
    expect(within(biblioteca).getByRole("link", { name: "Atoms" })).toHaveAttribute(
      "href",
      "/atoms"
    );
    expect(screen.getByRole("navigation", { name: "Recursos" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 2, name: "Biblioteca" })).toBeInTheDocument();
  });

  it("headingLevel muda o nível dos títulos", () => {
    setup({ headingLevel: 3 });
    expect(screen.getByRole("heading", { level: 3, name: "Recursos" })).toBeInTheDocument();
  });

  it("marca com logo, frase e redes", () => {
    setup();
    expect(screen.getByRole("link", { name: "flowtomic" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Componentes para produto.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rede" })).toBeInTheDocument();
  });

  it("selo e ícone de externo nos links", () => {
    setup();
    expect(screen.getByText("Novo")).toBeInTheDocument();
    const github = screen.getByRole("link", { name: /GitHub/ });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noreferrer");
    expect(within(github).getByText("(abre em nova aba)")).toBeInTheDocument();
  });

  it("copyright e links legais na linha final", () => {
    setup();
    const bottom = document.querySelector('[data-slot="site-footer-bottom"]') as HTMLElement;
    expect(bottom).toHaveTextContent("Copyright 2026 Flowtomic");
    expect(within(bottom).getByRole("link", { name: "Privacidade" })).toHaveAttribute(
      "href",
      "/privacidade"
    );
    expect(within(bottom).getByRole("link", { name: "Termos" })).toBeInTheDocument();
  });

  it("band aparece depois da régua e contained limita a largura", () => {
    const { container } = setup({ band: <p>Apoiado por gente boa</p> });
    expect(screen.getByText("Apoiado por gente boa").closest("[data-slot]")).toHaveAttribute(
      "data-slot",
      "site-footer-band"
    );
    expect(container.querySelector(".max-w-6xl")).not.toBeNull();
  });

  it("contained={false} tira o limite de largura", () => {
    const { container } = setup({ contained: false });
    expect(container.querySelector(".max-w-6xl")).toBeNull();
  });

  it("sem marca nem redes, não cria a coluna de marca", () => {
    setup({ brand: undefined, social: undefined });
    expect(screen.queryByText("Componentes para produto.")).not.toBeInTheDocument();
  });
});

function newsletter(props: Partial<SiteFooterNewsletterProps> = {}) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(
    <SiteFooterNewsletter
      title="Novidades da biblioteca"
      description="Uma vez por mês."
      finePrint="Sem spam."
      onSubmit={onSubmit}
      {...props}
    />
  );
  return onSubmit;
}

describe("SiteFooterNewsletter", () => {
  it("envia o e-mail digitado e mostra o sucesso na região aria-live", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    newsletter({ onSubmit });
    expect(screen.getByText("Novidades da biblioteca")).toBeInTheDocument();
    expect(screen.getByText("Sem spam.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.dev");
    await user.click(screen.getByRole("button", { name: "Inscrever" }));
    expect(onSubmit).toHaveBeenCalledWith("ana@exemplo.dev");
    const regiao = document.querySelector('[aria-live="polite"]') as HTMLElement;
    await waitFor(() => expect(regiao).toHaveTextContent("Inscrição feita. Confira seu e-mail."));
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });

  it("mostra carregando enquanto a promessa não resolve", async () => {
    const user = userEvent.setup();
    let resolve: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    newsletter({ onSubmit });
    await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.dev");
    await user.click(screen.getByRole("button", { name: "Inscrever" }));
    const botao = await screen.findByRole("button", { name: "Enviando" });
    expect(botao).toBeDisabled();
    resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: "Inscrever" })).toBeEnabled());
  });

  it("promessa rejeitada mostra o erro ligado ao campo", async () => {
    const user = userEvent.setup();
    newsletter({ onSubmit: vi.fn().mockRejectedValue(new Error("falhou")) });
    await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.dev");
    await user.click(screen.getByRole("button", { name: "Inscrever" }));
    const mensagem = await screen.findByText("Não foi possível se inscrever. Tente de novo.");
    expect(mensagem).toHaveAttribute("aria-live", "polite");
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-describedby", mensagem.id);
    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@exemplo.dev");
  });

  it("não envia com e-mail vazio ou inválido", async () => {
    const user = userEvent.setup();
    const onSubmit = newsletter();
    await user.click(screen.getByRole("button", { name: "Inscrever" }));
    await user.type(screen.getByLabelText("E-mail"), "isso-nao-e-email");
    await user.click(screen.getByRole("button", { name: "Inscrever" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rótulo do botão e mensagens são configuráveis", async () => {
    const user = userEvent.setup();
    newsletter({
      submitLabel: "Assinar",
      successMessage: "Pronto.",
      onSubmit: vi.fn().mockResolvedValue(undefined),
    });
    await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.dev");
    await user.click(screen.getByRole("button", { name: "Assinar" }));
    expect(await screen.findByText("Pronto.")).toBeInTheDocument();
  });
});
