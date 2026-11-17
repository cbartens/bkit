diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index ecad3c155..8d0d5de37 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -305,13 +305,13 @@ chmod +x .husky/pre-commit .husky/pre-push
 - Adapt: repo-only checks go below the bkit lines in each hook. What a gate runs belongs in the `bkit:gate:*` script, not the hook.
 - Min push:
   - **If** every file changed since each pushed commit left `origin/dev` (else `origin/main`) is one bkit writes or one `bkit.testing.minPushPaths` adds → `bkit:gate:min` replaces the full gate, and `MIN_PUSH=1`.
-  - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed.
-  - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
+  - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed. A new branch qualifies the same way: a receipt on an ancestor of the pushed commit, with only bookkeeping paths changed since it and no later failure, takes the minimum gate.
+  - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. `bkit tests run` records the same receipt when it runs the deepest full gate (build Step 12) without `--changed-since`; there, uncommitted paths inside the min-push (bookkeeping) paths do not block it, since every engine call appends to `status.jsonl`, and any uncommitted code, a lock wait (exit 81) or a lighter gate records none. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
   - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 12 steps) plus `docs/plans/**` and `docs/audits/**`.
   - A change to a top-level `docs/templates/bkit-audit-*.md` also counts as written by bkit when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range, so only the `Project Instructions` section below it changed. A new, deleted or renamed template, a second marker line, or any change at or above the marker keeps the full gate. A template with CRLF line endings never qualifies, because a marker followed by `\r` is not line-anchored. Other templates, such as `docs/templates/bkit-plan.md`, keep the full gate. "What bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections.
   - The setting takes `package.json` globs: `*` matches one folder and `**` any depth. The default is `[]`, which leaves what bkit writes alone, because the setting only adds to it.
   - `bkit ci min-push` decides from files, never from `[skip ci]`, because that is a typed label and GitHub reads the last commit only.
-  - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch can still qualify from its complete bookkeeping-only branch diff.
+  - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch qualifies from a receipted ancestor plus bookkeeping-only commits, or from its complete bookkeeping-only branch diff; a new branch with code after the receipted ancestor keeps the full gate.
 - Min-push paths: list only files that no code, build or test reads.
   - The floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.
   - Never list `docs/**`, because a doc can be test input.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d21b9a0e4..c2080a22f 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -768,7 +768,7 @@ Verdict-bearing agents with a meaningful "addressable" middle state use the 3-wa

<!-- prettier-ignore -->
 | Agent | `Verdict` values | Routing |
 | --- | --- | --- |
 | `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 6. CONCERNS / FAIL → Step 6 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 7: `@bkit-build-plan-tasks` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
-| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop, never asked while `build.verify.maxAttempts` allows; no round left → § Decision Pause (`VERIFY_GAPS`), or Failure Path for a group gate FAIL alone; FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. Holistic (Step 10): PASS, or CONCERNS with 0 failures → Step 11; other CONCERNS / FAIL → the same loop through `@bkit-build-plan-gaps-remediate` in holistic mode, counted since the last clean holistic round. |
+| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop, never asked while `build.verify.maxAttempts` allows; no round left → § Decision Pause (`VERIFY_GAPS`), or Failure Path for a group gate FAIL alone; FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. Holistic (Step 10): PASS, or CONCERNS with 0 failures → Step 11; other CONCERNS / FAIL → the same loop through `@bkit-build-plan-gaps-remediate` in holistic mode, counted against the run-wide `build.holistic` allowance, with no reset after a clean check. |
 | `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 12; `fix` → Step 7 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical \| architectural`; architectural → `**Fixable:** false`. |
 | `@bkit-design-review-1` / `-2` | PASS / CONCERNS / FAIL | `REVIEW_VERDICT` = worst-of-two. PASS / CONCERNS → Step 7 spike (`REVIEW_SPIKE` = true) else Step 8 apply-review; FAIL → Failure Path (design fundamentally not viable, human reframe required). `@bkit-design-review-1` additionally emits `Spike` (`true` / `false`) in its header — a routing flag, not a verdict; `REVIEW_SPIKE` gates Step 7 only and never contributes to `REVIEW_VERDICT`. |
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
@@ -971,7 +971,7 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its red, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
-| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; attempt-numbered `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the holistic rounds since the last clean one (`counters route --of=build-plan-verify-holistic:current --since-clean --point=build.verify`; clean = PASS, or CONCERNS with 0 failures, so a fix group's re-check gets a fresh allowance) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
+| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; its tests run only for the files changed since the last holistic check that found no problems (`origin/dev` for the first check, so the first covers the whole feature diff); run-and-attempt-numbered `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the run's holistic fix rounds (`counters route --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`, one allowance per run with no reset after a clean check) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
 | 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → `counters progress --check=build-run-tests --fix=build-failure-remediate`: `trend` `stuck` or `worse` → § Decision Pause (`TESTS_LOOP`: Stop / Try again), else Step 13 without asking; none left → § Decision Pause (`TESTS_LOOP`) when `ask` is true in a session, else Failure Path. |
 | 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` (only if Step 12 FAIL) | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
@@ -998,7 +998,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
 - **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
-- **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic with `--since-clean`, so it counts only grants since the last clean holistic round); it writes a row only when the limit is used up and `ask` is true.
+- **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic counts the run's fix rounds against `build.holistic`); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
 - **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
@@ -1011,14 +1011,15 @@ Every point where a run can ask the owner has two settings under `package.json`

<!-- prettier-ignore -->
 | Point | Default | Counts | Asks |
 | --- | --- | --- | --- |
 | `design.grill` | `{ "ask": true, "maxTurns": 6 }` | Interview turns, the draft acceptance turn included | Each turn's questions (§ `/bkit-design`, Grill) |
-| `build.verify` | `{ "ask": true, "maxAttempts": 2 }` | Verify rounds per group, and holistic rounds since the last clean holistic round | Every gap item: unfixable, unchanged by a fix round, or left after the last round |
+| `build.verify` | `{ "ask": true, "maxAttempts": 2 }` | Verify rounds per group | Every gap item: unfixable, unchanged by a fix round, or left after the last round |
+| `build.holistic` | `{ "ask": true, "maxAttempts": 2 }` | Holistic fix rounds across the run, never reset after a clean check | Loop question before a further fix round once the limit is used up; every gap item: unfixable, unchanged by a fix round, or left after the last round |
 | `build.challenge` | `{ "ask": true, "maxAttempts": 2 }` | Challenge rounds | Every finding item |
 | `build.tests` | `{ "ask": true, "maxAttempts": 2 }` | Test rounds | Loop question before a further fix round, only when `counters progress` `trend` is `stuck` or `worse` |
 | `debug.fix` | `{ "ask": true, "maxAttempts": 2 }` | Remediate rows across every debug run of the feature | `Q1 — Fix: … Stop here instead of another fix attempt?`, only when `trend` is `stuck` or `worse` |
 | `debug.soak` | `{ "ask": true, "maxAttempts": 2 }` | Soak rows across every debug run of the feature | `Q1 — Soak: …` before the first and each further soak attempt, only when `trend` is `stuck` or `worse` |
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
-- **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
+- **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
 - **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
@@ -1715,7 +1716,7 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
 | `bkit:gate:min` | `pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `.husky/pre-push` on a min push; bookkeeping landings through `pushToDev` |
 | `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
-| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 8 (group gate), build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
+| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
 | `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Step 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — the gate above plus E2E; runs every tier after a red one (Tier order, below) | debug Step 3 |
 | `bkit:gate:static-unit-integration-e2e-live` | not seeded — chains the gate above | debug Step 3 |
@@ -1749,7 +1750,7 @@ Not seeded, because which files a stack generates is the stack's business. A reg
 - **No files changed:** nothing runs, exit 0.
 - **Undeclared:** the `--fallback` gate runs whole, with no arguments: `bkit:gate:static` for `@bkit-build-plan-tasks`, `bkit:gate:static-unit` for the others.
 
-Not seeded, because finding the tests a file affects is the stack's job; the `gate-changed-script-missing` advisory (install, `bkit check`, `bkit upgrade`) hands over the line until it is declared or named in `bkit.advisories.ignore`. The orchestrator's gates (build Step 8 and Step 12, debug Step 3, `.husky/pre-push`, CI) still run whole gates.
+Not seeded, because finding the tests a file affects is the stack's job; the `gate-changed-script-missing` advisory (install, `bkit check`, `bkit upgrade`) hands over the line until it is declared or named in `bkit.advisories.ignore`. The orchestrator's full-suite gates (build Step 12, debug Step 3, `.husky/pre-push`, CI) still run whole gates. `tests run --changed-since={sha}` runs `bkit:gate:changed` on the files changed since that commit (build Step 8 group gate, holistic checks) and passes them as arguments; its vitest stages inherit `$BKIT_TEST_REPORT_DIR`, so a failure count survives.
 
 Agents and humans run the same scripts, so a green agent gate and a green `git push` mean the same thing. `bkit-ci.yml` deliberately stays off them: it needs per-step reporting, affected-package conditionals, and the heavier tiers the local gate excludes, so it calls `pnpm typecheck` / `pnpm test` / … directly.
 
@@ -1757,7 +1758,7 @@ Agents and humans run the same scripts, so a green agent gate and a green `git p
 
 The three deep gates are not seeded: a seeded `pnpm test:integration` hard-fails every repo without that tier, and a gate named `…-integration-e2e` that skipped them silently is the false-green this design exists to kill. Declaring one — a single line chaining its parent — is how a consumer opts a workflow into a deeper tier.
 
