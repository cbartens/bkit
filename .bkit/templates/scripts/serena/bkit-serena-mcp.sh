#!/usr/bin/env bash
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.
# Locates the serena binary without relying on an inherited PATH.
#
# .mcp.json invokes this instead of a bare `serena` because macOS apps
# launched from the Dock/Finder run under launchd, which does not inherit
# login-shell PATH — `~/.local/bin` (local's uv-tool-install target) is
# invisible there (docs/setup.md § Symbol Lookup (Serena);
# .bkit/providers.md § macOS GUI-isolation covers the same root cause for
# Cursor/opencode). Checked in the order each environment actually
# installs it: local (uv tool install default) first, then cloud
# (.agents/config.md's `debug-fetch:provision serena` — root-run setup
# script, world-readable override), then PATH as a last resort for any
# other install location.
set -euo pipefail

for candidate in "$HOME/.local/bin/serena" /usr/local/bin/serena; do
  if [ -x "$candidate" ]; then
    exec "$candidate" "$@"
  fi
done

if command -v serena >/dev/null 2>&1; then
  exec serena "$@"
fi

echo "bkit-serena-mcp.sh: serena not found in \$HOME/.local/bin, /usr/local/bin, or PATH" >&2
exit 127
