## #101 — Agentic workflow: review routing, dry-runs, commit hygiene (open)

<!-- linear-import: BAR-233 -->

**Linear:** [BAR-233](https://linear.app/bartens/issue/BAR-233) · **Created:** 2026-05-19 · **Linear assignee:** christian@bartens.biz

---

## Context

Three workflow-quality improvements that have accumulated as deferred follow-ups across [BAR-108](https://linear.app/bartens/issue/BAR-108/review-adopt-gstack-patterns) / [BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture). Grouped because they all target the bkit orchestrator workflow files (`.agents/workflows/bkit-*.md`) and improve cost-efficiency or correctness of the autonomous loop without changing core behavior.

None are correctness-critical today, hence Low priority. Each is small in isolation but they share the same review/edit surface so bundling avoids three separate context switches.

## Scope

### 1\. Conditional 1× vs 2× plan review routing

`bkit-plan.md` currently invokes all 3 reviewers (`plan-review-1`, `plan-review-2`, `plan-review-3`) unconditionally on every plan. For trivial plans this is wasteful; for risky plans it's correct.

(Note: `plan-complexity-check` / `plan-complexity-split` already exist for plan-partitioning — that's a separate concern from review-skipping.)

**Fix:**

- **Triage:** planner emits a `complexity_score` (1–10) or tier from tasks, deps, ambiguity, risk. Threshold Low → 1×, High → 2× (tunable).
- **Conditional:** review 1 returns `major_gaps_found` or a scope-confidence verdict. Clean → stop; heavy gaps → run review 2 on the revised plan.
- **Heuristics (optional):** task count, plan length, high-risk keywords (integration, custom DB, compliance) force 2×.
- **MVP:** ship triage + conditional second pass only when single review flags severe flaw. Implement via prompt/JSON schema + orchestration routing. Tune on real plans.

### 2\. Dry-run coverage for `/debug` and `/ship` commands

Current test matrix covers `/design`, `/plan`, `/build` only. `/debug` requires a real failing CI run; `/ship` requires a mergeable PR — neither can be simulated with a throwaway Linear issue.

Existing shell assertions (Matrix row 5) confirm the workflow files parse, but semantic validation is absent.

**Fix:** dedicated fixtures

- Seeded branch with a deliberate lint failure → exercise `/debug` end-to-end against it.
- Passing PR fixture → exercise `/ship` end-to-end against it.

Wire both into the existing test matrix as new rows.

### 3\. `chore({FID}):` orchestrator commit-subject audit

[BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture) narrowly renamed 2 cited `chore({FID}):` orchestrator-emitted subjects that carry verdict context (`bkit-debug.md` Step 8 `observe instrument`, `bkit-build.md` Step 4 `assess skills`) to verb-prefixed subjects so the `commit-msg` hook validates their bkit trailer.

A broader sweep was deferred. The bkit-managed orchestrator files (`bkit-build.md`, `bkit-design.md`, `bkit-debug.md`, `bkit-ship.md`) still emit dozens of `chore({FID}):` subjects (e.g. `chore({FID}): worktree-setup`, `chore({FID}): summary`, `chore({FID}): close-workflow`).

**Fix:** audit all 5 `bkit-*.md` orchestrators for any remaining agent-step commits whose subject does not match the verb pattern. Decide per-case whether to:

- Rename to verb-prefixed subject (`docs({FID}):` / `feat({FID}):` / etc.), OR
- Accept hook bypass (and document why)

## Acceptance

- Triage subagent emits `complexity_score`; orchestrator skips review-2/3 below the threshold on a real test plan. Cost reduction measurable on a `/plan` run.
- `/debug` and `/ship` test matrix rows green against the new fixtures.
- Every `chore({FID}):` subject in `bkit-*.md` either matches the verb pattern or has a documented bypass reason.

## Out of scope

- Refactoring the reviewer subagents themselves (just routing changes).
- Replacing the test matrix shell harness with a different test framework.
- Changing the commit-msg hook contract ([BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture)'s territory).

## Related

- [BAR-108](https://linear.app/bartens/issue/BAR-108/review-adopt-gstack-patterns) (gstack patterns — original 1×/2× routing discussion)
- [BAR-124](https://linear.app/bartens/issue/BAR-124/optimise-workflows-prompts-architecture) (commit-subject narrow rename; this is the broader sweep)
- `.agents/workflows/bkit-*.md`
- `docs/pending.md` (entries removed at issue-creation time)

<!-- linear-links-start -->

**Links:**

- **Related:** [BAR-108](https://linear.app/bartens/issue/BAR-108) _(not imported)_, [BAR-124](https://linear.app/bartens/issue/BAR-124) _(not imported)_

<!-- linear-links-end -->

## #679 — Raw git in ship, debug and build becomes bkit verbs (closed)

### Problem

A handful of workflow steps still run raw git and shell inside their bash blocks, or ask the orchestrator to read shell output by eye. They cost few tokens, but each is a place the model can run the wrong git command or misread the result, and the same sequence is written out more than once.

<!-- prettier-ignore -->
| Item (#676) | Where | What the block does today |
| --- | --- | --- |
| 13 | build Step 18 sub-steps 1 and 2 | `git fetch origin dev`; `git diff origin/dev --name-only \| grep -qiE '(^\|/)(migrations\|migrate)/'`; `git show -s --format=%B HEAD \| grep -qF '[force build]'`; then amend or `git commit --allow-empty` with `bkit [force build]`. The engine has no notion of force build. |
| 14 | debug Step 11 sub-steps 2 and 6 | `git diff {DIFF_BASE}...HEAD -- . ':(exclude)docs/plans' \| grep -qE '^\+.*\[DEBUG-OBSERVE\]'` as the no-leak assertion; `"{BKIT}" issues labels {LABEL_FLAGS} \| jq -er .autoRouteSuffix` then `git add -A && git commit --allow-empty -m "chore({FID}): create-pr bkit [verbose ci]${AUTO_ROUTE_SUFFIX}"`. |
| 15 | ship Steps 1, 2, 4, 5, 8, 10, 14 | Step 1: `[ "$(git branch --show-current)" = "{SHIP_BRANCH}" ] \|\| …` and `rm -f` of the `.deferred-blocked` and `.rebase-failed` sentinels. Step 2 sub-step 3: branch `case`, `git fetch origin dev`, `git rev-list --count origin/dev..HEAD`, `git push -u origin "$B"`, `prs open`, `status meta --opened-pr`. Step 4 B2: `ledgers commit --mode=stage` then raw `git commit -m "chore({FID}): conflict-resolve bkit [skip ci]"` then `branches push`. Step 5: `git fetch origin "{SHIP_BRANCH}"` and `git merge --ff-only`. Step 8: `git push origin "{SHIP_BRANCH}"` after `ledgers commit`. Step 10: `git fetch` plus `counters rows … \| jq -er .value` into `counters route`. Step 14: `rm -f` and `cp` of `ship-summary.md` into the outbox. |
| 17 | ship Step 2 sub-steps 2 and 6 | A case-insensitive contains check on the branch name, by the model; `runs wait` twice then the model asserts `prs checks` output. |
| 18 | design and plan Failure Path step 3 | The model reads `git status --short` porcelain to decide which stray files to remove. |

### Outcome

Each sequence becomes a verb or a flag on an existing verb, with a `Route:` on exit codes:

- `branches force-build --base=origin/dev` detects migration paths and amends or empty-commits the `[force build]` marker. Or a `--force-build-on=migrations` flag on `prs open`.
- `prs scan-diff --marker='[DEBUG-OBSERVE]' --base={DIFF_BASE}` beside the existing `prs scan-body`; `prs open --create-pr-commit` writes the `create-pr bkit [verbose ci]` commit with the auto-route suffix itself.
- Ship: `branches ff --ref=origin/{SHIP_BRANCH}` for fetch plus fast-forward; `prs open --ensure` folds the branch guard, fetch, ahead count, push and `status meta`; `ledgers commit --push` for the stage-commit-push triples; `counters route --rows=…` so no jq; `workflows close --summary=ship-summary.md` does the outbox copy. Step 1's branch assert and sentinel removal move into `workflows start` for ship.
- `prs checks --assert` exits non-zero when any check is not green; `branches name-check --branch --expect` for the warning.
- `workflows handover --list-stray` prints the untracked and modified paths as JSON; the orchestrator still decides what to remove.

### Success criteria

- No bash block in `.bkit/core/workflows/` contains a bare `git fetch`, `git merge`, `git push`, `git commit`, `git diff … | grep`, `rm -f` or `cp` outside a `"{BKIT}"` call, except `cd` and `mkdir -p`.
- No `| jq` pipe remains in a workflow bash block.
- Ship, debug and build keep their current behaviour on the same inputs; the existing render snapshots and `commands/workflow/*.test.ts` cover each new verb.

### Constraints and non-goals

- Behaviour-preserving. No change to what gets committed, pushed or asserted; only who runs it.
- One workflow per change, ship first since it holds the most.
- Done last in the #676 order; it buys safety and consistency more than tokens.

### Decisions already made

- None yet.

### Open questions

- Whether the force-build marker belongs on `prs open` or on a `branches` verb, given ship also opens PRs.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 13, 14, 15, 17, 18)
- #663 — Workflow prompt process optimisation
- `.bkit/core/.bkit/workflows.md` § Workflow Authoring Rules ("Bash decides, prose routes")
- `.bkit/core/engine/commands/workflow/branches.ts`
- `.bkit/core/engine/commands/workflow/prs.ts`
- `.bkit/core/engine/commands/workflow/ledgers.ts`
- `.bkit/core/workflows/bkit-ship.md`
- `.bkit/core/workflows/bkit-debug.md` (Step 11)
- `.bkit/core/workflows/bkit-build.md` (Step 18)

**A follow-on now depends on this issue: #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681).**

Today 8 call sites pipe `"{BKIT}"` output through `jq` (7 in `.bkit/core/workflows/bkit-debug.md`, 1 in `bkit-ship.md`), which is the only reason verb replies are JSON. Once this issue removes every `| jq`, nothing parses the output, and #681 can switch the default to `key: value` text (with `--json` kept for scripts and tests) across the 317 `"{BKIT}"` calls in the six workflows. #681 lists this issue in its `bkit:blocked-by` block.

One request for the design here: when a raw git call becomes a verb, print only the fields the workflow reads next, not the whole git object. That is the same saving #681 is after, and it costs nothing to do here first.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 3 and 4.

### Implementation plan (2026-10-24)

**In short:** every raw `git` and `gh` line left in ship, debug and build becomes a `bkit branches|prs|ledgers|workflows` verb, or a flag on one that already exists. A guard test then fails if a raw call comes back. It ships in six slices: ship first (the most lines), then debug, then build, then the Failure Paths, then the guard. One behaviour fix rides along: `[force build]` currently does nothing on pull requests.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 11 | `[force build]` on pull requests | **Fixed here.** CI reads the marker from the PR title on `pull_request` events and from the commit message only on pushes (`bkit-ci.yml:57-71`). So the empty `[force build]` commit the workflows push today is ignored on a PR. `branches force-build` does both: (1) it adds `[force build]` to the PR title when a PR is open, then (2) it pushes the empty marker commit. CI's `pull_request` trigger uses the default event types (`opened`, `synchronize`, `reopened`; `bkit-ci.yml:11`), so renaming the title alone starts nothing. The push in (2) is the `synchronize` event that starts the run, and that run reads the new title. It never amends a commit. |
| 5 | Repeat-safety (shared with #675) | Marker commits, CI dispatch re-triggers and PR opens record an `engine-action` row in `status.jsonl` before they report done, and check for one first. A re-run after a crash doesn't push a second marker commit or open a second PR. The row type and helper come from #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675. |

Decided by me (say if you disagree):

- **Ship Step 8 push stays conditional.** The draft for this plan suggested pushing unconditionally. I'm keeping today's behaviour: push only when `outcome` says there is something new. It becomes a route on the verb's output instead of prose. An unconditional push would start a CI run on every ship even when nothing changed. If you want the simpler unconditional form, it's a one-line change.
- **Branch-name check.** When the branch name doesn't match the FID, `worktrees setup` prints a stderr warning rather than failing, so a hand-made branch still works.

#### What is already true in the code

- Item 17 in the body is out of date: `prs checks` already exits 1 on a failing check. #662 — workflows start after a failed ship — https://github.com/cbartens/bkit/issues/662 is closed.
- The body's site list misses these: build:146, debug:310, Failure Path build:90 and debug:92, ship:486, and ship sub-steps 2.2 and 2.6. All are in the slices below.
- Ship's last jq pipe (`bkit-ship.md:535`) goes here. Debug's go in #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678.

#### New verbs and flags

<!-- prettier-ignore -->
| Verb or flag | Replaces |
| --- | --- |
| `branches push --mode=plain --set-upstream --ahead-of=<ref>` | `git push -u` plus the prose ahead-of check |
| `branches fast-forward --onto=<ref>` | `git fetch` + `git merge --ff-only` |
| `branches scan-diff --base` | `git diff --name-only` pipes used for routing |
| `branches force-build` | the empty-commit block; also sets the PR title (decision 11) |
| `branches push --commit --label` | `git commit --allow-empty -m …` + push for the debug `create-pr bkit [verbose ci]` marker |
| `counters route --rows=` | prose counter arithmetic in ship |
| `workflows start --branch` | ship's sentinel clearing in prose |
| `workflows close --summary` | `git log` summary assembly at close |
| `ledgers commit --path` and `--mode=commit --stage-tracked-updates` | `git add`/`git commit` of ledgers |
| `status meta --debug-attempt=run` | debug's hand-written meta row |
| `runs gate --branch` (with fetch) | `git fetch` before the gate check |
| `workflows handover --list-stray` | Failure Path `git status --porcelain` reading |

Every verb that pushes or opens a PR records an `engine-action` row (decision 5).

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

1. **Ship open and verify** (Steps 1-8): `workflows start --branch`, `branches fast-forward`, `branches scan-diff`, `branches push --mode=plain`, the conditional Step 8 route, ship 2.2 and 2.6, ship:486.
2. **Ship integrate to close**: `counters route`, `ledgers commit`, `workflows close --summary`, the jq pipe at `:535`.
3. **Debug**: `branches push --commit --label`, `status meta --debug-attempt=run`, debug:310, `branches force-build`.
4. **Build**: build:146, the build `[force build]` site, `runs gate --branch`.
5. **Failure Paths**: `workflows handover --list-stray` at build:90 and debug:92, and the ship equivalent.
6. **Guard test**: `workflow-fence-syntax.test.ts` fails on any `git ` or `gh ` call inside a workflow bash fence, except a short named allow-list with a reason for each entry. This waits for #678, which removes debug's jq and `git diff` lines.

Tests per verb: plain and set-upstream push against a temp bare remote; fast-forward refusing a diverged branch; `force-build` with and without an open PR (stubbed `gh`), plus a re-run that is deduped; `--list-stray` on a dirty tree; the Step 8 route on each `outcome`.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Live: `/bkit-ship` of a small change on a throwaway issue. On its PR, run `branches force-build` and check that CI starts with the force-build path (the job log shows the marker was read from the title).
- Consumer CI files copied from bkit's template read the title the same way. Check the template copy and note in `CHANGELOG.md` if it differs.

#### Risks

- **Push and PR semantics in the engine.** A wrong flag here pushes the wrong branch. Each push verb prints what it pushed and where; integration tests use a real bare remote, not a stub.
- **Uncommitted work by other agents** in `worktrees.ts` and `workflows.md`: rebase onto it before slices 1 and 5.

No open questions remain for this issue.

**Implemented: all six slices** of the plan above, in commit `e3cb1a3f` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:

- typecheck, lint, format and prose checks pass.
- Unit tests: 5734 passed. The 2 that fail also fail on `dev` without this change.
- bats tests: 31 of 31 pass. Integration tests: 1553 of 1553 pass.
- `slop:delta`: unchanged from `dev`.
- `bkit check`: clean.

The guard test in `workflow-fence-syntax.test.ts` allows one raw git call: the bootstrap line that locates the `bkit` binary, since no verb can run before it.

Changes from the plan:

- **Ship Step 5.1 stops on a failed fetch.** Exit 10 now goes to the Failure Path.
- **Build's no-progress check and migrations scan look at committed diffs.** They compare commits (three-dot) instead of the working tree, which makes the migrations scan stricter.
- **Build's force-build runs after `prs open`.** That way the PR exists when its title is set.
- **Ship's Failure Path has no `--list-stray` step.** It saves only the run's record.
- **Two audit tests were narrowed, as a direct effect of removing raw calls.** `counter-prose-audit.test.ts` now checks `REVALIDATE_ATTEMPT` in place of `DEBUG_ATTEMPT`, whose jq line is gone. The shell-variable minimum in `block-locality-audit.test.ts` dropped from 10 to 5.
- **Corrected `.bkit/workflows.md`.** It said ship pushes before merge in two places; the code and its test have three: opening a missing PR, B2 and bookkeeping.

Live runs (a throwaway `/bkit-ship` and `branches force-build` on its PR) were not done.

## #656 — Test-first fixes: smaller tasks, reject late reds, no futile retries (closed)

### Problem

The build's test-first rule says every test a task names must be seen failing (a "red") before the task's code is written. On the #650 build (#650 — Run workflows from the prompt alone, without issue, design or plan — https://github.com/cbartens/bkit/issues/650) the rule failed in four ways:

- **Tasks are too big to do test-first.** Sub-plan 1 Task 11 named 20 tests across 6 files. The plan-execute agent hit its 200-turn cap at 3342s, out of the 3600s subagent limit, and wrote Task 11's code before its tests. None of the 20 could then be seen failing. The log doesn't record why it went code-first.
- **The plan can name a check that can never pass.** Task 2's `Test first` asked for `not.toHaveProperty("issueId", null)`, but `runs context` always prints `issueId: null` on that path (`runs.ts` L1770 / L1866). The build had to rewrite the check after its red, which the audit then flags as a gap.
- **The retry loop can't fix test order, but runs anyway.** Verify failed with the same 21 gaps four times. Gaps-remediate ran three times (STANDARD, PIVOT, FINAL), which cost about 50 minutes, and the run still ended on the Failure Path. Once code exists, no edit can make its tests have failed first.
- **The audit accepts reds recorded too late.** On the PIVOT attempt, gaps-remediate put the pre-feature source back, ran `bkit tests red` so each test failed, then restored the new code. `bkit tests green` accepted those reds and dropped 21 gaps. Only the verifier caught it, by reading timestamps and `parentSha` by hand. `.bkit/core/prompts/bkit-build-plan-execute.md:54` forbids this ("never undo code to force a red"), but `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` never mentions it.

There's also no approved way out. Even when a human accepts the test-order gap, the next run hits the same loop.

### Outcome

A plan's tasks are small enough to do test-first within the build's turn budget. A red only counts if it was recorded before the task's code. When test order is the only failure, the build stops straight away and says what a human has to decide, instead of retrying. A human can accept a test-order gap once, in writing, and the build honours it.

### Success criteria

1. **Task size:** a task may name at most 10 `Test first` tests across at most 3 test files. The bkit program counts both from the task line, counts tasks (more than 12 → split), lists every task over a cap, and writes the plan's `SINGLE | SPLIT` verdict itself. The `bkit-plan-complexity-check` agent is removed. `bkit-plan-complexity-split` still decides where to divide an over-cap task before build, working from the program's list.
2. **Achievable checks:** a `Test first` entry describes how the test fails ("fails on {what goes wrong}"), so the build can write a check that can actually pass. Plan review flags a named check the current code makes impossible to pass.
3. **No futile retries:** when every verify gap is a test-order gap (`no-red`, or a check rewritten after its red), the build takes the Failure Path right away, naming the human decision, with no gaps-remediate attempts.
4. **No late reds:** `bkit tests green` rejects a red whose `parentSha` comes from, or after, the commit that first holds that task's code.
5. **Swap-back named and banned:** `bkit-build-plan-gaps-remediate.md` says that no strategy may record a red by undoing or swapping out code.
6. **Recorded exception:** a human-approved exception, for example a row in `docs/decisions.jsonl` naming the FID, sub-plan, task and tests, clears those gaps in `bkit tests green`. Nothing else clears them.

### Constraints and non-goals

- Test-first stays mandatory. These changes make it achievable and honest. They never weaken it.
- **Exception writing:** agents NEVER write a test-order exception on their own; ONLY suggest one; write it ONLY after explicit human approval. Subagents can't reach the human, so in practice only the orchestrator writes it, after the human says yes in the session.
- Stack-agnostic, and works on every provider, like all shipped workflow and prompt changes.
- Not in scope: subagent turn caps themselves (#463 — Recalibrate subagent maxTurns 50/100/200/400, record cap hits — https://github.com/cbartens/bkit/issues/463).

### Decisions already made

- Filing this was approved by the owner on 2026-10-22. All six criteria are proposals still to be designed.
- The cap was set by the owner on 2026-10-23: 10 tests and 3 test files per task, counted by the bkit program, not an agent. The #650 evidence is in the comment of the same date.
- The owner agreed on 2026-10-23 that `/bkit-plan` Step 9 becomes engine-only: the program writes the complexity verdict, and the `bkit-plan-complexity-check` agent goes. Its verdict only ever rested on two counts (tasks over 12, tests per task over the cap). The gates and domain areas it also counted never changed the answer.
- Who may write the exception was settled by the owner on 2026-10-22: an agent writes it only after explicit human approval, worded like `.agents/rules.md` § Tracker issue creation. The same rule applies to #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657.

### Open questions

1. What cap on tests per task? **Answered 2026-10-23:** 10 tests across at most 3 test files.
2. Where does the cap live? **Answered 2026-10-23:** the bkit program counts it. The plan template and the plan-generate prompt state it, and no agent counts.
3. Exception format: a decision row, or a line in the plan? Is it per task or per test? (Who may write it is settled above.)
4. The audit also flagged 20 `test-changed` gaps that only added tests or reformatted imports. The verifier cleared them by hand on all four attempts. Should `bkit tests green` apply the "added tests / formatting" allowance itself? The plan template's Gate 2 already allows it (`docs/templates/bkit-plan.md:421`).

### References

- #650 — Run workflows from the prompt alone, without issue, design or plan — https://github.com/cbartens/bkit/issues/650 (handover: `docs/plans/202610/logs/650-workflows-prompt-alone/build-handover.md` on branch `feat/650-workflows-prompt-alone`)
- #463 — Recalibrate subagent maxTurns 50/100/200/400, record cap hits — https://github.com/cbartens/bkit/issues/463
- #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657
- `.bkit/core/docs/templates/bkit-plan.md` § Test first (L408)
- `.bkit/core/prompts/bkit-build-plan-execute.md` L54
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`
- `.bkit/core/prompts/bkit-plan-complexity-check.md`
- `.bkit/core/engine/commands/workflow/tests.ts` (`tests red` / `tests green`)
- `.bkit/core/workflows/bkit-build.md` § Step 7 (verify routing)
- `.agents/rules.md` § Tracker issue creation (wording model for the exception rule)
- `docs/failures.jsonl` key `tests-green-accepts-red-recorded-after-task-code`
- `.bkit/friction.jsonl` keys `gaps-remediate-pivot-forces-retroactive-reds`, `subagent-turn-budget-exhausted-before-final-report`

### Open questions answered by the owner (2026-10-22)

1. **Cap on tests per task:** 5 `Test first` tests per task. A task naming more is split before build.
2. **Where the cap lives:** both. The plan template states it (`.bkit/core/docs/templates/bkit-plan.md` § Test first), and `bkit-plan-complexity-check` catches any task over it and splits it.
3. **Exception format:** a line in the plan, next to the task it covers. Design requirement that follows from this: plan-update and gaps-remediate agents edit plan files, so the design must say how `bkit tests green` tells a human-recorded exception line from one an agent added or changed (criterion 6: "Nothing else clears them").
4. **Added tests / formatting allowance:** yes, `bkit tests green` applies it itself, limited to changes that only add lines (ignoring whitespace). Any change that deletes or edits a line stays a `test-changed` gap for the verifier. Works for any language, so no per-language parsing.

### What the code shows today

- `bkit tests green` (`.bkit/core/engine/commands/workflow/tests.ts` L603-815) checks only that a red exists, that the test file is byte-identical to the red's snapshot, and that the test passes now. It never compares when the red was recorded with when the task's code landed. That's why the PIVOT swap-back reds were accepted.
- `bkit-plan-complexity-check.md` doesn't mention `Test first`, and the plan template sets no per-task maximum.
- The test-changed check is a whole-file byte comparison, so adding one test to a file flags every planned test in that file. That's the source of the 20 `test-changed` gaps the verifier cleared by hand.

Next: `/bkit-design 656`.

### Work on dev — all six criteria (staged for review, not committed yet)

Owner's answers to the open questions: a cap of 5 tests per task, held in both the plan template and the complexity check; the exception written as a line in the plan; and `tests green` applying the added-lines allowance itself.

**1. Task size.** The plan template allows 1-5 `Test first` tests per task. `bkit-plan-complexity-check` returns `SPLIT` when any task names more than 5. `bkit-plan-complexity-split` first breaks each over-cap task into consecutive tasks of 5 or fewer, copying every entry unchanged, and then splits the plan into sub-plans as before.

**2. Checks that can pass.** A `Test first` entry now reads `fails on {what goes wrong}`. It describes the wrong behaviour, not an exact assertion. `bkit-plan-review-3` marks as CRITICAL any check the current code can never pass, and cites the `file:line` that rules it out.

**3. No pointless retries.** `bkit-build-plan-verify` writes a new header line, `Gaps: NONE | ORDER | OTHER`. `ORDER` means every gap still open is a test-order gap: `no-red`, `late-red`, `red-mismatch`, `red-evidence-missing` or `test-changed`. In that case build Step 7 goes straight to the Failure Path and names the decision the human has to make. Gaps-remediate never runs.

**4. No late reds.** `bkit tests green` finds the first plan-execute commit whose log says `DONE — Task N`. A red recorded on that commit or any later one is now reported as a new gap, `late-red`. That catches the #650 trick, where old source was swapped back in to record reds. One case it can't catch: a red recorded inside plan-execute after the code is written. Plan-execute commits nothing until its step ends, so there's no commit to compare against. The prompts forbid that case instead.

**5. Swapping code back is banned.** `bkit-build-plan-gaps-remediate.md` says that no strategy may record a red by undoing or swapping out code. A test-order gap is marked `BLOCKED`. The execute, verify and remediate prompts all say never to touch an exception line.

**6. Recorded exception.** A human adds `**Test-order exception:**` as the last line of a task in the plan, naming the tests, and commits it. `tests green` honours the line only if it is committed and the commit that last changed it doesn't touch the run's `status.jsonl`. Every workflow step commit writes that file, so a line an agent added is always refused. When honoured, the line clears only the test-order gaps for the tests it names, and never a failing test. The report shows whether each exception was honoured, and if not, why. On a re-run, plan-execute skips the red for tests the line names, so the build gets as far as the audit instead of stopping on `passed`.

**Added lines only.** If the only change to a test file since its red is added lines (whitespace ignored), `tests green` no longer counts it as `test-changed`. The diff still goes in the report.

**Checks run.** Full `pnpm vitest run`: 6515 tests passed across 180 files (unit and integration). `bkit check` passed. Dogfood with the packed tarball in a clean scratch repo: an exception that wasn't committed was refused; one last changed by a step commit was refused, naming the commit; one in a human commit was honoured and cleared `no-red`.

**Docs and ledger.** `.bkit/workflows.md` § Test-first, `.bkit/prompts.md`, `.bkit/trackers.md`. `docs/failures.jsonl` key `tests-green-accepts-red-recorded-after-task-code` is closed.

Heads-up from #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657.

#657 adds one "pause" for anything only a human can decide. The build asks in the session with a recommendation. On a yes, it records the decision and carries on. When nobody is there to answer, it stops but stays in progress. #657 will switch this issue's test-order Failure Path (Step 7 sub-step 13) over to that pause once this issue is committed. Nothing here needs to change for that.

One overlap to settle: here a human commits the "Test-order exception" line, and the prompts forbid agents from writing it. Under #657, the orchestrator records the acceptance after the human's in-session yes. #657 tracks this as its open question 1.

Owner decision on 2026-10-22: the rule "agents never write the exception themselves; only a human records it" is replaced. The new rule: agents NEVER write a test-order exception on their own; ONLY suggest one; write it ONLY after explicit human approval. It's worded like `.agents/rules.md` § Tracker issue creation.

In practice this changes little for the prompts already written here. Subagents can't reach the human, so their "never write or edit a Test-order exception line" rule stands. The change is that the orchestrator may now write the exception after the human says yes in the session, instead of the human having to write and commit it themselves. The Constraints and Decisions sections in the body are updated, and open question 3 now covers only the format. #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657 carries the same rule.

### Committed on dev: bc7b7d96 (not pushed yet)

All six success criteria shipped, as described in the earlier comment. A review before committing found four weak spots, fixed in the same commit:

**1. "Added lines only" could hide a gutted test.** `bkit tests green` treats a test file that only gained lines since its red as unchanged. But a line added _inside_ the named test, such as an early `return;` or a new mock in a `beforeEach`, weakens the test without editing any existing line. Before this fix the verifier no longer read those diffs. Now `bkit-build-plan-verify` reads every diff whose row says `added lines only`. A line added inside a planned test, or in setup it runs, is a `test-changed` gap (not fixable, so it counts toward `ORDER`). Lines added outside every planned test are still fine.

**2. The stop message didn't say where to commit the exception.** Build Step 7 sub-step 13 now names the plan file `tests green` actually audited, the worktree, and the branch the build runs on. It also lists each task and test. The verifier writes them in its `Identified Gaps Log` as `Task N: {test file} {test name} — {kind}` when `Gaps` = `ORDER`. The worktree and branch survive the stop, and a re-run resumes on them, so the exception goes on that branch (`feat/{FID}` when the build has its own worktree), not in a separate dev commit.

**3. "Agent-added lines are always refused" overstated it.** The check refuses a line that rides a workflow step commit. It can't tell a human commit from an agent that broke the "no `git commit`" rule and committed the plan alone. `.bkit/workflows.md` § Test-first now says so.

**4. The late-red check could skip a task silently.** If `tests green` can't find the commit where a task's code landed (for example, the execute log wrote `- DONE — Task 3` instead of `DONE — Task 3`), it used to skip the check and say nothing. Now the report gets a `Late-red check` section naming each unchecked task, the JSON output lists them in `lateRedUnchecked`, and the verifier copies them into its `Notes`. This isn't a gap. It just makes the blind spot visible.

**Checks run:** full `pnpm vitest run` passed (6516 tests, 180 files), including a new test for the unchecked-task report. Also passed: `pnpm typecheck`, `bkit check`, `bkit:check:dist`, and the pre-commit hooks.

**Relation to #657:** this issue's stop is still the Failure Path. #657 will turn it into a pause. The stop message here already carries what that pause needs to show the human.

**Housekeeping:** the `docs/failures.jsonl` row `tests-green-accepts-red-recorded-after-task-code` (CLOSED) reached dev earlier, in #650's pre-worktree commit `1cefb122`, not in this commit.

### Reopened to fine-tune the task cap (owner, 2026-10-23)

**Decided: the bkit program counts the tests, not an agent.** Today two agents enforce the cap: `bkit-plan-complexity-check` returns SPLIT when a task names more than 5 tests (`.bkit/core/prompts/bkit-plan-complexity-check.md:42`), and `bkit-plan-complexity-split` breaks the task up (`.bkit/core/prompts/bkit-plan-complexity-split.md:41`). Counting the `;`-separated entries on a task line is a counting job with one right answer. The engine already parses task lines (`TASK_LINE` in `.bkit/core/engine/commands/workflow/tests.ts`), so it can count them and list each task over the cap. The complexity check then drops that rule. Choosing where to divide a task stays with the split agent, because that is a judgement call.

This is the same kind of plan-time check as #660's fix 3 (#660 — Test-first audit silently skips plans that write "Task N —" — https://github.com/cbartens/bkit/issues/660). Build both in one pass, so a plan is read and checked once.

**Open: should the cap be 10 instead of 5?** Tests per task in the #650 and #651 plans. Both were written before the cap existed, which makes them the only uncapped evidence:

<!-- prettier-ignore -->
| Plan | Task | Tests | Test files | Test-first outcome |
| --- | --- | --- | --- | --- |
| 650 sub-plan 1 | 4 | 8 | 4 | fine |
| 650 sub-plan 1 | 12 | 12 | 3 | fine |
| 650 sub-plan 1 | **11** | **20** | **6** | **code written first; all 20 had no red** |
| 650 sub-plan 2 | 8 | 9 | 1 | fine |
| 650 sub-plan 2 | 14 | 8 | 2 | fine |
| 651 | 2, 3, 6, 8 | 13, 14, 8, 7 | 0–2 | build outcome not checked |

"Fine" means none of that task's tests appear in the test-order gaps in `build-plan-verify-1-2.md` or `build-handover.md`. The other #650 failure, on Task 2, came from a rewritten assertion on a 3-test task, so task size wasn't the cause.

So on #650, tasks with 8, 9 and 12 tests all went test-first. Only the 20-test task across 6 files broke, and the cause there was the plan-execute agent hitting its 200-turn cap. That supports 10. It's one run, though, and I haven't checked the #651 build.

Recommendation: a cap of 10, counted by the engine. Then rerun #664's measurement on the next plan to see how often the cap still forces a split.

**Decided by the owner, 2026-10-23: the cap is 10 tests and 3 test files per task, and the bkit program counts both.** Success criterion 1 and open questions 1–2 in the body are updated to match.

What this means for the work:

- The engine reads each task's `Test first` line, counts the tests and the distinct test files, and lists every task over either cap. It does this in the same plan-time pass as #660's check of the task-line format (#660 — Test-first audit silently skips plans that write "Task N —" — https://github.com/cbartens/bkit/issues/660).
- `bkit-plan-complexity-check` stops counting tests. `bkit-plan-complexity-split` still divides an over-cap task. It gets the engine's list of which tasks are over and why.
- Every place that says 5 changes to 10 tests and 3 files: `.bkit/core/docs/templates/bkit-plan.md:408`, `.bkit/core/.bkit/trackers.md:107`, `.bkit/core/prompts/bkit-plan-complexity-check.md:42`, `.bkit/core/prompts/bkit-plan-complexity-split.md:41` and `:60`, plus their host copies and this repo's adopted copies.

**What the file cap would have split on #650:** Task 11 (20 tests, 6 files) and Task 4 (8 tests, 4 files). Task 4 went test-first without trouble, so the 3-file cap is the tighter of the two limits. If it forces splits that turn out to be needless, #664's measurement will show it.

#667's body is also corrected. It said the cap was already checked in `tests.ts`, but it isn't. Today agents check it.

### Review of the reopened work, 2026-10-23: suggestions only, no code yet

**Still to do on dev (`32289700`):** none of the 2026-10-23 cap decision is built. Everything still says 5, and an agent still does the counting:

- `.bkit/core/prompts/bkit-plan-complexity-check.md:41-42`: SPLIT when any task names more than 5
- `.bkit/core/prompts/bkit-plan-complexity-split.md:41`, plus its self-check at `:53` (the earlier comment said `:60`)
- `.bkit/core/docs/templates/bkit-plan.md:408`: "1-5 tests"
- `.bkit/core/.bkit/trackers.md:109` (the earlier comment said `:107`)
- `.bkit/core/.bkit/workflows.md:879` (Step 9 row) and `:1487` (§ Test-first). Neither is in the earlier comment's list.
- the host copies and this repo's adopted copies, refreshed by `bkit install`

### Suggested shape

1. **One engine verb, shared with #660** (#660 — Test-first audit silently skips plans that write "Task N —" — https://github.com/cbartens/bkit/issues/660). `bkit tests plan-check --plan=<file>... --log=<out.md>` reads the plan with the same `readTestFirst` that `tests green` uses. It writes one row per task: tests named, distinct test files, and whether it's over the cap and on which limit. Exit 0 when no task is over, 1 when any is. A test is a `;`-separated entry with a file and a name. Files are counted after the `path.posix.normalize` the audit already applies (`tests.ts:240`), so `./a.test.ts` and `a.test.ts` count as one file. An `n/a` task counts 0. Keep 10 and 3 as named constants next to `TASK_LINE`, and add a wording test asserting the template states the same two numbers. That way the engine and the docs can't drift apart.
2. **Wire it into `/bkit-plan` Step 9.** The orchestrator runs `plan-check` on `plan-v3-checked.md` before `@bkit-plan-complexity-check` and passes the log in as a Read input. The agent's rule becomes "more than 12 tasks, or the plan-check log lists a task over the cap". The agent could still ignore the log and answer SINGLE, so I'd also have the orchestrator set `COMPLEXITY_VERDICT` = SPLIT whenever `plan-check` exits 1, whatever the agent says. That's one line in the workflow, and it takes the agent out of the cap decision completely.
3. **Give split the list, then have the engine check its work.** Pass the same log to `@bkit-plan-complexity-split` so it knows which tasks to divide and why. Replace its own "confirm each task names <= 5" self-check (`bkit-plan-complexity-split.md:53`) with the orchestrator running `plan-check` on each `plan-v4-N.md` after the step. If a task is still over the cap, re-ask split once, then go to the Failure Path. Without this, a split that miscounts goes straight to build, which is how #650 failed.
4. **The file cap changes how split has to divide.** Take a task with 6 tests across 4 files. It's under the test cap and over the file cap, so "split into consecutive tasks of 10 or fewer" leaves it unchanged. The split prompt needs "divide so each new task names at most 10 tests across at most 3 test files, grouping entries by test file". Without that sentence, split keeps the original order and can still produce a 4-file task.
5. **No over-cap check at build time.** Should `tests green` also flag an over-cap task? I'd say no: by build time the turn budget is already spent, and the plan-time check covers it. I'm raising it so it's recorded as a decision, not missed by accident.

**Order:** #660's reader fix first, because the plan-time count is only as good as the reader. Then the verb, then the prompt and doc edits. One commit can cover both issues, since they share the verb and its tests.

### Open for the owner

1. Should the orchestrator override `COMPLEXITY_VERDICT` from `plan-check`'s exit code (point 2)? I recommend yes.
2. The verb's home: `tests plan-check`, or somewhere under `steps` / `workflows`? I recommend keeping it on `tests`, next to the reader it shares.

### Sharper recommendation for Step 9: the engine decides, and the complexity-check agent goes

Reading `.bkit/core/prompts/bkit-plan-complexity-check.md` again: its verdict (`:41-42`) depends on only two things, task count over 12 and tests per task over the cap. Both are counts. The agent also counts gates and domain areas (`:40`), but neither changes the verdict. They only show up in its write-up.

So once the engine counts tests and files per task, it can count tasks too, and the agent has no decision left to make. The earlier suggestion had the orchestrator override the agent's verdict with the engine's exit code. Simpler: **Step 9 becomes engine-only.** `bkit tests plan-check` writes the counts table and a `Verdict: SINGLE | SPLIT` header, and `steps finish` records it as `COMPLEXITY_VERDICT`, as it does today. One subagent call less per plan, and no way for a verdict to disagree with the counts.

The judgement stays with `@bkit-plan-complexity-split`: where to divide, how to group by domain. It reads the engine's table to know which tasks are over and on which limit.

If the owner wants to keep the agent for its write-up (domain groupings, session-fit notes), the fallback is the earlier one: the agent writes the rationale, and the engine's exit code sets the verdict.

### Owner agreed, 2026-10-23: Step 9 is engine-only, and the complexity-check agent is removed

The body's success criterion 1 and Decisions are updated to match.

**What removing the agent touches.** Found by searching dev at `32289700`. All of these are in scope:

- **The prompt and its host copies:** `.bkit/core/prompts/bkit-plan-complexity-check.md`, `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`, `.codex/agents/*.toml`, `.agents/plugins/bkit/agents/`.
- **Step 9 in the plan workflow:** `.bkit/core/workflows/bkit-plan.md`, plus its rendered copies (`.claude/commands/bkit-plan.md`, `.cursor/…`, `.opencode/…`, `.agents/skills/bkit-plan/SKILL.md`, the plugin skill) and the render snapshot `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`.
- **Engine:** `steps finish --agent=bkit-plan-complexity-check` reads the agent's verdict (`.bkit/core/engine/commands/workflow/steps.ts`). Step 9 instead records the engine's verdict on the same `plan-complexity-check` status row, so the row name and `COMPLEXITY_VERDICT` stay as they are for Step 10 and for anything that reads status files. `.bkit/core/engine/commands/analysis.ts:7` and `:135` describe their output as feeding plan-complexity-check, so that wording changes. `workflow-shape.test.ts` and `steps.test.ts` change with it.
- **Docs:** `.bkit/core/.bkit/workflows.md` (Step 9 row at `:879`), `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/pipeline.md`, and the adopted copies under `.bkit/`.
- **Stats script:** `scripts/stats/bkit-chat-stats.mjs:1056` and `:2328` read `plan-complexity-check.md` for the verdict and quote "the complexity check's own reason". If the engine writes its report to the same file name, with a `Verdict:` header and a one-line reason, the script keeps working. Otherwise it changes too, together with `.bkit/templates/scripts/stats/`, which must stay byte-identical.

**Consumers.** bkit is public, so every consumer repo already holds the agent's host files. I haven't checked whether `bkit upgrade` deletes an agent file that bkit no longer ships. If it doesn't, this needs a small migration that removes the five host copies, registered in `docs/migrations.md`. Check that before planning, because it decides whether the migration is part of the work.

## Work done (staged on `dev`, not committed yet)

This finishes the reopened work: the 10-test / 3-file cap, counted by the engine, and the `bkit-plan-complexity-check` agent removed. With it, all six success criteria are met and nothing is deferred.

**What changed**

- **New command `bkit tests plan-check`.** It counts each plan's tasks, and each task's planned tests and distinct test files. The limits are 12 tasks per plan, 10 tests per task and 3 test files per task (`MAX_TASKS_PER_PLAN`, `MAX_TESTS_PER_TASK`, `MAX_TEST_FILES_PER_TASK` in `tests.ts`). Any limit broken → SPLIT, otherwise SINGLE. It writes `plan-complexity-check.md`. That file keeps the `Verdict:` line and the `## Session Fit Estimate` paragraph, so `scripts/stats/bkit-chat-stats.mjs` reads it unchanged.
- **Plan Step 9** runs the command instead of an agent. It records the verdict with `steps finish --verdict={COMPLEXITY_VERDICT} --allowed=SINGLE,SPLIT`.
- **Plan Step 10:** `@bkit-plan-complexity-split` now splits any task with more than 10 tests or more than 3 test files, grouped by test file. Then `tests plan-check --children` checks every `plan-v4-N.md`. If a part still breaks a limit, the split agent is asked once more with the check's report; still failing → Failure Path.
- **Removed** `.bkit/core/prompts/bkit-plan-complexity-check.md`, and every mention of it in `.bkit/prompts.md`, `.bkit/pipeline.md`, `.bkit/workflows.md` and `.bkit/wording.md`. `bkit upgrade` deleted its copies in `.claude/`, `.cursor/`, `.opencode/`, `.codex/` and `.agents/`. Projects using bkit get the same clean-up automatically, so no migration is needed.
- **New limits written down** in the plan template, `.bkit/trackers.md` and `.bkit/workflows.md` § Test-first: 1-10 tests across at most 3 test files per task.

**Where each success criterion stands.** Re-checked against dev today:

<!-- prettier-ignore -->
| # | Criterion | Where it is |
| --- | --- | --- |
| 1 | Task size | This change. |
| 2 | Checks that can pass | Shipped in `bc7b7d96`: `Test first` reads `fails on {what goes wrong}`, and `bkit-plan-review-3` marks a check the current code can never pass as CRITICAL. |
| 3 | No futile retries | Shipped in `bc7b7d96`. Since #657, test-order gaps are `Fixable: false`. When nothing fixable is left, build Step 7 sub-step 13 goes straight to the Decision Pause with no gaps-remediate round. |
| 4 | No late reds | Shipped in `bc7b7d96`: `tests green` reports a red recorded on or after the task's code commit as `late-red`. |
| 5 | Swapping code back is banned | Shipped in `bc7b7d96`: `bkit-build-plan-gaps-remediate.md` says no strategy may record a red by undoing or swapping out code. |
| 6 | Recorded exception | Shipped in `bc7b7d96`: a `**Test-order exception:**` line, written only after the human approves in the Decision Pause and committed on its own. |

Open question 4 (the added-lines allowance) also shipped in `bc7b7d96`.

**Wording pass.** I checked the new prompt and workflow lines against the writing rules in `.bkit/prompts.md` and `.bkit/workflows.md`, and against the compress-markdown guidance:

- they reuse existing phrasing patterns ("→ **Failure Path** naming …", "a second exit 1 → **Failure Path**");
- no explanations or file references inside workflow steps;
- the split prompt states the limits itself, so it works outside a workflow too.

**Verified:** full test suite passes (6,829 tests), and `bkit check`, the typecheck and the `dist/` freshness check are clean.

Reason recorded in `docs/decisions.jsonl` under key `656-660-engine-counts-plan-test-first`. Related: #660.

### Follow-up (staged on `dev`, not committed yet): complexity check merged into the split step

Owner's review of the plan steps: a step that only counts is really the condition for the split, and loose `Test first` lines should be fixed where `@bkit-plan-update` already runs. `/bkit-plan` now has 11 steps instead of 12.

- **Step 4 (Fetch Context)** also runs `bkit tests plan-check` on `plan-v1-draft.md` and writes `plan-draft-check.md`. Its `Unread` section quotes each `Test first` line that sits outside every task bullet. Finding some is not a failure at this step.
- **Step 6 (Apply Review):** `@bkit-plan-update` reads `plan-draft-check.md` along with the three reviews. It treats each `Unread` line as a CRITICAL finding and moves the line onto its task bullet.
- **Step 9 is now "Complexity Split"**, the old Steps 9 and 10 combined:
  - The engine counts `plan-v3-checked.md` and records SINGLE or SPLIT on the unchanged `plan-complexity-check` status row. SINGLE skips to the summary.
  - A loose line still present here means Step 6 or Step 8 wrote it, so the run goes to the Failure Path. No agent is called to repair it.
  - On SPLIT, the split agent runs, then `plan-check --children` checks the sub-plans, as before.
- **Steps renumbered:** Summary moves to Step 10 and Close Workflow to Step 11. Updated in the step comments, `.bkit/workflows.md`, `.bkit/pipeline.md` and the render snapshot.
- **Step 8 (Apply Scope) stays**, because it applies the scope-check findings.
- **What still works unchanged:** status row names and the `plan-complexity-check.md` file name are the same, so `scripts/stats/bkit-chat-stats.mjs` and any reader of status files keep working.
- **One visible change on the tracker:** a SINGLE plan posts no comment for Step 9, the same as a skipped split did before.

**Verified:** full suite passes (6,835 tests), and `bkit check` and the `dist/` check are clean. Decision row `656-660-engine-counts-plan-test-first` updated.

## #626 — No-plan build: enforce test-first when the issue carries plan-shaped tasks (closed)

### Problem

`/bkit-build` with no plan (`--plan-source=brief`, also `lite:build`) treats test-first as telemetry only. Tests are written first, but no red run is recorded, `tests green` reports Enforced false, and a missing **Done when** is not a FAIL. The well-defined change issue form now asks for exactly the lines the plan path enforces: `- [ ] **Task N:** ... **Done when:** ... **Test first:** ...`. When the issue carries them, the build could check them the way it checks a plan.

### Outcome

A person writes a well-defined change issue with Tasks in the plan's shape, runs `/bkit-build #N` with no plan, and the build proves each **Test first** test failed before its code existed, the same as a planned build.

### Success criteria

- Issue Tasks in the exact shape → test-first enforced: red recorded per task, `tests green` Enforced true.
- Issue without that shape → behaviour unchanged (telemetry only).

### Constraints and non-goals

- Nothing ticks boxes in the issue.
- The parser stays the plan's (`.bkit/core/engine` test-first `TASK_LINE` regex and the literal `**Test first:**`); the issue is read through `bkit issues text`.

### Open questions

- Should a missing **Done when** on an issue task be a FAIL, or a warning?

### References

Related: #339 — Github issue templates (https://github.com/cbartens/bkit/issues/339)
Docs: `.bkit/trackers.md` § Issue shapes (change shape syntax)

## Agreed approach

**What's actually missing.** `/bkit-build` with no plan does run the tests. What it can't do is _prove test-first_: that each test failed before its code was written. That check (`bkit tests green`) reads `**Task N:** … **Test first:**` lines, but only from a plan file. With no plan it reported "no plan file — the build runs from its brief" and checked nothing. Meanwhile a change issue written in the form's shape carries exactly those lines.

**The fix.**

- `bkit tests green` gains `--brief=<file>`. It is used only when no `--plan` file exists. If the brief (the build input) has Task lines with `Test first`, they are audited exactly like a plan's: a named test that never failed before its code is a FAIL.
- Build Step 7.6 passes `--brief=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`.
- The execute agent works the issue's `**Task N:**` lines by number when they are there, and otherwise builds the requested outcomes as before. Verify judges each task by its `Done when` where one is written.
- A brief with no Task lines is still built and still not checked. A missing `Done when` is not a FAIL. `lite:build` checks neither.
- The change form's intro, `.bkit/trackers.md`, `.bkit/templates.md`, `.bkit/README.md` and `.bkit/prompts.md` now say this.

Related: #339 — Github issue templates (https://github.com/cbartens/bkit/issues/339)

Done in f26e8c04 on `dev` (local, not pushed yet).

**What changed.** When a build has no plan file and the build input carries `- [ ] **Task N:**` lines with `**Test first:**`, the build now proves test-first for those Tasks, the same as with a plan: each named test must have failed before its code existed, or the step is a FAIL.

- `bkit tests green` gains `--brief=<file>`, read only when no `--plan` file exists. `/bkit-build` Step 7.6 passes `--brief=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`.
- `bkit-build-plan-execute`: with no plan, it works the issue's `**Task N:**` lines by number (so the red-test records line up with what `tests green` checks). A brief without Task lines still builds from its listed outcomes and is not checked.
- `bkit-build-plan-verify`: same task source; a missing `Done when` is not a FAIL; it never creates or ticks a plan file.
- `lite:build` checks neither. The change form now says so: "builds from this issue too but checks nothing: no failing-test proof, gates, PR or CI."
- Tests in `tests.test.ts` cover the brief path, a brief with no Task lines, and `--plan` taking precedence.

Full suite: 5879 of 5879 tests pass; `bkit check` is clean.

## #635 — Add revert-the-fix, CI skips and child clocks to bkit-audit-testing (closed)

### Narrative

The 2026-10-17 testing run on bkit (`docs/audits/202610/testing.md`, at `5f5a097c`) found three places where following `bkit-audit-testing` exactly would give a false all-clear. All three gaps are still in the canonical template at `HEAD` (`.bkit/core/docs/templates/bkit-audit-testing.md`):

1. **"A test exists" was not proof the fix is guarded (`audit-improvements-31`).** Step 3's failures-ledger row (`:113`) says "each fixed row needs test red if fix reverted" but gives no way to check it. The run first read the test names and concluded the closed `HIGH` `antigravity-hook-commands-wrong-cwd` was covered. It then reverted the fix as a hand mutant (M23, `.bkit/shared/.agents/plugins/bkit/hooks.json:9`), and all 5624 tests stayed green: no test ran the hook command from the directory the host runs it in. That became `testing-2`, since closed (`docs/failures.jsonl` key `audit-testing-antigravity-hook-command-cwd-untested`). A run that only reads test names reports this row as guarded.
2. **Local skip counts hid CI skips (`audit-improvements-32`).** Step 9 (`:153`) asks for env-dependent skips but not where to count them. Locally 0 tests skipped. On CI run `39022562685`, unit reported "4438 passed | 2 skipped" and integration "1178 passed | 6 skipped". 8 tests (zsh and actionlint checks) never run on CI at all (`testing-6`). A run that counts locally reports "no skips". `grep -i -E 'CI (runner )?log|runner log|on CI'` over the template → 0 hits.
3. **Pinning the clock left subprocesses on the real clock (`audit-improvements-33`).** Step 10 (`:154`) pins the clock with e.g. `vi.setSystemTime` / Playwright `page.clock`, which fakes time only inside the test process. The run pinned 15 date-touching suites, and their child `git` / `node` processes kept the real clock (report § Time, "Pin limit"). This repo has 32 unit-named files that spawn subprocesses (`testing-8`). The run reported the date tests as pinned when only the in-process half was. `TZ` is different: Step 10 already sets it on the process before workers spawn, and child processes inherit it. `subprocess|GIT_AUTHOR_DATE|faketime` → 0 hits.

This issue adds one sentence to each of Step 3, Step 9 and Step 10, with tools named only as examples.

### Success Criteria

- Step 3 tells a run to check each fixed `HIGH` / `CRITICAL` failures-ledger row by reverting the fix as a Step 6 hand mutant, and says a test named for the row is not proof.
- Step 9 tells a run to read skip counts per file from the CI runner log as well as local runs.
- Step 10 says a clock pin covers in-process time only, names how to set a child process's clock, and sends an unpinned subprocess half to `Not Checked`.
- The installed copy `docs/templates/bkit-audit-testing.md` matches the canonical template, and `.bkit/core/engine/audits/templates/templates.test.ts` and `.bkit/core/engine/tools/wording.test.ts` pass.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Fixed row's `references` name an issue and a file but no commit (e.g. key `antigravity-hook-commands-wrong-cwd`: `#550`, `hooks.json`) | Find the fix by `git log -S` / `--grep` on the key or file; none found → that row `Not Checked` |
| Fix cannot be reverted locally (applied migration, remote setting, vendor dashboard) | Row `Not Checked` with the reason; never "guarded" |
| Revert conflicts with later edits | Hand-revert only the fixed behaviour; restore the tree per the template Rules (`:23`) |
| Fixed `MEDIUM` / `LOW` rows | Not required; the revert check is for `HIGH` / `CRITICAL` only, to bound cost |
| No CI, or the CI log has expired | Local counts only; CI half → `Not Checked` |
| Runner prints totals, not per-file skips | Use a per-file reporter (e.g. verbose or JUnit output); otherwise totals plus `Not Checked` per file |
| Suite spawns no subprocess | New Step 10 sentence does not apply; nothing to record |
| Child clock cannot be set (binary ignores env, no faketime on the host) | Subprocess half → `Not Checked`; in-process result still recorded |
| New sentence is 80%+ similar to a shared clause | `wording.test.ts` flags a near-copy; reword it locally. Never add a clause: one template is below the 5-template threshold (`.bkit/wording.md:10`) |
| `pnpm bkit upgrade` in a dirty tree rewrites other managed files too | Stage and commit only the two `bkit-audit-testing.md` files |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Installed copy's managed block equals the canonical one except for the version stamp | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` |
| New sentences are local: no near-copy of a shared clause, no unlisted shared sentence, in either copy | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| Neither copy carries a leaked host path | Unit | `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` |

No new test. The changes are prose, and a test asserting the new sentences exist would only pin the wording.

### Tasks

- [ ] **Task 1:** Step 3 failures-ledger bullet (`.bkit/core/docs/templates/bkit-audit-testing.md:113`), after "(each fixed row needs test red if fix reverted).", add: "Check it per fixed `HIGH` / `CRITICAL` row by reverting the fix as a Step 6 hand mutant; a test named for the row is not proof." **Done when:** `grep -n "reverting the fix" .bkit/core/docs/templates/bkit-audit-testing.md` hits line 113. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 2:** Step 9 (`:153`), after "env-dependent skips.", add: "Skip counts per file from the CI runner log too (e.g. the job log's `N skipped` lines), not only local runs; a tool missing on the runner skips there only." **Done when:** `grep -n "CI runner log" .bkit/core/docs/templates/bkit-audit-testing.md` hits Step 9. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 3:** Step 10 (`:154`), after "throwaway setup removed after.", add: "A clock pin covers in-process time only: suites spawning subprocesses (e.g. `git`, `node`) need the child's clock set too (e.g. `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`, a faketime wrapper), else the subprocess half → `Not Checked`." **Done when:** `grep -n "in-process time only" .bkit/core/docs/templates/bkit-audit-testing.md` hits Step 10. **Test first:** n/a — template wording only; no test asserts step text.
- [ ] **Task 4:** Apply `.bkit/core/prompts/bkit-utility-compress-markdown.md` Process rules to the three new sentences (`.agents/rules.md` § Prose edits), then refresh the installed copy with `pnpm bkit upgrade`. Check `git config core.bare` reads `false`, and stage only `.bkit/core/docs/templates/bkit-audit-testing.md` and `docs/templates/bkit-audit-testing.md` (its `## Project Instructions` stay untouched). **Done when:** `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/tools/wording.test.ts .bkit/core/engine/audits/templates/template-no-userpath.test.ts` passes; `pnpm lint:prose` and `pnpm format:check` pass. **Test first:** `.bkit/core/engine/audits/templates/templates.test.ts` `%s dogfood managed block differs only by the managed-version stamp` fails for `docs/templates/bkit-audit-testing.md` on the `upToEnd(dogfood)` `toBe` assertion after Tasks 1-3 and before the upgrade.
- [ ] **Task 5:** Add one `CHANGELOG.md` `## [Unreleased]` `### Changed` bullet for the three testing-audit checks, next to the existing "The testing audit looks for test linters…" entry. **Done when:** `grep -n "revert" CHANGELOG.md` hits the `[Unreleased]` block. **Test first:** n/a — release notes only.

### Open Questions & Assumptions

- **This repo's own `Project Instructions`** (`docs/templates/bkit-audit-testing.md`, below `bkit:end`) already say "check each by a revert-the-fix mutant" (Step 3), give the CI-log skip command (Step 9) and give the `mergeConfig` clock-pin procedure (Step 10). Options: (a) leave them, (b) prune the generic half now in the template. Recommend (a): they hold the repo's exact commands, and the next `@bkit-audit-generate` run refines them. Default (a).
- **Should Step 6 also name the Step 3 revert mutants?** Step 6 (`:132`) already says "break by hand, run test, watch red, restore" for code the tool cannot reach, and Task 1 points at Step 6 by name. Recommend no Step 6 edit. Default: none.
- **Assumption:** `lite:build` fits. `.bkit/lite.md` § When to use bars schema, public API, dependencies, secrets / config, auth / security and large refactors; this is prose in one shipped template. Because lite skips CI, run Task 4's tests locally before pushing.

### Breaking Changes & Naming

None. No step is renamed, renumbered or removed; consumers get the new text on their next `bkit upgrade`, below-`bkit:end` content untouched.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Gitignored inputs missing in a throwaway mutation worktree (Step 6) | Shared wording across templates | `audit-improvements-45`, Suggested Issues row 5 of `docs/audits/202610/audit-improvements.md` |
| Host shell traps (zsh word-splitting, unmatched globs) | One shared rule for every audit | `audit-improvements-44`, Suggested Issues row 2 |
| Separate lane and count for shipped copy-and-own test files (Step 9) | `ALREADY IN` (`:153` "Every test file has a lane"); the separate count is this repo's layout | `audit-improvements-51`; this repo's `Project Instructions` |
| "Registration-only hook test" as a new Step 7 shape | Seen once; watch item | `audit-improvements-52` |
| Product findings `testing-1` … `testing-14` (e.g. the 8 CI-skipped tests) | About bkit's tests, not the template | `docs/audits/202610/testing.md` § Suggested Issues |

### References

**Audit reports:** docs/audits/202610/audit-improvements.md (findings audit-improvements-31, audit-improvements-32, audit-improvements-33)

- Source run: `docs/audits/202610/testing.md` § Process Improvements (`Universal`, bullets 1, 2, 4); § Scores (M23); § Runs (env-dependent skips); § Time ("Pin limit").
- Canonical template: `.bkit/core/docs/templates/bkit-audit-testing.md` Rules `:23`, Step 3 `:113`, Step 6 `:122-132`, Step 9 `:153`, Step 10 `:154`. Installed copy: `docs/templates/bkit-audit-testing.md` (same line numbers).
- Ledger rows: `docs/failures.jsonl` key `antigravity-hook-commands-wrong-cwd`; `docs/failures.jsonl` key `audit-testing-antigravity-hook-command-cwd-untested`.
- `.bkit/wording.md` § Format (near-copy rule), `.bkit/trackers.md` § Issue shapes, `.bkit/lite.md` § When to use.
- Related: #480 — Testing audit; #627 — Audit improvements.

Landed on `dev` in 8a1dbd56 (not pushed yet). Canonical template and bkit's own copy under `docs/templates/` both updated; the issue's line numbers had drifted 1 to 2 lines, so every edit uses the lines at HEAD.

`bkit-audit-testing` now:

- **Step 3:** checks each fixed `HIGH` / `CRITICAL` failures-ledger row by reverting the fix as a hand mutant. A test named after the row is not proof. A fix that can't be found or reverted locally → `Not Checked` with the reason.
- **Step 9:** reads per-file skip counts from the CI runner log too, because a tool missing on the runner skips only there.
- **Step 10:** a clock pin fakes time only inside the test process. Suites that spawn subprocesses set the child's clock too, or that half is `Not Checked`.

Tests: wording, templates, prompt-notation, shipped-docs-refs and dogfood parity pass; `bkit check` exits 0.

## #699 — Engine run completeness check + auto friction/failure on errors (open)

### Problem

bkit does not verify, at the end of a workflow run, that every engine command the workflow requires actually ran; it does not check the previous run when a workflow starts; and engine errors/warnings are never recorded to `.bkit/friction.jsonl` or `docs/failures.jsonl`. A holey run, or silent engine friction, is therefore invisible unless a human or CI catches it.

Current state (from an engine read-through, 2026-10-26):

- **End-of-run completeness** exists only as `.bkit/core/engine/checks/status-holes.ts` — **advisory / fail-open** (the CLI always exits 0), **ship-only**, CI-only (`.github/workflows/bkit-ci.yml` → `pnpm bkit:audit:status || true`), and it compares recorded **steps** (not engine commands) against a set derived at runtime from `bkit-ship.md`. No equivalent for design / plan / build / debug.
- **Start of the next workflow** — `bkit workflows start` resumes an `IN_PROGRESS` run (`resumed` / `lastDoneStep`); `bkit status resume` names where to continue; stale/orphaned locks are reclaimed (`finished` | `stale` | `orphaned`). Nothing asserts the previous run was complete.
- **Engine errors/warnings** — a non-zero engine exit → Failure Path → `bkit workflows fail` writes a `workflow-failed` **status** row + `bkit:failed` label + failure comment. `.bkit/friction.jsonl` and `docs/failures.jsonl` are written by the agent via `bkit ledgers append`; engine code only **reads** them (`run-facts.ts` computes `friction` / `failures` `added` counts into `.bkit/stats.jsonl`). Warnings go to `.bkit/advisories.md` only.

### Outcome

- One bkit verb reports **step and command completeness** for any phase's run, deriving expectations from the workflow markdown at runtime (no hand-maintained table).
- `bkit workflows close` (and/or `start` on resume) surfaces the current/previous run's completeness verdict.
- Engine non-zero exits produce a `tool-failure` friction row (or a documented, enforced alternative), so engine friction is visible in telemetry.

### Success criteria

- Completeness report covers design / plan / build / debug / ship (today: ship only) and flags a step recorded `DONE` without its required engine evidence.
- A closed run carries its completeness verdict in the run's own artifacts; a resumed run warns when the previous run was holey.
- An engine exit non-zero appends (or otherwise records) a `friction` row with `category: "tool-failure"`.
- Promotion criteria from advisory → blocking gate recorded (tie to decision `384-tier3-promotion`).
- Unit tests + fixture corpus; no parallel expected-step table.

### Constraints and non-goals

- Advisory / fail-open until proven (one release without muting), per decision `384-tier3-promotion`.
- Keep engine/tool errors as `friction`; reserve `failure` for discovered bugs — do not pollute the bug backlog.
- No new parallel detector where `status-holes.ts` can be generalised.

### Decisions already made

- `status-holes.ts` derives its expected set from `bkit-ship.md` at runtime, never a hand table.
- The detector stays advisory / fail-open; promotion is gated (deferral `384-promote-status-hole-detector-from-advisory-to-gate`).

### Open questions

- Where should the completeness check run — `close`, `start`, both, or a standalone verb — and does it gate anything?
- Should engine-error rows land in `friction` (mechanical) or `failure` (semantic)? Confirm the split.
- One issue (this) or split by phase/mechanism during design?

### References

- `.bkit/core/engine/checks/status-holes.ts` (+ `status-holes.test.ts`) — the current advisory detector
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — static "engine calls" shape gate
- `.bkit/core/engine/commands/workflow/workflows.ts` — `start` / `fail` / `close`, resume semantics
- `.bkit/core/engine/commands/workflow/run-facts.ts` — `outcome` telemetry
- `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.ts` — ledger schema / write idiom
- `.bkit/jsonl.md` — ledger kinds, friction categories, write idiom
- `.github/workflows/bkit-ci.yml` — "Check Status Holes" advisory CI step
- `docs/testing.md` — status-hole detector contract
- Related issues (non-duplicate): [#331 — WS-G2: silent-corruption gates at ship and milestone end](https://github.com/cbartens/bkit/issues/331) (closed), [#676 — Orchestrator work the engine could do as bkit commands](https://github.com/cbartens/bkit/issues/676) (closed), [#680 — ledgers append: engine writes ledger rows with a minted ts](https://github.com/cbartens/bkit/issues/680) (closed)

Work done: filed and corrected this issue from an engine read-through of workflow-run observability.

**Outcome**

- Created the issue, then brought it into line with `.agents/rules.md`: title reduced to <=70 chars, body restructured to the `idea` shape (`.bkit/trackers.md` § Issue shapes), `enhancement` + `next:design` labels, project + Status/Priority/Size set, milestone **Workflow Optimisation**, and issue references rewritten to title + URL form.
- No parent and no blockers: standalone issue, nothing to block on.

**Findings recorded**

- End-of-run command/step completeness is ship-only advisory today (`.bkit/core/engine/checks/status-holes.ts`), CI-only, fail-open.
- No completeness assertion on the previous run at workflow start (resume/reclaim only).
- Engine errors/warnings never auto-write `.bkit/friction.jsonl` or `docs/failures.jsonl`; only a `workflow-failed` status row + `bkit:failed` label.

**Links**: [cbartens/bkit#699 — Engine run completeness check + auto friction/failure on errors](https://github.com/cbartens/bkit/issues/699)
No files changed this turn (tracker-only).

## #697 — Context-fetch: six further options to cut downloaded evidence (open)

### Problem

`/bkit-debug` pulls failure evidence into one artifact per context (`context-{ci,diff,e2e,runtime,web}-<name>-{DEBUG_ATTEMPT}.md`) and agents then read those files; every later turn re-reads them. The download is already bounded in three places:

- The block bounds its own request: time window, severity / level, `--log-failed`, `jq` projection to a PII-safe field subset, `--limit` / `head` / per-job tail, page caps with de-duplication.
- `bkit context fetch` writes a flat JSON array as a markdown table (no key repeated per row) and clamps above 3,000 lines / 400 KB: head 500 + tail 1000 + every line matching the signal words, ±2 lines of context.
- A context with no block is never fetched, and is narrated `NOT CONFIGURED` rather than read as clean.

What is missing is **enforcement** and **measurement**:

1. Nothing fails when an enabled block bounds nothing. A shipped provider template or a consumer's copy can download a whole-run dump, and only the 3,000-line clamp catches it after the fact.
2. The clamp has one shared signal-word regex, so a failure line that carries none of the signal words is dropped (stated in `.agents/context.md` § Bound your own output).
3. The table-vs-raw saving is recorded per artifact (`render`) but never reported, so the knobs cannot be tuned against real runs.
4. Only a flat JSON array of flat objects qualifies for the table render; nested output falls back to raw.

### Outcome

Fewer tokens read from fetched evidence, enforced where it can be enforced (check, audit) and measured where it can be measured (stats), without duplicating the bound rules that already live in `.agents/context.md`.

Six independent options, cheapest first. Any subset can be built; 4-6 are engine changes and may each want their own issue.

<!-- prettier-ignore -->
| # | Option | Where | Size |
| --- | --- | --- | --- |
| 1 | Template index states the bound rule | `.bkit/templates.md` § Context-fetch blocks | XS |
| 2 | `bkit check` advisory: enabled block with no bound | `.bkit/core/engine/checks/before/context-fetch.ts` | S |
| 3 | Audit: every shipped block carries a bound + a positive control | `.bkit/core/engine/audits/templates/context-templates.test.ts` | S |
| 4 | Per-context clamp profiles (`ci`, `e2e`, `runtime`) | `CLAMP_PROFILES` in `.bkit/core/engine/commands/workflow/context.ts` | M |
| 5 | Report the saving: bytes fetched → bytes kept, per context | `clamp-log` record + `bkit stats` | M |
| 6 | Flatten nested arrays into tables | `checkedTable` in `.bkit/core/engine/shared/text.ts` | S |

**Option 1 — template index states the bound rule.** The bound rules live in the managed block of `.agents/context.md`; the catalogue of ready-made blocks says nothing about them, so a consumer reading only `.bkit/templates.md` misses them. Add one line to the § Context-fetch blocks intro: each fetch block bounds its own output at the source (window / severity / field projection / `--limit` / `head` / page cap), pointing at `.agents/context.md` as the canonical home. Done when the index states the rule and `bkit check` reports no drift for `.bkit/templates.md`. Tests: `n/a — docs`.

**Option 2 — preflight advisory for an unbounded block.** A new advisory beside the existing four (`context-fetch-missing`, `-context-missing`, `-source-not-enabled`, `-provision-missing`): an enabled fetch block below `<!-- bkit:end -->` whose body carries no output bound (`--limit`, `head`, `tail`, `*_MAX_PAGES`, a window such as `--since`, `--log-failed`) gets a finding whose `action` names the block and the knob to add. Surface it through `bkit tips --workflow=debug` next to the existing `context-fetch` tip. Done when `bkit check` / `bkit doctor` names each unbounded block. Tests: `unit` — a fixture block with a bound produces no finding; one without produces the finding.

**Option 3 — audit that shipped blocks are bounded.** Extend the existing template audit so every `<!-- context-fetch:start ... -->` block in `.bkit/templates/context/bkit-*.md` must carry at least one output bound and keep its `# Customise:` line naming a positive control. Done when adding an unbounded block to any shipped template fails the suite. Tests: `unit` — the shipped set passes; a doctored fixture fails.

**Option 4 — per-context clamp profiles.** Replace the single shared signal regex with per-context keeps: `ci` keeps failed-step headings and `##[error]` / `::error` lines, `e2e` keeps failing-spec lines, `runtime` keeps the severity lines each provider prints. The footer, the `{name}.raw.{ext}` copy in the outbox and the clamp record's `render` field all stay as they are. Done when a `ci` artifact tripping the clamp keeps its failed-step lines even though they carry none of the signal words, proved per profile by a unit test. Tests: `unit` in `.bkit/core/engine/commands/workflow/context.test.ts`. Care: more profiles is more surface, and the clamp stays a runaway backstop — a normal run still never fires it.

**Option 5 — report the saving.** The clamp record already carries `render`; add lines and bytes before → after, and have `bkit stats` report per context: artifacts written, lines kept of lines fetched, table vs raw, bytes saved. Done when a repo with a debug run sees the per-context numbers in `bkit stats` / `.bkit/stats.md`. Tests: `unit` for the record shape, `integration` for the stats line.

**Option 6 — flatten nested arrays into tables.** Extend `checkedTable` so an array of objects holding one level of nesting also renders, with stable flattened keys, keeping the round-trip check (parse the table back and compare values and types). Any mismatch, key collision or empty array still writes the output as printed and logs `render: raw (<reason>)`. Done when `[{"a":1,"b":[{"c":2}]}]` renders as a table that parses back to the same values and types. Tests: `unit` in `.bkit/core/engine/shared/text.test.ts`.

### Success criteria

- Every fetch block bkit ships carries at least one output bound and a positive control, enforced by a test.
- `bkit check` reports an enabled fetch block that carries no bound, with an `action` naming the knob to add.
- A `ci` artifact that trips the clamp keeps its failed-step lines even when they carry none of the signal words.
- `bkit stats` reports, per context, bytes fetched → bytes kept and table vs raw per artifact.
- A nested JSON array renders as a table and parses back to the same values and types.

### Constraints and non-goals

- The bound rules keep one home: `.agents/context.md`. `docs/observability.md` keeps pointing at it and gains no second copy.
- Clamp thresholds stay as they are (3,000 lines / 400 KB; head 500 + tail 1000; 12,000 lines / 1.5 MB). The clamp is a runaway backstop, not a routine cap.
- No compression of tool output before the model sees it, and no interception of model traffic.
- No new provider templates or connectors; the audit (option 3) covers only what bkit already ships.
- The table render stays verified: a failed render writes the output as printed and logs why, so it can only cost the saving.
- Provider data keeps coming from an enabled block or the provider CLI in preference to MCP (`.agents/rules.md` § Provider data).

### Decisions already made

- The user-facing wording is settled in `README.md`: one bullet in § Spending fewer tokens (the read-less list) and one sentence in § Memory ("Outside evidence, when it's needed").
- The bound rules stay in the managed block of `.agents/context.md`; nothing is duplicated into `docs/observability.md`.
- The routine saving stays the block's own bound plus the table render; the clamp is not the mechanism.

### Open questions

- Which options, and in what order? 1-3 are small and ready; 4-6 are engine changes.
- Option 4: which contexts get a profile, and exactly which lines must each keep that the shared regex drops today?
- Option 5: is `bkit stats` the right home, or does the number belong on the `context-fetch` status row per run?
- Option 6: does flattening keep the round-trip honest when keys collide or an array is empty?
- Does this stay one run, or do 4-6 split into their own issues under #663?

### References

- #663 — Workflow prompt process token optimisation — https://github.com/cbartens/bkit/issues/663
- #549 — Cut context re-read cost: keep orchestrator and subagent contexts short — https://github.com/cbartens/bkit/issues/549
- `.agents/context.md` § Context Fetch, § Enabled blocks (bound rules)
- `.bkit/workflows.md` § Context fetch tables
- `.bkit/templates.md` § Context-fetch blocks
- `.bkit/core/engine/commands/workflow/context.ts` (`CLAMP_PROFILES`, `runBlock`, `tableOf`)
- `.bkit/core/engine/shared/text.ts` (`checkedTable`)
- `.bkit/core/engine/checks/before/context-fetch.ts` (the four advisories)
- `.bkit/core/engine/checks/tips/catalogue.ts` (`context-fetch` tip)
- `README.md` § Spending fewer tokens
- `docs/decisions.jsonl` key `681-engine-text-output`

Worked outside the `/bkit-*` workflows, on branch `feat/697`, commit `9696a839f`.

**Five of the six options are implemented. Option 6 is not, and cannot be** — the reason is below, with evidence.

## What landed

<!-- prettier-ignore -->
| # | Option | Outcome |
| --- | --- | --- |
| 1 | Template index states the bound rule | Done — `.bkit/templates.md` § Context-fetch blocks says each fetch block bounds its own output at the source, and names the new advisory. |
| 2 | `bkit check` flags an enabled block that bounds nothing | Done — new advisory `context-fetch-unbounded`, joining the four existing `context-fetch-*` findings and the `context-fetch` tip. |
| 3 | Audit: every shipped block is bounded | Done — every shipped fetch block must be bounded and must end its comment header with a `# Customise:` line. |
| 4 | Per-context clamp profiles | Done — `ci` / `e2e` / `runtime` add their context's block section headers to the base signal list. |
| 5 | Make the saving visible | Done, but not in `bkit stats` — see the deviation below. |
| 6 | Flatten nested arrays into tables | **Not implemented — unsound.** See below. |

**New finding.** `context-fetch-unbounded`, advisory, dismissable only by the blanket `<!-- context-fetch:none intentional -->` (a context-scoped marker does not dismiss it, because the runner still runs a block that is present). It fires for an enabled block whose bash body bounds nothing: no window, severity / level filter, row / line cap, page cap or per-lane tail.

**Bound words in a comment do not count.** This mattered: the audit now _requires_ every shipped block to carry a `# Customise:` line naming its knobs, which names exactly those words, so a first cut of the detector reported an unbounded block as bounded whenever the mandated comment was present. Comments are stripped (quote-aware, so a `#` inside a quoted string stays data) before matching, and an end-to-end test pins it.

**Clamp profiles.** `context fetch` and `run-block` pick the profile from the block's `context=`; every other caller passes one explicitly and is unchanged. A `ci` artifact now keeps its `===== job … =====` / `===== run … =====` headers, `e2e` its `===== file: … =====`, `===== step: … =====` and `expo-workflows` headers, and `runtime` each runtime block's banner. Every marker is taken from the block that really prints it; `sentry` prints no banner and has no markers.

## Deviation from the issue text (option 5)

The issue said the clamp record needed lines and bytes added and that `bkit stats` should report per context. Reconnaissance found the record **already** carried `origLines` / `keptLines` / `origBytes` / `keptBytes` — so the remaining work was surfacing them, not recording them. On the reporting home:

- `bkit stats` reads `.bkit/stats.jsonl`, `.bkit/friction.jsonl` and `docs/deferrals.jsonl` — committed, repo-wide ledgers.
- The clamp log is a transient, gitignored `tmp/bkit-clamp-{fid}-{step}[-{attempt}].jsonl` for one run.

So a `bkit stats` section would have read a file that is usually gone. The saving is surfaced on the `context-fetch` status row instead — the issue's own open question leaned that way. `context finalise` now emits and writes `clampSummary`: per context, `artifacts`, `origLines` / `keptLines` and `origBytes` / `keptBytes` fetched → kept, and how many artifacts were written as a table vs as printed (a record with no `render` counts as neither). `render` also joins the clamp record's documented output keys, which it was missing.

## Why option 6 is not implemented

The table render is only used when the table parses **back to the same values and types as the input object**; the printed JSON stays in the outbox as the fallback, so an artifact always reads back as the same data. A flattened nested key cannot survive that:

- input `[{ b: [{ c: 2 }] }]` → a dotted-key table prints `| b.c |` / `| 2 |`
- `parseText` reads that back as `{ "b.c": 2 }`, never `{ b: [{ c: 2 }] }`
- `readTable` reads one scalar per cell, and the row comparison is key-set plus value equality against the input rows

So the check must refuse nested values, which is exactly what it already does (`item 0 key b is nested`). Teaching the reader to expand dotted keys back into objects is also unsound: a literal key containing a dot prints a byte-identical table (a guaranteed collision), and the comparison would have to become deep-equality rather than the identity the contract asserts. Separate sub-tables are refused by the grammar (`parseText` returns `null` for stacked tables). The sound design already ships — refuse, and write the output as printed with `render: raw (<reason>)`; `renderText`'s list / JSON path stays lossless.

Recorded as decision `697-flatten-nested-arrays-unsound` in `docs/decisions.jsonl`, with the spike and its exact outputs at `docs/plans/202610/logs/697/design-spike.md`, and a note in `.bkit/workflows.md` § Context fetch tables. A deliberately designed lossless cell encoding (escaped JSON, deep-equality, dot-escaping) is a different, larger proposal that loses "one column is one field" — worth its own issue if wanted.

## Evidence

- Full suite: `pnpm vitest run` — **198 files, 7822 passed, 1 skipped**.
- Local pre-push gate `pnpm bkit:gate:static-unit-integration` — **exit 0**; unit 6244 passed (1 skipped) at 89.58% statements, integration 1578 passed; typecheck, lint, format, prose, slop clean.
- `bkit check` clean; `bkit:check:dist` clean after the commit (the rebuilt `dist/` is in the same commit).
- Dogfood on a fresh scratch consumer, driving the built `dist/cli.js`:
  - the advisory fires for three genuinely unbounded blocks and **not** for a `--limit 1` block; a block whose only bound-like words sit in its `# Customise:` comment is flagged;
  - a `ci` artifact of 5001 lines clamps to 1505 and keeps its buried `===== job build =====` header, while the same payload under `debug-evidence` clamps to 1500 and drops it;
  - a flat JSON array renders as a markdown table (`render: table`);
  - `clampSummary` reports `ci` 5001 → 1505 lines / 93915 → 27990 bytes (raw) and `runtime` 4 → 4 (table).
- On this repo's own `.agents/context.md` the new advisory does **not** fire: all three enabled blocks are bounded.

An independent reviewer went over the whole diff and found five defects (the comment-line hole above; eleven real bounds the detector missed, e.g. `per_page=`, `grep -m N`, `sed -n 'A,Bp'`, `awk 'NR<=N'`, `--tail`, `--max-rows`, an uppercase SQL `LIMIT`, a jq slice; an `action` string that named bounds the check rejected, so the advisory could not be cleared as instructed; one banner pinned to the wrong profile; and a doc sentence that named only one caller). All five are fixed and pinned by tests.

## Done-ness

Options 1–5 are complete on `feat/697`; option 6 is closed as unsound with a decision row.

Not pushed, no PR yet — say the word and I will push the branch and open one against `dev`. If you would rather treat the rejected option 6 (or the larger lossless-encoding alternative) as still open, this issue should stay open for that; otherwise it is complete and the label can move.

Related: #663 — Workflow prompt process token optimisation — https://github.com/cbartens/bkit/issues/663

Landed on `dev` and the branch is pruned.

**Commits now on `origin/dev` (`origin/dev` = `471abbc36`):**

- `f0721ec1f` — `docs(graph): refresh capabilities graph for #697`. The pre-push register gate blocked the first push: the engine source change moved the module graph, so `docs/capabilities.md` no longer matched what the tree produces. Refreshed and committed separately, as this repo does.
- `9696a839f` — `feat(697)`: the work described in the previous comment (options 1–5, option 6 closed as unsound).
- `471abbc36` — `docs(failures)`: the failure row below.

**Two things about this push worth your attention.**

1. **It carried another session's commit.** `1a09aaaa1 feat(ci): fail the push on a known-vulnerable dependency, bounded and classified` was already committed on local `dev` before I started, and it rode along. That was not avoidable: my commit regenerated four files that their source edits feed — `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/engine/checks/tips/catalogue.ts` and `dist/checks/tips/catalogue.js` — so landing mine without theirs would have left `dev` drifting under `bkit check`. A fast-forward of `dev` was the only coherent landing; no history was rewritten and no force was used.
2. **Local `dev` initially still pointed at the old tip** because `bkit branches sync-dev` refused with `fatal: this operation must be run in a work tree`. Cause below. I restored the checkout and fast-forwarded `dev` by hand; local `dev` = `origin/dev` = `471abbc36` now, tree clean.

**Discovered bug, recorded — `main-checkout-left-core-bare-true` (`HIGH`, `OPEN`) in `docs/failures.jsonl`.**

The main checkout's `.git/config` was left with `core.bare=true`, which made every working-tree git command fail there (`git status`, `git rev-parse --show-toplevel`), while pushes and ref reads kept working. Files were intact; restored with `git config --local --unset core.bare`.

I could **not** establish which command set it. The config mtime (`10:16:36`) falls inside the window of the pre-push gate chain that ran from the worktree, and `bkit branches sync-dev` afterwards hit the same refusal — so it met the bare state rather than causing it. The row carries the reproduction plan (watch `.git/config` while running the gate chain, and `bkit branches sync-dev` in a checkout whose `dev` has moved) and the fix shape: a step that needs a bare-ish repo to move a ref without a checkout must restore the key in a trap on every exit path, refusal and failure included.

Suggested as its own issue — it is a shared-checkout footgun, not part of this one. Tell me if you want it filed and fixed.

**State.** `feat/697` and its worktree are removed; `git worktree list` shows the main checkout plus the five other sessions' worktrees, untouched. The push carried no skip token, so CI runs on `dev`. The issue itself is unchanged: options 1–5 are done, option 6 is closed as unsound, so it can be relabelled for closure — or stay open if you want the larger lossless-encoding alternative tracked.

Related: #663 — Workflow prompt process token optimisation — https://github.com/cbartens/bkit/issues/663

## #662 — Debug can't start after failed ship: leftover files block rebase (open)

### Failing test or CI run

None yet. Seen live in app-gether-life on #1502 (`1502-inngest-trace-link`), bkit 5.5.1.

### What happened

1. `/bkit-ship` failed at Step 6: the ship-summary verdict was FAIL at 2026-10-22T07:16:37Z. Its Failure Path ran `workflows handover --flush`, which landed the run's record on dev as commit `343804646 chore(1502-inngest-trace-link): ship FAILED bkit [skip ci]`. By design, that step leaves the feature worktree untouched. The code says why: "the next ship of {fid} carries it" (`.bkit/core/engine/commands/workflow/workflows.ts`, `landFailedRecord`). So the worktree was left with uncommitted changes:
   - ship's doc edits to `docs/roadmap.md`, `docs/testing.md` and `docs/observability.md`
   - the two `.bkit/issues.jsonl` SHIPPED rows
   - `status.jsonl`, the `.bkit/` ledgers and four untracked `ship-*.md` logs
2. The next run was `/bkit-debug #1502`, not a ship. Debug Step 2 runs `bkit worktrees setup --workflow=debug --fid=... --detect`. That resumes the worktree by rebasing it onto `origin/dev`. Git refuses to start a rebase while there are uncommitted changes (`error: cannot rebase: You have unstaged changes.`), so the command exits 9 (`EXIT_REBASE_NOT_STARTED`).
3. Step 2's route (`.bkit/core/workflows/bkit-debug.md`, Step 2 sub-step 1) only handles exit 0 and exit 3, so exit 9 sends the run to the Failure Path. Debug never starts.
4. The debug Failure Path then runs `workflows handover --push`. On a feature branch, that does `git add -A` and commits (`workflows.ts:601`). It swept the ship run's leftovers into `5bfcefdd9 docs(1502-inngest-trace-link): debug aborted bkit [skip ci]`. The commit stayed local only because PR #1556 is open (exit 9 again, this time `EXIT_OPEN_PR_KEPT`, from a different command).

The outcome: a workflow that has nothing wrong with it can't start. A run labelled "debug aborted" ends up committing another run's work. And the same ship log files now exist on dev and on the feature branch with slightly different contents. For example, `ship-input-1.md` is 819 lines on dev and 823 on the branch. So the next resume rebase is likely to conflict on them.

### What should happen

Any workflow must do whatever it takes to start. That includes cleaning up after a failed earlier run, whichever workflow that earlier run was.

- **Clean up at the start, not in the Failure Path.** When `worktrees setup --detect` resumes a worktree and finds a previous run's uncommitted record, it commits that record itself, under a commit message that names the run it came from, and only then rebases. Ship already relies on "the next run carries it". That needs to be true for every workflow that can come next: debug, build, and ship again. Today only the next ship handles it.
- **Ship then fail must be a normal path.** Ship has to write SHIPPED to `.bkit/issues.jsonl` before merge, because everything must be committed before merge so nothing is left behind. A ship that fails after that point leaves a SHIPPED row behind, and that is expected. Whatever runs next carries it, and a later row from the next phase replaces it, because the ledger is read newest-row-wins (`roadmap.ts`).
- **No duplicated log files.** Cleaning up a run whose record was already flushed to dev must not leave the same log files on dev and on the feature branch with different contents. The cleanup either picks up exactly what dev has, or lets dev's copy win when it rebases.
- **No unknown exit codes.** Step 2 must not leave a known `worktrees setup` exit code unhandled. Once the cleanup happens at the start, exit 9 should only mean something cleanup can't fix.

### Steps to reproduce

1. Have a feature with an open PR, and run `/bkit-ship` until it fails after `ship-update-docs` (a summary verdict of FAIL is enough).
2. Leave the worktree as the ship Failure Path left it.
3. Run `/bkit-debug #<issue>`.
4. Step 2 exits 9 and the run goes to the Failure Path. Its handover commits the ship leftovers as "debug aborted".

### How often

Every time

### Affected area

- `.bkit/core/engine/commands/workflow/worktrees.ts`: `worktrees setup --detect`, the resume rebase and `EXIT_REBASE_NOT_STARTED`
- `.bkit/core/engine/commands/workflow/workflows.ts`: `landFailedRecord` (the ship `--flush` that leaves the worktree as it is) and `handover --push` running `git add -A`
- `.bkit/core/workflows/bkit-debug.md`: Step 2 route
- The same Step 2 resume in `bkit-build.md` and `bkit-ship.md`, which should handle this the same way

### Where and when

app-gether-life, bkit 5.5.1, 2026-10-22, from 07:16Z (ship FAIL) to 07:37Z (debug FAIL).

### Evidence

- Ship record on dev: app-gether-life `343804646`
- Local-only debug abort commit holding the ship leftovers: app-gether-life `5bfcefdd9`
- The debug run logged a friction row: `debug-step2-cannot-resume-a-worktree-a-failed-ship-run-left-dirty`

### References

Related: app-gether-life #1502 (Trace link from web request into Inngest jobs), PR #1556

## Work done

Fixed on `dev` in 992747a6. Not pushed yet.

### The decision

A workflow does whatever it needs to do to start. The cleanup happens when the next run starts, not in the failed run's Failure Path, and every workflow that resumes a worktree gets it, not only a following ship.

The early SHIPPED row is left alone on purpose. Ship has to commit everything before merge, so a SHIPPED row before a later FAIL is expected. The next run carries that row, and a newer row replaces it because `.bkit/issues.jsonl` is read newest-row-wins.

### What changed

`bkit worktrees setup` now checks the worktree before its resume rebase. If a previous run left uncommitted files there, it commits them first, then rebases. This lives in `carryLeftovers` in `.bkit/core/engine/commands/workflow/worktrees.ts`.

- **The commit says where the files came from.** The message names the earlier run from `status.jsonl`, for example `chore(1502-inngest-trace-link): carry the failed ship record left uncommitted bkit`. When there is no run to name, it says `carry uncommitted work left in the worktree`.
- **Dev's copy of a log wins.** An untracked file in one of this feature's log folders (`docs/plans/*/logs/{FID}/`) is deleted first if dev already has it. A failed ship's flush already put those logs on dev, and two copies of one file would stop the rebase. On #1502, `ship-input-1.md` was 819 lines on dev and 823 in the worktree.
- **Copied-in files are never committed.** The files setup copies in from the main checkout (`bkit.worktree.copy`, for example `.env`) are left out of the commit, so committing everything can't put a secret into git.
- **Two new output fields.** `carriedSha` is the cleanup commit, reported after the rebase replays it. `carriedDropped` lists the logs that were deleted because dev already had them.
- **Exit 9 now only means the cleanup commit itself was refused**, for example by a commit hook. Debug Step 2 still sends that to the Failure Path, which is right, because a refused commit needs a person to look at it.
- **Ship is unchanged.** It doesn't rebase when it resumes, and it already picks up its own leftovers.

### Tests

The tests are in `worktrees.integration.test.ts` and run against a real git remote:

- debug and build each resume after a failed ship. The leftovers are committed under the expected message, the log dev already holds is replaced by dev's copy, the ship's doc edit is kept, and the rebase lands on dev's tip.
- `.env` copied in by setup stays out of the commit.
- A clean worktree gets no extra commit.
- When a pre-commit hook refuses the cleanup commit, setup still exits 9 with a message and writes the sentinel.

`worktrees.test.ts` and `worktrees.integration.test.ts` pass (90 tests). The type check, oxlint and prettier are clean. When I ran `slop:delta` against only these changes, it found no new findings.

### Docs

- `.bkit/core/.bkit/workflows.md` and its copy at `.bkit/workflows.md` describe the resume step (the `resumed` row).
- `docs/testing.md` lists the new cases.
- `CHANGELOG.md` has a line under Unreleased → Fixed.

### Not done here

- **Debug's failure handover still commits everything with `git add -A`.** Now that cleanup happens at start, that commit normally holds only the debug run's own record, so I left it alone.
- **The #1502 worktree in app-gether-life isn't cleaned up.** It still has the local commit `5bfcefdd9`, which mixes the ship's doc edits under a "debug aborted" message. That needs tidying by hand.
- **This issue stays open** until dev is pushed and the fix is released.

## Follow-up audit — other sites in the same defect class as #700's `addAllButCopied` failure

Context: #662's follow-up commit `ce802b482` introduced `addAllButCopied` and asserted, in its doc comment and a test name, that the `bkit.workflows.worktree.copy` entries are left out of every commit "gitignored or not". #700 proved that false: the helper names the copied entry in a `:(exclude)` pathspec, and git's `add` refuses any pathspec that names a gitignored file. Recorded as `worktree-copy-gitignored-file-breaks-commit` (HIGH, OPEN).

This is a sweep for other sites in the same family, done while diagnosing #700. Nothing below is fixed by `ce802b482` or `992747a6`.

### Confirmed mechanism

`git add -A -- . ':(exclude)<gitignored file>'` exits 1. Verified under git 2.56.0:

<!-- prettier-ignore -->
| form | result |
| --- | --- |
| `git add -A -- . ':(exclude).bkit/.env'` (ignored) | **exit 1** |
| `git add --pathspec-from-file=<ignored path>` | **exit 1** |
| `git add -- <ignored path>` | **exit 1** |
| `git add -A -- .` (no exclude) | exit 0 |
| `git add -u -- . ':(exclude,literal)<ignored path>'` | exit 0 |

Two ways to trip it: naming an ignored path in an `:(exclude)`, or feeding an ignored path through `--pathspec-from-file`.

### 1. `addAllButCopied` — the #700 bug (confirmed, HIGH)

`worktrees.ts:244`. Every caller is broken in a worktree that copied a gitignored entry:

- `steps finish` — `steps.ts:480`, and `--docs-only` at `steps.ts:824`
- `workflows handover --push` — `workflows.ts:874`
- `workflows close` — `workflows.ts:1276`
- `carryLeftovers` (resume cleanup) — `worktrees.ts:280`

The trigger is not exotic. Any project whose main checkout has a real, gitignored `.env` (the norm) copies it (`copyListed`, `worktrees.ts:295`) and then fails every commit identically. This repo dodges it only by accident: `.gitignore:22` ignores `.env`, but there is no real `.env` in the main checkout and `copyListed` skips missing entries (`worktrees.ts:305`); `.bkit/.env` exists, so it trips.

Suggested fix — drop from the exclude list the entries git already ignores (`git add -A` skips them anyway):

```ts
const keep = copied
  .map((e) => path.normalize(e))
  .filter((e) => !runGit(tree, ["check-ignore", "-q", "--", e]).ok)
  .map((e) => `:(exclude)${e}`);
```

`git check-ignore` reports tracked files as not-ignored, so a tracked copy entry keeps its exclusion. Do **not** exclude the parent directory (`:(exclude).bkit` also drops tracked siblings such as `.bkit/version`), and do **not** add `-f` (that commits the secret). Test: a fixture whose `.gitignore` contains the copy entry — `copiedRepo` (`steps.test.ts:814`) and `workflows.test.ts:1187` both run against fixtures with no `.gitignore`, which is why the suite is green.

### 2. `markerCommit` — raw `git add -A`, the `ce802b482` intent missed here (HIGH for the projects `ce802b482` was written for)

`branches.ts:780` (caller `branches.ts:1000`, `addAll: true`; reached by `bkit branches push --commit=...`, e.g. `bkit-debug.md:654`). Unlike handover/close, this stages with a bare `git add -A`, so a copied entry the project has **not** gitignored — the exact scenario `ce802b482` cites — is committed and pushed.

Suggested fix: `addAllButCopied(cwd)` instead of `runGit(cwd, ["add", "-A"])`. This must land **after** fix 1, or it inherits the guard bug.

### 3. `commitOnePath` — `git add -- <path>` can name an ignored path (LOW, latent)

`ledgers.ts:843`, where `<path>` is the caller's `--path` (`bkit ledgers commit --path=...`). A gitignored `--path` trips the same guard and surfaces as `EXIT_STAGE`. In-tree callers pass `docs/plans/...` (`bkit-build.md:164`), so there is no live trigger.

Suggested fix: `check-ignore` the path and refuse with a clear message (`--path` is gitignored — refusing to stage it) rather than leaking git's guard error. Do not silently `-f`.

### 4. `--pathspec-from-file` sites — latent, currently safe (LOW)

`commitOwnSet` (`ledgers.ts:546`, `:570`) and `commitBookkeeping` (`ledgers.ts:1041`). `git add --pathspec-from-file` **does** trip the guard (verified), but these lists are safe today: `commitOwnSet`'s list is `set.plain` from `dirtyPaths` (`ledgers.ts:374`), which drops ignored entries; `commitBookkeeping`'s is `git ls-files` output (tracked only).

Suggested fix: pin the invariant with a filter or a comment plus a test, so a future list that gains an ignored path fails loudly at the right layer instead of as an opaque `EXIT_STAGE`.

### 5. `git add -u` with `:(exclude,literal)` — verified immune (no change)

`ledgers.ts:943`. `git add -u -- . ':(exclude,literal)<ignored>'` exits 0 because `-u` only considers tracked files. Recorded so this site is not "fixed" into a regression.

### 6. Same trigger, different commit failure — setup omits a gitignored file the commit needs

Not pathspec bugs, but the same abort shape (#700's "step 2 commit exits 8 → run aborts"), and they collide with fix 1:

- `.vale/styles/write-good` — `harvest/friction.jsonl` keys `worktree-setup-skips-vale-styles-so-first-commit-fails-lint-prose` / `…-first-step-commit-…` (4 rows, 5.2.2–5.2.4). Setup does not copy the gitignored vale styles; the `lint:prose` pre-commit hook refuses; `steps finish` exits 8 at Step 2. **Collision:** the recorded remediation — "copy the gitignored file into the worktree" — is exactly what arms bug 1. Fix 1 must ship before or with any such copy-list addition.
- `.bkit/core` + `.bkit/shared` payload symlinks — friction `worktree-setup-omits-bkit-core-shared-payload-links-so-pre-push-bkit-check-drifts`. Gitignored symlinks not created → `bkit check` drift → pre-push refuses.

### 7. Related abort shape, not pathspec (for completeness)

- `context finalise` exits 8 when a pre-commit guard refuses — friction `related-issue-text-with-malformed-table-blocks-fetch-context-commit`.
- `branches push` exits 8 on runGit's default 1 MB maxBuffer — friction `bkit-rungit-push-dies-on-spawnsync-1mb-maxbuffer`.

### Suggested fix order

1. Fix 1 (`addAllButCopied`) + the gitignored-copy-entry test — unblocks #700 and every `steps finish` in a copied worktree.
2. Fix 2 (`markerCommit`) — closes the secret-commit hole the `ce802b482` intent missed.
3. Fixes 3–4 — harden the remaining `add` pathspec sites.
4. Fix 6 — only after 1, since the vale remediation adds a gitignored entry to the copy list.

## Fixes applied on `dev` (local)

Follow-up to the audit above. Fixes 1–4 implemented on `dev`, committed locally (not yet pushed).

### Commit `412fe612f` — `fix(700): never name a gitignored worktree.copy entry in a commit pathspec`

<!-- prettier-ignore -->
| Fix | Change |
| --- | --- |
| 1 | `addAllButCopied` (`commands/workflow/worktrees.ts`) drops copied entries git already ignores from the `:(exclude)` list. Shared check `isIgnoredPath` added in `commands/lib.ts`. |
| 2 | `markerCommit` (`commands/workflow/branches.ts`) stages through `addAllButCopied` instead of a raw `git add -A`, so `bkit branches push --commit` no longer commits a copied-in secret. |
| 3 | `commitOnePath` (`commands/workflow/ledgers.ts`) refuses a gitignored `--path` with `--path is gitignored, refusing to stage it: <path>` instead of leaking git's guard message. |
| 4 | `commitOwnSet` (`commands/workflow/ledgers.ts`) refuses a gitignored path in its set with `refusing to stage gitignored path(s): <paths>`. |

Why the fix works: `git add -A` skips an ignored file anyway, so an ignored copied entry needs no exclusion; naming it in the pathspec is what trips git's guard. Excluding the parent directory was rejected (`.bkit/` holds tracked files such as `.bkit/version`), and `-f` was rejected (it commits the secret).

### Tests (red before, green after)

- `commands/workflow/worktrees.test.ts` — `addAllButCopied` with a gitignored entry plus a non-ignored one.
- `commands/workflow/steps.test.ts` — `bkit steps finish --commit=auto` in a worktree whose copy list names a gitignored entry: exit 0, the source committed, the ignored entry not.
- `commands/workflow/branches.test.ts` — the `--commit` marker leaves a copied `.env` out of the commit and the pushed branch.
- `commands/workflow/ledgers.test.ts` — `--path` and `commitOwnSet` name a gitignored path in the error.

### Docs and ledger

- `CHANGELOG.md` (Unreleased → Fixed), `docs/testing.md` (new coverage section).
- Commit `fd110763e` closes the failure row `worktree-copy-gitignored-file-breaks-commit`.

### Verification (all green)

- `pnpm vitest run` — 7827 passed, 1 skipped (198 files)
- `pnpm test:integration` — 1578 passed (46 files)
- `pnpm bkit:gate:static` — typecheck, lint, format, tables, prose, slop:delta
- `pnpm bkit:test:bats` — all ok
- `pnpm bkit check` — exit 0; `pnpm bkit:check:dist` clean at the commit
- Built-CLI dogfood on a scratch consumer: `steps finish` exit 0 with a gitignored copy entry (ignored entry untracked); `ledgers commit --path=<gitignored>` exit 4 with the clear message.

### Not done here (still recorded in the audit above)

- **Fix 6** — `.vale/styles/write-good` and the `.bkit/core` / `.bkit/shared` payload links are still missing from `bkit worktrees setup`. The ordering now works in the safe direction: fix 1 has landed, so adding a gitignored entry to the copy list no longer arms the guard bug.
- **Fix 7** — the `context finalise` / `branches push` abort shapes are separate and untouched.

### Also recovered

The main checkout was still `core.bare=true`; `git config --local --unset core.bare` restored it. The `main-checkout-left-core-bare-true` failure stays OPEN — its setter is still unknown.

Commits are on local `dev` (4 commits ahead of `origin/dev`, 2 of them this work); not pushed.

## #695 — Baseline: the explainer brief without bkit, on two hosts (open)

### Problem

#504 — Example project, design to ship: explainer, demo and benchmark — https://github.com/cbartens/bkit/issues/504 can tell whether one bkit version beats another, but not whether bkit beats no bkit at all. Answering that needs the same task run two ways: once through bkit's workflows, and once the way someone uses a coding agent without bkit. Without bkit, a person types one short request per stage and leaves the agent to decide everything else.

The #687 — Explainer page: step through a bkit run, phase by phase — https://github.com/cbartens/bkit/issues/687 brief can't be that task. It's written for bkit's own repo (`docs/explainer/`, the `vitest.config.ts` include list, `pnpm bkit:gate:static-unit`), and bkit's repo can't be run without bkit. On a copy of `v5.5.1` with the agent setup removed (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.opencode/`, `.serena/`, `.mcp.json`, `skills-lock.json`), `pnpm bkit:gate:static-unit` fails 14 tests in 7 files, because the repo tests its own installed setup (e.g. `rules-sync.test.ts` reads `.agents/rules.md`). The same 7 files pass on the untouched copy (163 tests). So the brief's own pass condition fails before any agent starts.

### Outcome

One task, one starting repo, two ways of running it, on two hosts: four runs.

<!-- prettier-ignore -->
|  | Without bkit (baseline) | With bkit |
| --- | --- | --- |
| Starting repo | fresh private copy of the starter | the same, after `bkit install` |
| Task | the #694 brief, filed word for word as issue #1 | the same |
| Each stage | one prompt from the table below, in a new chat | `/bkit-design #1`, `/bkit-plan #1`, `/bkit-build #1`, `/bkit-ship #1`, `/bkit-debug #1` when ship hands over |
| Hosts | Claude Code; OpenCode with DeepSeek | the same |

**The task.** #694 — Explainer page: step through a pipeline run, phase by phase — https://github.com/cbartens/bkit/issues/694. It's #687 word for word, with two kinds of change: "bkit" is renamed, and the lines about how bkit's repo runs its tests are replaced. The tables, both example runs, the counters, the rules for moving through a run, the file names and the success criteria are unchanged.

<!-- prettier-ignore -->
| #687 | #694 |
| --- | --- |
| "bkit" / "bkit's", everywhere it names the subject | "the pipeline" / "the pipeline's" ("A new bkit user" → "A new pipeline user") |
| Tests "run as part of bkit's existing unit tests, and `pnpm bkit:gate:static-unit` passes" | Tests "run with `node --test` from the repo root, and pass" |
| The `vitest.config.ts` include-list constraint | "The tests use Node's built-in test runner (`node:test`), so `node --test` from the repo root finds and runs them" |
| "CI already runs bkit's unit tests" | "CI already runs `node --test` (`.github/workflows/ci.yml`)" |
| "The page belongs to bkit's own repo…" (npm package, `bkit install`) | removed |

Naming a generic pipeline rather than bkit also gives agents in the bkit run less reason to go reading bkit's own workflow files, which the baseline repo doesn't have.

**The starter**, in `examples/explainer/`:

- `package.json`: `{"private": true, "scripts": {"test": "node --test"}}`, no dependencies.
- `.github/workflows/ci.yml`: on pull requests, check out, set up Node 24, run `node --test`.
- `.gitignore`: `node_modules/`.

Each run gets its own fresh private repo, so no run sees another's work.

**The baseline prompts.** One per stage, each in a new chat, written the way someone without bkit would type them. The only detail they give is file paths, so a stage in a new chat can find the previous stage's output. They say nothing about tests first, reviews, checking against the brief, updating docs or limits on fix rounds; the agent decides all of that. That gap is what the comparison measures.

<!-- prettier-ignore -->
| Stage | Prompt |
| --- | --- |
| Design | Have a look at issue #1 and write a design for it in `docs/plans/explainer-design.md`. Commit and push it to `main`. |
| Plan | Turn the design in `docs/plans/explainer-design.md` for issue #1 into an implementation plan in `docs/plans/explainer-plan.md`. Commit and push it to `main`. |
| Build | Build `docs/plans/explainer-plan.md` for issue #1 on a new branch, make sure the tests pass, and open a PR into `main`. |
| Debug | CI is failing on PR #{PR}. Find out why and fix it. |
| Ship | Merge PR #{PR} into `main` once CI is green. |

- Debug runs only when CI on the PR is red. After two debug chats with CI still red, the run counts as handed over.
- Whenever the agent stops to ask something, in either way of running, the reply is always: "Go with what you'd recommend and carry on." Each run records how many replies it took.
- Whenever the agent is done ask it to "Document your work in issue comment."
- The prompts work unchanged on any host.

**Models.** The same as `v5.5.1`'s `.bkit/prompts.md` § Orchestrators, so both ways of running use the same main-chat model:

<!-- prettier-ignore -->
| Stage | Claude Code | OpenCode |
| --- | --- | --- |
| Design, plan, debug | `claude-opus-5-5` | `deepseek-v4.1-flash` |
| Build, ship | `claude-sonnet-5-5` | `deepseek-v4.1-flash` |

Claude Code sessions start with `--effort medium`. Without bkit, any subagent the agent starts uses the chat's model; with bkit, its agents keep their own pins, because those are part of what bkit is.

**Clean personal setup.** Every run, on both hosts, starts with no personal instructions, memory, plugins or skills, so only the repo differs.

**Measuring.** The harvest (`scripts/harvest/bkit-harvest.mjs`) reads both hosts' chat transcripts, and one chat per stage gives each stage its own row. Per run and stage: tokens, active minutes, agents started, replies sent, and how the stage ended. A run passes when its PR merged and `node --test` passes on the merged `main`, checked by running it, not by the agent's word. Wall time isn't compared, because typing by hand adds waiting time.

### Success criteria

- `examples/explainer/` holds the starter; a fresh copy plus #694 filed as issue #1 is everything a run needs.
- Four runs done: without bkit and with bkit, on Claude Code and on OpenCode with DeepSeek, each in its own fresh repo, each stage in its own chat.
- The harvest report shows the four runs side by side: tokens per stage, active minutes, agents, replies sent, how each stage ended, and whether `node --test` passed on the merged `main`.
- The owner records which planted traps each run caught.

### Constraints and non-goals

- The prompts stay exactly as written: no added steps, and nothing that points at any part of the brief.
- One run per combination is noisy (Ponytail used 10 runs per point, per #43 — Test diff-aware LLM-judge evals — https://github.com/cbartens/bkit/issues/43). Only large differences mean anything.
- Not in scope: other hosts, dollar figures (cost stays in tokens), and changing the brief's content.

### Decisions already made

- One prompt per stage, high level, as someone without bkit would write it; the agent works out the steps (owner, 2026-10-25).
- The prompts work on any host, so OpenCode with DeepSeek gets a baseline too (owner, 2026-10-25).
- The task runs in a plain starter repo, not bkit's, from a neutral copy of the #687 brief (owner, 2026-10-25).
- The page explains a generic pipeline rather than bkit by name (owner, 2026-10-25).
- #694 stays as close to #687 as possible: only the subject's name and the test and CI plumbing change (owner, 2026-10-25).

### Open questions

- Do the changes from #687 to #694 leave every planted trap intact? Owner check, since the traps are kept off the tracker.
- bkit's build runs the `bkit:gate:static-unit` script; the starter only declares `test`. Not checked whether `bkit install` adds it or the bkit run's setup has to.
- How to give each host a clean personal setup. Not checked per host; a separate macOS user account works for both.
- Does the harvest report need a change to put these four repos side by side, as #689 — Backfill: run the explainer brief on key past bkit versions — https://github.com/cbartens/bkit/issues/689 adds for `cbartens/bkit-example`?

### References

- #504 — Example project, design to ship: explainer, demo and benchmark — https://github.com/cbartens/bkit/issues/504 (parent; starter-in-`examples/` setup)
- #694 — Explainer page: step through a pipeline run, phase by phase — https://github.com/cbartens/bkit/issues/694 (the task)
- #687 — Explainer page: step through a bkit run, phase by phase — https://github.com/cbartens/bkit/issues/687 (the brief #694 copies)
- #689 — Backfill: run the explainer brief on key past bkit versions — https://github.com/cbartens/bkit/issues/689 (runs #687 inside bkit's repo, so not directly comparable with these runs)
- #688 — Stats: per-run tokens, context, plan reads, owner waits — https://github.com/cbartens/bkit/issues/688 (per-run fields the harvest reports)
- `.bkit/prompts.md` § Orchestrators (models per stage)
- `docs/observability.md` § Harvest — every repo, every chat (bkit repo only)

Test not complex enough for good comparison

## #689 — Backfill: run the explainer brief on key past bkit versions (open)

### Problem

There's no way to say whether bkit's workflows got better from release to release, or which change made the difference. The #687 — Explainer page: step through a bkit run, phase by phase — https://github.com/cbartens/bkit/issues/687 trial gives one data point for today's version, and the harvest (`scripts/harvest/bkit-harvest.mjs`) only records runs from now on. The work #663 — Workflow prompt process token optimisation — https://github.com/cbartens/bkit/issues/663 is doing has nothing earlier to compare against.

Every past version is still in git (109 version tags), and all five workflows (design, plan, build, debug, ship) exist from `v1.0.0` (2026-05-08) onwards. Only 5.0.0 and later are on npm, so anything older has to be rebuilt from its tag.

### Outcome

One private repo, `cbartens/bkit-example`, that holds every historical run in its git history. A script fills it by running the #687 brief through five past versions with nobody at the keyboard, every version on today's models. The harvest then compares the versions from their chat transcripts, which look the same whichever version ran.

This measures the workflows, not the models. Every version runs on the same models, so a difference between two versions comes from what changed in bkit between them.

**Versions: chosen at the changes that most altered how a run behaves** (from `CHANGELOG.md` and the tags):

<!-- prettier-ignore -->
| Version | Released | What it stands for | Step from the previous one isolates |
| --- | --- | --- | --- |
| `v3.4.2` | 2026-06-08 | workflows under `.bkit/`, run logs (`status.jsonl`); debug rebuilt as NORMAL then SOAK (3.3.0 / 3.4.0); ship Deferred Sweep | — |
| `v4.10.0` | 2026-07-27 | ship no longer merges on red CI, plan and design closes stop failing (4.6.0); the challenge-fix loop gets a cap (4.8.0) | the reliability fixes |
| `v4.12.0` | 2026-08-26 | largest prompts; design Spike, build Plan Current, ship merge gate, +2 agents (one squash commit, `33d0eb3de`) | extra agents and prompt growth, no engine change |
| `v5.0.3` | 2026-10-12 | step mechanics move into the `bkit` command line tool; prompts about 45% smaller; 5.0.0 to 5.0.2's CI gate bug fixed | prose to engine |
| `v5.5.1` | 2026-10-22 | current release | everything since 5.0.3, bundled: design opens by asking the owner questions and build writes tests first (5.2), debug [repro] step (5.3), `_land` worktree (5.4), design acceptance scenario (5.5) |

**How each version runs on today's models.** Old versions name their agents' models in their own agent files (`.claude/agents/*.md` `model:`), from `claude-opus-4-8` and `claude-sonnet-4-6` in `v3.4.2` to the 5.5 family in 5.x. The wipe rewrites each name to today's model of the same tier:

<!-- prettier-ignore -->
| Named in the version | Runs as |
| --- | --- |
| any Opus | `claude-opus-5-5` |
| any Sonnet, including the bare `sonnet` in `v3.4.2` | `claude-sonnet-5-5` |
| any Haiku | `claude-haiku-5-5` |

That keeps each version's own choice of which agents get the bigger or smaller model, and its `effort:` settings, because those are part of its workflow design. The main session's model is picked when the session starts, and no tag sets it in its files. So every version uses `v5.5.1`'s table (`.bkit/prompts.md` § Orchestrators): `claude-opus-5-5` for design, plan and debug, and `claude-sonnet-5-5` for build and ship. Every session also starts with `--effort medium`, so the owner's own `~/.claude/settings.json` effort can't change it.

**The brief's check command, per version.** The brief says `pnpm bkit:gate:static-unit` passes. That script only exists from `v4.12.0`, and the two older versions lack some of its parts. The brief stays word for word. For each version, this table fixes which command that check means, built from the same parts as far as the version has them:

<!-- prettier-ignore -->
| Version | Check command | Parts of `bkit:gate:static-unit` it doesn't have |
| --- | --- | --- |
| `v3.4.2` | `pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test` | `lint`, unit coverage run, bats tests |
| `v4.10.0` | `pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test && pnpm test:coverage:unit && pnpm test:bats` | `lint` |
| `v4.12.0` | `pnpm bkit:gate:static-unit` | — |
| `v5.0.3` | `pnpm bkit:gate:static-unit` | — |
| `v5.5.1` | `pnpm bkit:gate:static-unit` | — |

For `v3.4.2` and `v4.10.0`, the script adds one line under the filed brief naming that version's command, so the agents aren't told to run a script that doesn't exist. The script also runs the same command itself to decide pass or fail.

**The run loop.** For each version, oldest first:

1. **Wipe.** Replace the repo's whole tree with bkit's files exactly as they were at the tag, as one new commit on `dev` (never a history rewrite). bkit runs on itself, so the workflows that run are that version's own, straight from git. These things differ from the tag, and the wipe commit lists them:
   - Model names rewritten as above.
   - `.bkit/stats.jsonl` is the repo's own file, carried over from the previous run, so it keeps building across versions. The tag's copy holds bkit's own development rows (55 at `v4.12.0`, 83 at `v5.5.1`) and is not used.
   - `release.yml`, `bkit-cloud.yml` and `bkit-renovate.yml` are left out, so nothing can publish to npm or call a paid service.
   - For `v5.5.1`, `docs/plans/202610/504-example-project-design.md`, `docs/plans/202610/504-example-project-plan.md` and `docs/plans/202610/logs/504-example-project/` (80 files) are left out, because they describe the app being built.

   Nothing else carries over: no earlier run's plans, logs or explainer code, so no version sees an earlier version's answer. Claude Code's auto-memory for the repo's folder is cleared too, because every version runs in the same folder.

2. **File the brief.** Open the #687 brief, word for word, as a new issue in the repo, plus the check-command line for `v3.4.2` and `v4.10.0`.
3. **Run unattended.** Each phase runs as its own Claude Code session in print mode (`claude -p`, no interactive session): `/bkit-design`, then `/bkit-plan`, `/bkit-build` and `/bkit-ship`, plus debug when ship hands over to it. One session per phase means one chat per phase, so each phase's tokens come straight off its own chat row. Whenever a run stops to ask the owner something, including `v5.5.1`'s opening design questions, the script resumes the same session (`claude -p --resume`) with one fixed reply: take the recommended answer, approve, carry on. Every version gets the same reply. A cap on replies per phase stops a run that loops forever, and the script records it as stuck. The script switches Node per version (`v5.5.1` needs Node 24).
4. **Check and record.** The script runs the version's check command and the explainer's tests itself. It doesn't take "PR merged" as a pass, because `v3.4.2` comes before the fix that stopped ship merging on red CI. It copies each session's transcript files (the main chat and its subagents) into a local archive, so they outlive Claude Code's 30-day cleanup. Then it writes one result row into the repo: version, the session id of each phase, how each phase ended, owner replies sent, and whether the check passed.
5. **Commit and push.** Commit what the run left behind, including `.bkit/stats.jsonl` and the result row. Tag it (e.g. `bench/v3.4.2`), push, and wipe for the next version.

**At the end.** One harvest pass reads every version's chats with today's harvest. The chats are picked out by their repo, `cbartens/bkit-example`, so nothing else has to be kept apart. Because the transcripts are archived, the pass can be run again whenever the harvest learns to measure something new, for example once #688 — Harvest: per-run tokens, plan reads, handover context, owner waits — https://github.com/cbartens/bkit/issues/688 lands.

**Harvest changes** (for every repo, not only this one):

- **Version lookup.** Today the harvest only reads `.bkit/version`. Before 2026-06-01 (`622d8b98b`) bkit kept the same file at `.agents/.bkit-version`, so the harvest finds no version for any repo's history from before then. New order: `.bkit/version`, then `.agents/.bkit-version`, then `package.json`. For bkit itself that's its own `version`; for other repos it's the `@cbartens/bkit` version the lockfile resolved, because `package.json` only holds a range. Each is read at the time of the chat, as `.bkit/version` is today. All five versions above have `.bkit/version`, so this benchmark works without the change; it's for every other repo.
- **Report split by repo.** `harvest/stats.md` leaves `cbartens/bkit-example` out of its usual totals and medians, and shows it in its own section: the versions side by side, oldest first.

After `v5.5.1`, #504 — Example project, design to ship: explainer, demo and benchmark — https://github.com/cbartens/bkit/issues/504 carries on in the same repo, so its benchmark runs sit in the same history and the same `.bkit/stats.jsonl`.

### Success criteria

- One command runs all five versions end to end with no human input, and can be restarted from any version.
- The repo's history shows, per version: the wipe commit listing what differs from the tag, the run's own PRs and merges, and a tagged end-of-run commit with its result row.
- No run can publish to npm, call a paid API from GitHub Actions, or write to any repo other than `cbartens/bkit-example`, and every agent and session runs on a 5.5 model.
- The harvest gives every phase of every version a `chat` row with the right bkit version, and its report shows the five versions side by side: tokens per phase, agents, wall time, owner replies, how each phase ended, and whether the check passed. bkit's own totals stay as they were.
- A run that breaks because of a bug in an old version is recorded as a result (where and how it ended), not fixed and rerun.

### Constraints and non-goals

- **Old prompts on new models.** Older versions' prompts were written for weaker models, and today's models may cover for some of their gaps. The results answer "which workflow design works best on the models we use now", not "what users got at the time". The report says so.
- **The codebase grows with the version.** The agents build the explainer inside bkit itself, so later versions work in a bigger repo. That's part of what's measured.
- **The check is stricter in later versions.** `v3.4.2` and `v4.10.0` check fewer things (table above), so a pass there is an easier bar. The report says so.
- **One run per version is noisy.** The AI behaves a bit differently every run (Ponytail used 10 runs per point, per #43 — Test diff-aware LLM-judge evals — https://github.com/cbartens/bkit/issues/43). Only large differences between versions mean anything.
- **Local Claude Code, not GitHub Actions.** The harvest reads Claude Code's local transcripts. Runs dispatched to GitHub Actions leave none.
- **The transcript archive stays local, out of git.** Transcripts hold the full text of every tool call and its output.
- **Agents run without permission prompts, so the blast radius is limited by credentials.** The runs use a GitHub token that can only reach `cbartens/bkit-example`, never the keyring login that can reach `cbartens/bkit`.
- Not in scope: fixing old versions, a second pass on each version's own models, dollar figures (cost stays in tokens), and hosts other than Claude Code.

### Decisions already made

- Five versions: `v3.4.2`, `v4.10.0`, `v4.12.0`, `v5.0.3`, `v5.5.1`, picked at the changes that most altered how a run behaves (owner, 2026-10-24).
- Every version runs on today's models, with model names rewritten by tier, because this measures the workflows, not the models (owner, 2026-10-24).
- The brief stays word for word; each version's check command is fixed in the table above rather than the brief being changed (owner, 2026-10-24).
- Fully unattended: no human answers anything during a run (owner, 2026-10-24).
- One repo, `cbartens/bkit-example`, for all runs, wiped and refilled per version, with each run committed and pushed. The whole series stays in one history, which #504 then builds on (owner, 2026-10-24).
- `.bkit/stats.jsonl` keeps building across versions. The harvest of the chat transcripts is the measure that's the same for every version, and the chats are picked out by repo (owner, 2026-10-24).
- The harvest finds each chat's bkit version from the repo's files, `package.json` included, for every repo it reads (owner, 2026-10-24).
- bkit is rebuilt from git tags, not installed from npm.

### Open questions

- **What does one run cost?** Not known until the #687 trial runs. The series is roughly five times that.
- **How does the script tell a phase has finished?** All five versions write `status.jsonl`, but its rows change shape between versions. Proposed: judge by what's on GitHub and on disk for every version alike (design doc written, plan written, PR opened, PR merged).
- **Does an old version start the next phase by itself, inside the same session?** Not checked. If one does, that chat spans two phases. The script then has to stop it at the phase boundary, or the split has to come from the turn times.
- **Old CI on the repo.** The `ci.yml` files from v1 to v4 use no secrets beyond `GITHUB_TOKEN`, so they should run as they are. Not yet tried.

### Risky versions

- `v3.4.2`: before 4.6.0, ship could merge with CI red, and plan and design closes could fail. Its runs may end early. That's a result, and the script's own check is what judges pass or fail.
- `v4.12.0`: one squash commit, so what's inside can't be separated. The commits on `dev` between 2026-07-28 and 2026-08-26 show its parts, from #382 (`d64ef5be1`).
- Avoided on purpose: 4.1.2 (`.npmrc` regression), 4.7.x (compliance checks did nothing), 5.0.0 to 5.0.2 (CI gate fails on a fresh checkout).

### References

- #504 — Example project, design to ship: explainer, demo and benchmark — https://github.com/cbartens/bkit/issues/504 (parent; comment https://github.com/cbartens/bkit/issues/504#issuecomment-6378781227 covers how the trial runs and what `stats.jsonl` records)
- #687 — Explainer page: step through a bkit run, phase by phase — https://github.com/cbartens/bkit/issues/687 (the brief used as the test task)
- #688 — Harvest: per-run tokens, plan reads, handover context, owner waits — https://github.com/cbartens/bkit/issues/688 (more fields per chat; the archive can be harvested again once it lands)
- #663 — Workflow prompt process token optimisation — https://github.com/cbartens/bkit/issues/663
- #43 — Test diff-aware LLM-judge evals — https://github.com/cbartens/bkit/issues/43 (eval tiers and the Ponytail findings on repeated runs)
- `CHANGELOG.md` (version picks)
- `.bkit/prompts.md` § Orchestrators (orchestrator model per workflow)
- `scripts/harvest/bkit-harvest.mjs` (`versionHistory`, `parseVersionFile`, `versionAt`, `renderReport`, `chat` row format in the header)
- `docs/observability.md` § Harvest — every repo, every chat (bkit repo only)

###### bkit:blocked-by start

- #687

###### bkit:blocked-by end
