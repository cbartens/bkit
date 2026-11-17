Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 5 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-v1-draft.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/related-deferrals.md`, `docs/plans/202611/logs/849-keep-local-dev/related-failures.md`, `docs/plans/202611/logs/849-keep-local-dev/related-issues.md` |
| plan-review | CONCERNS | 12 | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-review-1.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-review-2.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-v2-reviewed.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/849-keep-local-dev/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-v1-draft.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/related-deferrals.md`, `docs/plans/202611/logs/849-keep-local-dev/related-failures.md`, `docs/plans/202611/logs/849-keep-local-dev/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-review-1.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-review-2.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/849-keep-local-dev/plan-v2-reviewed.md`, `docs/plans/202611/logs/849-keep-local-dev/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Every close that lands on `dev` leaves local `dev` level with `origin/dev` when a fast-forward can do it safely. When it can't, the final message says plainly that the work landed, how far local `dev` is ahead or behind, why it wasn't moved, and what to do by hand.

### Success Criteria

- After every push to `dev` (design/plan close, ship close including the final `ship DONE` commit, build/debug `branches push --mode=dev`, failure-record handovers, roadmap mirror pushes), a clean local `dev` that is only behind ends equal to `origin/dev`. Equal stays a no-op.
- Each of those paths reports one result: equal, fast-forwarded, ahead, divergent, blocked (with the reason) or unavailable (fetch failed). A blocked sync never turns a successful landing into a failure.
- When the fast-forward succeeds but the frozen install fails, the close still exits 0 and its sync line says the install failed and how to re-run it. No `friction` row. Standalone `bkit branches sync-dev` keeps exit 16.
- Local commits, staged changes, working-tree edits, the active branch and other worktrees are never changed by the automatic sync.
- The ahead / divergent message gives the counts and a plain manual step. It drops the `git pull --rebase` advice, which is wrong when local commits were already squashed into `origin/dev`.

The issue's two remaining bullets are a step and a test list, not outcomes: "Ship's sync moves into `workflows close`, after the final `ship DONE` landing. Ship Step 13 is removed." is carried by the Process Sketch and Tasks 6 and 10, and its test list by the Derived Test Matrix.

### Process Sketch

- **WHEN** a close or push lands on `origin/dev` and local `dev` is only behind **→ THEN** the engine fetches once, fast-forwards local `dev` to the fetched tip (frozen install when the main checkout is on `dev`), and the final message shows `Local dev: synced to origin/dev (…)` at the end of its summary (design / plan: right after `{FINAL_RETURN}`).
- **WHEN** ship's close lands `ship DONE` on `dev` **→ THEN** the same sync runs inside `workflows close --flush` after that landing, and ship has no separate Update Local Dev step.
- **IF** local `dev` holds commits `origin/dev` lacks **→ THEN** nothing moves, and the line gives the ahead / behind counts and points at `git log --oneline origin/dev..dev` with "bring local dev level by hand".
- **IF** git refuses the move (`dev` checked out in another worktree, an edit or untracked file the update would overwrite) **→ THEN** the result is `blocked` with the reason read from git state, the close still exits 0, and nothing in any checkout changes.
- **IF** the fetch fails, or ship's close PR is still open **→ THEN** the result is `unavailable` or `pending`, the landing still counts as done, and the line names `bkit branches sync-dev` as the retry.
- **IF** the fast-forward succeeds but the frozen install fails **→ THEN** the close exits 0 and the line says the install failed and how to re-run it, while standalone `bkit branches sync-dev` still exits 16.

### Concrete Example

**Setup:** The owner works on a laptop. The main checkout is on `dev` with a clean tree. Two plan closes from other sessions have landed on GitHub since the last fetch, so local `dev` is 2 commits behind `origin/dev` and holds nothing of its own. The owner runs `/bkit-ship 849` on a feature whose PR is open and green.

**Steps:**

1. The owner starts `/bkit-ship 849` → Ship merges the PR at Step 10 and goes straight to Close Workflow; there is no Update Local Dev step.
2. Close Workflow runs `workflows close --flush` → The engine lands `docs(849-keep-local-dev): ship DONE bkit [skip ci]` on `dev` from a throwaway checkout, removes the worktree and releases the lock.
3. The same close calls `syncLocalDev` after the landing → It fetches `origin/dev` once, counts 0 ahead / 4 behind (the two plan closes, the squash and `ship DONE`), runs `git merge --ff-only -q <tip>` in the main checkout and then the frozen install, which succeeds.
4. The ship workflow displays `{FINAL_RETURN}` → Its summary ends with `Your work landed on origin/dev (a1b2c3d). Local dev: synced to origin/dev (a1b2c3d).`, just before `## Suggested Replies`.

