Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

Round 2, over a **partial diff coverage** input (`origin/dev...HEAD`, 13571 lines / 128 files, 20 largest shown whole). Input-handling engine files not shown whole were challenged via `git diff origin/dev...HEAD -- <file>` (`branches.ts`, `challenge.ts`, `plan-blocks.ts`, `tests.ts`, `registry.ts`); `dist/` spot-checked against its sources. Round-1 fixes verified: the two LOW security deferrals (`branches.ts` symlink read, `challenge.ts` matrix-cell interpolation) stand in `docs/deferrals.jsonl` unfixed and are not re-reported; plan tasks 12-18 landed and their tests pass (ran: `ledgers.test.ts -t triage` 11/11, `tasks.test.ts` 18/18, `branches.test.ts -t scan-diff` 18/18). The finding below is new in the round-1 task-13 fix and was reproduced against the branch's own build (`node dist/cli.js branches scan-diff --disabled-tests`).

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `scan-diff --disabled-tests` tallies re-added assertion lines across the whole diff, not per file, so deleting `expect(2).toBe(2);` from `src/a.test.ts` and adding the identical trimmed line in any other file (verified with `src/notes.md`) exits 0 with `disabled: []` — the ship gate passes with a dropped assertion, against task 13's own `DONE WHEN` ("a net drop in the file" still reported)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1185`
  - **DONE WHEN:** the `readded` tally is scoped so a line added in a different file (test or not) never cancels a removal in the test file — per-file keying, or counting re-adds from test files only; the cross-file fixture exits 1 naming the dropped assertion, and `scan-diff ignores an assertion moved within the file` plus `scan-diff still reports a removed assertion` stay green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports an assertion re-added only outside the test file` fails on the masking: a diff removing `expect(2).toBe(2);` from `src/a.test.ts` while adding the identical trimmed line in `src/notes.md` exits 0 with `disabled: []`

<!-- bkit:task 1 end -->
