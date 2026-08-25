Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Review — `@bkit-plan-review-2`

**Lens:** Task dependency correctness and build-execution safety. Verifies the dependency graph between tasks is sound, each task has a clear single-owner file surface, verification steps actually prove intent, and the plan is executable by a build agent without ambiguity.

**Files reviewed:** `plan-v1-draft.md`, `plan-input.md`, `related-issues.md`, `related-deferrals.md`, `related-failures.md`, `.github/workflows/bkit-cloud.yml`, `.bkit/workflows/bkit-auto.md`, `.bkit/workflows/bkit-debug.md`, `.bkit/workflows/bkit-ship.md`, `.bkit/scripts/bkit-counter-bus-config.sh`, `.bkit/scripts/bkit-counter-bus.sh`.

**Verdict rationale:** No CRITICAL findings. Multiple HIGH findings on undeclared task dependencies and undefined shell variables that would cause the build agent's first execution of the affected task to fail at runtime under `set -euo pipefail`. The plan's intent is correct and surgical, but several snippets are non-executable as written. A build agent that reorders Task 3 before Task 2, swaps `$REPO_ROOT` for `$GITHUB_WORKSPACE`, and drops the dead `MODE=CI_DEV` check in bkit-debug can recover mechanically; without those adjustments the build will hard-fail.

---

## Findings Log

### HIGH 1 — Task 2 has an undeclared dependency on Task 3 (`MAX_DEV_DISPATCH_ATTEMPTS`)

**Class:** mechanical (dependency declaration).

**Location:** `plan-v1-draft.md` Task 2 lines 442-446 ("Loop cap: source `bkit-counter-bus-config.sh`, count `dev-dispatch` rows, compare to `MAX_DEV_DISPATCH_ATTEMPTS`"); Task 3 lines 449-455 (adds the constant); header line 424 ("Gate 2 — each task is independently executable").

**Exploit scenario (build-execution failure):** The plan asserts all tasks are "independently executable". A build agent that picks Task 2 first (it appears earlier than Task 3 in the runbook) sources `bkit-counter-bus-config.sh` per the spec at the top of the ctx step `run:` block, then later executes `[ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]`. Under the existing ctx step's `set -euo pipefail` (`.github/workflows/bkit-cloud.yml:169`), the unset `MAX_DEV_DISPATCH_ATTEMPTS` triggers either:

- `set -u`: "unbound variable" → ctx step exits non-zero → `enabled` job fails before dispatch.
- if `set -u` is bypassed: `[ "0" -ge "" ]` → "integer expression expected" exit 2 → under `set -e` → ctx step fails.

Either path produces a red cloud job on the first `dev`-CI-fail run; the operator gets a failure notice with no dispatch.

**Suggested fix:** Add an explicit `Depends on: Task 3` field to Task 2 (and reorder Task 3 before Task 2 in the runbook, or state the ordering constraint in the Gate 2 preamble). Symmetrically, declare Task 4 → Task 2 (the CI_DEV branch in `bkit-auto` is dead code without the ctx step dispatching non-numeric ARG) and Task 5 → Task 4 (bkit-debug's CI_DEV path is reachable only via bkit-auto's CI_DEV dispatch).

---

### HIGH 2 — `MODE=CI_DEV` has no propagation mechanism from `bkit-auto` to `bkit-debug`; the explicit check in Task 5 is dead code

**Class:** architectural (variable propagation contract).

**Location:** Task 5 lines 470-475; spec lines 331-343 (bkit-debug Step 2 branch selection).

**Exploit scenario (dead code / future maintainer confusion):** Task 4 sets `MODE=CI_DEV` inside `bkit-auto.md` Step 1 substep 2 when ARG is non-numeric. bkit-auto then dispatches `/bkit-debug {FID}` via the `Skill` tool (bkit-auto.md:167). No env var, status row, or argument carries `MODE` across the dispatch boundary. In `bkit-debug.md`, the variable `MODE` is never set (the workflow uses `DEBUG_MODE` and `PUSH_MODE`); the plan's snippet `if [ "$MODE" = "CI_DEV" ] || ! git fetch origin "feat/{FID}" 2>/dev/null` therefore always falls through to the second branch. The post-merge case is still handled correctly because the existing 3-way fallback at `.bkit/workflows/bkit-debug.md:319-327` (`feat/{FID}` deleted → `fix/{FID} off origin/dev`) already covers it. The plan's added `MODE=CI_DEV` check is unreachable code that misleads future maintainers into thinking a mode flag is wired when it isn't.

