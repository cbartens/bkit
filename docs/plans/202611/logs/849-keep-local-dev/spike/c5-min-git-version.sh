#!/bin/sh
# C5: the drop-empty flags (`cherry-pick --empty=drop`) work on every git version the
# engine already assumes (land.ts: git >= 2.31). Runs the C4 probe on older real gits.
set -u
S="$(cd "$(dirname "$0")" && pwd)"
for tag in v2.43.4 v2.45.1; do
  echo "=== alpine/git:$tag ==="
  docker run --rm -v "$S:/spike" --entrypoint sh "alpine/git:$tag" /spike/c4-replay-drop-empty.sh 2>&1 | sed '/^-- 4 /,/^-- 8 /{/^-- 8 /!d;}' | grep -v '^    \|^   or:\|^                \|^$'
  echo "[docker exit $?]"
done
