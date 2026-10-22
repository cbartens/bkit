<!-- bkit:anchor
baseSha: dee808e19e294c3268619a0beaf4d7848ba11436
baseRef: origin/dev
bkitVersion: 5.5.0
bkitLatest: 5.5.0
-->

Verdict: PASS

<!-- verdict:end -->

# Plan Complexity Split

## Sub-Plans Created

- [650-workflows-prompt-alone-plan-1.md](650-workflows-prompt-alone-plan-1.md) — Sub-Plan 1 of 2: Engine (FID rule, `--issue` flag, issue-less parse, PR marker + `main` base guards, `worktrees setup` refusals, shared-checkout record + own-path commits, own-commit push, `runs dispatch` on `dev`, `dist/`)
- [650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md) — Sub-Plan 2 of 2: Wording, Workflows, Docs, Mirrors, Verification (wording clauses, five-workflow issue-less prose, per-workflow skips, router, debug-on-`dev` prose, ship hardening, docs, ledger check, mirrors + `dist/`, full verification + dogfood)

Source: [plan-v3-checked.md](plan-v3-checked.md) (19 tasks). Target count `ceil(19 / 12)` = 2.

## Per-Sub-Plan Sizing

<!-- prettier-ignore -->
| Sub-plan | Tasks (master numbers, in run order) | Count | Derived Test Matrix rows | Reuse Inventory rows | Supersession rows | Documentation Updates rows |
| --- | --- | --- | --- | --- | --- | --- |
| `650-workflows-prompt-alone-plan-1.md` | 1, 2, 3, 4, 5, 11, 12, 13, 6 | 9 | 19 | 17 | 3 | 0 |
| `650-workflows-prompt-alone-plan-2.md` | 7, 8, 9, 10, 14, 15, 16, 17, 18, 19 | 10 | 12 | 2 | 3 | 8 |
| **Sum** |  | **19** | **31** | **19** | **6** | **8** |
| **Master (`plan-v3-checked.md`)** | 1–19 | **19** | **31** | **19** | **6** | **8** |

- Every task in exactly one sub-plan; `Done when` / `Test first` copied verbatim (checked by matching each task line's `Done when` + `Test first` presence (19 / 19) and the master's task-ending strings in the children (10 / 10)); both sub-plans <= 12 tasks.
- Gate checkpoints (Gate 1–4) and `Mandatory Tasks (Testing & Documentation)` present in both sub-plans, scoped to their own tasks.
- Ledger `jq` blocks (decisions + deferrals, record-only, never re-run) and the decisions correction row → `650-workflows-prompt-alone-plan-2.md` with Task 17, which verifies them.

**Partition rationale (green boundaries):**

- Domain split (engine | prose + docs + mirrors) instead of wave split. A wave split (Waves 1+2 | 3+4) leaves Sub-Plan 1 red: Task 8 / 9 edit `.bkit/core/workflows/*.md` and `.bkit/core/.bkit/workflows.md`, but mirror regeneration is Task 18, and `bkit check` drift-gates the host-render mirrors.
- Sub-Plan 1 changes no prose. Every workflow keeps passing no `--issue`, which the engine treats exactly as today, so the engine-only boundary leaves `pnpm bkit:gate:static-unit-integration` + `pnpm bkit check` green.
- Task 6 (`dist/` rebuild) runs last in Sub-Plan 1, after Tasks 11–13. That way `dist/` holds every engine change and `pnpm bkit:check:dist` is green at the boundary. Its `Done when` text is unchanged.
- Every signature change sits in the same sub-plan as all of its callers: `pushBranch` sync → `async` and its 3 callers (T12), `mergePr` base check with `landPr` / `closePr` (T4), the `ledgers.ts` record helpers with all 7 caller files (T11–T13), `fromMarker` / `fromBranch` with the `runs context` guard (T2).
- Every deletion lands with its replacement: `FID_FORMAT` / `ISSUE_FORMAT` (T4), worktrees texts (T5), `land.ts` text (T12) in Sub-Plan 1; the `AGENTS.md` STOP (T10), debug prose (T14) and wording `retired` (T7) in Sub-Plan 2.
- Cross-plan dependencies point one way only: T14 depends on T11–T13, and T8 / T14 / T15 / T19 call engine contracts from Sub-Plan 1. Sub-Plan 2 lists Sub-Plan 1 as a prerequisite.

