#!/usr/bin/env bash
# cloud-bootstrap.sh — Claude Code SessionStart hook
#
# Project install for cloud sessions: runs `pnpm install` and `vale sync` so a
# fresh Claude Code on the web session has dependencies + vale styles ready.
#
# Cloud-only: no-op when CLAUDE_CODE_REMOTE != "true". Local sessions rely on
# pre-commit / lefthook for the same checks.
#
# Companion to the cloud environment setup script — see bkit's `cloud.md` for
# what installs vale/gh binaries (those live in the cloud env, not the repo).
#
# IMPORTANT — SessionStart hooks cannot block the session: non-zero exits are
# informational only (docs.claude.com/docs/en/hooks.md). Failures are surfaced
# via stderr.
#
# bkit owns the install logic between the `# <!-- bkit:start -->` and
# `# <!-- bkit:end -->` markers below. Add your own repo-specific install
# steps OUTSIDE that block — see examples at the bottom of this file.

set -euo pipefail

# Consume hook payload so the writer doesn't block.
cat >/dev/null

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

log() { printf '[cloud-bootstrap] %s\n' "$*" >&2; }

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$REPO_ROOT"

# <!-- bkit:start -->
# --- bkit baseline install (managed; do not edit) --------------------------

# Workspace-trust check + drift alarm.
#
# permissions.allow rows in .claude/settings.json GRANT capability, so Claude Code
# applies them only once the workspace trust dialog has been accepted -- and it never
# shows that dialog in a cloud session. Unset, every allow row is ignored and the only
# notice is a stderr line no cloud session surfaces. deny/ask are unaffected.
#
# The setup script (cloud.md section 4) records it at snapshot time, keyed on the repo
# path it baked in. That path is an OBSERVATION of the current image, not a contract,
# so re-check the DISCOVERED root here. Trust is keyed on the git repository root,
# which is what Claude Code itself keys on.
#
# This cannot change the CURRENT session -- settings resolve before SessionStart -- so
# its job is to make a silent no-op loud and tell the operator how to fix the snapshot.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && command -v jq >/dev/null 2>&1; then
  TRUST_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || printf '%s' "$REPO_ROOT")
  TRUST_FILE="${CLAUDE_CONFIG_DIR:-${HOME:-}}/.claude.json"
  TRUSTED=$(jq -r --arg p "$TRUST_ROOT" '.projects[$p].hasTrustDialogAccepted // false' "$TRUST_FILE" 2>/dev/null || printf 'false')
  if [ "$TRUSTED" != "true" ]; then
    log "WORKSPACE NOT TRUSTED at $TRUST_ROOT -- Claude Code is ignoring EVERY permissions.allow row in .claude/settings.json for this session (deny/ask still apply, so destructive-op gating is unaffected). This container clones to a different path than the setup script baked in. Fix: re-paste the setup script from .claude/cloud.md section 4, which re-stamps the cache-bust line and rebuilds the snapshot."
  fi
fi

if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
  # Belt-and-braces: write the GH Packages auth token into pnpm's user-level
  # config before install (supplements the project .npmrc auth token line).
  if [ -n "${BKIT_GH_TOKEN_INSTALL:-}" ]; then
    pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL" || log "pnpm config set failed (non-blocking)"
  fi
  log "pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile --prefer-offline || log "pnpm install failed (non-blocking)"
fi

if [ -f .vale.ini ] && command -v vale >/dev/null 2>&1; then
  if [ ! -d .vale/styles/write-good ]; then
    log "vale sync"
    vale sync || log "vale sync failed (non-blocking)"
  fi
fi

