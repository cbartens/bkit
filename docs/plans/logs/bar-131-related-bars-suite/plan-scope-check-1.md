Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

## Findings

### Critical (must-fix before Step 7)

- [ALL Phase-2/3/4 tasks] Missing per-task **Verification** command. Phase 1 tasks (P1.T1-T7) consistently include `Verify: pnpm vitest run <file>`, but Phases 2, 3, and 4 omit per-task verification commands and rely solely on per-phase Gate commands (Phase 2 Gate / Phase 3 Gate / Phase 4 Gate). The runbook contract requires every task to have an observable verification step. Suggested fix: add explicit `Verify: pnpm vitest run <file>` (or equivalent) to each of P2.T1-T11, P3.T0-T9, P4.T1-T8 — examples: P2.T1 → `pnpm vitest run .agents/scripts/bkit-manifest.test.ts`; P2.T2 → `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`; P3.T1 → `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`; P4.T5 → `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`.

- [ALL runbook tasks] Missing **Effort (S/M/L)** field on every task. Spec requires per-task effort estimate; only the Phase Index table (line 36) has phase-level effort. Suggested fix: append `Effort: S|M|L` to every runbook bullet. Examples (suggested): P1.T0 S, P1.T1 M, P1.T2 S, P1.T6 M, P2.T1 M, P2.T5 L, P2.T6 M, P2.T11 L, P3.T1 M, P3.T2 M, P3.T6 L (versioned migration with snapshots), P3.T6a M, P4.T1 M, P4.T2 M, P4.T5 L, P4.T8 M.

- [ALL runbook tasks except P2.T11, P2.T12, P3.T1, P3.T1a, P3.T2-T9, P4.T1-T9] Missing explicit **Depends on:** field. Several tasks have implicit dependencies that are not declared. P1.T0-T7 have no `Depends on:`; P1.T7 logically requires P1.T0 (CHANGELOG.md skeleton must exist) but only mentions it parenthetically. P1.T8 lists `Depends on P1.T1-T7` but no other Phase-1 task does. P2.T1-T10 lack explicit dependency declarations even though P2.T4 says "key list driven by P2.T1 manifest" and P2.T5 says "Round-trip integration test" (presumes P2.T1+T2+T3 done). Suggested fix: add `Depends on: <task-id-or-none>` to every task. Phase 2 example: P2.T1 none; P2.T2 P2.T1; P2.T3 none; P2.T4 P2.T1; P2.T5 P2.T1, P2.T2, P2.T3, P2.T4; P2.T6 P2.T5; P2.T7 P2.T5; P2.T8 P2.T5; P2.T8a P2.T5, P2.T6; P2.T9 P2.T5, P2.T6; P2.T10 P2.T9.

- [P2.T1-T11, P3.T0, P3.T1, P3.T2-T9, P4.T1-T9] Missing explicit **Files** declarations on the task lines themselves. The Architecture & Component Changes table lists files per phase, but task lines do not pin which file each task creates/edits. Several tasks are ambiguous: P2.T1 says "Build per-module install-write manifest" but does not state whether this lives in `bkit-manifest.ts` (NEW) or `bkit-modules.ts` (modified) — both are listed in the Phase 2 table. P3.T1 ("JSON `deepMergeJson` primitive") does not name the file (presumed `bkit-tiers.ts`). P4.T1-T3 "staging-aware write wrapper" does not name the file (presumed `bkit-install.ts`). Suggested fix: add `Files: <path>` to each task. This is critical because without a 1:1 task-to-file pin, the auditor cannot verify task discreteness or detect accidental cross-task file collisions.

### Concerns (recommended)

- [P2.T1-T11, P3.T1-T9 (except P3.T1a, P3.T6a, P3.T10), P4.T1-T8] Missing or unclear **Linear closes** ref. Phase 1 tasks consistently include `**Closes BAR-142 §X.**`. Phase 2 tasks reference `BAR-139 §Suggested order #N` / `§DoD #N` which is acceptable, but P2.T8a, P2.T11 (only `BAR-142 §A6`), P2.T12 are missing/incomplete. Phase 3 P3.T1, P3.T1a, P3.T2-T9 do not say which BAR-142 sub-issue they close (A1 prerequisite is hinted on P3.T0 only). Phase 4 P4.T1-T7 do not declare `BAR-142 §A4/§A5` closes. Suggested fix: add `Closes BAR-XXX §Y` line to every task; tasks without a Linear ref should be explicitly marked `Closes: none (internal)`.

- [Test Matrix ↔ Runbook] The Derived Test Matrix has 33 rows but several runbook tasks bundle multiple test rows without listing them explicitly. Examples: "`bkit doctor` integration on stale-pin fixture" maps to P1.T1 (fine); "Install manifest snapshot" maps to P2.T1 (fine); but "`hasBkitMarkers` line-anchored regex", "Cross-phase dedup position-stable", "`detectShellToken` empty vs unset", "`LOG_PREFIX` on dry-run blocker banner", "`.npmrc` inline-string action text + fallback", "Changelog header diff in post-install" map 1:1 to P1.T2-T7. The mapping is recoverable by inspection but not declared. Suggested fix: add `Tests: <matrix-row-name>` field to each task, OR add a short matrix-row→task table after the matrix.