## Master Restructure

- Removed from the master: all 19 tasks, the Derived Test Matrix rows, Reuse Inventory rows, Supersession Inventory rows, Documentation Updates rows, the ledger `jq` blocks, Pre-Flight checklists, Gates 1–4, `Mandatory Tasks`, the Security & Privacy checkboxes, the human-confirmation checkboxes, and the Verification Plan checklists. Each now lives in the sub-plan that owns it.
- Kept as context: Context & Goals, Narrative / Success Criteria / Process Sketch / Concrete Example / Edge Cases, Breaking Changes & Naming, Open Questions & Assumptions, Alternatives, Out of Scope, Suggested Scope Expansion, Rollback.
- Architecture & Component Changes became a file-to-sub-plan map.
- `Agent Execution Runbook` was replaced by `Sub-Plan Index`, with relative links. Both sub-plans link back here through `**Parent Plan:** [650-workflows-prompt-alone-plan.md](650-workflows-prompt-alone-plan.md)`.

## Blockers

None.

Carried forward unchanged, not split defects:

- The `Narrative` is still `⚠️ MISSING` (Gate 1 blocker, human action), copied into both sub-plans.
- The upstream plan-check verdict was `CONCERNS`.

No embedded directives found in the inputs.

---

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Run Workflows From the Prompt Alone Implementation Plan (Parent Index)

> [!CAUTION]
> **Purpose:** Parent index of a split plan — context, goals, design decisions; executable tasks, gates and verification live in the sub-plans below.
>
> **Rules:**
>
> - Build runs the sub-plans in order (`Sub-Plan Index`); never tick tasks or gates here.
> - Human confirmations (Acceptance Scenario, Breaking Changes, Open Questions) are ticked in each sub-plan's `👤 ✅ Human Confirmation` blocks.
> - Source of truth for progress: literal `[x]` vs `[ ]` checkboxes in the sub-plans.

## Context & Goals

