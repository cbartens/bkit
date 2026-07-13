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
if command -v gh >/dev/null 2>&1 && [ -n "${GH_BKIT_TOKEN:-}" ] && ! gh auth status >/dev/null 2>&1; then
  log "gh auth login --with-token"
  printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token || log "gh auth login failed (non-blocking)"
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
