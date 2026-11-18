Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: d0a1bc37b6e893a20095bdd03a0f0e28370a2d218f957ccef5222316bf6aab6b
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 groups verified.

## Integration Gaps

0. Group 1's writers and `check` agree on one list (`listRenderedOutputs`, set on `ctx.renderedOutputs` from `process.cwd()`, the same `cwd` the core `postDispatch` hashes against, and passed straight into upgrade's `updated` list). Group 2's install-doc row describes group 1's behaviour as built, and TASK 6's `.bkit/version` is what group 1's engine writes.

## Previously Attempted

Group verifies `build-plan-verify-1-1.md` (Group 1, PASS, tasks 1-4) and `build-plan-verify-2-1.md` (Group 2, PASS, tasks 5-6). This is the first holistic attempt.

## Notes

- All six tasks meet their `DONE WHEN`, judged against the full feature diff (`tmp/bkit-diff-1053-upgrade-leaves-stale.md`). Two gaps sit outside the `DONE WHEN` text: an Edge Cases row the install writer does not meet (TASK 3), and half of a `Documentation Updates` row (TASK 5).
- Tests run by this verifier, all passing: `version-file.test.ts`, `version-file.integration.test.ts`, `modules/index.integration.test.ts`, `modules/core.integration.test.ts`, `commands/install/upgrade.integration.test.ts`, `commands/install/check.integration.test.ts` (6 files, 562 tests). All nine `Derived Test Matrix` tests exist in the task that owns their row, and each row's behaviour is in that task's `DONE WHEN`.
- Dogfood of the Concrete Example (`node dist/cli.js` on a scratch claude consumer): after the `.claude/commands/bkit-build.md`, `.bkit/templates.md` and `.bkit/allowlist.json` entries were set to a wrong hash, `check` exited 1 and named all three; `upgrade --auto-apply` re-recorded them; `check` then exited 0; no `.agents/` entry was left. A deleted entry is re-added by `upgrade` but not by an `install` that writes nothing else (gap 1).
- TASK 6 in this repo: `.bkit/version` has 260 entries, no `.agents/` entry and no entry for a missing file. Only `.cursor/mcp.json`, `.mcp.json` and `package.json` differ from disk. `node dist/cli.js check` exits 0. `.bkit/install.md` differs from its source only by the managed marker line.
- The new log line reuses the owning prefix (`[bkit-check]` / `[bkit-install]`), as `docs/observability.md` requires. No new error path was added.
- Test-first audits `build-tests-green-1-1.md` and `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. They have no Taken over, Changed by a code step, Updated tests or Already landed sections.
- No decision records or remediation logs exist for this run.
- The full suite is not run here. The holistic gate covers it.

## Identified Gaps Log

2 gaps.

- TASK 3: `.bkit/core/engine/install/modules/core.ts:2142` — the Edge Cases row "A rendered output has no entry at all → `upgrade` and `install` add it" does not hold for `install`: a missing entry for a rendered output is put in `newCanonicalEntries` but does not count toward `hasNewEntries`, so an install run that writes nothing else leaves `.bkit/version` unwritten and the entry missing (dogfood: deleted the `.bkit/templates.md` entry on a claude scratch install, re-ran `install --claude --tracker=github`, entry still missing; `upgrade --auto-apply` added it). Count a missing rendered entry toward the write only when not dry-run, so `check` still does not fail on a missing entry (the plan's Assumption), and add a core.integration test. — Fixable: true
- TASK 5: `docs/testing.md:911` — the `Documentation Updates` row for `docs/testing.md` asks for two things in the `version-file.test.ts` row: the `.agents/` rule in `mergeCanonicalHashes` (done) and "that the two hash writers also re-record rendered outputs" (missing; no line of `docs/testing.md` mentions the re-record or the new tests in `core.integration.test.ts`, `upgrade.integration.test.ts`, `check.integration.test.ts` and `index.integration.test.ts`). Add that clause to the row's writer sentence. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** install does not add a missing entry for a rendered output when it writes nothing else
  **Severity:** LOW · **Class:** edge-case · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:2142` · **Round:** 1
  - **DONE WHEN:** A core install run (not dry-run) that writes nothing else adds a missing .bkit/version entry for a rendered output, and bkit check still exits 0 on a missing entry; a core.integration test pins it
  - **TEST FIRST:**
    - .bkit/core/engine/install/modules/core.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** testing.md row does not say the two hash writers re-record rendered outputs
  **Severity:** LOW · **Class:** documentation · **Fixable:** true · **Location:** `docs/testing.md:911` · **Round:** 1
  - **DONE WHEN:** The version-file.test.ts row in docs/testing.md also says that the install and upgrade hash writers re-record every rendered output from disk
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
