#!/usr/bin/env sh
# bkit-counter-bus-config.sh — Single source of truth for all MAX_* workflow thresholds.
#
# Source this file wherever MAX_* constants are needed:
#   . "$(dirname "$0")/bkit-counter-bus-config.sh"
#   OR
#   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
#
# bkit:start — managed block; update here then regenerate mirrors.

# bkit-build.md counters
MAX_VERIFY_ATTEMPT=3
MAX_TEST_ATTEMPT=3
MAX_CHALLENGE_REMEDIATE_ATTEMPT=1

# bkit-debug.md counters (mode-matched pairs — DE-25, DE-36)
MAX_DEBUG_ATTEMPT=3
MAX_NORMAL_ATTEMPT=3
MAX_SOAK_ATTEMPT=3

# bkit-ship.md counters
MAX_MERGE_ATTEMPT=3

# bkit:end
