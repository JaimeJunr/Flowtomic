#!/usr/bin/env bash
# Derruba o Storybook do Flowtomic.
#
# Por que um script em vez de `pkill -f 'storybook dev'` na mão: quando o agente
# digita esse pkill, a string "storybook dev" também está na linha de comando do
# shell que executa o pkill — ele mata a si mesmo (exit 144) e o alvo sobrevive.
# Dentro de um arquivo, o padrão não aparece na linha de comando do invocador.
set -uo pipefail

PATTERN='storybook[ ]dev'
pids="$(pgrep -f "$PATTERN" || true)"

if [ -z "$pids" ]; then
  echo '{"ok":true,"killed":0}'
  exit 0
fi

# shellcheck disable=SC2086
kill $pids 2>/dev/null || true

# Espera a porta liberar em vez de assumir que o kill já surtiu efeito.
for _ in $(seq 1 40); do
  pgrep -f "$PATTERN" >/dev/null 2>&1 || break
  sleep 0.25
done

if pgrep -f "$PATTERN" >/dev/null 2>&1; then
  # shellcheck disable=SC2086
  kill -9 $(pgrep -f "$PATTERN") 2>/dev/null || true
  sleep 0.5
fi

echo "{\"ok\":true,\"killed\":$(echo "$pids" | wc -w)}"
