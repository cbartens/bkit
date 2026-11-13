#!/bin/sh
# Claim C5: if the owner commits on dev after advanceLocalDev asserted HEAD = DEV_AT and
# before `git merge --ff-only NEW` runs, git refuses the merge and dev keeps the hand commit,
# so an untested combination cannot land.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c5.XXXXXX")
git init -q -b dev "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
echo base > f && git add f && git commit -qm base && DEV_AT=$(git rev-parse HEAD)
git worktree add -q --detach "$T/land" "$DEV_AT"
(cd "$T/land" && echo new > g && git add g && git -c user.email=p@x -c user.name=p commit -qm landing)
NEW=$(git -C "$T/land" rev-parse HEAD)
[ "$(git rev-parse HEAD)" = "$DEV_AT" ] && echo "assert HEAD = DEV_AT: ok"
echo hand > h && git add h && git commit -qm hand-commit && HAND=$(git rev-parse HEAD)
git merge --ff-only "$NEW" 2>&1; echo "merge --ff-only exit=$?"
echo "dev = HAND: $([ "$(git rev-parse dev)" = "$HAND" ] && echo yes || echo no)"
rm -rf "$T"