-Build Step 12 and debug each run the deepest gate the consumer declares, and record its name; the build group gate runs `bkit:gate:static-unit` alone (§ Group gate):
+Build Step 12 and debug each run the deepest gate the consumer declares, and record its name; the build group gate runs only the files the group changed (§ Group gate):
 
 <!-- prettier-ignore -->
 | Workflow | Candidates, descending | Stops at |
@@ -1777,10 +1778,10 @@ Build does not run the live tier (post-merge `bkit-tests-live` canary). Every `b
 
 ### Group gate
 
-Build Step 8 runs `bkit:gate:static-unit` (static checks and the unit tier) after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it, because Steps 10 + 12 follow.
+Build Step 8 runs `bkit:gate:static-unit` on the files the group changed (`tests run --changed-since={GROUP_BASE}`; the whole suite runs once, at Step 12) after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it, because Steps 10 + 12 follow.
 
 - **Orchestrator-owned:** agent gate runs (execute, gaps-remediate, verify) are self-reported in their logs; the group gate writes a `build-group-gate` row (`verdict`, `scope`), so a skipped gate is visible.
-- **Unit tier only:** includes the coverage floor where the consumer chains one into `bkit:gate:static-unit`, never integration. Integration runs once, at Step 12, then again at pre-push and in CI before anything merges. Each group gate re-runs the whole suite, so integration there multiplies its cost by the group count, while unit tests import the same code and catch most breaks a later group would hit. Cost: an integration-only break surfaces at Step 12 against the whole diff, fixed by the Steps 13-14 diagnose and fix rounds; the failing test names the area.
+- **Unit tier only:** includes the coverage floor where the consumer chains one into `bkit:gate:static-unit`, never integration. Integration runs once, at Step 12, then again at pre-push and in CI before anything merges. A group gate that re-ran the whole suite would multiply its cost by the group count, so it tests only the group's own changes, while unit tests import the same code and catch most breaks a later group would hit. Cost: an integration-only break surfaces at Step 12 against the whole diff, fixed by the Steps 13-14 diagnose and fix rounds; the failing test names the area.
 - **Strict, no exceptions:** the end of a group is where a build can stop (verify budget exhausted, session lost, `/bkit-ship` resume) → it must hold a tree that passes the unit gate. No expected-red declaration. A red gate is an ordering defect (signature change split from callers, deletion before replacement, tests deferred to a later task): `@bkit-plan-generate` orders its groups to keep every group gate green, putting the tasks in one group when it cannot. A red gate whose failing tests also fail on the base commit is not an ordering defect of the branch: the pause says so and recommends `Stop`, the owner fixes `dev` (adopt mode: merges `dev` into the branch) and resumes, and the resume re-runs the gate.
 
 ### Test-first
@@ -1850,6 +1851,7 @@ Verify→remediate and diagnose→fix loops carry context through per-attempt lo

<!-- prettier-ignore -->
 | Verifier / checker | Remediator | Max attempts | Escalation |
 | --- | --- | --- | --- |
 | `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `build.verify.maxAttempts` (2) rounds per group, never reset; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause on the open gaps with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
+| `@bkit-build-plan-verify` (holistic) | `@bkit-build-plan-gaps-remediate` (holistic) | `build.holistic.maxAttempts` (2) fix rounds per run, never reset after a clean check; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | `bkit challenge gate` → `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` when large (parallel) → `bkit challenge merge` | `@bkit-build-plan-tasks` (the merged findings are plan tasks) | `build.challenge.maxAttempts` (2) rounds (`CHALLENGE_ROUND`): earlier rounds may fix on their own; the last never does | `**Fixable:** false` tasks, last-round tasks, or too many findings → Decision Pause; the last round's fixes are not challenged again |
 | Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse` (`unknown` is fixed without asking); limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `debug.fix.maxAttempts` (2) then `debug.soak.maxAttempts` (2), each counted across every debug run of the feature | Further attempts taken without asking; Loop Question only when `trend` is `stuck` or `worse`; fix used up → SOAK; soak used up → Loop Question when `debug.soak.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
diff --git a/.bkit/core/engine/commands/ci/push-gate.test.ts b/.bkit/core/engine/commands/ci/push-gate.test.ts
index cb62b3d27..18a49af98 100644
--- a/.bkit/core/engine/commands/ci/push-gate.test.ts
+++ b/.bkit/core/engine/commands/ci/push-gate.test.ts
@@ -5,6 +5,8 @@ import { afterEach, describe, expect, it } from "vitest";
 import { useGateRunner } from "../../../../../vitest.gate-fixture";
 import { runCommand } from "../lib";
 import { ciCommand } from "./ci";
+import { runWithReceipt } from "./push-gate";
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
 
 const ROOT = path.resolve(__dirname, "../../../../..");
@@ -190,6 +192,29 @@ describe("verified incremental push gates", () => {
     expect((await gate(cwd)).status).toBe(9);
     expect(fs.existsSync(receipt(cwd, code))).toBe(false);
   });