# Authenticate the gh CLI for the PR / branch / git-push surface (session-scoped).
# On GitHub Actions runners gh is already authed via GITHUB_TOKEN (env wins over
# stored creds), so the `gh auth status` guard no-ops there; it fires only where gh
# isn't yet authed — e.g. Claude Code on the web. BKIT_GH_TOKEN comes from the
# dashboard env vars (see cloud.md § Environment variables).
#
# gh hardening (#341 C2): prefer the SANCTIONED `GH_TOKEN`/`GITHUB_TOKEN` env
# var over `gh auth login --with-token`. gh reads GH_TOKEN -> GITHUB_TOKEN
# with TOP precedence over any stored `gh auth login` credential (gh manual;
# cli/cli#2922) — a placeholder/stray GH_TOKEN the platform happens to set
# silently overrides a successful --with-token login.
#
# Branch on the PROBE, not on mere presence. An earlier revision skipped the
# login whenever GH_TOKEN/GITHUB_TOKEN was merely SET, which meant that in the
# exact failure #341 §2 documents — the platform sets a PLACEHOLDER GH_TOKEN —
# the hook declined the only repair it had and said nothing specific about why.
# "Prefer the sanctioned lane" means prefer it WHEN IT WORKS; when it is present
# and broken, say so precisely.
#
# Single shared token — BKIT_GH_TOKEN is the one secret both this hook (gh) and
# the GitHub MCP server (.mcp.json's Authorization header) read; no second
# secret is introduced.
if ! command -v gh >/dev/null 2>&1; then
  log "gh-preflight: gh is not on PATH — the GitHub MCP server is the only GitHub lane this session"
elif gh auth status >/dev/null 2>&1; then
  log "gh-preflight: gh already authenticates (sanctioned env token or stored credential) — leaving that lane alone"
elif [ -n "${GH_TOKEN:-}" ] || [ -n "${GITHUB_TOKEN:-}" ]; then
  # Present but NOT authenticating: a placeholder or expired token. It outranks
  # any stored credential, so `--with-token` cannot win — the login would report
  # success and gh would keep using the broken env value. This hook cannot repair
  # it either: a SessionStart hook's own `export` does not reach the agent's later
  # Bash processes, and Claude Code documents no supported way to rewrite a cloud
  # environment variable from inside a session (env vars are set in the dashboard;
  # see cloud.md). So name the fault and the fix precisely and let the
  # workflow-level Step-1 preflight fail the run closed onto the MCP lane.
  log "gh-preflight: WARNING — GH_TOKEN/GITHUB_TOKEN is set but does NOT authenticate (placeholder or expired). It takes precedence over any stored 'gh auth login' credential, so gh cannot be repaired from this hook. Fix it where it is defined — the cloud environment's Environment variables — by setting a valid token or removing the variable so BKIT_GH_TOKEN can be used instead. Until then gh stays down and workflows fall back to the GitHub MCP lane. See issue #341 §2/§6a."
elif [ -n "${BKIT_GH_TOKEN:-}" ]; then
  log "gh auth login --with-token"
  printf '%s' "$BKIT_GH_TOKEN" | gh auth login --with-token || log "gh auth login failed (non-blocking)"
fi

# gh-preflight (#341 C2): loud, NEVER-silent RUNTIME_GITHUBCLI record. SessionStart hooks
# cannot hard-stop the session (see header note) — this line is a loud,
# NON-BLOCKING signal only. The ENFORCING dual-lane abort lives in each
# workflow's Step-1 preflight (the shim reading RUNTIME_GITHUBCLI — see
# bkit-runtime.sh's bkit_runtime_detect / bkit_runtime_assert_resolved), NOT
# here.
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  RUNTIME_GITHUBCLI=true
else
  RUNTIME_GITHUBCLI=false
fi
log "gh-preflight: RUNTIME_GITHUBCLI=${RUNTIME_GITHUBCLI}"

