Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 10
Plan: docs/plans/202610/701-engine-work-build-plan.md

**Q1 — TASK 20 [.bkit/core/engine/commands/workflow/branches.ts:1090]:** Round 2 finding: `scan-diff --disabled-tests` matches its disable markers on every added line of every file, so prose quoting `test.skip` / `describe.skip` / `@Disabled` / `xfail` — a skill doc, `docs/knowledge.jsonl`, `docs/testing.md`, the marker regex literal in `branches.ts` itself — counts as a disabled test. This branch's own diff exits 1 with 18 such hits, so the ship sweep would file Blocking Deferrals and FAIL. Scoping the marker set to test files (and skipping markers inside comments and quoted spans) fixes it, with two failing tests named in the task. Accept the finding as-is, or fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — HIGH severity and the branch cannot pass its own ship gate with it: `scan-diff --disabled-tests --base=origin/dev` exits 1 on this very diff, so shipping as-is guarantees a red pre-merge sweep.
Decision: Fix now — fix now for all

**Q2 — TASK 21 [.bkit/core/engine/commands/workflow/branches.ts:1194]:** Round 2 finding: the round-1 fix compares each removed line's exact trimmed text against the added lines, so a test file whose assertion **changed** (an edited expectation or matcher) is reported as a disabled test. This branch's own diff carries two such hits in `tests.test.ts` (`:1769` and `:2065`), and the sweep would file a Blocking Deferral for tests that are intact. Comparing assertion counts per file instead fixes it, with two failing tests named in the task. Accept the finding as-is, or fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — HIGH severity, and the branch's own diff is one of the false positives: an ordinary assertion rewrite would block the ship gate on unchanged behaviour.
Decision: Fix now — fix now for all

**Q3 — TASK 22 [.bkit/core/engine/commands/workflow/branches.ts:1170]:** Round 2 finding: a diff that **deletes** a whole `*.test.*` file exits 0 with `disabled: []`, because git writes `+++ /dev/null` and the path stops matching the test-file pattern. The strongest form of test removal therefore passes the ship gate. Keeping the `--- a/{path}` token for deletions fixes it, with a failing test named in the task. Accept the finding as-is, or fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — MEDIUM severity but the gap is total: silently deleting a test file is the case the gate exists to catch, and the fix is one token carried in the diff walk.
Decision: Fix now — fix now for all

**Q4 — TASK 23 [.bkit/core/engine/commands/workflow/branches.ts:1185]:** Round 2 finding: the re-add tally is global across the diff, so deleting `expect(2).toBe(2);` from `src/a.test.ts` and pasting the identical line into any other file (even `src/notes.md`) exits 0 with `disabled: []` — a dropped assertion passes the gate by diff padding. Scoping the tally per file fixes it, with a failing test named in the task. Accept the finding as-is, or fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — MEDIUM severity and it contradicts task 13's own DONE WHEN, which this run already claims to satisfy; leaving it ships a gate that a trivially padded diff defeats.
Decision: Fix now — fix now for all

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
