import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// O realce é assíncrono; para provar a corrida, cada chamada ao shiki devolve uma promessa
// que o teste resolve na ordem que quiser.
const pendentes = vi.hoisted(() => [] as Array<{ code: string; resolve: (html: string) => void }>);
vi.mock("shiki", () => ({
  codeToHtml: (code: string) => new Promise<string>((resolve) => pendentes.push({ code, resolve })),
}));

import { CodeBlock } from "./code-block";

const html = (code: string) => `<pre class="shiki"><code>${code}</code></pre>`;

describe("CodeBlock (corrida do realce)", () => {
  it("o realce do código antigo, chegando antes do novo, não fica na tela", async () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<CodeBlock code="antigo" language="bash" />);
    await act(async () => vi.advanceTimersByTime(150));
    rerender(<CodeBlock code="novo" language="bash" />);
    await act(async () => vi.advanceTimersByTime(150));

    const doNovo = pendentes.filter((p) => p.code === "novo");
    const doAntigo = pendentes.filter((p) => p.code === "antigo");
    // o antigo chega primeiro: hoje ele entra e ainda tranca a porta para o novo
    await act(async () => {
      for (const p of doAntigo) p.resolve(html("antigo"));
    });
    await act(async () => {
      for (const p of doNovo) p.resolve(html("novo"));
    });

    const realce = container.querySelector("pre.shiki");
    expect(realce).toHaveTextContent("novo");
    expect(container).not.toHaveTextContent("antigo");
    vi.useRealTimers();
  });
});
