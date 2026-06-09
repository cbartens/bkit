#!/usr/bin/env bash
# bkit-mode.sh — multi-provider execution-target swap for bkit's Claude Code terminal.
#
# Issues #243 (local Ollama) + #244 (NVIDIA NIM). Approach A: keep Claude Code as the
# harness (subagents / commands / hooks / MCP unchanged) and swap only the inference
# BACKEND. OpenAI-format backends (Ollama, NVIDIA) are bridged to Claude Code's
# Anthropic Messages API by claude-code-router (`ccr`), which routes each request to a
# provider by matching the requested model name — so bkit's per-agent `model:` headers
# keep selecting a distinct model per subagent.
#
# ── Install the shim once (in ~/.zshrc or ~/.bashrc) ────────────────────────
#     source /ABS/PATH/TO/bkit-mode.sh
#
# ── Then, from anywhere in the repo (verb + flags, like `bkit install --auto=…`) ──
#     bkit mode --cloud=claude     # Anthropic API, direct (no router)
#     bkit mode --cloud=nvidia     # NVIDIA NIM   via claude-code-router
#     bkit mode --local=ollama     # Ollama       via claude-code-router
#     bkit mode --status           # show current backend + sample header
#     bkit mode --doctor           # check required tools/creds for every provider
#     bkit mode --list=<provider>  # query the backend's live /v1/models (never guess IDs)
#     bkit mode --reset            # restore the default Anthropic cloud state (stops router)
#     bkit <anything else>         # delegated verbatim to the real `bkit` binary
#
# The cloud-agent lane is a normal install flag, NOT a mode: `bkit install --auto=claude`.
#
# WHY A SHELL FUNCTION: `mode` exports ANTHROPIC_BASE_URL / keys into your CURRENT
# shell. A node binary runs in a subshell and cannot do that (the sourced-vs-executed
# wall). So `bkit` becomes a function (nvm/pyenv pattern) that handles `mode` in-shell
# and forwards everything else (install/upgrade/check/…) to `command bkit`.
#
# Secrets: NVIDIA_API_KEY (and the cloud ANTHROPIC_API_KEY) are read from .bkit/.env via
# direnv. NVIDIA keys look like `nvapi-…`; add `NVIDIA_API_KEY="nvapi-…"` to .bkit/.env.

# ===========================================================================
# Provider registry — backend transport per (mode, provider)
# ===========================================================================
# Each row: "mode/provider|backend_base_url|key_env_var|uses_router(0/1)"
# backend_base_url is the OpenAI-compatible /v1 root (router targets it; ignored when
# uses_router=0). For cloud/claude we go DIRECT to Anthropic — no router, no OpenAI.
_bkit_registry() {
  cat <<'EOF'
cloud/claude|https://api.anthropic.com|ANTHROPIC_API_KEY|0
cloud/nvidia|https://integrate.api.nvidia.com/v1|NVIDIA_API_KEY|1
local/ollama|http://localhost:11434/v1|OLLAMA_DUMMY_KEY|1
EOF
}

