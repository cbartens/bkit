<!-- bkit:anchor
baseSha: dee808e19e294c3268619a0beaf4d7848ba11436
baseRef: origin/dev
bkitVersion: 5.5.0
bkitLatest: 5.5.0
-->
<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Run Workflows From the Prompt Alone Implementation Plan — Sub-Plan 2 of 2: Wording, Workflows, Docs, Mirrors, Verification

**Parent Plan:** [650-workflows-prompt-alone-plan.md](650-workflows-prompt-alone-plan.md)

**Sibling sub-plans:** [650-workflows-prompt-alone-plan-1.md](650-workflows-prompt-alone-plan-1.md) (Sub-Plan 1 of 2: engine) — must be complete first.

**Sub-plan scope:** shared wording, the five workflows, the router, docs, ledger verification, mirrors + `dist/`, full verification — master Tasks 7–10, 14–19 (task numbers kept from the master). Engine source is Sub-Plan 1; this sub-plan edits no `.bkit/core/engine/**` source, only prose-shape tests (`workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `wording.test.ts`, `render/trackers.test.ts`). Boundary: workflow prose, `.bkit/core/.bkit/*.md` and mirrors change together (Task 18 regenerates mirrors before Task 19), so this sub-plan ends with local gates green.

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.
>
> **Rules:**
>
> - Any tools mentioned below are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Source of truth: literal `[x]` vs `[ ]` checkboxes in this document; `[ ]` means not DONE regardless of context.

## Context & Goals

**Problem.** With a tracker wired (github / linear / jira), `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`, `/bkit-ship` STOP at Step 1 sub-step 2 when the prompt names no issue (`.bkit/wording.md` `workflow-issue-id-missing` → `No issue ID in the session prompt.` → STOP). `/bkit-debug` cannot be pointed at red CI on `dev` without filing an issue first. Missing design / plan is already a warning (#490); the issue is the last required input.

**Goal.**

- Issue becomes optional like design / plan: recover it from a named FID or `feat/{FID}` (Q2), else warn, mint an issue-less FID, continue, make no issue-tied tracker call.
- Issue-less FID can never parse as an issue id (Q3): all-digit words dropped at mint; engine backstop on `fids check` / `steps gate --issue=""`.
- `/bkit-debug` on `dev` stays IN PLACE in the main checkout, no worktree, no new branch (Q1): commits only its own paths, pushes only its own commits, waits for `dev` CI on the pushed commit, never probes for a PR on `dev` / `main`.
- `/bkit-ship` never targets `main`: refusal text on `dev` / `main`; engine guards on `bkit prs open --base=main` and `bkit prs merge` of any non-`dev` base (Q4).

**This sub-plan delivers:** the workflow half of every goal — wording clauses (T7), five-workflow issue-less prose (T8), per-workflow skips (T9), router (T10), debug-on-`dev` Step 2 / 9 / 10 / 11 prose (T14), ship hardening prose (T15), docs (T16), ledger check (T17), mirrors + `dist/` (T18), full verification + dogfood (T19).

**Engine contracts consumed (delivered by Sub-Plan 1, Tasks 1–5, 11–13, 6):**

- `bkit fids check` / `bkit steps gate` accept `--issue=<id or "">`; `--issue=""` applies the issue-less rule (`ISSUE_LESS_FID`: `SLUG`, no all-digit word).
- `fids parse` / `fromMarker` / `fromBranch` return `{ fid, issueId: null }` for an issue-less FID; `runs context` refuses it (`EXIT_NO_FID`).
- `prs open` / `branches land` accept an empty / absent `--issue` (FID-only marker); `prs open --base=main` → `EXIT_BASE_MAIN`; `prs merge` non-`dev` / unknown base → `EXIT_BASE_NOT_DEV`.
- `worktrees setup` ship refusal text (`refusing to ship ${target}: …`); in place on `dev` (debug) returns `startSha` / `aheadAtStart` and writes the shared-checkout record; another FID busy → `EXIT_SHARED_BUSY`.
- `steps finish` / `ledgers commit` / `workflows close` commit own paths only; changed pre-dirty path → `EXIT_FOREIGN_PATH`.
- `branches push --mode=dev` (any mode with a record) pushes only recorded SHAs; output `replayed`, `sha` = landed `origin/dev` SHA; refusal → `EXIT_PUSH_FAILED`; replay conflict → non-zero naming paths.
- `runs dispatch` on `dev` with the pushed SHA and no `--pr` resolves the push-event run; `locks release --kind=workflow` removes the record.

**Inputs and precedence.** No design doc (issue decision 5: built straight from the issue plan comment). Issue #650 body + plan comment; the "Open questions: answered" comment (Q1–Q7) overrides the plan comment's "Decisions I'm proposing" and "Open points". Plan comment waves 1–4 kept as runbook waves.

**Premise corrections (survey of the code, not the input):**

1. Q1.3 "treats red the same way it treats a red PR run" — `/bkit-debug` never waits for a PR run's result; the CI-Dispatch Gate (`bkit runs dispatch`, `runs.ts` `ciDispatchGate` L1247) only proves a run started. No existing red-run handling to mirror → `Open Question 1`.
2. Plan comment ship L236: an empty `ISSUE_ID` makes "branch does not contain `{ISSUE_ID}`" always **false** (`""` is contained in every string), not always true; same conclusion — the naming warning never fires issue-less. Fix stands (T15).
3. Plan comment order-of-work 4 names `prs open --dry`; no `--dry` flag exists. Dogfood uses `prs open` with `gh` off `PATH` → exit 80 prints the PR payload (marker included) without opening.
4. Debug Step 11 already skips the PR probe on `dev`; the leaks are Step 1 sub-step 6 (PR lookup that can pick up and retitle an open `dev` → `main` release PR) and the empty `--pr` handed to `runs dispatch` at Step 11.
5. `git add -A` (plan comment problem (a)) lives in `steps.ts` `writeStepRow` L405, reached by every `steps finish` and by `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283`, and in `workflows.ts` `closeWorkflow` L991 (the `workflows close --message` commit, `commit --allow-empty`). `commitBookkeeping` (`ledgers.ts` L276–406) already commits by pathspec but `stageTrackedUpdates` runs `git add -u` (L314–317). (Fixed in Sub-Plan 1 Task 11.)
6. Debug pushes `dev` from three places today, not one: Steps 9 / 10 / 11 run `branches push --mode=feature` (`bkit-debug.md` L552 / L576 / L626), which on a shared branch is a plain `git push origin dev` (`branches.ts` L602, L617–624); `ciDispatchGate`'s re-trigger pushes through `pushCurrentBranch` (`runs.ts` L309–317). All three push local `dev` wholesale. (Engine half fixed in Sub-Plan 1 Tasks 12 / 13; prose half T14.)
7. `runs context` (`runs.ts` L1792–1805) refuses an issue-less FID only because `fromMarker` / `fromBranch` return null for it; there is no explicit `issueId === null` check. T2 removes that null, so the refusal needs its own guard. (Sub-Plan 1 Task 2.)

**Derived from Q1.2:** with local `dev` ahead of `origin/dev`, every `origin/dev..HEAD` diff in debug counts foreign commits → `workflow-large-diff` gains `{{base}}` and debug on `dev` diffs against `{DIFF_BASE}` (record `startSha`).

> Success criteria once in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do not restate success list here.

**Related Issues:**

- #650 — Run workflows from the prompt alone, without issue, design or plan (this issue; state not re-read — no tracker tool in this subagent)
- #486 — Stop auto-creating tracker issues (state not read; never-create rule stays)
- #490 — Run build and ship from the session prompt when there is no plan (state not read; design / plan already warn-only)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec

> [!IMPORTANT]
> What good looks like; canonical for the plan phase. Subagents (plan generate, plan review, plan summary) must follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). User action + what they get back. Source, first that carries it wins: design `## Acceptance Scenario` → verbatim; issue `Narrative` (change shape, `.bkit/trackers.md` § Issue shapes) → verbatim; audits only (`docs/audits/`) → user/operator impact from in-scope findings. None → both fields = `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never fabricate; Gate 1 blocked until human fills.
- **Success Criteria:** <=5 bullets, measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), not steps (e.g. "call API, render component"). Design count ≠ 5 → smallest set proving feature. Design → verbatim. No design → issue `Success Criteria` verbatim. Audits only → one bullet per in-scope finding id from `Expected`; no 5-bullet cap.
- **Process Sketch:** Design → plan inherits/refines. same happy-path (`Concrete Example`) + branches (`Edge Cases`) as `WHEN X → THEN Y` (3–7 lines); reuse exact examples, do not invent. Outcomes, not steps.
- **Key Edge Cases:** Design → plan inherits. Concurrency, conflicts, failures, cross-feature — not trivial validation (plan adds that).
- **Edge Cases:** Plan phase — design Key Edge Cases verbatim (no design → issue `Edge Cases` rows verbatim) + validation / error / boundary cases.
- **Concrete Example:** Plan phase only. Role, starting state, numbered steps, observable outcome. One scenario, not a list.
- **Derived Test Matrix:** Plan phase only. One row per testable behaviour → exactly one `Agent Execution Runbook` task. No row without a target file. In-scope audit behaviour → one row. Issue `Derived Test Matrix` rows → kept verbatim; add missing rows.

### Narrative

> Inherited from design, else the issue; do not rewrite.

I run any bkit workflow from a prompt alone, for example `/bkit-debug ci failures on dev` while on `dev` with no issue, and get a warning that no issue is named, then the finished work: here, a fix pushed to `dev` with its `dev` CI run waited on, while my own uncommitted files and unpushed commits stay where they were. `/bkit-ship` still never opens or merges anything into `main`.

Source: owner-supplied on #650 (no design, issue `Narrative` or audit carries one). Same text in the Parent Plan and both sub-plans.

### Success Criteria

> Inherited from design, else the issue; do not rewrite.

Issue #650 `### Success criteria`, verbatim (6 bullets; verbatim rule wins over the 5-bullet cap). Feature-level outcomes; Sub-Plan 1 supplies the engine half of each, this sub-plan the workflow half and the end-to-end proof (T19):

- `/bkit-debug ci failures on dev`, run on `dev` with the GitHub tracker wired and no issue named: prints a warning that names the missing issue, then diagnoses, fixes and lands the fix on `dev`. It does not stop.
- The same holds for design, plan, build and ship: no issue → warning → run continues from the prompt.
- An issue-less run makes no tracker calls tied to an issue (labels, comments, board, issue reads), and none of them fail the run.
- An issue-less run gets a valid FID (the run's log-folder name) in a tracker-wired repo. It can never be misread as an issue id.
- The no-issue warning is the first line of every final message the workflow returns.
- `/bkit-ship` on `dev` or `main` refuses with a message saying releases stay manual. No ship path can merge into `main`.

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** `/bkit-debug ci failures on dev` runs on `dev`, GitHub tracker wired, no issue named **→ THEN** Step 1 prints the no-issue warning naming FID `dev-ci-failures` and the run continues with no issue-tied tracker call.
- **WHEN** the fix is committed and pushed **→ THEN** only the run's own paths and commits reach `origin/dev`, and the run waits for `dev` CI on the pushed commit before closing.
- **WHEN** the run returns **→ THEN** line 1 of the final message is the no-issue warning.
- **IF** the prompt names no issue but the branch is `feat/650-foo` or the prompt names a FID carrying one **→ THEN** that issue is read, labelled and commented on as if named (Q2).
- **IF** a minted slug carries an all-digit word (`dev-123-ci-failures`) **→ THEN** it is dropped (`dev-ci-failures`); a tracker-shaped FID with `--issue=""` (`123-fix`, `fix-2-retry`) is rejected (Q3).
- **IF** debug must commit a file that was already modified before the run and changed again during it **→ THEN** it refuses the commit (`EXIT_FOREIGN_PATH`), names the files and stops to ask; for append-only `*.jsonl` ledgers it commits only the rows the run appended (Q1, Open Question 4).
- **IF** local `dev` holds commits the run did not make **→ THEN** the run does not stop: it replays only its own recorded commits onto `origin/dev`, leaves the others on local `dev` and prints the resync command (Q1, Open Questions 2–3).
- **IF** `/bkit-ship` runs on `dev` / `main`, or a PR's base is `main` at open or merge **→ THEN** refused; releases stay manual (Q4).

### Concrete Example

> Plan expands from design.

**Setup:** Maintainer in a consumer repo with the GitHub tracker wired, main checkout on `dev`. `notes.md` edited and uncommitted (unrelated). One unpushed local commit `abc1234` on `dev`. Latest `dev` CI run is red.

**Steps:**

1. Maintainer types `/bkit-debug ci failures on dev` → Step 1: no issue in prompt, branch is `dev` (no `feat/{FID}`) → prints `WARNING: no issue named — running issue-less as dev-ci-failures; no tracker reads, labels or comments. Name dev-ci-failures in the next prompt to continue this run.`; `bkit fids check --fid=dev-ci-failures --issue=""` exits 0; no `prs probe` (`PUSH_MODE=LOCAL`).
2. Step 2 `bkit worktrees setup` stays in place, records local `dev` HEAD (`abc1234`, 1 ahead of `origin/dev`) and the dirty set `{notes.md}`, and returns `startSha` = `abc1234` (held as `{DIFF_BASE}`).
3. Steps 3–10 diagnose and fix `src/build.ts`; every `bkit steps finish` commit holds run-log paths + `src/build.ts`, never `notes.md`, and its SHA is appended to the record; Steps 9 / 10 push nothing on `dev`.
4. Step 11 `bkit workflows close` commits the close row (never `notes.md`; SHA recorded); `bkit branches push --mode=dev`: `origin/dev..HEAD` holds `abc1234`, not only recorded SHAs → replays exactly the recorded SHAs onto `origin/dev` in `.worktrees/_land-dev-ci-failures` and pushes; `abc1234` stays local; prints how to resync local `dev`; returns the pushed `origin/dev` SHA.
5. `bkit runs dispatch` on the pushed SHA → run started; `bkit runs wait --until=completed` → `conclusion: success`; `bkit runs gate --capstone-only` passes; `bkit locks release` then removes the record.
6. Final message; line 1 = the warning from step 1.

**Outcome:** `origin/dev` gained exactly the fix commit(s) + run record; `notes.md` still modified and uncommitted; `abc1234` still unpushed; transcript shows no `bkit issues *` call and no tracker MCP call; final message starts with the warning.

This sub-plan's prose drives steps 1 (warning, `--issue=""`, no `prs probe`), 2 (`{DIFF_BASE}`), 3 (Steps 9 / 10 push nothing), 4–5 (Step 11 push → dispatch → wait → gate → lock release) and 6 (warning first line); the engine commands they call are Sub-Plan 1.

### Edge Cases

> Plan expands from design's Key Edge Cases.

Rows below = edge cases this sub-plan's tasks own (wording, workflow prose, docs). Engine-owned rows live in Sub-Plan 1; rows both halves touch appear in both.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No issue in prompt; branch `feat/650-foo` (github) | Issue `650` recovered; run reads, labels, comments as if named (Q2) |
| No issue in prompt; prompt names FID `651-bar` / design path | Issue recovered from the FID via `fids parse`; plan still finds the design via `fids design` |
| Prompt names an issue-less FID `dev-ci-failures` | FID reused; attempt counter continues (Q7) |
| Issue-less re-run with reworded prompt | New FID minted, attempt counter restarts; documented in § Best-effort runs (Q7) |
| Mint from branch `dev`, prompt `fix 123 retry` | FID `dev-fix-retry` (all-digit word dropped) |
| Minted FID rejected by `fids check --issue=""` (agent kept a digit word) | Re-mint once with every all-digit word dropped; second reject → Failure Path |
| `none` tracker | Renders and behaves as today; `bkit:tracker true` blocks dropped |
| Named issue | Behaves as today |
| GitHub board configured, no issue | `issues labels --board=…` fences skipped (would exit 2) |
| Jira related-issues search, no issue | `key != {ISSUE_ID}` clause dropped; query valid; search still runs (Q5) |
| `steps gate` placeholder check, no issue | No workflow passes `--placeholder=ISSUE_ID` (none of the five does today; only `bkit-auto.md` L90); gate never fails on an empty `ISSUE_ID` |
| build Step 18.9 / debug Step 11.9 kill-switch, no issue | Skipped; run reaches its final message |
| design Step 11 workstream suggestions, no issue | Skipped (it comments on the issue) |
| ship Step 14.3 labels, no issue | Skipped; an already-merged run never goes to Failure Path |
| ship naming warning (L236), no issue | Warns when branch is not `feat/{FID}` |
| Final message `Append issue link […]`, no issue | Skipped; never renders `[ ]()` |
| `/bkit-ship` on `dev` / `main` | Refused: `refusing to ship dev: /bkit-ship ships a feature branch into dev only; …` |
| PR retargeted to `main` after ship Step 2 | `bkit prs merge` refuses (base is not `dev`); MCP fallback asserts base first |
| Debug needs to edit a file dirty before the run | `steps finish` refuses with a command-specific exit naming the paths → workflow stops and asks |
| Debug Steps 9 / 10 on `dev` | No push; the only `dev` push is Step 11's own-commit push |
| `pushToDev` refused by the server (branch protection on `dev`) | `EXIT_PUSH_FAILED` naming the refusal → Failure Path |
| Replay cherry-pick conflicts | Non-zero exit naming the conflicting paths; throwaway checkout removed → Failure Path |
| `dev` CI red on the pushed commit | Failure Path (Open Question 1 default) |
| `dev` CI never starts | Existing CI-Dispatch Gate failure handling |
| Debug run on `dev` aborted after commits, before Step 11 | Its commits stay on local `dev`, unpushed; next run treats them as foreign (not in its record); handover lands bookkeeping only; output prints the resync command |
| Linear cloud agent with no `LINEAR_ISSUE_ID` | `preflight-linear.sh` unchanged; still stops (Q6) |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign tier(s) via **tier-selection rubric** in `docs/testing.md` (behaviour may need more than one). Boundary rows use that doc's rigor — reach real boundary, assert ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** assertion MUST hit the **affected** surface and FAIL if behaviour broken — not transport status (200/201), not proxy surfaces, never mock away the boundary under test.

**Tier Key** — use these exact tier names in the `Type` column (they must match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc`, lint, and `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces tenant isolation against a fresh local instance |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content and a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty and the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Wording clauses: no STOP on missing issue, warning / first-line clauses, mint clause drops all-digit words and re-mints once on a `fids check` reject, retired blocks hold old text (T7) | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| Five workflows: no wired-tracker block STOPs on a missing issue; `fids check` / `steps gate` carry `--issue`; `**No issue:**` bullet in a `true` block; `**Skip if**` before every `issues labels --board` fence and Failure Path tracker write; warning first in final messages (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Five workflows: every tracker MCP call (`mcp__github__*`, `mcp__linear__*`, `mcp__jira__*`) and every `bkit issues *` fence sits behind the empty-`ISSUE_ID` guard (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Five workflows: Step 1 recovers `ISSUE_ID` from a named FID or a `feat/{FID}` branch via `fids parse` before it warns (Q2) (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Five workflows: L19 `Placeholders` rule lets `{ISSUE_ID}` be empty, so an issue-less run never routes to the Failure Path on it (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Design / plan / debug: Jira related-issues query drops `key != {ISSUE_ID}` when `ISSUE_ID` is empty; search still runs (Q5) (T8) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| `none` render byte-identical; `true` block dropped under `none` (T8) | Unit | `.bkit/core/engine/render/trackers.test.ts` |
| Per-workflow skips: design Step 11, build 1.4 / 18.9, debug 11.9, debug Step 1 no PR probe on `dev` / `main` (T9) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| `.bkit/core/AGENTS.md` router does not STOP on a missing issue; no issue → warning, continue (T10) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Debug on `dev`: Steps 9 / 10 push nothing; no `--mode=feature` push reachable on `dev`; `{DIFF_BASE}` from `worktrees setup` `startSha` in Large Diff Guard, Failure Path handover, Summary and No-leak Assertion; `EXIT_FOREIGN_PATH` → STOP and ask the human (no Failure Path) (T14) | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| Debug Step 11 on `dev`: dispatch → wait → gate on the pushed SHA; `{CLOSE_PARENT}` / transport row use the pushed SHA; lock released after the wait; red `dev` CI → Failure Path naming the run (Open Question 1 default A); Gate 11 item true on `dev` (T14) | Unit | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` |
| Ship: L236 naming warning issue-less; refusal flow; Step 14.3 skip; Step 10 MCP base assert; label re-read before `prs merge` kept with an issue, skipped when `ISSUE_ID` empty (T15) | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` |

Static gates (`pnpm bkit:gate:static-unit-integration`, `pnpm bkit check`, `pnpm bkit:check:dist`) are the global gate, not a matrix row (Tier Key); T19 `Done when` runs them.

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Behaviour change for every wired-tracker consumer:** a missing issue no longer STOPs any of the five workflows. Teams relying on the STOP to force issue linking lose that enforcement; the warning (console + final-message line 1) replaces it.

> [!IMPORTANT]
> **Engine contract changes** (`fids check` / `steps gate --issue`, issue-less parse, FID-only PR marker, `prs open` / `prs merge` base guards, `worktrees setup` record + `startSha`, own-path commits, own-commit push, `runs dispatch` on `dev`, `locks release` record removal) land in Sub-Plan 1 and are confirmed there; this sub-plan consumes them (see `Context & Goals` → Engine contracts consumed). `CHANGELOG.md` `[Unreleased]` records the `bkit prs merge` refusal under Changed (T16).

**Proposed names:**

<!-- prettier-ignore -->
| Kind | Name | Where |
| --- | --- | --- |
| Wording clauses (new) | `workflow-no-issue-warning`, `workflow-final-first-line` | `.bkit/wording.md` |
| Wording clauses (changed, old text → `retired`) | `workflow-issue-id-missing`, `workflow-issue-id-missing-none`, `workflow-issue-read-none`, `workflow-fid-mint`, `workflow-fid-unset`, `workflow-gate-issue-id`, `workflow-issue-link`, `workflow-large-diff` (new `{{base}}` slot) | `.bkit/wording.md` |
| Header bullet | `**No issue:**` inside `<!-- bkit:tracker true start/end -->` | five workflows |

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

Answered on #650 (carried, not reopened): Q1 in place on `dev`; Q2 recover issue from FID; Q3 drop all-digit words + engine backstop; Q4 guard merge and open; Q5 keep related-issues search, drop Jira `key !=`; Q6 leave `preflight-linear.sh`; Q7 no continuity change, document it.

Open Question numbering kept from the Parent Plan; Open Questions 2–4 (replay hooks, local `dev` divergence, pre-dirty ledgers) are engine decisions in Sub-Plan 1. Open Question 5 appears in both: engine behaviour in Sub-Plan 1, its doc line here (T14 § Branch eligibility).

- **Open Question 1:** `dev` CI red on the pushed commit — what does debug do? (Q1.3 says "same as a red PR run", but debug never waits for a PR run's result today — premise correction 1.) → owner.
  - **Options:** A — Failure Path naming the red run URL; run closes FAILED; the `dev` CI router's `MAX_DEV_DISPATCH_ATTEMPTS` loop (`docs/deployments.md` L265) or a human re-run continues; that cap can be reset by the session it bounds (OPEN deferral `363-dev-dispatch-cap-self-resettable-by-controlled-principal`) · B — new attempt inside the same run (back to diagnosis under `MAX_DEBUG_ATTEMPT`); fully autonomous but a long session holding the checkout · C — close DONE with a warning; green-looking close on red CI.
  - **Recommended:** A — a red result is never reported as done, and retry already has a bounded owner.
  - **Default if unanswered:** A.
  - **Answered:** A (owner, #650).
- **Open Question 5:** A clean path first edited mid-run by someone other than the run is indistinguishable from debug's own edit (the record is a start snapshot, Q1.1). → owner.
  - **Options:** A — accept and document (§ Branch eligibility line): a mid-run edit by someone else is committed as the run's own; the workflow lock and `EXIT_SHARED_BUSY` stop parallel bkit runs, not humans · B — restrict the own set to paths the run's remediate step reports plus `docs/plans/**/logs/{FID}/` and engine-written ledgers; needs a new path-report contract from the debug subagents · C — refuse when a path outside the record and outside `docs/plans/**/logs/{FID}/` changed and no run subagent reported it; same new contract, stops instead of filtering.
  - **Recommended:** A — matches Q1.1's start-snapshot design; B / C add a subagent-to-engine path-report contract the source did not ask for.
  - **Default if unanswered:** A.
  - **Answered:** A (owner, #650).
- **Assumption:** No-all-digit-word rule is stricter than "not the tracker shape" and is tracker-independent → if a consumer wants digit words in issue-less slugs (`node-22-upgrade` → `node-upgrade`), the slug loses information; FID still valid.
- **Assumption:** The `none` tracker renders and behaves byte-identically (all new prose sits in `bkit:tracker true` blocks or `--issue` is absent) → if wrong, `render/trackers.test.ts` reds and `none` consumers see changed workflows.
- **Assumption:** No bkit path merges or opens into `main` except via `bkit prs merge` / `prs open` or the ship Step 10 MCP fallback → if another path exists (e.g. `branches land` MCP fallback), it stays unguarded (see `Suggested Scope Expansion`).
- **Assumption:** Every debug-on-`dev` commit goes through `writeStepRow`, `commitBookkeeping`, `closeWorkflow` or the `ciDispatchGate` re-trigger, and every `dev` push through `pushBranch` (any mode) / `pushToDev` / the re-trigger (all record-aware after T11–T13) → a prose-level `git add -A` / `git commit` / `git push` on the `dev` path of `bkit-debug.md` would bypass the record; T14 greps and removes any.
- **Assumption:** Per-runtime behaviour of debug on `dev` is unchanged: `pushBranch` has no runtime check, and the workflow's existing `runtime assert` / `RUNTIME_DEVPUSHES` gating decides whether debug may push `dev` (`CLOUD_CLAUDE`: `RUNTIME_DEVPUSHES=false`); a `GITHUB_ACTION` dev-CI router checkout has no foreign edits or commits, so its record is empty and the push is plain → if a runtime reaches Step 11 on `dev` without `dev` push rights, the own-commit push fails with `EXIT_PUSH_FAILED` → Failure Path.
- **Assumption:** The consumer CI template declares a `push` trigger on `dev` (and `workflow_dispatch`) so `runs dispatch` finds a run for the pushed SHA → if not, the CI-Dispatch Gate fails as it does today.
- **Assumption:** `/bkit-plan` naming a design FID or path without an issue already works (`fids design`) → unchanged; no task.
- **Assumption (split boundary):** Sub-Plan 1 is complete (its Gate 4 ticked) before Task 7 starts → the engine accepts `--issue`, returns `startSha`, and `branches push --mode=dev` / `runs dispatch` by SHA exist; if not, T8 / T14 prose calls flags the engine rejects.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Debug on `dev` in its own worktree on `feat/{FID}` + `branches land` (plan comment proposal) | Rejected | Overridden by owner (Q1): stays in place, no new branch |
| Remove the record at `workflows close` or on push success | Rejected | Step 11 pushes and re-triggers CI after the close; the Failure Path hand-back needs the record to leave foreign paths alone. Lifetime = workflow lock (`locks release`, moved after the CI wait) or the `dev` hand-back |
| Issue-less FID rule = no all-digit word + `SLUG` | **Chosen** | Q3; tracker-independent; mint and check agree |
| CI-Dispatch Gate only on `dev` (prove a run started) | Rejected | Q1.3: debug must wait for `dev` CI on the pushed commit |
| Dispatch → `runs wait --until=completed` → `runs gate --capstone-only` on `dev` | **Chosen** | Existing commands; Gate 11 claim becomes true |
| Separate dispatch prose block for `dev` in debug Step 11 | Rejected | One block with `{DIFF_BASE}` / SHA placeholders keeps `ci-dispatch-gate-alignment.test.ts` pinning one shape |
| Relax `/bkit-auto` to run issue-less | Rejected | Non-goal: CI always dispatches it with an issue or PR |
| Auto-create an issue when none is named | Rejected | #486 never-create rule |

**Future-phase recommendations:** guard the `branches land` MCP fallback merge base (see `Suggested Scope Expansion`); consider a `bkit fids resume` lookup that maps a reworded issue-less prompt to a recent FID (deferred, Q7).

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Relax `.bkit/core/hooks/preflight-linear.sh` L13–18 for Linear cloud agents with no `LINEAR_ISSUE_ID` | Not required by any Success Criterion; Linear cloud launches always come from an issue | #650 "Open questions: answered" Q6 (scope-declared) — deferral `650-preflight-linear-issue-less` |
| Issue-less `/bkit-auto` and `bkit-cloud.yml` dispatch | Non-goal: "`/bkit-auto` stays issue-only" (#650 Constraints); T2 only pins fail-closed | #650 § Constraints and non-goals (scope-declared) — deferral `650-bkit-auto-issue-less` |
| Automatic FID continuity across reworded issue-less re-runs | Q7 "No change"; doc line in § Best-effort runs is in scope (T16) | #650 "Open questions: answered" Q7 (scope-declared) — deferral `650-issue-less-fid-continuity` |
| Live round-trip on real GitHub Actions: own-commit push (replay) → dispatch → wait → gate on the landed `dev` SHA | Owner decision on #650: no live check before merge. The build merges on the stub-`gh` Unit rows that pin the SHA hand-off (T12 / T14); the first real `/bkit-debug` on bkit's own `dev` after merge is the live check (Manual Verification Step 6). Hard-blocked for the build agent either way: it may not create a repo with Actions or push a real `dev` without human confirmation | Deferral `650-debug-dev-ci-live-round-trip` (`hard-blocked`, same form as `341-live-run-verification-mode-1-and-mode-3`) |

**Deferral rows (mirror of the table).** First three: already appended to `docs/deferrals.jsonl` (L261–263) by the plan orchestrator on behalf of `@bkit-plan-generate` — do NOT re-run the block below (it would duplicate rows); kept as the record of what was written. Fourth (`650-debug-dev-ci-live-round-trip`): appended by `@bkit-plan-update` with a `jq`-minted `ts`. T17 verifies all four.

```sh
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-preflight-linear-issue-less",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"preflight-linear.sh still stops a Linear cloud agent that has no LINEAR_ISSUE_ID",description:"`.bkit/core/hooks/preflight-linear.sh` L13-18 hard-stops a background Linear agent without LINEAR_ISSUE_ID. Issue-less runs (#650) are a session-prompt path; Linear cloud agents are always launched from an issue, so the hook is left as is.",remediation:"Relax the hook only if Linear cloud agents can be launched without an issue",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Open questions: answered, Q6)",".bkit/core/hooks/preflight-linear.sh"]}' >> docs/deferrals.jsonl
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-bkit-auto-issue-less",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"/bkit-auto and bkit-cloud.yml stay issue-only",description:"CI always dispatches /bkit-auto with an issue or PR. #650 makes the five phase workflows issue-optional and only pins that /bkit-auto fails closed on an issue-less marker or FID.",remediation:"Design issue-less cloud dispatch (kill-switch without a bkit:auto label, FID guard in bkit-cloud.yml) if CI ever dispatches without an issue",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Constraints and non-goals)",".bkit/core/workflows/bkit-auto.md"]}' >> docs/deferrals.jsonl
jq -nc '{ts:(now*1000|floor),kind:"deferral",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-issue-less-fid-continuity",type:"feature",category:"agentic",severity:"LOW",reason:"scope-declared",summary:"An issue-less re-run with different wording mints a new FID, so the attempt counter restarts",description:"Naming the FID in the prompt keeps continuity, as with the none tracker; the no-issue warning names the FID for reuse and workflows.md Best-effort runs documents it. No automatic lookup of a prior FID.",remediation:"Add a lookup that offers recent issue-less FIDs on the same branch when a prompt names none",source:"phase",status:"OPEN",references:["650","https://github.com/cbartens/bkit/issues/650 (Open questions: answered, Q7)",".bkit/core/.bkit/workflows.md"]}' >> docs/deferrals.jsonl
```

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `branches land` MCP fallback (exit 80 → agent merges via MCP) does not assert the PR base is `dev` | Survey of this plan (no ledger row) | T4 / T15 base guards | Fold in — one prose assert mirroring T15's Step 10 assert |
| `384-required-status-checks-on-dev-via-bkit-protect-main` | `docs/deferrals.jsonl` | Debug pushing straight to `dev` (T12 / T14) | Keep deferred |
| `363-main-branch-trigger-excluded-reversal` | `docs/deferrals.jsonl` | `main` guards (T4 / T5 / T15) | Keep deferred |
| `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | `docs/deferrals.jsonl` | Rollback of five-workflow prose change | Keep deferred |
| `steps-placeholder-gate-false-positive-on-derived-issue-dump` | `docs/failures.jsonl` | `steps gate --placeholder` with an empty `ISSUE_ID` (T3 / T8) | Needs design decision — T8 adds no `--placeholder=ISSUE_ID` (none of the five workflows passes one); the dump false positive is separate |
| `363-dev-dispatch-cap-self-resettable-by-controlled-principal` — `MAX_DEV_DISPATCH_ATTEMPTS` cap lives in a file the dispatched session can rewrite | `docs/deferrals.jsonl` | Open Question 1 option A (bounded retry owner after a red `dev` run) | Keep deferred; cited in OQ1's trade-off |
| `442-plan-template-design-missing-fallback-amendment` — plan template fallback when no design and no issue `Narrative` exist | `docs/deferrals.jsonl` | This plan's `Narrative` (no design or issue source; owner-supplied on #650) | Needs design decision |
| #639 open item: stale `RUNTIME_DEVPUSHES` reason at `.bkit/core/engine/commands/workflow/runtime.ts:110` | #639 (`related-issues.md`, "Still open") | Debug-on-`dev` push per runtime (Assumption) | Keep deferred |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **Role-Gated Mutation (privileged merge)** — merge into `main` enforced in the engine, not prose (Sub-Plan 1 T4: `mergePr` base check covering `prs merge`, `landPr`, `closePr`; `prs open --base=main` refused); ship Step 10 MCP fallback asserts PR base `dev` before merging (T15).
- [ ] **Data exposure (prose)** — debug Steps 9 / 10 push nothing on `dev`; Step 11 pushes only through `branches push --mode=dev`; no prose `git add -A` / `git push origin dev` reachable on `dev` (T14).

_Not applicable: New API Route, New DB Table/Column, PII, Redirect URL, Webhook, New Secret/Env Var — no routes, DB, secrets or env vars. User Input (FID path safety) and Trust boundary (`/bkit-auto`) rows are engine rows in Sub-Plan 1 (T2)._

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** No new packages; `package.json` + `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; spot-check `npx tsc --version`, `pnpm --version`, `git --version` (`commitBookkeeping` `requireGitVersion` needs `--pathspec-from-file`), `gh --version`.
- [ ] **Existing-Solution Search (reuse over duplicate):** Done at plan time → `Reuse Inventory`; build re-runs the in-repo sweep if a candidate appears mid-build.
- [ ] **User Context:** Write access to `.bkit/core/**`, `.bkit/wording.md`, `docs/**`, `CHANGELOG.md`, `dist/`; mirrors regenerated only via `pnpm bkit upgrade` (never edit `.claude/`, `.cursor/`, `.opencode/`).
- [ ] **Project Context:** Fold `docs/knowledge.jsonl` and `docs/decisions.jsonl` by `key` (highest `ts`, `ACTIVE` / absent only). Relevant: #486 never-create decision rows; CI-Dispatch Gate rows; `pushToDev` / dev-lock rows (`ship-dev-writes-through-throwaway-origin-dev-checkout` L644, `failure-path-record-own-branch-dev-fallback` L638 — both narrowed by this plan); `381-*` egress rows (no new egress); knowledge `KN-11` (skip-ci HEAD on `dev` push), `380-build-debug-dev-write-is-a-fourth-staging-shape`; OPEN failure `precommit-check-dist-blocks-parallel-agents`.
- [ ] **Testing & Quality:** `docs/testing.md` tiers — `*.test.ts` = Unit, `*.integration.test.ts` = Integration; test-first red then green; full `pnpm vitest run`, never scoped.
- [ ] **Prerequisite Plans:** Sub-Plan 1 ([650-workflows-prompt-alone-plan-1.md](650-workflows-prompt-alone-plan-1.md)) complete — Tasks 1–5, 11–13, 6 `[x]` and its Gate 4 ticked.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** N/A — none added.
- [ ] **Schema State:** N/A — no database.
- [ ] **Architecture & UI:** No new files; prose, docs and prose-shape tests only.
- [ ] **Observability:** N/A — no new log names, spans or audit tables.
- [ ] **Notifications:** N/A.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

None — bkit has no database. File stores touched (run logs, ledgers, git-path run record) are covered in `Architecture & Component Changes`.

**Invariant Conformance:** Multi-store or privileged writes → every mutation path maintains every store a read surface depends on, under a compatible privilege, with the returned error actually checked (never swallowed). If a write can fail on privilege/constraint, the plan says how that failure surfaces — not a silent 200.

Applied to file / git stores: the engine exits (`EXIT_FOREIGN_PATH`, existing `EXIT_COMMIT` / `EXIT_PUSH_FAILED`, `EXIT_SHARED_BUSY`, replay-conflict non-zero) come from Sub-Plan 1; this sub-plan's workflow prose routes every non-zero to its existing Failure Path, except `EXIT_FOREIGN_PATH` → stop and ask the human (T14). A refused `dev` push never reports `pushed: true`.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| Shared wording | `.bkit/wording.md` clause list; `pnpm wording:sync` | `workflow-issue-id-missing` et al. | EXTEND | Change text, old → `retired`; two new clauses in the same file |
| `{ISSUE_ID}` may be empty qualifier | `git grep -n "may be empty\|non-empty if required" -- .bkit/core/workflows` | Five workflows' L19 `Placeholders` rule (`non-empty if required … **Else** → **Failure Path**`) and Gate 1 item `ISSUE_ID non-empty when tracker wired; may be empty under none` (design L187, plan L200, build L203, debug L232, ship L221) | EXTEND | L19 rule names `{ISSUE_ID}` as may-be-empty under every tracker; Gate 1 item via `workflow-gate-issue-id` (T7) |

Engine reuse rows (FID rule, marker, base guards, record helpers, own-path commits, own-commit push, re-trigger, record lifetime, `dev` CI wait engine half, integration harness) live in Sub-Plan 1. Debug Step 11's CI wait (T14) reuses `bkit-build.md`'s CI wait turn loop (L54) shape per Sub-Plan 1's `dev` CI wait row.

> [!CAUTION]
> **Default = `EXTEND`.** `NEW` only allowed for:
> (a) no candidate — `Search performed` shows the commands establishing absence;
> (b) extending breaks the candidate's contract or callers — name both;
> (c) candidate is a `Supersession Inventory` `DELETE` — replacement, not duplicate.
>
> never accept cleaner-fresh / messy-existing / close-but-different as a `NEW` reason — messy candidate → extend and clean it, in scope. Empty `Search performed` = UNSEARCHED, not `NEW`-eligible.
>
> Each `EXTEND` row must land as `[MODIFY] path/to/existing` in `Architecture & Component Changes` and a task in `Agent Execution Runbook`; each `NEW` row as `[NEW]` carrying the same reason. `[NEW]` with no row = unjustified.

## Architecture & Component Changes

**CRITICAL:** Justify new file locations per `docs/architecture.md` topology.
**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` must trace to a `Reuse Inventory` `NEW` row and carry its reason — no parallel reimplementation. Superseded → `Supersession Inventory` as `DELETE`.
**CRITICAL:** Frontend/Mobile → adhere to `docs/design.md`.
**CRITICAL:** Verify `[MODIFY]` files exist (else `[NEW]`). Before changing exported symbol/signature/contract: find callers/importers/schemas/consumers (language-server references when configured + text search), list blast radius.
**CRITICAL:** Include backend actions for new schema validations (e.g. Zod `schema.parse`).
**CRITICAL:** NEVER weaken gate to pass: no type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), deleted assertions, empty `catch` / error-swallowing, mocking-away unit under test. Fix root causes; per-file opt-out needs explicit human sign-off.
**CRITICAL:** Auto-capture (e.g. log drains / CDC) does not replace explicit logging — log edge cases escaping auto-capture with the project's structured logger (e.g. `console.error("[Context] Message", payload)`). See `docs/observability.md` for naming, severity, correlation IDs, label taxonomy.

### Database Migrations

None — no database.

### Shared wording and workflows (Wave 2, Wave 3 prose)

#### [MODIFY] `.bkit/wording.md`

- Changed clauses per `Breaking Changes` (old text → `retired`); new `workflow-no-issue-warning` (names the missing issue, the FID, "no tracker reads, labels or comments", reuse hint) and `workflow-final-first-line`; `workflow-large-diff` gains `{{base}}`. `pnpm wording:sync` propagates.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`

- All five: `**No issue:**` bullet in a `bkit:tracker true` block; L19 `Placeholders` rule qualifier (`{ISSUE_ID}` may be empty, never asserted non-empty, never routes to the Failure Path); Step 1 recovery (named FID or `feat/{FID}` branch via `fids parse`) → warning → continue; mint clause; `--issue="{ISSUE_ID}"` on `fids check` + Gate 1 `steps gate`; no workflow adds `--placeholder=ISSUE_ID` (none does today); `**Skip if** ISSUE_ID empty` before every `issues labels --board` fence (two per workflow), `issues comment` / `issues text`, Failure Path tracker writes; `prs open` / `branches land` drop `--issue` when empty; warning first in close return, summary-FAIL display (design 10, plan 11, build 17, debug 10, ship 6), Failure Path STOP; `Append issue link` skipped when empty; gate items "skipped when `ISSUE_ID` empty"; Jira related-issues `key != {ISSUE_ID}` dropped when empty (design / plan / debug). ASCII operators only.
- design Step 11 guarded; build Step 1.4 + Step 18.9 kill-switch guarded; Failure Path L59–89 tracker writes guarded.
- Mint clause: a minted FID rejected by `fids check --issue=""` → re-mint once with every all-digit word dropped; second reject → Failure Path.
- debug: Step 1 sub-step 6 — no `prs probe` on `dev` / `main`, `PUSH_MODE=LOCAL`; Step 2 sub-step 1 (L250–252) holds `startSha` as `{DIFF_BASE}` on `dev`; Steps 9 / 10 (L552 / L576) push nothing on `dev`; Step 11.9 kill-switch guarded; `{DIFF_BASE}` replaces `origin/dev` on `dev` in the Large Diff Guard (L54), Failure Path handover (L84), Summary (L569) and No-leak Assertion (L620); Step 11 (L593–738) on `dev`: `branches push --mode=dev` (replaces `--mode=feature --require-ci` at L626), dispatch on the pushed `sha`, `runs wait --until=completed`, `runs gate --capstone-only`, then `locks release` (moved from L625 to after the wait), red → Failure Path; `{CLOSE_PARENT}` for `steps done --parent-sha` / `prs transport-row --sha` (L628–632) = pushed `sha` on `dev`; `pushToDev` refusal / replay conflict → Failure Path; Gate 11 item true on `dev`; no prose `git add -A` / `git commit` / `git push origin dev` reachable on `dev` (Step 11.6 L649 `TRIGGER_PR` commit is feature-branch only and stays).
- ship: L236 issue-less → warn when branch is not `feat/{FID}`; refusal flow prints the engine text and STOPs; Step 14.3 labels guarded; Step 10 (L505–542) MCP fallback asserts PR base `dev` before merge; Step 10 tracker label re-read (L507) skipped when `ISSUE_ID` empty (`{LABEL_FLAGS}` empty); Step 2 L258 assert kept.
- Each workflow edit updates its `.bkit/core/.bkit/workflows.md` rows in the same task (repo rule § Workflow edits).
- **Contract-change sweep (`{ISSUE_ID}` may be empty):** `.bkit/core/prompts/` hits `bkit-audit-generate.md` (9) and `bkit-utility-update-tracker.md` (1), neither invoked by the five workflows (`grep -rl "audit-generate\|update-tracker" .bkit/core/workflows` empty); `.bkit/core/docs/templates/` no hits → no prompt / template change.

#### [MODIFY] `.bkit/core/AGENTS.md`

- Router (L27–49, L33): drop `STOP with No issue ID provided.`; no issue → warning, continue.

### Docs (Wave 4)

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/lite.md`, `docs/testing.md`, `CHANGELOG.md`

- Per `Documentation Updates`.

#### [MODIFY] `dist/` and mirrors

- `pnpm build` → `pnpm bkit upgrade` (Task 18); `pnpm bkit check` + `pnpm bkit:check:dist` gate them. Mirrors never hand-edited.

### Tests

#### [MODIFY] existing tests

- `workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts`, `wording.test.ts` — per runbook task. (Engine suites → Sub-Plan 1.)

### Ledger Rows (decisions)

Already appended to `docs/decisions.jsonl` (L666–668) by the plan orchestrator on behalf of `@bkit-plan-generate` — do NOT re-run the three rows below (they would duplicate); kept as the record of what was written.

**Correction row (pending, same key).** `650-debug-on-dev-in-place-own-files-own-commits` as appended predates the plan review: it leaves open which commits count as the run's, omits the close commit, the Steps 9 / 10 pushes and the CI re-trigger, and does not reference the decisions it narrows. The row is append-only → one same-key correction row, never an in-place edit. `@bkit-plan-update` is not a listed decision writer (`.bkit/jsonl.md` § writers): the plan orchestrator appends it through `@bkit-utility-update-decisions` (correct) before Gate 1; T17 verifies the winning row.

```sh
jq -nc '{ts:null,kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-update",subagent:"bkit-utility-update-decisions",model:"claude-opus-5-5",key:"650-debug-on-dev-in-place-own-files-own-commits",references:["650","failure-path-record-own-branch-dev-fallback","ship-dev-writes-through-throwaway-origin-dev-checkout",".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/workflows.ts",".bkit/core/engine/commands/workflow/locks.ts",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/runs.ts",".bkit/core/engine/commands/land.ts",".bkit/core/workflows/bkit-debug.md"],summary:"/bkit-debug on dev works in place in the main checkout, commits only its own paths, pushes only the commits it made and waits for dev CI on the pushed commit",description:"worktrees setup records local dev HEAD and the modified and untracked paths with content hashes (line counts for append-only jsonl ledgers) under the git dir when debug runs in place on a shared branch, and returns startSha as the debug diff base. steps finish, bookkeeping and workflows close commits stage only paths outside that set (recorded ledgers: only the rows the run appended), refuse when another recorded path changed, and append each commit SHA to the record. branches push in every mode on a shared branch with a record pushes exactly those SHAs: plainly when origin/dev..HEAD equals them, else replayed onto origin/dev through pushToDev in a throwaway checkout with hooks off; the CI-Dispatch re-trigger goes the same way. Debug Steps 9 and 10 push nothing on dev. Step 11 dispatches, waits for and gates the dev CI run on the landed SHA, then releases the workflow lock, which removes the record; the dev hand-back also removes it. Step 1 never probes for a PR on dev, so PUSH_MODE is LOCAL. Debug still creates no branch. Narrows failure-path-record-own-branch-dev-fallback: debug fix commits may now reach dev through pushToDev; the Failure Path from dev still lands bookkeeping only. Widens ship-dev-writes-through-throwaway-origin-dev-checkout: pushToDev also replays debug code commits.",rationale:"git add -A swept unrelated files into debug commits (workflows close included), git push origin dev pushed unrelated local commits from Steps 9, 10 and 11 and the CI re-trigger, startSha..HEAD would still sweep in commits others make mid-run, Gate 11 claimed a CI check that never happened on dev, and the Step 1 PR lookup could pick up and retitle an open dev-to-main release PR.",alternatives:["Worktree on feat/{FID} plus branches land: rejected by the owner (#650 Q1)","git stash around the run: rejected, the stash stack is shared across worktrees and sessions","Own commits = startSha..HEAD: rejected, sweeps in foreign mid-run commits","Remove the record at workflows close: rejected, the push, re-trigger and Failure Path hand-back run after it","Temporary index for every commit: kept for the empty-own-set and ledger-row cases only, pathspec commits already isolate the index"],status:"ACTIVE"} | .ts = (now*1000|floor)' >> docs/decisions.jsonl
```

```sh
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-issue-less-runs-warn-and-continue",references:["650","486","490",".bkit/core/engine/commands/workflow/fids.ts",".bkit/wording.md",".bkit/core/.bkit/workflows.md"],summary:"A wired-tracker run with no issue in the prompt warns and continues issue-less instead of stopping; workflows still never create tracker issues",description:"Step 1 of /bkit-design, /bkit-plan, /bkit-build, /bkit-debug and /bkit-ship recovers the issue from a FID named in the prompt or a feat/{FID} branch. With none it sets ISSUE_ID empty, prints the no-issue warning (also the first line of every final message) and skips every issue-tied tracker read, label, comment and board call. The issue-less FID is {branch-suffix}-{slug} with all-digit words dropped; fids check and steps gate take --issue and reject a FID with an all-digit word when --issue is empty. PR markers carry only bkit:fid; fromMarker and fromBranch return issueId null for it. /bkit-auto stays issue-only.",rationale:"After #490 made design and plan optional the issue was the last required input, and requiring it blocked /bkit-debug on red dev CI. This reverses the stop half of #486; the never-create half stays. Dropping all-digit words makes an issue-less FID unparseable as an issue id under github, linear and jira regardless of the tracker in force.",alternatives:["Keep the STOP: rejected, blocks dev CI repair","Auto-create an issue: rejected, #486 never-create rule","Reject only FIDs matching the active tracker shape: rejected, a tracker switch could make an old FID parse as an issue"],status:"ACTIVE"}' >> docs/decisions.jsonl
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-ship-never-targets-main",references:["650",".bkit/core/engine/commands/workflow/prs.ts",".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/workflows/bkit-ship.md"],summary:"/bkit-ship never opens or merges a PR into main; bkit prs open refuses --base=main and bkit prs merge refuses any PR whose base is not dev",description:"worktrees setup refuses ship on dev or main with text saying releases stay manual, keeping the refusing to ship prefix. prs merge reads the live PR base at merge time, so a PR retargeted to main after ship Step 2 is never merged; the ship Step 10 MCP fallback asserts the base first. Releasing dev into main stays manual and utility-new-release stays separate and bkit-internal.",rationale:"Nothing re-checked a PR base after ship Step 2, so a PR retargeted to main mid-run would have been merged into main; prose asserts are not enforcement.",alternatives:["Prose-only refusal in bkit-ship.md: rejected, not enforced","prs open refusing every non-dev base: rejected, the owner scoped the open guard to main (Q4)","Fold the release into /bkit-ship: rejected, releases stay manual"],status:"ACTIVE"}' >> docs/decisions.jsonl
jq -nc '{ts:(now*1000|floor),kind:"decision",repo:"cbartens/bkit",bkitVersion:"5.5.0",workflow:"plan",step:"plan-generate",subagent:"bkit-plan-generate",model:"claude-opus-5-5",key:"650-debug-on-dev-in-place-own-files-own-commits",references:["650",".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/land.ts",".bkit/core/workflows/bkit-debug.md"],summary:"/bkit-debug on dev works in place in the main checkout, commits only its own paths, pushes only its own commits and waits for dev CI on the pushed commit",description:"worktrees setup records local dev HEAD and the modified and untracked paths with content hashes under the git dir when debug runs in place on a shared branch. steps finish and bookkeeping commits stage and commit only paths outside that set and refuse when a recorded path changed. branches push --mode=dev pushes plainly when local dev was level with origin/dev at the start, else replays the run commits onto origin/dev through pushToDev in a throwaway checkout. Step 1 never probes for a PR on dev, so PUSH_MODE is LOCAL. Step 11 dispatches, waits for and gates the dev CI run on the pushed SHA. Debug still creates no branch.",rationale:"git add -A swept unrelated files into debug commits, git push origin dev pushed unrelated local commits, Gate 11 claimed a CI check that never happened on dev, and the Step 1 PR lookup could pick up and retitle an open dev-to-main release PR.",alternatives:["Worktree on feat/{FID} plus branches land: rejected by the owner (#650 Q1)","git stash around the run: rejected, the stash stack is shared across worktrees and sessions","Temporary index for every commit: kept for the empty-own-set case only, pathspec commits already isolate the index"],status:"ACTIVE"}' >> docs/decisions.jsonl
```

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/core/AGENTS.md` L33 `STOP with No issue ID provided.` | Warning-and-continue router line | DELETE | Contradicts the new contract |
| Debug Step 11 prose `git add -A` / `git push origin dev` (if any survive) and the `dev`-path `branches push --mode=feature --require-ci` (L626) | `steps finish` / `branches push --mode=dev` | DELETE | Bypasses the shared-checkout record |
| `.bkit/wording.md` STOP texts of changed clauses | Same clauses' new `text`; old text in `retired` | RETAIN-WITH-REASON | (a) external contract — `retired` blocks are how `wording:sync` / `wording.test.ts` detect stale copies in consumer files; not exported code |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date and follow-up issue link.
>
> never accept `@deprecated` and still exported as a resolution. Each `DELETE` row must be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

No file-level `[DELETE]`: every row removes a symbol or text inside a `[MODIFY]` file; removal tasks: T10 (`AGENTS.md`), T14 (debug prose), T7 (wording → `retired`). Engine rows (T4 `FID_FORMAT` / `ISSUE_FORMAT`, T5 worktrees texts, T12 `land.ts` header + `pushToDev` text) → Sub-Plan 1.

## Documentation Updates

> Docs this change touches only; delete rest. Core below; others via `.agents/docs.md`. Code-change treatment — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | 3 rows (`650-issue-less-runs-warn-and-continue`, `650-ship-never-targets-main`, `650-debug-on-dev-in-place-own-files-own-commits`) appended (L666–668); 1 same-key correction row for `650-debug-on-dev-in-place-own-files-own-commits` via the jq block in Architecture § Ledger Rows |
| `docs/deferrals.jsonl` | 4 rows (`650-preflight-linear-issue-less`, `650-bkit-auto-issue-less`, `650-issue-less-fid-continuity`, `650-debug-dev-ci-live-round-trip`) appended |
| `docs/testing.md` | Rewrite rows L587 / L606 (FID / workflow-shape coverage) for `--issue` and issue-less markers; add a row for `shared-checkout.integration.test.ts` |
| `.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`) | L148 / 151 / 152 / 174; § FID generation ("No issue →" issue-less shape, all-digit words dropped, re-mint once on reject); § Best-effort runs (no issue → warning first line, continue; naming the FID keeps continuity, Q7); § Branch eligibility (ship never `dev` → `main`; debug on `dev` in place: own paths, own recorded commits, a mid-run edit by someone else counts as the run's (Open Question 5), waits for `dev` CI, Steps 9 / 10 push nothing); L137 "One landing routine for every dev write" (`pushToDev` also replays a debug-on-`dev` run's own commits; drop "lands docs / logs / ledger files only, under `[skip ci]`" for that case); L744 Failure Path `dev` / `main` bullet (run commits already made on local `dev` stay unpushed; hand-back leaves recorded paths and the record's foreign ledger rows alone; record removed); Step 1 rows L843 / 867 / 893 / 931 / 984; ship naming-warning rows; L1364–1388. Each workflow's rows land with its task (T8 / T9 / T14 / T15); T16 sweeps the rest |
| `.bkit/core/.bkit/trackers.md` (→ `.bkit/trackers.md`) | L74 `issue-id-extraction` (recovery from FID / branch), L75 `fid-format` (issue-less rule), L86–87 PR marker (FID-only under a wired tracker), L157 / L163 |
| `.bkit/core/.bkit/lite.md` (→ `.bkit/lite.md`) | L25: no issue named → skip the tracker lines |
| `.bkit/core/AGENTS.md` (→ `AGENTS.md`) | Router L33 (T10) |
| `CHANGELOG.md` | `[Unreleased]` — Added: issue-less runs, `--issue` flag, engine main-base guards, debug-on-`dev` own-path / own-commit push + CI wait; Changed: ship refusal text, `main` refused in place for design / plan / build, `bkit prs merge` refuses a PR whose base is not `dev` (consumer scripts merging another base break); Fixed: ship naming warning issue-less, build 18.9 / debug 11.9 kill-switch, ship 14.3 on merged runs |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database |
| **Code** | `git revert {COMMIT}` of the wave commits (or the squash); rebuild `dist/`; `pnpm bkit upgrade` regenerates mirrors; consumers pin the previous `@cbartens/bkit` version | Engine + workflows ship together in the package; reverting one without the other leaves workflows passing `--issue` to an engine that rejects unknown flags |
| **Risk window** | Issue-less PRs opened before a revert carry `<!-- bkit:fid=X -->` under a wired tracker; the reverted `fromMarker` no longer resolves them | Recovery: name the FID in the prompt; `/bkit-auto` already refuses them, so no cloud run fires |

_Code-only — `git revert` sufficient._ Reverting only this sub-plan leaves Sub-Plan 1's engine in place with today's workflows (absent `--issue` = today) — safe.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

**Integration shape (advisory):** runs after Sub-Plan 1 on the same branch; master Wave 2, then master Wave 3 prose, then master Wave 4; each wave reviewed before commit. Task numbers are the master's (7–10, 14–19). Workflow edits update their `.bkit/core/.bkit/workflows.md` rows in the same task and wave commit (T8 / T9 / T14 / T15); T16 sweeps the remaining doc rows. Mirrors are regenerated once, in Task 18, before Task 19's full verification, so the sub-plan ends with `pnpm bkit check` green.

**Implementation Tasks:**

> Every task MUST include `**Done when:**` — terse, testable, codebase-verifiable (file exists / signature matches / test passes / behaviour observable). Plan-verify asserts before `[x]`. No task without `Done when:`. One task per in-scope audit finding id; group only on one shared root cause in report — every id still named.
>
> **Tests ship with their task.** Task adding / changing logic → names its own unit tests in `Done when`, matrix row or not; tests it breaks → fixed in same task. never defer task tests to later tasks to avoid splits that leave untested code and drop coverage gates.
>
> **Build order and test source.** Order tasks by build dependency (schema → API → UI). Behaviour tests only from `Derived Test Matrix` rows — do not invent. Boundary-crossing tasks (DB / API / model / network / migration) carry paired non-mock `Done when` tests; pure-function tasks exempt from pairing, not from unit tests.
>
> **Test first.** Every task MUST include `**Test first:**` after `Done when`. Behaviour change at unit / integration tier → one or more tests, `;`-separated, each `` `{test file}` `` `` `{test name}` `` fails on {assertion} — repo-relative test files, test names as the runner reports them or their last segments, no `;` in assertion text; build sees each fail against stubs before writing the task's code. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}`.
>
> **Issue tasks.** Change-shape issue (`.bkit/trackers.md` § Issue shapes) → its `Tasks` lines are the starting runbook; keep each `Done when` / `Test first` (tighten, never weaken); renumber in build order.

**Wave 2 — Wording and the five workflows**

- [x] **Task 7:** `.bkit/wording.md` clauses. **Done when:** `workflow-issue-id-missing` / `-none` text = recover from FID / branch, else `ISSUE_ID=""`, emit `workflow-no-issue-warning`, continue, never create a tracker issue; `workflow-issue-read-none` is a template with a reason slot (no tracker wired / no issue named); `workflow-fid-mint` / `workflow-fid-unset` apply under every tracker (issue-less shape, slug from the prompt, all-digit words dropped; a minted FID rejected by `fids check --issue=""` → re-mint once with every all-digit word dropped, second reject → Failure Path); `workflow-gate-issue-id` = "issue resolved, or the no-issue warning emitted"; `workflow-issue-link` skipped when empty; `workflow-large-diff` has `{{base}}`; new `workflow-no-issue-warning`, `workflow-final-first-line`; every old text in its clause's `retired` block; `pnpm wording:sync` exits 0; `.bkit/core/engine/tools/wording.test.ts` green, with new rows for the clauses below. **Test first:** `.bkit/core/engine/tools/wording.test.ts` `workflow-issue-id-missing has no STOP` fails on the STOP text in the clause; `.bkit/core/engine/tools/wording.test.ts` `changed issue clauses keep their old text in retired` fails on the missing retired entry; `.bkit/core/engine/tools/wording.test.ts` `workflow-fid-mint re-mints once on a fids check reject` fails on the missing re-mint text. Workflow behaviour also pinned by Task 8 / Task 9 `workflow-shape.test.ts` rows.
- [ ] **Task 8:** Shared changes in all five workflows. **Done when:** each of `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` has: `**No issue:**` header bullet inside `<!-- bkit:tracker true start -->…end`; `{PLACEHOLDERS}` line qualifier "`{ISSUE_ID}` may be empty" in the L19 `Placeholders` rule (an empty `{ISSUE_ID}` never routes to the Failure Path); Step 1 sub-step 2 recovery (`ISSUE_ID` from a named FID or a `feat/{FID}` branch via `fids parse`, before any warning) → warning → continue and sub-step 3 empty inputs (no STOP on a missing issue in any wired-tracker block); `--issue="{ISSUE_ID}"` on `fids check` and Gate 1 `steps gate`; no `--placeholder ISSUE_ID=` when empty (no workflow adds `--placeholder=ISSUE_ID` at all); `**Skip if** ISSUE_ID empty` before every `issues labels --board` fence, `issues comment` / `issues text` block and Failure Path tracker write (`bkit-build.md` L59–89 and peers); `prs open` / `branches land` without `--issue` when empty; warning first in close return, summary-FAIL display (design 10, plan 11, build 17, debug 10, ship 6) and Failure Path STOP; `Append issue link` skipped when empty; gate items read "skipped when `ISSUE_ID` empty"; Jira related-issues `key != {ISSUE_ID}` dropped when empty; every tracker MCP call (`mcp__github__*`, `mcp__linear__*`, `mcp__jira__*`, e.g. Step 1 sub-step 3 issue reads, `bkit-debug.md` L121–129) and every `bkit issues *` fence (`labels`, `comment`, `text`) sits behind the empty-`ISSUE_ID` guard; matching `.bkit/core/.bkit/workflows.md` rows (Step 1 rows L843 / 867 / 893 / 931 / 984, § FID generation, § Best-effort runs) updated in this task; `workflow-shape.test.ts` new rows green; `render/trackers.test.ts` `none` output byte-identical. **Test first:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty` fails on the first unguarded Step 1 sub-step 3 issue read; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `no wired-tracker block STOPs on a missing issue` fails on the STOP match in Step 1; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `fids check and steps gate carry --issue in every workflow` fails on the missing flag; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `No issue bullet sits in a tracker true block` fails on the missing bullet; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `every issues labels --board fence has a Skip if ISSUE_ID empty line` fails on the first unguarded fence; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `final messages start with the no-issue warning clause` fails on the missing clause; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Step 1 recovers ISSUE_ID from a named FID or feat branch before warning` fails on the missing fids parse recovery before the warning in Step 1; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Placeholders rule lets ISSUE_ID be empty in every workflow` fails on the L19 non-empty-if-required rule with no ISSUE_ID qualifier; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Jira related-issues query drops key != when ISSUE_ID is empty` fails on the unconditional key != clause.
- [x] **Task 9:** Per-workflow skips. **Done when:** design Step 11 runs only with an issue; build Step 1.4 blocker check and Step 18.9 kill-switch skipped when `ISSUE_ID` empty; debug Step 11.9 kill-switch skipped when empty; debug Step 1 sub-step 6 runs no `prs probe` on `dev` / `main` (`PUSH_MODE=LOCAL`); plan `fids design` unchanged; matching `.bkit/core/.bkit/workflows.md` rows updated in this task; `workflow-shape.test.ts` rows green. **Test first:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build 18.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty` fails on the missing Skip if line; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Step 1 never probes for a PR on dev or main` fails on the unguarded prs probe; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `design Step 11 requires an issue` fails on the missing Skip if line.
- [x] **Task 10:** Router. **Done when:** `.bkit/core/AGENTS.md` has no `No issue ID provided`; router line says no issue → warning, continue; `workflow-shape.test.ts` row green. **Test first:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `AGENTS.md router does not STOP on a missing issue` fails on the L33 STOP with No issue ID provided text.

**Wave 3 (prose) — Debug on `dev` in place, ship hardening**

- [x] **Task 14:** Debug on `dev` prose (Steps 2, 9, 10, 11 and the `{DIFF_BASE}` sites). Depends on Tasks 11–13. **Done when:** `.bkit/core/workflows/bkit-debug.md` on `dev`: Step 2 sub-step 1 (L250–252) holds `worktrees setup` `startSha` as `{DIFF_BASE}`; Steps 9 / 10 (L552 / L576) run no `branches push` on `dev`; Step 11 on `dev`: Large Diff Guard uses `{DIFF_BASE}` = record start SHA (`workflow-large-diff` `{{base}}`; `workflow-shape.test.ts` L248 updated), and so do the Failure Path handover Read (L84), Summary Read (L569) and No-leak Assertion (L620); `bkit branches push --mode=dev` (replaces `--mode=feature --require-ci` at L626); `bkit runs dispatch` on the pushed SHA (`sha` from `branches push`, never `git rev-parse HEAD`); `bkit runs wait --until=completed`; `bkit runs gate --capstone-only`; `bkit locks release` after the wait (moved from L625); `{CLOSE_PARENT}` for `steps done --parent-sha` and `prs transport-row --sha` (L628–632) = the pushed `sha`; red → Failure Path naming the run (Open Question 1 default A); `pushToDev` refusal / replay conflict → Failure Path; `EXIT_FOREIGN_PATH` → STOP asking the human (no Failure Path); Gate 11 "CI-Dispatch gate ran" true on `dev`; no prose `git add -A` / `git push origin dev` left on the `dev` path (`grep -n "git push origin" .bkit/core/workflows/bkit-debug.md` empty; `grep -n "git add -A" .bkit/core/workflows/bkit-debug.md` hits only the Step 11.6 `TRIGGER_PR` feature-branch commit, L649, which a `workflow-shape.test.ts` row asserts is unreachable on `dev`); matching `.bkit/core/.bkit/workflows.md` rows (§ Branch eligibility debug-on-`dev`, L137, L744) updated in this task; `workflow-shape.test.ts` new rows; `ci-dispatch-gate-alignment.test.ts` (L46–90, L207–236) updated + new rows. **Test first:** `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev waits for and gates the dev CI run` fails on the missing runs wait call; `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev dispatches by pushed sha` fails on the empty --pr match; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Steps 9 and 10 push nothing on dev` fails on the unguarded branches push --mode=feature; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug diffs against DIFF_BASE on dev` fails on origin/dev..HEAD in the Large Diff Guard; `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev releases the lock after the CI wait` fails on locks release before branches push; `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev records the close against the pushed sha` fails on CLOSE_PARENT taken from workflows close; `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `debug Step 11 on dev routes a red run to the Failure Path naming the run` fails on the missing red-conclusion branch after runs wait; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug stops and asks on EXIT_FOREIGN_PATH` fails on the missing STOP-and-ask line.
- [x] **Task 15:** Ship prose hardening. **Done when:** `.bkit/core/workflows/bkit-ship.md` L236 issue-less → warn when branch is not `feat/{FID}`; `dev` / `main` refusal prints the engine text and STOPs; Step 14.3 labels guarded by `**Skip if** ISSUE_ID empty`; Step 10 (L505–542) MCP fallback asserts PR base `dev` before merging; Step 2 L258 assert and Step 10 label re-read before `prs merge` kept when `ISSUE_ID` is set; Step 10 tracker label re-read (L507) skipped when `ISSUE_ID` is empty (`{LABEL_FLAGS}` empty, no tracker call); matching `.bkit/core/.bkit/workflows.md` ship naming-warning rows updated in this task; `ship-invariants.test.ts` new rows green, existing rows unchanged except the Step 10 re-read row (L564 `Step 10 re-reads the labels through the tracker and passes them to the merge`), which also asserts the empty-`ISSUE_ID` skip. **Test first:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 label re-read skips when ISSUE_ID is empty` fails on the missing Skip if line; `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `naming warning fires issue-less when the branch is not feat/{FID}` fails on the ISSUE_ID-only condition; `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 MCP merge asserts base dev` fails on the missing assert; `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 14.3 labels skip when ISSUE_ID is empty` fails on the missing Skip if line.

**Wave 4 — Docs, ledgers, mirrors, verification**

- [ ] **Task 16:** Docs. **Done when:** every `Documentation Updates` row except the two ledgers is done — `.bkit/core/.bkit/workflows.md` (rows not already landed with T8 / T9 / T14 / T15, L137 and L744 included), `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/lite.md`, `docs/testing.md` (L587 / L606 rewritten; `shared-checkout.integration.test.ts` row), `CHANGELOG.md` `[Unreleased]` (the `prs merge` refusal under Changed); `grep -rn "No issue ID provided\|No issue ID in the session prompt" .bkit/core` hits only `retired` blocks; `git grep -n "lands bookkeeping only" -- .bkit/core` empty and `.bkit/core/.bkit/workflows.md` L137 names the debug-on-`dev` replay as a `pushToDev` use; prose is current-state only. **Test first:** n/a — docs.
- [x] **Task 17:** Ledger rows present. **Done when:** `jq -c 'select(.key|startswith("650-"))' docs/decisions.jsonl docs/deferrals.jsonl` prints the 3 decision + 3 deferral rows from this plan with numeric `ts` (appended by the plan phase), plus the `650-debug-on-dev-in-place-own-files-own-commits` correction row (the key's highest-`ts` row references `failure-path-record-own-branch-dev-fallback` and `ship-dev-writes-through-throwaway-origin-dev-checkout`) and the `650-debug-dev-ci-live-round-trip` deferral (`reason: "hard-blocked"`); `pnpm bkit check` ledger lint passes. If absent, STOP and report — the build orchestrator is not a listed writer for either kind (`.bkit/jsonl.md` L40 / L43). **Test first:** n/a — ledger data.
- [x] **Task 18:** Mirrors and `dist/`. **Done when:** `pnpm build` → `pnpm bkit upgrade` → `git config core.bare false` run; `.bkit/workflows.md`, `.bkit/trackers.md`, `.bkit/lite.md`, `AGENTS.md`, `.claude/`, `.cursor/`, `.opencode/`, `.codex/` and Codex workflow skills `.agents/skills/bkit-{design,plan,build,debug,ship}/SKILL.md` mirrors regenerated (no hand edits); `pnpm bkit check` and `pnpm bkit:check:dist` exit 0. **Test first:** n/a — generated mirrors.
- [x] **Task 19:** Full verification + dogfood. **Done when:** `pnpm bkit:gate:static-unit-integration` exits 0 (full `pnpm vitest run`, not scoped; `tsc`); `pnpm bkit check` exits 0; `pnpm bkit:check:dist` exits 0; packed-tarball dogfood in a fresh scratch consumer under `/private/tmp` (outside the repo on purpose: under repo `tmp/` the consumer resolves packages from bkit's own `node_modules` and hides a missing runtime dependency, so `.agents/rules.md` § Tmp files does not apply) with the github tracker (`Manual Verification` steps 1–5) shows: rendered workflows for every host (`.claude/`, `.cursor/`, `.opencode/`, Codex `.agents/skills/` via `bkit install --codex`) with no Step 1 STOP on a missing issue; `fids check` / `steps gate` issue-less pass and digit-word fail; `prs open` with `gh` off `PATH` exits 80 with `<!-- bkit:fid=dev-ci-failures -->` in the printed body; `prs open --base=main` refused; `bkit install` and `bkit upgrade` both exercised. **Test first:** n/a — verification of earlier tasks.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds — reusable artifact found mid-build → add a row, fold code into it; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Test first:** every task naming `Test first` tests recorded a red per test before its code; tests unchanged since except added tests / formatting.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (e.g. Vitest), not through a browser. Mock HTTP and assert against the real datastore natively.
> - **End-to-end integration** — core data paths need at least 1 integration test firing the real API against a local DB _without_ ORM/DB mocking.
> - **UI E2E (browser or device) for UI only** (e.g. Playwright) — don't drive a UI for non-visual logic.
>
> **UI E2E Conventions** — test-auth + data-factory per `docs/testing.md`: shared `setup` logs in once, reuses auth state (sign-in / sign-up / account-deletion tests opt out); typed factories with per-test overrides, not inline strings.

Applied here: workflow / wording / router prose at Unit (Vitest shape tests over the source `.md` files and the renderer); the engine's real-`git` Integration coverage lives in Sub-Plan 1 and runs again in Task 19's full suite; no UI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row → one runbook task whose `Done when` carries its test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke; full suite green per `docs/testing.md`. Fix only what tasks missed.
- [ ] **Sweep new tests:** Each task's `Done when` tests exist and pass per Testing Strategy; add only what tasks missed — not where tests are first written. Reuse data factories + auth conventions (above) for UI E2E tests.
- [ ] **Verify observability:** N/A for logs / spans — the workflows surface engine refusals (from Sub-Plan 1) verbatim; confirm the debug Step 11 Failure Path names the red run and `EXIT_FOREIGN_PATH` STOP names the paths.
- [ ] **Update documentation:** Integrate logic into affected docs per `Documentation Updates` (Task 16); `docs/decisions.jsonl` rows present (Task 17). Rewrite ground-truth prose; do not append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does. Do not write "before merge" on untickable boxes — CI/human-only preconditions (lane RUN, deployed state, operator step) unenforceable. Work that MUST block merge → runbook task + codebase-verifiable `Done when`; lane that must run → CI config, not plan prose.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (typecheck, lint, `format:check`, prose, `slop:delta`, unit, integration) + `pnpm bkit check` + `pnpm bkit:check:dist`. Do not weaken gates (anti-suppression CRITICAL under Architecture & Component Changes).
- [ ] **Test Synchronization:** Existing tests updated in their task — `workflow-shape.test.ts` L248 Large Diff Guard (T14), `ci-dispatch-gate-alignment.test.ts` L46–90 / L207–236 (T14), `ship-invariants.test.ts` L564 Step 10 re-read (T15); unchanged-expectation suites kept green: other `ship-invariants.test.ts` existing rows, `wording.test.ts` existing rows, `render/trackers.test.ts` `none` output, and every Sub-Plan 1 engine suite.
- [ ] **Build Configuration:** No new test files here; Sub-Plan 1's `shared-checkout.integration.test.ts` stays out of `dist/` (`pnpm bkit:check:dist` clean after Task 18).
- [ ] **Unit (`workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts`, `wording.test.ts`):** rows per Derived Test Matrix.
- [ ] **Integration:** none owned here; full suite re-runs Sub-Plan 1's integration files (`shared-checkout.integration.test.ts`, `close-squash.integration.test.ts`, `cloud-ctx-step.integration.test.ts`).
- [ ] **Apply local migrations:** N/A — no migrations.
- [ ] **Run all tests:** `pnpm vitest run` (full suite, not scoped); fix failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Build / compiler / test errors during verification → never hot-fix or anti-pattern; follow `docs/architecture.md` + named reference repos. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can (Dashboard Ban below). An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (e.g. `gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** `pnpm build` → `pnpm pack` → fresh dir under `/private/tmp` (outside the repo, see Task 19) → `git init`, set the github tracker → install the tarball → `npx bkit install`; render the five workflows and confirm no wired-tracker Step 1 block STOPs on a missing issue and each carries the `**No issue:**` bullet. Repeat via `npx bkit upgrade` from the previous published version in a second scratch dir.
- [ ] **Step 2:** In the scratch consumer: `npx bkit fids check --fid=dev-ci-failures --issue=""` → exit 0; `--fid=123-fix --issue=""` → exit 1; `npx bkit fids parse` on `feat/dev-ci-failures` → `issueId: null`; `npx bkit steps gate … --fid=dev-ci-failures --issue=""` → FID check `ok: true`.
- [ ] **Step 3:** With `gh` off `PATH`, `npx bkit prs open … --fid=dev-ci-failures` (no `--issue`) → exit 80, printed body contains `<!-- bkit:fid=dev-ci-failures -->`; `npx bkit prs open … --base=main` → refused before any `gh` call.
- [ ] **Step 4:** Scratch repo + local bare remote on `dev`: modified `notes.md`, one unpushed commit; run `worktrees setup` (debug, in place) → `steps finish` → a second foreign commit by hand → `workflows close` → `branches push --mode=dev`; `git log origin/dev` shows only the run commits (close included), `git status` still shows `notes.md` modified, both foreign commits remain local, output has `replayed: true` and a `sha` equal to `git rev-parse origin/dev`; the record file still exists until `locks release`.
- [ ] **Step 5:** `npx bkit worktrees setup` for ship on `dev` → the releases-stay-manual refusal text.
- [ ] **Step 6:** Live session in a tracker-wired consumer on `dev` with red CI: `/bkit-debug ci failures on dev` → warning printed at Step 1 and as line 1 of the final message; no `bkit issues *` call in the transcript; fix lands on `origin/dev`; `gh run list --branch dev --commit {SHA}` shows the waited-on run. Owner decision on #650: run as the first real `/bkit-debug` on bkit's own `dev` after merge, not before. Closes deferral `650-debug-dev-ci-live-round-trip` when run.

<!-- bkit:end -->
