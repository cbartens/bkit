<!-- bkit:anchor
baseSha: f6914f3c9c88e68faa4b8806406c0d562d2d6c7c
baseRef: origin/dev
designPath: docs/plans/202611/849-keep-local-dev-design.md
designBaseSha: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Keep Local `dev` Level With `origin/dev` After Every Landing Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

**Workstreams covered:** WS-5 (reduced), WS-6, WS-7, WS-8 and WS-9 of `docs/plans/202611/849-keep-local-dev-design.md`, as narrowed by the issue's Scope decision (2026-11-10) and its comment of the same day. WS-1 to WS-4 are dropped.

**Workstream dependencies this plan needs:**

<!-- prettier-ignore -->
| Workstream | Requires (as narrowed) | Plan groups |
| --- | --- | --- |
| WS-6 Automatic sync core (`syncLocalDev`) | none (the ahead / behind count comes from `rev-list --left-right --count`, not from WS-1) | Groups 1 and 2 |
| WS-5 Advice text, reduced | none | Group 2 |
| WS-7 Engine caller wiring + reachability contract test | WS-6 | Group 3 |
| WS-8 Workflow display of the sync line | WS-7 | Group 4 |
| WS-9 Ship Step 13 retirement | WS-7 | Group 4 |

## Context & Goals

