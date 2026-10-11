#!/usr/bin/env sh
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt the env file path to your machine setup.
#
# Hands each KEY=VALUE in an env file to launchd via `launchctl setenv`, so GUI
# apps launched from the Dock or Spotlight — which never run the login shell or
# direnv — see the BKIT_* tokens. Logs key names only, never values.
set -eu

LOG_FILE="${BKIT_LAUNCHD_LOG:-$HOME/Library/Logs/bkit-launchd.log}"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
exec >> "$LOG_FILE" 2>&1

ENV_FILE="${1:-${BKIT_LAUNCHD_ENV:-$HOME/.config/bkit/launchd.env}}"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [bkit-launchd] env file not found at $ENV_FILE — skipping"
  exit 0
fi

if ! command -v launchctl >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [bkit-launchd] launchctl not found — skipping"
  exit 0
fi

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    "" | "#"*) continue ;;
  esac
  line="${line#export }"
  case "$line" in
    *=*) ;;
    *) continue ;;
  esac
  key="${line%%=*}"
  val="${line#*=}"
  case "$key" in
    "" | *[!A-Za-z0-9_]*) continue ;;
  esac
  case "$val" in
    \"*\")
      val="${val#\"}"
      val="${val%\"}"
      ;;
    \'*\')
      val="${val#\'}"
      val="${val%\'}"
      ;;
  esac
  launchctl setenv "$key" "$val"
  echo "$(date '+%Y-%m-%d %H:%M:%S') [bkit-launchd] setenv $key"
done < "$ENV_FILE"
