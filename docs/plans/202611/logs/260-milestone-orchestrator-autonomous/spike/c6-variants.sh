#!/bin/sh
# C6 probe: rewrite the Decision line per variant, then ask the real CLI what pending lists.
S="$(cd "$(dirname "$0")" && pwd)"
C="$S/consumer"
CLI="$S/../../../../../../dist/cli.js"
R="The test still checks the behaviour the issue asks for."
set_line() { f="$C/docs/plans/202611/logs/999-c6-$1/build-decision-1-1.md"; grep -v '^Decision:' "$f" > "$f.tmp"; printf '%s\n' "$2" >> "$f.tmp"; mv "$f.tmp" "$f"; }
set_line control "Decision: Accept (assumed) — $R (ask:false, LOCAL, 2026-11-19)"
set_line draft   "Decision: Accept (assumed, by the manager) — $R"
set_line review  "Decision: Accept (assumed) — by the manager: $R"
for v in control draft review; do
  echo "=== variant=$v"
  grep '^Decision:' "$C/docs/plans/202611/logs/999-c6-$v/build-decision-1-1.md"
  node "$CLI" decisions pending --fid=999-c6-$v --month=202611 --root="$C" --json; echo "exit=$?"
done
