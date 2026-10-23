Verdict: PASS
Decisions: 2

<!-- verdict:end -->

# Build Challenge

## Remediation Log

DONE — Finding 1: pushOwnCommits plain push on moved origin/dev — plain push only when origin/dev is an ancestor of HEAD, pushes the explicit tip SHA, falls through to pushToDev replay on rejection (.bkit/core/engine/commands/workflow/branches.ts)
DONE — Finding 2: in-place dev run record bound to FID — branches push --fid + runs dispatch use activeRecord(fid), fail closed (EXIT_NO_RECORD 20 push, re-trigger refusal, EXIT_NO_RECORD 14 for step/close git add -A on dev for debug), lock-fresh busy check, setup guard file for check+write (branches.ts, runs.ts, ledgers.ts, locks.ts, worktrees.ts, steps.ts, workflows.ts)
DONE — Finding 3: re-trigger head re-held as {DEV_SHA} — debug Step 11 dev dispatch routes hold printed head (.bkit/core/workflows/bkit-debug.md)
DONE — Finding 4: row appended before own-path refusal — writeStepRow and closeWorkflow call ownSet before any append; exit-code text updated (steps.ts, workflows.ts, bkit-debug.md)
DONE — Finding 8: design/plan MCP merge fallback asserts base dev — pull_request_read base.ref assert added (bkit-design.md, bkit-plan.md)
DONE — Finding 9: prs open main guard normalises refs/heads/origin spellings; prs merge re-reads base after merge and fails loudly (prs.ts)
DONE — Finding 10: runs dispatch --sha requires the full 40-hex sha (runs.ts)
DONE — Finding 11: ownSet ledger prefix hash uses hash-object --path (ledgers.ts)
DONE — Finding 12: commitOwnSet restages a user-staged recorded ledger as new HEAD blob plus staged rows (ledgers.ts)
DONE — Finding 5: fidProblem compares --issue to the FID's embedded id — a non-empty issue must be that tracker's id and equal the id the FID embeds; an empty issue accepts any slug; covers fids check, steps gate and prs open markers (fids.ts, fids.test.ts, steps.test.ts, prs.test.ts)
DONE — Finding 6: issue from the branch, no fancy rules (human decision) — fids parse takes the feat/ suffix verbatim for any lowercase slug and links an embedded issue id only when .bkit/issues.jsonl has a feature row for it; a non-slug suffix exits 3 and Step 1 STOPs in all five workflows (true-block Route); fids check/steps gate/prMarker take any slug when the issue is empty; wording clauses, workflows.md, trackers.md, AGENTS.md, CHANGELOG, testing.md updated (fids.ts, bkit-{design,plan,build,debug,ship}.md, wording.md, fids.test.ts, workflow-shape.test.ts, wording.test.ts)
DONE — Finding 7: repeated issue-less mint (human decision) — new bkit fids free returns the minted name or the first free -b, -c, ... suffix when an earlier run finished (IN_PROGRESS continues; exit 1 all-digit word, exit 5 all used); wired into Step 1 of all five workflows; documented in workflows.md § FID generation and § Best-effort runs; mint tests added (fids.ts, bkit-{design,plan,build,debug,ship}.md, fids.test.ts, workflow-shape.test.ts)

## Verification

- `pnpm build` exit 0; `pnpm exec tsc --noEmit -p .` exit 0
- `pnpm exec vitest run` on the 12 changed test files: 1048 passed
- `pnpm bkit:gate:static-unit-integration` exit 0 (integration: 46 files, 1527 tests)
- `node dist/cli.js upgrade` regenerated the host-render mirrors; `node dist/cli.js check` → 0 write(s) would occur
