Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- 4 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/701-engine-work-build/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/701-engine-work-build/plan-v1-draft.md`, `docs/plans/202610/logs/701-engine-work-build/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/701-engine-work-build/related-deferrals.md`, `docs/plans/202610/logs/701-engine-work-build/related-failures.md`, `docs/plans/202610/logs/701-engine-work-build/related-issues.md` |
| plan-review | CONCERNS | 13 | 1 | `docs/plans/202610/logs/701-engine-work-build/plan-review-1.md`, `docs/plans/202610/logs/701-engine-work-build/plan-review-2.md`, `docs/plans/202610/logs/701-engine-work-build/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202610/logs/701-engine-work-build/plan-v2-reviewed.md`, `docs/plans/202610/logs/701-engine-work-build/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

`#701` `### Narrative`, verbatim:

A bkit maintainer wants the build and ship subagents to stop re-deriving facts the engine already holds. After this, the verifier and the deferred sweep decide only what needs judgement, and the engine computes the verdicts, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests and writes the deferral rows.

### Success Criteria

`#701` `### Success Criteria`, verbatim:

- `bkit tests green` prints `verdict` and a `fixable` per gap; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping and no verdict mapping.
- No subagent edits the plan to tick a task; `bkit tasks tick` does it.
- `bkit tests plan-check` exits 1 on a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row.
- `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the disabled-test list lives.
- `bkit ledgers triage` prints each deferral's bucket and writes the `unjustified` / `TRIAGED` rows; `bkit-ship-deferred-sweep.md` names no reason test.

### Process Sketch

- **WHEN** the build's verify step runs `bkit tests green --group={N}` **→ THEN** the report and stdout carry a `verdict` and each gap carries `fixable` (`true` / `false` / `null`) and its ready-to-append log line.
- **WHEN** a gap needs a diff read (`test-changed`, `red-mismatch`, `delete-still-referenced`, a row `Changed since red = added lines only`) **→ THEN** that gap prints `fixable: null` and the report's `verdict` is `null`; the verifier decides each one from the diff it reads, logs the line with its decided `Fixable: true|false` in place of `null`, and its artifact header `Verdict:` is the post-judgement roll-up (`PASS` / `CONCERNS` / `FAIL`), never `null`.
- **WHEN** the verifier judges a task's `DONE WHEN` satisfied **→ THEN** its header carries the satisfied task numbers and the workflow ticks them with `bkit tasks tick` — per group at Step 7 (`--group`), cross-group at the holistic Step 9 (`--tasks` alone); no agent edits the plan.
- **WHEN** a build group's execute log holds neither a `DONE` nor a `BLOCKED` line for some of the group's tasks **→ THEN** `bkit tasks open` lists exactly those tasks and prints `handover: true`.
- **WHEN** the plan-currency step runs `bkit tasks currency --base={BASE_SHA}` **→ THEN** each task whose paths or needles moved between `{BASE_SHA}` and `origin/dev` is printed with its matched paths and diff hunks, and no hunk outside that set appears.
- **WHEN** the ship step runs `bkit branches scan-diff --disabled-tests --base=origin/dev` **→ THEN** it exits 1 on an added `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` or deleted assertion, printing `file:line` and the test name; a skip predating the base is ignored.
- **WHEN** the ship step runs `bkit ledgers triage --fid={FID} --plan={PLAN}` **→ THEN** each deferral row prints its bucket (`Exempt` / `Lazy`) and, when the reason does not hold, a same-`key` `unjustified` / `TRIAGED` row is appended with a minted `ts` — a `low-severity` `LOW` row stays `Exempt` and writes nothing.

### Concrete Example

**Setup:** A bkit maintainer resumes `/bkit-build` on a plan whose group 1 has one task the executor finished and one it left untouched; the branch is a feature branch off `origin/dev`, and the plan's `Derived Test Matrix` carries a `Task` column.

**Steps:**

1. The build runs Step 6 for group 1 → the executor writes `DONE — TASK 1` and returns `HANDOVER` because its turn cap was near.
2. Step 6's route calls `bkit tasks open --plan={PLAN} --group=1 --log={EXECUTE_LOG}` → it prints task 2 (neither line) and `handover: true`, so the build re-runs Step 6 for the handover with a brief that leaves out task 1.
3. Step 7 calls `bkit tests green --group=1` → the report prints `verdict: null`, and task 2's gap prints `fixable: null` with its log line; the verifier reads that gap's diff itself, decides the gap, logs the line with its decided `Fixable: false`, judges task 1's `DONE WHEN` satisfied in the codebase, and returns the satisfied number with its header `Verdict:` = `FAIL` (the roll-up over its decided `false`).
4. Step 7 calls `bkit tasks tick --plan={PLAN} --group=1 --tasks=1` → the plan's task 1 line becomes ticked and its number is printed; the verifier never writes the plan.
5. At `/bkit-ship`, Step 5 runs `bkit branches scan-diff --disabled-tests --base=origin/dev` → exit 0 with `disabled: []`, so the sweep's report names no disabled test; `bkit ledgers triage --fid=... --plan=...` prints `Exempt` for a `low-severity` row and writes nothing.

**Outcome:** the plan is ticked by a command, the verdict and every `fixable` come from the engine, the disabled-test list exists in exactly one place, and the deferral rows are written by the engine — every remaining decision is the agent's.

### Edge Cases

`#701` `### Edge Cases`, verbatim, plus plan-added validation / error / boundary cases:

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| a gap kind needs a diff read (`test-changed`) | `tests green` prints `fixable: null` and `verdict: null`; the verifier classifies it |
| a plan has no task blocks | `tasks tick` / `open` / `currency` refuse, naming the plan-check reason |
| a task number named to `tick` sits in another group | `tick --group=` exits 2 and names the task and its group; with no `--group` (the holistic call) a number naming no task the plan defines exits 2 |
| a `Derived Test Matrix` row maps to two tasks | `plan-check` exits 1, naming the row and both tasks |
| a `DELETE` has no `Supersession Inventory` row | `plan-check` exits 1, naming the missing row |
| the diff adds a `.skip` inside a planned test | `scan-diff --disabled-tests` exits 1 with `file:line` and the test name |
| a `.skip` predates `--base` | `scan-diff` ignores it |
| a deferral's `reason` is `low-severity` with `severity: LOW` | `ledgers triage` keeps it `Exempt` and writes no row |
| a deferral's `reason` does not hold at ship time | `ledgers triage` marks it `Lazy` and writes an `unjustified` / `TRIAGED` row with a minted `ts` |
| `green` finds no gap at all (plan-added) | it prints `verdict: PASS` with `gaps: []`, exit 0; the workflow ticks the group's tasks with `bkit tasks tick` and logs no gap |
| a `Derived Test Matrix` carries no `Task` column (plan-added) | `plan-check` exits 1 with one `matrix` problem naming the column to add, never one problem per row |
| a `Derived Test Matrix` row names a task the plan does not define (plan-added) | `plan-check` exits 1, naming the row and the unknown number |
| a task whose only `TEST FIRST` entry is `n/a — {reason}` (plan-added) | no matrix row is required for it; `plan-check` accepts the plan |
| `tick` names a task already ticked (plan-added) | nothing changes, the number is printed, exit 0 — ticking is idempotent |
| `--tasks` carries a value that is not a task number (plan-added) | exit 2, the bad value named, no line written |
| `--plan` names no file (plan-added) | each `tasks` verb exits 2, naming the path |
| `ledgers triage` finds no deferral row for the FID (plan-added) | it prints an empty bucket list, writes no row, exit 0 |
| `scan-diff --disabled-tests` on a diff that adds no disabled test (plan-added) | exit 0 with `disabled: []` — never a silent non-run |
| `currency` matches no task (plan-added) | it prints no hunks, exit 0; the plan-currency agent reads that as "no affected task" |
| a plan carries no `Derived Test Matrix` section (plan-added) | `matrix` is a no-op: the plan is not refused for the absence, because a refusal on a row presupposes the table and issue-form plans carry none |
| a build appends a test-bearing task to a matrix-bearing plan — `challenge merge`, Step 5 `Fix now` (plan-added) | the producer writes the task's `Derived Test Matrix` row in the same append, so the bidirectional `matrix` check holds and the append lands |
| a plan resumed from before this change carries a matrix with no `Task` column (plan-added) | `plan-check` exits 1 with one `matrix` problem naming the column; build Steps 3 and 7 route it to `@bkit-build-plan-convert`, like a `markers` problem |
| a red's test gained added lines only (plan-added) | `green` emits one `test-changed` gap with `fixable: null`, the row's `changed` = `added lines only`, and exits 1; the verifier clears it only when the added lines sit outside every planned test |
| a report gap prints `fixable: null` / the report `verdict` is `null` (plan-added) | the verifier logs the line with its decided `Fixable: true\|false` and its artifact header `Verdict:` carries the roll-up (`PASS` / `CONCERNS` / `FAIL`), never `null` |
| `no-red` on a task the plan-currency report classifies `Broken` with work already landed, and the execute log records `DONE — TASK {N}: already landed` (plan-added) | the verifier overrides the engine's `no-red` `fixable: false` and records no gap — the build does not regress to a Decision Pause |
| the holistic verify judges a task in an earlier group satisfied (plan-added) | the workflow runs `bkit tasks tick --plan= --tasks={NUMBERS}` with no `--group`, so the ship summary sees no unticked task |
| dev moves an affected task's paths after `{BASE_SHA}` (plan-added) | `currency --base={BASE_SHA} --against=origin/dev` matches it; a change the branch itself landed since the base does not match |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question:** where do the plan-block verbs live? → `#701` `Open Questions` item 1, carried forward.
  - **Options:** A — a new `tasks` noun · B — fold into `context` (`brief`, `diff`) and `tests`.
  - **Recommended:** A — the plan-block verbs sit together and `context` keeps artifact work.
  - **Default if unanswered:** A.
