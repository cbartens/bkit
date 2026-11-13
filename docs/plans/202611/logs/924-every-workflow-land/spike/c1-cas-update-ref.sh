#!/bin/sh
# Claim C1: `git update-ref refs/heads/dev NEW DEV_AT` refuses when dev moved off DEV_AT
# (a hand commit), and leaves dev where the hand commit put it.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c1.XXXXXX")
git init -q --bare "$T/origin.git"
git init -q -b dev "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
echo base > f && git add f && git commit -qm base && git remote add origin "$T/origin.git" && git push -q origin dev
DEV_AT=$(git rev-parse refs/heads/dev)
git switch -q -c side && echo new > g && git add g && git commit -qm landing && NEW=$(git rev-parse HEAD) && git switch -q dev
echo hand > h && git add h && git commit -qm hand-commit && HAND=$(git rev-parse HEAD)
git switch -q side
echo "DEV_AT=$DEV_AT NEW=$NEW HAND=$HAND"
git update-ref refs/heads/dev "$NEW" "$DEV_AT"; echo "update-ref (dev moved) exit=$?"
echo "dev now=$(git rev-parse refs/heads/dev) (HAND kept: $([ "$(git rev-parse refs/heads/dev)" = "$HAND" ] && echo yes || echo no))"
git update-ref refs/heads/dev "$NEW" "$HAND"; echo "update-ref (old matches) exit=$?"
echo "dev now=$(git rev-parse refs/heads/dev) (= NEW: $([ "$(git rev-parse refs/heads/dev)" = "$NEW" ] && echo yes || echo no))"
rm -rf "$T"
