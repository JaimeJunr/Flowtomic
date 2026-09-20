#!/usr/bin/env bash
# Sobe o Storybook do Flowtomic e só devolve o controle quando ele responde.
# Idempotente: se já estiver no ar na porta, não sobe outro.
#
# Uso (da raiz do repo):  bash .claude/skills/run-flowtomic/up.sh
# Derruba com:            pkill -f 'storybook dev'
set -euo pipefail

PORT="${SB_PORT:-6006}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
LOG="${SB_LOG:-/tmp/flowtomic-storybook.log}"

if curl -sf "http://localhost:${PORT}/index.json" >/dev/null 2>&1; then
  echo "{\"ok\":true,\"already\":true,\"url\":\"http://localhost:${PORT}\"}"
  exit 0
fi

cd "$ROOT/packages/ui"
nohup bun run storybook --no-open >"$LOG" 2>&1 &
echo "$!" >/tmp/flowtomic-storybook.pid

# Poll com prazo: a condição é observável (index.json responde), o prazo é o timeout.
# Boot frio leva ~10-20s nesta máquina; 240s cobre máquina lenta sem virar aposta.
if timeout 240 bash -c "until curl -sf http://localhost:${PORT}/index.json >/dev/null 2>&1; do sleep 0.5; done"; then
  echo "{\"ok\":true,\"already\":false,\"url\":\"http://localhost:${PORT}\",\"log\":\"${LOG}\"}"
else
  echo "{\"ok\":false,\"error\":\"storybook nao respondeu em 240s\",\"log\":\"${LOG}\"}"
  tail -20 "$LOG" >&2
  exit 1
fi