**Suggested fix:** Either (a) drop the `MODE=CI_DEV` disjunct from the bkit-debug branch-selection snippet and rely on the existing 3-way fallback (the `dev-dispatch` telemetry write is the only new code actually needed in bkit-debug); or (b) specify a propagation mechanism — e.g. bkit-auto writes a `ci-dev-dispatch` row to status.jsonl at dispatch time, and bkit-debug detects it via `route_get_*` (mirroring the existing `route_get_debug_mode` pattern at bkit-debug.md:498). Option (a) is strictly less code and matches the in-tree reality.

---

### HIGH 3 — Task 2 ctx-step snippet uses undefined `$REPO_ROOT`

**Class:** mechanical (shell variable).

**Location:** Task 2 line 445 ("Source `bkit-counter-bus-config.sh` at the top of the ctx step run block"); spec snippet line 279 `. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"`.

**Exploit scenario (build-execution failure):** The existing ctx step at `.github/workflows/bkit-cloud.yml:168-227` defines only the env vars listed in the `env:` block (`GH_TOKEN`, `EVENT`, `IN_PHASE`, `IN_ISSUE`, `CONCLUSION`, `BRANCH`). `$REPO_ROOT` is never derived. With `set -euo pipefail` (line 169), `. "$REPO_ROOT/.bkit/scripts/..."` aborts on the unbound variable before any `dev`-branch logic runs. (Contrast: bkit-debug/bkit-ship define `REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")` in their first step; cloud.yml does not.)

**Suggested fix:** In the snippet, source with the GHA-canonical workspace path: `. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` (GHA guarantees `GITHUB_WORKSPACE` is the checkout root, and the existing `actions/checkout@v4` with `ref: dev` places the repo there). Alternatively, derive it once at the top of the run block: `REPO_ROOT="$GITHUB_WORKSPACE"`.

---

### MEDIUM 4 — Task 2 `gh api` fallback uses literal `{owner}/{repo}` placeholders → 404

**Class:** mechanical (API call).

**Location:** Spec snippet line 262 `PR_BODY=$(gh api "repos/{owner}/{repo}/commits/$HEAD_SHA/pulls" --jq '.[0].body // empty' 2>/dev/null || echo "")`.

**Exploit scenario (silent fallback failure → fail-safe no-op):** The existing cloud.yml ctx step uses `gh pr list` / `gh pr view` / `gh issue view` (lines 182, 193, 208), which rely on `gh`'s implicit repo resolution from the git remote. The plan introduces `gh api "repos/{owner}/{repo}/..."` with literal brace placeholders. `gh api` does NOT interpolate `{owner}`/`{repo}` — these are passed through as URL path segments, the request hits `/repos/{owner}/{repo}/commits/$SHA/pulls` (literal), returns 404, the `2>/dev/null || echo ""` swallows it, `PR_BODY` becomes empty, the fallback `FID=$(echo "" | grep ...)` returns empty, the FID slug assertion fails → fail-safe `skip=true`. The primary commit-scope path covers the common case, so this is silent — but the documented fallback path (T3 key edge case "FID from merged PR (fallback)") is non-functional as written.

