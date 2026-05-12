#!/usr/bin/env bash
# cloud-bootstrap.sh — Claude Code SessionStart hook
#
# Project install for cloud sessions: runs `pnpm install` and `vale sync` so a
# fresh Claude Code on the web session has dependencies + vale styles ready.
#
# Cloud-only: no-op when CLAUDE_CODE_REMOTE != "true". Local sessions rely on
# pre-commit / lefthook for the same checks.
#
# Companion to the cloud environment setup script — see `.agents/cloud.md` for
# what installs vale/gh binaries (those live in the cloud env, not the repo).
#
# IMPORTANT — SessionStart hooks cannot block the session: non-zero exits are
# informational only (docs.claude.com/docs/en/hooks.md). Failures are surfaced
# via stderr.

set -euo pipefail

# Consume hook payload so the writer doesn't block.
cat >/dev/null

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

log() { printf '[cloud-bootstrap] %s\n' "$*" >&2; }

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$REPO_ROOT"

if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
  log "pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile --prefer-offline || log "pnpm install failed (non-blocking)"
fi

if [ -f .vale.ini ] && command -v vale >/dev/null 2>&1; then
  if [ ! -d .vale/styles/write-good ]; then
    log "vale sync"
    vale sync || log "vale sync failed (non-blocking)"
  fi
fi

exit 0
