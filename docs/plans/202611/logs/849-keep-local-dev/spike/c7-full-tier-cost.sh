#!/bin/sh
# C7: the batched full tier (git cherry + one `diff-tree -r --stdin` + one
# `cat-file --batch-check`) classifies 200 local-only commits x 50 files each within an
# interactive budget (taken here as < 5 s wall time; the design names no number).
# Usage: c7-full-tier-cost.sh [commits] [files-per-commit]
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 LC_ALL=C LANG=C
N=${1:-200}; F=${2:-50}; FILES=1000
W="$(cd "$(dirname "$0")" && pwd)/_work/c7-$N"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
now() { perl -MTime::HiRes=time -e 'printf "%.3f", time'; }
git init -q -b dev repo; cd repo || exit 1

awk -v N="$N" -v F="$F" -v FILES="$FILES" 'BEGIN {
  print "commit refs/heads/dev"; print "committer p <p@x> 1700000000 +0000"; print "data 4"; print "base"
  for (k = 0; k < FILES; k++) { printf "M 100644 inline f%04d\ndata 5\ninit\n", k }
  for (i = 1; i <= N; i++) {
    print "commit refs/heads/dev"; printf "committer p <p@x> %d +0000\n", 1700000000 + i
    s = sprintf("L%d", i); printf "data %d\n%s\n", length(s), s
    for (j = 0; j < F; j++) { c = sprintf("%d-%d\n", i, j); printf "M 100644 inline f%04d\ndata %d\n%s", (i * F + j) % FILES, length(c), c }
  }
}' | git fast-import --quiet || exit 1
BASE=$(git rev-list --max-parents=0 dev)
HALF=$(git rev-parse "dev~$((N / 2))")
UP=$(git commit-tree "$HALF^{tree}" -p "$BASE" -m "squash of first half")
git update-ref refs/remotes/origin/dev "$UP"
echo "fixture: $(git rev-list --count origin/dev..dev) local-only commits, $F files each, $FILES files in tree"

t0=$(now)
counts=$(git rev-list --left-right --count origin/dev...dev)
copies=$(git cherry origin/dev dev | grep -c '^-')
t1=$(now)
git rev-list --reverse origin/dev..dev | git diff-tree -r --stdin --name-only > ../paths.txt
awk 'length($0) == 40 && $0 ~ /^[0-9a-f]+$/ { c = $0; next } NF { print c ":" $0; print "origin/dev:" $0 }' ../paths.txt \
  | git cat-file --batch-check='%(objectname)' > ../oids.txt
awk 'length($0) == 40 && $0 ~ /^[0-9a-f]+$/ { c = $0; next } NF { print c }' ../paths.txt > ../owner.txt
result=$(awk 'NR == FNR { owner[NR] = $0; next } { i = int((FNR + 1) / 2); if (FNR % 2) l = $1; else if (l != $1) diff[owner[i]] = 1; seen[owner[i]] = 1 }
  END { for (c in seen) if (diff[c]) u++; else m++; printf "content-match=%d unpublished=%d", m, u }' ../owner.txt ../oids.txt)
t2=$(now)
echo "left/right counts: $counts; copies (git cherry -): $copies"
echo "path lookups: $(wc -l < ../owner.txt | tr -d ' ') commit:path pairs, $(wc -l < ../oids.txt | tr -d ' ') batch-check answers"
echo "full tier: $result"
echo "git processes: cheap tier 2, full tier 3 (rev-list, diff-tree --stdin, cat-file --batch-check)"
echo "cheap tier seconds: $(echo "$t1 - $t0" | bc)"
echo "full tier seconds (excluding cheap tier): $(echo "$t2 - $t1" | bc)"
echo "total seconds: $(echo "$t2 - $t0" | bc)"