**Suggested fix:** Replace with `gh api "repos/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/commits/$HEAD_SHA/pulls" ...`, or pre-derive `OWNER_REPO` once (matching `bkit-auto.md:83`'s idiom) and use `"repos/$OWNER_REPO/commits/$HEAD_SHA/pulls"`.

---

### MEDIUM 5 — Task 5 `dev-dispatch` telemetry snippet uses undefined `$HEAD_SHA`

**Class:** mechanical (shell variable).

**Location:** Spec snippet lines 347-349:

```bash
jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg p "$PARENT_SHA" \
  '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' >> "$STATUS"
```

**Exploit scenario (build-execution failure):** The existing bkit-debug Step 2 worktree-setup block (`.bkit/workflows/bkit-debug.md:287-343`) defines `$PARENT_SHA` (line 370: `PARENT_SHA=$(git rev-parse HEAD)`) but never defines `$HEAD_SHA`. Under `set -euo pipefail` (Failure Path uses it; Step 1 doesn't have it but the surrounding pattern does), `--arg h "$HEAD_SHA"` with unbound `HEAD_SHA` either errors (`set -u`) or produces an empty `headSha` field. The ctx step's later join key is `fid` only (`select(.type=="dev-dispatch" and .fid=="$FID")`), so an empty `headSha` is non-fatal for the cap; but the telemetry schema (spec line 198-207) declares `headSha` as a load-bearing field for stale-run correlation, and an empty value defeats that.

**Suggested fix:** Add `HEAD_SHA=$(git rev-parse HEAD)` immediately before the `jq -nc` line in the snippet, OR drop `headSha` from the row schema if it's informational only and document that decision.

---

### MEDIUM 6 — GHA concurrency narrative ("dropped, not queued") contradicts documented GHA behaviour

**Class:** mechanical (documentation/factual).

**Location:** Plan line 72 (Key Edge Cases — "Two dev pushes fail CI near-simultaneously"): "the superseding dispatch is **dropped** (GHA does not queue)". Plan line 128 (Decision 2): "superseding dispatch dropped — GHA does not queue".

**Exploit scenario (operator misexpectations + future-architect confusion):** GHA concurrency with `cancel-in-progress: false` does NOT drop the superseding run — it queues it (the in-flight continues; the new run enters `pending`; when in-flight completes, the latest pending starts; older pendings are cancelled as newer ones arrive). The cap still bounds the loop because the queued run re-evaluates the cap at its ctx step, but the plan's narrative ("operator can manually re-trigger via `workflow_dispatch` if the dropped CI-fail wasn't addressed") implies the operator must intervene when in fact the queue auto-resumes. A future architect reading this decision log may also "fix" the non-existent drop problem by adding redundant compensating logic.

**Suggested fix:** Replace "superseding dispatch dropped (GHA does not queue)" with "superseding dispatch queued; in-flight debug runs to completion; queued run starts when in-flight finishes and re-evaluates the loop cap (which will see the now-incremented `dev-dispatch` count)". Update `cloud.md` decision-log spec (Task 7) to match.

---

### MEDIUM 7 — Close-commit identifier in plan edge-case is factually wrong

**Class:** mechanical (documentation/factual).

**Location:** Plan line 71 (Key Edge Cases — "[skip ci] Close commit"): "The `chore({FID}): merge-pr attempt N` close commit that follows the squash merge carries `[skip ci]`".

**Exploit scenario (build agent mis-verifies):** The actual close commit landed on `dev` is `docs({FID}): ship DONE bkit [skip ci]` (`.bkit/workflows/bkit-ship.md:1206`, gated on `RUNTIME_DEVPUSHES=true`). `chore({FID}): merge-pr attempt N` (line 655) is a pre-merge per-attempt telemetry commit on `feat/{FID}` — it does NOT carry `[skip ci]` and it does NOT land on `dev` (squash-merge collapses all `feat/{FID}` commits into the squash subject). A build agent verifying the claim via `git log` for `chore({FID}): merge-pr attempt` after a ship would find nothing on `dev` and conclude the close commit doesn't exist. The load-bearing fact (the actual close commit carries `[skip ci]`) is correct, but the identifier is wrong.

**Suggested fix:** Replace `chore({FID}): merge-pr attempt N` with `docs({FID}): ship DONE bkit [skip ci]` in the edge-case description and Manual Verification section (line 564).

---

### MEDIUM 8 — Tasks 1 and 2 both edit `.github/workflows/bkit-cloud.yml` despite "independently executable" claim

**Class:** mechanical (single-owner surface violation).

**Location:** Task 1 scope line 428 (`.github/workflows/bkit-cloud.yml` lines 28-74); Task 2 scope line 437 (`.github/workflows/bkit-cloud.yml` shared-deriv blocks in both jobs — lines 190-214 and 325-344); Gate 2 preamble line 424 ("each task is independently executable").

**Exploit scenario (merge conflict / orchestrator-mode ambiguity):** Although the line ranges are disjoint, both tasks mutate the same file. In bkit's orchestrator-executes-subagents-in-sequence model this is benign (sequential commits to one branch). But the "independently executable" claim is misleading: a parallelised build (subagent-driven-development skill pattern) would produce merge conflicts on `.github/workflows/bkit-cloud.yml`. Also Task 7 (`.bkit/cloud.md` decision log) and Task 12 (`.bkit/cloud.md` acceptance note "or `docs/deployments.md`") share `.bkit/cloud.md` — mitigated by Task 12's escape clause but worth a single canonical owner.

**Suggested fix:** Either merge Task 1 + Task 2 into a single "bkit-cloud.yml edit" task (the natural unit), OR add a Gate 2 note: "Tasks 1 and 2 share `.github/workflows/bkit-cloud.yml`; execute sequentially, do not parallelise."

---

### LOW 9 — Task 5 labels the telemetry write as "Step 1" but the existing `workflow-started` row is written in Step 2

**Class:** mechanical (spec terminology).

**Location:** Task 5 line 473 ("Step 1 telemetry: in CI_DEV mode, write `dev-dispatch` row to status.jsonl alongside `workflow-started`"); spec line 345-349 (same).

**Exploit scenario (build agent places telemetry in wrong step):** `bkit-debug.md` Step 1 (Start Workflow, lines 121-265) does not write `workflow-started`; that row is first emitted in Step 2 (Worktree Setup, line 368: `jq -nc ... '{type:"workflow-started", workflow:"debug", ...}' >> "$STATUS"`). The plan's "Step 1 telemetry" instruction would lead a build agent to insert the `dev-dispatch` write into Step 1 where `$PARENT_SHA`, `$STATUS`, `$DEBUG_ATTEMPT` are not yet in scope.

**Suggested fix:** Reword to "Step 2 telemetry (alongside the existing `workflow-started` write at bkit-debug.md:368)".

---

### LOW 10 — `cancel-in-progress` verification only checks expression presence, not dev-vs-feat behaviour

**Class:** mechanical (verification quality).

**Location:** Task 1 "Done when" line 432; Test matrix T2 line 97 ("Expression `${{ github.event.workflow_run.head_branch != 'dev' }}` present in concurrency block").

**Exploit scenario (regression undetected):** A grep/yq check for the expression string doesn't verify the queue semantic applies to `dev` only without breaking `feat/**` cancellation. A typo like `head_branch == 'dev'` would invert the behaviour (feat would queue, dev would cancel) and T2 would still pass.

**Suggested fix:** Add a behavioural check to T2: "bash unit: for `head_branch=feat/foo` expression evaluates to `true` (cancel preserved); for `head_branch=dev` evaluates to `false` (queue)."

---

### LOW 11 — Task 1 "header comment update" doesn't quote the new comment text

**Class:** mechanical (spec completeness).

**Location:** Task 1 line 431 ("Update header comment (lines 14-16) to document the `dev` post-merge trigger surface").

**Exploit scenario (build agent improvises):** No verbatim text given; the agent drafts its own comment, risking drift from the existing header voice (Phase 1 / Phase 2 framing at cloud.yml:14-19).

**Suggested fix:** Quote the replacement header comment block in the task spec.

---

### LOW 12 — `MAX_DEV_DISPATCH_ATTEMPTS` placement breaks the existing comment-grouping header

**Class:** mechanical (style).

**Location:** Task 3 line 452; existing `.bkit/scripts/bkit-counter-bus-config.sh:16-19` ("# bkit-debug.md counters (mode-matched pairs — DE-25, DE-36)" header covers `MAX_DEBUG_ATTEMPT`/`MAX_NORMAL_ATTEMPT`/`MAX_SOAK_ATTEMPT`).

**Exploit scenario (cosmetic / future-maintainer confusion):** Adding `MAX_DEV_DISPATCH_ATTEMPTS=3   # #363 — cross-session dev-triggered debug dispatch cap` inside the section is correct, but the new inline comment uses a different convention (`#363 —`) from the section header (`DE-25, DE-36`). The constant is also consumed by `bkit-cloud.yml` (not bkit-debug), so grouping it under "bkit-debug.md counters" is partly inaccurate.

**Suggested fix:** Either add a new section header `# bkit-cloud.yml counters` for `MAX_DEV_DISPATCH_ATTEMPTS`, or note in the inline comment that it's consumed by the cloud ctx step despite living near bkit-debug constants.

---

### LOW 13 — Task 11 ctx-step dry-run extraction doesn't specify env mocking

**Class:** mechanical (verification harness).

**Location:** Task 11 lines 525-527 ("Ctx step bash dry-run: mock `BRANCH=dev CONCLUSION=failure COMMIT_MSG=...` → assert `phase=debug`...").

**Exploit scenario (build agent's dry-run is non-reproducible):** The ctx step's `run:` block depends on `$GITHUB_OUTPUT` (target of `echo "skip=true" >> "$GITHUB_OUTPUT"`), `gh pr list`/`gh issue view` (network), `git rev-parse origin/dev` (worktree state), and the bkit-counter-bus-config source. The plan doesn't specify which to mock, how to extract the bash from the YAML literal, or how to capture `phase=`/`arg=`/`skip=` outputs from `$GITHUB_OUTPUT`. Without this, two build agents would produce two different dry-run harnesses.

**Suggested fix:** Add a "Dry-run harness" sub-bullet: "Extract the `run:` block via `yq -r '.jobs.run.steps[] | select(.name=="Resolve phase + brief context") | .run'`. `touch $GITHUB_OUTPUT`; export `BRANCH=dev CONCLUSION=failure`; mock `gh` with stubbed responses or `GH_HOST=invalid` to exercise the fail-safe paths; read `$GITHUB_OUTPUT` to assert `phase=`/`arg=`/`skip=`."

---

## Dependency graph (verified)

```
Task 6 (bkit-ship suffix)      — independent (only enabler for the dev trigger gate)
Task 3 (MAX_DEV_DISPATCH_ATTEMPTS) — independent
Task 1 (cloud.yml trigger+concurrency) — independent file section
Task 2 (cloud.yml ctx dev branch) — DEPENDS ON Task 3 (sources config), Task 6 (gate marker); SAME-FILE as Task 1
Task 4 (bkit-auto CI_DEV)      — DEPENDS ON Task 2 (ctx step must dispatch non-numeric ARG)
Task 5 (bkit-debug fix/{FID} + telemetry) — DEPENDS ON Task 4 (MODE source); existing 3-way fallback makes the worktree part redundant (see HIGH 2)
Tasks 7-9 (docs)               — independent
Task 10 (mirror regen + version) — DEPENDS ON Tasks 3-9 (must run last; correct in plan)
Task 11 (validation)           — DEPENDS ON Tasks 1-6
Task 12 (acceptance note)      — independent; SAME-FILE overlap with Task 7 on `.bkit/cloud.md` (mitigated by "or docs/deployments.md")
```

The plan declares NO `Depends on` fields and asserts all tasks "independently executable" (line 424). The actual graph has four undeclared edges. Task 10's late position is correct.

## Single-owner surfaces

- Tasks 1 + 2 share `.github/workflows/bkit-cloud.yml` (disjoint line ranges, sequential execution OK, parallel risky — see MEDIUM 8).
- Tasks 7 + 12 share `.bkit/cloud.md` (mitigated by Task 12's `or docs/deployments.md`).
- All other tasks have clean single-file owners.

## Verification quality summary

- T1, T10, T12: mechanical grep/yq/jq — sound.
- T2: presence-only check; misses behavioural regression (see LOW 10).
- T3-T5: bash dry-run of ctx step; harness unspecified (see LOW 13).
- T6-T9: read checks and bash units; sound.
- T11: covered by Task 10 + Task 11.

## Execution ambiguity summary

The plan is largely unambiguous in intent. The HIGH findings (1, 2, 3) are concrete execution blockers — undefined shell variables under `set -u` and an undeclared dependency that produces a red cloud job on first invocation. The MEDIUM findings (4, 5) are silent fail-safes (the failure path still no-ops rather than crashing) but represent broken fallback documentation. The MEDIUM findings (6, 7, 8) are documentation/narrative inaccuracies that won't block the build but will mislead operators and future architects.

A competent build agent that reads the source files (not just the plan) will discover `$REPO_ROOT`/`$HEAD_SHA` are undefined and the `MODE=CI_DEV` propagation gap, and adjust at edit time. A build agent that trusts the plan's snippets verbatim will fail.