**Problem.** With a tracker wired (github / linear / jira), `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`, `/bkit-ship` STOP at Step 1 sub-step 2 when the prompt names no issue (`.bkit/wording.md` `workflow-issue-id-missing` → `No issue ID in the session prompt.` → STOP). `/bkit-debug` cannot be pointed at red CI on `dev` without filing an issue first. Missing design / plan is already a warning (#490); the issue is the last required input.

**Goal.**

- Issue becomes optional like design / plan: recover it from a named FID or `feat/{FID}` (Q2), else warn, mint an issue-less FID, continue, make no issue-tied tracker call.
- Issue-less FID can never parse as an issue id (Q3): all-digit words dropped at mint; engine backstop on `fids check` / `steps gate --issue=""`.
- `/bkit-debug` on `dev` stays IN PLACE in the main checkout, no worktree, no new branch (Q1): commits only its own paths, pushes only its own commits, waits for `dev` CI on the pushed commit, never probes for a PR on `dev` / `main`.
- `/bkit-ship` never targets `main`: refusal text on `dev` / `main`; engine guards on `bkit prs open --base=main` and `bkit prs merge` of any non-`dev` base (Q4).

**Inputs and precedence.** No design doc (issue decision 5: built straight from the issue plan comment). Issue #650 body + plan comment; the "Open questions: answered" comment (Q1–Q7) overrides the plan comment's "Decisions I'm proposing" and "Open points". Plan comment waves 1–4 kept as runbook waves (mapped onto sub-plans in `Sub-Plan Index`).

**Premise corrections (survey of the code, not the input):**

1. Q1.3 "treats red the same way it treats a red PR run" — `/bkit-debug` never waits for a PR run's result; the CI-Dispatch Gate (`bkit runs dispatch`, `runs.ts` `ciDispatchGate` L1247) only proves a run started. No existing red-run handling to mirror → `Open Question 1`.
2. Plan comment ship L236: an empty `ISSUE_ID` makes "branch does not contain `{ISSUE_ID}`" always **false** (`""` is contained in every string), not always true; same conclusion — the naming warning never fires issue-less. Fix stands (T15).
3. Plan comment order-of-work 4 names `prs open --dry`; no `--dry` flag exists. Dogfood uses `prs open` with `gh` off `PATH` → exit 80 prints the PR payload (marker included) without opening.
4. Debug Step 11 already skips the PR probe on `dev`; the leaks are Step 1 sub-step 6 (PR lookup that can pick up and retitle an open `dev` → `main` release PR) and the empty `--pr` handed to `runs dispatch` at Step 11.
5. `git add -A` (plan comment problem (a)) lives in `steps.ts` `writeStepRow` L405, reached by every `steps finish` and by `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283`, and in `workflows.ts` `closeWorkflow` L991 (the `workflows close --message` commit, `commit --allow-empty`). `commitBookkeeping` (`ledgers.ts` L276–406) already commits by pathspec but `stageTrackedUpdates` runs `git add -u` (L314–317).
6. Debug pushes `dev` from three places today, not one: Steps 9 / 10 / 11 run `branches push --mode=feature` (`bkit-debug.md` L552 / L576 / L626), which on a shared branch is a plain `git push origin dev` (`branches.ts` L602, L617–624); `ciDispatchGate`'s re-trigger pushes through `pushCurrentBranch` (`runs.ts` L309–317). All three push local `dev` wholesale.
7. `runs context` (`runs.ts` L1792–1805) refuses an issue-less FID only because `fromMarker` / `fromBranch` return null for it; there is no explicit `issueId === null` check. T2 removes that null, so the refusal needs its own guard.

**Derived from Q1.2:** with local `dev` ahead of `origin/dev`, every `origin/dev..HEAD` diff in debug counts foreign commits → `workflow-large-diff` gains `{{base}}` and debug on `dev` diffs against `{DIFF_BASE}` (record `startSha`).

**Related Issues:**

- #650 — Run workflows from the prompt alone, without issue, design or plan (this issue; state not re-read — no tracker tool in this subagent)
- #486 — Stop auto-creating tracker issues (state not read; never-create rule stays)
- #490 — Run build and ship from the session prompt when there is no plan (state not read; design / plan already warn-only)

---

## Sub-Plan Index

Replaces `Agent Execution Runbook`. Run in order; Sub-Plan 2 requires Sub-Plan 1 complete (its Gate 4 ticked). One branch / one PR for both is fine (advisory).

<!-- prettier-ignore -->
| # | Sub-plan | Domain | Master tasks (run order) | Master waves covered | Depends on | Boundary state |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [650-workflows-prompt-alone-plan-1.md](650-workflows-prompt-alone-plan-1.md) | Engine (`.bkit/core/engine/**`, engine tests, `dist/`) | 1, 2, 3, 4, 5, 11, 12, 13, 6 | Wave 1; Wave 3 engine | — | Workflows unchanged, pass no `--issue` (= today); `dist/` rebuilt last; static / unit / integration + `bkit check` + `check:dist` green |
| 2 | [650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md) | Wording, five workflows, router, docs, ledgers, mirrors, verification | 7, 8, 9, 10, 14, 15, 16, 17, 18, 19 | Wave 2; Wave 3 prose; Wave 4 | Sub-Plan 1 | Mirrors + `dist/` regenerated (T18) before full verification (T19); all gates green |

**Task → sub-plan map:** T1–T5, T6, T11–T13 → Sub-Plan 1 · T7–T10, T14–T19 → Sub-Plan 2.

---

## 👤 ⚠️ Acceptance Scenario (context; confirm in sub-plans)

### Narrative

`⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`

Issue #650 has no `Narrative` section (no design, no audit). Closest issue text, verbatim from `### Outcome`, for the human to adopt or replace:

> Every workflow runs on the prompt alone. A missing issue, design or plan prints a warning and the run continues. `/bkit-debug` runs on any branch except `main`, `dev` included. `/bkit-ship` keeps refusing `dev` and `main` and never opens or merges a PR from `dev` into `main`; releases stay manual.

**Gate 1 blocker (human action):** fill the Narrative in each sub-plan (same text), then tick `Acceptance Scenario confirmed` there. Same template gap as OPEN deferral `442-plan-template-design-missing-fallback-amendment`.

### Success Criteria

Issue #650 `### Success criteria`, verbatim (6 bullets; verbatim rule wins over the 5-bullet cap):

- `/bkit-debug ci failures on dev`, run on `dev` with the GitHub tracker wired and no issue named: prints a warning that names the missing issue, then diagnoses, fixes and lands the fix on `dev`. It does not stop.
- The same holds for design, plan, build and ship: no issue → warning → run continues from the prompt.
- An issue-less run makes no tracker calls tied to an issue (labels, comments, board, issue reads), and none of them fail the run.
- An issue-less run gets a valid FID (the run's log-folder name) in a tracker-wired repo. It can never be misread as an issue id.
- The no-issue warning is the first line of every final message the workflow returns.
- `/bkit-ship` on `dev` or `main` refuses with a message saying releases stay manual. No ship path can merge into `main`.

### Process Sketch

- **WHEN** `/bkit-debug ci failures on dev` runs on `dev`, GitHub tracker wired, no issue named **→ THEN** Step 1 prints the no-issue warning naming FID `dev-ci-failures` and the run continues with no issue-tied tracker call.
- **WHEN** the fix is committed and pushed **→ THEN** only the run's own paths and commits reach `origin/dev`, and the run waits for `dev` CI on the pushed commit before closing.
- **WHEN** the run returns **→ THEN** line 1 of the final message is the no-issue warning.
- **IF** the prompt names no issue but the branch is `feat/650-foo` or the prompt names a FID carrying one **→ THEN** that issue is read, labelled and commented on as if named (Q2).
- **IF** a minted slug carries an all-digit word (`dev-123-ci-failures`) **→ THEN** it is dropped (`dev-ci-failures`); a tracker-shaped FID with `--issue=""` (`123-fix`, `fix-2-retry`) is rejected (Q3).
- **IF** debug must change a file already dirty before the run, or local `dev` holds commits the run did not make **→ THEN** it stops and asks / replays only its own recorded commits onto `origin/dev` (Q1).
- **IF** `/bkit-ship` runs on `dev` / `main`, or a PR's base is `main` at open or merge **→ THEN** refused; releases stay manual (Q4).

### Concrete Example

**Setup:** Maintainer in a consumer repo with the GitHub tracker wired, main checkout on `dev`. `notes.md` edited and uncommitted (unrelated). One unpushed local commit `abc1234` on `dev`. Latest `dev` CI run is red.

**Steps:**

1. Maintainer types `/bkit-debug ci failures on dev` → Step 1: no issue in prompt, branch is `dev` (no `feat/{FID}`) → prints `WARNING: no issue named — running issue-less as dev-ci-failures; no tracker reads, labels or comments. Name dev-ci-failures in the next prompt to continue this run.`; `bkit fids check --fid=dev-ci-failures --issue=""` exits 0; no `prs probe` (`PUSH_MODE=LOCAL`).
2. Step 2 `bkit worktrees setup` stays in place, records local `dev` HEAD (`abc1234`, 1 ahead of `origin/dev`) and the dirty set `{notes.md}`, and returns `startSha` = `abc1234` (held as `{DIFF_BASE}`).
3. Steps 3–10 diagnose and fix `src/build.ts`; every `bkit steps finish` commit holds run-log paths + `src/build.ts`, never `notes.md`, and its SHA is appended to the record; Steps 9 / 10 push nothing on `dev`.
4. Step 11 `bkit workflows close` commits the close row (never `notes.md`; SHA recorded); `bkit branches push --mode=dev`: `origin/dev..HEAD` holds `abc1234`, not only recorded SHAs → replays exactly the recorded SHAs onto `origin/dev` in `.worktrees/_land-dev-ci-failures` and pushes; `abc1234` stays local; prints how to resync local `dev`; returns the pushed `origin/dev` SHA.
5. `bkit runs dispatch` on the pushed SHA → run started; `bkit runs wait --until=completed` → `conclusion: success`; `bkit runs gate --capstone-only` passes; `bkit locks release` then removes the record.
6. Final message; line 1 = the warning from step 1.

**Outcome:** `origin/dev` gained exactly the fix commit(s) + run record; `notes.md` still modified and uncommitted; `abc1234` still unpushed; transcript shows no `bkit issues *` call and no tracker MCP call; final message starts with the warning.

### Edge Cases

Full table split by owning sub-plan (engine rows → Sub-Plan 1, prose rows → Sub-Plan 2, shared rows in both). Union of both = the master's 50 rows.

### Derived Test Matrix

31 rows, each in the sub-plan holding its task: 19 in [650-workflows-prompt-alone-plan-1.md](650-workflows-prompt-alone-plan-1.md) (T1–T5, T11–T13), 12 in [650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md) (T7–T10, T14, T15). Static gates are the global gate (Task 19 runs them).

---

## 👤 ⚠️ Breaking Changes & Naming Review (context; confirm in sub-plans)

- **Behaviour change for every wired-tracker consumer:** a missing issue no longer STOPs any of the five workflows; the warning (console + final-message line 1) replaces it → Sub-Plan 2.
- **`bkit prs merge` refuses any PR whose base is not `dev` (or cannot be read); `bkit prs open --base=main` is refused** → Sub-Plan 1 (CHANGELOG entry: Sub-Plan 2 T16).
- **`bkit worktrees setup` refuses `main` in place for design / plan / build** → Sub-Plan 1.
- **Engine contract changes** (`--issue` flag, issue-less parse + `runs context` guard, FID-only PR marker, `worktrees setup` record + `startSha` / `aheadAtStart`, own-path commits + `EXIT_FOREIGN_PATH`, own-commit push + `replayed` / landed `sha` + `async` `pushBranch`, `land.ts` text, `runs dispatch` on a shared branch by SHA, `locks release` record removal) → Sub-Plan 1.
- **Proposed names:** `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem`, `--issue`, `EXIT_BASE_MAIN`, `EXIT_BASE_NOT_DEV`, `EXIT_FOREIGN_PATH`, `EXIT_SHARED_BUSY`, run record `$(git rev-parse --git-path bkit/shared-checkout/{FID}.json)`, ship refusal text → Sub-Plan 1; wording clauses `workflow-no-issue-warning`, `workflow-final-first-line` (new) and eight changed clauses, `**No issue:**` header bullet → Sub-Plan 2.

## 👤 ⚠️ Open Questions & Assumptions (context; confirm in sub-plans)

Answered on #650 (carried, not reopened): Q1 in place on `dev`; Q2 recover issue from FID; Q3 drop all-digit words + engine backstop; Q4 guard merge and open; Q5 keep related-issues search, drop Jira `key !=`; Q6 leave `preflight-linear.sh`; Q7 no continuity change, document it.

<!-- prettier-ignore -->
| Open Question | Topic | Default | Sub-plan |
| --- | --- | --- | --- |
| 1 | `dev` CI red on the pushed commit | A — Failure Path naming the red run | Sub-Plan 2 (T14) |
| 2 | Replay runs in `pushToDev`'s throwaway checkout with hooks off | A — accept | Sub-Plan 1 (T12) |
| 3 | Local `dev` diverges after a replay | A — leave untouched, print resync command | Sub-Plan 1 (T12) |
| 4 | Pre-dirty path changed during the run; append-only ledgers | A — refuse (`EXIT_FOREIGN_PATH`), ledgers line-level | Sub-Plan 1 (T11) |
| 5 | Mid-run edit by someone else to a clean path | A — accept and document | Sub-Plan 1 (T11) + Sub-Plan 2 (T14 doc line) |

Assumptions: carried verbatim into the sub-plan(s) whose tasks rely on them; each sub-plan adds one split-boundary assumption.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Debug on `dev` in its own worktree on `feat/{FID}` + `branches land` (plan comment proposal) | Rejected | Overridden by owner (Q1): stays in place, no new branch |
| `git stash` foreign changes around the run | Rejected | Stash stack is shared across worktrees and sessions; pop can take another session's entry |
| Temporary index for every run commit | Fallback only | Pathspec commits already leave foreign index entries alone; temp index used only when the run's own path set is empty (an `--allow-empty` commit would otherwise take the whole index) and for line-level ledger blobs |
| Own commits = `startSha..HEAD` | Rejected | Sweeps in any commit someone else makes on `dev` mid-run; `.agents/rules.md` § Commits treats parallel editors as the expected case |
| Record start SHA + dirty set + every engine commit SHA; own-path commits; push / replay of exactly the recorded SHAs via `pushToDev` | **Chosen** | Fixes problems (a)–(d) with existing engines; debug still creates no branch |
| Remove the record at `workflows close` or on push success | Rejected | Step 11 pushes and re-triggers CI after the close; the Failure Path hand-back needs the record to leave foreign paths alone. Lifetime = workflow lock (`locks release`, moved after the CI wait) or the `dev` hand-back |
| Issue-less FID rule = "does not match the active tracker shape" | Rejected | Depends on the tracker in force; a tracker switch could make an old FID parse as an issue. "No all-digit word" excludes all three tracker shapes at once |
| Issue-less FID rule = no all-digit word + `SLUG` | **Chosen** | Q3; tracker-independent; mint and check agree |
| CI-Dispatch Gate only on `dev` (prove a run started) | Rejected | Q1.3: debug must wait for `dev` CI on the pushed commit |
| Dispatch → `runs wait --until=completed` → `runs gate --capstone-only` on `dev` | **Chosen** | Existing commands; Gate 11 claim becomes true |
| `prs open` refuses every non-`dev` base | Rejected | Q4 scopes the open guard to `--base=main`; merge guard covers the rest |
| Separate dispatch prose block for `dev` in debug Step 11 | Rejected | One block with `{DIFF_BASE}` / SHA placeholders keeps `ci-dispatch-gate-alignment.test.ts` pinning one shape |
| Relax `/bkit-auto` to run issue-less | Rejected | Non-goal: CI always dispatches it with an issue or PR |
| Auto-create an issue when none is named | Rejected | #486 never-create rule |
| Split the plan by wave (Waves 1+2 \| 3+4) | Rejected (split) | Sub-Plan 1 would end with workflow prose edited but mirrors stale until Task 18 → `bkit check` red at the boundary |
| Split the plan by domain (engine \| prose + docs + mirrors) | **Chosen** (split) | Each boundary green; signature changes with all callers; one-way dependency |

**Future-phase recommendations:** guard the `branches land` MCP fallback merge base (see `Suggested Scope Expansion`); consider a `bkit fids resume` lookup that maps a reworded issue-less prompt to a recent FID (deferred, Q7).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Relax `.bkit/core/hooks/preflight-linear.sh` L13–18 for Linear cloud agents with no `LINEAR_ISSUE_ID` | Not required by any Success Criterion; Linear cloud launches always come from an issue | #650 "Open questions: answered" Q6 (scope-declared) — deferral `650-preflight-linear-issue-less` |
| Issue-less `/bkit-auto` and `bkit-cloud.yml` dispatch | Non-goal: "`/bkit-auto` stays issue-only" (#650 Constraints); T2 only pins fail-closed | #650 § Constraints and non-goals (scope-declared) — deferral `650-bkit-auto-issue-less` |
| Automatic FID continuity across reworded issue-less re-runs | Q7 "No change"; doc line in § Best-effort runs is in scope (T16) | #650 "Open questions: answered" Q7 (scope-declared) — deferral `650-issue-less-fid-continuity` |
| Live round-trip on real GitHub Actions: own-commit push (replay) → dispatch → wait → gate on the landed `dev` SHA | Hard-blocked: needs a GitHub repo with Actions and a `dev` the build agent may push to, which it cannot create or push without human confirmation. The SHA hand-off is pinned at Unit (T12 / T14); Manual Verification Step 6 is the owner-run check | Deferral `650-debug-dev-ci-live-round-trip` (`hard-blocked`, same form as `341-live-run-verification-mode-1-and-mode-3`) |

Deferral `jq` record (never re-run) and its verification (Task 17) → [650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `branches land` MCP fallback (exit 80 → agent merges via MCP) does not assert the PR base is `dev` | Survey of this plan (no ledger row) | T4 / T15 base guards | Fold in — one prose assert mirroring T15's Step 10 assert |
| `639-refused-ship-failed-record-lost-in-cloud-container` | `docs/deferrals.jsonl` | `pushToDev` / handover used by T12 replay | Keep deferred |
| `384-required-status-checks-on-dev-via-bkit-protect-main` | `docs/deferrals.jsonl` | Debug pushing straight to `dev` (T12 / T14) | Keep deferred |
| `363-main-branch-trigger-excluded-reversal` | `docs/deferrals.jsonl` | `main` guards (T4 / T5 / T15) | Keep deferred |
| `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | `docs/deferrals.jsonl` | Rollback of five-workflow prose change | Keep deferred |
| `steps-placeholder-gate-false-positive-on-derived-issue-dump` | `docs/failures.jsonl` | `steps gate --placeholder` with an empty `ISSUE_ID` (T3 / T8) | Needs design decision — T8 adds no `--placeholder=ISSUE_ID` (none of the five workflows passes one); the dump false positive is separate |
| `363-dev-dispatch-cap-self-resettable-by-controlled-principal` — `MAX_DEV_DISPATCH_ATTEMPTS` cap lives in a file the dispatched session can rewrite | `docs/deferrals.jsonl` | Open Question 1 option A (bounded retry owner after a red `dev` run) | Keep deferred; cited in OQ1's trade-off |
| `442-plan-template-design-missing-fallback-amendment` — plan template fallback when no design and no issue `Narrative` exist | `docs/deferrals.jsonl` | This plan's `Narrative` `⚠️ MISSING` (Gate 1 blocker) | Needs design decision |
| #639 open item: stale `RUNTIME_DEVPUSHES` reason at `.bkit/core/engine/commands/workflow/runtime.ts:110` | #639 (`related-issues.md`, "Still open") | Debug-on-`dev` push per runtime (Assumption) | Keep deferred |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

Rows (checked in the sub-plans): User Input (T2) → Sub-Plan 1; Role-Gated Mutation (T4 engine → Sub-Plan 1, T15 MCP assert → Sub-Plan 2); Data exposure (T11–T13 → Sub-Plan 1, T14 prose → Sub-Plan 2); Trust boundary `/bkit-auto` (T2) → Sub-Plan 1. _Not applicable: New API Route, New DB Table/Column, PII, Redirect URL, Webhook, New Secret/Env Var._

## Data Schema Integration

None — bkit has no database. File / git-store invariants (record write, own-path commit, own-commit push exits) → Sub-Plan 1; workflow routing of those exits → Sub-Plan 2.

## Architecture & Component Changes (file → sub-plan map)

<!-- prettier-ignore -->
| File | Change | Sub-plan (task) |
| --- | --- | --- |
| `.bkit/core/engine/commands/workflow/fids.ts` | [MODIFY] `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem`, `--issue`, issue-less parse | 1 (T1, T2) |
| `.bkit/core/engine/commands/workflow/steps.ts` | [MODIFY] `steps gate --issue`; `writeStepRow` own-path commit | 1 (T3, T11) |
| `.bkit/core/engine/commands/workflow/prs.ts` | [MODIFY] FID-only marker, `--base=main` refusal, `mergePr` base check; delete `FID_FORMAT` / `ISSUE_FORMAT` | 1 (T4) |
| `.bkit/core/engine/commands/workflow/branches.ts` | [MODIFY] `branches land` issue-less; `pushBranch` own-commit push (`async`) | 1 (T4, T12) |
| `.bkit/core/engine/commands/workflow/worktrees.ts` | [MODIFY] ship refusal text, missing-branch message, `main` in place refused; shared-checkout record | 1 (T5, T11) |
| `.bkit/core/engine/commands/workflow/ledgers.ts` | [MODIFY] record helpers, own-path set / commit, `commitBookkeeping` exclusion | 1 (T11) |
| `.bkit/core/engine/commands/workflow/workflows.ts` | [MODIFY] `closeWorkflow` own-path commit, hand-back record removal, `closePr` base guard via `mergePr` | 1 (T4, T11, T12 callers) |
| `.bkit/core/engine/commands/workflow/locks.ts` | [MODIFY] `locks release` removes record | 1 (T11) |
| `.bkit/core/engine/commands/land.ts` | [MODIFY] header / docstring / log text; replay via `build` callback | 1 (T12) |
| `.bkit/core/engine/commands/workflow/runs.ts` | [MODIFY] `runs context` guard; `ciDispatchGate` on `dev` by SHA; re-trigger own-path / own-commit | 1 (T2, T13) |
| `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` | [NEW] real-git integration test | 1 (T11, T12) |
| `dist/` | Rebuilt | 1 (T6), 2 (T18) |
| `.bkit/wording.md` | [MODIFY] clauses | 2 (T7) |
| `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` | [MODIFY] issue-less prose, skips, debug-on-`dev`, ship hardening | 2 (T8, T9, T14, T15) |
| `.bkit/core/AGENTS.md` | [MODIFY] router | 2 (T10) |
| `.bkit/core/.bkit/workflows.md`, `trackers.md`, `lite.md`, `docs/testing.md`, `CHANGELOG.md` | [MODIFY] docs | 2 (T8, T9, T14, T15, T16) |
| `docs/decisions.jsonl`, `docs/deferrals.jsonl` | Verify rows (plan-phase writes) | 2 (T17) |
| Mirrors (`.bkit/*.md`, `AGENTS.md`, `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/skills/bkit-*`) | Regenerated via `pnpm bkit upgrade` | 2 (T18) |

Reuse Inventory (19 rows), Supersession Inventory (6 rows), Documentation Updates (8 rows), Ledger Rows `jq` blocks → owning sub-plan (counts in `Per-Sub-Plan Sizing` above).

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database |
| **Code** | `git revert {COMMIT}` of the wave commits (or the squash); rebuild `dist/`; `pnpm bkit upgrade` regenerates mirrors; consumers pin the previous `@cbartens/bkit` version | Engine + workflows ship together in the package; reverting one without the other leaves workflows passing `--issue` to an engine that rejects unknown flags |
| **Risk window** | Issue-less PRs opened before a revert carry `<!-- bkit:fid=X -->` under a wired tracker; the reverted `fromMarker` no longer resolves them | Recovery: name the FID in the prompt; `/bkit-auto` already refuses them, so no cloud run fires |

_Code-only — `git revert` sufficient._ Revert order: Sub-Plan 2 before Sub-Plan 1.

## Verification Plan

Per sub-plan: Sub-Plan 1 Gate 4 (engine suites + static + `check:dist`, Manual Steps 2–5); Sub-Plan 2 Gate 4 + Task 19 (full `pnpm vitest run`, `bkit check`, `check:dist`, packed-tarball dogfood, Manual Steps 1–6).

<!-- bkit:end -->
