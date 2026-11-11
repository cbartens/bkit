Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **Group 1 ends with `dist/` stale; only Task 5 (Group 2) rebuilds it** (plan edit).
   - Task 1's `DONE WHEN` runs `pnpm build`. Task 2 then edits `.bkit/core/engine/commands/workflow/issues.ts` again (`comment.summary`) and has no rebuild. The next `pnpm build` is in Task 5, in Group 2.
   - In this repo, `.husky/pre-commit:18-23` runs `pnpm bkit:check:dist` whenever a non-test `.bkit/core/engine/**/*.ts` file is staged. The build's per-step commit of Group 1's code (`steps finish ... --message=...`) therefore stages `issues.ts` with a stale `dist/`. The hook fails, and nothing in Group 1 makes it pass.
   - `.agents/rules.md` § Engine builds also requires `dist/` in the same commit as the engine edit.
   - Fix: move `pnpm build` (and `git add dist/`) from Task 1's `DONE WHEN` to Task 2's, after `pnpm cli:sync`, so Group 1 ends with `pnpm bkit:check:dist` passing. Task 5's rebuild then becomes the end-of-plan check only.

Design-coverage (steps 5 and 11): skipped. No design artifact exists (`docs/plans/202611/918-*-design.md` is absent, and the input names none). The source is the #918 issue body.

- Issue coverage: item 1 maps to Task 1, item 2 to Task 4, item 3 to Task 2, and item 4 to an Assumption. "Already-posted comments" maps to `Out of Scope` with deferral row `918-repair-already-marked-consumer-comments` (needs-decision).
- Drift and expansion: the proof differs from the issue's "for example" (lock or `IN_PROGRESS`, and the audit report file). The plan raises this as an Open Question with options and a default, and decision `918-comment-guard-workflow-run-proof` records it. It is not drift.
- Every task traces to an issue item or a repo rule: index updates, docs matching the code, engine builds and install to mirror.

Dependency graph (steps 8, 9 and 12):

- **T1:** consumes `postForVerb`, `sessionPublication`, `readRunsLenient` and `outboxRoot`. All of them exist in the repo.
- **T2:** consumes T1's `issues.ts`. T2 depends on T1.
- **T3:** consumes `bkit-auto.md` and `generated-marker.test.ts` from the repo.
- **T4:** consumes `rules.md` and `instructions.ts` from the repo.
- **T5:** consumes the output of T1 to T4. T5 depends on 1, 2, 3 and 4.

No artefact is consumed before it is produced, no prerequisite is missing, and there is no cycle.

## OPTIONAL

1. **Task 1 misses one existing test it breaks.** `.bkit/core/engine/commands/workflow/issues.test.ts:696-704` calls `run(cwd, ["issues", "comment", "--kind=failure", ..., "--error-file=none.md"])` directly, not through the `comment` helper or `STEP`. It expects exit 3. With the guard before `commentBody`, that call exits 2. Add it to Task 1's `UPDATE` line for `issues.test.ts`, and to Verification § Test Synchronization, so the tests step does not have to find it during the build.
2. **The session check fails closed on post-close comments.** "Compared through `fs.realpathSync` where the folder exists" can be read as calling `realpathSync` on the session folder itself. `sessionPublication` does exactly that, and it throws for a deleted folder (`tracker.ts:1983`). That would turn the post-close Owner Answers and debug close comments into refusals. Say it outright: compare `realpathSync(path.dirname(path.resolve(cwd, sessionDir)))` with `realpathSync(sessionsRoot(cwd))` when the sessions folder exists. This also matters on macOS, where temp dirs live under `/var` and resolve to `/private/var`.
3. **Reuse the lookup the issue names.** #918 says the guard "must reuse that same lookup, not add a second one". For the run proof, call `runActionKey(file, workflow)` (or `endedRunActionKey` for `--purpose=terminal`) and treat "not `undefined`" as proof, instead of writing a new `readRunsLenient(...).some(...)` filter. `commentKey` already returns `undefined` for a missing file or for no run of the workflow, and it uses "the latest run's workflow" when `--workflow` is omitted, which matches the plan's "any run".
4. **The shared Comments clause now promises a refusal.** "Omit `--session-dir` when `SESSION_DIR` is not held" appears three times in each of the six workflows (18 places, a shared clause in `.bkit/instructions.md`). With the guard in place, a call that omits it and has no `--file` is refused with exit 2 and no `commentFile`, so the MCP fallback never fires. Once Task 3 lands, every workflow holds `SESSION_DIR`. Options:
   - Reword the clause through `pnpm instructions:sync`, and re-baseline `.bkit/core/engine/render/__snapshots__/*.none.txt` only if the none render changes.
   - Leave the clause unchanged and record in an Assumption that it is now unreachable.
