Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage — I read the supplied diff, then `git diff origin/dev...HEAD` and the tree for the engine files the file omits

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `ledgers triage` adjudicates a genuine `own-cycle` ("new architecture") deferral as `unjustified` and appends a permanent wrong verdict — `.bkit/jsonl.md` test 1 requires "not a new architecture", and no predicate implements it nor excludes `own-cycle`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1724`
  - **DONE WHEN:** a `reason: "own-cycle"` deferral is bucketed `Exempt` (or fails `bounded-remediation`) whatever its `remediation` names, and no `unjustified` row is written for it; a test pins it
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps an own-cycle deferral exempt` fails on today's code: the row buckets `Lazy`, `written` = 1, and a second row appears in `docs/deferrals.jsonl`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `scan-diff --disabled-tests` reports every removed line of a test file that matches `ASSERTION` (`expect|assert\w*|should|should_\w+`), so deleting a comment, an import line or an assertion moved elsewhere sets exit 1 and the sweep records a `Blocking Deferral` + `Verdict: FAIL`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1084`
  - **DONE WHEN:** a removed line that is a comment, a non-assertion statement or an assertion re-added elsewhere in the same diff is not reported; a removed assertion call (a net drop in the file) still is; the sweep's `disabled` list and exit code follow
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a removed comment in a test file` fails today: exit 1 with `disabled: [{file: "a.test.ts", line: 4, test: "adds"}]` for a deleted `// should not be reached` line
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion moved within the file` fails today: the removed half of a move is reported

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `scan-diff --disabled-tests` misses Python's skipped tests — `@pytest.mark.skip` and `@unittest.skip` match no marker, so a run that disables Python tests exits 0 with `disabled: []` and the ship gate passes
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1074`
  - **DONE WHEN:** an added `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(` line in a `test_*.py` or `*.test.*` file is reported with its line and test name and exits 1, while `TEST_FILE`'s existing Python class still applies
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added pytest mark skip` fails today: a diff adding `@pytest.mark.skip(reason="flaky")` above `def test_a` exits 0 with an empty `disabled`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Build Steps 7 and 9 pass the verify header's documented empty form `Tasks: none` straight into `--tasks=`, which `tick` refuses with exit 2 — every verify round that satisfies no task logs a usage error and ticks nothing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:74`
  - **DONE WHEN:** `--tasks=none` is accepted as "no task" (exit 0, `ticked: []`, file untouched), or both calls in `.bkit/core/workflows/bkit-build.md:522` and `:648` drop the flag when `{VERIFIED_TASKS}` is `none`; the verb's `--help` states which
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick treats the header's none as nothing to tick` fails today: `--tasks=none` exits 2 with `--tasks must name positive task numbers, got "none"`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `ledgers triage` re-adjudicates a `status: "CLOSED"` deferral (work already finished) and appends `reason: "unjustified"` / `status: "TRIAGED"`, moving finished work back onto the triage ladder and adding an unjustified count to `computeDeferralDiscipline`
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1715`
  - **DONE WHEN:** a folded row whose `status` is `CLOSED` buckets `Exempt`, prints no test result and writes nothing; the concurrent-`OPEN` case keeps today's behaviour
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes no row for a closed deferral` fails today: the `CLOSED` fixture gets a second row and `written` = 1

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A deferral already adjudicated `unjustified` is bucketed `Exempt` on every later run, so the ship sweep records an outstanding unjustified deferral under `Exempt Deferrals` and the summary reports it as settled
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1718`
  - **DONE WHEN:** a folded row whose `reason` is `unjustified` reports a bucket that keeps it out of the sweep's `Exempt Deferrals` (its own label or `Lazy`) and still writes no new row; re-running triage twice leaves the report stable
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage reports an adjudicated unjustified row outside exempt` fails today: the second run prints `Exempt` for a row `reason: "unjustified"`

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `ledgers triage` reads the plan's task surfaces without checking `parsePlanBlocks`' errors, so a plan with no task blocks silently buckets every deferral `Exempt` (exit 0, no warning) — the one plan reader that neither refuses nor warns
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1701`
  - **DONE WHEN:** a plan with no task blocks exits 1 naming `NO_MARKERS_REASON`, and a plan whose blocks do not parse exits 2 naming the line — as `tasks tick|open|currency` already do — with no rows written
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage refuses a plan with no task blocks` fails today: exit 0 with `rows: [{bucket: "Exempt"}]` and no message

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `tasks open` drops ticked tasks before matching the log, so a ticked task holding neither a `DONE` nor a `BLOCKED` line is never listed and `handover` stays false — the contract says the verb lists exactly the tasks holding neither line
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:266`
  - **DONE WHEN:** the group's open set is the tasks with neither line, whatever their box, and the output names the ticked-but-unlogged task; the handover route in `.bkit/core/workflows/bkit-build.md` Step 6 reads the same list
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open lists a ticked task holding no done line` fails today: a ticked task 1 with only `DONE — TASK 2` in the log prints `tasks: []`, `handover: false`

<!-- bkit:task 8 end -->
