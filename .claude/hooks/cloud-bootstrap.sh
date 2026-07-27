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

if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
  # Belt-and-braces: write the GH Packages auth token into pnpm's user-level
  # config before install (supplements the project .npmrc auth token line).
  if [ -n "${GH_BKIT_TOKEN_INSTALL:-}" ]; then
    pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL" || log "pnpm config set failed (non-blocking)"
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
# isn't yet authed — e.g. Claude Code on the web. GH_BKIT_TOKEN comes from the
# dashboard env vars (see cloud.md § Environment variables).
#
# gh hardening (#341 C2): prefer the SANCTIONED `GH_TOKEN`/`GITHUB_TOKEN` env
# var over `gh auth login --with-token`. gh reads GH_TOKEN -> GITHUB_TOKEN
# with TOP precedence over any stored `gh auth login` credential (gh manual;
# cli/cli#2922) — a placeholder/stray GH_TOKEN the platform happens to set
# silently overrides a successful --with-token login. So: if GH_TOKEN or
# GITHUB_TOKEN is already present, trust that lane and do NOT fight it with
# --with-token; only fall back to logging in from GH_BKIT_TOKEN when neither
# sanctioned env var is set. Single shared token — GH_BKIT_TOKEN is the one
# secret both this hook (gh) and the GitHub MCP server (.mcp.json's
# Authorization header) read; no second secret is introduced.
if [ -n "${GH_TOKEN:-}" ] || [ -n "${GITHUB_TOKEN:-}" ]; then
  log "gh-preflight: sanctioned GH_TOKEN/GITHUB_TOKEN env present — trusting it over --with-token"
elif command -v gh >/dev/null 2>&1 && [ -n "${GH_BKIT_TOKEN:-}" ] && ! gh auth status >/dev/null 2>&1; then
  log "gh auth login --with-token"
  printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token || log "gh auth login failed (non-blocking)"
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
# GH_BKIT_TOKEN (this hook + .mcp.json's Authorization header) — if none of
# GH_BKIT_TOKEN/GH_TOKEN/GITHUB_TOKEN are set, neither lane can authenticate.
# Loud, non-blocking (see above); the workflow-level Step-1 preflight is what
# actually fails the run closed.
if [ "$RUNTIME_GITHUBCLI" = "false" ] && [ -z "${GH_BKIT_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  log "DUAL-LANE WARNING: neither gh nor the GitHub MCP server can authenticate — GH_BKIT_TOKEN/GH_TOKEN/GITHUB_TOKEN are all unset. Both lanes read the same credential; the workflow's Step-1 preflight will fail closed. Non-blocking signal only (SessionStart hooks cannot abort the session) — see issue #341 §2/§6a."
fi

# Provision debug-fetch CLIs the consumer declared in .agents/config.md. Stack-agnostic:
# bkit runs whatever `debug-fetch:provision` recipe each block carries (self-guarded with
# `command -v <cli> || <install>`), so no stack name is baked into bkit. Runs every session
# (a no-op once the CLI is present); the web setup script bakes the same recipes into its
# snapshot, so this is the gh-runner + resumed-session path. See .agents/config.md.
if [ -f .agents/config.md ]; then
  PROVISION=$(awk '
    /^<!-- bkit:end -->$/ { consumer=1; next }
    !consumer { next }
    /^<!-- debug-fetch:provision/ { inprov=1; next }
    /^<!-- debug-fetch:(start|end|none)/ { inprov=0; infence=0; next }
    inprov && /^```/ { infence=!infence; next }
    inprov && infence { print }
  ' .agents/config.md)
  if [ -n "$PROVISION" ]; then
    log "provisioning debug-fetch CLIs from .agents/config.md"
    # pnpm refuses `add -g` unless its global-bin dir is on PATH (corepack pnpm skips
    # `pnpm setup`); export it so `pnpm add -g` provision recipes don't self-skip. Mirrors
    # the web setup script's provision region (bkit-cloud-env.ts).
    export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
    export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
    printf '%s\n' "$PROVISION" | bash || log "debug-fetch CLI provisioning failed (non-blocking)"
  fi
fi

# <!-- bkit:end -->

# --- Consumer extensions ---------------------------------------------------
# Add per-repo install steps here. Examples:
#
# Local backend stack (Supabase / Postgres / Redis / etc.):
# if [ -f supabase/config.toml ] && command -v supabase >/dev/null 2>&1; then
#   log "supabase start"
#   supabase start || log "supabase start failed (non-blocking)"
# fi
#
# Turbo prebuild for monorepo packages:
# if [ -f turbo.json ] && command -v pnpm >/dev/null 2>&1; then
#   log "turbo run build --filter='./packages/*'"
#   pnpm turbo run build --filter='./packages/*' || log "turbo prebuild failed (non-blocking)"
# fi

exit 0
