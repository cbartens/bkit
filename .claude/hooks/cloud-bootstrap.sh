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
  if [ -n "${GH_BKIT_TOKEN:-}" ]; then
    pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN" || log "pnpm config set failed (non-blocking)"
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
