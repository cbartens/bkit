#!/bin/sh
# C4: a drop-empty replay (git cherry-pick onto a fresh origin/dev) drops commits that
# become empty, keeps going on commits that were empty from the start, and replays a
# merge commit from `git pull`; the engine can see each drop because HEAD does not move.
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C LANG=C
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
V=$(git --version | awk '{print $3}')
W="$(cd "$(dirname "$0")" && pwd)/_work/c4-$V"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; printf '[exit %s]\n' "$?"; }
echo "git $V"

q git init -q -b dev repo; cd repo || exit 1
printf 'a-1\n' > a.txt; printf 'b-1\n' > b.txt; q git add .; q git commit -qm B
q git switch -q -c up; printf 'A1\n' > a.txt; q git commit -qam "U same change as X1"; U=$(git rev-parse HEAD)
q git switch -q dev
printf 'A1\n' > a.txt; q git commit -qam "X1 becomes empty on replay"; X1=$(git rev-parse HEAD)
q git commit -q --allow-empty -m "X2 empty from the start";          X2=$(git rev-parse HEAD)
printf 'B1\n' > b.txt; q git commit -qam "X3 real change";            X3=$(git rev-parse HEAD)
q git switch -q -c side "$X1"; printf 'c\n' > c.txt; q git add c.txt; q git commit -qm "side c"
q git switch -q dev; q git merge -q --no-ff --no-edit side; X4=$(git rev-parse HEAD)

pick() { # $1 label, rest = cherry-pick args; prints whether HEAD moved and whether the new commit is empty
  q git cherry-pick --abort; q git switch -q --detach "$BASE"
  b=$(git rev-parse HEAD); printf -- '-- %s\n' "$1"; shift
  run git cherry-pick "$@"
  a=$(git rev-parse HEAD)
  if [ "$a" = "$b" ]; then echo "HEAD moved: no"; else echo "HEAD moved: $(git rev-list --count "$b..$a") commit(s): $(git log --format='%s[files=%H]' "$b..$a" | while IFS= read -r l; do h=${l##*files=}; h=${h%]}; printf '%s=%s; ' "${l%%\[*}" "$(git diff-tree -r --no-commit-id --name-only "$h" | wc -l | tr -d ' ')"; done)"; fi
}
BASE=$U
pick "1 empty-from-start, --empty=drop alone"            --empty=drop "$X2"
pick "2 empty-from-start, --allow-empty --empty=drop"    --allow-empty --empty=drop "$X2"
pick "3 becomes-empty, --allow-empty --empty=drop"       --allow-empty --empty=drop "$X1"
pick "4 X1 X2 X3 in one call, --allow-empty --empty=drop" --allow-empty --empty=drop "$X1" "$X2" "$X3"
pick "5 becomes-empty, today's --allow-empty --keep-redundant-commits" --allow-empty --keep-redundant-commits "$X1"
pick "6 merge commit, --allow-empty --empty=drop"        --allow-empty --empty=drop "$X4"
pick "7 merge commit, -m 1 --allow-empty --empty=drop"   -m 1 --allow-empty --empty=drop "$X4"
pick "8 fallback without --empty: becomes-empty, --allow-empty only" --allow-empty "$X1"
echo "sequencer state: $(git rev-parse -q --verify CHERRY_PICK_HEAD >/dev/null && echo stopped || echo none)"
run git cherry-pick --skip
echo "HEAD after --skip equals base: $([ "$(git rev-parse HEAD)" = "$BASE" ] && echo yes || echo no)"
git cherry-pick --abort >/dev/null 2>&1 || :
