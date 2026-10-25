> @cbartens/bkit@5.5.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (31 tests | 6 failed) 9ms
✓ bkit-build.md — CI-Dispatch gate wiring (6)
✓ runs bkit runs dispatch in exactly one PR-mode block 1ms
✓ passes the re-read labels, so the re-trigger subject carries the auto-route suffix 0ms
✓ passes the held PR number, so a runtime without gh never needs it to find the PR 0ms
✓ names the status file and the step whose row records the ciDispatch verdict 0ms
✓ never commits or pushes after the gate — the verdict stays local (KN-11) 0ms
✓ the push the gate polls refuses a skip-CI HEAD (--require-ci) 0ms
✓ bkit-debug.md — CI-Dispatch gate wiring (6)
✓ runs bkit runs dispatch in exactly one PR-mode block 0ms
✓ passes the re-read labels, so the re-trigger subject carries the auto-route suffix 0ms
✓ passes the held PR number, so a runtime without gh never needs it to find the PR 0ms
✓ names the status file and the step whose row records the ciDispatch verdict 0ms
✓ never commits or pushes after the gate — the verdict stays local (KN-11) 0ms
✓ the push the gate polls refuses a skip-CI HEAD (--require-ci) 0ms
✓ bkit-ship.md — no CI-Dispatch gate (1)
✓ never calls bkit runs dispatch 0ms
✓ bkit-ship.md — Step 9 re-validates through runs revalidate (4)
✓ runs it once, with the entry head, the code head, the branch and the status file 0ms
✓ dispatches only through the command — no hand-rolled gh workflow run anywhere 0ms
✓ never names a hard-coded ci.yml (the CI file comes from bkit.ciWorkflow) 0ms
✓ keeps ship free of the gate's outcome vocabulary (probe is never a pass condition) 0ms
✓ bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll (4)
✓ a refusal re-enters Step 9 as gate-refusal 0ms
✓ re-validate sits after the deferred sweep and the bookkeeping commit, before the merge gate 0ms
✓ bounds the re-entry by MAX_REVALIDATE_ATTEMPT through bkit counters route, never a local value 0ms
✓ derives the attempt from this run's ship-revalidate-dispatch rows via bkit counters rows 0ms
✓ bkit-debug.md — close decides from live PR state (4)
✓ probes the live PR for the close branch on any base, before the close commit 0ms
✓ adopts a PR opened mid-run instead of blind-creating 0ms
✓ sets TRIGGER_PR from {PR_OPEN}, never from the Step-1 PUSH_MODE 0ms
✓ runs the CI-Dispatch gate on every feature-branch close 0ms
❯ bkit-debug.md — Step 11 on dev (6)
× debug Step 11 on dev waits for and gates the dev CI run 1ms
× debug Step 11 on dev dispatches by pushed sha 2ms
× debug Step 11 on dev releases the lock after the CI wait 0ms
× debug Step 11 on dev records the close against the pushed sha 1ms
× debug Step 11 on dev routes a red run to the Failure Path naming the run 0ms
× debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev waits for and gates the dev CI run
AssertionError: no runs wait --head --until=completed block: expected -1 to be greater than -1
❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:258:65
256| const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --bra…
257| const gate = at(/"\{BKIT\}" runs gate --head="?\{DEV_SHA\}"?[^\n]*…
258| expect(wait, "no runs wait --head --until=completed block").toBeGr…
| ^
259| expect(gate, "no runs gate --capstone-only block").toBeGreaterThan…
260| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev dispatches by pushed sha
AssertionError: no runs dispatch --sha block: expected [] to have a length of 1 but got +0

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:264:49
262| it("debug Step 11 on dev dispatches by pushed sha", () => {
263| const dev = devDispatchFences(step11);
264| expect(dev, "no runs dispatch --sha block").toHaveLength(1);
| ^
265| expect(dev[0]!).toMatch(/"\{BKIT\}" runs dispatch [^\n]*--sha="?\{…
266| expect(dev[0]!).not.toMatch(/--pr[= ]/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev releases the lock after the CI wait
AssertionError: expected -1 to be greater than -1
❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:279:18
277| /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
278| );
279| expect(push).toBeGreaterThan(-1);
| ^
280| expect(wait).toBeGreaterThan(push);
281| // The dev push block holds no release; one release follows the wa…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev records the close against the pushed sha
AssertionError: expected '## 🤖 Step 11 — Close Workflow\n\n**R…' to match /`BRANCH` = `dev` → `\{CLOSE_PARENT\}`…/

- Expected:
  /`BRANCH` = `dev` → `\{CLOSE_PARENT\}` = `\{DEV_SHA\}`/

* Received:
  "## 🤖 Step 11 — Close Workflow

**Run only if** `TEST_VERDICT` = PASS.

1. Probe live PR state from `{BRANCH}` into any base (`{PR_OPEN}` = 0, `PUSH_MODE` = LOCAL with no probe when `BRANCH` = `dev` **or** `main`):
   ```bash
   \"{BKIT}\" prs probe --head=\"{BRANCH}\"
   ```
   Decide `PR_OPEN`:
   - **If** exit 0 → `{PR_OPEN}` = 1, `PUSH_MODE` = PR; hold `number` as `{PR_NUMBER}`, `url` as `{PR_URL}`.
   - **If** exit 1 → `{PR_OPEN}` = 0, `PUSH_MODE` = LOCAL.
   - **If** exit 80 → `list_pull_requests` (head `{BRANCH}`, state open) → found → `{PR_OPEN}` = 1, `PUSH_MODE` = PR with its `number` / `url`; none → `{PR_OPEN}` = 0, `PUSH_MODE` = LOCAL; record via `\"{BKIT}\" prs transport-row --file=\"{STATUS}\" --kind=fallback --asserted-by=<re-read>`.
   - **Else** → **Failure Path**.
2. Re-read labels, then record `PUSH_MODE`, strip `[verbose ci]` (with an optional `bkit ` prefix) from the PR title when `{PR_OPEN}` = 1, run the No-leak Assertion, mirror the roadmap row to `dev`, close the run (telemetry, report, artifact links) and commit it, release the lock, and push with the HEAD-Subject Assertion; `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry when `{PR_OPEN}` = 1 (the subject carries ` bkit [auto route]` on `bkit:auto`), else empty; `{PR_OPEN}` = 0 adds ` bkit [verbose ci]`:
   <!-- bkit:tracker github start -->
   `mcp__github__issue_read({ method: \"get\", owner: \"{OWNER}\", repo: \"{REPO}\", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels` → `LABELS`, `body` → `DESCRIPTION`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__get_issue({ id: \"{ISSUE_ID}\" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker jira start -->
   `mcp__jira__getJiraIssue({ cloudId: \"{TRACKER_SITE}\", issueIdOrKey: \"{ISSUE_ID}\", view: \"evidence\" })` → extract `fields.status.name` → `STATE`, `fields.labels` → `LABELS`, `fields.description` → `DESCRIPTION`.
   <!-- bkit:tracker jira end -->
   ```bash
   PR_OPEN=\"{PR_OPEN}\"
   \"{BKIT}\" status meta --file=\"{STATUS}\" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
   if [ \"$PR_OPEN\" = 1 ]; then \"{BKIT}\" prs verbose-ci --number={PR_NUMBER} --state=off; fi
   if git diff origin/dev..HEAD -- . ':(exclude)docs/plans' | grep -qE '^\\+.*\\[DEBUG-OBSERVE\\]'; then
     echo \"No-leak Assertion FAILED: [DEBUG-OBSERVE] instrumentation survived into the debug diff — soak did not strip it.\" >&2; exit 1
   fi
   \"{BKIT}\" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
   \"{BKIT}\" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file=\"{STATUS}\" --owner-repo={OWNER_REPO} --outbox=\"{OUTBOX}\" --message=\"chore({FID}): close-workflow\" --verbose-ci-local {LABEL_FLAGS} || exit 1
   \"{BKIT}\" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
   \"{BKIT}\" branches push --mode=feature --require-ci >/dev/null
   ```
   Hold the close's `parentSha` as `{CLOSE_PARENT}`.
3. **If** `{PR_OPEN}` = 0 → record the close row and audit the landed commit; `{LIVE_SKIPPED}` = `--field=\"testsLiveSkipped=No live tests ran, runtime-only defects not gated (not declared or opted out).\"` when `TEST_SCOPE` lacks `live`, else empty:
   ```bash
   \"{BKIT}\" steps done --file=\"{STATUS}\" --workflow=debug --step=debug-close-workflow --parent-sha={CLOSE_PARENT} {LIVE_SKIPPED} --commit=none >/dev/null || exit 1
   \"{BKIT}\" prs transport-row --file=\"{STATUS}\" --kind=close --shape=push --sha={CLOSE_PARENT} --scan --cross-check=gh
   ```
4. Set `TRIGGER_PR`:
   - **If** `BRANCH` = `dev` **or** `main` → push to trigger branch (CI fires) → `TRIGGER_PR` = 0.
   - **If** `{PR_OPEN}` = 1 → the close push fires `pull_request` → `TRIGGER_PR` = 0.
   - **Else** → `TRIGGER_PR` = 1.
5. **If** `TRIGGER_PR` = 1 → create or adopt the PR (body names `docs/plans/{YYYYMM}/{FID}-plan.md` if present); `--existing=reuse` adopts a PR that appeared since sub-step 1:
   ```bash
   \"{BKIT}\" prs open --fid={FID} --title=\"feat({FID}): debug-remediated\" --issue=\"{ISSUE_ID}\" --existing=reuse --plan=docs/plans/{YYYYMM}/{FID}-plan.md
   ```
   Route:
   - **If** exit 0 → hold `number` as `{PR_NUMBER}`, `url` as `{PR_URL}` (created, or the adopted PR).
   - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → its number as `{PR_NUMBER}`, URL as `{PR_URL}`.
   - **Else** → **Failure Path**.
6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head (`{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry):
   ```bash
   AUTO_ROUTE_SUFFIX=$(\"{BKIT}\" issues labels {LABEL_FLAGS} | jq -er .autoRouteSuffix) || exit 2
   git add -A && git commit --allow-empty -m \"chore({FID}): create-pr bkit [verbose ci]${AUTO_ROUTE_SUFFIX}\" || exit 1
   \"{BKIT}\" branches push --mode=feature --require-ci
   ```
7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 — CI-Dispatch Gate on the pushed head; it records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR; `{LABEL_FLAGS}` as in sub-step 6:
   ```bash
   \"{BKIT}\" runs dispatch --pr={PR_NUMBER} --fid={FID} {LABEL_FLAGS} --file=\"{STATUS}\" --workflow=debug {DISPATCH_ROW} {CI_REENTRY}
   ```
   Route:
   - **If** exit 0 → sub-step 8.
   - **If** exit 81 or 80 → **CI wait turn-loop** → re-run this block with `{CI_REENTRY}`.
   - **Else** (1 unresolved verdict, 4 skip token in the pushed body, 5 / 6 / other) → **Failure Path**.
8. <!-- bkit:tracker github start -->
   No issue label changes. **If** `BOARD` = null → log `boardSkipped` → skip. **Else** → ensure on board `mcp__github__projects_write({BOARD}.addItem)` → set status `mcp__github__projects_write({BOARD}.updateItem)`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   Update state only; do not change labels → `mcp__linear__save_issue({ id: \"{ISSUE_ID}\", state: \"{TRACKER_STATE}\" })`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker jira start -->
   Update status only; do not change labels → move status to `{TRACKER_STATE}` (**Tracker** status change).
   <!-- bkit:tracker jira end -->
   <!-- bkit:tracker true start -->
   `{TRACKER_STATE}` = `trackerState`, `{BOARD}` = `board`, printed by:
   ```bash
   \"{BKIT}\" issues labels --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
   ```
   <!-- bkit:tracker true end -->
9. **If** `PR_NUMBER` is set (PR-mode only) → re-read issue labels → check kill-switch:
   <!-- bkit:tracker github start -->
   `mcp__github__issue_read({ method: \"get\", owner: \"{OWNER}\", repo: \"{REPO}\", issue_number: {ISSUE_ID} })` → extract `state` (`open` / `closed`) → `STATE`, `labels` → `LABELS`, `body` → `DESCRIPTION`.
   <!-- bkit:tracker github end -->
   <!-- bkit:tracker linear start -->
   `mcp__linear__get_issue({ id: \"{ISSUE_ID}\" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`.
   <!-- bkit:tracker linear end -->
   <!-- bkit:tracker jira start -->
   `mcp__jira__getJiraIssue({ cloudId: \"{TRACKER_SITE}\", issueIdOrKey: \"{ISSUE_ID}\", view: \"evidence\" })` → extract `fields.status.name` → `STATE`, `fields.labels` → `LABELS`, `fields.description` → `DESCRIPTION`.
   <!-- bkit:tracker jira end -->
   <!-- bkit:tracker true start -->
   After reading issue (`issue-read`): **If** `bkit:auto` not in `LABELS` → kill switch active → terminate workflow normally (current run finishes, no further automation).
   <!-- bkit:tracker true end -->
10. <!-- bkit:tracker true start -->
    Comment — `{PR_LINKS}` = `--pr-number={PR_NUMBER} --pr-url=\"{PR_URL}\"` when `TRIGGER_PR` = 1, plus `--run-id={RUN_ID}` when the CI run id is known, else empty; artifact links and telemetry report written by sub-step 2:
    ```bash
    \"{BKIT}\" issues comment --step-number=11 --step-title=\"Close Workflow\" --owner-repo={OWNER_REPO} --tree={BRANCH} {PR_LINKS} --section=\"Artifacts={OUTBOX}/close-artifacts.md\" --section=\"Telemetry={OUTBOX}/close-telemetry.md\"
    ```
    <!-- bkit:tracker true end -->
11. Collect setup tips:
    ```bash
    \"{BKIT}\" tips --workflow=debug
    ```
    Plain text, not JSON. Hold stdout as `{BKIT_TIPS}`; prints nothing or exits non-zero → `{BKIT_TIPS}` empty.
12. Final return: Display `debug-summary.md` content verbatim as final message to user; do not summarise or trim; do not auto-invoke.
    <!-- bkit:tracker true start -->
    Append issue link [{ISSUE_ID} {TITLE}]({URL})
    <!-- bkit:tracker true end -->
    Append a `## Suggested Replies` heading.
    Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    Append a `## bkit Tips` heading, unless `{BKIT_TIPS}` is empty.
    Append `{BKIT_TIPS}`, unless empty.
13. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, NOT nouns; do not re-run any step.

"

❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:290:20
288|
289| it("debug Step 11 on dev records the close against the pushed sha", …
290| expect(step11).toMatch(/`BRANCH` = `dev` → `\{CLOSE_PARENT\}` = `\…
| ^
291| const record = at(/"\{BKIT\}" steps done [^\n]_--parent-sha=\{CLOS…
292| const audit = at(/"\{BKIT\}" prs transport-row [^\n]_--sha=\{CLOSE…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev routes a red run to the Failure Path naming the run
AssertionError: no red-conclusion route after runs wait: expected undefined to be defined
❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:300:62
298| const after = step11.slice(step11.indexOf('"{BKIT}" runs wait --he…
299| const route = after.split("\n").find((l) => l.includes("`conclusio…
300| expect(route, "no red-conclusion route after runs wait").toBeDefin…
| ^
301| expect(route).toContain("**Failure Path**");
302| expect(route).toContain("naming the run");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

FAIL .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts > bkit-debug.md — Step 11 on dev > debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path
AssertionError: no push-refusal route: expected undefined to be defined
❯ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts:307:44
305| it("debug Step 11 on dev sends a refused push or a replay conflict t…
306| const route = step11.split("\n").find((l) => l.includes("exit 8") …
307| expect(route, "no push-refusal route").toBeDefined();
| ^
308| expect(route).toContain("**Failure Path**");
309| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯

Test Files 1 failed (1)
Tests 6 failed | 25 passed (31)
Start at 17:24:55
Duration 105ms (transform 59%, tests 21%, setup 9%, import 8%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-e7475a/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