5. **Edge case with no test row.** "Session minted from the main checkout, comment run from a linked worktree → Accepted" has no `Derived Test Matrix` row. No existing integration case mints the session in one checkout and posts from another: `executionRoots()` and the auto/phase case mint and post in the same root. Add it to Task 1's session-proof unit test (a `git worktree add` in the temp repo), or as a second integration case.
6. **Instruction-corpus checks for Tasks 3 and 5.** `.bkit/core/.bkit/workflows.md` is a `doc` surface of the instruction corpus (`instructions.ts` `DOC_DIRS`). `.bkit/core/workflows/bkit-auto.md` is a `workflow` surface. If Task 5's new § Comment Lifecycle paragraph carries a `**Label:**` or a standing word (`ONLY`, `NOT`, `→`), `instructions-coverage.test.ts` "has no coverage findings" fails until an entry is added. Give Tasks 3 and 5 the no-flag `pnpm tsx .bkit/core/engine/tools/instructions.ts` check in `DONE WHEN`, and list `.bkit/instructions.md` under Task 5 `UPDATE` when that check reports a finding.
7. **Matrix row 7 claims more than its test checks.** `cli-doc.test.ts` asserts only that the region is current (`syncDoc(text) === text`), not the phrase "workflow steps only". Either reword the row to "region current after the summary change", or add a one-line `toContain` assertion to Task 2. That assertion would need a `TEST FIRST` line.
8. **Mirror list is incomplete.** § Mirrors names `.claude/`, `.cursor/`, `.opencode/` and `.codex/`. `bkit upgrade` also rewrites `.agents/skills/bkit-auto/SKILL.md`, `.agents/plugins/bkit/skills/bkit-auto/SKILL.md` and `.agents/plugins/bkit/agents/bkit-audit-generate.md`, which carry the same `issues comment` calls. Name them, so the reviewer of the staged diff expects them.
9. **Known integration flakes.** Task 1's `DONE WHEN` needs `pnpm test` and `pnpm test:integration` green in `tracker.test.ts` and `tracker.integration.test.ts`. Both files have OPEN timing failures: `tracker-boundary-fault-matrix-concurrency-timeout` and `tracker-new-comment-budget-shell-observation-flake`. Name them in Task 1 as known, unrelated flakes, so a timeout there is recorded rather than "fixed" by changing a frozen test.
10. **Acceptance Scenario.** `Narrative` and `Success Criteria` correctly read `⚠️ MISSING`: there is no design and no change-shape fields, and #918 is bug-shaped. Gate 1 stays blocked until the owner writes them. No plan edit is needed beyond what Open Question 1 already asks.

## OUT OF SCOPE

1. **A proof an agent cannot forge.** `bkit repo info` is `use: "by-hand"` and mints a valid session path on every call. A bare path under `sessions/` need not exist, so any agent that reads the refusal can pass the guard. A token minted by `repo info` or `workflows start`, and checked by the verb, would turn the guard from a speed bump into a lock. That is a new contract, so it needs its own issue.
2. **`bkit plans comment` guard.** It prints a marked body with no run proof. The plan already records it as a future-phase recommendation.
3. **Rewording `.agents/rules.md` § Tracker MCPs** ("where a `bkit` verb covers the write"). Decision `918-work-comments-plain-markdown-via-tracker-mcp` declines it for this cycle.

## SUGGESTED SCOPE EXPANSION

Related issues: `related-issues.md` reads "Search unavailable.", so no open-issue candidates were checked. The plan's own #860 row stands.

- **`918-repair-already-marked-consumer-comments`** — source: `related-deferrals.md` (OPEN, needs-decision). Overlap: the marked comments the guard leaves behind. Recommendation: keep as the plan's `Out of Scope` row, and let the owner pick A, B or C.
- **`tracker-boundary-fault-matrix-concurrency-timeout`** — source: `related-failures.md` (OPEN). Overlap: the `tracker.integration.test.ts` suite that Task 1 edits and runs. Recommendation: keep separate, and record it if it recurs during Task 1.
- **`tracker-new-comment-budget-shell-observation-flake`** — source: `related-failures.md` (OPEN). Overlap: the `tracker.test.ts` run inside Task 1's `pnpm test`. Recommendation: keep separate.
- **`test-timeout-222573a81f37d000`** — source: `related-failures.md` (OPEN). Overlap: the `tracker.test.ts` "preserves generated first line" timeout on the marker surface. Recommendation: keep separate.
