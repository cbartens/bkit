<!-- bkit:anchor
baseSha: dee808e19e294c3268619a0beaf4d7848ba11436
baseRef: origin/dev
bkitVersion: 5.5.0
bkitLatest: 5.5.0
-->
<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Run Workflows From the Prompt Alone Implementation Plan — Sub-Plan 1 of 2: Engine

**Parent Plan:** [650-workflows-prompt-alone-plan.md](650-workflows-prompt-alone-plan.md)

**Sibling sub-plans:** [650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md) (Sub-Plan 2 of 2: wording, workflows, docs, ledgers, mirrors, verification) — runs after this sub-plan.

**Sub-plan scope:** engine source, engine tests and `dist/` only — master Tasks 1–5, 11–13, 6 (task numbers kept from the master). No `.bkit/core/workflows/*`, `.bkit/wording.md`, `.bkit/core/.bkit/*`, `.bkit/core/AGENTS.md`, `docs/**` or mirror edits here; those are Sub-Plan 2. Boundary: every workflow keeps passing no `--issue` (absent = today), so the engine changes leave `pnpm bkit:gate:static-unit-integration`, `pnpm bkit check` and `pnpm bkit:check:dist` green with unchanged prose.

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

**This sub-plan delivers:** the engine half of every goal — issue-less FID rule + `--issue` flag (T1 / T3), issue-less marker / branch parse + `/bkit-auto` fail-closed (T2), FID-only PR marker + `main` base guards (T4), `worktrees setup` refusals (T5), shared-checkout record + own-path commits (T11), own-commit push (T12), `runs dispatch` on `dev` (T13), `dist/` (T6). Sub-Plan 2 wires the workflows to these contracts.

**Inputs and precedence.** No design doc (issue decision 5: built straight from the issue plan comment). Issue #650 body + plan comment; the "Open questions: answered" comment (Q1–Q7) overrides the plan comment's "Decisions I'm proposing" and "Open points". Plan comment waves 1–4 kept as runbook waves.

**Premise corrections (survey of the code, not the input):**

1. Q1.3 "treats red the same way it treats a red PR run" — `/bkit-debug` never waits for a PR run's result; the CI-Dispatch Gate (`bkit runs dispatch`, `runs.ts` `ciDispatchGate` L1247) only proves a run started. No existing red-run handling to mirror → `Open Question 1` (Sub-Plan 2).
2. Plan comment ship L236: an empty `ISSUE_ID` makes "branch does not contain `{ISSUE_ID}`" always **false** (`""` is contained in every string), not always true; same conclusion — the naming warning never fires issue-less. Fix stands (T15, Sub-Plan 2).
3. Plan comment order-of-work 4 names `prs open --dry`; no `--dry` flag exists. Dogfood uses `prs open` with `gh` off `PATH` → exit 80 prints the PR payload (marker included) without opening.
4. Debug Step 11 already skips the PR probe on `dev`; the leaks are Step 1 sub-step 6 (PR lookup that can pick up and retitle an open `dev` → `main` release PR) and the empty `--pr` handed to `runs dispatch` at Step 11.
5. `git add -A` (plan comment problem (a)) lives in `steps.ts` `writeStepRow` L405, reached by every `steps finish` and by `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283`, and in `workflows.ts` `closeWorkflow` L991 (the `workflows close --message` commit, `commit --allow-empty`). `commitBookkeeping` (`ledgers.ts` L276–406) already commits by pathspec but `stageTrackedUpdates` runs `git add -u` (L314–317).
6. Debug pushes `dev` from three places today, not one: Steps 9 / 10 / 11 run `branches push --mode=feature` (`bkit-debug.md` L552 / L576 / L626), which on a shared branch is a plain `git push origin dev` (`branches.ts` L602, L617–624); `ciDispatchGate`'s re-trigger pushes through `pushCurrentBranch` (`runs.ts` L309–317). All three push local `dev` wholesale.
7. `runs context` (`runs.ts` L1792–1805) refuses an issue-less FID only because `fromMarker` / `fromBranch` return null for it; there is no explicit `issueId === null` check. T2 removes that null, so the refusal needs its own guard.

**Derived from Q1.2:** with local `dev` ahead of `origin/dev`, every `origin/dev..HEAD` diff in debug counts foreign commits → `workflow-large-diff` gains `{{base}}` and debug on `dev` diffs against `{DIFF_BASE}` (record `startSha`). This sub-plan supplies `startSha` (T11); Sub-Plan 2 consumes it (T7 / T14).

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

Issue #650 `### Success criteria`, verbatim (6 bullets; verbatim rule wins over the 5-bullet cap). Feature-level outcomes; this sub-plan supplies the engine half of each, Sub-Plan 2 the workflow half:

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

This sub-plan's engine commands carry steps 1 (`fids check`), 2 (`worktrees setup` record + `startSha`), 3 (`steps finish` own-path commits), 4 (`workflows close`, `branches push --mode=dev` replay) and 5 (`runs dispatch` by SHA, `locks release` removes the record); the workflow prose driving them is Sub-Plan 2.

### Edge Cases

> Plan expands from design's Key Edge Cases.

Rows below = edge cases this sub-plan's tasks own (engine). Rows owned by workflow prose live in Sub-Plan 2; rows both halves touch appear in both.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Prompt names an issue-less FID `dev-ci-failures` | FID reused; attempt counter continues (Q7) |
| `fids check --tracker=any --issue=""` (CI_DEV) | Issue-less rule (`ISSUE_LESS_FID`), same as a wired tracker |
| `fids check` / `steps gate` with `--issue=""` and FID `123-fix`, `fix-2-retry`, `dev-123-x` | Exit 1 / gate check `ok:false`, message names the issue-less rule |
| `--issue` absent | Behaviour byte-identical to today |
| PR marker `<!-- bkit:fid=../x -->` or branch `feat/a;b` | Rejected by `SLUG`; fallback never reached |
| `none` tracker | Renders and behaves as today; `bkit:tracker true` blocks dropped |
| Named issue | Behaves as today |
| `/bkit-debug` on `main` | Refused (`main` refused for every workflow) |
| design / plan / build in place on `main` | Refused by `worktrees setup` |
| `/bkit-ship` on `dev` / `main` | Refused: `refusing to ship dev: /bkit-ship ships a feature branch into dev only; …` |
| `/bkit-ship` target `feat/{FID}` missing | Message names the missing branch (no "commit or stash"); never created |
| PR retargeted to `main` after ship Step 2 | `bkit prs merge` refuses (base is not `dev`); MCP fallback asserts base first |
| `prs merge` / `landPr` / `closePr` cannot read the PR base | Fails closed: `EXIT_BASE_NOT_DEV`, no merge, no retry |
| `bkit prs open --base=main` | Refused before any `gh` call |
| Debug needs to edit a file dirty before the run | `steps finish` refuses with a command-specific exit naming the paths → workflow stops and asks |
| Append-only `*.jsonl` ledger (e.g. `.bkit/issues.jsonl`, `.bkit/stats.jsonl`) dirty before the run | Run commits only the rows it appended; foreign rows stay uncommitted (Open Question 4) |
| Human edits a clean file mid-run | Committed as the run's own (Open Question 5 default A) |
| User's foreign changes already staged in the index | Run commits by pathspec / temp index; foreign staged entries stay staged, never committed |
| Repo pre-commit hook refuses an own-path commit | Existing commit-failure exit → Failure Path; never retried with foreign paths |
| Second in-place run on the same checkout while another FID's record + live lock exist | `worktrees setup` refuses (concurrency) |
| `branches push` in any mode on `dev` with a record | Own-commit push; never `git push origin dev` of local `dev` |
| `origin/dev..HEAD` holds only recorded run SHAs | Plain `git push origin dev` of own commits |
| `origin/dev..HEAD` holds a commit not in the record (ahead at start, or committed mid-run by someone else), or `origin/dev` moved | Exactly the recorded SHAs replayed onto fresh `origin/dev` via `pushToDev` (retry on moved `dev`); foreign commits stay local |
| CI-Dispatch re-trigger on `dev` with a record | Re-trigger commit made through a temp `GIT_INDEX_FILE` read from `HEAD` (foreign staged entries never committed) and recorded; pushed through the own-commit push, never `pushCurrentBranch` |
| CI-Dispatch re-trigger on `dev` without a record | Unchanged (`git commit --allow-empty` + `pushCurrentBranch`) |
| `pushToDev` refused by the server (branch protection on `dev`) | `EXIT_PUSH_FAILED` naming the refusal → Failure Path |
| Replay cherry-pick conflicts | Non-zero exit naming the conflicting paths; throwaway checkout removed → Failure Path |
| `dev` CI never starts | Existing CI-Dispatch Gate failure handling |
| HEAD message carries a skip-CI token on the `dev` push | Existing `EXIT_SKIP_CI` refusal (`branches.ts` L593–601) |
| Failure Path from `dev` (`workflows handover --push`) | Record removed after hand-back; hand-back never resets a recorded path |
| Same FID re-run after a close or abort | Record rewritten (new `startSha`, dirty set); a resume of the same run reuses it |
| Debug run on `dev` aborted after commits, before Step 11 | Its commits stay on local `dev`, unpushed; next run treats them as foreign (not in its record); handover lands bookkeeping only; output prints the resync command |
| `runs context` with an issue-less marker or `feat/{FID}` branch | Refused with `EXIT_NO_FID`, log names the missing issue; never exit 0 |
| `/bkit-auto` or `bkit-cloud.yml` with an issue-less marker / FID | Fails closed; `/bkit-auto` stays issue-only |
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
| `fids check --issue=""` accepts an issue-less FID and rejects any FID with an all-digit word under github, linear, jira and `any`; `--issue=<id>` requires tracker shape; flag absent unchanged; `none` unchanged (T1) | Unit | `.bkit/core/engine/commands/workflow/fids.test.ts` |
| `fromMarker` / `fromBranch` return `issueId: null` for an issue-less FID under every wired tracker; "embeds no … issue id" rows flip; tracker-shaped parse unchanged (T2) | Unit | `.bkit/core/engine/commands/workflow/fids.test.ts` |
| `runs context` with an issue-less marker or branch refuses with `EXIT_NO_FID` naming the missing issue, never exit 0 (T2) | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` |
| Malicious FIDs through the new fallbacks rejected; `/bkit-auto` fails closed with no issue (T2) | Unit | `.bkit/core/engine/audits/workflows/auto-fid-guard.test.ts` |
| Cloud context step with an issue-less marker resolves no issue and refuses (issue-only `/bkit-auto`) (T2) | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` |
| `steps gate --fid=… --issue=""` FID check uses the issue-less rule; absent flag unchanged (T3) | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| `prMarker` writes `<!-- bkit:fid={FID} -->` with a tracker wired and no issue; `prs open --base=main` refused; `prs merge` refuses a non-`dev` or unknown base from the probed `baseRefName` (no extra `gh` call) (T4) | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` |
| `landPr` with base `dev` still merges; base `main` or an unknown base (`probePr` returns no `baseRefName`) refused without retry (T4) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `closePr` with base `dev` still merges; an unknown base (`probePr` returns no `baseRefName`) refused, no merge — design / plan close fails closed (T4) | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| `branches land` of an issue-less run squashes and writes a FID-only marker (T4) | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` |
| `worktrees setup`: ship on `dev` / `main` refusal text with `refusing to ship ${target}` prefix; missing `feat/{FID}` message; `main` refused in place for design / plan / build / debug (T5) | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` |
| In-place shared-checkout record (`startSha` / `aheadAtStart` in `worktrees setup` output); `steps finish`, bookkeeping and `workflows close` commits never include foreign paths and append their SHA to the record; changed pre-dirty path refused; append-only ledgers committed line-level; hook-refused commit exits without staging foreign paths; `commitBookkeeping` refuses a changed recorded path (`EXIT_FOREIGN_PATH`); concurrent record (another FID's record + live lock) refused with `EXIT_SHARED_BUSY`; stale record (no lock) replaced; a resume of the same FID reuses the record; record I/O and own-path set live once in `ledgers.ts` (T11) | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| Record lifecycle: present after `workflows close` and through push + CI wait; removed by `locks release` and after a failed handover from `dev`; hand-back never resets a recorded path; a new run of the same FID rewrites `startSha` (T11) | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts` |
| Real git: foreign dirty + staged files untouched across a run's commits, the close commit included; debug-on-`dev` `roadmap mirror` row in `.bkit/issues.jsonl` lands while a pre-existing foreign row in the same file does not (T11) | Integration | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` |
| `branches push` on `dev` with a record (every mode) pushes only the recorded SHAs: plain push when `origin/dev..HEAD` equals them, else replay via `pushToDev`; foreign local commits (before or mid-run) never reach the remote; sequence `worktrees setup` → `steps finish` → `workflows close` → `branches push` (T12) | Integration | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` |
| `branches push` / `pushToDev` replay contract: replay build callback cherry-picks exactly the recorded SHAs; output `sha` = `pushToDev`'s landed SHA, not `git rev-parse HEAD`; `pushToDev` log line names what it lands; bookkeeping-only callers unchanged (T12) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/land.test.ts` |
| `branches push` on `dev` with a record, error paths: replay cherry-pick conflict → non-zero exit naming the conflicting paths, throwaway checkout removed; server-refused `pushToDev` → `EXIT_PUSH_FAILED` naming the refusal, `pushed: false`; skip-CI token on the replayed HEAD → `EXIT_SKIP_CI`; `abort` mode pushes only the recorded SHAs (T12) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `runs dispatch` on `dev` with the pushed SHA and no PR proves a run started; re-trigger on `dev` with a record goes through the own-commit push (T13) | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` |
| Re-trigger on `dev` with a record commits through a temp `GIT_INDEX_FILE` read from `HEAD`: a foreign staged path never lands in the re-trigger commit; without a record unchanged (T13) | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` |

