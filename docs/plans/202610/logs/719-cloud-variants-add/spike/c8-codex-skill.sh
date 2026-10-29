#!/usr/bin/env bash
# C8 (U2): a `codex exec` prompt `$<skill> <phase> <arg>` invokes the repo skill `.agents/skills/<skill>/SKILL.md`
# non-interactively and the skill sees the arguments. Local codex CLI, real model (ChatGPT login), fresh
# CODEX_HOMEs (untrusted / trusted project), auth.json symlinked.
set -u
SPIKE=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike
FX="$SPIKE/fx-c8"; HA="$SPIKE/codex-home-c8-untrusted"; HB="$SPIKE/codex-home-c8-trusted"
rm -rf "$FX" "$HA" "$HB"; mkdir -p "$FX/.agents/skills/probe-auto" "$HA" "$HB"
git -C "$FX" init -q -b dev
cat >"$FX/.agents/skills/probe-auto/SKILL.md" <<'EOF'
---
name: probe-auto
description: "Probe — phase-routed dispatch probe (PROBE-SKILL-DESC-C8)"
---

# Probe Auto

1. Read invocation arguments `{PHASE}` and `{ARG}` (the words after the skill name).
2. Reply with exactly one line: `PROBE-SKILL-RAN-C8 phase={PHASE} arg={ARG}` and nothing else.
EOF
printf 'probe\n' >"$FX/README.md"
git -C "$FX" add -A && git -C "$FX" -c user.name=p -c user.email=p@p commit -qm init
for h in "$HA" "$HB"; do ln -s "$HOME/.codex/auth.json" "$h/auth.json"; : >"$h/config.toml"; done
printf '[projects."%s"]\ntrust_level = "trusted"\n' "$FX" >"$HB/config.toml"
for h in "$HA" "$HB"; do
  echo "== CODEX_HOME=$(basename "$h")"
  printf 'skill listed in prompt-input: %s\n' "$(cd "$FX" && CODEX_HOME="$h" codex debug prompt-input hi 2>&1 | grep -c PROBE-SKILL-DESC-C8)"
  (cd "$FX" && CODEX_HOME="$h" codex exec --ephemeral -s read-only --color never '$probe-auto ship 42' </dev/null 2>&1 | tail -6)
  echo "exit=${PIPESTATUS[0]}"
done
rm -rf "$FX" "$HA" "$HB"
