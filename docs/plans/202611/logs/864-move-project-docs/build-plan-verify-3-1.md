Verdict: PASS
Failures: 0
Fixable: false
Tasks: 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged TASK 9 against `build-diff-3-1.md`. The only changed file is `.bkit/core/engine/checks/after/tools.test.ts` (commit `1e60837ba`). The execute commit `2f8e4f4fd` touches only run logs, so the `No source file changes` part of DONE WHEN holds.
- Decision record `build-decision-1-4.md` (Q1, `Decision: Fix now`, the owner's own choice) directs this group: the tests step rewrites how the test watches file reads and keeps its assertions. The diff does exactly that.
- TASK 9 DONE WHEN met. `resolves an indexed equivalent without a missing default warning` (`tools.test.ts:562`) passes. It keeps every assertion: no missing-default warning for `docs/security.md` / `docs/testing.md`, `docs/architecture.md` still listed, and no read starting with the out-of-tree dir. The only change replaces `vi.spyOn(fs, "readFileSync")` with the hoisted `fsReads` recorder from a pass-through `vi.mock("node:fs", ...)`. No expectation was removed or loosened.
- The recorder is not hollow. `.bkit/core/engine/checks/after/tools.ts:4` and `.bkit/core/engine/install/project-docs.ts:12` both import `* as fs from "node:fs"`, and `project-docs.ts:239` reads the index through `fs.readFileSync`. So the mocked function sees the detector's real reads.
- No `vi.spyOn` on the `node:fs` namespace is left in the file (`grep -n spyOn` returns nothing).
- The whole file `.bkit/core/engine/checks/after/tools.test.ts` passes: `pnpm bkit:test:file` reports 37 of 37 passed. A verbose `-t "indexed equivalent"` run shows both named tests passing. `oxlint -c .oxlintrc.json` on the file exits 0.
- Test-first audit `build-tests-green-3-1.md`: Enforced true, 0 gaps, 0 unproven. Already landed: Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`. The tests step's reason: detectProjectDocs already resolves indexed equivalents and skips out-of-tree targets (task 5 code), so no red is due. No gap.
- The audit has no `Updated tests` section. I still read the in-place repair of the Task 5 test by hand, and it is additive in effect (see above).
- Mandatory checks for this group: no Derived Test Matrix row or Documentation Updates row is assigned to group 3. No source logic changed, so `docs/observability.md` error logging does not apply.
- Out-of-scope observation, not a gap: `docs/testing.md:560` says "Real filesystem (`os.tmpdir()`) over mocked `fs`". Its narrow-exception list names only `index.test.ts` mocking `node:child_process`. This file already mocked `node:child_process` before this group, and it now also wraps `node:fs` as a pass-through over the real filesystem, which the plan's TASK 9 sanctions. The owner may want that line to name this exception.

## Identified Gaps Log

None
