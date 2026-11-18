Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: 7a7e63f53b924e5af92b807cc459e44d69116823ef07c1af0090f80dc959f21c
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-2-1.md`. The group's work is Tasks 6 and 8 (`build-brief-2-1.md`).
- Task 6 is satisfied. `check` exits 1 and names the folder when a text folder is missing or holds no `*.md` file. `lower` and `raise` refuse before any write. An invalid-JSON record gives one `[bkit:text:ceiling]` line that names `scripts/gate/bkit-text-ceiling.json`, says `not valid JSON` and names `pnpm bkit:text:ceiling lower`, with no stack trace. Both TEST FIRST tests were red, then green.
- Task 8 is not satisfied (2 gaps). The rest of its DONE WHEN is met: the CLI `raise` refuses unless stdin and stdout are a TTY, and no flag or variable skips that check. `raiseCeilings({root, record, reason, confirm})` is exported and writes only after `confirm` resolves true. The `typedConfirm` prompt shows the old and new ceilings and asks for `RAISE`. The record and folder checks run before the TTY check. `check`'s above-ceiling message names the words over, the grown files and "Only the owner raises the ceiling, at a terminal", with no `raise --reason "<why>"` line. The `docs/testing.md` § Text ceiling bullet and its key-test-files row describe the terminal confirmation. All five TEST FIRST tests were red, then green.
- Out of DONE WHEN scope, no gap: `lower`'s refusal message still prints `Owner only: pnpm bkit:text:ceiling raise --reason "<why>"` (the `RAISE` constant). Task 8 names only `check`'s message, and a non-terminal `raise` now refuses anyway.
- Test-first audit `build-tests-green-2-1.md` (Enforced: true):
  - The `not-green` gaps for Task 5 and Task 7 are accepted by `build-decision-1-1.md` Q1 and Q2 (`Decision: Accept`). They are no gap, and both tasks are outside this group's briefs.
  - Unproven, no gap: Task 5 `merging two branches that each lowered the prompts ceiling leaves a record that check passes` and Task 7 `lower with an unstaged edit in another prompt file never leaves a record the committed tree fails`. The owner answers them at the end of the build.
  - Taken over, judged as Task 8 tests against its DONE WHEN and its Derived Test Matrix rows: `raise with a reason rewrites both ceilings and stores the reason on the folder that grew` (from Task 2), `raise without a reason refuses and leaves the record unchanged` (from Task 2) and `fails above the ceiling and names total, ceiling, grown files and the raise command` (from Task 1). The first and third match their rows. The second's loss of the exit-code and `/reason/` assertions is covered by the `callRaise` gap below.
- `build-decision-1-1.md` Q3 directs Task 8 (Fix now: terminal confirmation only). Deny rules, signed-commit checks and hand-edit guards are out of scope.
- Derived Test Matrix rows for Tasks 6 and 8 all have tests that exist and pass: `agent-text-ceiling.test.ts`, 13/13 in the green run. The plan has no `Documentation Updates` section. `docs/observability.md` is present. The script's `[bkit:text:ceiling]` stderr prefix predates this group.
- Not checked: I did not run `raise` by hand, because the auto-mode permission check blocked it. The group's tests cover the CLI refusal.

## Identified Gaps Log

2 gaps.

TASK 8: `scripts/gate/bkit-text-ceiling.mjs:240` — the entry-script guard compares `path.resolve(process.argv[1])` with `fileURLToPath(import.meta.url)`, which Node resolves through symlinks, so a run through a symlinked path is the entry script but the CLI never starts: `node <symlinked scripts dir>/gate/bkit-text-ceiling.mjs check` printed nothing and exited 0 (reproduced), so `check` passes silently and `lower` / `raise` do nothing; compare against `fs.realpathSync(process.argv[1])` and add a test that runs `check` through a symlink and sees exit 1 above the ceiling — Fixable: true
TASK 8: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:85` — the `callRaise` helper catches and drops every error from `raiseCeilings`, so `raise without a reason refuses and leaves the record unchanged` and the declining half of `raise at a terminal shows the old and new ceilings and writes only after the typed confirmation` also pass when `raiseCeilings` crashes before writing (for example a `TypeError`), which the rules forbid as error-swallowing; let the refusal tests assert the rejection (for example `await expect(...).rejects.toThrow(/reason/)` and `/cancelled|confirmation/`) and let the confirming calls propagate errors — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** CLI never starts when run through a symlinked path; check exits 0 silently
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-text-ceiling.mjs:240` · **Round:** 1
  - **DONE WHEN:** The entry-script guard compares fs.realpathSync(process.argv[1]) with fileURLToPath(import.meta.url), and a test in .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts runs check through a symlinked script path and sees exit 1 above the ceiling
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** callRaise swallows every error, so refusal tests pass on a crash
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:85` · **Round:** 1
  - **DONE WHEN:** callRaise no longer catches errors; the refusal tests assert the rejection (reason refusal matches /reason/, declined confirmation matches /cancelled|confirmation/) and the confirming calls let errors propagate
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
<!-- bkit:task 2 end -->
