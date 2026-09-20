import { describe, expect, it } from "vitest";
import { fetchRegistry } from "./registry";

/**
 * Fake do servidor do registry — o único I/O externo deste módulo.
 * Devolve o payload combinado sem tocar a rede.
 */
class FakeRegistryServer {
  constructor(
    private readonly payload: unknown,
    private readonly status = 200
  ) {}

  readonly buscar = async (): Promise<Response> =>
    new Response(JSON.stringify(this.payload), { status: this.status });
}

describe("fetchRegistry", () => {
  it("devolve os dados quando o payload é um objeto de registry", async () => {
    const servidor = new FakeRegistryServer({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      components: [{ name: "button" }],
      blocks: [],
    });

    const dados = await fetchRegistry(servidor.buscar);

    expect(dados?.style).toBe("default");
    expect(dados?.components).toHaveLength(1);
  });

  // O endpoint é remoto: um proxy, uma página de erro em HTML ou um deploy pela
  // metade devolvem 200 com corpo que não é um registry. Sem checagem, esse
  // corpo era devolvido como se fosse `RegistryData` e quebrava longe daqui.
  it("devolve null quando o payload não é um objeto", async () => {
    const servidor = new FakeRegistryServer("<html>504 Gateway Timeout</html>");

    expect(await fetchRegistry(servidor.buscar)).toBeNull();
  });

  it("devolve null quando o payload é um array", async () => {
    const servidor = new FakeRegistryServer([{ name: "button" }]);

    expect(await fetchRegistry(servidor.buscar)).toBeNull();
  });

  it("devolve null quando o payload é JSON null", async () => {
    const servidor = new FakeRegistryServer(null);

    expect(await fetchRegistry(servidor.buscar)).toBeNull();
  });

  it("devolve null quando a resposta não é ok", async () => {
    const servidor = new FakeRegistryServer({ style: "default" }, 500);

    expect(await fetchRegistry(servidor.buscar)).toBeNull();
  });
});
