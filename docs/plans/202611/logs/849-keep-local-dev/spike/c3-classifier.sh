#!/bin/sh
# C3: the design's two proofs (git cherry patch-id, then "every touched path's blob
# equals origin/dev") never mark a merge commit or an empty-from-start commit
# "already on GitHub", and classify the other PoC fixture commits correctly.
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C LANG=C
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
W="$(cd "$(dirname "$0")" && pwd)/_work/c3"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
lines() { printf '%s-1\n%s-2\n%s-3\n%s-4\n%s-5\n%s-6\n' "$1" "$1" "$1" "$1" "$1" "$1"; }
setl() { sed "s/^$2\$/$3/" "$1" > "$1.t" && mv "$1.t" "$1"; } # file, old line, new line

q git init -q --bare -b dev origin.git
q git clone -q origin.git local; cd local || exit 1
for f in a b c d e f; do lines "$f" > "$f.txt"; done
q git add .; q git commit -qm B0; q git push -q origin dev

# Local-only commits on dev
setl a.txt a-1 A1;            q git commit -qam "L1 copy";              L1=$(git rev-parse HEAD)
setl b.txt b-1 B1;            q git commit -qam "L2 squash part 1";     L2=$(git rev-parse HEAD)
setl c.txt c-1 C1;            q git commit -qam "L3 squash part 2";     L3=$(git rev-parse HEAD)
q git commit -q --allow-empty -m "L4 empty retrigger";                 L4=$(git rev-parse HEAD)
q git rm -q e.txt;            q git commit -qm "L5 delete e (published)"; L5=$(git rev-parse HEAD)
q git rm -q f.txt;            q git commit -qm "L6 delete f (unpublished)"; L6=$(git rev-parse HEAD)
setl d.txt d-1 D1;            q git commit -qam "L7 edit d (later reverted upstream)"; L7=$(git rev-parse HEAD)

# Upstream: copy of L1, one squash of L2+L3+L5+L7, an empty retrigger
cd .. && q git clone -q -b dev origin.git up && cd up || exit 1
q git fetch -q ../local dev
q git cherry-pick "$L1" || { echo "fixture: copy of L1 failed"; exit 1; }
q git cherry-pick -n "$L2" "$L3" "$L5" "$L7"; q git commit -qm "U2 squash of L2 L3 L5 L7"
q git commit -q --allow-empty -m "U3 empty retrigger"
q git push -q origin dev

# Local pulls with a merge (no rebase), then adds new work
cd ../local || exit 1
q git pull -q --no-rebase --no-edit origin dev; M=$(git rev-parse HEAD)
printf 'g\n' > g.txt; q git add g.txt; q git commit -qm "L8 new file"; L8=$(git rev-parse HEAD)

# Upstream continues: edit another line of c.txt, revert the d.txt change
cd ../up || exit 1
q git pull -q --no-rebase origin dev
setl c.txt c-4 C4; q git commit -qam "U4 edit c line 4"
setl d.txt D1 d-1; q git commit -qam "U5 revert d change"
q git push -q origin dev

cd ../local || exit 1
q git fetch -q origin
echo "== cheap tier =="
echo "\$ git rev-list --left-right --count origin/dev...dev"; git rev-list --left-right --count origin/dev...dev
echo "\$ git cherry -v origin/dev dev"; git cherry -v origin/dev dev; echo "[exit $?]"
echo "copies=$(git cherry origin/dev dev | grep -c '^-')"
echo "\$ git cherry -v origin/dev L7   (local dev as it was before the pull merge)"; git cherry -v origin/dev "$L7"; echo "[exit $?]"
echo "== merge commit paths =="
echo "\$ git diff-tree -r --no-commit-id --name-only M"; git diff-tree -r --no-commit-id --name-only "$M"; echo "[exit $?, lines=$(git diff-tree -r --no-commit-id --name-only "$M" | wc -l | tr -d ' ')]"
echo "\$ git diff-tree -r -m --no-commit-id --name-only M"; git diff-tree -r -m --no-commit-id --name-only "$M" | sort -u | tr '\n' ' '; echo
echo "\$ git diff-tree -r --no-commit-id --name-only L4"; echo "[lines=$(git diff-tree -r --no-commit-id --name-only "$L4" | wc -l | tr -d ' ')]"
echo "\$ git diff-tree -r --diff-filter=d --no-commit-id --name-only L6"; echo "[lines=$(git diff-tree -r --diff-filter=d --no-commit-id --name-only "$L6" | wc -l | tr -d ' ')]"

FORK=$(git merge-base origin/dev dev)
echo "fork point=$(git log -1 --format=%s "$FORK")"
blob() { git rev-parse -q --verify "$1:$2" 2>/dev/null || echo absent; }
classify() { # $1 commit, $2 diff-tree filter args
  c=$1; shift
  if git cherry origin/dev dev | grep -q "^- $c"; then echo patch-match; return; fi
  ok=yes
  for p in $(git diff-tree -r --no-commit-id --name-only "$@" "$c"); do
    [ "$(blob "$c" "$p")" = "$(blob origin/dev "$p")" ] || ok=no
  done
  [ "$ok" = yes ] && echo content-match || echo unpublished
}
contested() { # paths of $1 that origin/dev changed after the fork point
  for p in $(git diff-tree -r --no-commit-id --name-only "$1"); do
    git diff --quiet "$FORK" origin/dev -- "$p" || printf '%s ' "$p"
  done
}
echo "== full tier vs truth =="
printf '%-38s | %-11s | %-24s | %-24s | %s\n' commit truth "rule, notOnDev filter=d" "rule, all paths" "contested paths"
for c in $(git rev-list --reverse origin/dev..dev); do
  s=$(git log -1 --format=%s "$c")
  case "$s" in
    L1*|L2*|L3*|L5*) t=published ;;
    L4*) t=empty ;;
    Merge*) t=merge ;;
    *) t=unpublished ;;
  esac
  printf '%-38s | %-11s | %-24s | %-24s | %s\n' "$s" "$t" "$(classify "$c" --diff-filter=d)" "$(classify "$c")" "$(contested "$c")"
done