- **Open Question:** does `tests green` always print `verdict`? → `#701` `Open Questions` item 2, carried forward.
  - **Options:** A — always · B — behind `--verdict`.
  - **Recommended:** A — the audit log is already machine-read.
  - **Default if unanswered:** A.
- **Open Question:** does `tick` tick the whole group or only `--tasks=`? → `#701` `Open Questions` item 3, carried forward; the plan's tasks and matrix rows pin both halves, so this is a confirmation, not an open fork. The holistic call (row 9) passes `--tasks` with no `--group`, which ticks across groups.
  - **Options:** A — only the named tasks · B — every task in the group with no gap, narrowed by `--tasks=`.
  - **Recommended:** B — the verifier passes the numbers it judged satisfied, so a named-only `tick` would lose the engine's own test-first gap filter; `--tasks=` narrows it.
  - **Default if unanswered:** B.
- **Open Question:** how does `plan-check` know which task a `Derived Test Matrix` row maps to? → answered by this plan; the human confirms because it changes the plan format for every producer.
  - **Options:** A — the row's `Task` cell (a fourth column; `651-sops-env-backup-plan.md` already ships one) · B — infer the mapping from the row's `Target file` plus its test words against each task's `TEST FIRST` · C — check nothing and leave the mapping to the scope-check agent.
  - **Recommended:** A — B cannot discriminate (`700-session-start-nudge-plan.md`'s rows 4-14 share one target file across tasks 1-3, and row wording there differs from every `TEST FIRST` name), and C leaves Success Criterion 3 unmet.
  - **Default if unanswered:** A.
- **Open Question:** what is `fixable` for a `not-green` gap? → answered by this plan from the mapping it moves; the issue's `Tasks` Task 1 `DONE WHEN` lists `false, false, null` for a `not-green`, `no-red`, `test-changed` fixture, which contradicts the prompt's own Process 8 (`not-green` → `Fixable: true`, `bkit-build-plan-verify.md:68`).
  - **Options:** A — `not-green` → `fixable: true` (the prompt's mapping, moved verbatim) · B — `not-green` → `fixable: false` (the issue's literal value order).
  - **Recommended:** A — the engine's mapping must equal the mapping it replaces, or the verifier's verdict changes for every failing test; and `not-green` is exactly the gap a fix executor closes.
  - **Default if unanswered:** A.
- **Open Question:** which gap wins the report `verdict`? The issue's Edge Case says a diff-reading kind prints `verdict: null`, and its Task 1 `DONE WHEN` fixture holds an unfixable gap alongside a diff-reading one.
  - **Options:** A — any `fixable: null` gap makes `verdict` null, so the verifier applies its mapping to every gap · B — any `fixable: false` gap makes `verdict` `FAIL`, else null.
  - **Recommended:** A — it is what the issue's Edge Case and its `DONE WHEN` fixture both state; the verifier still reaches `FAIL` from the gap lines the engine emits.
  - **Default if unanswered:** A.
- **Open Question:** what happens to `no-red`'s "work already landed" exemption? The prompt clears a `no-red` gap when the plan-currency report classifies the task `Broken` **and** the execute log records `DONE — TASK {N}: already landed`; the engine's mapping marks every `no-red` `fixable: false`, which becomes a `FAIL`.
  - **Options:** A — keep the exemption in the prompt as a verifier override of the engine's `fixable: false` · B — teach `tests green` to suppress the `no-red` gap itself when the execute log records the `already landed` line for the task.
  - **Recommended:** A — the exemption needs the plan-currency report, which the engine does not read for this verb, and the verifier is the caller that holds it; B would push a plan-currency classification into the test-first audit.
  - **Default if unanswered:** A.
- **Open Question:** what does the verify artifact's `Verdict:` header carry when the report's `verdict` is `null`? `steps finish` refuses any word but `PASS` / `CONCERNS` / `FAIL`, and the prompt's gap log contract accepts only `— Fixable: true` / `— Fixable: false`.
  - **Options:** A — the header is the verifier's post-judgement roll-up (any decided `false` → `FAIL`; else any decided `true` → `CONCERNS`; else `PASS`), and each gap line carries the verifier's decided `Fixable` in place of the engine's `null` · B — the report's `null` is copied into the header and `steps finish` is widened to accept it.
  - **Recommended:** A — the header is the step's own contract and the log line feeds `bkit-build-plan-gaps-remediate`, which must see a decided value.
  - **Default if unanswered:** A.
- **Open Question:** how does the holistic verify (build Step 9) tick a task in an earlier group, when `tick --group=` exits 2 on a task outside the group?
  - **Options:** A — `--group` is optional: with it, a named number outside the group exits 2; without it, `tick --tasks=` ticks every named task the plan defines, whatever its group · B — Step 9 runs one `tick` per group, over the numbers that group holds.
  - **Recommended:** A — one call, and the group constraint stays the guard it is for the per-group caller.
  - **Default if unanswered:** A.
- **Open Question:** which gap kind does a red whose test gained added lines only emit? Today that row produces no gap at all.
  - **Options:** A — `test-changed`, the kind already in `TEST_ORDER_GAPS` and already one of the prompt's four diff reads; the row's `changed` = `added lines only` tells the verifier which read applies · B — a new kind (e.g. `red-added-lines`) joining `TEST_ORDER_GAPS`, the workflow's test-order gap list and the prompt.
  - **Recommended:** A — no new kind, no new set membership, and the verifier already distinguishes the case by the row state; B widens four lists for one row state.
  - **Default if unanswered:** A.
- **Open Question:** `tick` with neither `--tasks` nor `--green` ticks every gap-free task in the group (row 3, option B) — a caller that forgets `--tasks=` ticks tasks no agent judged satisfied.
  - **Options:** A — keep the default and name its only intended caller in the verb's `--help` · B — require one of `--tasks` / `--green`, exit 2 otherwise.
  - **Recommended:** A — the verifier always passes `--tasks`, and B would make the verb unusable for the step-7 call that legitimately has no gaps to exclude.
  - **Default if unanswered:** A.
- **Open Question:** what does `currency` compare against? The process it replaces judges `{BASE_SHA}..origin/dev`; the plan's first draft said `{base}..HEAD`.
  - **Options:** A — `{base}..{against}` with `--against` defaulting to `origin/dev`, and the plan-current prompt passes `--base={BASE_SHA}` · B — `{base}..HEAD`.
  - **Recommended:** A — on the build worktree `HEAD` is the feature branch and Step 3 merges only `docs/` from dev, so `{base}..HEAD` misses dev's code-side movement, the check's whole signal, and on a resume flags every earlier group.
  - **Default if unanswered:** A.
- **Assumption:** the engine's `fixable` vocabulary is `true` / `false` / `null`, where `null` means "the answer needs a diff read" — the four sites the issue names (`delete-still-referenced`, `test-changed`, `red-mismatch`, row `Changed since red = added lines only`). → if wrong (for example the engine is expected to decide `delete-still-referenced` itself), the verifier loses a judgement it must keep and the `deleteGaps` codebase read becomes load-bearing; the mapping is one table in `tests.ts` and moves in one edit.
- **Assumption:** the `Task` column is the plan's only mapping carrier, the `matrix` check is a no-op on a plan that carries no `Derived Test Matrix` section, and every in-flight plan that carries the table gets the column added mechanically before it is built. → if wrong, a resumed build of an older matrix-bearing plan stops in Step 3's `plan-check` with one `matrix` problem naming the missing column (never a per-row flood) and Steps 3 and 7 route it to `@bkit-build-plan-convert`; a plan with no table at all is never refused for the absence.
- **Assumption:** `tick` may write the plan file, so the file it writes is the one `plan-check` reads back, and the write is line-addressed through `parsePlanBlocks`'s task `line` field, never a re-render. → if wrong, a plan re-render would lose consumer prose; `DONE WHEN` pins the line-addressed write and `tasks.test.ts` pins that no other line changes.
- **Assumption:** `ledgers triage` can decide the four reason tests from the ledger row, the plan and the diff, without a human. → if wrong on a row the engine cannot decide, that row is bucketed `Exempt` and no row is written: the failure mode is a missed `unjustified` verdict, never a wrong one written over a genuine deferral.
- **Assumption:** the disabled-test marker set (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, and a removed assertion line inside a test file) covers what `.bkit/jsonl.md` and the sweep's Process 8 name, with `docs/plans/**` excluded, and `branches.ts`'s set is aligned with the one `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` already carries. → if wrong, the sweep's gate under-reports; the verb is the single place the list lives, so widening the set is one edit in `branches.ts`.
- **Assumption:** the deferral rows this plan writes (`reason` `scope-declared`, one per `Exempt` row that holds real future work) are the only new ledger rows, and the three rows that keep judgement with an agent carry none. → if wrong, `/bkit-ship`'s `ledgers triage` sees a row with no bounded remediation and buckets it `Lazy`, writing an `unjustified` row against a deferral that was never work.
- **Assumption:** the new problems refuse every plan-check caller, including `bkit tests plan-check --existence=report` in build Steps 3 and 7 and `--existence=refuse` in plan Steps 3 and 7. → if wrong, a build whose plan has an unmapped matrix row proceeds and the criterion is unenforced; `plan-check` has one refusal path, so correcting it is one return value.
- **Assumption:** the in-build producers of test-bearing tasks — `bkit challenge merge`'s `appendTasks` and build Step 5's `Fix now` writer — write a `Derived Test Matrix` row for every task they add. → if wrong, the append is refused by the `matrix` check inside its own written range and the findings are stranded (the failure the review round named).
- **Assumption:** the engine's `no-red` → `fixable: false` is the prompt's to override for the "work already landed" case, and the verifier is the only caller holding the plan-currency classification and the execute log the override reads. → if wrong, a resumed build whose work already landed turns `FAIL` and stops in a Decision Pause for a human-written `TEST EXCEPTION`.
- **Assumption:** `green` emitting a `test-changed` gap for `changed: added lines only` moves that row's `green` exit from 0 to 1 and adds it to `testOrderOnly`, and the verifier's own diff read clears it whenever the added lines sit outside every planned test. → if wrong, builds whose tests only gained lines block on a test-order gap the verifier cannot clear.
- **Assumption:** the `Out of Scope` reader `ledgers triage`'s fourth reason test needs is a new export in `plan-blocks.ts` beside `reuseInventory`, because the only existing one is the private, unexported `planSection` in `context.ts`, reached through `BRIEF_SECTIONS`. → if wrong, the `scope-declared` test has no declaration to read and every `scope-declared` row buckets `Lazy`.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #701
```

Or, to address the reasons first: `/bkit-plan #701`
