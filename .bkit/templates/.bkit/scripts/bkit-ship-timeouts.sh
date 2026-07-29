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

# A `.dev.lock` older than this (seconds) is considered stale and may be reclaimed.
SHIP_DEV_LOCK_STALE_S=900

# Maximum seconds to spend contending for `.dev.lock` before giving up.
SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S=600

# Maximum merge attempts before the Failure Path. Mirrors MAX_MERGE_ATTEMPT in
# bkit-counter-bus-config.sh; sourced by the merge-attempt counter-bus routing.
MAX_MERGE_ATTEMPT=3

# bkit:end
