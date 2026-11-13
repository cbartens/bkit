#!/bin/sh
# Claim C4: a `git merge --ff-only NEW` advance in the main checkout fires consumer hooks by
# default, and the engine's withoutHooks override (one more GIT_CONFIG_* entry setting
# core.hooksPath=/dev/null, land.ts:104) stops every hook from running.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c4.XXXXXX")
run() { # $1 = label, rest = env prefix
  label=$1; shift
  R="$T/$label"; git init -q -b dev "$R" && cd "$R"
  git config user.email p@x && git config user.name p
  for h in post-merge post-checkout reference-transaction post-rewrite; do
    printf '#!/bin/sh\necho "HOOK FIRED: %s $*" >> "%s/fired.log"\n' "$h" "$R" > ".git/hooks/$h"
    chmod +x ".git/hooks/$h"
  done
  echo base > f && git add f && git commit -qm base && DEV_AT=$(git rev-parse HEAD)
  git worktree add -q --detach "$R-land" "$DEV_AT" 2>/dev/null
  (cd "$R-land" && echo new > g && git add g && git -c user.email=p@x -c user.name=p commit -qm landing)
  NEW=$(git -C "$R-land" rev-parse HEAD)
  : > "$R/fired.log"
  env "$@" git merge --ff-only "$NEW" > /dev/null 2>&1; echo "[$label] merge --ff-only exit=$?"
  echo "[$label] hooks fired during the advance:"; sed 's/^/  /' "$R/fired.log"; [ -s "$R/fired.log" ] || echo "  (none)"
}
run default GIT_PROBE=1
run withoutHooks GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null
rm -rf "$T"