**Outcome:** `git rev-parse dev` equals `git rev-parse origin/dev`, `git status` is clean, and the close exited 0.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `origin/dev` moves between landing and sync | one fetch after the landing; the target is that fetched tip, not the landed SHA; the result reports the state actually observed. |
| Two parallel closes in one clone | each only fast-forwards with a non-forced update; git refuses the move that would go backwards, the refused close re-reads local `dev` once and reports what it finds; the later tip wins. |
| Ship close falls back to an unmerged PR | `pending`, no fetch, nothing moved. |
| `dev` checked out in a linked worktree | git refuses the ref update; `blocked: occupied`, read from `git worktree list --porcelain`, whatever git's locale. |
| Main checkout on `dev` with an edit to a file the update changes (always the case after a failure-record handover from `dev`), or an untracked file at a path the update adds | `merge --ff-only` refuses; `blocked: edited-files`, read from git state, whatever git's locale; the close still exits 0. |
| Debug run in place on `dev` whose own commits `pushOwnCommits` replayed as copies | Local `dev` is divergent by construction; the line uses the routine wording with `replayedOwn` (the number of the run's own commits replayed), points at `git log --oneline origin/dev..dev` and says "bring local dev level by hand", and names no reset command. |
| equal / behind / ahead / divergent | `equal` moves nothing; behind-only is fast-forwarded; `ahead` and `divergent` move nothing and report both counts. |
| edited and occupied worktrees | `blocked: edited-files` or `blocked: occupied`; no checkout, index or edit changes. |
| fetch failure | `unavailable: fetch-failed`; the landing still counts as done; the line names `bkit branches sync-dev` as the retry. |
| a ship close PR that stays unmerged (reports "landing pending") | `pending: close-pr-open`; no fetch; the line says the landing is pending on the close PR. |
| a landed close whose sync is blocked still exits 0 | The caller's exit code is computed before the sync and never changed by it. |
| The fast-forward succeeds and the frozen install fails | Close paths: `fast-forwarded`, `installed: false`, exit 0, and the line names the install command to re-run; no `friction` row. Standalone `bkit branches sync-dev`: exit 16. |
| Local `dev` already past the target because a later landing fast-forwarded it | `equal` when local `dev` matches the fetched `origin/dev`; never moved backwards. |
| Main checkout on a feature branch, local `dev` behind | Only the `dev` ref moves (non-forced `fetch . <tip>:refs/heads/dev`); the checked-out branch, index and edits stay as they were. |
| An edit to a file the update does not change, main checkout on `dev` | git accepts the fast-forward; `fast-forwarded`; the edit is kept. |
| A staged change to a file the update does not change, main checkout on `dev` | git accepts the fast-forward; `fast-forwarded`; the staged change stays in the index. |
| `branches land`'s audit stops with `EXIT_LANDED_UNVERIFIED` after the landing | No sync runs; local `dev` stays where it was; the workflow's Failure Path runs `workflows handover --push`, whose own `localDev` reports. |
| Ship's `workflows handover --flush` from a feature worktree | The record's edits are not in the main checkout, so the line uses the plain wordings, not the failure-handover one. |
| Runtime that cannot push `dev` (cloud session), or no local `dev` branch | `not-applicable` with reason `no-dev-push-runtime` or `no-local-dev`; nothing fetched or moved. |
| An unexpected exception inside the sync | `unavailable: internal`; the stack is logged at warn level on stderr; the sync never throws into the caller. |
| A push verb whose target is not `dev` (feature-branch push) | `localDev: null`; no fetch, no sync. |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question:** The design file on `origin/dev` (`3e69d12e3`, the last commit to touch it) still holds WS-1 to WS-4, P-1 and P-2 and the recovery-tool Acceptance Scenario; the in-place edit the issue comment of 2026-11-10 describes is not on `origin/dev` or in this worktree. This plan follows the issue's newer Scope decision and comment. → The owner resolves it.
  - **Options:** A) Plan from the issue's narrowed scope and leave the design file as it is — the plan is self-contained and nothing waits; the design keeps stale recovery text that a later reader may take as backlog, and a build-phase agent that reads the design next to the plan meets a contradicting scope (P-2 requiring P-1, an Acceptance Scenario about `@bkit-utility-sync-dev`) · B) Plan from the issue and add a task that narrows the design file — the design matches the plan; a build task then edits a closed phase's canonical doc, which no workflow does today · C) Stop until the edited design is pushed, then re-plan — the plan cites the exact design; the fix waits on another round.
  - **Recommended:** A) — the issue states the scope plainly and is newer than the design, so the plan does not need the design edit to be correct.
  - **Default if unanswered:** A).
