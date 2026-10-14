#!/usr/bin/env sh
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt the env file path to your machine setup.
#
# Syncs the BKIT_* keys of an env file into launchd with `launchctl setenv`, so GUI
# apps launched from the Dock or Spotlight — which never run the login shell or
# direnv — see the BKIT_* tokens. Logs key names only, never values.
#
# - Only BKIT_* keys are loaded; other keys are skipped.
# - An empty value (KEY="") unsets the key.
# - Loaded key names are recorded in a state file next to the env file
#   (.launchd-loaded-keys, mode 600). A recorded key that is gone from the env file
#   is unset on the next run, so removing a key revokes it.
# - A failing key is logged and does not stop the others; the exit status is 1 if any failed.
#
# `launchctl setenv` exposes every loaded value to every app started in this login
# session, not only the apps that need it.
set -u

LOG_FILE="${BKIT_LAUNCHD_LOG:-$HOME/Library/Logs/bkit-launchd.log}"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
exec >> "$LOG_FILE" 2>&1

ENV_FILE="${1:-${BKIT_LAUNCHD_ENV:-$HOME/.config/bkit/launchd.env}}"
STATE_FILE="${BKIT_LAUNCHD_STATE:-$(dirname "$ENV_FILE")/.launchd-loaded-keys}"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') [bkit-launchd] $*"
}

if [ ! -f "$ENV_FILE" ]; then
  log "env file not found at $ENV_FILE — skipping"
  exit 0
fi

if ! command -v launchctl >/dev/null 2>&1; then
  log "launchctl not found — skipping"
  exit 0
fi

failed=0
wanted=" "  # keys set from the env file this run, space-delimited
retry=""    # keys whose unsetenv failed, kept in the state file for the next run

unset_key() {
  if launchctl unsetenv "$1"; then
    log "unsetenv $1 ($2)"
  else
    log "unsetenv $1 FAILED"
    retry="$retry $1"
    failed=1
  fi
}

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
    BKIT_*) ;;
    *)
      log "skip $key (not a BKIT_ key)"
      continue
      ;;
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
  if [ -z "$val" ]; then
    unset_key "$key" "empty value"
    continue
  fi
  if launchctl setenv "$key" "$val"; then
    log "setenv $key"
  else
    log "setenv $key FAILED"
    failed=1
  fi
  wanted="$wanted$key "
done < "$ENV_FILE"

if [ -f "$STATE_FILE" ]; then
  while IFS= read -r prior || [ -n "$prior" ]; do
    case "$prior" in
      "" | *[!A-Za-z0-9_]*) continue ;;
      BKIT_*) ;;
      *) continue ;;
    esac
    case "$wanted" in
      *" $prior "*) ;;
      *) unset_key "$prior" "removed from env file" ;;
    esac
  done < "$STATE_FILE"
fi

(
  umask 077
  for k in $wanted $retry; do
    printf '%s\n' "$k"
  done > "$STATE_FILE"
) || {
  log "could not write $STATE_FILE"
  failed=1
}
chmod 600 "$STATE_FILE" 2>/dev/null || true

[ "$failed" -eq 0 ] || exit 1
