#!/bin/sh
# C7 probe: does the existing workflow lock refuse a second manager whose log holds only manage-* rows?
S="$(cd "$(dirname "$0")" && pwd)"
C="$S/consumer"
CLI="$S/../../../../../../dist/cli.js"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cd "$C" || exit 2
run() { node "$CLI" locks acquire --kind=workflow --workflow="$1" --fid="$2" --month=202611 --json; echo "exit=$?"; }
echo "=== control: design run with a fresh step row"
mkdir -p docs/plans/202611/logs/999-c7-control
printf '{"type":"workflow-started","workflow":"design","at":"%s"}\n{"type":"step-done","workflow":"design","step":"design-start-workflow","status":"DONE","at":"%s"}\n' "$NOW" "$NOW" > docs/plans/202611/logs/999-c7-control/status.jsonl
echo "first:";  run design 999-c7-control
echo "second:"; run design 999-c7-control
echo "=== manage: log holds only manage-* rows, written seconds ago"
mkdir -p docs/plans/202611/logs/999-c7-manage
echo "first:";  run manage 999-c7-manage
printf '{"type":"manage-run","parent":"999-c7-manage","children":["999-a","999-b"],"landing":"pr","at":"%s"}\n{"type":"manage-child","fid":"999-a","lane":"build","at":"%s"}\n{"type":"manage-go","worker":"worker-01","fid":"999-a","at":"%s"}\n' "$NOW" "$NOW" "$NOW" > docs/plans/202611/logs/999-c7-manage/status.jsonl
echo "second:"; run manage 999-c7-manage