- **Open Question:** Ship's Close Workflow is Step 14 today. With Step 13 removed, should it become Step 13? → The owner resolves it.
  - **Options:** A) Renumber Close Workflow to Step 13 and Gate 13 — the step list stays gap-free, as it did when Worktree Cleanup was retired and Close moved from Step 15 to Step 14; about a dozen "Step 14" references in `bkit-ship.md`, `.bkit/core/.bkit/workflows.md`, `step-table.ts` and tests change, and `--number=14` becomes `--number=13` · B) Keep Close Workflow as Step 14 and leave 13 unused — the smallest change; readers and every "Step N" route must live with a gap.
  - **Recommended:** A) — it follows the precedent, and the existing "`state` = MERGED → Step 13" routes then point at Close Workflow unchanged.
  - **Default if unanswered:** A).
- **Open Question:** The design writes one `friction` row when the sync's catch-all maps an exception to `unavailable: internal`. A `friction` row is a write to `.bkit/friction.jsonl` in a checkout, which the newer Success Criterion "working-tree edits … are never changed by the automatic sync" forbids, and the issue drops the `friction` row for install failures. → The owner resolves it.
  - **Options:** A) No `friction` row; log the stack at warn level on stderr and report `unavailable: internal` in the line — no checkout is written; a bug the catch-all hides shows only in logs and in the line · B) Write the `friction` row into the run's own book root when the caller has one, else skip it — keeps the design's signal for `bkit stats`; design / plan / ship closes have removed their worktree by then, so the row is often skipped, and it adds a write path to a routine that otherwise only reads and fast-forwards.
  - **Recommended:** A) — it keeps the routine read-and-fast-forward only, which is what Success Criterion 4 asks for.
  - **Default if unanswered:** A).
- **Assumption:** `syncLocalDev` runs from `pushBranch` whenever the pushed branch is `dev` (the record-based `pushOwnCommits` route and the plain `git push origin dev` route without a record), not only from `pushOwnCommits` as the design wrote. → If wrong, a `branches push` or `branches force-build` of `dev` without a shared-checkout record reports no `localDev` and the reachability test (Task 8) fails on it.
- **Assumption:** The `not-applicable` state (design) stays alongside the six states the issue lists, for runtimes that cannot push `dev` and clones with no local `dev`. → If wrong, a cloud session reports a false `blocked` or `unavailable` where nothing could ever be synced.
- **Assumption:** `blocked` reasons read from `git worktree list --porcelain`, `git diff --name-only` and `git ls-files --others --exclude-standard` are the same in every git locale, so the plan adds no non-English-locale test (the issue's Scope decision lists such tests among the cases nobody has seen). → If a porcelain field were ever localised, `occupied` or `edited-files` would fall through to `git-refused`: still `blocked`, still exit 0, only the reason wrong.
- **Assumption:** The ahead / behind counts come from `git rev-list --left-right --count dev...<fetched tip>` alone. → A local commit already squashed into `origin/dev` counts as "ahead"; the line then sends the owner to `git log --oneline origin/dev..dev`, which the issue accepts in place of copy classification.
- **Assumption:** A ref-lock race on the fetch is retried with the landing backoff at most `TIMEOUTS.LOCAL_DEV_FETCH_ATTEMPTS` = 3 times (2 s, then 4 s). → If 3 is too few under heavy parallel closes, those closes report `unavailable: fetch-failed` and the owner re-runs `bkit branches sync-dev`; nothing is lost.
- **Assumption:** The "publish `dev` (`git push origin dev`)" advice in `unpushedDevCause`, `inheritedDevRefusal` and the base-branch refusal stays unchanged, as the issue comment of 2026-11-10 says. #842 has shipped without rewording it, so the open deferral `849-publish-dev-advice-stays-with-842` is its only record until the owner files an issue for it. → If the owner wants it reworded now, it joins this plan through a decision, and Tasks 3 and 4 gain the three strings.
- **Assumption:** Every caller already knows the SHA it landed, and passes it so the line opens with "Your work landed on origin/dev (…)": `land` passes `landed.sha`, ship's head-push close passes the `pushToDev` result's `sha`, `roadmap mirror` passes its `pushToDev` `sha`, and a handover passes `handed.sha`. A ship close that landed through a merged close PR has no SHA in its `landed` result (`workflows.ts:1536`) and passes none. → That close's line starts at "Local dev:", and the "work landed" half of the Narrative rests on ship's own summary.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #849
```

Or, to address the reasons first: `/bkit-plan #849`
