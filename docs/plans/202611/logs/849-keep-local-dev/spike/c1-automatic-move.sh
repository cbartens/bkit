#!/bin/sh
# C1: the automatic move of local dev (non-forced `fetch . <t>:refs/heads/dev`
# off dev, `merge --ff-only <t>` on dev) refuses every unsafe case and keeps edits.
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C LANG=C
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
W="$(cd "$(dirname "$0")" && pwd)/_work/c1"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; printf '[exit %s]\n' "$?"; }

q git init -q --bare -b dev origin.git
q git clone -q origin.git main
cd main || exit 1
printf 'a\n' > a.txt; printf 'b\n' > b.txt; q git add .; q git commit -qm base; q git push -q origin dev
cd .. && q git clone -q -b dev origin.git other && cd other || exit 1
printf 'a2\n' > a.txt; q git commit -qam upstream-a; q git push -q origin dev
cd ../main || exit 1
q git fetch -q origin dev
T=$(git rev-parse origin/dev); OLD=$(git rev-parse dev)
echo "target=$T old-dev=$OLD"

echo "== A: dev checked out in a linked worktree, main checkout on feat =="
q git switch -q -c feat
q git worktree add -q ../wt dev
run git fetch -q . "$T:refs/heads/dev"
echo "dev after: $(git rev-parse dev) (unchanged: $([ "$(git rev-parse dev)" = "$OLD" ] && echo yes || echo no))"
q git worktree remove ../wt

echo "== B: dev diverged (local commit), not checked out =="
q git switch -q dev; printf 'local\n' > l.txt; q git add l.txt; q git commit -qm local-only; L=$(git rev-parse dev); q git switch -q feat
run git fetch -q . "$T:refs/heads/dev"
echo "dev after: $(git rev-parse dev) (unchanged: $([ "$(git rev-parse dev)" = "$L" ] && echo yes || echo no))"

echo "== B1: same as B without -q =="
run git fetch . "$T:refs/heads/dev"

echo "== B2: target is an ancestor of dev (move would go backwards) =="
run git fetch -q . "$OLD:refs/heads/dev"
echo "dev after: $(git rev-parse dev) (unchanged: $([ "$(git rev-parse dev)" = "$L" ] && echo yes || echo no))"
q git branch -f dev "$OLD"

echo "== C: dev behind only, not checked out =="
run git fetch -q . "$T:refs/heads/dev"
echo "dev after: $(git rev-parse dev) (equals target: $([ "$(git rev-parse dev)" = "$T" ] && echo yes || echo no))"
q git branch -f dev "$OLD"

echo "== D: main checkout on dev, uncommitted edit to a.txt (a path the update changes) =="
q git switch -q dev; printf 'my edit\n' > a.txt
run git merge --ff-only -q "$T"
echo "dev after: $(git rev-parse dev) (unchanged: $([ "$(git rev-parse dev)" = "$OLD" ] && echo yes || echo no)); a.txt now: $(cat a.txt)"
q git checkout -- a.txt

echo "== E: main checkout on dev, uncommitted edit to b.txt + staged new s.txt (paths the update does not change) =="
printf 'my b edit\n' > b.txt; printf 's\n' > s.txt; q git add s.txt
run git merge --ff-only -q "$T"
echo "dev after: $(git rev-parse dev) (equals target: $([ "$(git rev-parse dev)" = "$T" ] && echo yes || echo no)); b.txt now: $(cat b.txt); staged: $(git diff --cached --name-only | tr '\n' ' ')"
q git restore --staged s.txt; rm -f s.txt; q git checkout -- b.txt; q git switch -q feat; q git branch -f dev "$OLD"

echo "== F: main checkout on dev, untracked n.txt where the update adds n.txt =="
cd ../other && printf 'n\n' > n.txt && q git add n.txt && q git commit -qm upstream-n && q git push -q origin dev && cd ../main
q git fetch -q origin dev; T2=$(git rev-parse origin/dev)
q git switch -q dev; printf 'mine\n' > n.txt
run git merge --ff-only -q "$T2"
echo "dev after: $(git rev-parse dev) (unchanged: $([ "$(git rev-parse dev)" = "$OLD" ] && echo yes || echo no)); n.txt now: $(cat n.txt)"