Local `dev` and `origin/dev` drift apart after workflow closes, and the owner reconciles them by hand. Source inspection shows four causes, which this plan removes while keeping the isolated landing routine (#639):

- Ship Step 13 runs `branches sync-dev` before Step 14 lands the final `ship DONE` commit, so the close moves `origin/dev` again after local `dev` was synced.
- `fastForwardDev` (`.bkit/core/engine/commands/workflow/branches.ts:3117`) returns `skipped` for ahead, divergent and refused cases alike, and `syncDevVerb` (`:2708`) reports success on it. Nothing tells the owner which case happened.
- The ahead message (`branches.ts:3135`) and the replay log in `pushOwnCommits` (`:1276`) advise `git pull --rebase`, which replays commits `origin/dev` already holds when they were squashed into it.
- Only `branches land` and `branches sync-dev` try to move local `dev` at all. The roadmap mirror, ship's close, the in-place debug push on `dev`, the CI re-trigger, `branches force-build` and the failure-record handover push `dev` and leave local `dev` behind.

Goals:

- One engine routine, `syncLocalDev`, runs after the last landing of every path that pushes `dev`, only ever fast-forwards, and never changes the caller's exit code.
- Every such path emits one `localDev` result with one plain line, and each workflow shows that line in its final message.
- Ship's separate Step 13 goes; the ship close syncs after its own `ship DONE` landing.
- An engine contract test keeps a future `dev`-pushing verb from skipping the sync.

**Related Issues:**

- #842 — Ship fails when the local feature branch differs from GitHub's (closed; shipped as `842-ship-fails-local`, `259c7fc55`)
- #813 — Add a rollback path for shipped workflow changes; decide dev checks (open)
- #885 — Necessity and simplicity across design and review (open)
- #639 — Land parallel workflow closes on dev without colliding (closed)
- #493 — Plan and design close can delete the feature branch after a failed squash merge (closed)
- #288 — Remove Step 1 local dev sync gate from phase workflows (closed)
- #209 — Workflow state model: squash to dev, persistent feat branch (closed)
- #69 — Local dev diverges from origin/dev before worktree setup (closed)
- #661 — Ship re-runs CI after updating the branch from dev, even though code did not change (closed)
- #756 — Workflow optimisation: ship, land and close steps (done) (closed)
- #66 — Workflows abort on rebase conflict (closed)

---

## 👤 ⚠️ Acceptance Scenario

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

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test. bkit's Unit tier may drive real `git` against an `os.tmpdir()` repository (`docs/testing.md` § Tiers, "Unit (boundary: real temp git repo)"), which is the real boundary for every row below; bkit has no E2E, @live or database tier.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| equal: local `dev` matches `origin/dev`, nothing moves | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| behind, main checkout on another branch: only the `dev` ref moves | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| behind, main checkout on `dev`: `merge --ff-only` then frozen install | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| ahead: counts and manual step, no `git pull --rebase`, local commits untouched | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| divergent: both counts, never moved | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| fetch failure → `unavailable: fetch-failed` | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| close PR open → `pending`, no fetch | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| no-dev-push runtime / no local `dev` → `not-applicable` | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| `origin/dev` moved after the landing: target is the fetched tip, line says the work landed | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 1 |
| `dev` checked out in another worktree → `blocked: occupied` | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| edit to a file the update changes → `blocked: edited-files`, edit and index unchanged | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| untracked file at a path the update adds → `blocked: edited-files`, file unchanged | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| edit to an unrelated file → fast-forwarded, edit kept | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| staged change to an unrelated file, main checkout on `dev` → fast-forwarded, index kept | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| frozen install fails → `fast-forwarded`, `installed: false`, line names the re-run, no `friction` row written | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| exception inside the sync → `unavailable: internal`, no throw | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| routine debug-on-dev wording from `replayedOwn` | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| routine failure-handover wording for `edited-files` | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| two concurrent syncs in one clone end level, never backwards | Unit | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | 2 |
| `branches sync-dev` emits `localDev` and keeps exit 16 on install failure | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `branches sync-dev` ahead output has no `git pull --rebase` advice | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `branches land` fast-forwards to the fetched tip and emits `localDev` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `branches land` on a runtime that cannot push `dev` emits `not-applicable` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `branches land` with the main checkout on `dev` and a failing frozen install → exit 0, `localDev.installed === false`, line names the re-run | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `branches land` through the `landPr` fallback (the `dev` push refused, the PR merged) on a runtime that pushes `dev` emits `localDev` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| full design / plan close from the workflow: an edit the update would overwrite → `localDev` `blocked: edited-files`, exit 0, edit kept | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | 3 |
| full design / plan close from the workflow with the main checkout on `dev` and behind → the gate fixture records one `install --frozen-lockfile` | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | 3 |
| own-commit replay log names a manual step, not `git pull --rebase` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| `branches push --mode=dev` replay emits `localDev` with the routine debug wording | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 5 |
| `branches push --mode=dev` plain push emits `localDev` equal | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 5 |
| `branches push --mode=dev` with nothing to push still emits `localDev` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 5 |
| `branches force-build` on `dev` emits `localDev` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 5 |
| a feature-branch push emits `localDev: null` | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 5 |
| ship close fast-forwards after `ship DONE` and ends `finalReturn` with the line | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| ship close with an unmerged close PR → `pending`, nothing fetched | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| ship close whose sync is blocked still exits 0 | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| ship close whose frozen install fails exits 0 and names the re-run | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| build close re-observes local `dev` and adds the line to `finalReturn` before `## Suggested Replies` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| debug close re-observes local `dev` and adds the line to `finalReturn` before `## Suggested Replies` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| `workflows handover --push` on `dev` fast-forwards onto the landed record and emits `localDev` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| `workflows handover --push` on `dev` with a kept staged ledger → routine failure-handover line, exit 0 | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| `workflows handover --flush` (ship) from a feature worktree emits `localDev` with the plain wording, not the failure-handover one | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| abort-mode `workflows handover --push` on a feature branch emits `localDev: null` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| `roadmap mirror` emits `localDev` after landing the row | Unit | `.bkit/core/engine/commands/workflow/roadmap.test.ts` | 7 |
| `runs dispatch` re-trigger on `dev` emits the re-trigger push's `localDev` | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 7 |
| every verb reachable from a push to `dev` declares `localDev` in its output spec | Unit | `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts` | 8 |
| the reachability walk finds the known `dev` pushes (sanity: `branches land`, `roadmap mirror`, `branches push`) | Unit | `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts` | 8 |
| design and plan show the landing's `localDev.line` after `{FINAL_RETURN}` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| debug shows the last `dev`-pushing verb's line after the close's | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| every Failure Path that pushes the record appends the handover's `localDev.line` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| an old ship log that recorded `ship-switch-to-dev` reports no unexpected step | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 10 |
| a new ship run without `ship-switch-to-dev` reports no missing step | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 10 |
| a ship run whose last DONE is `ship-switch-to-dev` resumes at Close Workflow | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 10 |
| ship runs no `branches sync-dev`; the close brings local `dev` level | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 10 |
| typecheck, lint, format, prose lint, `dist/` and mirror drift | Static | `pnpm bkit:gate:static`, `pnpm bkit:check:dist`, `pnpm bkit check` | 11 |

Rows per task: Tasks 3 and 7 each own both a new test and an update of an existing test of the same surface (`close-squash.integration.test.ts` `lands past another session's uncommitted edit …`, `workflows.test.ts` `--push on dev hands the landed record back …`). The new assertions get new test names; the existing tests are `UPDATE` lines, not `TEST FIRST` tests, because they pass on today's code.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

**Breaking changes (verb contracts and workflow steps):**

<!-- prettier-ignore -->
| Change | Before | After | Who reads it today |
| --- | --- | --- | --- |
| `bkit branches sync-dev` output field | `devLocal`: one of `fast-forwarded`, `current`, `skipped`, `none` | `localDev`: a `LocalDevSync` object (`state`, `reason`, `ahead`, `behind`, `from`, `to`, `target`, `installed`, `line`) | Only ship Step 13, which this plan removes; no workflow, prompt or template reads `devLocal` (`grep -rln devLocal` over `.bkit/core/workflows`, `.bkit/core/prompts`, `.bkit/core/docs/templates`, `.bkit/core/.bkit`: no hit). Exit codes unchanged (fetch failure, now read from `localDev` `unavailable: fetch-failed`; 16 on install failure). |
| `bkit branches sync-dev` catalog use (`.bkit/cli.md`) | `workflow` (a workflow step only) | `by-hand` | Agents reading the CLI catalog: after this plan no workflow step runs it, and every `blocked`, `pending` and `unavailable` line tells the owner to run it by hand. |
| `bkit branches land` output field `localDev` | a string (`fast-forwarded`, `current`, `skipped`, `none`) or `null` | the same `LocalDevSync` object, always present (`not-applicable` replaces `null`) | No workflow reads it today; design / plan start reading `localDev.line` (Task 9). |
| New `localDev` output field | absent | a `LocalDevSync` or `null` on `branches push`, `branches force-build`, `workflows close`, `workflows handover`, `roadmap mirror`, `runs dispatch` | Additive. |
| `workflows close` `finalReturn` text | summary parts (summary, `--line`s, issue link), `## Suggested Replies`, then `## bkit Tips` | summary parts, the `Local dev:` line, `## Suggested Replies`, then `## bkit Tips` (ship always; build / debug when the runtime pushes `dev`; a `not-applicable` line is never folded) | Ship / build / debug display it verbatim. |
| Ship Step 13 — Update Local Dev | `branches sync-dev`, step key `ship-switch-to-dev`, exit 16 on install failure → Failure Path | removed; Close Workflow becomes Step 13 / Gate 13 (`--number=13`); install failure after the close's fast-forward → exit 0 and the line | Old status logs that hold `ship-switch-to-dev` still validate, and a run whose last DONE is that key resumes at Close Workflow (`RETIRED_STEPS`). |
| `pushOwnCommits` replay log and the old `fastForwardDev` ahead log | advise `git pull --rebase origin dev && git push origin dev` | no `git pull --rebase`; the `localDev` line gives the counts and `git log --oneline origin/dev..dev` | stderr only. |

**New names:**

- File `.bkit/core/engine/commands/workflow/local-dev.ts`; exports `syncLocalDev`, `install`, types `LocalDevSync`, `LocalDevState`, `LocalDevReason`.
- Constant `TIMEOUTS.LOCAL_DEV_FETCH_ATTEMPTS` (3).
- Output field `localDev` (one name on every verb, replacing `devLocal`).
- Workflow variable `LOCAL_DEV_LINE` (design, plan, debug).
- Test files `.bkit/core/engine/commands/workflow/local-dev.test.ts` and `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts`.
- `branchTree` moves from `branches.ts` to `worktrees.ts` and becomes an export (name unchanged).

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

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

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

The design's Approaches Considered and Decisions carry forward for the kept workstreams; the rows below are the ones this plan relies on, plus the choices the plan itself had to make.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| One `syncLocalDev`, called by the last `dev`-pushing engine verb of each path, after its landing and outside its `try` (design) | CHOSEN | Engine-owned, one result shape; a sync bug can never fail a landing, because the caller's exit code is computed first. |
| Sync inside the shared landing routine `pushToDev` (design: rejected) | REJECTED | Breaks `land.ts`'s "main checkout never touched" invariant, still misses `landPr` and the plain push, and a throw inside its `try` turns a landed ship close into `EXIT_FLUSH_FAILED`. |
| A trailing `branches sync-dev` step in each workflow (design: rejected) | REJECTED | Relies on prose ordering across five workflows and their Failure Paths, the class of slip that caused this issue (ship Step 13 ran before the last landing). |
| Call the sync once at the end of `pushOwnCommits` (design) | REPLACED by a call in `pushBranch` for every push of `dev` | `pushBranch` also reaches a plain `git push origin dev` without a shared-checkout record and the "no run commits to push" skip, which `pushOwnCommits` never sees; one call in `pushBranch` covers `branches push --mode=dev`, `branches force-build`, the `runs dispatch` re-trigger and the abort-mode handover alike. Recorded as decision `849-sync-in-pushbranch-for-dev`. |
| Extend `fastForwardDev` in place in `branches.ts` | REJECTED | `branches.ts` imports `appendFeature` from `roadmap.ts`, and `roadmap mirror` must call the sync, so a `roadmap.ts` → `branches.ts` import would close a cycle. The routine moves into a new `local-dev.ts` that both import. Recorded as decision `849-local-dev-module-avoids-cycle`. |
| `git update-ref refs/heads/dev <new> <old>` compare-and-swap as the move (design: rejected) | REJECTED | It does not refuse when `dev` is checked out in another worktree, so it would move that worktree's branch under its files; the non-forced `fetch . <tip>:refs/heads/dev` and `merge --ff-only` refuse both that and any non-fast-forward. |
| Classify `blocked` from git's stderr text, or run git under `LC_ALL=C` (design: rejected) | REJECTED | The design's spike showed both refusals falling through under a German git and a quiet non-fast-forward printing nothing; git state (`worktree list --porcelain`, path overlap) holds in every locale. |
| Copy classification (`git cherry`, "N of M already on GitHub") in the line (design) | DROPPED by the issue's Scope decision | It needs WS-1. The routine debug-on-dev line uses `replayedOwn` from `pushOwnCommits`, which is exact without classifying commits. |
| Exit 0 plus a `friction` row on install failure after a fast-forward (design recommended C) | REPLACED by exit 0 and the line only | The issue comment answered it: no Failure Path and no `friction` row; standalone `sync-dev` keeps exit 16. Recorded as decision `849-close-exit-0-on-install-failure`. |
| Re-order design / plan so `branches land` runs before `workflows close --final-return` (design: rejected) | REJECTED | Touches lock release and worktree teardown; holding `localDev.line` as `LOCAL_DEV_LINE` and showing it after `{FINAL_RETURN}` has precedent at `bkit-debug.md:874`. |
| A render-snapshot assertion for the workflow display (design) | REPLACED by `workflow-shape.test.ts` assertions | A snapshot regenerated with `-u` passes by construction and cannot fail first; a markdown-invariant assertion on the source can, and `docs/testing.md` § Tiers already places workflow-shape checks there. |

**Recommendations for a future phase:**

- If divergence that needs a tool keeps happening after this ships, open a new issue with the real cases attached (the issue's Scope decision); the recovery design (WS-1 to WS-4) is recorded as deferral `849-local-dev-recovery-tool`.
- Telemetry on how often the sync ends `blocked` or `divergent` (deferral `849-local-dev-sync-outcome-telemetry`) would show whether that issue is needed.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The recovery tool for an already-diverged local `dev`: `bkit branches dev-status`, `bkit branches dev-reconcile`, `@bkit-utility-sync-dev`, copy classification, replay of unpublished commits, `dev-backup/*` branches, the hold ref (design WS-1 to WS-4, P-1) | The issue's Scope decision (2026-11-10) cuts it; no Success Criterion needs it, because the ahead / divergent line names a manual step instead. | A new issue with real cases, if divergence needing a tool keeps happening (deferral `849-local-dev-recovery-tool`). |
| Re-pointing the "publish `dev` (`git push origin dev`)" advice in `unpushedDevCause`, `inheritedDevRefusal` and the base-branch refusal in `worktrees.ts` | The issue comment of 2026-11-10 leaves the three strings unchanged; Success Criterion 5 covers only the `git pull --rebase` advice, which Tasks 3 and 4 remove. | A new issue for the advice, which the owner files; #842 shipped without rewording it. Until then the open deferral `849-publish-dev-advice-stays-with-842` holds it. |
| Refusal tests under a non-English git locale (design WS-6) | The issue's Scope decision lists them among cases nobody has seen; `blocked` reasons come from porcelain git state, so a locale can only degrade a reason to `git-refused`, never the state or exit code. | Deferral `849-local-dev-locale-tests`. |
| Telemetry on how often the sync ends `blocked` or `divergent` | Declared out of scope by the design (WS-6); the line reports each case, and no criterion asks for counts. | Deferral `849-local-dev-sync-outcome-telemetry`. |
| Making debug-on-`dev` prefer the plain push so it stops creating copied commits | Declared out of scope by the design (WS-7); the plan reports the resulting divergence with the routine `replayedOwn` line. | Deferral `849-debug-on-dev-prefer-plain-push`. |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Feature-branch catch-up and the "publish `dev`" advice (gap E) | #842 (closed, shipped as `842-ship-fails-local`), deferral `842-sync-with-origin-dev` (OPEN) | `unpushedDevCause` and `inheritedDevRefusal` in `branches.ts`, next to `syncDevVerb` / `landVerb` (Task 3) | Keep separate. Ask the owner to close `842-sync-with-origin-dev` as stale, since #842 has shipped, and to file a new issue for the advice if it should point at the `localDev` line. |
| The engine journal dirties a tracked `status.jsonl` in the main checkout | `docs/failures.jsonl` `engine-journal-misattributes-calls-to-stale-run` (TRIAGED) | It blocked fast-forwarding `dev`; after this plan it shows up as a routine `blocked: edited-files` line from `syncLocalDev` (Tasks 2 and 3) | Keep separate. When a close reports `blocked: edited-files` on a `status.jsonl` path, check this row before treating it as the owner's own edit. |
| Remote-branch retention without approval | `docs/failures.jsonl` `842-remote-branch-retention-unapproved` (OPEN) | The remote-branch delete in `worktrees.ts`, which Task 8 exempts from the reachability walk | Keep separate. Task 8's exemption check only has to keep tracking where that push lives. |
| One rule for how tests spawn `bkit` | `plan-review-1` (out-of-scope note) | `docs/testing.md` § Spawning `bkit` from tests (`:869-885`) asks for `tsx`, but eight integration tests, `close-squash.integration.test.ts` among them, spawn `dist/cli.js` | Keep separate; pick one rule and make the doc and those tests agree in their own change. This plan works with the `dist/` rule by rebuilding in every engine task. |
| Rollback path for shipped workflow changes; dev checks | #813 (open), deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (OPEN) | `bkit-ship.md` step list (Task 10) | Keep separate; needs a design decision. |
| A refused ship FAILED record is lost in an ephemeral cloud container | deferral `639-refused-ship-failed-record-lost-in-cloud-container` (OPEN) | `landFailedRecord` / `handoverVerb` in `workflows.ts` (Task 7) | Keep deferred; this plan adds a report after a landed record and does not change the refused path. |
| Pre-push timeout on `workflows handover --push on dev hands the landed record back, so local dev fast-forwards onto it` | `docs/failures.jsonl` (OPEN, `testing`) | The existing test Task 7 updates, beside the new handover tests | Fold in only if Task 7's update trips the 30 s timeout: move the test onto `useGateRunner` (already the plan's landing fixture, and where Task 7's new handover tests start) so the hook gate stays out of its path. |
| Necessity and simplicity across design and review | #885 (open) | The design's narrowed scope, which this plan follows | No action; this plan is one of its worked examples. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable: no role model.
- [ ] **User Input** — not applicable: no new flag or input; the sync's git arguments are the fetched `origin/dev` SHA and fixed ref names, passed as argv, never through a shell.
- [ ] **PII** — not applicable: the line and logs carry short SHAs, counts and the local checkout path that holds `dev`; no commit subject (untrusted text, `docs/security.md` § Untrusted Content) is printed.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input. The sync only fast-forwards `refs/heads/dev` with non-forced git commands that refuse to overwrite edits or a checked-out branch, and never pushes, resets or stashes (`.agents/rules.md` § Destructive git).

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** No package is added. `node:child_process`, `node:fs` and `node:path` are built-ins, and the reachability test uses `prettier` and `prettier/plugins/typescript`, which `package.json` already declares (precedent: `.bkit/core/engine/audits/repo/json-parse-owner.test.ts`). `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-10) lists `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.90.0, `vitest` 5.0.5 → 5.1.0, `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.5, all dev-only; none blocks this build. Toolchain: git 2.56.0, Node v24.16.0, pnpm 10.34.7. Every git command the plan uses (`merge --ff-only`, `fetch . <sha>:refs/heads/dev`, `worktree list --porcelain`, `rev-list --left-right --count`, `diff --name-only`, `ls-files --others --exclude-standard`) exists in git 2.31, the floor the engine assumes (`.bkit/core/engine/commands/land.ts:102`).
- [ ] **Existing-Solution Search (reuse over duplicate):** The in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** Read access to every file the runbook names was confirmed this session. Missing user information: the three Open Questions above; each has a default, so the build can proceed on the defaults.
- [ ] **Project Context:** Read: decisions `ship-sync-dev-fast-forward-only-never-push-local-dev`, `ship-close-removes-worktree-after-landing` and `467-ship-step-names-frozen`; deferrals `849-local-dev-sync-outcome-telemetry` and `849-debug-on-dev-prefer-plain-push`; failure row `.bkit/core/engine/commands/workflow/workflows.test.ts bkit workflows handover > --push on dev hands the landed record back, so local dev fast-forwards onto it` (a pre-push timeout on a test Task 7 extends). `docs/knowledge.jsonl` holds no row on local `dev` sync.
- [ ] **Testing & Quality:** Tiers follow `docs/testing.md` § Tiers: engine logic against real temporary git repositories is Unit (boundary: real temp git repo); the full workflow close is Integration, and runs `bkit branches land` from the repo's built `dist/cli.js` (`close-squash.integration.test.ts:23`), so every task that edits `.bkit/core/engine/**/*.ts` rebuilds `dist/` with `pnpm build` before its tests count as passing; markdown and source-shape assertions are Unit. Landing tests use `useGateRunner` from `vitest.gate-fixture.ts` (`docs/testing.md` § Stack, Package-runner fixtures), which also keeps the extended handover test inside its timeout.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** Not applicable: no new secret or env var. `BKIT_LOCK_WAIT_S` and `LOCAL_STACK_LOCK_WAIT_S` are read as today.
- [ ] **Schema State:** Not applicable: bkit has no database; `docs/data-schema.md` holds only its managed header and no table.
- [ ] **Architecture & UI:** `local-dev.ts` sits in `.bkit/core/engine/commands/workflow/`, beside the other workflow-command helpers (`step-table.ts`, `test-blocks.ts`), where `docs/architecture.md` § Package Boundaries places `bkit <noun> <verb>` workflow command code. The reachability test sits in `.bkit/core/engine/audits/repo/`, which `docs/architecture.md` places as tests only. No UI.
- [ ] **Observability:** The sync logs through the calling verb's `ctx.log`, so lines carry the caller's `[bkit-<noun>]` prefix on stderr (`docs/observability.md` § Log Format: reuse the owning module's prefix). A new `### Local dev sync lines` subsection lists the grep patterns.
- [ ] **Notifications:** Not applicable: no alert or toast; the line is part of the workflow's final message.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

None — bkit has no database. The change touches engine result types (`LocalDevSync`), git refs (`refs/heads/dev` only, moved by fast-forward) and verb output JSON; none is a `docs/data-schema.md` table.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Fast-forward-only move of local `dev` with an honest result (`syncLocalDev`, `LocalDevSync`), including its ahead / behind count | `.bkit/core/engine/commands/workflow/local-dev.ts` | `grep -rln -e syncLocalDev -e LocalDevSync .bkit/core/engine` (no hit); `grep -n -e fastForwardDev -e devLocal` in `.bkit/core/engine` (callers `syncDevVerb` `branches.ts:2715`, `landVerb` `:3224`); `docs/capabilities.md` (no local-`dev` row); imports of `branches.ts` and `roadmap.ts` read; for the count, `grep -rln -e '--left-right' .bkit/core/engine --include='*.ts'` (no hit) and `grep -n 'rev-list'` in `branches.ts` (`unpushedDevCause` counts one side only) | `fastForwardDev` (`branches.ts:3117`) — covers the two move commands; missing the counts, `blocked` reasons, `pending` / `not-applicable` / `unavailable`, the line and the never-throw wrapper. `unpushedDevCause` (`branches.ts:3168`) — a one-sided `rev-list --count`; WS-1's classifier is dropped | NEW | Reason (b): extending it in `branches.ts` breaks the module contract for its new caller — `branches.ts:71` imports `appendFeature` from `roadmap.ts`, and `mirror` in `roadmap.ts` must call the sync, so a `roadmap.ts` → `branches.ts` import closes a cycle. Its move commands are carried over, and `fastForwardDev` is deleted (`Supersession Inventory`). The count is one `git rev-list --left-right --count dev...<tip>` inside `syncLocalDev`, per the issue; `unpushedDevCause` is not extended and stays unchanged. |
| Frozen install after a move under the main checkout | `.bkit/core/engine/commands/workflow/branches.ts` | `grep -n -e 'function install' -e 'install(ctx'` in `.bkit/core/engine/commands/workflow/branches.ts`; `installCommand` / `COULD_NOT_RUN_EXIT_CODES` in `.bkit/core/engine/shared/package-manager.ts` | `install` (`branches.ts:2723`) — exactly the behaviour needed; its only caller is `syncDevVerb` | EXTEND | The `[MODIFY]` of `branches.ts` moves it into `local-dev.ts` (Task 1; `Supersession Inventory` `DELETE (moved)`), with its signature changed from `ctx` to a `log` callback so the sync can call it; `syncDevVerb` reads `installed` from `LocalDevSync`. |
| `occupied` detection from git state | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -rn 'worktree", "list", "--porcelain"' .bkit/core/engine` (hits: `branchTree` `branches.ts:2939`, `cleanupRead` `worktrees.ts:812`); `grep -n 'branchTree('` in `commands/workflow/*.ts` (callers `branches.ts:2957`, `:3001`); imports of `worktrees.ts` read (no `branches.ts` or `roadmap.ts`) | `branchTree(root, branch)` — returns the checkout holding a branch | EXTEND | Move `branchTree` unchanged into `worktrees.ts` and export it; `branches.ts` and `local-dev.ts` both import it there. Leaving it in `branches.ts` would make `local-dev.ts` import `branches.ts`, which imports `local-dev.ts`. |
| Fetch with ref-lock retry | `.bkit/core/engine/shared/timeouts.ts` | `grep -n '^export' .bkit/core/engine/commands/land.ts`; `grep -n 'LAND_ATTEMPTS' .bkit/core/engine/shared/timeouts.ts` | `fetchDev`, `devRefRace`, `landBackoffMs`, `sleep` in `land.ts` — the landing's fetch and backoff; `TIMEOUTS` in `timeouts.ts` — the landing's bounds | EXTEND | Add `TIMEOUTS.LOCAL_DEV_FETCH_ATTEMPTS` beside `LAND_ATTEMPTS` (Task 1). `land.ts` is used unchanged: `syncLocalDev` imports its fetch and backoff. |
| `localDev` on every `dev`-pushing verb's output | `.bkit/core/engine/commands/workflow/branches.ts` | `grep -n 'from "./branches.js"'` in `commands/workflow/*.ts` (callers `runs.ts:60`, `workflows.ts:74`, `tasks.ts:20`); `PushOutcome` (`branches.ts:867`) and `DispatchResult` (`runs.ts:711`) read | `PushOutcome.out` (the shared push result every `pushBranch` caller spreads or forwards) | EXTEND | Add a nullable `localDev: LocalDevSync` to `PushOutcome.out` (Task 5). |
| `localDev` on the `runs dispatch` re-trigger | `.bkit/core/engine/commands/workflow/runs.ts` | `DispatchResult` (`runs.ts:711`) and `ciDispatchGate`'s re-trigger `pushBranch` (`:882`) read; `pushCurrentBranch` (`:729`) read (returns first on shared branches) | `DispatchResult` — the dispatch verb's result | EXTEND | `DispatchResult` gains a nullable `localDev`, set from the re-trigger push's `out.localDev` (Task 7). |
| `localDev` on `roadmap mirror` | `.bkit/core/engine/commands/workflow/roadmap.ts` | `grep -n -e 'pushToDev' -e 'mirrored'` in `roadmap.ts` (`done(mirrored, skipped)` at `:483`, emit at `:486`) | `mirror`'s `done` emitter | EXTEND | `mirror` calls `syncLocalDev` when `mirrored` and emits `localDev` through `done` (Task 7); it imports `local-dev.ts`, never `branches.ts`. |
| Ship close appends the line to its final message | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -n -e 'finalReturnText(' -e 'shipClose('` in `workflows.ts` (`:2510`, `:2517`, `:2523`) | `shipClose` and `finalReturnText` — the close's own result and final message | EXTEND | `shipClose` returns `localDev`; the `close` verb's `run` passes `localDev.line` into `finalReturnText`, which appends it after the summary parts. |
| Retired step key mapping | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -n 'RETIRED_STEPS'` in `step-table.ts` (build challenge precedent at `:206`) | `RETIRED_STEPS` — maps a retired key to the step a resume continues at | EXTEND | Add `ship: { "ship-switch-to-dev": "ship-close-workflow" }`. |
| Old ship logs that hold the retired key still validate | `.bkit/core/engine/checks/status-holes.ts` | `grep -n -e SHIP_STEP_ORDER -e ship-worktree-cleanup` in `status-holes.ts` and its test | `SHIP_STEP_ORDER` (`:45`) and the universe `detectHoles` (`:1015`) builds from it | EXTEND | Drop the key from the mandatory order and accept it as a known retired key, as `ship-worktree-cleanup` was handled. |
| Workflow display of `localDev.line` (`LOCAL_DEV_LINE`, Failure Path lines) | `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-ship.md` | `grep -n -e 'FINAL_RETURN' -e 'handover --push' -e 'handover --flush'` in the five workflows; `grep -rn -e LOCAL_DEV_LINE -e localDev .bkit/core/workflows` (no hit); `bkit-debug.md:874` read (an engine line shown after `{FINAL_RETURN}`) | The existing `{FINAL_RETURN}` display steps and the Failure Path STOP messages; `bkit-debug.md:874` as the precedent for a line after `{FINAL_RETURN}` | EXTEND | Each workflow's close step and Failure Path show the verb's `localDev.line` (Task 9); ship's Step 13 goes (Task 10). |
| Workflow display assertions | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `grep -n -e sync-dev -e FINAL_RETURN` in `workflow-shape.test.ts` (`:1058` asserts ship's sync step) | `workflow-shape.test.ts` — markdown-invariant tests per workflow | EXTEND | New `it` cases for design, plan, debug and the Failure Paths. |
| Guard that a new `dev`-pushing verb cannot skip the sync | `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts` | `grep -rln -e callers -e reachab .bkit/core/engine/audits --include='*.ts'` (hits only string lists and CLI flags, no call-graph walk); `ls .bkit/core/engine/audits/repo/`; `grep -rln 'prettier/plugins/typescript' .bkit/core/engine` (only `json-parse-owner.test.ts`); `docs/capabilities.md` (module graph only, no call edges); TypeScript 7 ships no JS compiler API (`json-parse-owner.test.ts:8`) | None — no test walks callers; `json-parse-owner.test.ts` shows the parser to reuse | NEW | Reason (a): the searches find no call-graph guard. The parser setup follows `json-parse-owner.test.ts`. |
| Unit tests for the sync | `.bkit/core/engine/commands/workflow/local-dev.test.ts` | `ls .bkit/core/engine/commands/workflow/local-dev*` (none); `docs/testing.md` § Tiers (tests sit beside their module) | `branches.test.ts` sync-dev block (`:3502-3566`) — verb-level only | NEW | Reason (a) for the module's own test file: `local-dev.ts` is new, and `docs/architecture.md` places a module's unit test beside it. The verb-level `sync-dev` tests stay in `branches.test.ts`. |

## Architecture & Component Changes

One engine routine, `syncLocalDev`, in a new module both `branches.ts` and `roadmap.ts` can import. Every verb that pushes `dev` calls it once after its landing, outside the code that computes its exit code, and emits the result as `localDev`. Workflows only display `localDev.line`. Ship's separate sync step goes.

```text
landing verb ──(landed sha, exit code fixed)──▶ syncLocalDev(root, opts, log)
                                                   │ pending? / not-applicable? → no fetch
                                                   │ fetchDev + ref-lock retry (LOCAL_DEV_FETCH_ATTEMPTS)
                                                   │ rev-list --left-right --count dev...<fetched tip>
                                                   │ behind > 0 && ahead == 0 → merge --ff-only | fetch . <tip>:refs/heads/dev
                                                   │ refused → re-read once → occupied | edited-files | git-refused
                                                   │ moved under the main checkout → frozen install
                                                   ▼
                                           LocalDevSync { state, reason, ahead, behind, from, to, target, installed, line }
                                                   ▼
                                     verb JSON `localDev` ──▶ workflow final message
```

**Ledger rows:** `849-sync-local-dev-after-every-dev-push`, `849-sync-in-pushbranch-for-dev`, `849-local-dev-module-avoids-cycle`, `849-blocked-reasons-from-git-state`, `849-close-exit-0-on-install-failure`, `849-retire-ship-switch-to-dev`, `ship-sync-dev-fast-forward-only-never-push-local-dev`, `467-ship-step-names-frozen`, `849-local-dev-recovery-tool`, `849-publish-dev-advice-stays-with-842`, `849-local-dev-locale-tests`, `849-local-dev-sync-outcome-telemetry`, `849-debug-on-dev-prefer-plain-push`

### Database Migrations

None — bkit has no database.

### Engine: sync core

#### [NEW] `.bkit/core/engine/commands/workflow/local-dev.ts`

- **Reuse Check:** `Reuse Inventory` row "Fast-forward-only move of local `dev` with an honest result", reason (b): extending `fastForwardDev` in `branches.ts` would force `roadmap.ts` to import `branches.ts`, which imports `roadmap.ts` (`branches.ts:71`). Imports only `../lib.js`, `../land.js`, `../../shared/*` and `./worktrees.js`, none of which import it back.
- **Types:** `LocalDevState` = `equal | fast-forwarded | ahead | divergent | blocked | unavailable | pending | not-applicable`; `LocalDevReason` = `occupied | edited-files | git-refused | fetch-failed | internal | close-pr-open | no-local-dev | no-dev-push-runtime`; `LocalDevSync` = `{ state, reason, ahead, behind, from, to, target, installed, line }` (the design's Data Model without `copies` / `copiesExact`, which the issue drops).
- **`syncLocalDev(root, o, log): Promise<LocalDevSync>`**, `o` = `{ runtimeDevPushes: boolean; pendingPr?: number; landed?: string; replayedOwn?: number; routine?: "failure-handover"; fetched?: boolean }`:
  1. `pendingPr` set → `pending: close-pr-open`, no fetch. `runtimeDevPushes` false → `not-applicable: no-dev-push-runtime`. No `refs/heads/dev` → `not-applicable: no-local-dev`.
  2. `fetched: true` (the caller fetched `origin/dev` successfully after its landing) → no second fetch. Otherwise `fetchDev(root)`; on a `devRefRace` stderr, retry with `landBackoffMs` up to `TIMEOUTS.LOCAL_DEV_FETCH_ATTEMPTS`; still failing → `unavailable: fetch-failed`. This keeps the design's "one fetch after the landing" on every path.
  3. Target = the fetched `origin/dev` tip (never the landed SHA). Counts from `git rev-list --left-right --count dev...<target>`.
  4. `ahead == 0 && behind == 0` → `equal`. `ahead > 0` → `ahead` or `divergent`, never moved.
  5. `behind > 0 && ahead == 0` → `git merge --ff-only -q <target>` when the main checkout is on `dev`, else non-forced `git fetch -q . <target>:refs/heads/dev`. Refused → re-read local `dev` once (a parallel close may have moved it to or past the target → `equal`), else `blocked` with the reason from git state in this order: `occupied` (`branchTree(root, "dev")` names a checkout other than the main one), `edited-files` (`git diff --name-only HEAD` or `git ls-files --others --exclude-standard` intersects `git diff --name-only <from> <target>`), else `git-refused`. Never parses stderr.
  6. Moved under the main checkout → `install(root, log)`; `false` → `installed: false`, state stays `fast-forwarded`.
  7. A catch-all around steps 2-6 → `unavailable: internal`, the stack logged at warn level through `log`. The function never throws, writes no ledger row and never changes a caller's exit code.
- **`line`:** one plain sentence, prefixed with `Your work landed on origin/dev (<landed short sha>).` when `landed` is set. Wordings:
  - equal: `Local dev: level with origin/dev (abc1234).`
  - fast-forwarded: `Local dev: synced to origin/dev (abc1234).`; install failed: `Local dev: synced to origin/dev (abc1234), but the dependency install failed — run the frozen install by hand: <installCommand({ frozen: true })>.`
  - ahead: `Local dev: not moved — 2 ahead of origin/dev. See them with git log --oneline origin/dev..dev, then bring local dev level by hand.`
  - divergent: `Local dev: not moved — 19 ahead / 1 behind origin/dev (divergent). See the local-only commits with git log --oneline origin/dev..dev, then bring local dev level by hand.`
  - divergent with `replayedOwn` equal to `ahead` (routine, debug on `dev`): `Local dev: 3 ahead / 1 behind origin/dev — the 3 are this run's own commits, already on GitHub as copies (expected after a debug run on dev). See them with git log --oneline origin/dev..dev, then bring local dev level by hand.`
  - blocked occupied: `Local dev: not moved — 2 behind; dev is checked out in <path>. Run bkit branches sync-dev there or after it is free.`
  - blocked edited-files: `Local dev: not moved — 2 behind; an uncommitted edit touches a file the update changes. Commit or move it, then run bkit branches sync-dev.`; with `routine: "failure-handover"`: `Local dev: not moved — the failure record's edits touch files the update changes (expected after a failure handover on dev). Run bkit branches sync-dev once they are committed or moved.`
  - blocked git-refused: `Local dev: not moved — 2 behind; git refused the fast-forward. Run bkit branches sync-dev to see why.`
  - pending: `Local dev: not checked — landing pending on close PR #123; run bkit branches sync-dev after it merges.`
  - unavailable: `Local dev: not checked — fetching origin/dev failed; run bkit branches sync-dev.` / `Local dev: not checked — the sync hit an internal error (logged); run bkit branches sync-dev.`
  - not-applicable: `Local dev: not applicable — this runtime does not push dev.` / `Local dev: not applicable — this clone has no local dev branch.`
  - No line names `git pull --rebase`, `git reset` or a push command.
- **`install(root, log): boolean | null`:** moved from `branches.ts:2723`, its `ctx` parameter replaced by a `log` callback; behaviour unchanged.

#### [MODIFY] `.bkit/core/engine/shared/timeouts.ts`

- **Existence Check:** exists; holds `LAND_ATTEMPTS`, `LAND_BACKOFF_START_S`, `LAND_BACKOFF_CAP_S`.
- Add `LOCAL_DEV_FETCH_ATTEMPTS: 3` with a one-line doc comment.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** exists; imports neither `branches.ts` nor `roadmap.ts`.
- Receive `branchTree(root, branch)` moved unchanged from `branches.ts:2938`, exported.

### Engine: callers

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** exists.
- **[DELETE] `fastForwardDev`** (`:3117`) and its `git pull --rebase` advice; replaced by `syncLocalDev`.
- Remove `install` (moved to `local-dev.ts`) and `branchTree` (moved to `worktrees.ts`); import both.
- `syncDevVerb` (`:2708`): becomes async and runs no fetch of its own; `localDev` `unavailable: fetch-failed` maps to `EXIT_FETCH_FAILED`, so the exit is unchanged; emits `{ localDev, branch, installed }` where `localDev` is the `LocalDevSync`; `installed === false` keeps exit 16. Spec `output`: `devLocal` → `localDev`; spec `use`: `workflow` → `by-hand`, because no workflow step runs it after Task 10 and every retry line names it.
- `landVerb` (`:3189`): delete the `fastForwardDev(root, landed.sha, …)` call at `:3224` inside the `try`. Call `syncLocalDev(root, { runtimeDevPushes: devPushes, landed: landed.sha, fetched: <the audit's fetchDev(root).ok> }, ctx.log)` after the audit, the cross-check and the worktree removal, outside the `try`, once the exit code is fixed. The audit's `fetchDev(root)` stays and is the one fetch. An audit `Stop(EXIT_LANDED_UNVERIFIED)` exits before the sync, so no install runs under a landing the audit rejected; that workflow's Failure Path then runs `workflows handover --push`, which reports `localDev`. Spec `output.localDev` describes the object.
- `PushOutcome.out` (`:867`): add `localDev: LocalDevSync | null`; `notPushed` defaults it to `null`.
- `pushBranch` (`:912`): when the current branch is `dev` and the route reached `pushOwnCommits` or the shared plain push (pushed, skipped as `no-run-commits`, or failed), set `out.localDev` from `syncLocalDev(topLevel, { runtimeDevPushes: true, landed: out.sha ?? undefined, replayedOwn }, log)`; every refusal before that (detached, not `dev`, no record, skip-ci) and every non-`dev` branch keeps `null`. `replayedOwn` = the number of the run's commits the record lists as pushed as copies, when `out.replayed`.
- `pushOwnCommits` (`:1276`): the replay log drops `resync with: git pull --rebase origin dev`; it says local `dev` still holds the originals and that the `localDev` line reports what to do.
- `branches push` (`:1366`) spreads `r.out`, so it emits `localDev`; `forceBuildVerb` (`:1756`) emits `pushed.out.localDev`. Both spec `output` blocks gain `localDev`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** exists.
- `shipClose` (`:1488`): after `releaseLock` succeeded (so a failing fetch never holds the workflow lock through the retry backoff), `syncLocalDev(root, { runtimeDevPushes: true, landed }, ctx.log)`. `landed` is the `pushToDev` result's `sha` on a head-push landing (`res.kind === "landed"`); a merged close PR passes no `landed` and `fetched: true` when its existing `fetchDev(root)` succeeded. An open close PR → `syncLocalDev(root, { runtimeDevPushes: true, pendingPr }, …)`. Result returned beside the existing output; the exit code is computed before it.
- The `close` verb's `run` (`~:2507`): passes `localDev.line` into `finalReturnText` (`:1904`) and `finalReturnParts` (`:1856`), which place it after the summary parts (summary, `--line`s, issue link) and before `## Suggested Replies` (`:1881`); emits `localDev`. A `not-applicable` result is emitted but its line is never folded. Non-flush closes for `build` and `debug` re-observe with `syncLocalDev(root, { runtimeDevPushes: <runtime detect> }, ctx.log)` (no landing of their own), fold its line the same way and emit `localDev`; design / plan / ship non-flush closes emit `localDev: null`.
- `handoverVerb` (`:850`): after `landFailedRecord` landed and `handBack` ran, `syncLocalDev(root, { runtimeDevPushes: true, landed: handed.sha, routine: shared ? "failure-handover" : undefined }, ctx.log)`. The routine wording applies only when the handover ran from the shared `dev` checkout, because only there are the record's edits in the main checkout; ship's `--flush` from a feature worktree uses the plain wordings. The abort-mode `pushBranch` route (a feature branch) forwards `r.out.localDev`, which is `null`; emits `localDev` (null when nothing reached `dev`). Exit code unchanged.
- `handover` and `close` spec `output` blocks gain `localDev`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/roadmap.ts`

- **Existence Check:** exists; imports `pushToDev` from `../land.js`, nothing from `branches.ts`.
- `mirror` (`:476`): when `mirrored` is true, `syncLocalDev(root, { runtimeDevPushes: true, landed: <landed sha> }, ctx.log)`; otherwise `null` (including "on dev", where the run's own `branches push` reports). Emits `localDev`; spec `output` gains it.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- **Existence Check:** exists.
- `DispatchResult` (`:711`): add `localDev: LocalDevSync | null`, set from the re-trigger `pushBranch` (`:882`) and `null` otherwise; `pushCurrentBranch` (`:729`) runs only when the branch is not shared, so it gets no call. The `dispatch` verb's spec `output` gains `localDev`.

### Engine: ship step retirement

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** exists.
- Remove `{ step: "ship-switch-to-dev", number: 13 }` (`:196`); `ship-close-workflow` becomes number 13; add `ship: { "ship-switch-to-dev": "ship-close-workflow" }` to `RETIRED_STEPS` (precedent: build challenge keys, `:206`).

#### [MODIFY] `.bkit/core/engine/checks/status-holes.ts`

- **Existence Check:** exists.
- Drop `ship-switch-to-dev` from `SHIP_STEP_ORDER` (`:45-60`) and accept it as a known retired key, so a new run reports no missing step and an old log that holds it reports nothing unexpected.

### Tests

#### [NEW] `.bkit/core/engine/commands/workflow/local-dev.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Unit tests for the sync", reason (a).
- Unit (boundary: real temp git repo) with a bare `origin`, a main checkout and linked worktrees; `useGateRunner` for any landing.

#### [NEW] `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Guard that a new `dev`-pushing verb cannot skip the sync", reason (a).
- Parses every non-test `.ts` under `.bkit/core/engine/commands/` with prettier's TypeScript parser (as `json-parse-owner.test.ts` does); starts at `pushToDev`, `runPush` and every `runGit(…, ["push", …])` call; walks callers up to each verb spec (`run: <fn>` or an inline `run`); asserts each reached verb's `output` declares `localDev`. Named exemptions, each asserted against its guard in source: `pushCurrentBranch` (shared branches return first), `pushPlain` (refuses shared branches), `closePr` (pushes `ship-close/*`), the remote-branch delete in `worktrees.ts`.

#### [MODIFY] existing test files

- `.bkit/core/engine/commands/workflow/branches.test.ts`: `sync-dev` block (`:3502-3566`) moves from `devLocal` strings to `localDev` objects; the exact-shape `toEqual` push assertions at `:1384` (feature push) and `:1547` (abort push, exit 7) gain `localDev: null`; new `land`, `push`, `force-build` and replay-log cases.
- `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: the case asserting stderr "local dev not fast-forwarded" (`:147`) asserts `localDev` `blocked: edited-files`; new cases for the reported line and the install.
- `.bkit/core/engine/commands/workflow/workflows.test.ts`: new `localDev` cases; the `close --final-return` assertions at `:2890` (exact `toBe`), `:2912` and `:2932` (`startsWith`) expect the fixture's `Local dev:` line before `## Suggested Replies`; the existing handover test at `:1699` keeps passing, and the new handover tests beside it assert the emitted `localDev`.
- `.bkit/core/engine/commands/workflow/roadmap.test.ts`, `runs.test.ts`: new `localDev` cases.
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: display cases; the ship Step 13 case (`:1058`) is replaced; the `Step 14 — Close Workflow` section patterns at `:1042`, `:1049` and `:1083` become `Step 13`.
- `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: `CANONICAL_SHIP_STEP_KEYS` (13 keys), the `dev` writes test (`:691-698`) and the `Step 14.3` / `Step 14 — Close Workflow` case at `:927-928`.
- `.bkit/core/engine/commands/workflow/progress.integration.test.ts` (`:471`): the ship `--flush` progress line becomes `Step 13/13 Close Workflow`.
- `.bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts` (`:173`), `.bkit/core/engine/checks/status-holes.test.ts`, `.bkit/core/engine/commands/workflow/step-table.test.ts`: ship step changes.
- Test fixtures that push `dev` through `pushBranch` (`branches.test.ts` push cases, `runs.test.ts` dispatch, `workflows.test.ts` handover) run under `useGateRunner` or without a `package.json`, so the new sync never spawns a real `pnpm install`.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`

- The close step that runs `branches land` (design `:583`, plan `:487`) holds `localDev.line` as `LOCAL_DEV_LINE`; the final-return step (design `:604`, plan `:508`) displays `{FINAL_RETURN}` then `{LOCAL_DEV_LINE}` on its own line when set.
- Failure Path STOP (after `workflows handover --push`, `:97`): the final message ends with the handover's `localDev.line` when it is not null.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- The in-place `branches push --mode=dev` (`:750`) holds `localDev.line` as `LOCAL_DEV_LINE`; a later `runs dispatch` (`:791` / `:803`) that re-triggered replaces it with its own non-null `localDev.line`; the final return (`:874`) displays it after `{FINAL_RETURN}`, which already ends with the close's re-observed line. Failure Paths (`:111`, `:162`) as above.

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- Failure Path STOPs after `workflows handover --push` (`:117`, `:291`) end with its `localDev.line` when not null. The close's line arrives inside `{FINAL_RETURN}`, so the final-return step is unchanged.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **[DELETE] Step 13 — Update Local Dev** (`:920-935`) and its checklist item. Close Workflow becomes Step 13 (`Gate 13`, `--number=13`); the "`state` = MERGED → Step 13" routes (`:318`, `:765`) now reach Close Workflow unchanged; the header lines (`:44`, `:46`) and references to Step 14 (`:937`, `:949`, `:964`) are renumbered. The close's line arrives inside `{FINAL_RETURN}`.
- Failure Path (`:110`, `--flush`) and the Stop route (`:828`, `--push`) end the final message with the handover's `localDev.line` when not null.

### Docs and generated files

- `.bkit/core/.bkit/workflows.md` (`:132`, `:141`, `:217`, `:306`, `:817`, `:1135`, `:1207`, `:1253`, `:1328`, `:1353`), `.bkit/core/.bkit/pipeline.md` (`:269`), `docs/observability.md`, `docs/testing.md`, `.bkit/core/.bkit/cli.md` (through `pnpm cli:sync`): see `Documentation Updates`.
- `dist/` rebuilt with `pnpm build` in every task that edits `.bkit/core/engine/**/*.ts`; host mirrors refreshed with `pnpm tsx .bkit/core/engine/cli.ts upgrade` once in Task 11; the render snapshots of the edited workflows (`bkit-ship.none.txt` and its siblings) regenerated with `-u` in the task that edits each workflow (Tasks 9 and 10).
- `.bkit/instructions.md`: the `- source:` blocks of `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md`, `bkit-build.md` and `bkit-ship.md` (ship block at `:10341`, its sync entries at `:10455-10456`) hand-edited to the new standing lines in Tasks 9 and 10, because `pnpm instructions:sync` never drops an entry whose line is gone.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `fastForwardDev` in `.bkit/core/engine/commands/workflow/branches.ts` (`:3117`) | `syncLocalDev` in `.bkit/core/engine/commands/workflow/local-dev.ts` | DELETE | Its two move commands are carried over; its `skipped` result and `git pull --rebase` advice are what the issue removes. Its callers (`syncDevVerb`, `landVerb`) move to `syncLocalDev` in Task 3. |
| `install` in `branches.ts` (`:2723`) | `install` in `local-dev.ts` | DELETE (moved) | Same behaviour, one copy; the sync needs it and cannot import `branches.ts`. |
| `branchTree` in `branches.ts` (`:2938`) | exported `branchTree` in `.bkit/core/engine/commands/workflow/worktrees.ts` | DELETE (moved) | Same behaviour, one copy; `local-dev.ts` needs it without importing `branches.ts`. |
| Ship Step 13 — Update Local Dev in `.bkit/core/workflows/bkit-ship.md` (`:920-935`), its checklist item, its `step-table.ts` entry and its `SHIP_STEP_ORDER` key | the sync inside `workflows close --flush` (`shipClose`) | DELETE | It ran before the last landing, which is the bug. The key stays readable only as a `RETIRED_STEPS` entry, so old logs validate; no `@deprecated` copy is kept. |
| `sync-dev` output field `devLocal` | `localDev` | DELETE | Renamed to one field name on every verb; no reader outside the removed ship step (`Breaking Changes`). |
| `land` output `localDev` string values | `LocalDevSync` object | DELETE | Replaced in place; no reader. |
| Decision `ship-sync-dev-fast-forward-only-never-push-local-dev` | decisions `849-retire-ship-switch-to-dev`, `849-sync-local-dev-after-every-dev-push` | DELETE (superseded row appended) | Its step is removed; its never-push rule carries over. |
| Test assertions on the old behaviour: `branches.test.ts` `sync-dev` block (`:3502-3566`), `close-squash.integration.test.ts` stderr "local dev not fast-forwarded", `workflow-shape.test.ts:1058`, `ship-invariants.test.ts` (`:337-352`, `:691-698`), `skip-ci-subject-audit.test.ts:173`, `status-holes.test.ts` fixtures | the new assertions in Tasks 3, 9 and 10 | DELETE (rewritten) | They pin the behaviour this plan replaces. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None — no incident or gotcha; the decisions carry the why. |
| `docs/decisions.jsonl` | Rows written by this plan (`**Ledger rows:**`); no task writes more. |
| `docs/architecture.md` | None — `local-dev.ts` sits in `commands/workflow/` beside the other workflow-command helpers and the reachability test in `audits/repo/`, both kinds it already places. |
| `docs/technology.md` | None — no new library; `prettier`'s TypeScript parser is already used by a test. |
| `docs/data-schema.md` | None — no database. |
| `docs/design.md` | None — no UI. |
| `docs/testing.md` | Add rows for `commands/workflow/local-dev.test.ts` (Unit, boundary: real temp git repo) and `audits/repo/local-dev-reachability.test.ts` (Unit, source parse); update the `branches.test.ts` row (`:768`: `sync-dev` emits `localDev`, `land` / `push` / `force-build` report `localDev`), the `ship-invariants.test.ts` row (`:699`: no `branches sync-dev`; the close brings local `dev` level), the `workflow-shape.test.ts` row (`:784`: ship no longer runs `branches sync-dev`; design / plan / debug / Failure Paths show `localDev.line`) and the `runs.test.ts` text at `:687` where it names ship's sync. |
| `docs/observability.md` | New `### Local dev sync lines` subsection under § Log Format: the sync logs through the calling verb's prefix (`[bkit-branches]`, `[bkit-workflows]`, `[bkit-roadmap]`, `[bkit-runs]`); grep patterns `Local dev:` for the result line and `local dev sync` for the warn-level refusal and stack lines. |
| `.bkit/core/.bkit/workflows.md` | `:141` (ship no longer runs `branches sync-dev`; the close syncs after `ship DONE`), `:217` (every `dev`-pushing verb reports `localDev`; the final message shows the line), `:132` / `:817` (Failure Path handovers report `localDev.line`), `:1135` / `:1136` (step table: Step 13 removed, Close Workflow = 13), and the Step 14 references at `:306`, `:1207`, `:1253`, `:1328`, `:1353` → Step 13. |
| `.bkit/core/.bkit/pipeline.md` | `:269`: drop "update local dev (`bkit branches sync-dev`, which never checks out `dev`)" from the orchestrator-only ship steps. |
| `.bkit/core/.bkit/cli.md` | Regenerated with `pnpm cli:sync` from the verb specs: the `sync-dev` row's use becomes `by hand` (Task 3), and Task 8 regenerates it after the output specs change. |
| `.bkit/instructions.md` | The `- source:` blocks of the five edited workflows hold their new standing lines, and the retired ship Step 13 entries go (Tasks 9 and 10). |
| `.agents/docs.md` | None — no new doc. |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit has no database. | — |
| **Code** | `git revert {COMMIT}` of the squash on `dev`, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `dist/` and the host mirrors match. | Ship logs written after this change hold no `ship-switch-to-dev` row; the reverted `status-holes.ts` then reports that step missing on those runs, which is a report only, not a failure of any later run. |
| **Risk window** | None — consumers get the change only through a bkit release, and the revert ships the same way. | — |

## Agent Execution Runbook

Build order: the sync core (Group 1), then the two existing sync verbs and the replay log (Group 2), then every other engine caller and the contract test (Group 3), then the workflow prose, ship's step retirement and the generated files (Group 4). One PR for all tasks is fine. Every task that edits `.bkit/core/engine/**/*.ts` ends with `pnpm build`, so a commit of any group carries its `dist/` (`.agents/rules.md` § Engine builds), and the integration tests that run `dist/cli.js` see the task's code.

**Implementation Tasks:**

<!-- bkit:group 1 start -->

### TASK GROUP 1: Sync core

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Create `syncLocalDev` with its states, counts, fast-forward move and lines
  - **CREATE:** `.bkit/core/engine/commands/workflow/local-dev.ts`: `LocalDevState`, `LocalDevReason`, `LocalDevSync`, `syncLocalDev(root, o, log)` steps 1-6 of `Architecture & Component Changes` (refused moves report `blocked: git-refused` until Task 2), and the `line` wordings for `equal`, `fast-forwarded`, `ahead`, `divergent`, `pending`, `unavailable: fetch-failed` and `not-applicable`, with the "Your work landed on origin/dev (…)" prefix
  - **CREATE:** `.bkit/core/engine/commands/workflow/local-dev.test.ts`: Unit (boundary: real temp git repo) fixture with a bare `origin`, a main checkout and a second clone that advances `origin/dev`
  - **UPDATE:** `TIMEOUTS` in `.bkit/core/engine/shared/timeouts.ts`: add `LOCAL_DEV_FETCH_ATTEMPTS: 3`
  - **UPDATE:** `install` in `.bkit/core/engine/commands/workflow/branches.ts`: move to `local-dev.ts` with a `log` callback in place of `ctx`; `syncDevVerb` calls the moved copy
  - **READ:** `fastForwardDev` in `.bkit/core/engine/commands/workflow/branches.ts`: the two move commands to carry over
  - **READ:** `fetchDev` in `.bkit/core/engine/commands/land.ts`: the fetch of `origin/dev`
  - **READ:** `devRefRace` in `.bkit/core/engine/commands/land.ts`: the ref-lock race that is retried
  - **READ:** `landBackoffMs` in `.bkit/core/engine/commands/land.ts`: the retry backoff
  - **READ:** `installCommand` in `.bkit/core/engine/shared/package-manager.ts`: the frozen install argv
  - **READ:** `COULD_NOT_RUN_EXIT_CODES` in `.bkit/core/engine/shared/package-manager.ts`: "could not run" exits
  - **DONE WHEN:** `local-dev.ts` exports `syncLocalDev(root, o, log): Promise<LocalDevSync>`; `install` exists only in `local-dev.ts`; the 9 tests below pass; the rest of `branches.test.ts` passes; `pnpm typecheck` passes; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > equal: local dev matches origin/dev, nothing moves` fails on the state "equal" not being reported
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > behind with the main checkout on another branch moves only the dev ref` fails on local `dev` staying behind or the checked-out branch changing
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > behind with the main checkout on dev fast-forwards and runs the frozen install` fails on `installed` not being true after the move
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > ahead: reports the count and a manual step, keeps local commits` fails on the line lacking "git log --oneline origin/dev..dev" or naming `git pull --rebase`
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > divergent: reports both counts and never moves` fails on the state "divergent" not being reported or local `dev` moving
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > a failed fetch reports unavailable: fetch-failed` fails on the reason "fetch-failed" not being reported
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > an open close PR reports pending and fetches nothing` fails on the reason "close-pr-open" not being reported, or `origin/dev` being fetched
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > not-applicable for a runtime that cannot push dev and for a clone without local dev` fails on the reason "no-dev-push-runtime" or "no-local-dev" not being reported
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > targets the fetched origin/dev tip, not the landed SHA, and says the work landed` fails on local `dev` stopping at the landed SHA or the line lacking "Your work landed on origin/dev"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Read `blocked` reasons from git state, report install failure, never throw, and pin the routine wordings
  - **UPDATE:** `syncLocalDev` in `.bkit/core/engine/commands/workflow/local-dev.ts`: on a refused move re-read local `dev` once, then `occupied` → `edited-files` → `git-refused` from git state; `installed: false` with the re-run line; the catch-all → `unavailable: internal` with a warn-level stack log; the `replayedOwn` debug wording and the `routine: "failure-handover"` wording
  - **UPDATE:** `branchTree` in `.bkit/core/engine/commands/workflow/branches.ts`: move unchanged into `.bkit/core/engine/commands/workflow/worktrees.ts` as an export; `branches.ts` imports it
  - **UPDATE:** `docs/observability.md`: add `### Local dev sync lines` under § Log Format (caller prefixes; grep `Local dev:` and `local dev sync`)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `branchTree` is defined only in `worktrees.ts`; no code path in `local-dev.ts` reads git's stderr to pick a reason; `syncLocalDev` has no `throw`; the 10 tests below pass; `pnpm bkit:slop:delta` passes (the catch-all logs its stack at warn level); `docs/observability.md` has the subsection; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > dev checked out in another worktree reports blocked: occupied` fails on the reason "occupied" not being reported
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > an edit to a file the update changes reports blocked: edited-files and keeps the edit and index` fails on the reason "edited-files" not being reported, or the edit or index changing
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > an untracked file at a path the update adds reports blocked: edited-files` fails on the untracked file being overwritten or a reason other than edited-files
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > an edit to an unrelated file still fast-forwards and keeps the edit` fails on the move being refused or the edit lost
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > a staged change to an unrelated file still fast-forwards and keeps the index` fails on the move being refused or the staged change leaving the index
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > a failed frozen install keeps fast-forwarded and names the re-run` fails on the line lacking "the dependency install failed", or on a `friction` row being written
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > an exception inside the sync reports unavailable: internal and does not throw` fails on the call rejecting or the reason "internal" not being reported
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > the routine debug-on-dev wording counts the run's replayed commits` fails on the line lacking "expected after a debug run on dev"
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > the routine failure-handover wording for edited-files` fails on the line lacking "expected after a failure handover on dev"
    - `.bkit/core/engine/commands/workflow/local-dev.test.ts` `syncLocalDev > two concurrent syncs in one clone end level and never move dev backwards` fails on local `dev` ending behind `origin/dev` or on either call reporting a refusal after the other moved it; the test forces the interleaving (both calls fetch before either moves `dev`, for example through a hook between the fetch and the move), so it cannot pass on Task 1's code

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The two existing sync verbs and the replay log

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Move `branches sync-dev` and `branches land` onto `syncLocalDev` and delete `fastForwardDev`
  - **UPDATE:** `syncDevVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: async; no fetch of its own; `localDev` `unavailable: fetch-failed` maps to `EXIT_FETCH_FAILED`; emits `{ localDev, branch, installed }`; `installed === false` keeps `EXIT_INSTALL_FAILED` (16)
  - **UPDATE:** `landVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: delete the `fastForwardDev` call inside the `try` (`:3224`); call `syncLocalDev(root, { runtimeDevPushes: devPushes, landed: landed.sha, fetched }, ctx.log)` after the audit, the cross-check and the worktree removal, outside the `try`, once the exit code is fixed; `fetched` is the result of the audit's `fetchDev(root).ok`, which stays as the one fetch; an audit `Stop(EXIT_LANDED_UNVERIFIED)` exits before the sync
  - **UPDATE:** `devLocal` in `.bkit/core/engine/commands/workflow/branches.ts`: the `sync-dev` spec's `output.devLocal` becomes `output.localDev`
  - **UPDATE:** `use` in `.bkit/core/engine/commands/workflow/branches.ts`: the `sync-dev` spec's `use: "workflow"` becomes `use: "by-hand"`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync` (the `sync-dev` row reads `by hand`)
  - **UPDATE:** `landedSha` in `.bkit/core/engine/commands/workflow/branches.ts`: in the `land` spec's `output` beside it, `localDev` describes the `LocalDevSync` object
  - **DELETE:** `fastForwardDev` in `.bkit/core/engine/commands/workflow/branches.ts`: replaced by `syncLocalDev`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: the `branches sync-dev` block (`:3502-3566`) asserts `localDev` objects in place of `devLocal` strings; the `branches land` cases asserting a `localDev` string assert the object
  - **UPDATE:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: the existing case `bkit-design.md local close squash > lands past another session's uncommitted edit to a file the close changes, and keeps the edit` (`:147`) drops its stderr assertion "local dev not fast-forwarded" (`:156`), which `fastForwardDev`'s removal retires, and keeps asserting the landing and the kept edit
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -n 'fastForwardDev\|devLocal' .bkit/core/engine/commands/workflow/branches.ts` finds nothing; `sync-dev` and `land` emit a `LocalDevSync`; `.bkit/core/.bkit/cli.md` lists `sync-dev` as `by hand` and `pnpm cli:sync` leaves no diff on a second run; `pnpm build` has rebuilt `dist/` before the integration test runs; the 8 tests below, the rest of `branches.test.ts` and the rest of `close-squash.integration.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches sync-dev > emits localDev and keeps exit 16 when the install fails` fails on `devLocal` still being emitted or the exit not being 16
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches sync-dev > ahead: reports the counts and no git pull --rebase advice` fails on stderr or the line naming `git pull --rebase`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land > fast-forwards local dev to the fetched origin/dev tip and emits localDev` fails on local `dev` stopping at the landed SHA when `origin/dev` moved after the landing
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land > a runtime that cannot push dev emits localDev not-applicable` fails on `localDev` being `null` instead of the reason "no-dev-push-runtime"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land > a failed frozen install on the main checkout on dev keeps exit 0 and reports installed false` fails on a non-zero exit, `localDev.installed` not being false, or the line lacking "the dependency install failed"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land > the landPr fallback on a runtime that pushes dev emits localDev` fails on the PR-route landing emitting no `localDev` or leaving local `dev` behind the merged tip
    - `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `bkit-design.md local close squash > the close JSON reports localDev blocked: edited-files and exits 0` fails on the close's JSON lacking `localDev` `blocked` with reason "edited-files", or a non-zero exit
    - `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `bkit-design.md local close squash > a close that moves local dev under the main checkout runs one frozen install` fails on the gate fixture's `fixture-install-runs` not holding exactly one run, or its args lacking `--frozen-lockfile`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Drop the `git pull --rebase` advice from the own-commit replay log
  - **UPDATE:** `pushOwnCommits` in `.bkit/core/engine/commands/workflow/branches.ts`: the `landed` replay log (`:1276`) says local `dev` still holds the originals and that the `localDev` line reports what to do; no `git pull --rebase`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -n 'pull --rebase' .bkit/core/engine/commands/workflow/branches.ts` finds nothing; the test below and the rest of `branches.test.ts` pass; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches push > the own-commit replay log names a manual step, not git pull --rebase` fails on stderr naming `git pull --rebase`

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Every other `dev`-pushing verb reports `localDev`

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Sync after every push of `dev` in `pushBranch`, and report it from `branches push` and `branches force-build`
  - **UPDATE:** `PushOutcome` in `.bkit/core/engine/commands/workflow/branches.ts`: `out.localDev: LocalDevSync | null`; `notPushed` defaults it to `null`
  - **UPDATE:** `pushBranch` in `.bkit/core/engine/commands/workflow/branches.ts`: when the branch is `dev` and the route reached `pushOwnCommits` or the shared plain push, set `out.localDev` from `syncLocalDev(…, { runtimeDevPushes: true, landed, replayedOwn }, log)` after the outcome's code is fixed
  - **UPDATE:** `forceBuildVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: emit `pushed.out.localDev`
  - **READ:** `pushOwnCommits` in `.bkit/core/engine/commands/workflow/branches.ts`: the record's `pushed` list that gives `replayedOwn`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: the exact-shape `toEqual` assertions on the `branches push` JSON at `:1384` (feature push) and `:1547` (abort push, exit 7) gain `localDev: null`, because `toEqual` does not ignore a `null` field; the push cases that push `dev` run under `useGateRunner` or a fixture without `package.json`, so the new sync never spawns a real `pnpm install` or exceeds its timeout
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: any exact-shape assertion on the handover-abort JSON (`workflows.ts:896`) or the ship close-PR JSON (`branches.ts:2972`, `:3033`) that spreads `PushOutcome.out` gains `localDev`; the handover cases that push `dev` follow the same fixture rule
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.test.ts`: any exact-shape assertion on the dispatch JSON that spreads `PushOutcome.out` (`runs.ts:882`) gains `localDev`; the dispatch cases that push `dev` follow the same fixture rule
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `branches push` on `dev` and `branches force-build` on `dev` emit a `LocalDevSync`; a feature-branch push emits `localDev: null`; exit codes are unchanged; the 5 tests below pass; the rest of `branches.test.ts`, `workflows.test.ts` and `runs.test.ts` pass; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches push > --mode=dev replay emits localDev with the routine debug wording` fails on `localDev` missing or its line lacking "expected after a debug run on dev"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches push > --mode=dev plain push emits localDev equal` fails on `localDev` missing or not "equal"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches push > --mode=dev with nothing to push still emits localDev` fails on the "no-run-commits" skip emitting no `localDev`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches force-build > on dev emits localDev` fails on the force-build JSON lacking `localDev`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `branches push > a feature-branch push emits localDev null and fetches no dev` fails on a sync running for a feature branch

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Sync in ship's close after `ship DONE`, re-observe in build / debug closes, and fold the line into `finalReturn`
  - **UPDATE:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: after `releaseLock` succeeded, `syncLocalDev(…, { runtimeDevPushes: true, landed })`, where `landed` is the `pushToDev` result's `sha` on a head-push landing and absent for a merged close PR (which passes `fetched: true` when its `fetchDev(root)` succeeded); an open close PR → `pendingPr`; return `localDev` beside the existing output, exit code computed first
  - **UPDATE:** `finalReturnText` in `.bkit/core/engine/commands/workflow/workflows.ts`: take an optional `localDevLine` and place it after the summary parts (summary, `--line`s, issue link) and before `## Suggested Replies`; never fold a `not-applicable` line
  - **UPDATE:** `finalReturnParts` in `.bkit/core/engine/commands/workflow/workflows.ts`: at its call in the `close` verb's `run`, pass ship's `localDev.line`; for non-flush `build` / `debug` closes run `syncLocalDev(root, { runtimeDevPushes: <runtime detect> })` and pass its line; emit `localDev` (null for design / plan non-flush closes)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the `close --final-return` assertions at `:2890` (exact `toBe` sequence), `:2912` (`startsWith("# Build Summary\n\nAll green.\n\n## Suggested Replies\n\n")`) and `:2932` (`startsWith("…First.\n\nSecond.\n\n## Suggested Replies")`) expect the fixture's `Local dev:` line after the `--line`s / issue link and before `## Suggested Replies`, or no line when the fixture's runtime yields `not-applicable`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** a ship close's `finalReturn` holds a `Local dev:` line after its summary parts and before `## Suggested Replies`; a blocked sync or failed install leaves the close's exit 0; the 6 tests below and the rest of `workflows.test.ts` pass; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --flush (ship) > fast-forwards local dev after ship DONE and ends finalReturn with the line` fails on local `dev` staying behind the `ship DONE` commit or `finalReturn` lacking "Local dev: synced to origin/dev"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --flush (ship) > close PR (dev refused the push) > an unmerged close PR reports localDev pending and fetches nothing` fails on the reason "close-pr-open" not being reported
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --flush (ship) > a blocked local dev sync still exits 0` fails on the close exiting non-zero or `localDev` not `blocked`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --flush (ship) > a failed frozen install after the fast-forward exits 0 and names the re-run` fails on exit 16 or the line lacking "the dependency install failed"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --final-return > a build close re-observes local dev and adds its line to finalReturn` fails on `finalReturn` lacking a "Local dev:" line, or holding it after `## Suggested Replies`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows close --final-return > a debug close re-observes local dev and adds its line to finalReturn` fails on a debug close's `finalReturn` lacking a "Local dev:" line, or holding it after `## Suggested Replies`

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Report `localDev` from failure-record handovers, `roadmap mirror` and the `runs dispatch` re-trigger
  - **UPDATE:** `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: after `landFailedRecord` landed and `handBack` ran, `syncLocalDev(…, { runtimeDevPushes: true, landed: handed.sha, routine: shared ? "failure-handover" : undefined })`, so ship's `--flush` from a feature worktree gets the plain wordings; the abort-mode `pushBranch` route forwards `r.out.localDev`; emit `localDev`
  - **UPDATE:** `mirror` in `.bkit/core/engine/commands/workflow/roadmap.ts`: when `mirrored`, `syncLocalDev(root, { runtimeDevPushes: true, landed })`; else `null`; emit `localDev`
  - **UPDATE:** `DispatchResult` in `.bkit/core/engine/commands/workflow/runs.ts`: a nullable `localDev` field
  - **UPDATE:** `ciDispatchGate` in `.bkit/core/engine/commands/workflow/runs.ts`: `localDev` from the re-trigger `pushBranch` (`:882`), `null` otherwise
  - **READ:** `handBack` in `.bkit/core/engine/commands/workflow/workflows.ts`: what is handed back before the sync
  - **READ:** `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: when the record landed
  - **READ:** `useGateRunner` in `vitest.gate-fixture.ts`: the landing fixture the new handover tests run under from the start, so the hook gate stays out of their 30 s budget (open failure row on the existing test at `:1699`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the existing case `bkit workflows handover > --push on dev hands the landed record back, so local dev fast-forwards onto it` (`:1699`) keeps passing: its own fetch and `merge --ff-only` become no-ops once the engine has levelled local `dev`; new `handover` cases go beside it
  - **UPDATE:** `.bkit/core/engine/commands/workflow/roadmap.test.ts`: new `mirror` case for `localDev`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.test.ts`: new `dispatch` case for the re-trigger's `localDev`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `workflows handover`, `roadmap mirror` and `runs dispatch` emit `localDev`; their exit codes are unchanged; the 6 tests below and the rest of `workflows.test.ts`, `roadmap.test.ts` and `runs.test.ts` pass; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows handover > --push on dev emits localDev fast-forwarded from the handover JSON` fails on the handover JSON lacking `localDev` "fast-forwarded"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows handover > --push on dev with a kept staged ledger reports the routine failure-handover line and exits 0` fails on the line lacking "expected after a failure handover on dev" or a non-zero exit
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows handover > --flush from a feature worktree emits localDev with the plain wording` fails on the handover JSON lacking `localDev`, or its line naming "expected after a failure handover on dev"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows handover > abort-mode --push on a feature branch emits localDev null` fails on the handover JSON lacking the `localDev` field or a sync running for the feature branch
    - `.bkit/core/engine/commands/workflow/roadmap.test.ts` `bkit roadmap mirror > emits localDev after landing the row` fails on the mirror JSON lacking `localDev`
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `bkit runs dispatch on dev (a debug run in place) > the re-trigger push's localDev is in the result` fails on the dispatch JSON lacking `localDev`

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Add the reachability contract test and declare `localDev` in every reached verb's output spec
  - **CREATE:** `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts`: parse `.bkit/core/engine/commands/**/*.ts` (tests excluded) with prettier's TypeScript parser; walk callers up from `pushToDev`, `runPush` and every `runGit(…, ["push", …])` call to verb specs; assert each reached verb's `output` has `localDev`; named exemptions (`pushCurrentBranch`, `pushPlain`, `closePr`, the remote-branch delete in `worktrees.ts`), each checked against its guard in source and against still existing
  - **READ:** `.bkit/core/engine/audits/repo/json-parse-owner.test.ts`: the parser setup
  - **UPDATE:** `pushBranch` in `.bkit/core/engine/commands/workflow/branches.ts`: the `push` and `force-build` verb specs that report it gain `output.localDev`
  - **UPDATE:** `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: the `handover` and `close` verb specs gain `output.localDev`
  - **UPDATE:** `mirror` in `.bkit/core/engine/commands/workflow/roadmap.ts`: its verb spec gains `output.localDev`
  - **UPDATE:** `ciDispatchGate` in `.bkit/core/engine/commands/workflow/runs.ts`: the `dispatch` verb spec gains `output.localDev`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DEPENDS ON:** 6, 7
  - **DONE WHEN:** the 2 tests below pass; `pnpm cli:sync` leaves no diff on a second run; `pnpm vitest run .bkit/core/engine/commands/conventions.test.ts` passes; `pnpm build` has rebuilt `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts` `local dev reachability > every verb reachable from a push to dev declares localDev in its output spec` fails on push, force-build, handover, close, mirror or dispatch missing `localDev` in its spec
    - `.bkit/core/engine/audits/repo/local-dev-reachability.test.ts` `local dev reachability > the walk reaches the known dev pushes` fails on the walk not reaching `branches land`, `roadmap mirror` and `branches push`

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Workflow display, ship Step 13 retirement and generated files

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Show `localDev.line` in the workflows' final messages and Failure Paths
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: hold `branches land`'s `localDev.line` as `LOCAL_DEV_LINE`; the final-return step displays `{FINAL_RETURN}` then `{LOCAL_DEV_LINE}` when set; the Failure Path STOP ends with the handover's `localDev.line` when not null
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the same three changes as `bkit-design.md`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the in-place `branches push --mode=dev` holds `LOCAL_DEV_LINE`; a re-triggering `runs dispatch` replaces it with its non-null `localDev.line`; the final return displays it after `{FINAL_RETURN}`; Failure Paths as above
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Failure Path STOPs after `workflows handover --push` (`:117`, `:291`) end with its `localDev.line` when not null
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Failure Path after `workflows handover --flush` (`:110`) and the Stop route after `--push` (`:828`) end with its `localDev.line` when not null
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `:217` (every `dev`-pushing verb reports `localDev`; the final message shows its line), `:132` and `:817` (the handover's line)
  - **UPDATE:** `.bkit/instructions.md`: before editing each workflow's sentences, run `pnpm instructions:show --file {basename}`; then hand-edit the `- source:` blocks of `bkit-design.md` (`:10212`), `bkit-plan.md` (`:10283`), `bkit-debug.md` (`:10067`), `bkit-build.md` (`:9773`) and `bkit-ship.md` (`:10341`) so every standing line Task 9 rewrites is quoted as it now reads
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render -u`, then confirmed by a plain re-run
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated by the same run
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated by the same run
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by the same run
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated by the same run
  - **READ:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: how it extracts the `branches land` line from the Close Workflow block of `bkit-design.md` / `bkit-plan.md` (`:2-4`), so holding `localDev.line` as `LOCAL_DEV_LINE` keeps that line extractable
  - **DEPENDS ON:** 8
  - **DONE WHEN:** each named workflow names `localDev.line` where described; `grep -n 'localDev' .bkit/core/.bkit/workflows.md` finds the `:132`, `:217` and `:817` edits; `pnpm vitest run .bkit/core/engine/audits/workflows` passes (fence syntax and shape audits); `pnpm vitest run .bkit/core/engine/audits/workflows/close-squash.integration.test.ts` passes (the `branches land` extraction still works); `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes; `pnpm vitest run .bkit/core/engine/render` passes with no snapshot update; the 3 tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `design and plan close > shows the landing's localDev line after FINAL_RETURN` fails on `bkit-design.md` or `bkit-plan.md` lacking `LOCAL_DEV_LINE` after `{FINAL_RETURN}`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug on dev > shows the last dev-pushing verb's localDev line after the close's` fails on `bkit-debug.md` lacking `LOCAL_DEV_LINE` at the push, dispatch and final return
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Failure Path > every handover that pushes the record ends the final message with its localDev line` fails on a design, plan, build, debug or ship Failure Path omitting `localDev.line`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Retire ship Step 13 and renumber Close Workflow to Step 13
  - **DELETE:** `.bkit/core/workflows/bkit-ship.md`: Step 13 — Update Local Dev, its Gate 13 (`:920-935`) and its checklist item
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Close Workflow → Step 13 / Gate 13, `--number=13`; references to Step 14 (`:44`, `:46`, `:937`, `:949`, `:964`) renumbered; the "`state` = MERGED → Step 13" routes (`:318`, `:765`) kept (they now reach Close Workflow). Follows Open Question 2's default A
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: remove the `ship-switch-to-dev` entry; `ship-close-workflow` becomes number 13
  - **UPDATE:** `RETIRED_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: add `ship: { "ship-switch-to-dev": "ship-close-workflow" }`
  - **UPDATE:** `SHIP_STEP_ORDER` in `.bkit/core/engine/checks/status-holes.ts`: drop the key from the mandatory order and accept it as a retired key
  - **UPDATE:** `CANONICAL_SHIP_STEP_KEYS` in `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: 13 keys
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: `ship > brings local dev level through branches sync-dev, never a checkout` asserts the close brings it level instead
  - **UPDATE:** `.bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts`: `ship brings local dev level through bkit branches sync-dev` asserts the close does instead
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: fixtures that list `ship-switch-to-dev`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `Step 14 — Close Workflow` section patterns at `:1042`, `:1049` and `:1083` become `Step 13 — Close Workflow`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: the `Step 14.3 labels skip when ISSUE_ID is empty` case (`:927-928`) reads `Step 13.3` from the `Step 13 — Close Workflow` section
  - **UPDATE:** `.bkit/core/engine/commands/workflow/progress.integration.test.ts`: the ship `--flush` progress line at `:471` becomes `Progress: ██████████ 100% · Step 13/13 Close Workflow`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `:141`, `:1135`, `:1136`, and Step 14 → Step 13 at `:306`, `:1207`, `:1242`, `:1253`, `:1255`, `:1328`, `:1353`, `:1420`
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: `:269` drops ship's update-local-dev step
  - **UPDATE:** `.bkit/instructions.md`: after `pnpm instructions:show --file bkit-ship.md`, hand-edit the `bkit-ship.md` `- source:` block (`:10341`): drop the two retired Step 13 entries at `:10455-10456` (the "Fast-forward local dev to origin/dev, then finish:" step line and the "Local dev synced (branches sync-dev)" checklist line) and quote the renumbered Close Workflow lines as they now read
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render -u`, then confirmed by a plain re-run
  - **DEPENDS ON:** 6, 9
  - **DONE WHEN:** `grep -n 'sync-dev\|ship-switch-to-dev' .bkit/core/workflows/bkit-ship.md` finds nothing; `grep -n 'Step 14' .bkit/core/workflows/bkit-ship.md .bkit/core/.bkit/workflows.md` finds no ship reference; `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes; `pnpm vitest run .bkit/core/engine/render` passes with no snapshot update; `pnpm build` has rebuilt `dist/`; the 4 tests below and the updated tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `detectHoles > an old ship log that recorded ship-switch-to-dev reports no unexpected step` fails on "ship-switch-to-dev" being reported unexpected once the key leaves the order
    - `.bkit/core/engine/checks/status-holes.test.ts` `detectHoles > a new ship run without ship-switch-to-dev reports no missing step` fails on "ship-switch-to-dev" being reported missing
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `bkit status resume > a ship stopped after ship-switch-to-dev resumes at Close Workflow (Step 13)` fails on the resume pointing at a step numbered 14
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `bkit-ship.md — dev writes live in commands > no fence runs branches sync-dev; the close and the flush bring local dev level` fails on `bkit-ship.md` still running `branches sync-dev`

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Update `docs/testing.md`, rebuild `dist/`, refresh mirrors and snapshots, and run the static gates
  - **UPDATE:** `docs/testing.md`: rows for `local-dev.test.ts` and `local-dev-reachability.test.ts`; the `branches.test.ts` (`:768`), `ship-invariants.test.ts` (`:699`), `workflow-shape.test.ts` (`:784`) and `runs.test.ts` (`:687`) text, per `Documentation Updates`
  - **UPDATE:** `.bkit/workflows.md`: mirror refreshed by `pnpm instructions:sync`, then `pnpm tsx .bkit/core/engine/cli.ts upgrade` once, which also refreshes the host workflow copies
  - **UPDATE:** `.agents/skills/bkit-ship/SKILL.md`: refreshed by the same `upgrade` (it names `ship-switch-to-dev` today)
  - **UPDATE:** `.agents/plugins/bkit/skills/bkit-ship/SKILL.md`: refreshed by the same `upgrade`
  - **DEPENDS ON:** 10
  - **DONE WHEN:** `pnpm build` has rebuilt `dist/` and `pnpm bkit:check:dist` passes; `pnpm bkit:gate:static` passes; `pnpm instructions:sync` exits 0; `pnpm vitest run .bkit/core/engine/render` passes with no snapshot update; `pnpm bkit check` reports no mirror drift; `grep -rln 'ship-switch-to-dev' .agents/skills/bkit-ship/SKILL.md .agents/plugins/bkit/skills/bkit-ship/SKILL.md` finds nothing; `docs/testing.md` names both new test files
  - **TEST FIRST:** n/a — docs, a regenerated build, regenerated mirrors and snapshots; no behaviour change of its own

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** refusals and the internal-error stack are logged through the caller's prefix as `docs/observability.md` § Local dev sync lines describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared gate that runs without a deployed boundary) and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** No E2E tier exists in bkit. Existing tests updated alongside: the `branches sync-dev` and `branches land` cases and the exact-shape push assertions (`:1384`, `:1547`) in `branches.test.ts`, the edited-file case in `close-squash.integration.test.ts`, the `close --final-return` assertions (`:2890`, `:2912`, `:2932`) in `workflows.test.ts`, `workflow-shape.test.ts` (`ship` case at `:1058`, `Step 14` patterns at `:1042`, `:1049`, `:1083`), `ship-invariants.test.ts` (13 step keys, `dev` writes, `:927-928`), `progress.integration.test.ts:471`, `skip-ci-subject-audit.test.ts` (iv), the `status-holes.test.ts` fixtures, and `instructions-coverage.test.ts` through the `.bkit/instructions.md` edits.
- [ ] **Build Configuration:** Test files stay out of `dist/`: `tsconfig.json`'s exclude already drops `*.test.ts`, and `pnpm bkit:check:dist` shows no test file in `dist/`.
- [ ] **Unit, boundary: real temp git repo (`.bkit/core/engine/commands/workflow/local-dev.test.ts`):** the 19 `syncLocalDev` cases; each test builds its own bare `origin` and checkouts under `os.tmpdir()` and removes them after.
- [ ] **Unit (`branches.test.ts`, `workflows.test.ts`, `roadmap.test.ts`, `runs.test.ts`):** the verb-level `localDev` cases of Tasks 3-7, landing under `useGateRunner`.
- [ ] **Unit, source parse (`.bkit/core/engine/audits/repo/local-dev-reachability.test.ts`):** every verb reached from a push to `dev` declares `localDev`.
- [ ] **Unit, markdown-invariant (`workflow-shape.test.ts`, `ship-invariants.test.ts`), `status-holes.test.ts`, `step-table.test.ts`:** display and ship-step cases of Tasks 9 and 10.
- [ ] **Integration (`.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`):** a real design / plan close, whose `bkit branches land` runs from the repo's built `dist/cli.js`, against a bare remote reports `localDev` `blocked: edited-files` and exits 0, and a close that moves local `dev` under the main checkout runs one frozen install.
- [ ] **Apply local migrations:** Not applicable — no database.
- [ ] **Run all tests:** `pnpm test:coverage:unit` and `pnpm test:integration` pass; `pnpm bkit:check:dist` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** With the main checkout on `dev`, clean, and one commit behind (`git fetch origin && git status -sb` shows `behind 1`), run `pnpm bkit branches sync-dev --json` → `localDev.state` is `fast-forwarded`, and `git rev-parse dev origin/dev` prints the same SHA twice.
- [ ] **Step 2:** Make one local commit on `dev` and run `pnpm bkit branches sync-dev --json` → `localDev.state` is `ahead` (or `divergent` if `origin/dev` moved), the line names `git log --oneline origin/dev..dev`, and `git rev-parse dev` is unchanged.
- [ ] **Step 3:** Ship a small feature with `/bkit-ship` → the step list has no Update Local Dev step; the final message ends its summary with `Local dev: synced to origin/dev (…)`, and `git rev-parse dev` equals `git rev-parse origin/dev` after the run.
- [ ] **Step 4:** Run `/bkit-plan` on another feature while `dev` is checked out in a linked worktree → the final message shows `Local dev: not moved — … dev is checked out in <path>…`, and the close reported success.