# Agent matrix — THE single source of truth for per-agent model selection across ALL
# providers. One pipe-delimited row per agent:  file|claude|ollama|nvidia
# (pipe, not colon, because Ollama ids contain ':'). One process — `_bkit_target_model`
# just picks the column for the active provider; adding a provider = add a column.
#
# The ollama/nvidia columns MIRROR the Claude tier (one model per opus/sonnet/haiku) — the
# same model is reused across same-tier agents, and DIVERSITY between parallel slots comes
# from the prompt LENS (identical across providers), exactly as Claude itself does. We do
# NOT pick different models per slot just for the sake of it.
#   opus   → ollama qwen3.6:27b        | nvidia moonshotai/kimi-k2.6
#   sonnet → ollama gemma4:12b         | nvidia qwen/qwen3-coder-480b-a35b-instruct
#   haiku  → ollama qwen2.5-coder:1.5b | nvidia openai/gpt-oss-20b
#
# EXCEPTION — 5 convergent-reasoning / risk agents override opus to a chain-of-thought
# reasoner (deepseek-r1:14b / deepseek-ai/deepseek-v4-pro), where hard step-by-step logic
# beats the generalist even with the lens: brainstorm-ideate-3 (risk-premortem),
# plan-review-3 (regression-risk), build-challenge-2 (security), debug-failure-diagnose,
# debug-failure-soak. This is a deliberate capability swap, not per-slot variety; the
# planned override config (#246) generalises it for consumers.
#   - ollama : must match your `ollama list` tags exactly. These defaults were sized for a
#              MacBook Air M5 with 32 GB unified memory — the set fits within that ceiling
#              (one ~27B model resident at a time + small workers). Scale up on bigger boxes.
#   - nvidia : VERIFIED live (build.nvidia.com, June 2026) via `bkit mode --list=nvidia`;
#              all support OpenAI function-calling (required — subagents are tool-heavy).
# Targets apply declaratively (the model: line is SET, not pattern-swapped) → idempotent,
# order-independent regardless of the current provider.
_bkit_agent_matrix() {
  cat <<'EOF'
bkit-design-brainstorm-ideate-1|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-design-brainstorm-ideate-2|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-design-brainstorm-ideate-3|claude-opus-4-8|deepseek-r1:14b|deepseek-ai/deepseek-v4-pro
bkit-design-review-1|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-design-review-2|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-design-update|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-design-organise|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-design-summary|claude-haiku-4-5-20251001|qwen2.5-coder:1.5b|openai/gpt-oss-20b
bkit-design-generate|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-complexity-check|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-plan-generate|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-review-1|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-review-2|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-review-3|claude-opus-4-8|deepseek-r1:14b|deepseek-ai/deepseek-v4-pro
bkit-plan-scope-check-1|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-scope-check-2|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-plan-complexity-split|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-plan-summary|claude-haiku-4-5-20251001|qwen2.5-coder:1.5b|openai/gpt-oss-20b
bkit-plan-update|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-build-install-skills|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-build-challenge-1|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-build-challenge-2|claude-opus-4-8|deepseek-r1:14b|deepseek-ai/deepseek-v4-pro
bkit-build-challenge-reconcile|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-build-challenge-tests|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-build-plan-execute|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-build-challenge-remediate|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-build-plan-gaps-remediate|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-build-summary|claude-haiku-4-5-20251001|qwen2.5-coder:1.5b|openai/gpt-oss-20b
bkit-build-plan-verify|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-debug-abort-handover|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-debug-failure-diagnose|claude-opus-4-8|deepseek-r1:14b|deepseek-ai/deepseek-v4-pro
bkit-debug-failure-remediate|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-debug-failure-soak|claude-opus-4-8|deepseek-r1:14b|deepseek-ai/deepseek-v4-pro
bkit-debug-summary|claude-haiku-4-5-20251001|qwen2.5-coder:1.5b|openai/gpt-oss-20b
bkit-ship-summary|claude-haiku-4-5-20251001|qwen2.5-coder:1.5b|openai/gpt-oss-20b
bkit-ship-update-docs|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-ship-conflict-resolve|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-ship-deferred-sweep|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-utility-audit-codebase|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-utility-audit-security|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-utility-audit-tests|claude-opus-4-8|qwen3.6:27b|moonshotai/kimi-k2.6
bkit-utility-compress-markdown|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-utility-audit-logs|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-utility-update-documentation|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-utility-update-references|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
bkit-utility-audit-logs-ship|claude-sonnet-4-6|gemma4:12b|qwen/qwen3-coder-480b-a35b-instruct
EOF
}

# ---------------------------------------------------------------------------
# Resolve the target model for one agent under a given provider — pure column
# pick from the matrix row. $1 = provider  $2 = claude  $3 = ollama  $4 = nvidia
# ---------------------------------------------------------------------------
_bkit_target_model() {
  case "$1" in
    claude) echo "$2" ;;
    ollama) echo "$3" ;;
    nvidia) echo "$4" ;;
    *)      echo "" ;;
  esac
}

# Declaratively SET every agent's `model:` header for $1 = provider.
_bkit_apply_headers() {
  local provider="$1" root="$2" applied=0 missing=0
  local file claudem ollamam nvidiam target target_esc
  while IFS='|' read -r file claudem ollamam nvidiam; do
    [ -z "$file" ] && continue
    local target_file="$root/.claude/agents/${file}.md"
    [ -f "$target_file" ] || { missing=$((missing + 1)); continue; }
    target="$(_bkit_target_model "$provider" "$claudem" "$ollamam" "$nvidiam")"
    if [ -z "$target" ]; then
      echo "   ! no $provider model mapped for $file — left unchanged" >&2
      continue
    fi
    # Escape sed replacement metachars (/ & |). We use | as delimiter.
    target_esc=$(printf '%s' "$target" | sed 's/[|&\\]/\\&/g')
    sed -i '' "s|^model: .*|model: ${target_esc}|" "$target_file"
    applied=$((applied + 1))
  done <<EOF
$(_bkit_agent_matrix)
EOF
  echo "   $applied agent headers set to $provider${missing:+, $missing missing skipped}"
}