- [P2.T2] Says "depends on P2.T1 only for consistency; pure-string transform — no logical dep". This is contradictory: either there is a dep or there is not. Either declare `Depends on: none` and remove the parenthetical, or declare `Depends on: P2.T1` cleanly.

- [P3.T8] "Vercel CLI hang guard" — single-sentence scope. Acceptance criteria not observable: "Pre-check `.vercel/project.json` and skip `vercel env ls` when absent, OR catch timeout → return `unknown`". The OR clause is implementation-discretion; pick one. Suggested fix: pick concrete behaviour and add `Verify: pnpm vitest run .agents/scripts/bkit-preflight.test.ts` (matrix already lists "Vercel CLI hang guard tests" in line 309).

- [P4.T8] Claims `Depends on: none` but P4.T8 modifies `.agents/templates/.github/workflows/ci.yml` (per Phase 4 architecture table line 329) which collides with no other Phase 4 task — fine — but `.github/workflows/test-action.yml` requires the action to exist; the manual GitHub Actions smoke verification is gate-time only and cannot run via Vitest. This is correctly flagged in the task. Concern: the task has no offline acceptance criterion. Suggested fix: add a Vitest-level YAML schema/parse test to confirm the action.yml is valid YAML and inputs match expected shape — separate from the manual smoke.

- [P3.T0] "Verify Cursor v1 hooks schema" — research-only spike, no failure mode declared. What if Cursor v1 schema is unverifiable (docs absent)? Plan should declare a fallback: e.g., "If schema undocumented, agent issues blocker Linear issue and pauses Phase 3 entry." Currently the plan only says P3.T1a "Depends on P3.T0" but no abort path.

- [P2.T11] Says `Depends on P1.T1` but Phase 2 ships in v0.7.x and Phase 1 in v0.6.x — already noted in Phase Index "Cross-phase dep note" (line 43). Recommend duplicating the note inline in P2.T11 itself for agent execution clarity.

- [P4.T4] "Extends `.bkit-version` (already [NEW] in P2.T3) — additive `canonicalHashes` field." This is fine, but the `Depends on: P2.T3` declaration crosses phases. Cross-phase deps should be flagged in the Phase index Risk column same as P2.T11→P1.T1. Currently not flagged.

- [P2.T4] Acceptance criterion "key list driven by P2.T1 manifest (NOT hand-listed)" is observable, but no test fixture is named. Matrix row "`package.json` default-only stripping" maps here — link explicitly.

### Nits (optional)

- [P1.T6] Action text instruction "instruct `export GH_BKIT_TOKEN=…`" — partial wording. Spell out the recommended one-liner so the test fixture asserts on a concrete string.

- [P2.T6] Long scope embedded in checkbox bullet — readability suffers. Consider splitting Flag-style decision into a sub-bullet or separate rationale block.

- [P3.T1a] "stable type signatures in `bkit-tiers.ts`" — the file path is correct, but acceptance test should be named (e.g., "verify exported types compile in `bkit-tiers.test.ts`").

- [P4.T6] `--non-interactive` flag — no acceptance test fixture named. Matrix row "Upgrade integration (customised hooks scenario)" covers this in P4.T7 only.

- [Phase Index Risk] BAR-142 A2 mentioned in P2.T9 ("NOT cross-attributed to BAR-142 §A2 — A2 was moved to BAR-139") — clarification good, but this hints that BAR-142 A2 is closed elsewhere; ensure docs/pending.md or BAR-139 record reflects this.

- [Supersession Inventory] Six rows present, all with DELETE or RETAIN-WITH-REASON+kill-date. Compliant. Minor: the `hasBkitMarkers` substring impl row and Tier-1 classification rows reference DELETE in P1.T2 / P3.T3 respectively, but the Architecture & Component Changes tables show `[MODIFY]` not `[DELETE]` for those files because the surrounding file survives. Template footnote (line 135) requires `[DELETE] path/to/file` mirror — but here the artifact deleted is intra-file (a function, not the whole file). Acceptable; consider noting "intra-file delete" in the Supersession Inventory Justification column for clarity.

- [Mandatory Tasks] "Verify test coverage against Derived Test Matrix" is good, but no machine check is declared. Consider adding a script (`.agents/scripts/verify-matrix-coverage.ts`) that asserts every matrix row has a corresponding task ID, run during gate verification.

- [P1.T0] `pnpm pack --dry-run` output is large; consider grepping for `CHANGELOG.md` to make verification observable: `pnpm pack --dry-run | grep CHANGELOG.md`.
