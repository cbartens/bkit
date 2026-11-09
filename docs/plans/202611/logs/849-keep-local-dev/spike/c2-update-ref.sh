#!/bin/sh
# C2: `update-ref <ref> <new> <old>` is a compare-and-swap, `update-ref <ref> <v> ""`
# is create-only, and update-ref ignores worktrees (so adoption needs its own check).
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C LANG=C
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
W="$(cd "$(dirname "$0")" && pwd)/_work/c2"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; printf '[exit %s]\n' "$?"; }

q git init -q -b dev repo; cd repo || exit 1
printf 'a\n' > a.txt; q git add .; q git commit -qm c1; C1=$(git rev-parse HEAD)
printf 'a2\n' > a.txt; q git commit -qam c2; C2=$(git rev-parse HEAD)
printf 'a3\n' > a.txt; q git commit -qam c3; C3=$(git rev-parse HEAD)
q git switch -q -c main-co; q git branch -f dev "$C2"
echo "c1=$C1 c2=$C2 c3=$C3; dev=$(git rev-parse dev), checked out nowhere"

echo "== A: CAS with correct old value, dev checked out nowhere =="
run git update-ref refs/heads/dev "$C3" "$C2"
echo "dev=$(git rev-parse dev)"
echo "== B: CAS with stale old value =="
run git update-ref refs/heads/dev "$C1" "$C2"
echo "dev=$(git rev-parse dev)"
echo "== C: create-only (empty old) on a new name, then the same name again =="
run git update-ref refs/heads/dev-backup/20261109-120000 "$C2" ""
run git update-ref refs/heads/dev-backup/20261109-120000 "$C3" ""
echo "backup=$(git rev-parse refs/heads/dev-backup/20261109-120000)"
echo "== D: CAS while dev is checked out in a linked worktree =="
q git worktree add -q ../wt dev
run git update-ref refs/heads/dev "$C1" "$C3"
echo "dev=$(git rev-parse dev); linked worktree HEAD=$(git -C ../wt rev-parse HEAD); a.txt in worktree=$(cat ../wt/a.txt)"
echo "linked worktree status:"; git -C ../wt status --short
echo "== E: occupancy as git state =="
git worktree list --porcelain | grep '^branch '
