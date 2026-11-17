#!/bin/sh
# Claim C2: `git update-ref` moves a dev ref checked out in another linked worktree without
# refusing (so advanceLocalDev needs its own check), and `git worktree list --porcelain`
# names that worktree as holding refs/heads/dev.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c2.XXXXXX")
git init -q -b main "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
echo base > f && git add f && git commit -qm base && git branch dev
DEV_AT=$(git rev-parse dev)
git worktree add -q "$T/other" dev
git switch -q -c side && echo new > g && git add g && git commit -qm landing && NEW=$(git rev-parse HEAD)
echo "--- worktree list --porcelain"
git worktree list --porcelain
git update-ref refs/heads/dev "$NEW" "$DEV_AT"; echo "update-ref (dev checked out in other worktree) exit=$?"
echo "dev now=$(git rev-parse dev) (= NEW: $([ "$(git rev-parse dev)" = "$NEW" ] && echo yes || echo no))"
echo "--- status in the other worktree after the move"
git -C "$T/other" status --short
echo "--- for contrast: git fetch . NEW:refs/heads/dev from main checkout (reset dev first)"
git update-ref refs/heads/dev "$DEV_AT" "$NEW"
git fetch . "$NEW:refs/heads/dev" 2>&1; echo "fetch . exit=$?"
rm -rf "$T"
