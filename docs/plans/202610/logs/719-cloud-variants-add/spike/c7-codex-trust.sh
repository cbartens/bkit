#!/usr/bin/env bash
# C7 (U1, CLI half): `codex exec` loads the project `.codex/` layer (project config.toml, `.codex/agents/*.toml`
# subagents, `.codex/hooks.json`) when — and only when — the CODEX_HOME config.toml marks the project trusted;
# the candidate the design would commit as `codex-home`. Local codex CLI, real model (ChatGPT login), fresh
# CODEX_HOMEs (auth.json symlinked, no other user config). Arg: phase = prompt | spawn | hooks.
set -u
SPIKE=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/spike
FX="$SPIKE/fx-c7"; HA="$SPIKE/codex-home-untrusted"; HB="$SPIKE/codex-home-trusted"
setup() {
  rm -rf "$FX" "$HA" "$HB"; mkdir -p "$FX/.codex/agents" "$HA" "$HB"
  git -C "$FX" init -q -b dev
  cat >"$FX/.codex/config.toml" <<'EOF'
developer_instructions = "PROJECT-CONFIG-MARKER-C7"
EOF
  cat >"$FX/.codex/agents/probe-agent.toml" <<'EOF'
name = "probe-agent"
description = "Probe subagent PROBE-AGENT-DESC-C7. Use when asked to spawn probe-agent."
developer_instructions = """
Whatever you are asked, reply with exactly: PROBE-AGENT-REPLY-C7
"""
EOF
  cat >"$FX/.codex/hooks.json" <<EOF
{"hooks":{
 "SessionStart":[{"hooks":[{"type":"command","command":"touch '$FX/hook-sessionstart'"}]}],
 "UserPromptSubmit":[{"hooks":[{"type":"command","command":"touch '$FX/hook-userprompt'"}]}]
}}
EOF
  printf 'probe\n' >"$FX/README.md"
  git -C "$FX" add -A && git -C "$FX" -c user.name=p -c user.email=p@p commit -qm init
  for h in "$HA" "$HB"; do ln -s "$HOME/.codex/auth.json" "$h/auth.json"; : >"$h/config.toml"; done
  printf '[projects."%s"]\ntrust_level = "trusted"\n' "$FX" >"$HB/config.toml"
  echo "fixture=$FX"; echo "--- $HB/config.toml"; cat "$HB/config.toml"
}
case "${1:-}" in
  setup) setup ;;
  prompt)
    for h in "$HA" "$HB"; do
      echo "== CODEX_HOME=$(basename "$h") codex debug prompt-input"
      out=$(cd "$FX" && CODEX_HOME="$h" codex debug prompt-input "hi" 2>&1); echo "exit=$?"
      for m in PROJECT-CONFIG-MARKER-C7 PROBE-AGENT-DESC-C7; do
        printf '%s occurrences=%s\n' "$m" "$(printf '%s' "$out" | grep -c "$m")"
      done
      printf '%s\n' "$out" | grep -iE 'trust|untrusted|skipp' | head -5
    done ;;
  spawn)
    for h in "$HA" "$HB"; do
      echo "== CODEX_HOME=$(basename "$h") codex exec spawn probe-agent"
      # no --ephemeral: subagent spawn needs the parent rollout persisted (run 1 failed with --ephemeral)
      (cd "$FX" && CODEX_HOME="$h" codex exec -s read-only --color never \
        "Spawn the custom subagent named probe-agent (agent type probe-agent) with the task 'say hello', wait for it, then reply with exactly its reply text and nothing else. If no agent named probe-agent is available, reply exactly NO-PROBE-AGENT." 2>&1 | tail -25)
      echo "exit=${PIPESTATUS[0]}"
    done ;;
  hooks)
    # A third variant with --dangerously-bypass-hook-trust (control) was denied by the session permission classifier.
    for v in "untrusted:$HA:" "trusted:$HB:"; do
      IFS=: read -r label h flag <<<"$v"
      rm -f "$FX/hook-sessionstart" "$FX/hook-userprompt"
      echo "== $label codex exec $flag"
      (cd "$FX" && CODEX_HOME="$h" codex exec --ephemeral -s read-only --color never $flag "Reply with exactly OK" 2>&1 | grep -iE 'hook|trust|^OK$|error' | head -8)
      echo "sessionstart_fired=$([ -f "$FX/hook-sessionstart" ] && echo yes || echo no) userprompt_fired=$([ -f "$FX/hook-userprompt" ] && echo yes || echo no)"
    done ;;
  clean) rm -rf "$FX" "$HA" "$HB" ;;
  *) echo "usage: $0 setup|prompt|spawn|hooks|clean"; exit 2 ;;
esac
