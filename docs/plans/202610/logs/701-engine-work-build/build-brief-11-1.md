# Brief: group 11 — Challenge round 2 findings

Plan: Engine Facts in Build Verify and Ship Implementation Plan

## Why and what

### Context & Goals

**Problem.** `#676` (closed) audited the six workflow files for orchestrator prose the engine already holds. It did not audit the **subagent prompts**, which carry the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine holds the data. Two agents carry most of it, measured from the prompts (not estimated): `bkit-build-plan-verify` (100 turns, once per group plus once holistic — an 11-row kind→`Fixable` table plus a three-line verdict mapping at `bkit-build-plan-verify.md:67-82`, a task ↔ `DONE` log cross-reference, a task tick, and matrix ↔ runbook coverage), `bkit-ship-deferred-sweep` (200 turns, once per ship — a disabled-test diff scan at `bkit-ship-deferred-sweep.md:69` that decides the ship gate, plus deferral reason tests and a bucket verdict); `bkit-build-plan-current` (50 turns) spends its steps 5-7 on search the engine can do.

**Goal.** `#701`, by the rule `#663` settled: a fact with one right answer is the engine's; judgement is the agent's. The engine computes the test-first verdict and a `fixable` per gap, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests, and writes the deferral rows; the verifier and the deferred sweep keep only what needs judgement (whether the codebase satisfies a task, the four diff reads, the `Executable` / `Reword` / `Broken` call, deliverable verification, doc edits).

**Inputs and precedence.** No design doc and no audit report. `#701` is a `change`-shape issue (`.bkit/trackers.md` § Issue shapes), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Tasks`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word. The plan-input's newest section is the session prompt (`#701` alone), which adds nothing. Two places where the issue's own text disagrees are resolved in this plan and named in `Open Questions & Assumptions` (rows 5 and 6): the order of `fixable` values in `Tasks` Task 1's `DONE WHEN`, and the `tick` default between `Open Questions` item 3 and `Tasks` Task 2.

**Review round merged.** Three lenses reviewed this plan as `plan-v1-draft.md`: plan review (tightness, dependency order, design coverage), code review (regression risk) and the scope check (scope, criteria, verification). Their findings are merged here. Six seams they named are settled and named in `Open Questions & Assumptions` (rows 7-11) or in the sections they touch: the `fixable: null` / `verdict: null` seam at the verifier boundary (the engine's `logLine` is a template the verifier substitutes its decided `Fixable` into, and the artifact header `Verdict:` is the post-judgement roll-up, never the report's `null`); the `no-red` "work already landed" exemption kept in the prompt as a verifier override; the holistic verify's group-required tick path; the `matrix` check's semantics, the three in-build producers it would otherwise strand, and the recovery route for a legacy plan; `tasks currency`'s diff range (`{base}...{against}`, `against` = `origin/dev` — three dots is merge-base(`{base}`, `{against}`)..`{against}`, identical to two dots when `{base}` is an ancestor of `{against}`, the normal case now that design and plan worktrees base on `origin/dev`, and it matches `branches scan-diff`, which already diffs `<base>...HEAD`); and the `Changed since red = added lines only` gap (kind `test-changed`, `fixable: null`).

**Related Issues:**

