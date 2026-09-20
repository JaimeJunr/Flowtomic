#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import path from "node:path";
/**
 * Driver one-shot do Storybook do Flowtomic.
 *
 * Saída: uma linha de JSON em stdout. Exit 0 = passou, 1 = falhou.
 * Screenshot SEMPRE vai pra disco — inclusive no caminho de erro, que é onde
 * ela mais vale.
 *
 * Uso (a partir da raiz do repo):
 *   node .claude/skills/run-flowtomic/verify.mjs story <storyId> [--click "<nome acessível>"] [--expect "<texto>"]
 *   node .claude/skills/run-flowtomic/verify.mjs smoke [--grep <regex>] [--limit <n>]
 *   node .claude/skills/run-flowtomic/verify.mjs list [--grep <regex>]
 */
import { chromium } from "playwright";

const BASE = process.env.SB_URL ?? "http://localhost:6006";
const SHOTS = process.env.SB_SHOTS ?? ".claude/skills/run-flowtomic/shots";
const [cmd, ...rest] = process.argv.slice(2);

function flag(name, fallback) {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : rest[i + 1];
}
const positional = rest.filter((a, i) => !a.startsWith("--") && !rest[i - 1]?.startsWith("--"));

function out(obj, failed) {
  console.log(JSON.stringify(obj));
  process.exitCode = failed ? 1 : 0;
}

async function loadIndex() {
  const r = await fetch(`${BASE}/index.json`);
  if (!r.ok)
    throw new Error(`index.json respondeu ${r.status} — o Storybook está no ar em ${BASE}?`);
  return Object.values((await r.json()).entries).filter((e) => e.type === "story");
}

/**
 * Abre UMA story no iframe isolado e decide se renderizou.
 * O Storybook 10 não lança exceção quando a story quebra: ele troca o conteúdo
 * do #storybook-root pelo painel .sb-show-errordisplay. Por isso o veredito
 * olha o DOM, não o resultado do goto().
 */
async function openStory(page, id) {
  const errors = [];
  page.on(
    "console",
    (m) => m.type() === "error" && errors.push(m.text().split("\n")[0].slice(0, 300))
  );
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.split("\n")[0].slice(0, 300)}`));

  await page.goto(`${BASE}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, {
    waitUntil: "domcontentloaded",
  });

  // O Storybook 10.2 navega o iframe DUAS vezes na mesma URL (auto-reload após
  // o boot). A segunda navegação destrói o contexto de execução entre a espera
  // e a leitura, então a checagem é refeita quando isso acontece — limitado,
  // não um retry cego.
  let rendered;
  let lastError;
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      // Espera semântica: ou a story pintou algo, ou o Storybook trocou o body
      // pro painel de erro. O sinal é a CLASSE no <body> — #error-message
      // existe sempre, vazio, e por isso não serve de gatilho sozinho.
      await page.waitForFunction(
        () => {
          const root = document.querySelector("#storybook-root");
          return (
            document.body.classList.contains("sb-show-errordisplay") ||
            (root !== null && root.innerHTML.trim().length > 0)
          );
        },
        null,
        { timeout: 15000 }
      );

      rendered = await page.evaluate(() => {
        if (document.body.classList.contains("sb-show-errordisplay")) {
          const msg = document.querySelector("#error-message")?.textContent?.trim();
          return { ok: false, reason: (msg || "sb-show-errordisplay sem mensagem").slice(0, 300) };
        }
        const root = document.querySelector("#storybook-root");
        const filled = root !== null && root.innerHTML.trim().length > 0;
        return { ok: filled, reason: filled ? "" : "#storybook-root vazio" };
      });
      break;
    } catch (e) {
      lastError = e;
      if (!/Execution context was destroyed|navigation/i.test(e.message)) throw e;
      await page.waitForLoadState("domcontentloaded");
    }
  }
  if (!rendered) throw lastError;

  // O reload republica os mesmos console.error; sem dedupe a contagem infla.
  return { rendered, errors: [...new Set(errors)] };
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    if (cmd === "list") {
      const re = flag("grep") ? new RegExp(flag("grep"), "i") : null;
      const ids = (await loadIndex()).map((e) => e.id).filter((id) => !re || re.test(id));
      out({ ok: true, count: ids.length, ids: ids.slice(0, 50) });
      return;
    }

    if (cmd === "story") {
      const id = positional[0];
      if (!id) throw new Error("faltou o storyId: verify.mjs story <storyId>");
      const shot = path.join(SHOTS, `${id}.png`);
      const { rendered, errors } = await openStory(page, id);

      let clicked = null;
      let expected = null;
      const click = flag("click");
      if (click) {
        await page.getByRole("button", { name: click }).first().click({ timeout: 5000 });
        clicked = click;
      }
      const expect = flag("expect");
      if (expect) {
        await page.getByText(expect).first().waitFor({ timeout: 5000 });
        expected = expect;
      }

      await page.screenshot({ path: shot, animations: "disabled" });
      const failed = !rendered.ok;
      out(
        {
          ok: !failed,
          id,
          clicked,
          expected,
          consoleErrors: errors.length,
          errorSample: errors.slice(0, 3),
          shot,
          ...(failed ? { reason: rendered.reason } : {}),
        },
        failed
      );
      return;
    }

    if (cmd === "smoke") {
      const re = flag("grep") ? new RegExp(flag("grep"), "i") : null;
      const limit = Number(flag("limit", "40"));
      const stories = (await loadIndex()).filter((e) => !re || re.test(e.id)).slice(0, limit);
      const ignoreConsole = rest.includes("--ignore-console");
      // broken = a tela não pintou. noisy = pintou, mas cuspiu console.error.
      // São severidades diferentes e misturá-las esconde a quebra real no ruído.
      const broken = [];
      const noisy = [];
      for (const s of stories) {
        const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        try {
          const { rendered, errors } = await openStory(p, s.id);
          if (!rendered.ok) {
            await p.screenshot({
              path: path.join(SHOTS, `FALHA-${s.id}.png`),
              animations: "disabled",
            });
            broken.push({ id: s.id, reason: rendered.reason });
          } else if (errors.length) {
            noisy.push({ id: s.id, consoleError: errors[0] });
          }
        } catch (e) {
          await p
            .screenshot({ path: path.join(SHOTS, `FALHA-${s.id}.png`), animations: "disabled" })
            .catch(() => {});
          broken.push({ id: s.id, reason: e.message.split("\n")[0].slice(0, 200) });
        } finally {
          await p.close();
        }
      }
      const failed = broken.length > 0 || (!ignoreConsole && noisy.length > 0);
      out({ ok: !failed, checked: stories.length, broken, noisy }, failed);
      return;
    }

    throw new Error(`comando desconhecido: ${cmd ?? "(vazio)"} — use story | smoke | list`);
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, "falha.png") }).catch(() => {});
    out({ ok: false, error: e.message.split("\n")[0] }, true);
  } finally {
    await browser.close();
  }
}

await main();
