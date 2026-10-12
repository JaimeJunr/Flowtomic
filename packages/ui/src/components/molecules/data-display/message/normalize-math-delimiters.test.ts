import { describe, expect, it } from "vitest";
import { normalizeMathDelimiters } from "./normalize-math-delimiters";

// Guarda de complexidade que não depende da carga da máquina: mede quanto o tempo
// cresce quando a entrada fica 4x maior. Linear dá ~4x; quadrático, ~16x. Limite de
// 1 s de relógio de parede falhava na suíte inteira com cobertura (1023 ms, 3600 ms).
const FATOR = 4;
const RAZAO_MAXIMA = 9;

function menorTempo(executar: () => void): number {
  const inicio = performance.now();
  executar();
  return performance.now() - inicio;
}

// Dobra `n` até a entrada pequena levar ~10 ms (ruído de timer some) e mede pequena e
// grande alternadas, ficando com o melhor tempo de cada: um pico de carga atinge uma
// rodada, não todas, e carga sustentada pesa nos dois lados da razão.
function razaoDeCrescimento(
  montar: (n: number) => string,
  processar: (texto: string) => unknown
): number {
  let n = 64;
  let pequeno = montar(n);
  processar(pequeno); // aquecimento do JIT
  while (menorTempo(() => processar(pequeno)) < 10 && n < 1 << 20) {
    n *= 2;
    pequeno = montar(n);
  }
  const grande = montar(n * FATOR);
  let melhorPequeno = Number.POSITIVE_INFINITY;
  let melhorGrande = Number.POSITIVE_INFINITY;
  for (let rodada = 0; rodada < 5; rodada++) {
    melhorPequeno = Math.min(
      melhorPequeno,
      menorTempo(() => processar(pequeno))
    );
    melhorGrande = Math.min(
      melhorGrande,
      menorTempo(() => processar(grande))
    );
  }
  return melhorGrande / melhorPequeno;
}

function esperaLinear(montar: (n: number) => string) {
  expect(razaoDeCrescimento(montar, normalizeMathDelimiters)).toBeLessThan(RAZAO_MAXIMA);
}

describe("medidor de crescimento", () => {
  it("aceita processamento linear", () => {
    const linear = (texto: string) => texto.split("").reverse().join("");
    expect(razaoDeCrescimento((n) => "ab".repeat(n), linear)).toBeLessThan(RAZAO_MAXIMA);
  });

  it("reprova processamento quadrático", () => {
    // cada posição procura de novo até o fim, como uma regex com backtracking
    const quadratico = (texto: string) => {
      let achados = 0;
      for (let i = 0; i < texto.length; i++) if (texto.indexOf("\u0000", i) >= 0) achados++;
      return achados;
    };
    expect(razaoDeCrescimento((n) => "ab".repeat(n), quadratico)).toBeGreaterThan(RAZAO_MAXIMA);
  });
});

// Resposta real do Grok 4.7 que saiu quebrada em produção na Constelação.
const respostaGrok = `A fórmula é:
\\[ M = C \\times (1 + i)^t \\]
- \\(M\\): montante final
- Ano 1: \\(1.000 \\times 1{,}10 = 1.100\\) → R$ 1.100
**Resultado:** ao final de 3 anos você tem **R$ 1.331**. Os juros totais são **R$ 331**.
Se fossem juros simples (só sobre os R$ 1.000), seriam R$ 100 por ano, totalizando R$ 1.300.`;