# Dual-lane signal: gh and the GitHub MCP server are BOTH keyed off the same
# BKIT_GH_TOKEN (this hook + .mcp.json's Authorization header) — if none of
# BKIT_GH_TOKEN/GH_TOKEN/GITHUB_TOKEN are set, neither lane can authenticate.
# Loud, non-blocking (see above); the workflow-level Step-1 preflight is what
# actually fails the run closed.
if [ "$RUNTIME_GITHUBCLI" = "false" ] && [ -z "${BKIT_GH_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  log "DUAL-LANE WARNING: neither gh nor the GitHub MCP server can authenticate — BKIT_GH_TOKEN/GH_TOKEN/GITHUB_TOKEN are all unset. Both lanes read the same credential; the workflow's Step-1 preflight will fail closed. Non-blocking signal only (SessionStart hooks cannot abort the session) — see issue #341 §2/§6a."
fi

# Provision context-fetch CLIs the consumer declared in .agents/context.md. Stack-agnostic:
# bkit runs whatever `context-fetch:provision` recipe each block carries (self-guarded with
# `command -v <cli> || <install>`), so no stack name is baked into bkit. Runs every session
# (a no-op once the CLI is present); the web setup script bakes the same recipes into its
# snapshot, so this is the gh-runner + resumed-session path. See .agents/context.md.
if [ -f .agents/context.md ]; then
  PROVISION=$(awk '
    /^<!-- bkit:end -->$/ { consumer=1; next }
    !consumer { next }
    /^<!-- context-fetch:provision/ { inprov=1; next }
    /^<!-- context-fetch:(start|end|none)/ { inprov=0; infence=0; next }
    inprov && /^```/ { infence=!infence; next }
    inprov && infence { print }
  ' .agents/context.md)
  if [ -n "$PROVISION" ]; then
    log "provisioning context-fetch CLIs from .agents/context.md"
    # pnpm refuses `add -g` unless its global-bin dir is on PATH (corepack pnpm skips
    # `pnpm setup`); export it so `pnpm add -g` provision recipes don't self-skip. Mirrors
    # the web setup script's provision region (bkit-cloud-env.ts).
    export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
    export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
    printf '%s\n' "$PROVISION" | bash || log "context-fetch CLI provisioning failed (non-blocking)"
  fi
fi
# <!-- bkit:end -->

# --- Consumer extensions ---------------------------------------------------
# Add per-repo install steps here. Examples:
#
# Docker daemon — PREREQUISITE for any containerised local stack below. Cloud
# sessions ship the docker CLI but no init system, so nothing starts the daemon
# for you, and image pulls go through the egress proxy: declare the registry
# hosts in .agents/context.md § Allowed domains or every pull 403s. Needs
# root / a privileged container; on a plain host this self-skips.
# if command -v dockerd >/dev/null 2>&1 && ! docker info >/dev/null 2>&1; then
#   log "starting dockerd"
#   nohup dockerd >/tmp/dockerd.log 2>&1 &
#   for _ in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 1; done
#   docker info >/dev/null 2>&1 || log "dockerd did not come up (non-blocking) — see /tmp/dockerd.log"
# fi
#
# Local backend stack (Supabase / Postgres / Redis / etc.):
# Gate on the DAEMON, not just the CLI. `command -v supabase` starts passing the
# moment a context-fetch:provision recipe puts the CLI on PATH (.agents/context.md
# § CLI provisioning) — the container runtime it needs is still absent, so
# `supabase start` dies, the `|| log` swallows it into one stderr line, and the
# session carries on with no database. Skip loudly instead.
# if [ -f supabase/config.toml ] && command -v supabase >/dev/null 2>&1; then
#   if docker info >/dev/null 2>&1; then
#     log "supabase start"
#     supabase start || log "supabase start failed (non-blocking)"
#   else
#     log "supabase start SKIPPED — no docker daemon (see prerequisite above)"
#   fi
# fi
#
# Turbo prebuild for monorepo packages:
# if [ -f turbo.json ] && command -v pnpm >/dev/null 2>&1; then
#   log "turbo run build --filter='./packages/*'"
#   pnpm turbo run build --filter='./packages/*' || log "turbo prebuild failed (non-blocking)"
# fi

exit 0