+  it("records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was", async () => {
+    const { cwd, code } = fixture(
+      "node -e \"const fs=require('fs'); if(fs.existsSync('.gate-ran')) process.exit(81); fs.writeFileSync('.gate-ran','yes')\"",
+    );
+    expect((await gate(cwd)).status).toBe(0);
+    const before = fs.readFileSync(receipt(cwd, code), "utf8");
+    expect((await gate(cwd)).status).toBe(81);
+    expect(fs.existsSync(`${receipt(cwd, code)}.failed`)).toBe(true);
+    expect(fs.existsSync(receipt(cwd, code))).toBe(false);
+    fs.writeFileSync(receipt(cwd, code), before);
+    fs.rmSync(`${receipt(cwd, code)}.failed`);
+    const status = runWithReceipt(
+      cwd,
+      UNIT,
+      [],
+      () => 81,
+      () => undefined,
+      (s) => s === 81,
+    );
+    expect(status).toBe(81);
+    expect(fs.readFileSync(receipt(cwd, code), "utf8")).toBe(before);
+    expect(fs.existsSync(`${receipt(cwd, code)}.failed`)).toBe(false);
+  });
   it("executes the full gate and carries its proof across bookkeeping and empty commits", async () => {
     const { cwd, code } = fixture();
     expect((await gate(cwd)).status).toBe(0);
@@ -271,7 +296,10 @@ describe("verified incremental push gates", () => {
     const { cwd, code, base } = fixture();
     expect((await gate(cwd)).status).toBe(0);
     const docs = book(cwd);
-    expect((await min(cwd, ZERO, docs)).status).toBe(1);
+    write(cwd, "src/code.ts", "after receipt\n");
+    const afterReceipt = commit(cwd);
+    expect((await min(cwd, ZERO, afterReceipt)).status).toBe(1);
+    git(cwd, "reset", "-q", "--hard", docs);
     git(cwd, "checkout", "-qb", "other", base);
     write(cwd, "src/code.ts", "rewritten\n");
     const rewrite = book(cwd);
@@ -282,6 +310,18 @@ describe("verified incremental push gates", () => {
     expect((await min(cwd, docs, newCode)).status).toBe(1);
     expect((await min(cwd, code, docs, `--update=${docs}:${newCode}`)).status).toBe(1);
   });
+  it(
+    "a new branch with only bookkeeping after a receipted ancestor takes the minimum gate",
+    async () => {
+      const { cwd } = fixture();
+      expect((await gate(cwd)).status).toBe(0);
+      book(cwd);
+      write(cwd, "docs/plans/202611/logs/test/more.md", "more\n");
+      const tip = commit(cwd);
+      expect((await min(cwd, ZERO, tip)).status).toBe(0);
+    },
+    tierTimeouts(true).testTimeout,
+  );
   it("invalidates proof when the gate definition changes", async () => {
     const { cwd, code } = fixture();
     expect((await gate(cwd)).status).toBe(0);
diff --git a/.bkit/core/engine/commands/ci/push-gate.ts b/.bkit/core/engine/commands/ci/push-gate.ts
index 3f75735f7..e04f32c29 100644
--- a/.bkit/core/engine/commands/ci/push-gate.ts
+++ b/.bkit/core/engine/commands/ci/push-gate.ts
@@ -43,33 +43,49 @@ const receiptPath = (cwd: string, sha: string): string | null => {
   return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
 };
 
-function cleanHead(cwd: string): { sha: string; tree: string } | null {
-  const status = git(cwd, [
-    "status",
-    "--porcelain",
-    "--untracked-files=all",
-    "--ignore-submodules=none",
-  ]);
-  if (status !== "") return null;
+const STATUS = ["status", "--porcelain", "--untracked-files=all", "--ignore-submodules=none"];
+const lineCount = (text: string | null): number =>
+  text === null ? -1 : text === "" ? 0 : text.split("\n").length;
+
+/** HEAD when every uncommitted path lies inside `tolerated` (none given: the tree must be clean). */
+function cleanHead(
+  cwd: string,
+  tolerated: readonly string[] = [],
+): { sha: string; tree: string } | null {
+  const all = lineCount(git(cwd, STATUS));
+  if (all < 0) return null;
+  if (all > 0) {
+    if (tolerated.length === 0) return null;
+    if (lineCount(git(cwd, [...STATUS, "--", ...tolerated])) !== all) return null;
+  }
   const sha = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
   const tree = git(cwd, ["rev-parse", "--verify", "HEAD^{tree}"]);
   return sha && tree ? { sha, tree } : null;
 }
 
-/** Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns proof. */
-export function runPushGate(cwd: string, gate: string, log: (message: string) => void): number {
+/**
+ * Run a gate through `run` and record its receipt: `.running` / `.failed` markers, the
+ * before/after HEAD and fingerprint check, and the receipt write. Uncommitted paths in
+ * `tolerated` do not block the receipt; a lock wait (`waited`, default never) leaves the receipt and markers as they were.
+ */
+export function runWithReceipt(
+  cwd: string,
+  gate: string,
+  tolerated: readonly string[],
+  run: () => number,
+  log: (message: string) => void,
+  waited: (status: number) => boolean = () => false,
+): number {
   const pkg = readPackageJson(cwd);
-  const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
-  if (typeof script !== "string" || script.trim() === "") {
-    log(`package.json must declare a non-empty ${gate} script`);
-    return EXIT.USAGE;
-  }
   const definition = pkg.ok ? gateDefinition(pkg.pkg) : null;
-  const before = cleanHead(cwd);
+  const before = cleanHead(cwd, tolerated);
   const head = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
   const file = head ? receiptPath(cwd, head) : null;
   const attempt =
     file && definition?.gate === gate ? path.join(`${file}.running`, randomUUID()) : null;
+  const priorReceipt = file && fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
+  const priorFailed =
+    file && fs.existsSync(`${file}.failed`) ? fs.readFileSync(`${file}.failed`, "utf-8") : null;
   const fail = () => {
     if (!attempt || !file) return;
     fs.mkdirSync(path.dirname(file), { recursive: true });
@@ -88,23 +104,20 @@ export function runPushGate(cwd: string, gate: string, log: (message: string) =>
     if (attempt) fs.rmSync(attempt, { force: true });
     return code;
   };
-  const argv = testCommand(scriptCommand(gate));
-  log(`running ${scriptCommand(gate).join(" ")}`);
-  const result = spawnSync(argv[0]!, argv.slice(1), {
-    cwd,
-    env: gitEnv(),
-    stdio: ["ignore", 2, 2],
-  });
-  const status = result.error
-    ? 127
-    : (result.status ??
-      128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
-  if (result.error) log(result.error.message);
+  const status = run();
+  if (waited(status)) {
+    if (attempt && file) {
+      if (priorReceipt !== null) fs.writeFileSync(file, priorReceipt);
+      if (priorFailed !== null) fs.writeFileSync(`${file}.failed`, priorFailed);
+      else fs.rmSync(`${file}.failed`, { force: true });
+    }
+    return finish(status);
+  }
   if (status !== 0 || !before || definition?.gate !== gate) {
     fail();
     return finish(status);
   }
-  const after = cleanHead(cwd);
+  const after = cleanHead(cwd, tolerated);
   const afterPkg = readPackageJson(cwd);
   if (
     after?.sha !== before.sha ||
@@ -128,6 +141,36 @@ export function runPushGate(cwd: string, gate: string, log: (message: string) =>
   return finish(status);
 }
 
+/** Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns proof. */
+export function runPushGate(cwd: string, gate: string, log: (message: string) => void): number {
+  const pkg = readPackageJson(cwd);
+  const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
+  if (typeof script !== "string" || script.trim() === "") {
+    log(`package.json must declare a non-empty ${gate} script`);
+    return EXIT.USAGE;
+  }
+  return runWithReceipt(
+    cwd,
+    gate,
+    [],
+    () => {
+      const argv = testCommand(scriptCommand(gate));
+      log(`running ${scriptCommand(gate).join(" ")}`);
+      const result = spawnSync(argv[0]!, argv.slice(1), {
+        cwd,
+        env: gitEnv(),
+        stdio: ["ignore", 2, 2],
+      });
+      if (result.error) log(result.error.message);
+      return result.error
+        ? 127
+        : (result.status ??
+            128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
+    },
+    log,
+  );
+}
+
 /** Pending files survive interrupted runners; one read suffices to block earlier proof. */
 function pendingAttempt(file: string): boolean {
   const dir = `${file}.running`;
@@ -190,11 +233,11 @@ export function hasVerifiedIncrement(
   newSha: string,
   outsideOf: (from: string, to: string) => { ok: true; outside: string[] } | { ok: false },
 ): boolean {
+  const isNew = /^0+$/.test(oldSha);
   if (
-    !SHA.test(oldSha) ||
+    (!isNew && !SHA.test(oldSha)) ||
     !SHA.test(newSha) ||
-    /^0+$/.test(oldSha) ||
-    !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok
+    (!isNew && !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok)
   )
     return false;
   const raw = git(cwd, ["show", `${newSha}:package.json`]);
@@ -207,8 +250,8 @@ export function hasVerifiedIncrement(
     gateDefinition(localPkg.pkg)?.fingerprint !== definition.fingerprint
   )
     return false;
-  const ancestors = git(cwd, ["rev-list", "--max-count=128", oldSha]);
-  const firstFile = receiptPath(cwd, oldSha);
+  const ancestors = git(cwd, ["rev-list", "--max-count=128", isNew ? newSha : oldSha]);
+  const firstFile = receiptPath(cwd, newSha);
   if (!ancestors || !firstFile) return false;
   const dir = path.dirname(firstFile);
   for (const sha of ancestors.split("\n")) {
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 51f40d364..d9c926533 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -903,6 +903,136 @@ describe("bkit tests run --changed-since", () => {
   );
 });
 
+describe("bkit tests run — push-gate receipt", () => {
+  const gitIn = (...args: string[]) => {
+    const r = spawnSync(
+      "git",
+      [
+        "-c",
+        "user.name=T",
+        "-c",
+        "user.email=t@example.invalid",
+        "-c",
+        "commit.gpgsign=false",
+        ...args,
+      ],
+      { cwd, encoding: "utf-8" },
+    );
+    expect(r.status, r.stderr).toBe(0);
+    return r.stdout.trim();
+  };
+  const head = () => gitIn("rev-parse", "HEAD");
+  const receipt = (sha: string) => path.join(cwd, ".git/bkit-outbox/push-gates", `${sha}.json`);
+  const repo = () => {
+    checkout(scripts({ [SHALLOW]: "x", [DEEP]: "y" }));
+    fs.writeFileSync(path.join(cwd, ".gitignore"), "logs/\n");
+    gitIn("add", "-A");
+    gitIn("commit", "-q", "-m", "base");
+  };
+  const write = (file: string, content: string) => {
+    fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
+    fs.writeFileSync(path.join(cwd, file), content);
+  };
+  const gateArgs = (gate: string) => [`--gate=${gate}`, "--log=logs/test.md"];
+  const timeout = tierTimeouts(true).testTimeout;
+
+  it(
+    "a passing required push gate records a receipt",
+    async () => {
+      repo();
+      const sha = head();
+      const r = await run(gateArgs(DEEP));
+      expect(r.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(true);
+      expect(JSON.parse(fs.readFileSync(receipt(sha), "utf-8"))).toMatchObject({
+        sha,
+        gate: DEEP,
+        passed: true,
+      });
+      expect(fs.existsSync(`${receipt(sha)}.failed`)).toBe(false);
+    },
+    timeout,
+  );
+
+  it(
+    "a passing required push gate with only bookkeeping uncommitted records a receipt",
+    async () => {
+      repo();
+      const sha = head();
+      write("docs/plans/202611/logs/x/status.jsonl", '{"type":"engine-call"}\n');
+      const r = await run(gateArgs(DEEP));
+      expect(r.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(true);
+    },
+    timeout,
+  );
+
+  it(
+    "a failing required push gate leaves the failed marker",
+    async () => {
+      repo();
+      const sha = head();
+      vi.stubEnv("FAKE_EXIT", "1");
+      const r = await run(gateArgs(DEEP));
+      expect(r.code).toBe(1);
+      expect(fs.existsSync(`${receipt(sha)}.failed`)).toBe(true);
+      expect(fs.existsSync(receipt(sha))).toBe(false);
+    },
+    timeout,
+  );
+
+  it(
+    "uncommitted code blocks the receipt until it is committed",
+    async () => {
+      repo();
+      write("src/code.ts", "export const a = 1;\n");
+      const first = await run(gateArgs(DEEP));
+      expect(first.code).toBe(0);
+      expect(fs.existsSync(receipt(head()))).toBe(false);
+      gitIn("add", "-A");
+      gitIn("commit", "-q", "-m", "code");
+      const sha = head();
+      const second = await run(gateArgs(DEEP));
+      expect(second.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(true);
+    },
+    timeout,
+  );
+
+  it(
+    "only the required push gate records a receipt",
+    async () => {
+      repo();
+      const sha = head();
+      const other = await run(gateArgs(SHALLOW));
+      expect(other.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(false);
+      const required = await run(gateArgs(DEEP));
+      expect(required.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(true);
+    },
+    timeout,
+  );
+
+  it(
+    "a tests-lock wait records no receipt and the re-run after the lock frees does",
+    async () => {
+      repo();
+      const sha = head();
+      vi.stubEnv("FAKE_LOCK_GIVEUP", "1");
+      const waited = await run([...gateArgs(DEEP), "--lock-wait-s=0"]);
+      expect(waited.code).toBe(81);
+      expect(fs.existsSync(receipt(sha))).toBe(false);
+      expect(fs.existsSync(`${receipt(sha)}.failed`)).toBe(false);
+      vi.stubEnv("FAKE_LOCK_GIVEUP", "");
+      const rerun = await run(gateArgs(DEEP));
+      expect(rerun.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(true);
+    },
+    timeout,
+  );
+});
+
 // ---------------------------------------------------------------------------
 // Test-first: red / green
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index bc1a00144..68d364fa1 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -70,6 +70,8 @@ import {
 import { writeStepRow } from "./steps.js";
 import { REPORT_ENV, countReportFailures, runTestFile, runToLog, type JunitCase } from "./junit.js";
 import { appendRecord, clampFile, type ClampRecord } from "./context.js";
+import { minPushPathspecs } from "../ci/ci.js";
+import { requiredPushGate, runWithReceipt } from "../ci/push-gate.js";
 import { testsBaseVerb } from "./tests-base.js";
 import { changedFiles, declares, testsChangedVerb } from "./tests-changed.js";
 import { testsJumpVerb } from "./tests-jump.js";
@@ -1828,16 +1830,35 @@ export const testsCommand: CommandSpec = {
         ctx.log(`running ${scope} — full output in ${logArg}`);
         const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
         const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
-        const exitCode = runToLog(
-          useChanged ? [...scriptCommand(gate), ...changed] : scriptCommand(gate),
-          top,
-          log,
-          {
-            [REPORT_DIR_ENV]: reports,
-            LOCAL_STACK_LOCK_WAIT_S: String(waitS),
-            LOCAL_STACK_LOCK_WHO: who,
-          },
-        );
+        const runGate = () =>
+          runToLog(
+            useChanged ? [...scriptCommand(gate), ...changed] : scriptCommand(gate),
+            top,
+            log,
+            {
+              [REPORT_DIR_ENV]: reports,
+              LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+              LOCAL_STACK_LOCK_WHO: who,
+            },
+          );
+        // The required full gate leaves a push receipt, so the branch's first push
+        // reuses it; bookkeeping paths may be uncommitted, as every engine call writes one.
+        const exitCode =
+          sinceRaw === undefined && gate === requiredPushGate(top)
+            ? runWithReceipt(
+                top,
+                gate,
+                minPushPathspecs(readBkitConfig(top)),
+                runGate,
+                ctx.log,
+                (code) =>
+                  classifyLockExit({
+                    exitCode: code,
+                    log: fs.readFileSync(log, "utf-8"),
+                    who,
+                  }) === "lock-wait",
+              )
+            : runGate();
         const logText = fs.readFileSync(log, "utf-8");
         const lockExit = classifyLockExit({ exitCode, log: logText, who });
         const lockWait = lockExit === "lock-wait";
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 4f3a83076..2c683f7ad 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -305,13 +305,13 @@ chmod +x .husky/pre-commit .husky/pre-push
 - Adapt: repo-only checks go below the bkit lines in each hook. What a gate runs belongs in the `bkit:gate:*` script, not the hook.
 - Min push:
   - **If** every file changed since each pushed commit left `origin/dev` (else `origin/main`) is one bkit writes or one `bkit.testing.minPushPaths` adds → `bkit:gate:min` replaces the full gate, and `MIN_PUSH=1`.
-  - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed.
-  - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
+  - The hook passes each remote-old and pushed-new commit as `bkit ci min-push --update=<old>:<new>`. A fast-forward bookkeeping increment also qualifies when a successful local full-gate receipt covers an ancestor of the old commit and every change since that checked commit is allowed. A new branch qualifies the same way: a receipt on an ancestor of the pushed commit, with only bookkeeping paths changed since it and no later failure, takes the minimum gate.
+  - `bkit ci push-gate --gate=<script>` runs the selected consumer script. A successful deepest full push gate records its clean, unchanged commit and script definitions in the repository's Git metadata. A failed or interrupted full check prevents reuse of earlier evidence until a later full check succeeds. `bkit tests run` records the same receipt when it runs the deepest full gate (build Step 12) without `--changed-since`; there, uncommitted paths inside the min-push (bookkeeping) paths do not block it, since every engine call appends to `status.jsonl`, and any uncommitted code, a lock wait (exit 81) or a lighter gate records none. Minimum and revert gates create no full-gate evidence. Receipts are local; a new clone starts without them.
   - What bkit writes = ship's `--scope=pr` allow-list (`.bkit/workflows.md` § `/bkit-ship` — 12 steps) plus `docs/plans/**` and `docs/audits/**`.
   - A change to a top-level `docs/templates/bkit-audit-*.md` also counts as written by bkit when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range, so only the `Project Instructions` section below it changed. A new, deleted or renamed template, a second marker line, or any change at or above the marker keeps the full gate. A template with CRLF line endings never qualifies, because a marker followed by `\r` is not line-anchored. Other templates, such as `docs/templates/bkit-plan.md`, keep the full gate. "What bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections.
   - The setting takes `package.json` globs: `*` matches one folder and `**` any depth. The default is `[]`, which leaves what bkit writes alone, because the setting only adds to it.
   - `bkit ci min-push` decides from files, never from `[skip ci]`, because that is a typed label and GitHub reads the last commit only.
-  - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch can still qualify from its complete bookkeeping-only branch diff.
+  - Empty trigger commits need checked-ancestor evidence. Missing evidence, unreadable ranges, rewritten history, or any outgoing ref carrying new code keeps the full gate. A new branch qualifies from a receipted ancestor plus bookkeeping-only commits, or from its complete bookkeeping-only branch diff; a new branch with code after the receipted ancestor keeps the full gate.
 - Min-push paths: list only files that no code, build or test reads.
   - The floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.
   - Never list `docs/**`, because a doc can be test input.
diff --git a/.bkit/version b/.bkit/version
index 7c36f0c00..d3408f737 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -205,7 +205,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
     "docs/templates/bkit-audit-agents.md": "b274136511b07082dc5f33bcbad7f95e36d3ce84b747e211b2cde3f183a375b9",
     "docs/templates/bkit-audit-prompts.md": "591c1a4a79bcfaabb7712d6c28cf88220d2186e77055db936d8a69287ec7d9ef",
-    ".bkit/templates.md": "cdc0fac03c69c78a12f1117a0819fc709a602a3e8aef47e14ee13099fbf4bb19",
+    ".bkit/templates.md": "dc06075ced31fbc518ef241d73237f4c42bc2cc1635d10429ed4015476bf9f13",
     "docs/templates/bkit-audit-adoption.md": "a0b56a7659e5d8a407c5b1c36201045d6a23e0a6f1b3353aa5e5f7d38c31fd9b",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "40c140b8c9d4e6d3ee91b8d106cbe78d1bff751343c4341668064decd0f4eb1e",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "6f0c596eb9878a4cdb8ee0b47af44524aa24bb1ba614173011ed5bd5ececf8dc",
+    ".bkit/workflows.md": "c9756b2d55c93d04c081d8ac2e7cf0a09e18fac84acd17e673def4867bf09112",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "c49a6b4aa6289f9eacf5cda6fced12a9811a244bd50948c2ef5cdb2741ea848f",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 2aae23e0b..1d1a78870 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -768,7 +768,7 @@ Verdict-bearing agents with a meaningful "addressable" middle state use the 3-wa

<!-- prettier-ignore -->
 | Agent | `Verdict` values | Routing |
 | --- | --- | --- |
 | `@bkit-build-plan-current` | PASS / CONCERNS / FAIL | PASS → Step 6. CONCERNS / FAIL → Step 6 too — advisory only: recorded on the `step-done` row, posted to the tracker with `Affected`, echoed as a console advisory, never blocking. The findings flow into Step 7: `@bkit-build-plan-tasks` reads `build-plan-current.md` and treats it as fact about the codebase, the plan as intent. Build never revises the plan file — that belongs to `/bkit-plan`, whose own close re-stamps the anchor. Never invokes `@bkit-plan-update`. |
-| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop, never asked while `build.verify.maxAttempts` allows; no round left → § Decision Pause (`VERIFY_GAPS`), or Failure Path for a group gate FAIL alone; FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. Holistic (Step 10): PASS, or CONCERNS with 0 failures → Step 11; other CONCERNS / FAIL → the same loop through `@bkit-build-plan-gaps-remediate` in holistic mode, counted since the last clean holistic round. |
+| `@bkit-build-plan-verify` | PASS / CONCERNS / FAIL | PASS → group gate (when a later group exists; § Group gate) → next group, or Step 10 when none is open; CONCERNS / group gate FAIL → `@bkit-build-plan-gaps-remediate` loop, never asked while `build.verify.maxAttempts` allows; no round left → § Decision Pause (`VERIFY_GAPS`), or Failure Path for a group gate FAIL alone; FAIL (any gap `Fixable: false`) → one fixable-only remediate when `Fixable: true` and a round is left, then § Decision Pause. Holistic (Step 10): PASS, or CONCERNS with 0 failures → Step 11; other CONCERNS / FAIL → the same loop through `@bkit-build-plan-gaps-remediate` in holistic mode, counted against the run-wide `build.holistic` allowance, with no reset after a clean check. |
 | `@bkit-build-challenge-1` / `-2` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the reports (one on a small change), `failures` = their sum; it records, it does not route. `bkit challenge merge` routes on the findings: `none` → Step 12; `fix` → Step 7 for the new last group the merge appended; `pause` → Decision Pause. Findings carry `class: mechanical \| architectural`; architectural → `**Fixable:** false`. |
 | `@bkit-design-review-1` / `-2` | PASS / CONCERNS / FAIL | `REVIEW_VERDICT` = worst-of-two. PASS / CONCERNS → Step 7 spike (`REVIEW_SPIKE` = true) else Step 8 apply-review; FAIL → Failure Path (design fundamentally not viable, human reframe required). `@bkit-design-review-1` additionally emits `Spike` (`true` / `false`) in its header — a routing flag, not a verdict; `REVIEW_SPIKE` gates Step 7 only and never contributes to `REVIEW_VERDICT`. |
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
@@ -971,7 +971,7 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 7 — Execute Plan | `@bkit-build-plan-tests`, then `@bkit-build-plan-tasks` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; each agent reads its brief, not the plan and not `build-input-{RUN}.md`. Tests half (§ Test-first): `bkit context brief --group --tests-only --file` writes `build-brief-tests-{GROUP}-{n}.md`, the open task blocks with a planned test left, the `Derived Test Matrix` rows naming their test files, no `Reuse Inventory` or `Architecture` entries; `tests` = 0 → nothing written, the tests half is skipped. `@bkit-build-plan-tests` writes the group's planned tests and nothing else (`steps finish --step=build-plan-tests --plan` refuses a diff touching a file no `TEST FIRST` line of the group names: exit 15, `source`, one re-ask), log `build-plan-tests-{GROUP}-log.md` (`WROTE` / `PASSES` / `BLOCKED` / `SOURCE` lines). Then the orchestrator runs `bkit tests red --group` once for the group: exit 0 or 3 → code half; exit 1 → the tests agent is re-invoked once with the red report, the second red's gaps stand and reach `tests green` as `unproven`, answered once at Step 15. Code half: `@bkit-build-plan-tasks`, per group `build-plan-tasks-{GROUP}-log.md`, attempt-numbered rows (`--attempt-of=build-plan-tasks:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source and never a planned test case (`steps finish` exit 11, `tests` naming each planned test whose own lines changed since its red, one re-ask; other tests in the same file are free). Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its briefs leaving out the `DONE` tasks and the tests already proved red; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
-| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; attempt-numbered `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the holistic rounds since the last clean one (`counters route --of=build-plan-verify-holistic:current --since-clean --point=build.verify`; clean = PASS, or CONCERNS with 0 failures, so a fix group's re-check gets a fresh allowance) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
+| 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; its tests run only for the files changed since the last holistic check that found no problems (`origin/dev` for the first check, so the first covers the whole feature diff); run-and-attempt-numbered `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the run's holistic fix rounds (`counters route --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`, one allowance per run with no reset after a clean check) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
 | 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → `counters progress --check=build-run-tests --fix=build-failure-remediate`: `trend` `stuck` or `worse` → § Decision Pause (`TESTS_LOOP`: Stop / Try again), else Step 13 without asking; none left → § Decision Pause (`TESTS_LOOP`) when `ask` is true in a session, else Failure Path. |
 | 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` (only if Step 12 FAIL) | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
@@ -998,7 +998,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
 - **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
-- **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic with `--since-clean`, so it counts only grants since the last clean holistic round); it writes a row only when the limit is used up and `ask` is true.
+- **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic counts the run's fix rounds against `build.holistic`); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
 - **Fixer reads the answer:** Step 9 and Step 10's fix round (`@bkit-build-plan-gaps-remediate`) and Step 13 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. Step 7's agents read a `Fix now` direction from the task block in their brief, and Steps 8-10 read the `Decision:` lines of the decision file. No subagent learns an owner's answer from a paraphrase in its `Context` (the build's **Owner decisions** contract line). The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
 - **Stop:** the owner says stop → decision file → `build-handover.md` → `workflows handover --push` (comment posted) → lock released → STOP with the run still `IN_PROGRESS`; no `workflows fail`, no `bkit:failed`. Next `/bkit-build` resumes at the open decision file and asks. The handover writes `owner-pause` too, so the wait until the resume counts as one owner stop; the resume's own `owner-pause` joins that open stop.
@@ -1011,14 +1011,15 @@ Every point where a run can ask the owner has two settings under `package.json`

<!-- prettier-ignore -->
 | Point | Default | Counts | Asks |
 | --- | --- | --- | --- |
 | `design.grill` | `{ "ask": true, "maxTurns": 6 }` | Interview turns, the draft acceptance turn included | Each turn's questions (§ `/bkit-design`, Grill) |
-| `build.verify` | `{ "ask": true, "maxAttempts": 2 }` | Verify rounds per group, and holistic rounds since the last clean holistic round | Every gap item: unfixable, unchanged by a fix round, or left after the last round |
+| `build.verify` | `{ "ask": true, "maxAttempts": 2 }` | Verify rounds per group | Every gap item: unfixable, unchanged by a fix round, or left after the last round |
+| `build.holistic` | `{ "ask": true, "maxAttempts": 2 }` | Holistic fix rounds across the run, never reset after a clean check | Loop question before a further fix round once the limit is used up; every gap item: unfixable, unchanged by a fix round, or left after the last round |
 | `build.challenge` | `{ "ask": true, "maxAttempts": 2 }` | Challenge rounds | Every finding item |
 | `build.tests` | `{ "ask": true, "maxAttempts": 2 }` | Test rounds | Loop question before a further fix round, only when `counters progress` `trend` is `stuck` or `worse` |
 | `debug.fix` | `{ "ask": true, "maxAttempts": 2 }` | Remediate rows across every debug run of the feature | `Q1 — Fix: … Stop here instead of another fix attempt?`, only when `trend` is `stuck` or `worse` |
 | `debug.soak` | `{ "ask": true, "maxAttempts": 2 }` | Soak rows across every debug run of the feature | `Q1 — Soak: …` before the first and each further soak attempt, only when `trend` is `stuck` or `worse` |
 | `ship.merge` | `{ "ask": true, "maxAttempts": 2 }` | Failed arrivals at Step 10: gate refusals plus failed merges | `Q1 — Merge: …` when the allowance is used up on a refusal |
 
-- **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
+- **A used-up limit asks:** with `ask` true and not headless, a used-up `build.verify`, `build.holistic`, `build.tests`, `debug.soak` or `ship.merge` limit goes to a question, never straight to the Failure Path (debug fix → SOAK first). The owner's go-on answer (`Fix now`, `Try again`, or `Accept` at a verify pause) runs `bkit counters grant`, which appends one `allowance-granted` row: that loop alone, and that group alone for verify, gets one more full allowance of `maxAttempts`. The limit becomes `maxAttempts x (1 + grants)`, read by `counters route` / `counters max` (`grants`, `allowance`) and by `challenge merge --round`; once the new allowance is used up too, the run asks again. `grant` refuses below the limit (`below-limit`) or with `ask` false (`ask-off`), exit 1, nothing written. `ask` false or headless → a used-up limit goes to the Failure Path. A question never resets a count. `build.challenge` never fails at its limit: the last round's fixes are not challenged again.
 - **Limits are fixed for the run:** `workflows start` copies the workflow's own points into the `workflow-started` row's `limits`. `counters route --point= --file= --workflow=` reads that copy and prints `limitsFrom` = `run`; a run with no copy for the point reads `package.json` (`limitsFrom` = `package.json`). `counters max --point= --file= --workflow=` reads the same copy; without `--file` it reads `package.json`. A step commit never changes them: `steps finish` with `--commit=auto` refuses when `package.json` `bkit.workflows` differs from `HEAD` → exit 13, nothing written, `changed` names each dotted key. In a shared checkout a `package.json` already dirty when the run started is not the step's: the commit leaves it out, so it is not checked.
 - **Headless** (`runtimeHeadless` true, GitHub Actions only) behaves as `ask: false` at every point. `bkit counters route` and `counters max` print `ask` already false when headless.
 - **`ask: false`:** loop questions take the recommendation; `Fix now` is applied; `Accept` is recorded as assumed. Hard blockers are still asked in a session and go to the Failure Path headless.
@@ -1715,7 +1716,7 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
 | `bkit:gate:min` | `pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `.husky/pre-push` on a min push; bookkeeping landings through `pushToDev` |
 | `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
-| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 8 (group gate), build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
+| `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
 | `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Step 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — the gate above plus E2E; runs every tier after a red one (Tier order, below) | debug Step 3 |
 | `bkit:gate:static-unit-integration-e2e-live` | not seeded — chains the gate above | debug Step 3 |
@@ -1749,7 +1750,7 @@ Not seeded, because which files a stack generates is the stack's business. A reg
 - **No files changed:** nothing runs, exit 0.
 - **Undeclared:** the `--fallback` gate runs whole, with no arguments: `bkit:gate:static` for `@bkit-build-plan-tasks`, `bkit:gate:static-unit` for the others.
 
-Not seeded, because finding the tests a file affects is the stack's job; the `gate-changed-script-missing` advisory (install, `bkit check`, `bkit upgrade`) hands over the line until it is declared or named in `bkit.advisories.ignore`. The orchestrator's gates (build Step 8 and Step 12, debug Step 3, `.husky/pre-push`, CI) still run whole gates.
+Not seeded, because finding the tests a file affects is the stack's job; the `gate-changed-script-missing` advisory (install, `bkit check`, `bkit upgrade`) hands over the line until it is declared or named in `bkit.advisories.ignore`. The orchestrator's full-suite gates (build Step 12, debug Step 3, `.husky/pre-push`, CI) still run whole gates. `tests run --changed-since={sha}` runs `bkit:gate:changed` on the files changed since that commit (build Step 8 group gate, holistic checks) and passes them as arguments; its vitest stages inherit `$BKIT_TEST_REPORT_DIR`, so a failure count survives.
 
 Agents and humans run the same scripts, so a green agent gate and a green `git push` mean the same thing. `bkit-ci.yml` deliberately stays off them: it needs per-step reporting, affected-package conditionals, and the heavier tiers the local gate excludes, so it calls `pnpm typecheck` / `pnpm test` / … directly.
 
@@ -1757,7 +1758,7 @@ Agents and humans run the same scripts, so a green agent gate and a green `git p
 
 The three deep gates are not seeded: a seeded `pnpm test:integration` hard-fails every repo without that tier, and a gate named `…-integration-e2e` that skipped them silently is the false-green this design exists to kill. Declaring one — a single line chaining its parent — is how a consumer opts a workflow into a deeper tier.
 
-Build Step 12 and debug each run the deepest gate the consumer declares, and record its name; the build group gate runs `bkit:gate:static-unit` alone (§ Group gate):
+Build Step 12 and debug each run the deepest gate the consumer declares, and record its name; the build group gate runs only the files the group changed (§ Group gate):
 
 <!-- prettier-ignore -->
 | Workflow | Candidates, descending | Stops at |
@@ -1777,10 +1778,10 @@ Build does not run the live tier (post-merge `bkit-tests-live` canary). Every `b
 
 ### Group gate
 
-Build Step 8 runs `bkit:gate:static-unit` (static checks and the unit tier) after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it, because Steps 10 + 12 follow.
+Build Step 8 runs `bkit:gate:static-unit` on the files the group changed (`tests run --changed-since={GROUP_BASE}`; the whole suite runs once, at Step 12) after every group but the last, once `@bkit-build-plan-verify` passes. Red → Step 9 under `build.verify.maxAttempts`, like a verify gap; the next group never starts on a broken tree. The last group skips it, because Steps 10 + 12 follow.
 
 - **Orchestrator-owned:** agent gate runs (execute, gaps-remediate, verify) are self-reported in their logs; the group gate writes a `build-group-gate` row (`verdict`, `scope`), so a skipped gate is visible.
-- **Unit tier only:** includes the coverage floor where the consumer chains one into `bkit:gate:static-unit`, never integration. Integration runs once, at Step 12, then again at pre-push and in CI before anything merges. Each group gate re-runs the whole suite, so integration there multiplies its cost by the group count, while unit tests import the same code and catch most breaks a later group would hit. Cost: an integration-only break surfaces at Step 12 against the whole diff, fixed by the Steps 13-14 diagnose and fix rounds; the failing test names the area.
+- **Unit tier only:** includes the coverage floor where the consumer chains one into `bkit:gate:static-unit`, never integration. Integration runs once, at Step 12, then again at pre-push and in CI before anything merges. A group gate that re-ran the whole suite would multiply its cost by the group count, so it tests only the group's own changes, while unit tests import the same code and catch most breaks a later group would hit. Cost: an integration-only break surfaces at Step 12 against the whole diff, fixed by the Steps 13-14 diagnose and fix rounds; the failing test names the area.
 - **Strict, no exceptions:** the end of a group is where a build can stop (verify budget exhausted, session lost, `/bkit-ship` resume) → it must hold a tree that passes the unit gate. No expected-red declaration. A red gate is an ordering defect (signature change split from callers, deletion before replacement, tests deferred to a later task): `@bkit-plan-generate` orders its groups to keep every group gate green, putting the tasks in one group when it cannot. A red gate whose failing tests also fail on the base commit is not an ordering defect of the branch: the pause says so and recommends `Stop`, the owner fixes `dev` (adopt mode: merges `dev` into the branch) and resumes, and the resume re-runs the gate.
 
 ### Test-first
@@ -1850,6 +1851,7 @@ Verify→remediate and diagnose→fix loops carry context through per-attempt lo

<!-- prettier-ignore -->
 | Verifier / checker | Remediator | Max attempts | Escalation |
 | --- | --- | --- | --- |
 | `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `build.verify.maxAttempts` (2) rounds per group, never reset; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause on the open gaps with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
+| `@bkit-build-plan-verify` (holistic) | `@bkit-build-plan-gaps-remediate` (holistic) | `build.holistic.maxAttempts` (2) fix rounds per run, never reset after a clean check; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | `bkit challenge gate` → `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` when large (parallel) → `bkit challenge merge` | `@bkit-build-plan-tasks` (the merged findings are plan tasks) | `build.challenge.maxAttempts` (2) rounds (`CHALLENGE_ROUND`): earlier rounds may fix on their own; the last never does | `**Fixable:** false` tasks, last-round tasks, or too many findings → Decision Pause; the last round's fixes are not challenged again |
 | Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse` (`unknown` is fixed without asking); limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `debug.fix.maxAttempts` (2) then `debug.soak.maxAttempts` (2), each counted across every debug run of the feature | Further attempts taken without asking; Loop Question only when `trend` is `stuck` or `worse`; fix used up → SOAK; soak used up → Loop Question when `debug.soak.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
diff --git a/DETAILS.md b/DETAILS.md
index 19d2fd98b..5c8de0ba1 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,17 +347,17 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1856 symbols · 54 files"]
-    n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
+    n_bkit_core_engine_commands["commands<br/>1859 symbols · 54 files"]
+    n_bkit_core_engine_install["install<br/>360 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>156 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|465| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
+  n_bkit_core_engine_install -->|182| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
diff --git a/dist/commands/ci/push-gate.js b/dist/commands/ci/push-gate.js
index cafeca33b..a4a5bafed 100644
--- a/dist/commands/ci/push-gate.js
+++ b/dist/commands/ci/push-gate.js
@@ -41,32 +41,37 @@ const receiptPath = (cwd, sha) => {
     const outbox = outboxRoot(cwd);
     return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
 };
-function cleanHead(cwd) {
-    const status = git(cwd, [
-        "status",
-        "--porcelain",
-        "--untracked-files=all",
-        "--ignore-submodules=none",
-    ]);
-    if (status !== "")
+const STATUS = ["status", "--porcelain", "--untracked-files=all", "--ignore-submodules=none"];
+const lineCount = (text) => text === null ? -1 : text === "" ? 0 : text.split("\n").length;
+/** HEAD when every uncommitted path lies inside `tolerated` (none given: the tree must be clean). */
+function cleanHead(cwd, tolerated = []) {
+    const all = lineCount(git(cwd, STATUS));
+    if (all < 0)
         return null;
+    if (all > 0) {
+        if (tolerated.length === 0)
+            return null;
+        if (lineCount(git(cwd, [...STATUS, "--", ...tolerated])) !== all)
+            return null;
+    }
     const sha = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
     const tree = git(cwd, ["rev-parse", "--verify", "HEAD^{tree}"]);
     return sha && tree ? { sha, tree } : null;
 }
-/** Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns proof. */
-export function runPushGate(cwd, gate, log) {
+/**
+ * Run a gate through `run` and record its receipt: `.running` / `.failed` markers, the
+ * before/after HEAD and fingerprint check, and the receipt write. Uncommitted paths in
+ * `tolerated` do not block the receipt; a lock wait (`waited`, default never) leaves the receipt and markers as they were.
+ */
+export function runWithReceipt(cwd, gate, tolerated, run, log, waited = () => false) {
     const pkg = readPackageJson(cwd);
-    const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
-    if (typeof script !== "string" || script.trim() === "") {
-        log(`package.json must declare a non-empty ${gate} script`);
-        return EXIT.USAGE;
-    }
     const definition = pkg.ok ? gateDefinition(pkg.pkg) : null;
-    const before = cleanHead(cwd);
+    const before = cleanHead(cwd, tolerated);
     const head = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
     const file = head ? receiptPath(cwd, head) : null;
     const attempt = file && definition?.gate === gate ? path.join(`${file}.running`, randomUUID()) : null;
+    const priorReceipt = file && fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
+    const priorFailed = file && fs.existsSync(`${file}.failed`) ? fs.readFileSync(`${file}.failed`, "utf-8") : null;
     const fail = () => {
         if (!attempt || !file)
             return;
@@ -84,24 +89,23 @@ export function runPushGate(cwd, gate, log) {
             fs.rmSync(attempt, { force: true });
         return code;
     };
-    const argv = testCommand(scriptCommand(gate));
-    log(`running ${scriptCommand(gate).join(" ")}`);
-    const result = spawnSync(argv[0], argv.slice(1), {
-        cwd,
-        env: gitEnv(),
-        stdio: ["ignore", 2, 2],
-    });
-    const status = result.error
-        ? 127
-        : (result.status ??
-            128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
-    if (result.error)
-        log(result.error.message);
+    const status = run();
+    if (waited(status)) {
+        if (attempt && file) {
+            if (priorReceipt !== null)
+                fs.writeFileSync(file, priorReceipt);
+            if (priorFailed !== null)
+                fs.writeFileSync(`${file}.failed`, priorFailed);
+            else
+                fs.rmSync(`${file}.failed`, { force: true });
+        }
+        return finish(status);
+    }
     if (status !== 0 || !before || definition?.gate !== gate) {
         fail();
         return finish(status);
     }
-    const after = cleanHead(cwd);
+    const after = cleanHead(cwd, tolerated);
     const afterPkg = readPackageJson(cwd);
     if (after?.sha !== before.sha ||
         after.tree !== before.tree ||
@@ -119,6 +123,30 @@ export function runPushGate(cwd, gate, log) {
     }
     return finish(status);
 }
+/** Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns proof. */
+export function runPushGate(cwd, gate, log) {
+    const pkg = readPackageJson(cwd);
+    const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
+    if (typeof script !== "string" || script.trim() === "") {
+        log(`package.json must declare a non-empty ${gate} script`);
+        return EXIT.USAGE;
+    }
+    return runWithReceipt(cwd, gate, [], () => {
+        const argv = testCommand(scriptCommand(gate));
+        log(`running ${scriptCommand(gate).join(" ")}`);
+        const result = spawnSync(argv[0], argv.slice(1), {
+            cwd,
+            env: gitEnv(),
+            stdio: ["ignore", 2, 2],
+        });
+        if (result.error)
+            log(result.error.message);
+        return result.error
+            ? 127
+            : (result.status ??
+                128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
+    }, log);
+}
 /** Pending files survive interrupted runners; one read suffices to block earlier proof. */
 function pendingAttempt(file) {
     const dir = `${file}.running`;
@@ -163,10 +191,10 @@ function noLaterFailure(cwd, dir, sha, newSha, definition) {
 }
 /** A bounded ancestor search; absent, malformed or stale proof always requires the full gate. */
 export function hasVerifiedIncrement(cwd, oldSha, newSha, outsideOf) {
-    if (!SHA.test(oldSha) ||
+    const isNew = /^0+$/.test(oldSha);
+    if ((!isNew && !SHA.test(oldSha)) ||
         !SHA.test(newSha) ||
-        /^0+$/.test(oldSha) ||
-        !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok)
+        (!isNew && !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok))
         return false;
     const raw = git(cwd, ["show", `${newSha}:package.json`]);
     const parsed = raw === null ? null : parseJson(raw);
@@ -176,8 +204,8 @@ export function hasVerifiedIncrement(cwd, oldSha, newSha, outsideOf) {
         !localPkg.ok ||
         gateDefinition(localPkg.pkg)?.fingerprint !== definition.fingerprint)
         return false;
-    const ancestors = git(cwd, ["rev-list", "--max-count=128", oldSha]);
-    const firstFile = receiptPath(cwd, oldSha);
+    const ancestors = git(cwd, ["rev-list", "--max-count=128", isNew ? newSha : oldSha]);
+    const firstFile = receiptPath(cwd, newSha);
     if (!ancestors || !firstFile)
         return false;
     const dir = path.dirname(firstFile);
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 1668fec03..0cd259f41 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -33,6 +33,8 @@ import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks
 import { writeStepRow } from "./steps.js";
 import { REPORT_ENV, countReportFailures, runTestFile, runToLog } from "./junit.js";
 import { appendRecord, clampFile } from "./context.js";
+import { minPushPathspecs } from "../ci/ci.js";
+import { requiredPushGate, runWithReceipt } from "../ci/push-gate.js";
 import { testsBaseVerb } from "./tests-base.js";
 import { changedFiles, declares, testsChangedVerb } from "./tests-changed.js";
 import { testsJumpVerb } from "./tests-jump.js";
@@ -1398,11 +1400,20 @@ export const testsCommand = {
                 ctx.log(`running ${scope} — full output in ${logArg}`);
                 const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
                 const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
-                const exitCode = runToLog(useChanged ? [...scriptCommand(gate), ...changed] : scriptCommand(gate), top, log, {
+                const runGate = () => runToLog(useChanged ? [...scriptCommand(gate), ...changed] : scriptCommand(gate), top, log, {
                     [REPORT_DIR_ENV]: reports,
                     LOCAL_STACK_LOCK_WAIT_S: String(waitS),
                     LOCAL_STACK_LOCK_WHO: who,
                 });
+                // The required full gate leaves a push receipt, so the branch's first push
+                // reuses it; bookkeeping paths may be uncommitted, as every engine call writes one.
+                const exitCode = sinceRaw === undefined && gate === requiredPushGate(top)
+                    ? runWithReceipt(top, gate, minPushPathspecs(readBkitConfig(top)), runGate, ctx.log, (code) => classifyLockExit({
+                        exitCode: code,
+                        log: fs.readFileSync(log, "utf-8"),
+                        who,
+                    }) === "lock-wait")
+                    : runGate();
                 const logText = fs.readFileSync(log, "utf-8");
                 const lockExit = classifyLockExit({ exitCode, log: logText, who });
                 const lockWait = lockExit === "lock-wait";
diff --git a/docs/capabilities.md b/docs/capabilities.md
index fd3a10706..2669f01cf 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,17 +164,17 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1856 symbols · 54 files"]
-    n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
+    n_bkit_core_engine_commands["commands<br/>1859 symbols · 54 files"]
+    n_bkit_core_engine_install["install<br/>360 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>156 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|465| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
+  n_bkit_core_engine_install -->|182| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
@@ -300,7 +300,7 @@ flowchart LR
       subgraph gn_bkit_core_engine_commands_ci[".bkit/core/engine/commands/ci"]
         n_bkit_core_engine_commands_ci_ci["ci<br/>46 symbols · 1 files"]
         n_bkit_core_engine_commands_ci_pins["pins<br/>10 symbols · 1 files"]
-        n_bkit_core_engine_commands_ci_push_gate["push-gate<br/>11 symbols · 1 files"]
+        n_bkit_core_engine_commands_ci_push_gate["push-gate<br/>14 symbols · 1 files"]
       end
       n_bkit_core_engine_commands_install_doctor[".bkit/core/engine/commands/install/doctor<br/>6 symbols · 1 files"]
       n_bkit_core_engine_commands_land["land<br/>16 symbols · 1 files"]
@@ -347,7 +347,7 @@ flowchart LR
         n_bkit_core_engine_install_modules_antigravity["antigravity<br/>7 symbols · 1 files"]
         n_bkit_core_engine_install_modules_claude["claude<br/>6 symbols · 1 files"]
         n_bkit_core_engine_install_modules_codex["codex<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_install_modules_core["core<br/>79 symbols · 1 files"]
+        n_bkit_core_engine_install_modules_core["core<br/>80 symbols · 1 files"]
         n_bkit_core_engine_install_modules_cursor["cursor<br/>3 symbols · 1 files"]
         n_bkit_core_engine_install_modules_opencode["opencode<br/>10 symbols · 1 files"]
       end
@@ -452,6 +452,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tests -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_tracker -->|13| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
+  n_bkit_core_engine_install_modules_core -->|13| n_bkit_core_engine_shared_json
   n_bkit_core_engine_render_hosts -->|13| n_bkit_core_engine_render_models
   n_bkit_core_engine_checks_tips_catalogue -->|13| n_bkit_core_engine_checks_tips_detect
   n_bkit_core_engine_commands_ci_push_gate -->|12| n_bkit_core_engine_commands_lib
@@ -461,7 +462,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_context -->|12| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_repo -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|12| n_bkit_core_engine_commands_workflow_ledgers
-  n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
@@ -566,6 +566,7 @@ flowchart LR
   n_bkit_core_engine_checks_before_files -->|6| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_checks_before_repo -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_tips_index -->|6| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_ci_push_gate -->|6| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_install -->|6| n_bkit_core_engine_commands_install_uninstall
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_install_managed_block
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_shared_json
@@ -783,7 +784,7 @@ flowchart LR
   linkStyle 75 stroke:#59636e,stroke-width:6px
   linkStyle 76 stroke:#59636e,stroke-width:6px
   linkStyle 77 stroke:#59636e,stroke-width:6px
-  linkStyle 78 stroke:#59636eb3,stroke-width:3px
+  linkStyle 78 stroke:#59636e,stroke-width:6px
   linkStyle 79 stroke:#59636eb3,stroke-width:3px
   linkStyle 80 stroke:#59636eb3,stroke-width:3px
   linkStyle 81 stroke:#59636eb3,stroke-width:3px
@@ -925,4 +926,5 @@ flowchart LR
   linkStyle 217 stroke:#59636e80,stroke-width:2px
   linkStyle 218 stroke:#59636e80,stroke-width:2px
   linkStyle 219 stroke:#59636e80,stroke-width:2px
+  linkStyle 220 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/deployments.md b/docs/deployments.md
index 0ff38ef3e..7e2e56e51 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -538,7 +538,7 @@ Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs against `dev` imm
 
 ### Pre-push checklist
 
-The full pre-push gate checks the same static, unit and integration tiers as CI. `.husky/pre-push` runs `bkit check` first, then calls `bkit ci push-gate` with `bkit:gate:static-unit-integration`, which chains `bkit:gate:static-unit`. Revert and minimum-gate selection are described below. The table groups checks by purpose; it is not their execution order.
+The full pre-push gate checks the same static, unit and integration tiers as CI. `.husky/pre-push` runs `bkit check` first, then calls `bkit ci push-gate` with `bkit:gate:static-unit-integration`, which chains `bkit:gate:static-unit`. Build Step 12 runs the same deepest gate through `bkit tests run` and records the same receipt, so the first push of a build branch skips this gate when only bookkeeping commits follow the Step 12 commit; any code change after it runs the full gate. Revert and minimum-gate selection are described below. The table groups checks by purpose; it is not their execution order.
 
 <!-- prettier-ignore -->
 | # | Gate | Command | Hook block | Failure mode |
@@ -576,7 +576,7 @@ The guard reads the PR number from the shared open-PR lookup that also feeds the
 
 **Revert-branch bypass:** `revert-*` branch or HEAD subject `Revert "` → run `pnpm bkit:gate:static` instead of the full gate, dropping the test suites. Gates 5-9 still run unless the push qualifies for the minimum gate. Rollback trees can be temporarily inconsistent, and surviving tests may reference deleted files.
 
-**Min push:** every changed file is one bkit writes (`.bkit/templates.md` § Git hooks — Husky) or one `bkit.testing.minPushPaths` adds (bkit's own `package.json`: `docs/**`) → `bkit:gate:min` only (format, tables, prose, bkit:slop:delta, ledger-integrity, and the installed audit-template tests `templates.test.ts` and `template-no-userpath.test.ts`, which read text below `<!-- bkit:end -->`); `bkit:check:dist` + actionlint skipped. The hook classifies every outgoing old/new pair, including bookkeeping increments over a locally checked ancestor. `bkit ci push-gate` executes the chosen script and records successful full checks; the receipt and fallback contract lives in `.bkit/templates.md` § Git hooks. Files and evidence decide, never a commit subject. The `dev` / `main` skip-CI guard remains based on the complete branch diff, independently of the local minimum-gate decision.
+**Min push:** every changed file is one bkit writes (`.bkit/templates.md` § Git hooks — Husky) or one `bkit.testing.minPushPaths` adds (bkit's own `package.json`: `docs/**`) → `bkit:gate:min` only (format, tables, prose, bkit:slop:delta, ledger-integrity, and the installed audit-template tests `templates.test.ts` and `template-no-userpath.test.ts`, which read text below `<!-- bkit:end -->`); `bkit:check:dist` + actionlint skipped. The hook classifies every outgoing old/new pair, including bookkeeping increments over a locally checked ancestor and a new branch whose only commits after a receipted ancestor (such as build's Step 12 run) are bookkeeping. `bkit ci push-gate` executes the chosen script and records successful full checks; the receipt and fallback contract lives in `.bkit/templates.md` § Git hooks. Files and evidence decide, never a commit subject. The `dev` / `main` skip-CI guard remains based on the complete branch diff, independently of the local minimum-gate decision.
 
 Pre-commit: `pnpm bkit:gate:format` — prettier over staged files, seconds. Prose is not here: `bkit:lint:prose` scans a fixed whole-repo file set, so it gates at pre-push inside `bkit:gate:static`. Enforcing slop gate: pre-push `pnpm bkit:slop:delta` via the same gate (Gate 6); `pnpm lint:slop` is report-only and sits in no lane. CI re-runs bkit:lint:prose + bkit:slop:delta in `bkit-tests-static`.
 
