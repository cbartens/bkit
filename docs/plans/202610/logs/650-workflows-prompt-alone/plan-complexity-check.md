Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- Tasks: 19 (Task 1 to Task 19), in 4 waves.
- Gates: 4 (Gate 1 to Gate 4).
- Domain areas: engine CLI commands (TypeScript: fids, steps, prs, branches, worktrees, runs, ledgers, workflows, locks, land); workflow prompt files (five `bkit-*.md` workflows, router, wording clauses); audit and shape tests; docs and ledgers; generated mirrors and `dist/`.

## Session Fit Estimate

19 tasks against a threshold of 12, so it does not fit one session. Several tasks are also much heavier than average. Task 8 edits five workflows plus matching rows in `.bkit/workflows.md`. Tasks 11 and 12 are large: a new shared-checkout record, own-path commits and an own-commit push, with about 20 and 12 test rows. Task 14 rewrites the debug prose for `dev`. Task 19 is a full verification and dogfood run.

## Rationale

Proposed sub-plans, each fitting one session:

1. **Sub-plan A: Engine guards (Tasks 1-6).** Issue-less FID rule, `fromMarker` / `fromBranch`, `steps gate --issue`, PR marker and base guards, worktree refusals, `dist/` rebuild. 6 tasks, TypeScript only.
2. **Sub-plan B: Wording and workflow prose (Tasks 7-10, 15).** Wording clauses, shared changes in all five workflows, per-workflow skips, router, ship hardening. 5 tasks, prompt files and shape tests. It needs A's `--issue` flag to exist.
3. **Sub-plan C: Debug on `dev` in place (Tasks 11-14).** Shared-checkout record, own-commit push, `runs dispatch`, debug prose. 4 tasks, tightly coupled, with Task 14 depending on 11-13. This is the heaviest sub-plan, so keep it on its own.
4. **Sub-plan D: Docs, ledgers, mirrors, verification (Tasks 16-19).** Docs, ledger check, `pnpm build` and `bkit upgrade`, full test run and dogfood. 4 tasks, run last after A to C.

Order: A, then B, then C, then D. B and C are independent of each other once A is done. Each sub-plan keeps its own tasks' Gate 2 to 4 checks.