# Comment ($1=off) / uncomment ($1=on) ANTHROPIC_API_KEY in .bkit/.env (direnv source).
_bkit_env_key() {
  local action="$1" env_file="$2"
  [ -f "$env_file" ] || return 0
  if [ "$action" = "off" ]; then
    sed -i '' "s|^ANTHROPIC_API_KEY=|# ANTHROPIC_API_KEY=|" "$env_file"
  else
    sed -i '' "s|^# *ANTHROPIC_API_KEY=|ANTHROPIC_API_KEY=|" "$env_file"
  fi
}

# Read a KEY="value" from .bkit/.env without sourcing the whole file.
_bkit_env_get() {
  local key="$1" env_file="$2"
  [ -f "$env_file" ] || return 0
  sed -n "s|^${key}=\"\{0,1\}\([^\"]*\)\"\{0,1\}.*|\1|p" "$env_file" | head -1
}

# ---------------------------------------------------------------------------
# claude-code-router lifecycle
# ---------------------------------------------------------------------------
_bkit_router_bin() { command -v ccr 2>/dev/null || command -v claude-code-router 2>/dev/null; }

_bkit_router_config() {
  # $1 provider, $2 backend_base_url, $3 api_key, $4 default_model
  local provider="$1" base="$2" key="$3" defmodel="$4"
  local cfg_dir="$HOME/.claude-code-router"
  mkdir -p "$cfg_dir"
  # Build the provider's model list from the agent matrix (unique targets).
  local models_json
  models_json=$(_bkit_agent_matrix | while IFS='|' read -r f cm om nv; do
      [ -z "$f" ] && continue; _bkit_target_model "$provider" "$cm" "$om" "$nv"
    done | sort -u | sed 's/.*/"&"/' | paste -sd, -)
  cat > "$cfg_dir/config.json" <<JSON
{
  "//": "Generated by bkit-mode.sh — do not hand-edit; re-run 'bkit mode … $provider'.",
  "LOG": false,
  "Providers": [
    {
      "name": "$provider",
      "api_base_url": "${base}/chat/completions",
      "api_key": "$key",
      "models": [ $models_json ]
    }
  ],
  "Router": { "default": "$provider,$defmodel" }
}
JSON
  echo "$cfg_dir/config.json"
}

_bkit_router_url() { echo "${BKIT_ROUTER_URL:-http://127.0.0.1:3456}"; }

_bkit_router_ensure() {
  local bin; bin="$(_bkit_router_bin)"
  if [ -z "$bin" ]; then
    echo "   ! claude-code-router not found. Install once:" >&2
    echo "       npm install -g @musistudio/claude-code-router" >&2
    echo "     then re-run. (Set BKIT_ROUTER_URL if you run it elsewhere.)" >&2
    return 1
  fi
  # ccr is idempotent: 'ccr start' no-ops if already running; 'ccr restart' reloads config.
  "$bin" restart >/dev/null 2>&1 || "$bin" start >/dev/null 2>&1 || true
  return 0
}

_bkit_router_stop() {
  local bin; bin="$(_bkit_router_bin)"
  [ -n "$bin" ] && "$bin" stop >/dev/null 2>&1 || true
}

# ---------------------------------------------------------------------------
# Preflight — verify the tools/creds a (mode, provider) needs are present.
# Prints ✓/✗ advisories. Returns non-zero if a HARD requirement is missing
# (route can't activate); soft gaps (direnv/jq) only warn.
# ---------------------------------------------------------------------------
_bkit_preflight() {
  local mode="$1" provider="$2"
  local root; root="$(git rev-parse --show-toplevel 2>/dev/null)" || root="$PWD"
  local env_file="$root/.bkit/.env" hard_fail=0

  _ok()   { echo "   ✓ $1"; }
  _warn() { echo "   ⚠ $1" >&2; }
  _bad()  { echo "   ✗ $1" >&2; hard_fail=1; }

  # Always needed.
  command -v git >/dev/null 2>&1 && _ok "git" || _bad "git not found (repo-root resolution)"
  command -v sed >/dev/null 2>&1 && _ok "sed" || _bad "sed not found (header rewrite)"
  command -v direnv >/dev/null 2>&1 && _ok "direnv" || _warn "direnv not found — run 'direnv allow' manually after switching"

  # Router-backed providers (everything except cloud/claude).
  if [ "$mode/$provider" != "cloud/claude" ]; then
    if [ -n "$(_bkit_router_bin)" ]; then _ok "claude-code-router ($(_bkit_router_bin))"
    else _bad "claude-code-router missing → npm install -g @musistudio/claude-code-router"; fi
    command -v node >/dev/null 2>&1 && _ok "node $(node -v 2>/dev/null)" || _bad "node not found (claude-code-router needs Node)"
    command -v curl >/dev/null 2>&1 && _ok "curl" || _warn "curl not found — 'bkit mode --list' won't work"
  fi

  case "$provider" in
    ollama)
      if command -v ollama >/dev/null 2>&1; then _ok "ollama CLI"
      else _warn "ollama CLI not found — install from https://ollama.com"; fi
      if curl -s -m 2 http://localhost:11434/api/tags >/dev/null 2>&1; then _ok "ollama server up (:11434)"
      else _bad "ollama server unreachable (:11434) → run 'ollama serve'"; fi
      ;;
    nvidia)
      local key; key="$(_bkit_env_get NVIDIA_API_KEY "$env_file")"
      if [ -n "$key" ]; then _ok "NVIDIA_API_KEY set"
      else _bad "NVIDIA_API_KEY empty in .bkit/.env → add nvapi-… (build.nvidia.com)"; fi
      ;;
  esac
  return $hard_fail
}

