#!/bin/sh
# C2 probe: run, outside bkit-build.md, the build engine calls a composed
# `light` child would need, in a scratch consumer, and record which calls
# refuse, which rows reach the child's log, and what a later /bkit-build
# (a REROUTE) meets on the same FID. The subagents' outputs (plan, test, fix,
# reviewer results) are hand-written fixtures: this probe tests the engine
# calls, not the agents. Writes only under $SP.
SP={REPO}/tmp/260/review/spike
sh "$SP/c2-setup.sh" || exit 1
C=$SP/c2/consumer
B=$C/node_modules/.bin/bkit
export BKIT_NO_UPDATE_CHECK=1
SD=$C/.git/bkit-outbox/sessions/probe
mkdir -p "$SD"
printf 'light lane probe: fix add so it adds\n' > "$SD/prompt.md"

run() { # run <label> <cmd...> ; prints output and exit code, keeps output in $OUT
  label=$1; shift
  echo "== $label"
  echo "\$ $*" | sed "s#$C#\$C#g; s#$SP#\$SP#g"
  OUT=$("$@" 2>&1); rc=$?
  printf '%s\n' "$OUT" | sed "s#$C#\$C#g; s#$SP#\$SP#g" | head -n "${LINES_MAX:-14}"
  echo "-> exit=$rc"
}
val() { printf '%s\n' "$OUT" | sed -n "s/^$1: //p" | head -n1 | tr -d '"'; }

cd "$C" || exit 1
run "fids resolve" "$B" fids resolve --prompt-file="$SD/prompt.md" --workflow=build
F=$(val fid)
run "locks acquire (composed child)" "$B" locks acquire --kind=workflow --workflow=build --fid="$F"
TOKEN=$(val token); M=$(val month)
run "worktrees setup --workflow=light (a new workflow name)" "$B" worktrees setup --workflow=light --fid="$F" --month="$M" --detect
run "worktrees setup --workflow=build" "$B" worktrees setup --workflow=build --fid="$F" --month="$M" --detect
W=$(val worktreePath); BASE=$(val baseSha)
cd "$W" || exit 1
L=docs/plans/$M/logs/$F; ST=$L/status.jsonl; P=docs/plans/$M/$F-plan.md; O=$C/.git/bkit-outbox/$F
mkdir -p "$O"
run "workflows start --workflow=light" "$B" workflows start --workflow=light --fid="$F" --month="$M" --lock-held --token="$TOKEN" --session-dir="$SD"
run "workflows start --workflow=build" "$B" workflows start --workflow=build --fid="$F" --month="$M" --lock-held --token="$TOKEN" --session-dir="$SD"
RUN=$(val run)
run "runtime row" "$B" runtime row --workflow=build --file="$ST"
run "workflows input" "$B" workflows input --workflow=build --fid="$F" --run="$RUN" --file="$ST" --prompt-file="$SD/prompt.md" --plan="$P"
run "steps done build-start-workflow" "$B" steps done --workflow=build --step=build-start-workflow --file="$ST" --commit=none
run "steps finish build-worktree-setup" "$B" steps finish --workflow=build --step=build-worktree-setup --file="$ST" --artifact="$L/build-input-$RUN.md" --number=2 --title="Worktree Setup" --tree="feat/$F" --message="chore($F): worktree-setup bkit [skip ci]"
LINES_MAX=4 run "tests plan-check (no plan yet)" "$B" tests plan-check --plan="$P" --existence=report --log="$L/build-plan-check.md"
# fixture standing in for @bkit-build-plan-convert's output
cp "$SP/c2-fixture-plan.md" "$P"
LINES_MAX=4 run "tests plan-check (after convert fixture)" "$B" tests plan-check --plan="$P" --existence=report --log="$L/build-plan-check.md"
run "steps finish build-plan-convert" "$B" steps finish --workflow=build --step=build-plan-convert --file="$ST" --attempt-of=build-plan-convert:next --artifact="$P" --optional-artifact="$L/build-plan-check.md" --number=4 --title="Plan Convert" --message="chore($F): plan-convert attempt <attempt>"
run "context brief --next" "$B" context brief --plan="$P" --next --dir="$L" --file="$ST"
G=$(val group)
run "steps done build-group-start" "$B" steps done --workflow=build --step=build-group-start --file="$ST" --group="$G" --commit=none
run "context brief --tests-only" "$B" context brief --plan="$P" --group="$G" --tests-only --dir="$L" --file="$ST"
# fixture standing in for @bkit-build-plan-tests: the planned test and its log
cat > test/add.test.js <<'JS'
import { test } from "node:test";
import assert from "node:assert/strict";
import { add } from "../src/add.js";
test("add returns the sum", () => assert.equal(add(2, 3), 5));
JS
printf 'Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan Tests\n\n## Test Log\n\nWROTE — TASK 1: `test/add.test.js` `add returns the sum`\n' > "$L/build-plan-tests-$G-log.md"
run "steps finish build-plan-tests" "$B" steps finish --workflow=build --step=build-plan-tests --file="$ST" --attempt-of=build-plan-tests:next --group="$G" --plan="$P" --agent=bkit-build-plan-tests --artifact="$L/build-plan-tests-$G-log.md" --number=7 --title="Plan Execute — tests" --message="chore($F): plan-tests group $G attempt <attempt>"
run "counters derive build-tests-red" "$B" counters derive --file="$ST" --workflow=build --step=build-tests-red --group="$G" --position=next
RA=$(val value); [ -z "$RA" ] && RA=1
run "tests red --workflow=light" "$B" tests red --file="$ST" --workflow=light --group="$G" --plan="$P" --log="$L/build-tests-red-$G-x.md" --writer-log="$L/build-plan-tests-$G-log.md"
run "tests red --workflow=build" "$B" tests red --file="$ST" --workflow=build --group="$G" --plan="$P" --log="$L/build-tests-red-$G-$RA.md" --writer-log="$L/build-plan-tests-$G-log.md"
# fixture standing in for @bkit-build-plan-tasks: the fix and its log
printf 'export function add(a, b) {\n  return a + b;\n}\n' > src/add.js
printf 'Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan Tasks\n\n## Execution Log\n\nDONE — TASK 1: Make add return the sum — fixed operator (src/add.js)\n' > "$L/build-plan-tasks-$G-log.md"
run "steps finish build-plan-tasks" "$B" steps finish --workflow=build --step=build-plan-tasks --file="$ST" --attempt-of=build-plan-tasks:next --group="$G" --agent=bkit-build-plan-tasks --artifact="$L/build-plan-tasks-$G-log.md" --number=7 --title="Plan Execute — code" --message="chore($F): plan-execute group $G attempt <attempt>"
run "tests green --workflow=build" "$B" tests green --file="$ST" --workflow=build --group="$G" --plan="$P" --log="$L/build-tests-green-$G-1.md"
run "context diff (challenge input)" "$B" context diff --reset-log --artifact="tmp/bkit-diff-$F.md" --fid="$F" --step=build-challenge
# fixtures standing in for both challenge reviewers' result files
for n in 1 2; do
  printf '{"findings":[],"judgments":{"Verdict":"PASS"},"body":"## Scope\\n\\nprobe fixture\\n","evidenceComplete":true}\n' > "$O/build-challenge-$n-result.json"
  run "steps stub bkit-build-challenge-$n" "$B" steps stub --agent=bkit-build-challenge-$n --result-file="$O/build-challenge-$n-result.json" --to="$L/build-challenge-$n.md"
