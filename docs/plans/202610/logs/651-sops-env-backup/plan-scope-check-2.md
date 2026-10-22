Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Checked: template sections present and populated; every task 1-12 has scope, `Done when`, `Test first`; matrix rows 1-41 map 1:1 to runbook tasks (matrix `Task` column agrees with each task's `Done when` row list: T1 = 1-2, T2 = 3-9, 18, 25, 36, 39, T3 = 10-17, 34, 35, 40, T4 = 19, T5 = 20, T6 = 21-24, 32, 41, T7 = 33, T8 = 26-30, 37, 38, T9 = 31); Supersession rows 1-4 mirrored by `[DELETE]` entry and Task 8; Out of Scope rows are issue non-goals with deferral mirrors owned by Task 11; no task edits inside `bkit:start`/`bkit:end` of `.gitignore` (edits at lines 21-24, outside block 45-106) or `.husky/pre-commit` (no markers).

## CRITICAL

1. **EXTEND rows that never land as `[MODIFY]` (Reuse Inventory rule: "Each `EXTEND` row must land as `[MODIFY] path/to/existing`").** Rows "Config load rejecting unknown keys", "Subprocess wrapper", "Skip-list glob match" are labelled `EXTEND (pattern copy / semantics copy)`, but the plan modifies none of `bkit-secrets.mjs` `loadConfig` / `run()` or `ci.ts` `globToRegExp`; it writes new code in a new file. Under the template that is a `NEW` row needing reason (a)/(b)/(c), and the `[NEW]` `bkit-env-backup.mjs` Reuse Check cites them only as "EXTEND rows". Fix: relabel these three as `NEW (inside the script)` with reason (b) (templates cannot import engine code; cross-template import breaks standalone adoption, already argued in the "Raw env-file parse" row), and keep the "Temp git repo" and "Git hook env vars" rows as convention notes, not EXTEND capabilities. Add `docs/capabilities.md` / language-server note only if present.

## OPTIONAL

- Row 6 says "no `sops` on PATH, **or below minimum version**", but Task 2 `Test first` names only `no sops on PATH warns and exits 0`. Add a below-`MIN_SOPS` case (PATH wrapper reporting an old version) to that test or a second named test, so the second half of the row is red-first.
- `[NEW] vitest-tsx-bin.test.ts` traces to the `Tool presence` EXTEND row, not a `NEW` row. Acceptable as a test of an EXTEND row, but state it as a test file in that row's justification to avoid an "untraced NEW" read.
- Tasks 3 (`no age key with an invalid line…`), 6 (`rebase and cherry-pick…`) and 8 (`list and drift…`) carry "regression guard, n/a red" tests. Justified in text, but Gate 2 "every task recorded a red per test" will trip; name these guards as exempt in Gate 2 wording or give each a stub-level red (for example, make the guard assert the positive output that the stub lacks).
- Task 10 edits `.bkit/core/.agents/rules.md:93`, which sits inside that file's `bkit:start`/`bkit:end` block. That file is the shipped source of the block, so the edit is correct; say so in the task ("source of the managed block, not the mirror") so the no-edit-inside-block rule is not read as violated.
- Clean `git merge` commits do not refresh `.enc` (Edge Cases row, no matrix row, parked under Suggested Scope Expansion). It is documented behaviour, not required by a Success Criterion; fine, but Task 11 `Done when` should list that docs sentence explicitly (it is in the Documentation Updates row, not in the task).
- Narrative remains `MISSING` and Q6, Q7, Q9 need human input; these block Gate 1 by design, not a scope gap.

## OUT OF SCOPE

- Guardrail tier for `.env.enc` reads, agents-audit Step 8 clause, `[mcp-env]` advisory pointing to `restore`, `pre-merge-commit` wiring: already listed under Suggested Scope Expansion; no further action here.
