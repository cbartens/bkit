Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary

## Overview

Two sub-plans from a complexity split, 19 tasks in total. Sub-Plan 1 (`plan-v4-1.md`) is the engine: 9 tasks (T1–T5, T11–T13, T6). Sub-Plan 2 (`plan-v4-2.md`) is wording, the five workflows, router, docs, ledgers, mirrors and verification: 10 tasks (T7–T10, T14–T19).

Goal: no workflow stops when the prompt names no issue; `/bkit-debug` works on `dev` in place, pushes only its own commits and waits for `dev` CI; `/bkit-ship` never reaches `main`. Input: issue #650 and its Q1–Q7 answers; no design doc.

Gates: Gate 1 is blocked on a human-written Narrative and unticked confirmations (expected). Gates 2–4 sit in each sub-plan. All six Success Criteria map to tasks.

## Plan Quality

- Well-scoped: yes. The split keeps each boundary green, and Sub-Plan 1 changes no prose.
- Dependencies: clear and one-way. Sub-Plan 2 needs Sub-Plan 1 Gate 4.
- Gates: present in both sub-plans and correctly placed. Gate 1 cannot pass until the Narrative is filled.
- Weak spots: Task 11 `Done when` bundles about 17 test references (sizing risk). Some Derived Test Matrix rows bundle several behaviours. The "behaviour-preserving" boundary claim needs correction (Action Items 8). The `bkit-cloud.yml` fail-closed claim has no test (Action Items 6).

## Completeness

- Scope: all six Success Criteria and answers Q1–Q7 map to tasks.
- Testing: 31 matrix rows (19 in Sub-Plan 1, 12 in Sub-Plan 2). Real-git integration covers in-place commits and push. Workflow prose is checked by string-shape tests, plus one live step that is hard-blocked (see Risks).
- Docs: Task 16 (workflows, trackers, lite, testing, CHANGELOG), Task 17 (decisions and deferrals ledger rows), Task 18 (mirrors via `pnpm bkit upgrade`).
- Migrations: none stated. A missing record file is a no-op.
- Verification: Task 19 runs the full suite, `bkit check`, `check:dist`, and a packed-tarball dogfood.

## Acceptance Scenario

**Narrative** (parent index; sub-plans carry the same text, differing only in the Gate 1 line)

`⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`

Issue #650 has no `Narrative` section (no design, no audit). Closest issue text, verbatim from `### Outcome`, for the human to adopt or replace:

> Every workflow runs on the prompt alone. A missing issue, design or plan prints a warning and the run continues. `/bkit-debug` runs on any branch except `main`, `dev` included. `/bkit-ship` keeps refusing `dev` and `main` and never opens or merges a PR from `dev` into `main`; releases stay manual.

**Success Criteria** (verbatim)

