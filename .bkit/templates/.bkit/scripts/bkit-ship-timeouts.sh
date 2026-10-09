#!/usr/bin/env sh
# bkit-ship-timeouts.sh — bkit-owned defaults for ship timeouts, poll intervals,
# and merge-attempt ceilings. Single source of truth for ship-* shell scripts
# (bkit-ship-gate.sh and the fenced routing blocks in bkit-ship.md).
#
# Source this file wherever ship constants are needed:
#   . "$(dirname "$0")/bkit-ship-timeouts.sh"
#   OR
#   . "$REPO_ROOT/.bkit/scripts/bkit-ship-timeouts.sh"
#
# Units are encoded in the identifier (per bkit-counter-bus-config.sh precedent):
#   *_S  — seconds
#   *_MS — milliseconds
# Bare integers without a unit suffix are disallowed for new additions.
#
# Consumer-tunable keys (bkit.capstoneJob, bkit.ciWorkflow) live in package.json;
# only bkit-owned defaults live here (Tier 1 — force-overwritten on `bkit upgrade`).
# bkit:start — managed block; update here then regenerate mirrors.

# Maximum wall-clock seconds to wait for a CI run to appear + complete after a
# head move (Path B re-validation). Caller's outer workflow timeout still applies.
SHIP_CI_WAIT_TIMEOUT_S=1800

# Polling interval (seconds) between CI status checks during SHIP_CI_WAIT_TIMEOUT_S.
SHIP_POLL_INTERVAL_S=30

# Re-validate's presence probe: seconds between checks for a run at
# VALIDATED_HEAD before dispatching one, and how many checks. 6 x 10s keeps the
# 60s budget a push-triggered `pull_request` run needs to surface, so the probe
# does not dispatch a duplicate of a run that is merely slow to register.
SHIP_PROBE_INTERVAL_S=10
SHIP_PROBE_ATTEMPTS=6

# A `.dev.lock` older than this (seconds) is considered stale and may be reclaimed.
SHIP_DEV_LOCK_STALE_S=900

# Maximum seconds to spend contending for `.dev.lock` before giving up.
SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S=600

# NOTE: MAX_MERGE_ATTEMPT is NOT defined here. It lives in
# bkit-counter-bus-config.sh, which the merge-attempt routing already sources.
# A second copy here would be a silent last-sourced-wins hazard: bkit-ship.md
# Step 6 sources this file first and bkit-counter-bus-config.sh later, so the
# two could drift and only the later value would take effect.

# bkit:end
