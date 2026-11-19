#!/bin/sh
# Recreates the throwaway scratch consumer that c6-variants.sh and c7-lock.sh run against.
# Copies one real assumed-accept decision file from bkit's own history as the C6 fixture.
S="$(cd "$(dirname "$0")" && pwd)"
ROOT="$S/../../../../../.."
SRC="$ROOT/docs/plans/202611/logs/1008-plan-design-owner/build-decision-1-2.md"
rm -rf "$S/consumer"
mkdir -p "$S/consumer"
cd "$S/consumer" || exit 2
git init -q -b dev .
for v in control draft review; do
  mkdir -p "docs/plans/202611/logs/999-c6-$v"
  cp "$SRC" "docs/plans/202611/logs/999-c6-$v/build-decision-1-1.md"
done
echo "consumer ready at $S/consumer"