Static gates (`pnpm bkit:gate:static-unit-integration`, `pnpm bkit check`, `pnpm bkit:check:dist`) are the global gate, not a matrix row (Tier Key); this sub-plan's Task 6 `Done when` rebuilds `dist/`, Gate 4 runs all three; Sub-Plan 2 Task 19 runs them for the whole feature.

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
> **`bkit prs merge` refuses any PR whose base is not `dev` (or cannot be read); `bkit prs open --base=main` is refused.** Any consumer script using `bkit prs merge` for another base (release branch, `main`) breaks with a new command-specific exit; `CHANGELOG.md` `[Unreleased]` names it under Changed (Sub-Plan 2 Task 16).

> [!WARNING]
> **`bkit worktrees setup` refuses `main` in place for design / plan / build** (today only `dev` is refused there).

> [!IMPORTANT]
> **Engine contract changes (callers listed in Architecture):**
>
> - `fids check` / `steps gate` gain `--issue=<id or "">`; absent = today.
> - `fromMarker` / `fromBranch` / `fids parse` under a wired tracker now return `{ fid, issueId: null }` for an issue-less FID that today returns no result. `runs context` gains an explicit `issueId === null` guard and keeps refusing with `EXIT_NO_FID`.
> - PR marker under a wired tracker with no issue: `<!-- bkit:fid={FID} -->` (the `none` shape).
> - `worktrees setup` in place on a shared branch writes the shared-checkout record and its JSON output gains `startSha` / `aheadAtStart`.
> - `steps finish` (via `writeStepRow`), `commitBookkeeping` and the `workflows close --message` commit exclude paths recorded as dirty before an in-place shared-branch run (append-only `*.jsonl` ledgers: only the run's appended rows) and append each commit SHA to the record; a recorded path changed during the run → new command-specific exit.
> - `branches push` on a shared branch with a record (every mode) pushes only the recorded commit SHAs; may replay through `pushToDev` (output gains `replayed: boolean`; `sha` = landed `origin/dev` SHA). `pushBranch` becomes `async`.
> - `land.ts` file header, `pushToDev` docstring and log line no longer say it lands bookkeeping only or one commit.
> - `runs dispatch` accepts a shared branch + pushed SHA with no PR; its re-trigger on a shared branch with a record commits through a temp index read from `HEAD` (never the whole index) and goes through the own-commit push.
> - `locks release --kind=workflow` removes that FID's shared-checkout record; the `dev` hand-back path of `workflows handover` removes it too.

**Proposed names:**

<!-- prettier-ignore -->
| Kind | Name | Where |
| --- | --- | --- |
| FID rule | issue-less FID = `SLUG` with no all-digit `-`-separated word; constant `ISSUE_LESS_FID` | `fids.ts` |
| Issue-id shapes | `ISSUE_ID_PATTERNS` (per tracker) | `fids.ts` |
| Validator | `fidProblem(fid, tracker, issue?)` → `string \| undefined` | `fids.ts` (used by `fids check`, `steps gate`, `prMarker`) |
| Flag | `--issue=<id or "">` | `bkit fids check`, `bkit steps gate` |
| Exit constants | `EXIT_BASE_MAIN` (`prs open`), `EXIT_BASE_NOT_DEV` (`prs merge`), `EXIT_FOREIGN_PATH` (`steps finish` / `ledgers commit`), `EXIT_SHARED_BUSY` (`worktrees setup`) — next free codes in 3–79 per command | engine |
| Run record | `$(git rev-parse --git-path bkit/shared-checkout/{FID}.json)` — per clone, never committed; fields `fid`, `branch`, `startSha`, `originSha`, `aheadAtStart`, `paths`, `commits` (SHAs the run made) | `ledgers.ts` (record read / write / SHA append / remove, own-path set, own-path commit); written by `worktrees.ts` `setup` |
| Ship refusal | `refusing to ship ${target}: /bkit-ship ships a feature branch into dev only; it never opens a PR from dev into main or merges into main, releases stay manual. Name the feature branch to ship.` | `worktrees.ts` |

Wording clauses, `**No issue:**` header bullet and the missing-issue behaviour change: Sub-Plan 2.

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

Open Question numbering kept from the Parent Plan; Open Question 1 (red `dev` CI, debug prose) lives in Sub-Plan 2.

- **Open Question 2:** The replay onto `origin/dev` runs in `pushToDev`'s throwaway checkout with hooks off. → owner.
  - **Options:** A — accept: the run's own gates already ran on the same commits in the main checkout; widens decision `ship-dev-writes-through-throwaway-origin-dev-checkout` (bookkeeping-only) to debug code commits, recorded by the `650-debug-on-dev-in-place-own-files-own-commits` correction row · B — run the static / unit gate inside the throwaway checkout before pushing; slower, needs `node_modules` there · C — refuse when local `dev` was ahead and tell the human to push or park their commits first.
  - **Recommended:** A — same commits, already gated; `dev` CI is waited on afterwards (T14).
  - **Default if unanswered:** A.
  - **Answered:** A (owner, #650).
- **Open Question 3:** After a replay, local `dev` (foreign commits + run commits) diverges from `origin/dev` (run commits replayed). → owner.
  - **Options:** A — leave local `dev` untouched; print the exact resync command (`git pull --rebase origin dev`) in the push output and the final message · B — auto-rebase local `dev` onto `origin/dev` at close; touches the human's commits.
  - **Recommended:** A — the run never rewrites commits it does not own.
  - **Default if unanswered:** A.
  - **Answered:** A (owner, #650).
- **Open Question 4:** A path dirty before the run changed during the run — the engine cannot tell whether debug or the human edited it. Append-only ledgers (`.bkit/stats.jsonl`, `.bkit/issues.jsonl`, `docs/*.jsonl`) are often dirty and the run appends to them at every step. → owner.
  - **Options:** A — refuse the commit (`EXIT_FOREIGN_PATH`) naming the paths, workflow stops and asks (Q1.1), except append-only `*.jsonl` ledgers: commit only the rows the run appended (HEAD blob + rows past the recorded line count that HEAD lacks, the line filter `carryOwnBook` uses, `workflows.ts` L362–406); a ledger whose first recorded-count lines changed → `EXIT_FOREIGN_PATH` · B — refuse for every recorded path, ledgers included (literal Q1.1); a pre-dirty ledger stops every debug-on-`dev` run at its first `steps finish` · C — commit it anyway with a warning; mixes change sets.
  - **Recommended:** A — never mixes the two sets, and the debug-on-`dev` `roadmap mirror` row (knowledge `380-build-debug-dev-write-is-a-fourth-staging-shape`) still lands.
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
- **Assumption:** Only engine commits are the run's own commits: each appends its SHA to the record's `commits` list, and the push sends exactly that list → a commit made mid-run by a human, another agent, or a subagent's own `git commit` is never pushed and stays on local `dev`.
- **Assumption:** Knowledge `380-build-debug-dev-write-is-a-fourth-staging-shape` (ACTIVE) holds: the debug-on-`dev` close hook appends the `roadmap mirror` row to `.bkit/issues.jsonl` in the checkout → T11 asserts that row rides the own-path close commit and the own-commit push while a pre-existing foreign row in the same file does not.
- **Assumption:** OPEN failure `precommit-check-dist-blocks-parallel-agents`: a repo pre-commit hook may refuse an own-path commit while someone else has unstaged edits in the shared checkout → the refusal exits through the existing commit-failure code to the Failure Path; the engine never retries with foreign paths staged or `--no-verify`.
- **Assumption:** Per-runtime behaviour of debug on `dev` is unchanged: `pushBranch` has no runtime check, and the workflow's existing `runtime assert` / `RUNTIME_DEVPUSHES` gating decides whether debug may push `dev` (`CLOUD_CLAUDE`: `RUNTIME_DEVPUSHES=false`); a `GITHUB_ACTION` dev-CI router checkout has no foreign edits or commits, so its record is empty and the push is plain → if a runtime reaches Step 11 on `dev` without `dev` push rights, the own-commit push fails with `EXIT_PUSH_FAILED` → Failure Path.
- **Assumption:** The consumer CI template declares a `push` trigger on `dev` (and `workflow_dispatch`) so `runs dispatch` finds a run for the pushed SHA → if not, the CI-Dispatch Gate fails as it does today.
- **Assumption (split boundary):** Between this sub-plan and Sub-Plan 2 the shipped workflows still pass no `--issue` and debug Step 11 still releases the lock before `branches push --mode=feature`; with the record removed by that release the push takes the no-record path (today's behaviour) → the push path is unchanged, but the intermediate state is not fully behaviour-preserving: `/bkit-debug` in place on `dev` already writes the record and commits only its own paths (`EXIT_FOREIGN_PATH` on a pre-modified file changed during the run) as soon as this sub-plan ships; Sub-Plan 2 Task 14 moves the release after the CI wait.

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
| `git stash` foreign changes around the run | Rejected | Stash stack is shared across worktrees and sessions; pop can take another session's entry |
| Temporary index for every run commit | Fallback only | Pathspec commits already leave foreign index entries alone; temp index used only when the run's own path set is empty (an `--allow-empty` commit would otherwise take the whole index) and for line-level ledger blobs |
| Own commits = `startSha..HEAD` | Rejected | Sweeps in any commit someone else makes on `dev` mid-run; `.agents/rules.md` § Commits treats parallel editors as the expected case |
| Record start SHA + dirty set + every engine commit SHA; own-path commits; push / replay of exactly the recorded SHAs via `pushToDev` | **Chosen** | Fixes problems (a)–(d) with existing engines; debug still creates no branch |
| Remove the record at `workflows close` or on push success | Rejected | Step 11 pushes and re-triggers CI after the close; the Failure Path hand-back needs the record to leave foreign paths alone. Lifetime = workflow lock (`locks release`, moved after the CI wait) or the `dev` hand-back |
| Issue-less FID rule = "does not match the active tracker shape" | Rejected | Depends on the tracker in force; a tracker switch could make an old FID parse as an issue. "No all-digit word" excludes all three tracker shapes at once |
| Issue-less FID rule = no all-digit word + `SLUG` | **Chosen** | Q3; tracker-independent; mint and check agree |
| Dispatch → `runs wait --until=completed` → `runs gate --capstone-only` on `dev` | **Chosen** | Existing commands; Gate 11 claim becomes true |
| `prs open` refuses every non-`dev` base | Rejected | Q4 scopes the open guard to `--base=main`; merge guard covers the rest |
| Relax `/bkit-auto` to run issue-less | Rejected | Non-goal: CI always dispatches it with an issue or PR |

**Future-phase recommendations:** guard the `branches land` MCP fallback merge base (see `Suggested Scope Expansion`); consider a `bkit fids resume` lookup that maps a reworded issue-less prompt to a recent FID (deferred, Q7).

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Relax `.bkit/core/hooks/preflight-linear.sh` L13–18 for Linear cloud agents with no `LINEAR_ISSUE_ID` | Not required by any Success Criterion; Linear cloud launches always come from an issue | #650 "Open questions: answered" Q6 (scope-declared) — deferral `650-preflight-linear-issue-less` |
| Issue-less `/bkit-auto` and `bkit-cloud.yml` dispatch | Non-goal: "`/bkit-auto` stays issue-only" (#650 Constraints); T2 only pins fail-closed | #650 § Constraints and non-goals (scope-declared) — deferral `650-bkit-auto-issue-less` |
| Automatic FID continuity across reworded issue-less re-runs | Q7 "No change"; doc line in § Best-effort runs is in scope (T16, Sub-Plan 2) | #650 "Open questions: answered" Q7 (scope-declared) — deferral `650-issue-less-fid-continuity` |
| Live round-trip on real GitHub Actions: own-commit push (replay) → dispatch → wait → gate on the landed `dev` SHA | Owner decision on #650: no live check before merge. The build merges on the stub-`gh` Unit rows that pin the SHA hand-off (T12 / T14); the first real `/bkit-debug` on bkit's own `dev` after merge is the live check (Manual Verification Step 6). Hard-blocked for the build agent either way: it may not create a repo with Actions or push a real `dev` without human confirmation | Deferral `650-debug-dev-ci-live-round-trip` (`hard-blocked`, same form as `341-live-run-verification-mode-1-and-mode-3`) |

Deferral rows already appended to `docs/deferrals.jsonl`; the record of the written `jq` block and its verification (Task 17) live in Sub-Plan 2. Do NOT re-run any deferral `jq` block.

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `branches land` MCP fallback (exit 80 → agent merges via MCP) does not assert the PR base is `dev` | Survey of this plan (no ledger row) | T4 / T15 base guards | Fold in — one prose assert mirroring T15's Step 10 assert |
| `639-refused-ship-failed-record-lost-in-cloud-container` | `docs/deferrals.jsonl` | `pushToDev` / handover used by T12 replay | Keep deferred |
| `384-required-status-checks-on-dev-via-bkit-protect-main` | `docs/deferrals.jsonl` | Debug pushing straight to `dev` (T12 / T14) | Keep deferred |
| `363-main-branch-trigger-excluded-reversal` | `docs/deferrals.jsonl` | `main` guards (T4 / T5 / T15) | Keep deferred |
| `steps-placeholder-gate-false-positive-on-derived-issue-dump` | `docs/failures.jsonl` | `steps gate --placeholder` with an empty `ISSUE_ID` (T3 / T8) | Needs design decision — T8 adds no `--placeholder=ISSUE_ID` (none of the five workflows passes one); the dump false positive is separate |
| `442-plan-template-design-missing-fallback-amendment` — plan template fallback when no design and no issue `Narrative` exist | `docs/deferrals.jsonl` | This plan's `Narrative` (no design or issue source; owner-supplied on #650) | Needs design decision |
| #639 open item: stale `RUNTIME_DEVPUSHES` reason at `.bkit/core/engine/commands/workflow/runtime.ts:110` | #639 (`related-issues.md`, "Still open") | Debug-on-`dev` push per runtime (Assumption) | Keep deferred |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — FIDs from the prompt, PR-body marker and branch name reach filesystem paths (`docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/_land-{FID}`, `git-path bkit/shared-checkout/{FID}.json`): every new fallback (`fromMarker` / `fromBranch` issue-less, `prMarker`, `--issue=""`) passes `SLUG` + `ISSUE_LESS_FID` before any path use; `auto-fid-guard.test.ts` pins traversal / injection values (T2).
- [ ] **Role-Gated Mutation (privileged merge)** — merge into `main` enforced in the engine, not prose: `mergePr` checks the base its own `probePr` read returns at merge time and fails closed when unknown, covering `prs merge`, `landPr` and `closePr`; `prs open --base=main` refused (T4); MCP fallback asserts base first (T15, Sub-Plan 2).
- [ ] **Data exposure** — own-path commits keep unrelated working-tree files out of pushed commits, the close commit included (T11); only recorded run commits are pushed, in every push mode and the CI re-trigger, and the re-trigger commit never carries a staged foreign path (T12 / T13); the dirty-path record lives under `.git` (`git rev-parse --git-path`), never committed, so unrelated file names never leave the clone.
- [ ] **Trust boundary (`/bkit-auto`)** — issue-less markers never enable cloud dispatch: `runs context` gains an explicit `issueId === null` refusal, red-first tested (T2).

_Not applicable: New API Route, New DB Table/Column, PII, Redirect URL, Webhook, New Secret/Env Var — no routes, DB, secrets or env vars._

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** No new packages; `package.json` + `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; spot-check `npx tsc --version`, `pnpm --version`, `git --version` (`commitBookkeeping` `requireGitVersion` needs `--pathspec-from-file`), `gh --version`.
- [ ] **Existing-Solution Search (reuse over duplicate):** Done at plan time → `Reuse Inventory`; build re-runs the in-repo sweep if a candidate appears mid-build.
- [ ] **User Context:** Write access to `.bkit/core/engine/**` and `dist/` (this sub-plan); never edit `.claude/`, `.cursor/`, `.opencode/` (mirrors regenerated in Sub-Plan 2 Task 18).
- [ ] **Project Context:** Fold `docs/knowledge.jsonl` and `docs/decisions.jsonl` by `key` (highest `ts`, `ACTIVE` / absent only). Relevant: #486 never-create decision rows; CI-Dispatch Gate rows; `pushToDev` / dev-lock rows (`ship-dev-writes-through-throwaway-origin-dev-checkout` L644, `failure-path-record-own-branch-dev-fallback` L638 — both narrowed by this plan); `381-*` egress rows (no new egress); knowledge `KN-11` (skip-ci HEAD on `dev` push), `380-build-debug-dev-write-is-a-fourth-staging-shape`; OPEN failure `precommit-check-dist-blocks-parallel-agents`.
- [ ] **Testing & Quality:** `docs/testing.md` tiers — `*.test.ts` = Unit, `*.integration.test.ts` = Integration; test-first red then green; full `pnpm vitest run`, never scoped.
- [ ] **Prerequisite Plans:** None — this is Sub-Plan 1 of 2; Sub-Plan 2 ([650-workflows-prompt-alone-plan-2.md](650-workflows-prompt-alone-plan-2.md)) depends on it.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** N/A — none added.
- [ ] **Schema State:** N/A — no database.
- [ ] **Architecture & UI:** One new test file next to its sources (`.bkit/core/engine/commands/workflow/`); no new source files, routes or UI.
- [ ] **Observability:** N/A — CLI JSON on stdout + `log()` lines on stderr per command conventions; no new log names, spans or audit tables.
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

Applied to file / git stores: run-record write, own-path commit (hook refusal included) and own-commit push (`pushToDev` server refusal and replay conflict included) each return a command-specific non-zero exit with the failing `git` stderr (`EXIT_FOREIGN_PATH`, existing `EXIT_COMMIT` / `EXIT_PUSH_FAILED`, `EXIT_SHARED_BUSY`); the workflow routes non-zero to its existing Failure Path (`EXIT_FOREIGN_PATH` → stop and ask; prose in Sub-Plan 2 Task 14). A refused `dev` push never reports `pushed: true`. A failed commit never leaves its SHA in the record's `commits` list.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| Issue-less FID rule + issue-id shapes | `grep -rn "FID_PATTERNS\|SLUG\|ISSUE_FORMAT\|FID_FORMAT" .bkit/core/engine`; read `fids.ts` | `fids.ts` `FID_PATTERNS` (github / linear / jira / none / any), `SLUG`; duplicate `FID_FORMAT` / `ISSUE_FORMAT` in `prs.ts` | EXTEND | Add `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem` to `fids.ts`; delete the `prs.ts` duplicates |
| `fids check --issue` | `grep -n "check" fids.ts`; `fids.test.ts` L206–251 | `fids.ts` `check` verb | EXTEND | Route through `fidProblem` when `--issue` present |
| Issue-less marker / branch recovery | references to `fromMarker`, `fromBranch` (`runs.ts`, `prs.ts`, `cloud-ctx-step`) | `fids.ts` `fromMarker` / `fromBranch` | EXTEND | Fallback to `ISSUE_LESS_FID` → `issueId: null` |
| `runs context` issue-less refusal | read `runs.ts` L1792–1805 (`if (!parsed)` → `EXIT_NO_FID`; no `issueId` check) | `runs context` verb | EXTEND | Explicit `issueId === null` guard, same `EXIT_NO_FID` |
| Gate FID check | `steps.ts` `gateChecks` L442–483 | `gateChecks` FID branch L457–466 | EXTEND | `--issue` → `fidProblem` |
| PR marker | `grep -rn "prMarker" .bkit/core/engine` | `prs.ts` `prMarker` (used by `prs open`, `branches land`) | EXTEND | FID-only marker when wired + no issue |
| Base guards on open / merge | `grep -n "base\|mergePr" prs.ts`; `PR_FIELDS` L42 already reads `baseRefName`; `mergePr` callers `prs.ts:931`, `branches.ts:1097` (`landPr`), `workflows.ts:1045` (`closePr`); ship Step 2 L258 assert, Step 10 L518 | `prs.ts` `prs open`, `mergePr` + its `probePr` read; prose-only asserts in `bkit-ship.md` | EXTEND | Engine refusals on the probed base (no extra `gh` call); prose keeps MCP-path assert |
| Ship refusal / missing branch / `main` in place | `worktrees.ts` L115–120, L421–534; `worktrees.test.ts` L126–205 | `worktrees.ts` `setup` | EXTEND | Text + `main` refusal + missing-branch message |
| Dirty-path snapshot | `grep -rn "dirtyTracked\|status --porcelain" .bkit/core/engine` | `ledgers.ts` `dirtyTracked` (tracked only, no untracked, no hash) | EXTEND | Reuse in `worktrees.ts` setup; add untracked + content hash (`git hash-object`) |
| Shared-checkout record read / write / SHA append / remove + own-path set (status minus recorded paths, ledger-row filter) + own-path commit (pathspec, temp index for an empty own set) | `git grep -n "dirtyTracked\|commitBookkeeping\|from \"./ledgers" -- .bkit/core/engine/commands/workflow`; read import graph: `ledgers.ts` imports only `status.ts`, `lib.ts`, `ledgers/telemetry.ts` (no cycle); `runs.ts` L49, `workflows.ts` L69, `branches.ts` L36 already import it; `steps.ts`, `locks.ts`, `worktrees.ts` do not yet | `ledgers.ts` `dirtyTracked` L149 + `commitBookkeeping` L276 (pathspec commit, `requireGitVersion`) | EXTEND | One home in `ledgers.ts`; `worktrees.ts` setup, `steps.ts` `writeStepRow`, `ledgers.ts` `commitBookkeeping`, `workflows.ts` `closeWorkflow` + hand-back, `branches.ts` `pushBranch`, `runs.ts` re-trigger and `locks.ts` release call it — none re-implements record I/O or the own-path rule |
| Own-path commits | read `steps.ts` `writeStepRow` L372–412 (`git add -A` L405); `ledgers.ts` `commitBookkeeping` L276–406 (`git add -u` L314–317, pathspec commit L383–390); `workflows.ts` `closeWorkflow` L991 (`git add -A` + `commit --allow-empty`) | `writeStepRow`, `commitBookkeeping`, `closeWorkflow` | EXTEND | Pathspec staging / commit excluding recorded paths through the `ledgers.ts` record helpers (row above); temp index only for an empty own set; each commit SHA appended to the record |
| Line-level ledger commit | read `workflows.ts` `carryOwnBook` L362–406 (rows `HEAD` lacks, per ledger) | `carryOwnBook` line filter (inline in `carryOwnBook`, `workflows.ts` L363) | EXTEND | Lift its HEAD-vs-working line filter into the `ledgers.ts` record helpers, `carryOwnBook` calls it; reuse for recorded append-only `*.jsonl` ledgers (Open Question 4) |
| Own-commit push / replay onto `origin/dev` | `branches.ts` `pushBranch` L555–641 (sync; shared-branch plain push L602, L617–629); `commands/land.ts` `pushToDev` L112–156 (`async`, already takes a `build(dir, attempt)` callback); `pushBranch` callers `branches.ts:648` / `1067`, `workflows.ts:604`; `pushToDev` callers `roadmap.ts:446`, `branches.ts:973`, `workflows.ts:508`, `workflows.ts:1078` | `pushBranch`; `pushToDev` (throwaway `.worktrees/_land-{FID}`, retry when `dev` moved) | EXTEND | `pushBranch` on a shared branch + record (every mode) → plain push or `pushToDev` replay of the recorded SHAs through a cherry-pick `build` callback; no `pushToDev` signature change |
| CI re-trigger commit + push | read `runs.ts` re-trigger commit L402–407 (`git commit --allow-empty`, no pathspec → commits the whole index) and `pushCurrentBranch` L309–317 (plain `git push origin dev` on a shared branch) | `ciDispatchGate` re-trigger | EXTEND | Shared branch + record → commit through the `ledgers.ts` own-path commit (empty own set → temp index read from `HEAD`), record the SHA, push through the own-commit push |
| Record lifetime | `locks.ts` `locks release`; `workflows.ts` `handoverVerb` L568–642 shared-branch `landFailedRecord` / hand-back path (L593–599) | workflow lock; hand-back | EXTEND | `locks release --kind=workflow` and the `dev` hand-back remove the FID's record |
| `dev` CI wait after push | `runs.ts` `ciDispatchGate` L1247; `runs wait --until=completed`; `runs gate --capstone-only`; `bkit-build.md` CI wait turn loop L54 | `runs dispatch` / `wait` / `gate` | EXTEND | `runs dispatch` on a shared branch by pushed SHA, no PR; prose reuses build's wait loop shape |
| Real-git integration harness | `Glob **/*.integration.test.ts` under `.bkit/core/engine`; `grep -n "^function\|^export\|^const" close-squash.integration.test.ts worktrees.integration.test.ts` → every helper file-local, none exported | `close-squash.integration.test.ts` `initFixture` (design / plan close only); `worktrees.integration.test.ts` `fixture()` / `run()` (bare `origin` + clone, in-process `runCommand`) | new (test file) | (a) no integration test covers in-place shared-branch commits / push; fixture follows `worktrees.integration.test.ts` `fixture()` shape; never imports another test file (vitest would re-register its suites); no new helper module |

Rows `Shared wording` (T7) and `{ISSUE_ID} may be empty qualifier` (T8) live in Sub-Plan 2. The `dev` CI wait row's prose half (build's wait loop shape) is consumed by Sub-Plan 2 Task 14.

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

### Engine — FIDs and markers (Wave 1)

#### [MODIFY] `.bkit/core/engine/commands/workflow/fids.ts`

- **Existence Check:** exists.
- Add `ISSUE_LESS_FID` (`SLUG` and no `-`-separated all-digit word), `ISSUE_ID_PATTERNS` (github `^[0-9]+$`; linear / jira `^[A-Za-z][A-Za-z0-9]*-[0-9]+$`), `fidProblem(fid, tracker, issue?)`: `issue` undefined → today's `FID_PATTERNS[tracker]` check; non-empty → `issue` matches `ISSUE_ID_PATTERNS[tracker]` and FID matches `FID_PATTERNS[tracker]`; empty with a wired tracker or `any` → `ISSUE_LESS_FID`; `any` + non-empty → `issue` matches any wired tracker's `ISSUE_ID_PATTERNS` and FID matches `FID_PATTERNS.any`; `none` → today.
- `fids check --issue=<v>` → `fidProblem`; exit 1 + message on problem.
- `fromMarker` / `fromBranch`: wired tracker, value fails the tracker shape but passes `SLUG` + `ISSUE_LESS_FID` → `{ fid, issueId: null }`; `fids parse` output follows.
- **Blast radius:** `fromMarker` / `fromBranch` callers — `runs.ts` (`runs context`: explicit `issueId === null` refusal, see `runs.ts` below), `prs.ts`, `cloud-ctx-step` template; `fids check` callers — five workflows Step 1 (pass `--issue` from Sub-Plan 2 Task 8; absent until then = today); `bkit-cloud.yml` FID guard (fails closed on issue-less FIDs).

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** exists.
- `gateChecks` L457–466: new `issue?: string` on `GateOptions`; `--issue` → `fidProblem(fid, tracker, issue)`.
- `writeStepRow` L404–411: see Wave 3.

#### [MODIFY] `.bkit/core/engine/commands/workflow/prs.ts`

- **Existence Check:** exists.
- `prMarker`: wired tracker + empty / absent issue → `<!-- bkit:fid={FID} -->` after `fidProblem(fid, tracker, "")`; delete `FID_FORMAT` / `ISSUE_FORMAT`, import from `fids.ts`.
- `prs open`: `--base=main` → `EXIT_BASE_MAIN` before any `gh` call.
- `mergePr`: check `baseRefName` from the `probePr` read it already makes before merging (`PR_FIELDS` L42; no extra `gh pr view` call); not `dev` or unknown (read failed / null) → `EXIT_BASE_NOT_DEV`, no merge (fails closed). Exit-80 MCP path unchanged (prose assert, T15).
- **Blast radius:** `prs open` (ship Step 2, debug Step 11 PR mode, `branches land` PR-to-dev fallback); `mergePr` callers — `prs merge` verb (`prs.ts:931`, ship Step 10 L518), `landPr` (`branches.ts:1097`, inside a retry loop: `EXIT_BASE_NOT_DEV` is never retried), `closePr` (`workflows.ts:1045`, merges design / plan close PRs into `dev` — must keep merging).

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts` (land)

- **Existence Check:** exists.
- `branches land` L1067–1100: `--issue` optional; empty → FID-only marker via `prMarker`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** exists.
- Ship on `dev` / `main`: refusal text from `Breaking Changes` (prefix `refusing to ship ${target}` kept — pinned by `worktrees.test.ts`); exit unchanged.
- L115–120: `feat/{FID}` absent → `feat/{FID} does not exist — name the feature branch to ship`; ship never creates it.
- L421–534: `main` refused in place for design / plan / build (debug already refused, L501 `refused = workflow === "debug" ? "main" : DEV`); adopt-mode cloud session branches (upstream `main`) are not in-place-on-`main` and stay accepted.

#### [MODIFY] `dist/`

- Rebuilt by `pnpm build`; `pnpm bkit:check:dist` gates it (Task 6, run last in this sub-plan so it covers Tasks 11–13 too).

### Engine — debug on `dev` in place (Wave 3)

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts` (shared-checkout record)

- `setup` for an in-place run on a shared branch (`isSharedBranch`, i.e. `dev`): after the existing checks, write through the `ledgers.ts` record helpers `{ fid, branch, startSha, originSha, aheadAtStart, paths: [{ path, hash | null, lines? }], commits: [] }` to `$(git rev-parse --git-path bkit/shared-checkout/{FID}.json)` — paths = `git status --porcelain -z` (tracked + untracked) via extended `dirtyTracked`; `hash` = `git hash-object` of the working file, `null` when deleted; `lines` = working-file line count for append-only `*.jsonl` ledgers (Open Question 4).
- JSON output gains `startSha` and `aheadAtStart` in this case (consumed by debug Step 2 as `{DIFF_BASE}`, Sub-Plan 2 Task 14); `baseSha` (`merge-base`) unchanged.
- Another FID's record present with a live workflow lock → `EXIT_SHARED_BUSY`; stale record (no lock) replaced. Same FID: a resume (the FID's `{STATUS}` holds a `workflow-started` row with no close row after it) reuses the record; a new run (no open run) rewrites it.
- Record lifetime: kept through `workflows close`, every push, the CI re-trigger and the CI wait; removed by `locks release --kind=workflow` for its FID (`locks.ts`) and by the shared-branch hand-back of `workflows handover` (`workflows.ts` `handoverVerb` `landFailedRecord` path L593–599), never at `workflows close` or the L600–604 non-shared abort branch.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- `dirtyTracked` → optionally include untracked paths (`--others --exclude-standard`) for the record.
- Shared-checkout record helpers, the one home (`Reuse Inventory` row): read / write / append-SHA / remove the record at `git rev-parse --git-path bkit/shared-checkout/{FID}.json`; own-path set = current `git status --porcelain -z` paths minus recorded paths, recorded append-only `*.jsonl` ledgers reduced to the run's rows (HEAD-vs-working line filter lifted out of `workflows.ts` `carryOwnBook` into `ledgers.ts`; `carryOwnBook` calls it; `ledgers.ts` never imports `workflows.ts`), any other recorded path whose hash changed → `EXIT_FOREIGN_PATH` naming paths; own-path commit = `git add` + `git commit --pathspec-from-file` of the own set, empty own set → temp `GIT_INDEX_FILE` read from `HEAD` (`--allow-empty`); SHA appended only after the commit succeeds. Callers: `worktrees.ts` setup, `steps.ts` `writeStepRow`, `commitBookkeeping`, `workflows.ts` `closeWorkflow` + hand-back, `branches.ts` `pushBranch`, `runs.ts` re-trigger, `locks.ts` release; no caller re-implements them.
- `commitBookkeeping` L314–317: record present → `git add -u -- . ':(exclude)<p>'…` via `--pathspec-from-file`; recorded append-only `*.jsonl` ledger → stage only the rows the run appended (Open Question 4); any other recorded path whose current hash differs → `EXIT_FOREIGN_PATH` naming paths. Pathspec commit (L383–390) unchanged; the new commit SHA is appended to the record's `commits`.
- **Blast radius:** `branches.ts:948` / `1048`, `workflows.ts:528` / `1084`, `ledgers.ts:411`; record helpers gain importers `steps.ts`, `locks.ts`, `worktrees.ts` (none imported by `ledgers.ts`, so no cycle); `carryOwnBook` (`workflows.ts` L363) switches to the lifted line filter, output unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts` (`writeStepRow`)

- L404–411: record present → `ledgers.ts` own-path set + own-path commit (no local copy): own set = current `git status --porcelain -z` paths minus recorded paths; recorded append-only ledgers → run's rows only (Open Question 4); other recorded path hash changed → `EXIT_FOREIGN_PATH` (row already appended; message says commit refused, names paths); non-empty own set → `git add` + `git commit --pathspec-from-file` of the own set (foreign index entries stay staged); empty own set → commit through a temp `GIT_INDEX_FILE` read from `HEAD` (`--allow-empty`); commit SHA appended to the record's `commits`. Commit refused by a hook → existing commit-failure exit, nothing retried, no foreign path staged, no SHA recorded. No record → `git add -A` path unchanged.
- **Blast radius:** `context.ts:835`, `tests.ts:578`, `steps.ts:763` / `976`, `workflows.ts:872`, `runs.ts:1283` — all inherit; none change.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- `closeWorkflow` L991: record present → the `ledgers.ts` own-path commit (same own-path / ledger-row / temp-index rule as `writeStepRow`, one implementation) instead of `git add -A`; commit SHA appended to the record. No record → unchanged.
- `handoverVerb` shared-branch path (L593–599, `landFailedRecord` / hand-back): hand-back never resets or removes a recorded path or recorded foreign ledger rows; record removed after hand-back.
- **Blast radius:** `workflows close` (every workflow's close; only in-place shared-branch runs carry a record), `workflows handover --push` from `dev` / `main`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/locks.ts`

- `locks release --kind=workflow --fid=X`: after releasing, remove `X`'s shared-checkout record when present (`ledgers.ts` record helper). **Blast radius:** every workflow's lock release; no record → unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts` (`pushBranch`)

- Shared branch with a record, every mode (`dev`, `feature`, `abort`; L589–629): `git fetch origin dev`; own commits = the record's `commits` list; `origin/dev..HEAD` equals that list (in order) → `git push origin dev`; else → `pushToDev` replay of exactly those SHAs; output gains `replayed: boolean`, `sha` = landed `origin/dev` SHA from `pushToDev` (the CI SHA, never `git rev-parse HEAD` after a replay); log line with the resync command (Open Question 3). Skip-CI check (L593–601) runs on the replayed HEAD message too. `pushToDev` server refusal → `EXIT_PUSH_FAILED` naming the refusal. No record → unchanged.
- `pushBranch` becomes `async` (it awaits `pushToDev`).
- **Blast radius:** `branches.ts:648` (verb), `branches.ts:1067` (land), `workflows.ts:604` (abort) — each awaits the result; `runs.ts` re-trigger (below).

#### [MODIFY] `.bkit/core/engine/commands/land.ts`

- **Existence Check:** exists (`pushToDev` L112–156; `async`; takes `build: (dir, attempt) => void`).
- No signature change: the replay is a `build` callback (in `branches.ts`) that cherry-picks the recorded SHAs onto fresh `origin/dev` in `.worktrees/_land-{FID}`; retry-on-moved-`dev` loop reused; conflict → callback throws with the conflicting paths, throwaway checkout removed.
- File header L1–7 (`Used by the design / plan close, the build / debug roadmap mirror, and ship's close and FAILED record` … `what it lands is bookkeeping only (docs, logs, ledgers, [skip ci])`), `pushToDev` docstring L106–111 (`Land one commit on dev`) and the `git hooks skipped in the throwaway dev checkout — it lands bookkeeping only` log line (L119) rewritten to current state: hooks skipped; lands bookkeeping, or the commits a debug-on-`dev` run made; the user list names that replay.
- **Blast radius:** `pushToDev` callers `roadmap.ts:446`, `branches.ts:973` (`landDirect`), `workflows.ts:508` (`landFailedRecord`), `workflows.ts:1078` (`shipClose`) — behaviour unchanged apart from the log text.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- `ciDispatchGate` L1247: shared branch + pushed SHA, no `--pr` → resolve the push-event run for that SHA; exits unchanged.
- Re-trigger (commit L402–407, `pushCurrentBranch` L309–317): shared branch with a record → re-trigger commit made through the `ledgers.ts` own-path commit with an empty own set (temp `GIT_INDEX_FILE` read from `HEAD`, so no staged foreign path is committed — today `git commit --allow-empty` with no pathspec commits the whole index), its SHA appended to the record, push through the own-commit push (`pushBranch`); the gate then follows the landed SHA. No record → unchanged.
- `runs context` L1792–1805: `parsed.issueId === null` → log `no issue in the PR-body marker or branch FID; /bkit-auto runs issue-only`, exit `EXIT_NO_FID`.

### Tests

#### [NEW] `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Real-git integration harness" — reason (a): no integration test covers in-place shared-branch commits / push; existing fixtures (`close-squash.integration.test.ts`, `worktrees.integration.test.ts`) are file-local, so the file builds its bare-`origin` fixture in the `worktrees.integration.test.ts` `fixture()` shape and imports no test file. Location: next to the sources it exercises, `*.integration.test.ts` per `docs/testing.md`.
- Fresh bare remote + clone on `dev`; foreign modified + untracked + staged files; a pre-existing foreign row in `.bkit/issues.jsonl`; one unpushed foreign commit; run `worktrees setup` (debug, in place) → `steps finish` → `ledgers commit` → foreign commit made mid-run → `roadmap mirror` (debug, on `dev`) → `workflows close --message` → `branches push --mode=dev`, plus a `--mode=feature` push on `dev`; assert remote log = recorded run commits only (neither foreign commit), foreign files byte-identical and still uncommitted / staged, close commit tree excludes them, the run's `.bkit/issues.jsonl` row on `origin/dev` while the foreign row is not, `replayed: true`; changed pre-dirty file → `EXIT_FOREIGN_PATH`.

#### [MODIFY] existing tests

- `fids.test.ts`, `steps.test.ts`, `prs.test.ts`, `worktrees.test.ts`, `ledgers.test.ts`, `branches.test.ts`, `runs.test.ts`, `land.test.ts`, `workflows.test.ts`, `locks.test.ts`, `auto-fid-guard.test.ts`, `cloud-ctx-step.integration.test.ts`, `close-squash.integration.test.ts` — per runbook task. (`workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts`, `wording.test.ts` → Sub-Plan 2.)

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `prs.ts` `FID_FORMAT` / `ISSUE_FORMAT` | `fids.ts` `FID_PATTERNS` / `ISSUE_ID_PATTERNS` / `fidProblem` | DELETE | Duplicate shape rules drift; one source |
| `worktrees.ts` ship refusal text (`refusing to ship ${target}…` body) and "commit or stash local changes" message for a missing `feat/{FID}` | New refusal text; missing-branch message | DELETE | Misleading / incomplete; prefix kept |
| `land.ts` file header L1–7 (`what it lands is bookkeeping only (docs, logs, ledgers, [skip ci])` + its user list), `pushToDev` docstring L106–111 (`Land one commit on dev`) and log line `it lands bookkeeping only` (L119) | Current-state text: hooks skipped; lands bookkeeping or a debug-on-`dev` run's own commits (one or several); user list names the replay | DELETE | False once debug code commits replay through it |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date and follow-up issue link.
>
> never accept `@deprecated` and still exported as a resolution. Each `DELETE` row must be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

No file-level `[DELETE]`: every row removes a symbol or text inside a `[MODIFY]` file; removal tasks: T4 (`FID_FORMAT` / `ISSUE_FORMAT`), T5 (worktrees texts), T12 (`land.ts` header + `pushToDev` text). Rows for `AGENTS.md` (T10), debug prose (T14) and wording `retired` (T7) → Sub-Plan 2.

## Documentation Updates

> Docs this change touches only; delete rest. Core below; others via `.agents/docs.md`. Code-change treatment — rewrite prose, no lazy bullet appends.

None in this sub-plan. Every `Documentation Updates` row is linked to Sub-Plan 2 tasks (T10 `AGENTS.md`, T16 docs / `CHANGELOG.md`, T17 ledgers) and lands there; in-file engine docstrings / headers this sub-plan touches (`land.ts`, T12) are rewritten to current state inside their task.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database |
| **Code** | `git revert {COMMIT}` of the wave commits (or the squash); rebuild `dist/`; `pnpm bkit upgrade` regenerates mirrors; consumers pin the previous `@cbartens/bkit` version | Engine + workflows ship together in the package; reverting one without the other leaves workflows passing `--issue` to an engine that rejects unknown flags |
| **Risk window** | Issue-less PRs opened before a revert carry `<!-- bkit:fid=X -->` under a wired tracker; the reverted `fromMarker` no longer resolves them | Recovery: name the FID in the prompt; `/bkit-auto` already refuses them, so no cloud run fires |

_Code-only — `git revert` sufficient._ Reverting this sub-plan after Sub-Plan 2 landed → revert Sub-Plan 2 first (its workflows pass `--issue`).

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

**Integration shape (advisory):** engine-only sub-plan; master Wave 1 engine tasks, then master Wave 3 engine tasks, then the `dist/` rebuild; each wave reviewed before commit; Sub-Plan 2 follows on the same branch. Task numbers are the master's (1–5, 11–13, 6). Contract changes (`fromMarker`, `prMarker`, `mergePr`, `writeStepRow`, `commitBookkeeping`, `closeWorkflow`, `locks release`, `pushBranch` (sync → `async`), `pushToDev` log text, `ciDispatchGate` + re-trigger, `runs context`, new `ledgers.ts` record helpers, `carryOwnBook` line-filter lift) → grep every caller and read each hit in full before editing. Boundary: no workflow prose changes here, so this sub-plan ends with local gates green while the workflows keep today's flags.

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

**Wave 1 — Engine, tests**

- [x] **Task 1:** Issue-less FID rule and `fids check --issue` in `fids.ts`. **Done when:** `.bkit/core/engine/commands/workflow/fids.ts` exports `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem`; `bkit fids check --fid=dev-ci-failures --issue=""` exits 0 under github / linear / jira; `123-fix`, `fix-2-retry`, `dev-123-x` with `--issue=""` exit 1 naming the rule; `--issue=650` (github) requires the github shape; `--tracker=any --issue=""` applies the issue-less rule (`dev-ci-failures` exit 0, `123-fix` exit 1); flag absent and `none` tracker unchanged; `fids.test.ts` covers each row. **Test first:** `.bkit/core/engine/commands/workflow/fids.test.ts` `check --issue="" accepts dev-ci-failures under github` fails on exit code 0 — flag unknown, FID not github-shaped; `.bkit/core/engine/commands/workflow/fids.test.ts` `check --issue="" rejects a FID with an all-digit word under every wired tracker` fails on exit code 1 — `123-fix` passes the github shape today; `.bkit/core/engine/commands/workflow/fids.test.ts` `fidProblem with --issue absent matches today` fails on the missing export; `.bkit/core/engine/commands/workflow/fids.test.ts` `check --tracker=any --issue="" applies the issue-less rule` fails on exit code — flag unknown today.
- [ ] **Task 2:** Issue-less fallback in `fromMarker` / `fromBranch` / `fids parse`; `/bkit-auto` fail-closed pins. **Done when:** under github / linear / jira, `fromMarker("<!-- bkit:fid=dev-ci-failures -->")` and `fromBranch("feat/dev-ci-failures")` return `{ fid: "dev-ci-failures", issueId: null }`; `fids.test.ts` L206–251 "embeds no … issue id" rows flipped to `issueId: null`; tracker-shaped values parse as today; `SLUG` failures still return no result; `runs context` keeps its refusal exit for `issueId: null` through an explicit `issueId === null` guard in `.bkit/core/engine/commands/workflow/runs.ts` (`EXIT_NO_FID`, log names the missing issue), for both marker and branch, covered in `runs.test.ts`; `auto-fid-guard.test.ts` (L78–82 and new rows) rejects traversal / injection values through both fallbacks; `cloud-ctx-step.integration.test.ts` asserts an issue-less marker resolves no issue and the step refuses. **Test first:** `.bkit/core/engine/commands/workflow/fids.test.ts` `fromMarker returns issueId null for a FID-only marker under github` fails on the returned issueId — no result today; `.bkit/core/engine/commands/workflow/fids.test.ts` `fromBranch returns issueId null for feat/dev-ci-failures under linear` fails on the returned issueId — no result today; `.bkit/core/engine/commands/workflow/runs.test.ts` `runs context refuses an issue-less marker and branch naming the missing issue` fails on the log line — says no FID in the marker today. (`auto-fid-guard` and `cloud-ctx-step` rows are fail-closed pins, green before and after.)
- [x] **Task 3:** `steps gate --issue`. **Done when:** `.bkit/core/engine/commands/workflow/steps.ts` `GateOptions.issue` set from `--issue`; FID check uses `fidProblem`; absent flag unchanged; `steps.test.ts` covers issue-less pass and digit-word fail. **Test first:** `.bkit/core/engine/commands/workflow/steps.test.ts` `gate --issue="" fails the fid check for 123-fix under github` fails on ok true — flag ignored, github shape matches; `.bkit/core/engine/commands/workflow/steps.test.ts` `gate --issue="" passes the fid check for dev-ci-failures under github` fails on ok false — github shape required today.
- [x] **Task 4:** `prs.ts` marker + base guards; `branches land` issue-less. **Done when:** `prMarker` emits `<!-- bkit:fid={FID} -->` with a wired tracker and empty issue; `FID_FORMAT` / `ISSUE_FORMAT` removed (`grep -n "FID_FORMAT\|ISSUE_FORMAT" .bkit/core/engine` empty); `bkit prs open --base=main` exits `EXIT_BASE_MAIN` with no `gh` call; `bkit prs merge` on a PR whose live base is not `dev` exits `EXIT_BASE_NOT_DEV` with no merge call; the base comes from `mergePr`'s existing `probePr` read (no extra `gh pr view` call) and an unknown base fails closed; `landPr` (`branches.ts:1097`) with base `dev` still merges and with base `main` or an unknown base is refused without a retry; `closePr` (`workflows.ts:1045`) with base `dev` still merges and with an unknown base (`probePr` returns no `baseRefName`) is refused with no merge call; `branches land` without `--issue` writes the FID-only marker; tests in `prs.test.ts`, `branches.test.ts`, `workflows.test.ts`, `close-squash.integration.test.ts`. **Test first:** `.bkit/core/engine/commands/workflow/prs.test.ts` `prMarker writes a FID-only marker with github wired and no issue` fails on the marker text — throws for a missing issue today; `.bkit/core/engine/commands/workflow/prs.test.ts` `prs open refuses --base=main` fails on exit code — opens today; `.bkit/core/engine/commands/workflow/prs.test.ts` `prs merge refuses a PR whose base is main` fails on the merge call count — merges today; `.bkit/core/engine/commands/workflow/prs.test.ts` `prs merge refuses when the PR base is unknown` fails on the merge call count — merges today; `.bkit/core/engine/commands/workflow/branches.test.ts` `landPr refuses a main-based PR without retrying` fails on the merge call count — merges today; `.bkit/core/engine/commands/workflow/branches.test.ts` `landPr refuses when the PR base is unknown` fails on the merge call count — merges today; `.bkit/core/engine/commands/workflow/workflows.test.ts` `closePr refuses when the PR base is unknown` fails on the merge call count — merges today; `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `lands an issue-less run with a FID-only marker` fails on the PR body marker.
- [x] **Task 5:** `worktrees setup` refusals. **Done when:** ship on `dev` / `main` prints the `Breaking Changes` refusal text (prefix `refusing to ship ${target}` kept), exit unchanged; missing `feat/{FID}` for ship → message names the missing branch, no "commit or stash"; design / plan / build / debug in place on `main` refused (debug already refused at `worktrees.ts` L501 — pinned, green before and after); an adopt-mode cloud session branch whose upstream is `main` still accepted (pin row); `worktrees.test.ts` L126–205 updated + new rows. **Test first:** `.bkit/core/engine/commands/workflow/worktrees.test.ts` `ship on dev refuses with the releases-stay-manual text` fails on the message text; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `ship names a missing feat branch` fails on the message text — says commit or stash today; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `build in place on main is refused` fails on exit code 0; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `design and plan in place on main are refused` fails on exit code 0.

**Wave 3 (engine) — Debug on `dev` in place**

- [ ] **Task 11:** Shared-checkout record + own-path commits + record lifetime. **Done when:** `worktrees setup` (debug, in place, `dev`) writes the record at `git rev-parse --git-path bkit/shared-checkout/{FID}.json` (start SHA, `aheadAtStart`, dirty + untracked paths with hashes, line counts for append-only `*.jsonl` ledgers, empty `commits`), returns `startSha` and `aheadAtStart` in its JSON output, and refuses with `EXIT_SHARED_BUSY` when another FID's record has a live lock; a resume of the same FID (open run in `{STATUS}`) reuses the record, a new run rewrites it; `writeStepRow` with a record commits only non-recorded paths (pathspec; temp index when the own set is empty) and exits `EXIT_FOREIGN_PATH` naming paths when a recorded hash changed (recorded append-only ledgers: only the run's appended rows committed, Open Question 4); `commitBookkeeping` `stageTrackedUpdates` excludes recorded paths and applies the same refusal; `closeWorkflow` (`workflows.ts` L991) applies the same rule instead of `git add -A`; each of these commits appends its SHA to the record's `commits`; a hook-refused own-path commit exits through the existing commit-failure code with no foreign path staged and no SHA recorded; record removed at close / abort meaning the run's end — by `locks release --kind=workflow` (debug Step 11, after the CI wait) and by the shared-branch hand-back of `workflows handover` — and still present after `workflows close`; hand-back never resets or removes a recorded path or a recorded foreign ledger row; without a record, behaviour unchanged; record read / write / SHA append / remove, the own-path set (ledger-row filter included) and the own-path commit (pathspec or temp index) live once in `ledgers.ts` and every caller (`worktrees.ts`, `steps.ts`, `ledgers.ts` `commitBookkeeping`, `workflows.ts`, `branches.ts`, `runs.ts`, `locks.ts`) calls them — `git grep -ln "bkit/shared-checkout" -- '.bkit/core/engine/commands/workflow/*.ts' ':!*.test.ts'` prints only `ledgers.ts`; `carryOwnBook` uses the lifted line filter; tests in `steps.test.ts`, `ledgers.test.ts`, `worktrees.test.ts`, `workflows.test.ts`, `locks.test.ts`, `shared-checkout.integration.test.ts` (foreign modified / untracked / staged files untouched and uncommitted after `steps finish` + bookkeeping commit + close commit; the debug-on-`dev` `roadmap mirror` row in `.bkit/issues.jsonl` committed while a pre-existing foreign row in the same file is not). **Test first:** `.bkit/core/engine/commands/workflow/steps.test.ts` `writeStepRow with a shared-checkout record never commits a recorded path` fails on the committed path list — `git add -A` takes it today; `.bkit/core/engine/commands/workflow/steps.test.ts` `writeStepRow refuses when a recorded path changed` fails on exit code; `.bkit/core/engine/commands/workflow/ledgers.test.ts` `stageTrackedUpdates skips recorded paths` fails on the staged path list; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `in-place debug on dev writes the shared-checkout record` fails on the missing record file; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `foreign staged and untracked files survive a run commit` fails on the HEAD tree containing notes.md; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `in-place debug on dev returns startSha and aheadAtStart` fails on the missing output fields; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `a new run of the same FID rewrites startSha` fails on the missing record file; `.bkit/core/engine/commands/workflow/steps.test.ts` `writeStepRow appends its commit sha to the record` fails on the missing record commits list; `.bkit/core/engine/commands/workflow/steps.test.ts` `a hook-refused own-path commit exits without staging a recorded path` fails on the staged path list — `git add -A` staged it; `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a recorded ledger commits only the rows the run appended` fails on the committed blob holding the foreign row; `.bkit/core/engine/commands/workflow/workflows.test.ts` `close with a shared-checkout record never commits a recorded path` fails on the committed path list — `git add -A` takes it today; `.bkit/core/engine/commands/workflow/workflows.test.ts` `record is present after workflows close and before the push` fails on the missing record file; `.bkit/core/engine/commands/workflow/workflows.test.ts` `failed handover from dev removes the record and keeps recorded paths` fails on the record file still present after hand-back; `.bkit/core/engine/commands/workflow/locks.test.ts` `locks release removes the FID shared-checkout record` fails on the record file still present; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `close commit tree excludes foreign files` fails on the close commit tree containing notes.md; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not` fails on the foreign row in the committed blob; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock` fails on exit code 0 — no record check today; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `a stale record without a lock is replaced` fails on the missing record file; `.bkit/core/engine/commands/workflow/worktrees.test.ts` `a resume of the same FID reuses the record` fails on the missing record file; `.bkit/core/engine/commands/workflow/ledgers.test.ts` `commitBookkeeping refuses when a recorded path changed` fails on exit code 0 — commits the changed path today.
- [x] **Task 12:** Own-commit push. **Done when:** `pushBranch` on a shared branch with a record — mode `dev` and also `feature` / `abort` — pushes only the run's commits = the record's `commits` SHAs (a subset of `startSha..HEAD`; a foreign commit made before or during the run is never pushed) — plain `git push origin dev` when `origin/dev..HEAD` equals exactly those SHAs, else `pushToDev` replay of exactly those SHAs in `.worktrees/_land-{FID}` through a cherry-pick `build` callback, no `pushToDev` signature change (retry on moved `dev`, conflict → non-zero with paths, throwaway checkout removed); `pushToDev` server refusal → `EXIT_PUSH_FAILED` naming the refusal; output `replayed`, `sha` = pushed remote SHA as returned by `pushToDev` after a replay (never `git rev-parse HEAD`); resync command logged; skip-CI check applies to the replayed HEAD; `pushBranch` is `async` and its callers (`branches.ts:648` / `1067`, `workflows.ts:604`) await it; `pushToDev` docstring and L119 log line no longer say it lands bookkeeping only; `land.ts` file header L1–7 (user list + `what it lands is bookkeeping only`) and docstring L106–111 (`Land one commit on dev`) rewritten to current state — `git grep -n "bookkeeping only\|Land one commit" -- .bkit/core/engine/commands/land.ts` empty; a server-refused push reports `pushed: false`; no record → unchanged; tests in `branches.test.ts`, `land.test.ts`, `shared-checkout.integration.test.ts` (remote log = run commits only; foreign local commit absent, the mid-run one included; sequence `worktrees setup` → `steps finish` → `workflows close` → `branches push --mode=dev`; `--mode=feature` on `dev` with a record never pushes the foreign commit). **Test first:** `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `push from an ahead local dev lands only the run commits` fails on the remote log containing the foreign commit; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `push from a level local dev is a plain push` fails on replayed true; `.bkit/core/engine/commands/land.test.ts` `pushToDev replays a commit range onto origin/dev` fails on the missing replay `build` callback (the range lives in the callback, not a new `pushToDev` input); `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `a foreign commit made mid-run never reaches the remote` fails on the remote log containing the mid-run commit; `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` `feature-mode push on dev with a record never pushes the foreign commit` fails on the remote log containing the foreign commit — plain push today; `.bkit/core/engine/commands/workflow/branches.test.ts` `push after a replay reports the pushToDev sha not HEAD` fails on sha equal to local HEAD; `.bkit/core/engine/commands/land.test.ts` `pushToDev log line names what it lands` fails on the bookkeeping-only text; `.bkit/core/engine/commands/workflow/branches.test.ts` `replay build callback cherry-picks exactly the recorded SHAs` fails on the missing callback; `.bkit/core/engine/commands/workflow/branches.test.ts` `replay conflict exits non-zero naming the paths and removes the throwaway checkout` fails on exit code 0 — no replay path today; `.bkit/core/engine/commands/workflow/branches.test.ts` `a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal` fails on the pushToDev call count — plain git push origin dev today; `.bkit/core/engine/commands/workflow/branches.test.ts` `skip-ci HEAD on the replay is refused` fails on the missing EXIT_SKIP_CI — no replay path today; `.bkit/core/engine/commands/workflow/branches.test.ts` `abort mode on dev with a record pushes only recorded SHAs` fails on the plain git push origin dev call.
- [x] **Task 13:** `runs dispatch` on `dev`. Depends on Task 12. **Done when:** `ciDispatchGate` (`runs.ts` L1247) on a shared branch with the pushed SHA and no `--pr` resolves the push-event run and exits 0 when it started; the re-trigger (`pushCurrentBranch` L309–317) on a shared branch with a record appends its commit SHA to the record and pushes through the Task 12 own-commit push, never a plain `git push origin dev`, and the gate follows the landed SHA; with a record the re-trigger commit (`runs.ts` L402–407) is made through the `ledgers.ts` own-path commit with an empty own set (temp `GIT_INDEX_FILE` read from `HEAD`), so a path the user staged before or during the run never lands in it; re-trigger on `dev` without a record unchanged (pin); non-shared branches unchanged; `runs.test.ts` rows. **Test first:** `.bkit/core/engine/commands/workflow/runs.test.ts` `dispatch on dev with a pushed sha and no pr proves the run started` fails on exit code — empty `--pr` rejected today; `.bkit/core/engine/commands/workflow/runs.test.ts` `re-trigger on dev with a record pushes through the own-commit push` fails on the plain git push origin dev call; `.bkit/core/engine/commands/workflow/runs.test.ts` `re-trigger on dev with a record never commits a foreign staged path` fails on the committed path list — git commit --allow-empty takes the whole index today.

**`dist/` rebuild — last task of this sub-plan (placed after Tasks 11–13 so `dist/` holds every engine change and the boundary stays green)**

- [x] **Task 6:** Rebuild `dist/` for Wave 1. **Done when:** `pnpm build` exits 0; `pnpm bkit:check:dist` exits 0. **Test first:** n/a — build artefact, no behaviour change of its own.

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

Applied here: engine logic at Unit (Vitest, `gh` mocked at the process boundary); real `git` against a fresh bare remote at Integration (`shared-checkout.integration.test.ts`, `close-squash.integration.test.ts`, `cloud-ctx-step.integration.test.ts`); no UI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row → one runbook task whose `Done when` carries its test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke; full suite green per `docs/testing.md`. Fix only what tasks missed.
- [ ] **Sweep new tests:** Each task's `Done when` tests exist and pass per Testing Strategy; add only what tasks missed — not where tests are first written. Reuse data factories + auth conventions (above) for UI E2E tests.
- [ ] **Verify observability:** N/A for logs / spans — new refusals surface as command-specific exits with a `log()` line naming the cause (paths, base, FID rule); confirm each new exit prints one (`EXIT_BASE_MAIN`, `EXIT_BASE_NOT_DEV`, `EXIT_FOREIGN_PATH`, `EXIT_SHARED_BUSY`, `runs context` `EXIT_NO_FID` issue-less log).
- [ ] **Update documentation:** No `Documentation Updates` rows in this sub-plan (all held by Sub-Plan 2 Tasks 10 / 16 / 17); engine docstrings / file headers touched here (`land.ts`, Task 12) rewritten to current state. Rewrite ground-truth prose; do not append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does. Do not write "before merge" on untickable boxes — CI/human-only preconditions (lane RUN, deployed state, operator step) unenforceable. Work that MUST block merge → runbook task + codebase-verifiable `Done when`; lane that must run → CI config, not plan prose.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (typecheck, lint, `format:check`, prose, `slop:delta`, unit, integration) + `pnpm bkit check` + `pnpm bkit:check:dist`. Do not weaken gates (anti-suppression CRITICAL under Architecture & Component Changes). New `spawnSync` / `child_process` use in engine code → add to the `vi.hoisted` mock in `.bkit/core/engine/checks/after/index.test.ts` if `slop:delta` flags it.
- [ ] **Test Synchronization:** Existing tests updated in their task — `fids.test.ts` L206–251 (T2), `worktrees.test.ts` L126–205 (T5), `auto-fid-guard.test.ts` L78–82 (T2), `branches.test.ts` / `workflows.test.ts` / `runs.test.ts` callers of the now-`async` `pushBranch` (T12); unchanged-expectation suites kept green: `land.test.ts` bookkeeping-only callers, and every Sub-Plan 2 prose suite (`workflow-shape.test.ts`, `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts`, `wording.test.ts`, `render/trackers.test.ts`) unchanged and green against today's workflow prose.
- [ ] **Build Configuration:** New test file matches the existing `*.integration.test.ts` glob and stays out of `dist/` (`pnpm bkit:check:dist` clean).
- [ ] **Unit (`fids.test.ts`, `steps.test.ts`, `prs.test.ts`, `worktrees.test.ts`, `ledgers.test.ts`, `branches.test.ts`, `runs.test.ts`, `land.test.ts`, `workflows.test.ts`, `locks.test.ts`, `auto-fid-guard.test.ts`):** rows per Derived Test Matrix.
- [ ] **Integration (`shared-checkout.integration.test.ts`, `close-squash.integration.test.ts`, `cloud-ctx-step.integration.test.ts`):** fresh temp repos + bare remotes per test; removed in `afterEach`.
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

Engine-only checks (step numbers kept from the Parent Plan; Step 1 rendered workflows and Step 6 live session run in Sub-Plan 2, where Task 19 repeats Steps 1–5 on the finished feature).

- [ ] **Step 2:** In the scratch consumer: `npx bkit fids check --fid=dev-ci-failures --issue=""` → exit 0; `--fid=123-fix --issue=""` → exit 1; `npx bkit fids parse` on `feat/dev-ci-failures` → `issueId: null`; `npx bkit steps gate … --fid=dev-ci-failures --issue=""` → FID check `ok: true`.
- [ ] **Step 3:** With `gh` off `PATH`, `npx bkit prs open … --fid=dev-ci-failures` (no `--issue`) → exit 80, printed body contains `<!-- bkit:fid=dev-ci-failures -->`; `npx bkit prs open … --base=main` → refused before any `gh` call.
- [ ] **Step 4:** Scratch repo + local bare remote on `dev`: modified `notes.md`, one unpushed commit; run `worktrees setup` (debug, in place) → `steps finish` → a second foreign commit by hand → `workflows close` → `branches push --mode=dev`; `git log origin/dev` shows only the run commits (close included), `git status` still shows `notes.md` modified, both foreign commits remain local, output has `replayed: true` and a `sha` equal to `git rev-parse origin/dev`; the record file still exists until `locks release`.
- [ ] **Step 5:** `npx bkit worktrees setup` for ship on `dev` → the releases-stay-manual refusal text.

<!-- bkit:end -->
