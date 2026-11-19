# Takeover of a test whose in-between owner is unbuilt Implementation Plan

## Context & Goals

A planned test is locked from the group's tests step on. A takeover moves that lock onto the rewritten lines, but only when the takeover's `build-tests-red` entry carries `from`. `bkit tests red` drops `from` when the nearest earlier task naming the test has no recorded red yet, and then two locks disagree and every later `steps finish` of a code step exits 11 (#1061, seen in #958). Goal, both in `.bkit/core/engine/commands/workflow/tests.ts`:

- Read side, `lockBaselines`: a red entry of one task for a test that an earlier-recorded key of another task names moves that key, whether or not the entry carries `from` (this frees rows already written).
- Write side, `fromOf` inside `bkit tests red`: `from` is the nearest earlier task naming the test that has a recorded baseline.

The lock stays as strong as before: a code step that changes a locked planned test is still refused with exit 11.

**Related Issues:**

- #1061 — takeover of a test whose in-between owner is unbuilt (this plan)
- #958 — Agents and the orchestrator write their own .md files (where it was seen)
- #1002 — Build: one planned-test lock instead of four mechanisms (waits on an owner decision; this bug stays in the takeover path)

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

A build whose status rows hold a takeover red without `from` passes the same `steps finish` call after the fix, with no row edited by hand, and new takeovers record `from`.

### Success Criteria

- A later task's red for a test an earlier task's key names moves that key, with or without `from`.
- `touchedTests` reports nothing for the issue's row shape when the file holds the later lines.
- `bkit tests red` records `from` as the nearest earlier task that names the test and has a baseline.
- `bkit tests green` lists such a takeover under `takenOver`.
- A code step that changes a locked planned test is still refused.

### Process Sketch

- **WHEN** the owner's red is recorded, then a later task's red for the same test with no `from` **→ THEN** the owner's lock moves onto the later task's lines.
- **WHEN** the file holds TASK 38's lines **→ THEN** `touchedTests` reports nothing.
- **WHEN** an open task with no record sits between the owner and the takeover task **→ THEN** `bkit tests red` records `from` as the owner.
- **IF** no earlier task naming the test has a baseline **→ THEN** `from` stays absent.
- **IF** the file holds lines other than the moved baseline **→ THEN** `touchedTests` still reports the test.

### Concrete Example

**Setup:** The real rows of #958 (read-only): `build-tests-red` of groups 3, 6, 7 and 11 in `.worktrees/958-agents-orchestrator-write/docs/plans/202611/logs/958-agents-orchestrator-write/status.jsonl`.

**Steps:**

1. A unit test builds the same shape: an earlier task's red, then a later task's red for the test with no `from` and a different `block`.
2. The test file holds the later lines → `touchedTests` returns an empty list.

**Outcome:** the `steps finish` refusal "are an earlier task's planned test that no open task of group N names" no longer fires for that shape.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The same test name in another test file | Stays on its own baseline; only the same file and a matching name move. |
| The earlier key's task no longer names the test in the plan | `planned` still limits keys, so a dropped name locks nothing, as before. |
| No earlier task naming the test has a baseline | `from` is absent, as today. |
| The file holds the earlier (old) lines after the move | `touchedTests` reports the test, so a code step is still refused. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a later task's red with no `from` moves an earlier task's key onto its lines | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| rows shaped like #958 (earlier red, later red with no `from` and a different block) with the file holding the later lines: `touchedTests` reports nothing | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| the file holding the earlier lines after that move: `touchedTests` still reports the test (the lock is no weaker) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| the same test name in another file stays on its own baseline (the existing "nobody took over" test, its second entry moved to another file) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| an unbuilt task between the owner and the takeover: `bkit tests red` records `from` as the owner | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| the same plan: `bkit tests green` lists the takeover under `takenOver` from the owner | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| no earlier task naming the test has a baseline: `bkit tests red` records no `from` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

None. No name, file or contract is added or renamed. One existing test, `lockBaselines leaves a test nobody took over on its own baseline`, changes: its data (two tasks, one file, one name, no `from`) is the very shape the issue says must now move, so its second entry moves to another test file and the test keeps its name and its meaning.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** two planned tests of one file with an equal name (`sameTestName`) are one test, so a later task's red for it is a takeover whether or not `from` is set → if two tasks could legitimately own two different tests under one name in one file, the lock would move wrongly; the plan's `planTakeovers` already treats them as one.
- **Assumption:** the moved baseline keeps today's takeover fields (the later entry's `state`, `blob`, `block`, `text` and `origin`) → the final `tests green` diff for those keys is unchanged.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- Rework the whole lock into one mechanism: rejected here, it is #1002 and waits on an owner decision.
- Fix only the write side: rejected, rows already written would stay stuck.
- Add a field to `planTakeovers`' `Takeover` shape for all earlier owners: rejected, existing tests compare that shape exactly; `fromOf` walks `parsePlanBlocks` itself.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Reworking the lock into one mechanism | Only adds to the goal | #1002 |
| A `bkit tests plan-check` warning for such plans | The fix removes the failure instead | None |
| Changes to `steps.ts`, `tasks.ts`, `decisions.ts`, `status.ts`, `.bkit/instructions.md`, workflows and prompts | The run constraints forbid them; none reads `from` or the baseline `origin` in a way that needs a change (checked in TASK 2) | None |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package change.
- [ ] **Dependency Versions:** no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the real #958 rows are read-only reference.
- [ ] **Project Context:** `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows on the planned-test lock are read by the build.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** `None`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** no `NEW` row.
- [ ] **Gate 1 — Verified:** every item above is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — an engine verb's internal logic, no topology change | `.agents/docs.md` index | covered | None. |
| technology | `docs/technology.md` | no — no framework or convention change | `.agents/docs.md` index | covered | None. |
| security | `docs/security.md` | no — no route, secret or input | `.agents/docs.md` index | covered | None. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Test first (the "A later task can take a test over" bullet, line 510), § Repository test patterns | covered | The bullet says the red records the earlier task as `from`; TASK 3 states it as the nearest earlier task with a recorded red. |
| workflow catalog | `.bkit/core/.bkit/workflows.md` | yes | § Taking over an earlier task's test (line 1812) | covered | Source file for the rendered `.bkit/workflows.md`; TASK 3 edits the source and regenerates the copy. |

## Documentation Warnings

None

## Data Schema Integration

None — no database.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A takeover's red entry moves earlier keys with or without `from` | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "lockBaselines\|touchedTests\|\.from\b" tests.ts`; references to `lockBaselines` (`tests.ts`, `steps.ts` through `touchedTests`) | `lockBaselines` in `tests.ts` — moves keys only when the entry carries `from`, missing the case without it | EXTEND | Drop the `from` condition on the existing move loop. |
| `from` is the nearest earlier owner with a baseline | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "fromOf\|planTakeovers" tests.ts`; references to `planTakeovers` (tests only compare its exact shape) | `fromOf` inside `bkit tests red` — takes `planTakeovers`' nearest owner and drops it with no baseline | EXTEND | Walk back through `parsePlanBlocks` tasks to the nearest earlier owner that has a baseline. |
| Tests for both | `.bkit/core/engine/commands/workflow/tests.test.ts` | `grep -n "lockBaselines and takeovers\|describe(\"takeover\"" tests.test.ts` | the `lockBaselines and takeovers` and `takeover` describes — hold the existing fixtures | EXTEND | Add tests beside them; change the one contradicted by the issue. |
| The rule's doc lines | `docs/testing.md`, `.bkit/core/.bkit/workflows.md` | `grep -n "takes over\|taken over\|lock follows" docs/testing.md .bkit/core/.bkit/workflows.md` | `docs/testing.md:510`, `.bkit/core/.bkit/workflows.md:1812` — state `from` as "the earlier task" | EXTEND | Reword the one line in each. |

## Architecture & Component Changes

**Ledger rows:** None

### Backend (engine)

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists (3243 lines).
- `lockBaselines` (~line 489): remove `if (t.from === undefined) continue;` so every kept red entry moves the keys of other tasks that name the same test in the same file.
- `fromOf` in `bkit tests red` (~line 2599): from the nearest earlier task in plan order that names the test and has a baseline in `baselines`.
- The `RedTest.from` doc comment (~line 362) names the nearest earlier owner with a baseline.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** the file exists.
- New tests in the `lockBaselines and takeovers` and `takeover` describes; one existing test's data changes.

### Docs

#### [MODIFY] `docs/testing.md`, `.bkit/core/.bkit/workflows.md`

- One line each (`docs/testing.md:510`, `.bkit/core/.bkit/workflows.md:1812`).

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/testing.md` | The takeover bullet: `from` is the nearest earlier task with a recorded red. |
| `.bkit/core/.bkit/workflows.md` | § Taking over an earlier task's test: same, and the lock moves whether or not the entry carries `from`. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Takeover locks move whether or not `from` is set

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Read side: `lockBaselines` moves earlier keys on any red entry of another task naming the same test
  - **READ:** `lockBaselines` in `.bkit/core/engine/commands/workflow/tests.ts`: the move loop after the `keepsProof` check, gated by `t.from === undefined`
  - **READ:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: the only reader of `lockBaselines` in `steps.ts` (its `finish` lock and the tests step's own lock); it compares each baseline's `block` to the file's lines
  - **READ:** `lockBaselines and takeovers` in `.bkit/core/engine/commands/workflow/tests.test.ts`: the `redRow` and `entry` fixtures
  - **UPDATE:** `lockBaselines` in `.bkit/core/engine/commands/workflow/tests.ts`: the move to other keys no longer needs `from`; the moved fields stay as today
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: import `touchedTests`; add the new tests; in `lockBaselines leaves a test nobody took over on its own baseline`, give task 5's entry `{ test: "src/b.test.ts" }`, since two tasks naming one test in one file is a takeover under the issue
  - **DONE WHEN:** the new `lockBaselines` and `touchedTests` tests pass; `touchedTests` lists nothing for an earlier red plus a later no-`from` red with a different `block` when the file holds the later lines, and still lists the test when the file holds the earlier lines; every other existing test of `touchedTests`, `lockBaselines` and the takeover chain is unchanged and green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `lockBaselines moves an earlier task's key onto a later task's red entry that carries no from` fails on task 2's key keeping "old" while task 5 holds "new"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `touchedTests reports nothing when the file holds the later task's lines and its red carries no from` fails on the test being reported touched for the earlier task, the "no open task of group" refusal of #1061

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Write side: `fromOf` walks back to the nearest earlier owner that has a baseline
  - **READ:** `fromOf` in `.bkit/core/engine/commands/workflow/tests.ts`: today `takeovers.get(...).from` is the nearest earlier owner, kept only if `baselines` holds it
  - **READ:** `takenOverEntry` in `.bkit/core/engine/commands/workflow/tests.ts`: with the `takenOver` push in the green verb, the other reader of a red entry's `from`; it finds the owner's red through `redEntries` by `red.from`, so an owner with a red works unchanged
  - **READ:** `redEntries` in `.bkit/core/engine/commands/workflow/tasks.ts`: `tasks.ts` reads reds through `redEntries` only (no `from`, no baseline `origin`); the baseline `origin` is read by `tests changed` in `tests.ts` through `lockBaselines`, whose moved fields TASK 1 leaves as they were
  - **READ:** `takeover` in `.bkit/core/engine/commands/workflow/tests.test.ts`: the describe with `writeTakeoverPlan`, `groupOneRed`, `red2` and the green call
  - **UPDATE:** `fromOf` in `.bkit/core/engine/commands/workflow/tests.ts`: from the task's place in `parsed.tasks`, walk back to the nearest earlier task whose `TEST FIRST` names the test (posix-normalized file, `sameTestName`) and for which `baselines` holds a key (same test and name); return its number, else `undefined`; `takeovers` still decides whether the entry is a takeover at all
  - **UPDATE:** `RedTest` in `.bkit/core/engine/commands/workflow/tests.ts`: the `from` doc comment, "the nearest earlier task naming this test that has a baseline"
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: add the three tests to the `takeover` describe, with a plan of TASK 1 (group 1), TASK 2 (group 2, unbuilt) and TASK 3 (group 3) naming the same test
  - **DEPENDS ON:** 1
  - **DONE WHEN:** with TASK 1 red recorded and group 2 never run, `bkit tests red --group=3` records TASK 3 with `from: 1`, and `bkit tests green --group=3` lists it under `takenOver` from TASK 1; with no baseline for any earlier owner `from` stays absent; the existing `tests red records a failing takeover as red with from` and the other `takeover` tests stay green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests red records from as the owner when an unbuilt task between the two names the test` fails on the entry carrying no `from`, "from: 1" missing
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests green lists a takeover whose nearest earlier task has no red as taken over from the owner` fails on `takenOver` being empty

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Docs, rendered copy and `dist/` follow the rule
  - **READ:** `docs/testing.md`: the "A later task can take a test over" bullet (line 510)
  - **READ:** `.bkit/core/.bkit/workflows.md`: § Taking over an earlier task's test (line 1812)
  - **UPDATE:** `docs/testing.md`: line 510, the red records the nearest earlier task with a recorded red as `from`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: line 1812, `from` is the nearest earlier task with a recorded red, and the lock follows the takeover whether or not the entry carries `from`; then regenerate the rendered `.bkit/workflows.md` with `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never by hand
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` from the TASK 1 and TASK 2 source
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** both doc lines say it, the rendered copy matches its source, `dist/commands/workflow/tests.js` holds the new `fromOf` and `lockBaselines`, `pnpm bkit:text:ceiling check` exits 0 and `bkit check` shows no drift
  - **TEST FIRST:** n/a — docs and a build output, no behaviour change; the behaviour is covered by TASK 1 and TASK 2

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` file.
- [ ] **Extensions landed:** every `EXTEND` landed in the file its row names.
- [ ] **No gate weakened:** a code step that changes a locked planned test is still refused with exit 11.
- [ ] **Red before code:** the tests step recorded the four planned tests red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** none.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** the two guard rows (the earlier lines still reported, no `from` without a baseline) and the moved-file row are in `DONE WHEN` of TASKs 1 and 2; they pass before and after, so no red can be recorded for them.
- [ ] **Sweep existing tests:** the existing `touchedTests`, `lockBaselines` and takeover tests pass; the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Update documentation:** the two doc lines match the code.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** `.bkit/core/engine/commands/workflow/tests.test.ts` and the `steps` tests pass.
- [ ] **Text ceiling:** `pnpm bkit:text:ceiling check` exits 0.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof.

### Manual Verification

- [ ] **Step 1:** read-only, copy the #958 `build-tests-red` rows of groups 3, 6, 7 and 11 into a scratch status file and run `touchedTests` over them with the fixed engine; the six tests of `decisions.test.ts` are not reported.