# `bkit mode --doctor` — preflight every provider at a glance.
_bkit_mode_doctor() {
  local row mp mode provider
  while IFS= read -r row; do
    mp="$(echo "$row" | cut -d'|' -f1)"; [ -z "$mp" ] && continue
    mode="${mp%/*}"; provider="${mp#*/}"
    echo "── $mode/$provider ──"
    _bkit_preflight "$mode" "$provider" && echo "   → ready" || echo "   → NOT ready (fix ✗ above)"
  done <<EOF
$(_bkit_registry)
EOF
}

# ===========================================================================
# Core: apply a (mode, provider) selection in the CURRENT shell
# ===========================================================================
_bkit_mode_apply() {
  local mode="$1" provider="$2"
  local root; root="$(git rev-parse --show-toplevel 2>/dev/null)" || root="$PWD"
  local env_file="$root/.bkit/.env"

  # Look up the registry row.
  local row; row="$(_bkit_registry | grep "^${mode}/${provider}|" | head -1)"
  if [ -z "$row" ]; then
    echo "Unknown mode/provider: '$mode $provider'. Valid:" >&2
    _bkit_registry | sed 's#|.*##; s#\(.*\)/\(.*\)#   bkit mode --\1=\2#' >&2
    return 1
  fi
  local base keyvar uses_router
  base="$(echo "$row" | cut -d'|' -f2)"
  keyvar="$(echo "$row" | cut -d'|' -f3)"
  uses_router="$(echo "$row" | cut -d'|' -f4)"

  echo "bkit-mode → $mode/$provider"
  echo "  preflight:"
  _bkit_preflight "$mode" "$provider" || echo "   (hard requirement missing — headers still applied, route may not activate)"
  _bkit_apply_headers "$provider" "$root"

  if [ "$uses_router" = "0" ]; then
    # Direct Anthropic cloud — no router, restore the real key.
    _bkit_router_stop
    unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN
    _bkit_env_key on "$env_file"
    export ANTHROPIC_API_KEY="$(_bkit_env_get ANTHROPIC_API_KEY "$env_file")"
    echo "   route: Anthropic API (direct). ANTHROPIC_API_KEY restored in .bkit/.env."
  else
    # OpenAI-format backend behind claude-code-router.
    local key; key="$(_bkit_env_get "$keyvar" "$env_file")"
    [ -z "$key" ] && key="dummy"
    if [ "$provider" = "nvidia" ] && [ "$key" = "dummy" ]; then
      echo "   ! NVIDIA_API_KEY not set in .bkit/.env — add NVIDIA_API_KEY=\"nvapi-…\"." >&2
    fi
    # Pick a sane router default = the model the highest-tier agent uses.
    local defmodel; defmodel="$(_bkit_target_model "$provider" claude-opus-4-8 qwen3.6:27b)"
    local cfg; cfg="$(_bkit_router_config "$provider" "$base" "$key" "$defmodel")"
    echo "   router config: $cfg"
    if _bkit_router_ensure; then
      export ANTHROPIC_BASE_URL="$(_bkit_router_url)"
      export ANTHROPIC_AUTH_TOKEN="bkit-router"
      unset ANTHROPIC_API_KEY
      _bkit_env_key off "$env_file"
      echo "   route: $provider via claude-code-router ($(_bkit_router_url)). ANTHROPIC_API_KEY disabled."
    else
      echo "   route NOT activated — install claude-code-router then re-run." >&2
    fi
  fi

  # Re-bless direnv so future shells inherit the .bkit/.env change.
  if command -v direnv >/dev/null 2>&1; then
    ( cd "$root" && direnv allow ) >/dev/null 2>&1 && echo "   direnv allow ✓"
  fi
  # No state file: the active provider is fully derivable from the agent headers
  # (the files themselves), which `--status` reads — see _bkit_detect_provider.
}