done
run "tests run --changed-since --workflow=light" "$B" tests run --gate=bkit:gate:changed --changed-since="$BASE" --log="$O/light-tests.log" --file="$ST" --workflow=light --step=light-tests
run "tests run --changed-since --workflow=build --step=light-tests" "$B" tests run --gate=bkit:gate:changed --changed-since="$BASE" --log="$O/light-tests.log" --file="$ST" --workflow=build --step=light-tests
run "tests run --changed-since --workflow=build --step=build-run-tests" "$B" tests run --gate=bkit:gate:changed --changed-since="$BASE" --log="$O/light-tests.log" --file="$ST" --workflow=build --step=build-run-tests --attempt=1

echo "== rows in the child's status.jsonl (type workflow step verdict)"
node -e 'for (const l of require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n")) { const o = JSON.parse(l); if (o.type === "engine-call") continue; console.log([o.type, o.workflow ?? "", o.step ?? "", o.verdict ?? "", o.group ?? ""].join(" ")); }' "$ST"
echo "engine-call rows: $(grep -c '"engine-call"' "$ST")"

echo "### What a REROUTE to /bkit-build #N meets on this FID (the composed run ended with a stop line, no close)"
cd "$C" || exit 1
LINES_MAX=20 run "status resume --workflow=build" "$B" status resume --workflow=build --file="$W/$ST"
run "locks acquire (as /bkit-build Step 1, lock still held)" "$B" locks acquire --kind=workflow --workflow=build --fid="$F"
run "locks release (composed child's token)" "$B" locks release --kind=workflow --workflow=build --fid="$F" --month="$M" --token="$TOKEN"
run "locks acquire (as /bkit-build Step 1, after release)" "$B" locks acquire --kind=workflow --workflow=build --fid="$F"
T2=$(val token)
run "worktrees setup (as /bkit-build Step 2)" "$B" worktrees setup --workflow=build --fid="$F" --month="$M" --detect
cd "$W" || exit 1
run "workflows start (as /bkit-build Step 2)" "$B" workflows start --workflow=build --fid="$F" --month="$M" --lock-held --token="$T2" --session-dir="$SD"
LINES_MAX=20 run "status resume after the REROUTE's start" "$B" status resume --workflow=build --file="$ST"
