Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 4, 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: `CONCERNS`, 5 fixable gaps on Tasks 4 and 5. Fixed by `build-plan-gaps-remediate-3-1-log.md` (commit b22dc3616) and the tests step attempt 2 entry of `build-plan-tests-3-log.md` (commit 43f57baac).

## Notes

- **Mode:** `Group`, judged against `build-diff-3-2.md` and the two commits since attempt 1. The briefs `build-brief-3-1.md` and `build-brief-3-2.md` are identical and carry no `Deviations` section.
- **Checks run:** the eight group 3 test files (`steps`, `ledgers`, `migrate`, `status`, `challenge`, `issues`, `journal.integration`, `locks`): 414 passed, all ten named tests included. `tsc --noEmit` on `tsconfig.json` and `tsconfig.test.json`: exit 0. `bkit ci slop --base=e0403df0f`: failed, 1 added finding (the one gap). Compiled-CLI probes in a scratch repo: `ledgers append --issue-operation` and `steps stub` / `steps verdict --agent=bkit-build-plan-verify`.
- **Attempt 1 gap 1 (closed):** `appendLedgerRows` now checks and records the operation store under the store's own `withTargetLock`, taken inside the target lock. `unionLedgers` and compact take one target lock at a time, so the order cannot invert, and a lock that waits too long throws rather than deadlocking.
- **Attempt 1 gap 2 (closed):** `migrateLedgers` reads and renames under `withTargetLock(abs)` and refuses while `pendingLedgerIntents` lists the file. `migrate.test.ts` `refuses to rewrite a ledger holding a pending operation's prepared bytes` passes.
- **Attempt 1 gap 3 (closed; meets the Task 4 UPDATE line):** #836's operation context has not landed: `commitOwnSet`, `ownPathCommit`, `commitBookkeeping` and `retriggerCommit` take no operation parameter. The engine-issued context that does exist is the Task 1 invocation (`inv-` plus 32 hex). `--issue-operation` derives `op-{12 hex of the invocation}-{12 hex of the request hash}` from it, and that hash covers the ledger, the rows and the full invocation id. That is "read it from there". It is scoped to one invocation, so it does not deduplicate globally. The compiled-CLI probe showed a retry under the same invocation replaying the original receipt (`replayed: true`, same ts, nothing written), and a second invocation with the same rows getting a new id and a later row. The caller-named `--operation` stays for a deliberate repeat inside one invocation. Advisory, not a gap: only the refusal paths have a test (`refuses --issue-operation without an invocation or beside --operation, writing nothing`); no test covers issued-id replay, and the DONE WHEN does not require one.
- **Attempt 1 gap 4 (closed):** `DERIVED_FIELDS.Fixable` is `some(fixable)` in source and `dist/commands/workflow/steps.js:1245`. The compiled probe rendered one fixable plus one unfixable finding as `Fixable: true` and no findings as `Fixable: false`, matching `.bkit/core/prompts/bkit-build-plan-verify.md`. Both planned-test expectations are corrected.
- **Attempt 1 gap 5 (coverage closed, gate broken):** the new test builds its table from every prompt with a `Verdict:` header and asserts that the ten named kinds are in it. But its prompt filter adds an error-obscuring catch, which fails slop. That is this attempt's one gap.
- **Test-first audit:** `build-tests-green-3-2.md` is `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests`, `Already landed` or `delete-still-referenced` entries, so there is no test-first gap and nothing loosened. The tests step's correction makes the planned test follow the prompt contract. Its log line is labelled `TASK 3`; the test belongs to TASK 5. That is a label slip only.
- **TASK 4 (satisfied):** all of DONE WHEN holds. Replay returns the original receipt, a conflicting hash refuses, and a new operation permits later same-key lineage. Every engine writer (append, union, compact, migrate, `appendFrictionRow`, carry / restore) serializes or refuses. Interrupted checkpoints reconcile or block without truncation. The four named tests pass, and `locks.test.ts` / tracker behaviour is unchanged.
- **TASK 5 (not satisfied):** every DONE WHEN behaviour is present and the three named tests pass. The gate breakage comes from the test that closes the "every registered header kind" clause, so the task stays open until that test passes slop.
- **TASK 6 (satisfied, already ticked):** unchanged since attempt 1. Its three named tests pass, and the compiled CLI ran `status invocation --standalone=audit` and `ledgers append` without an import cycle.
- **Decision records:** `build-decision-1-1.md`, `1-2` and `1-3` cover groups 1 and 2 only. None accepts a group 3 gap.
- **Documentation rows:** `.bkit/core/.bkit/cli.md` lists `--issue-operation` on `ledgers append`. `docs/architecture.md`, `docs/testing.md` and the workflow and prompt docs belong to Task 9 (group 4), and no group 3 DONE WHEN names them.
- **Out of scope:** none.

## Identified Gaps Log

Gaps: 1

- TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts:2282` `renders and verifies the header of every prompt that declares one` — the test added to close attempt 1 gap 5 picks prompts with `try { return promptHeader(agent).verdicts.length > 0 && ... } catch { return false; }`; `bkit ci slop --base=e0403df0f` now fails (`passed: false`, `added: 1`, `defensive.error-obscuring`, "Found 1 error-obscuring catch block"), so the group gate's slop step fails and a prompt whose header fails to parse for any reason other than "declares no Verdict: line" silently drops out of the table instead of failing the test; select the prompts without a catch (for example, keep only files whose text has a `Verdict:` header line before `<!-- verdict:end -->`, then call `promptHeader` unguarded so a parse error fails the test), keeping every assertion — Fixable: true