# Infer the active provider by matching a sample agent's header against its matrix
# row — the headers ARE the state, so no .mode/package.json persistence is needed.
_bkit_detect_provider() {
  local root="$1" agent="bkit-design-brainstorm-ideate-1"
  local sample="$root/.claude/agents/${agent}.md"
  [ -f "$sample" ] || { echo "unknown"; return; }
  local m; m="$(grep '^model:' "$sample" | sed 's/model: //')"
  local f c o n
  IFS='|' read -r f c o n <<EOF
$(_bkit_agent_matrix | grep "^${agent}|")
EOF
  case "$m" in
    "$c") echo "cloud/claude" ;;
    "$o") echo "local/ollama" ;;
    "$n") echo "cloud/nvidia" ;;
    *)    echo "custom ($m)" ;;
  esac
}

_bkit_mode_status() {
  local root; root="$(git rev-parse --show-toplevel 2>/dev/null)" || root="$PWD"
  if [ -n "${ANTHROPIC_BASE_URL:-}" ]; then
    echo "bkit-mode: ROUTED → ${ANTHROPIC_BASE_URL}"
  else
    echo "bkit-mode: DIRECT → Anthropic API"
  fi
  echo "   agents pinned to: $(_bkit_detect_provider "$root")"
  local sample="$root/.claude/agents/bkit-design-brainstorm-ideate-1.md"
  [ -f "$sample" ] && echo "   sample header: $(grep '^model:' "$sample")"
  local bin; bin="$(_bkit_router_bin)"
  [ -n "$bin" ] && echo "   router: $("$bin" status 2>/dev/null | head -1)" || echo "   router: claude-code-router not installed"
}

# Query the backend's live model list (so you never hand-guess model ids).
_bkit_mode_list() {
  local provider="$1"
  local root; root="$(git rev-parse --show-toplevel 2>/dev/null)" || root="$PWD"
  local env_file="$root/.bkit/.env"
  local row; row="$(_bkit_registry | grep "/${provider}|" | head -1)"
  [ -z "$row" ] && { echo "Unknown provider: $provider" >&2; return 1; }
  local base keyvar
  base="$(echo "$row" | cut -d'|' -f2)"; keyvar="$(echo "$row" | cut -d'|' -f3)"
  local key; key="$(_bkit_env_get "$keyvar" "$env_file")"
  echo "GET ${base}/models  (provider: $provider)"
  curl -s "${base}/models" -H "Authorization: Bearer ${key}" \
    | { command -v jq >/dev/null 2>&1 && jq -r '.data[].id' || cat; }
}

# ===========================================================================
# The `bkit` shim — handle mode/auto in-shell, forward all else to the binary
# ===========================================================================
bkit() {
  if [ "$1" = "mode" ]; then
    shift
    # Flag grammar, matching `bkit install --auto=… --tracker=…`:
    #   bkit mode --cloud=claude|nvidia | --local=ollama | --reset | --status | --list=<p>
    case "$1" in
      --status|"")     _bkit_mode_status ;;
      --doctor)        _bkit_mode_doctor ;;
      --reset)         _bkit_mode_apply cloud claude ;;   # full return to default Anthropic cloud
      --cloud=*)       _bkit_mode_apply cloud "${1#--cloud=}" ;;
      --local=*)       _bkit_mode_apply local "${1#--local=}" ;;
      --list=*)        _bkit_mode_list "${1#--list=}" ;;
      *)               echo "usage: bkit mode --cloud=claude|nvidia | --local=ollama | --reset | --status | --doctor | --list=<provider>" >&2; return 1 ;;
    esac
    return $?
  fi
  # All other verbs (install/uninstall/check/doctor/upgrade) go to the real binary.
  # The cloud-agent lane is a normal install flag: `bkit install --auto=claude`.
  command bkit "$@"
}

# Refuse direct execution — it can't mutate your shell, and the shim wouldn't persist.
if [ -n "${BASH_SOURCE:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  echo "bkit-mode.sh must be SOURCED to install the 'bkit' shim:" >&2
  echo "  source ${0}" >&2
  exit 1
fi
