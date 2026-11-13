#!/bin/sh
# Claim C14: after feature A lands on local dev (not pushed), `git worktree add -b feat/B <dir>
# refs/heads/dev` gives B A's files both when dev is only ahead of origin/dev and when the two
# have split (another clone pushed to origin), and
# `git rev-list --left-right --count dev...origin/dev` prints the ahead and behind counts.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c14.XXXXXX")
git init -q --bare "$T/origin.git"
git init -q -b dev "$T/main" && cd "$T/main"
git config user.email p@x && git config user.name p
echo base > base.txt && git add . && git commit -qm base && git remote add origin "$T/origin.git" && git push -q origin dev
echo a > a.txt && git add . && git commit -qm "feat(924-a): land A locally"
git fetch -q origin
echo "only ahead: ahead/behind = $(git rev-list --left-right --count dev...origin/dev)"
git worktree add -q -b feat/B1 "$T/b1" refs/heads/dev
echo "  B1 has a.txt: $([ -f "$T/b1/a.txt" ] && echo yes || echo no)"
git clone -q -b dev "$T/origin.git" "$T/other" && (cd "$T/other" && echo o > o.txt && git add . && git -c user.email=o@x -c user.name=o commit -qm other && git push -q origin dev)
git fetch -q origin
echo "split: ahead/behind = $(git rev-list --left-right --count dev...origin/dev)"
git worktree add -q -b feat/B2 "$T/b2" refs/heads/dev
echo "  B2 has a.txt: $([ -f "$T/b2/a.txt" ] && echo yes || echo no); B2 has o.txt: $([ -f "$T/b2/o.txt" ] && echo yes || echo no)"
rm -rf "$T"