describe("normalizeMathDelimiters", () => {
  it("converte a resposta real do Grok: bloco, inline e moeda", () => {
    expect(normalizeMathDelimiters(respostaGrok)).toBe(`A fórmula é:
$$
M = C \\times (1 + i)^t
$$
- $M$: montante final
- Ano 1: $1.000 \\times 1{,}10 = 1.100$ → R\\$ 1.100
**Resultado:** ao final de 3 anos você tem **R\\$ 1.331**. Os juros totais são **R\\$ 331**.
Se fossem juros simples (só sobre os R\\$ 1.000), seriam R\\$ 100 por ano, totalizando R\\$ 1.300.`);
  });

  describe("\\[ \\] vira bloco $$", () => {
    it("multilinha, com os delimitadores sozinhos na linha", () => {
      expect(normalizeMathDelimiters("Veja:\n\\[\n  a^2 + b^2\n  = c^2\n\\]\nFim.")).toBe(
        "Veja:\n$$\na^2 + b^2\n  = c^2\n$$\nFim."
      );
    });

    it("mantém o recuo do item de lista", () => {
      expect(normalizeMathDelimiters("- Fórmula:\n\n  \\[ x = 1 \\]\n")).toBe(
        "- Fórmula:\n\n  $$\n  x = 1\n  $$\n"
      );
    });

    it("no meio da linha vira math inline, sem abrir bloco no lugar errado", () => {
      expect(normalizeMathDelimiters("A área é \\[ \\pi r^2 \\] metros.")).toBe(
        "A área é $\\pi r^2$ metros."
      );
      expect(normalizeMathDelimiters("- \\[ x = 1 \\]")).toBe("- $x = 1$");
    });

    it("não confunde \\\\[2pt] (quebra de linha do LaTeX) com delimitador", () => {
      const texto = "$$\n\\begin{matrix} a \\\\[2pt] b \\end{matrix}\n$$";
      expect(normalizeMathDelimiters(texto)).toBe(texto);
    });
  });

  describe("\\( \\) vira $...$", () => {
    it.each([
      ["\\(x\\)\\(y\\)", "$x$ $y$"],
      ["$a$\\(b\\)", "$a$ $b$"],
      ["\\(a\\)$b$", "$a$ $b$"],
      ["\\(a\\)\\(b\\)\\(c\\)", "$a$ $b$ $c$"],
      ["\\(a\\) \\(b\\)", "$a$ $b$"],
    ])("separa delimitadores adjacentes com espaço comum: %s", (entrada, saida) => {
      expect(normalizeMathDelimiters(entrada)).toBe(saida);
      expect(normalizeMathDelimiters(saida)).toBe(saida);
    });

    it("converte e apara os espaços das pontas", () => {
      expect(normalizeMathDelimiters("Se \\( x^2 \\) cresce")).toBe("Se $x^2$ cresce");
    });

    it("não converte quando o conteúdo já tem $ (fecharia antes da hora)", () => {
      expect(normalizeMathDelimiters("\\(\\text{custo em } $\\)")).toBe(
        "\\(\\text{custo em } $\\)"
      );
    });

    it("não atravessa parágrafo", () => {
      const texto = "Abre \\(x\n\nfecha\\) depois";
      expect(normalizeMathDelimiters(texto)).toBe(texto);
    });

    it("delimitador vazio fica como veio", () => {
      expect(normalizeMathDelimiters("\\(\\) e \\[ \\]")).toBe("\\(\\) e \\[ \\]");
    });
  });

  describe("moeda não abre fórmula", () => {
    it.each([
      "Se $x \\in R$ 5 vezes",
      "Se $x \\in US$ 5 vezes",
      "$$\\text{R$ 10 e US$ 20}$$",
      "$$\n\\text{R$ 10 e US$ 20}\n$$",
    ])("preserva moeda e fechamento em math existente: %s", (texto) => {
      expect(normalizeMathDelimiters(texto)).toBe(texto);
    });

    it("dois valores em negrito não formam uma região de math", () => {
      expect(normalizeMathDelimiters("**R$ 1.331**. Os juros totais são **R$ 331**")).toBe(
        "**R\\$ 1.331**. Os juros totais são **R\\$ 331**"
      );
    });

    it.each([
      ["R$ 1.000,00", "R\\$ 1.000,00"],
      ["R$1.000", "R\\$1.000"],
      ["US$ 5", "US\\$ 5"],
      ["US$5,99 ou R$ 30", "US\\$5,99 ou R\\$ 30"],
      ["(R$ 10)", "(R\\$ 10)"],
      ["**R$ 1.331**", "**R\\$ 1.331**"],
      ["R$\u00a0250", "R\\$\u00a0250"],
      ["saldo de R$ -20", "saldo de R\\$ -20"],
    ])("%s", (entrada, saida) => {
      expect(normalizeMathDelimiters(entrada)).toBe(saida);
    });

    it("não mexe em R$ que fecha fórmula ($x \\in R$) nem em letra colada", () => {
      for (const texto of ["$x \\in R$, logo", "$R$ 5", "BR$ 5", "R$ sem número", "R\\$ 10"]) {
        expect(normalizeMathDelimiters(texto)).toBe(texto);
      }
    });
  });

  describe("$ legítimo continua igual", () => {
    it.each([
      "Se o teste executar $18$ de $24$ linhas, $x^2$.",
      "$$\nC = \\frac{a}{b}\n$$",
      "Texto sem fórmula nenhuma.",
      "",
    ])("%j", (texto) => {
      expect(normalizeMathDelimiters(texto)).toBe(texto);
    });
  });

  describe("código fica intocado", () => {
    it("uma cerca mais recuada que o conteúdo da lista não fecha o bloco", () => {
      const codigo = "- ```latex\n  \\(x\\)\n      ```\n  R$ 10\n  ```";
      expect(normalizeMathDelimiters(`${codigo}\n\n\\(y\\)`)).toBe(`${codigo}\n\n$y$`);
    });

    it("o fechamento da lista aceita até três colunas extras", () => {
      const codigo = "1. ```latex\n   \\(x\\)\n      ```";
      expect(normalizeMathDelimiters(`${codigo}\n\n\\(y\\)`)).toBe(`${codigo}\n\n$y$`);
    });

    it("uma cerca com recuo incompatível não fecha o bloco", () => {
      const codigo = "- ```latex\n  \\(x\\)\n```\n  R$ 10\n  ```";
      expect(normalizeMathDelimiters(`${codigo}\n\n\\(y\\)`)).toBe(`${codigo}\n\n$y$`);
    });

    it.each([
      ["- ```latex", "  "],
      ["+ ~~~latex", "  "],
      ["* ```latex", "  "],
      ["1. ```latex", "   "],
      ["12) ```latex", "    "],
      ["  - ```latex", "    "],
      ["> - ```latex", ">   "],
      ["- Código:\n\n  ```latex", "  "],
    ])("reconhece cerca dentro de lista: %s", (abertura, recuo) => {
      const cerca = abertura.includes("~~~") ? "~~~" : "```";
      const codigo = `${abertura}\n${recuo}\\(x\\) e R$ 10\n${recuo}${cerca}`;
      expect(normalizeMathDelimiters(`${codigo}\n\nFora: \\(y\\) e US$ 5`)).toBe(
        `${codigo}\n\nFora: $y$ e US\\$ 5`
      );
    });

    it("bloco cercado com ``` e ~~~", () => {
      const texto =
        "```latex\n\\[ x \\]\nR$ 10\n```\n~~~~\n\\(y\\) custa US$ 5\n~~~~\nfora: \\(z\\)";
      expect(normalizeMathDelimiters(texto)).toBe(
        "```latex\n\\[ x \\]\nR$ 10\n```\n~~~~\n\\(y\\) custa US$ 5\n~~~~\nfora: $z$"
      );
    });

    it("bloco cercado só fecha com cerca do mesmo caractere e tamanho suficiente", () => {
      const texto = "````\n```\n\\(x\\)\n~~~\n````\n\\(y\\)";
      expect(normalizeMathDelimiters(texto)).toBe("````\n```\n\\(x\\)\n~~~\n````\n$y$");
    });

    it("código inline, inclusive com crase dupla", () => {
      expect(normalizeMathDelimiters("Use `\\(x\\)` ou ``R$ 1 ` \\[y\\]`` e \\(z\\)")).toBe(
        "Use `\\(x\\)` ou ``R$ 1 ` \\[y\\]`` e $z$"
      );
    });

    it("crase sem par é texto literal (CommonMark)", () => {
      expect(normalizeMathDelimiters("um ` solto e \\(x\\)")).toBe("um ` solto e $x$");
    });

    it("```a``` numa linha é código inline, não cerca", () => {
      expect(normalizeMathDelimiters("```\\(x\\)``` e \\(y\\)")).toBe("```\\(x\\)``` e $y$");
    });
  });

  describe("streaming (texto parcial)", () => {
    it.each([
      "A fórmula é:\n\\[ M = C \\times",
      "Ano 1: \\(1.000 \\times",
      "```python\nprint('\\(x\\)')",
      "Valor: R$",
      "\\",
      "\\[",
      "`",
    ])("delimitador sem fechar fica como veio: %j", (parcial) => {
      expect(normalizeMathDelimiters(parcial)).toBe(parcial);
    });

    it("cada prefixo da resposta real é normalizado sem lançar", () => {
      for (let i = 0; i <= respostaGrok.length; i++) {
        expect(() => normalizeMathDelimiters(respostaGrok.slice(0, i))).not.toThrow();
      }
    });

    it("é idempotente", () => {
      const uma = normalizeMathDelimiters(respostaGrok);
      expect(normalizeMathDelimiters(uma)).toBe(uma);
    });

    it.each<[string, (n: number) => string]>([
      ["\\( repetido", (n) => "\\(".repeat(n)],
      ["\\[ a repetido", (n) => "\\[ a ".repeat(n)],
      ["crases misturadas", (n) => "` `` ``` ".repeat(n)],
      ["R$ seguido de espaços", (n) => `R$${" ".repeat(n)}x`],
      ["barras antes de [", (n) => `${"\\".repeat(n)}[`],
    ])("entrada patológica cresce linear (sem backtracking): %s", (_nome, montar) => {
      esperaLinear(montar);
    });

    it("aberturas rejeitadas pelo mesmo dólar terminam em tempo linear", () => {
      const montar = (n: number) => `${"\\(".repeat(n)}$\\)`;
      expect(normalizeMathDelimiters(montar(64_000))).toBe(montar(64_000));
      esperaLinear(montar);
    });
  });
});
describe("regressões da re-review", () => {
  it.each([
    "[link](https://example.com/\\(a\\)\\(b\\))",
    '[link](<https://example.com/\\(a\\)> "R$ 5 \\(t\\)")',
    '[id]: https://example.com/\\(a\\) "R$ 5 \\(t\\)"',
    '[id]: <https://example.com/\\(a\\)>\n  "R$ 5 \\(t\\)"',
    "<https://example.com/\\(a\\)\\(b\\)>",
    "https://example.com/\\(a\\)\\(b\\)/R$5",
    '[id]:\n  <https://example.com/\\(a\\)>\n  "R$ 5\n  \\(t\\)"',
    '[link](/\\(a\\)/R$5 "R$ 5\n\\(t\\)")',
  ])("preserva destino, referência e URL: %s", (text) => {
    expect(normalizeMathDelimiters(text)).toBe(text);
  });
  it("normaliza somente o rótulo do link", () => {
    expect(normalizeMathDelimiters("[R$ 5](https://x.com/R$5)")).toBe(
      "[R\\$ 5](https://x.com/R$5)"
    );
  });
  it.each(["", "- "])("crase escapada não abre código: %s", (prefix) => {
    const text = `${prefix}\\\`literal e \`\\(x\\)\``;
    expect(normalizeMathDelimiters(text)).toBe(text);
  });
  it("fecha cerca pela profundidade da citação", () => {
    const code = "> > ````\n> > \\(x\\) e R$ 10\n>> ````\n\n";
    expect(normalizeMathDelimiters(`${code}**R$ 1.331**. Os juros totais são **R$ 331**`)).toBe(
      `${code}**R\\$ 1.331**. Os juros totais são **R\\$ 331**`
    );
  });
});
describe("3ª review: proteção só onde é link", () => {
  it.each([
    ["[Passo 1]: custa **R$ 5** e **R$ 6**", "[Passo 1]: custa **R\\$ 5** e **R\\$ 6**"],
    ["[Nota]: calcule \\(x\\) e pague R$ 5", "[Nota]: calcule $x$ e pague R\\$ 5"],
    ['[a]: https://x.com "t" e R$ 5', '[a]: https://x.com "t" e R\\$ 5'],
  ])("rótulo seguido de texto não é definição: %s", (entrada, saida) => {
    expect(normalizeMathDelimiters(entrada)).toBe(saida);
  });

  it("definições consecutivas continuam protegidas", () => {
    const texto = '[a]: https://x.com/\\(a\\) "R$ 5"\n[b]: <https://y.com/\\(b\\)>';
    expect(normalizeMathDelimiters(texto)).toBe(texto);
  });

  it.each([
    ["$f[x](y)$ custa **R$ 5** e **R$ 6**", "$f[x](y)$ custa **R\\$ 5** e **R\\$ 6**"],
    ["$f[x](y)$ e \\(z\\) e R$ 5", "$f[x](y)$ e $z$ e R\\$ 5"],
    ["$$f[x](y)$$ e \\(z\\) e R$ 5", "$$f[x](y)$$ e $z$ e R\\$ 5"],
    ["$http://a.b$ e \\(z\\)", "$http://a.b$ e $z$"],
  ])("link ou URL dentro de math não desfaz o pareamento: %s", (entrada, saida) => {
    expect(normalizeMathDelimiters(entrada)).toBe(saida);
  });

  it("`](` sem `[` antes não protege o parágrafo", () => {
    expect(normalizeMathDelimiters("texto ](solto custa **R$ 5** e **R$ 6**")).toBe(
      "texto ](solto custa **R\\$ 5** e **R\\$ 6**"
    );
    expect(normalizeMathDelimiters("[a ](x y custa **R$ 5**")).toBe("[a ](x y custa **R\\$ 5**");
  });

  it.each([
    ["\\( f[x](y) \\)", "$f[x](y)$"],
    ["\\[ f[x](y) = 1 \\]", "$$\nf[x](y) = 1\n$$"],
    ["\\(x \\in ]0,1](a)\\)", "$x \\in ]0,1](a)$"],
    ["\\( \\text{www.exemplo.com} \\)", "$\\text{www.exemplo.com}$"],
    ["\\(\\text{http://a.b}\\)", "$\\text{http://a.b}$"],
  ])("converte fórmula com URL ou `](` dentro: %s", (entrada, saida) => {
    expect(normalizeMathDelimiters(entrada)).toBe(saida);
  });

  it("é idempotente nos casos novos", () => {
    for (const t of [
      "[Passo 1]: custa **R$ 5** e **R$ 6**",
      "$f[x](y)$ e \\(z\\) e R$ 5",
      "\\(x \\in ]0,1](a)\\)",
    ]) {
      const uma = normalizeMathDelimiters(t);
      expect(normalizeMathDelimiters(uma)).toBe(uma);
    }
  });

  it.each([
    '[a](u "x [b](v " zz \\(k\\)" )',
    "[a](u 'x [b](v ' zz \\(k\\)' )",
    '[a](u "x [b](v " zz R$ 5" )',
  ])("o fechamento memorizado de título pode abrir outro título: %s", (texto) => {
    // o 2º link `[b](v "...")` é válido: o título dele protege o resto
    expect(normalizeMathDelimiters(texto)).toBe(texto);
  });

  it.each<[string, (n: number) => string]>([
    ["sem `)` no fim", (n) => `\\(x\\) ${"[a](u (".repeat(n)}`],
    ["aspas, com fechamento no fim", (n) => `\\(x\\) ${'[a](u "'.repeat(n)}" x`],
    ["com `)` no fim", (n) => `\\(x\\) ${"[a](u (".repeat(n)} )x`],
  ])("título `(` repetido de link inline é linear: %s", (_nome, montar) => {
    esperaLinear(montar);
  });

  it.each<[string, (n: number) => string]>([
    ["definição com `(` sem fim", (n) => "[x]: a (\n".repeat(n)],
    ["definições com aspas sem fim", (n) => "[x]: a \"\n[x]: a '\n".repeat(n)],
    ["link inline com título sem fim", (n) => '[x](a "b\n'.repeat(n)],
    ["definições simples", (n) => "[x]: a\n".repeat(n)],
    ["`[x](` repetido", (n) => "[x](".repeat(n)],
    ["`[x]( (` repetido", (n) => "[x]( (".repeat(n)],
    ["`](` sem `[`", (n) => "a ](b ".repeat(n)],
  ])("rótulos, `](` e títulos sem fim terminam em tempo linear: %s", (_nome, montar) => {
    esperaLinear(montar);
  });
});