- `#701` — Engine work in build verify and ship: emit the facts, keep the judgement (open — this issue)
- `#663` — Workflow prompt process token optimisation (closed — parent; settled the engine-fact / judgement rule)
- `#676` — Orchestrator work the engine could do as bkit commands (closed — the workflow-prose half of the same audit; this plan is the subagent-prompt half)
- `#685` — How plans are shaped, reviewed and built (closed — the plan-block format this plan reads and writes)
- `#665` — Fewer plan reviewers and rounds; challenge only on large diffs (closed — why the plan-review fan-out stays at two reviewers plus the scope check)
- `#668` — Build in task slices: symbol refs per task, 160k cap per agent (closed — the per-task `CREATE` / `READ` / `UPDATE` / `DELETE` fields `tasks currency` reads)
- `#679` — Engine commands for the build / ship orchestration prose (closed — created `branches scan-diff`, the verb Task 6 extends, and the raw-call fence guard; its "print only the fields the workflow reads next" rule applies to Task 6's new output)
- `#656` — Test-order gaps: `no-red` / `late-red` / `test-changed` and the caps (closed — created the gap kinds Task 1 maps and the 10-tests / 3-files caps every group here holds)
- `#680` — ledgers append: engine writes ledger rows with a minted ts (closed — the append machinery `ledgers triage` reuses)
- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (open — shipped-pending neighbour, no shared surface)

---

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

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The deferred sweep's deliverable verification (Process 7) | `#701` declared it out of scope before work started; it is judgement (does the codebase satisfy a deliverable), no Success Criterion or matrix row needs it; `docs/deferrals.jsonl` key `701-sweep-deliverable-verification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 7 |
| `plan-current`'s `Executable` / `Reword` / `Broken` classification | `#701` declared it out of scope before work started; the engine cannot decide whether landed changes leave a task executable, and Task 4 keeps the call; `docs/deferrals.jsonl` key `701-plan-current-classification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-current.md` § Process 8 |
| The four diff-reading test-order classifications in `bkit-build-plan-verify.md` | `#701` declared them out of scope before work started; they are judgement, and Task 1 keeps them; `docs/deferrals.jsonl` key `701-verify-diff-reads-stay-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 |
| Design-workflow reviewers | `#701` declared them out of scope before work started: no design-run measurements exist, so which prose is mechanical is unmeasured — real future work | new audit of the design prompts; `docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit` |

## Where it fits

- Group 1: `tests green` emits the test-first verdict, a `fixable` per gap and the gap log lines — done
  - TASK 1: `tests green` emits `verdict`, a `fixable` per gap and the gap log lines — done
- Group 2: The plan tick, the group handover and the `tasks` noun come from the engine — done
  - TASK 2: Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — done
  - TASK 3: `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line — done
- Group 3: `tasks currency` replaces plan-current's path and symbol search — done
  - TASK 4: `tasks currency` — plan-current's path and symbol match — done
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — done
  - TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — done
  - TASK 6: `branches scan-diff --disabled-tests` — done
- Group 5: The sweep's deferral rules move to the engine — done
  - TASK 7: `ledgers triage` — done
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — done
- Group 6: Producers, docs, indexes and mirrors — done
  - TASK 9: The plan format teaches the producers: the clause and its carriers — done
  - TASK 10: Sync the docs the change touches — done
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — done
- Group 7: Challenge round 1 findings — done
  - TASK 12: `ledgers triage` adjudicates a genuine `own-cycle` ("new architecture") deferral as `unjustified` and appends a permanent wrong verdict — `.bkit/jsonl.md` test 1 requires "not a new architecture", and no predicate implements it nor excludes `own-cycle` — done
  - TASK 13: `scan-diff --disabled-tests` reports every removed line of a test file that matches `ASSERTION` (`expect|assert\w*|should|should_\w+`), so deleting a comment, an import line or an assertion moved elsewhere sets exit 1 and the sweep records a `Blocking Deferral` + `Verdict: FAIL` — done
  - TASK 14: `scan-diff --disabled-tests` misses Python's skipped tests — `@pytest.mark.skip` and `@unittest.skip` match no marker, so a run that disables Python tests exits 0 with `disabled: []` and the ship gate passes — done
- Group 8: Plan matrix repair — done
  - TASK 19: Add the `Derived Test Matrix` rows tasks 12-18 are missing, so the plan passes its own `matrix` check — done
- Group 9: Challenge round 1 findings — done
  - TASK 15: Build Steps 7 and 9 pass the verify header's documented empty form `Tasks: none` straight into `--tasks=`, which `tick` refuses with exit 2 — every verify round that satisfies no task logs a usage error and ticks nothing — done
  - TASK 16: `ledgers triage` re-adjudicates a `status: "CLOSED"` deferral (work already finished) and appends `reason: "unjustified"` / `status: "TRIAGED"`, moving finished work back onto the triage ladder and adding an unjustified count to `computeDeferralDiscipline` — done
  - TASK 17: A deferral already adjudicated `unjustified` is bucketed `Exempt` on every later run, so the ship sweep records an outstanding unjustified deferral under `Exempt Deferrals` and the summary reports it as settled — done
- Group 10: Challenge round 1 findings — done
  - TASK 18: `ledgers triage` reads the plan's task surfaces without checking `parsePlanBlocks`' errors, so a plan with no task blocks silently buckets every deferral `Exempt` (exit 0, no warning) — the one plan reader that neither refuses nor warns — done
- Group 11: Challenge round 2 findings — this group
  - TASK 20: `scan-diff --disabled-tests` matches its disable markers on every added line of every file, so any prose that quotes `test.skip` / `describe.skip` / `@Disabled` / `t.Skip(` / `xfail` — a skill doc, `docs/knowledge.jsonl`, `docs/testing.md`, the marker's own regex literal in `branches.ts` — is reported as a disabled test, and the ship sweep turns that `disabled` list into Blocking Deferrals + `Verdict: FAIL`; this branch's own diff already exits 1 with 18 hits (`.agents/skills/vitest/references/core-describe.md:60`, `docs/knowledge.jsonl:321`, `.bkit/core/engine/commands/workflow/branches.ts:1080`, its `dist/` copy, …) — open
  - TASK 21: `scan-diff --disabled-tests` reports a test file whose assertion **changed** as a disabled test — the re-add check compares each removed line's exact trimmed text against the added lines, not the file's assertion count — so the round-1 comment/import/move fix still fires on any edited expectation or matcher, and the sweep records a Blocking Deferral for a test that is intact; this branch's own diff carries two such hits (`.bkit/core/engine/commands/workflow/tests.test.ts:1769` from `{ enforced: true, gaps: [] }` → `{ …, verdict: "PASS" }`, and `:2065` from `toEqual([])` → `toEqual([objectContaining(…)])`) — open
  - TASK 22: `scan-diff --disabled-tests` cannot see a **deleted** test file — git writes `+++ /dev/null` for a deletion, the loop overwrites `file` with that path, `TEST_FILE` no longer matches and no removed assertion is recorded — so a diff that removes an entire `*.test.*` file (every test and assertion in it) exits 0 with `disabled: []` and the ship gate passes the strongest form of test removal — open
- Group 12: Challenge round 2 findings — next
  - TASK 23: `scan-diff --disabled-tests` tallies re-added assertion lines across the whole diff, not per file, so deleting `expect(2).toBe(2);` from `src/a.test.ts` and adding the identical trimmed line in any other file (verified with `src/notes.md`) exits 0 with `disabled: []` — the ship gate passes with a dropped assertion, against task 13's own `DONE WHEN` ("a net drop in the file" still reported) — open

## The work

<!-- bkit:task 20 start -->

- [ ] **TASK 20:** `scan-diff --disabled-tests` matches its disable markers on every added line of every file, so any prose that quotes `test.skip` / `describe.skip` / `@Disabled` / `t.Skip(` / `xfail` — a skill doc, `docs/knowledge.jsonl`, `docs/testing.md`, the marker's own regex literal in `branches.ts` — is reported as a disabled test, and the ship sweep turns that `disabled` list into Blocking Deferrals + `Verdict: FAIL`; this branch's own diff already exits 1 with 18 hits (`.agents/skills/vitest/references/core-describe.md:60`, `docs/knowledge.jsonl:321`, `.bkit/core/engine/commands/workflow/branches.ts:1080`, its `dist/` copy, …)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1090` · **Round:** 2
  - **DONE WHEN:** `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` on this branch exits 0 with `disabled: []` — its only marker-shaped added lines are quoted prose under `.agents/skills/**` and `docs/*`, the engine's own marker literals in `branches.ts` / `dist/`, and `branches.test.ts`'s `'@pytest.mark.skip(…)'` fixture strings; an added `test.skip(` / `@pytest.mark.skip` / `@Disabled` **call** in a `*.test.*` / `*.spec.*` / `test_*.py` file still exits 1 naming `file:line` and the test — `markersFor` scopes the marker set to test files and the added-line check skips a marker inside a comment or a quoted span, instead of handing `DISABLED_MARKERS` to every path
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a quoted skip in a documentation file` fails on today's code: a branch that adds `docs/guide.md` holding "never call \`test.skip\` in a spec; a \`describe.skip\` hides regressions" exits 1 with `disabled: [{file: "docs/guide.md", line: 3, test: "Never call \`test.skip\` …"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a marker literal in a non-test source file` fails on today's code: adding the line `/@Disabled\b/,` to a `.ts` source file exits 1 with that line's text as the test name

<!-- bkit:task 20 end -->

<!-- bkit:task 21 start -->

- [ ] **TASK 21:** `scan-diff --disabled-tests` reports a test file whose assertion **changed** as a disabled test — the re-add check compares each removed line's exact trimmed text against the added lines, not the file's assertion count — so the round-1 comment/import/move fix still fires on any edited expectation or matcher, and the sweep records a Blocking Deferral for a test that is intact; this branch's own diff carries two such hits (`.bkit/core/engine/commands/workflow/tests.test.ts:1769` from `{ enforced: true, gaps: [] }` → `{ …, verdict: "PASS" }`, and `:2065` from `toEqual([])` → `toEqual([objectContaining(…)])`)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1194` · **Round:** 2
  - **DONE WHEN:** a diff that rewrites one assertion's expected value or matcher inside a test body exits 0 with `disabled: []`; a diff that drops one assertion and adds a different one to the same test still exits 0; a diff whose removed assertion count exceeds its added assertion count in that file exits 1 naming the file, line and test (a net drop, as `Task 13`'s `DONE WHEN` words it); the repo's own `tests.test.ts` diff yields no hit
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion whose expectation changed` fails on today's code: `expect(1).toBe(1)` → `expect(1).toBe(2)` exits 1 with `disabled: [{file: "src/a.test.ts", line: 2, test: "a"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion replaced by another in the same test` fails on today's code: `expect(a).toEqual([])` → `expect(a).toEqual([expect.objectContaining({})])` exits 1

<!-- bkit:task 21 end -->

<!-- bkit:task 22 start -->

- [ ] **TASK 22:** `scan-diff --disabled-tests` cannot see a **deleted** test file — git writes `+++ /dev/null` for a deletion, the loop overwrites `file` with that path, `TEST_FILE` no longer matches and no removed assertion is recorded — so a diff that removes an entire `*.test.*` file (every test and assertion in it) exits 0 with `disabled: []` and the ship gate passes the strongest form of test removal
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1170` · **Round:** 2
  - **DONE WHEN:** the diff walk keeps the `--- a/{path}` token and uses it when `+++` is `/dev/null`, so a deleted test file reports its removed assertions (naming the file, its line and the nearest declaration) and exits 1, while an added file still resolves its `+++` path and an ordinary edit is unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a deleted test file` fails on today's code: `git rm src/a.test.ts` (3 lines, one `it` with one `expect`) on a feature branch exits 0 with `disabled: []`, `found: false`

<!-- bkit:task 22 end -->