- `/bkit-debug ci failures on dev`, run on `dev` with the GitHub tracker wired and no issue named: prints a warning that names the missing issue, then diagnoses, fixes and lands the fix on `dev`. It does not stop.
- The same holds for design, plan, build and ship: no issue → warning → run continues from the prompt.
- An issue-less run makes no tracker calls tied to an issue (labels, comments, board, issue reads), and none of them fail the run.
- An issue-less run gets a valid FID (the run's log-folder name) in a tracker-wired repo. It can never be misread as an issue id.
- The no-issue warning is the first line of every final message the workflow returns.
- `/bkit-ship` on `dev` or `main` refuses with a message saying releases stay manual. No ship path can merge into `main`.

**Process Sketch** (verbatim)

- **WHEN** `/bkit-debug ci failures on dev` runs on `dev`, GitHub tracker wired, no issue named **→ THEN** Step 1 prints the no-issue warning naming FID `dev-ci-failures` and the run continues with no issue-tied tracker call.
- **WHEN** the fix is committed and pushed **→ THEN** only the run's own paths and commits reach `origin/dev`, and the run waits for `dev` CI on the pushed commit before closing.
- **WHEN** the run returns **→ THEN** line 1 of the final message is the no-issue warning.
- **IF** the prompt names no issue but the branch is `feat/650-foo` or the prompt names a FID carrying one **→ THEN** that issue is read, labelled and commented on as if named (Q2).
- **IF** a minted slug carries an all-digit word (`dev-123-ci-failures`) **→ THEN** it is dropped (`dev-ci-failures`); a tracker-shaped FID with `--issue=""` (`123-fix`, `fix-2-retry`) is rejected (Q3).
- **IF** debug must change a file already dirty before the run, or local `dev` holds commits the run did not make **→ THEN** it stops and asks / replays only its own recorded commits onto `origin/dev` (Q1).
- **IF** `/bkit-ship` runs on `dev` / `main`, or a PR's base is `main` at open or merge **→ THEN** refused; releases stay manual (Q4).

**Concrete Example** (verbatim, Sub-Plan 1)

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

**Edge Cases** (verbatim, Sub-Plan 1 table)

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

**Edge Cases** (verbatim, Sub-Plan 2 table)

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

**Spec adherence (`docs/templates/bkit-plan.md` § Spec):** adheres in structure, Gate 1 handling and the no-fabrication rule for the Narrative. Deviations: 6 Success Criteria bullets (allowed by the verbatim rule for an issue with no design); Derived Test Matrix rows bundle several behaviours (Spec: one row per behaviour); the parent is a split index, so its Narrative and Process Sketch are inherited copies.

## Breaking Changes

1. Missing issue no longer stops the five workflows; the warning replaces the STOP. Wired-tracker consumers lose that enforcement. Sub-Plan 2.
2. `bkit prs merge` refuses any PR whose base is not `dev` or cannot be read. `bkit prs open --base=main` is refused. Scripts merging other bases break. Sub-Plan 1; CHANGELOG in Sub-Plan 2 Task 16.
3. `bkit worktrees setup` refuses `main` in place for design, plan and build. Sub-Plan 1.
4. Engine contracts: `--issue` on `fids check` / `steps gate`; `issueId: null` for issue-less FIDs; FID-only PR marker; `startSha` / `aheadAtStart` output and the shared-checkout record; own-path commits and `EXIT_FOREIGN_PATH`; shared-branch `branches push` sends only recorded SHAs (`pushBranch` becomes async; output gains `replayed`); `runs dispatch` by SHA; `locks release` removes the record. Sub-Plan 1.
5. Proposed names: `ISSUE_LESS_FID`, `ISSUE_ID_PATTERNS`, `fidProblem`, `--issue`, `EXIT_BASE_MAIN`, `EXIT_BASE_NOT_DEV`, `EXIT_FOREIGN_PATH`, `EXIT_SHARED_BUSY`, the record path, ship refusal text (Sub-Plan 1); wording clauses `workflow-no-issue-warning`, `workflow-final-first-line`, eight changed clauses, and the `**No issue:**` bullet (Sub-Plan 2). All await human confirmation (boxes unticked).

## Design Alignment

No design doc exists, so the issue #650 text is the reference.

- Success Criteria: verbatim match to the issue's `### Success criteria` (six bullets).
- Narrative: not filled. The issue's `### Outcome` is the proposed text, pending the human.
- Scope: within the issue's Constraints and answers Q1–Q7. The shared-checkout record, replay and `runs dispatch` by SHA follow from the Q1 answer. Non-goals kept: `/bkit-auto` stays issue-only, no auto-create, `utility-new-release` stays separate.

1. `.bkit/core/hooks/preflight-linear.sh` L13–18 stays as is for Linear cloud agents with no `LINEAR_ISSUE_ID`. Exempt (owner answer Q6). Deferral `650-preflight-linear-issue-less`.
2. Issue-less `/bkit-auto` and `bkit-cloud.yml` dispatch. Exempt (non-goal). Deferral `650-bkit-auto-issue-less`. Its fail-closed claim has no test (Action Items 6).
3. Automatic FID continuity across reworded re-runs. Exempt (Q7); the doc line is in Task 16. Deferral `650-issue-less-fid-continuity`.
4. Live round-trip on real GitHub Actions (own-commit push, then dispatch, wait and gate on the landed `dev` SHA). The plan labels it Exempt and hard-blocked. This review classifies it as **Blocking**: Success Criterion 1 and the Process Sketch require the wait for `dev` CI, and the only live check (Manual Step 6) is advisory and unticked. Deferral `650-debug-dev-ci-live-round-trip`. See Action Items 2.

The deferral rows are said to be appended to `docs/deferrals.jsonl`. This review did not verify them (Task 17 owns that check).

Advisory only; these do not gate the verdict.

1. `branches land` MCP fallback (exit 80, then the agent merges via MCP) does not assert the PR base is `dev`. Source: plan survey. Recommendation: fold in, as one prose assert. Relevant to Success Criterion 6 (Action Items 4).
2. `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (deferral). Keep deferred.
3. `639-refused-ship-failed-record-lost-in-cloud-container` (deferral). Keep deferred.
4. `384-required-status-checks-on-dev-via-bkit-protect-main` (deferral). Keep deferred.
5. `363-main-branch-trigger-excluded-reversal` (deferral). Keep deferred.
6. `steps-placeholder-gate-false-positive-on-derived-issue-dump` (failure). Needs a design decision.
7. `363-dev-dispatch-cap-self-resettable-by-controlled-principal` (deferral). Keep deferred; cited in Open Question 1.
8. `442-plan-template-design-missing-fallback-amendment` (deferral). Needs a design decision; this is the Narrative gap.
9. #639 open item: stale `RUNTIME_DEVPUSHES` reason at `.bkit/core/engine/commands/workflow/runtime.ts:110`. Keep deferred.

10. Task 11 and Task 12 are large. Partial completion is a risk; sequence the sub-steps inside each task.
11. Workflow behaviour (no tracker calls, warning as line 1, ship refusal) is checked only by string-shape tests. Project doctrine warns that such tests can encode the bug. The only behavioural check is Manual Step 6, which is hard-blocked.
12. Not verified in this review (no code search tool here): CLI flags such as `bkit install --codex`, `runs gate --capstone-only` and `locks release --kind=workflow`; exit numbers; line numbers; ledger rows; the `CHANGELOG.md` `[Unreleased]` section.
13. Accepted assumption: the slug drops digit words (`node-22-upgrade` becomes `node-upgrade`). The FID stays valid.
14. Owner answer Q6 leaves Linear cloud agents stopped when no issue is named. This sits in tension with the constraint "works for linear alike". Noted only; the owner decided it.
15. Migrations: none stated. A missing record file is a no-op, so likely none is needed; the plan should say so.
16. The `plan-*.md` glob was not run, because this subagent has no glob or search tool. The review used the named files plus the split index.

17. **Gate 1, human:** fill the Narrative in the parent and both sub-plans (same text), then tick Acceptance Scenario, Breaking Changes and Open Questions & Assumptions in each. The unticked boxes are expected and do not drive the verdict alone; the empty Narrative does.
18. **Human decision, Blocking deferral `650-debug-dev-ci-live-round-trip`:** either make Manual Step 6 a required check (a runbook task, run by the owner before merge), or re-scope Success Criterion 1 and record the decision. This also settles the untested live path (Risks 2).
19. **Process Sketch IF bullet (parent and both sub-plans):** it says "stops and asks / replays" for two different cases. Split it. A file dirty before the run stops and asks (`EXIT_FOREIGN_PATH`). Local `dev` ahead of `origin/dev` replays only the run's recorded SHAs and does not stop. The Concrete Example already does the second.
20. **Merge-path assumption:** "no bkit path merges into `main`" is contradicted by Suggested Scope Expansion 1 (`branches land` MCP fallback). State whether `/bkit-ship` can reach it. If it can, fold in the base assert before build (Success Criterion 6).
21. **Scratch paths:** Sub-Plan 2 Task 19 `Done when` and Manual Step 1 use `/private/tmp`. `.agents/rules.md` says tmp files go in repo-root `tmp/`, never `/private/tmp`. Change the paths, or record why the rule does not apply.
22. **`bkit-cloud.yml` fail-closed claim:** Edge Cases says it fails closed and the issue promised a test, but no matrix row or task covers it. Add a read-only test row and task (no workflow edit without human confirmation), or drop the claim.
23. **Blast radius:** record a search for `bkit prs merge` and `bkit prs open --base` callers aimed at `main` in bkit-internal release tooling (for example `utility-new-release` and release docs). The plan lists only `prs.ts:931` and ship Step 10.
24. **Split-boundary claim:** Sub-Plan 1 calls the intermediate state "behaviour-preserving". That is not quite right. In-place debug on `dev` writes the record and makes own-path commits as soon as the engine ships, whatever the prose says. State that effect, or gate the record behind the prose change.
25. **Derived Test Matrix:** rows that bundle several behaviours (for example the Sub-Plan 1 T11 row) break "one row per behaviour". Split them, or record why bundling is accepted.
26. **Unchecked human gates (noted, expected):** Acceptance Scenario, Breaking Changes and Open Questions & Assumptions in the parent and both sub-plans. Not verdict-driving alone.

Verbatim from the sub-plans. Open Question 5 appears identically in both sub-plans and is listed once.

- **Open Question 1:** `dev` CI red on the pushed commit — what does debug do? (Q1.3 says "same as a red PR run", but debug never waits for a PR run's result today — premise correction 1.) → owner.
  - **Options:** A — Failure Path naming the red run URL; run closes FAILED; the `dev` CI router's `MAX_DEV_DISPATCH_ATTEMPTS` loop (`docs/deployments.md` L265) or a human re-run continues; that cap can be reset by the session it bounds (OPEN deferral `363-dev-dispatch-cap-self-resettable-by-controlled-principal`) · B — new attempt inside the same run (back to diagnosis under `MAX_DEBUG_ATTEMPT`); fully autonomous but a long session holding the checkout · C — close DONE with a warning; green-looking close on red CI.
  - **Recommended:** A — a red result is never reported as done, and retry already has a bounded owner.
  - **Default if unanswered:** A.
- **Open Question 2:** The replay onto `origin/dev` runs in `pushToDev`'s throwaway checkout with hooks off. → owner.
  - **Options:** A — accept: the run's own gates already ran on the same commits in the main checkout; widens decision `ship-dev-writes-through-throwaway-origin-dev-checkout` (bookkeeping-only) to debug code commits, recorded by the `650-debug-on-dev-in-place-own-files-own-commits` correction row · B — run the static / unit gate inside the throwaway checkout before pushing; slower, needs `node_modules` there · C — refuse when local `dev` was ahead and tell the human to push or park their commits first.
  - **Recommended:** A — same commits, already gated; `dev` CI is waited on afterwards (T14).
  - **Default if unanswered:** A.
- **Open Question 3:** After a replay, local `dev` (foreign commits + run commits) diverges from `origin/dev` (run commits replayed). → owner.
  - **Options:** A — leave local `dev` untouched; print the exact resync command (`git pull --rebase origin dev`) in the push output and the final message · B — auto-rebase local `dev` onto `origin/dev` at close; touches the human's commits.
  - **Recommended:** A — the run never rewrites commits it does not own.
  - **Default if unanswered:** A.
- **Open Question 4:** A path dirty before the run changed during the run — the engine cannot tell whether debug or the human edited it. Append-only ledgers (`.bkit/stats.jsonl`, `.bkit/issues.jsonl`, `docs/*.jsonl`) are often dirty and the run appends to them at every step. → owner.
  - **Options:** A — refuse the commit (`EXIT_FOREIGN_PATH`) naming the paths, workflow stops and asks (Q1.1), except append-only `*.jsonl` ledgers: commit only the rows the run appended (HEAD blob + rows past the recorded line count that HEAD lacks, the line filter `carryOwnBook` uses, `workflows.ts` L362–406); a ledger whose first recorded-count lines changed → `EXIT_FOREIGN_PATH` · B — refuse for every recorded path, ledgers included (literal Q1.1); a pre-dirty ledger stops every debug-on-`dev` run at its first `steps finish` · C — commit it anyway with a warning; mixes change sets.
  - **Recommended:** A — never mixes the two sets, and the debug-on-`dev` `roadmap mirror` row (knowledge `380-build-debug-dev-write-is-a-fourth-staging-shape`) still lands.
  - **Default if unanswered:** A.
- **Open Question 5:** A clean path first edited mid-run by someone other than the run is indistinguishable from debug's own edit (the record is a start snapshot, Q1.1). → owner.
  - **Options:** A — accept and document (§ Branch eligibility line): a mid-run edit by someone else is committed as the run's own; the workflow lock and `EXIT_SHARED_BUSY` stop parallel bkit runs, not humans · B — restrict the own set to paths the run's remediate step reports plus `docs/plans/**/logs/{FID}/` and engine-written ledgers; needs a new path-report contract from the debug subagents · C — refuse when a path outside the record and outside `docs/plans/**/logs/{FID}/` changed and no run subagent reported it; same new contract, stops instead of filtering.
  - **Recommended:** A — matches Q1.1's start-snapshot design; B / C add a subagent-to-engine path-report contract the source did not ask for.
  - **Default if unanswered:** A.

All five questions carry options, a Recommended and a Default. Assumptions are listed in the sub-plans and are not questions.

```text
/bkit-plan #650
Brief: revise before build. Fix the Process Sketch IF bullet, the /private/tmp scratch paths, the merge-path assumption and the bkit-cloud.yml test gap; get a human decision on the Blocking live Step 6 deferral; fill the Narrative (Gate 1). Plan: docs/plans/202610/logs/650-workflows-prompt-alone/plan-v4-split.md
```
