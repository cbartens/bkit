Verdict: PASS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the slop gate names one file and line, the finding reproduces in isolation, and a one-line rewrite that clears it is proven on a scratch probe.

## CI Run

NOT CHECKED: the failure is the local `build-run-tests` gate (`pnpm bkit:gate:static-unit-integration`, log `/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/958-agents-orchestrator-write/run-tests-1.log`). No remote CI run is part of this step.

## Prior Attempts Reviewed

None

## Prior Knowledge

fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing: slop-scan treats a catch that holds only a comment as empty, and a `console.error` inside it trips `defensive.error-swallowing` instead — applied as the reason the fix removes the catch (an `existsSync` guard) rather than logging inside it or adding a `slop-scan.config.json` override.
kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba: `bkit ci slop` reports phantom "added" findings from untracked build output — applied as Hypothesis 2, refuted because the finding is on tracked source this branch changed.
Reverted commits: `git log -i --grep=revert -- .bkit/core/engine/commands/workflow/` shows no reverted attempt at this catch or at `scrubSecrets`.

## Related Issues

None

## Failures

One failure. `pnpm bkit:slop:delta` (`bkit ci slop`) failed with exit 1:

```text
[bkit-ci] added 1, resolved 0, worsened 0; net findings 1, net score 1.90
[bkit-ci]   added     .bkit/core/engine/commands/workflow/workflows.ts:376  defensive.empty-catch  Found 1 empty catch block
[bkit-ci] FAIL — change adds/worsens slop on net.
```

The gate chain stops at the first failing step. `typecheck`, `lint`, `format:check`, `format:tables:check` and `bkit:lint:prose` passed. `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never ran, so this run gives no evidence about those tiers.

## Root Cause

- **Proximate cause:** Task 26 (commit `22a30ddfb`, group 7) added `scrubSecrets` to `.bkit/core/engine/commands/workflow/workflows.ts`. Lines 376-380 wrap `fs.realpathSync(base)` in a `try` whose `catch` holds only the comment `// A missing directory has no real path.`. slop-scan's `defensive.empty-catch` rule counts a comment-only catch as empty, and no `slop-scan.config.json` override covers this file.
- **Design fragility:** The changed-file gate (`bkit:gate:changed`) that the group and holistic gates run does not run slop-scan (`docs/testing.md:716`). A new slop finding therefore surfaces only at the full gate in `build-run-tests`, after every group has finished.
- **Contributing factors:** The same file already resolves real paths without a catch at `workflows.ts:1944` (`fs.existsSync(p) ? fs.realpathSync(p) : p`), and `worktrees.ts:103` does the same. Task 26 did not reuse that shape.

## Rot Signals

None

## Recommended Remediation

1. `.bkit/core/engine/commands/workflow/workflows.ts:376-380` (inside `scrubSecrets`, Task 26): replace the `try` / `catch` with the existence guard this file already uses at line 1944. The loop body becomes:

   ```ts
   roots.add(base);
   if (fs.existsSync(base)) roots.add(fs.realpathSync(base));
   ```

   Keep the reason as a comment above the guard if wanted. Do not put a `console.error` or any other line inside a catch, because that trips `defensive.error-swallowing`. Do not add a `slop-scan.config.json` override, because a one-line rewrite removes the finding.
2. Run `pnpm build && git add dist/` so `dist/commands/workflow/workflows.js` lands in the same commit (`.agents/rules.md` § Engine builds).

## Out-of-Scope Recommendations

- `scripts/gate/bkit-gate-changed.mjs`: it runs no slop-scan, so slop findings show up only at `build-run-tests`. Consider adding a changed-files `bkit ci slop` stage, or document that the group gate leaves slop to the full gate. This is a separate design decision for the owner.

## Blast Radius

Localised. `scrubSecrets` is a module-private function, and its only caller is `scrubFailureFiles` in `bkit workflows fail`. For a missing directory, the guard keeps the current result: the base path is added and the real path is skipped. For an existing directory, the result is the same real path. The one difference is a directory that exists but whose real path cannot be read (for example, a permission error on a parent folder). It now throws instead of being skipped silently. Both `repoRoot(cwd)` and `cwd` are directories the command is already running in, so this case does not occur in practice. `workflows.ts:1944` already accepts the same trade-off.

## Suggested Tests

- `.bkit/core/engine/commands/workflow/workflows.test.ts`: under `bkit workflows fail`, pass a `cwd` whose checkout root is reached through a symlink, and check that the stderr file contains neither the symlinked path nor the real path. This covers the `realpathSync` branch the rewrite touches.
- The existing Task 26 tests must keep passing: `bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files` and `bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~`.

## Verification Commands

```bash
pnpm bkit:slop:delta
pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts -t "bkit workflows fail"
pnpm build && git diff --stat -- dist/commands/workflow/workflows.js
pnpm bkit:gate:static-unit-integration
```

## Hypotheses

### Hypothesis 1: The `try { fs.realpathSync(base) } catch { /* comment */ }` added to `scrubSecrets` by Task 26 is the single net-new `defensive.empty-catch` finding

#### Reason

The run-tests log names exactly one added finding, at `.bkit/core/engine/commands/workflow/workflows.ts:376`, and that line sits inside `scrubSecrets`, which Task 26 added on this branch.

#### Act

Read `workflows.ts:340-400`; ran `git diff f45fce664 -- .bkit/core/engine/commands/workflow/workflows.ts`; ran `git log -L370,380:...workflows.ts --no-patch`.

#### Observe

```text
[bkit-ci]   added     .bkit/core/engine/commands/workflow/workflows.ts:376  defensive.empty-catch  Found 1 empty catch block
```

```text
+    try {
+      roots.add(fs.realpathSync(base));
+    } catch {
+      // A missing directory has no real path.
+    }
```

`git log -L` lists `22a30ddfb chore(958-agents-orchestrator-write): plan-execute group 7 attempt 1` as the commit that added the lines.

#### Result

CONFIRMED — the only net-new finding is this comment-only catch block, added by Task 26 in commit `22a30ddfb`.

### Hypothesis 2: The finding is a phantom from untracked or gitignored build output (the `--head .` against clean base worktree asymmetry)

#### Reason

The knowledge row `kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba` records spurious "added" findings from build output that exists only in the live tree.

#### Act

Checked that the flagged path is tracked engine source and that `git status --short` shows no untracked source files.

#### Observe

```text
 M docs/plans/202611/logs/958-agents-orchestrator-write/status.jsonl
?? docs/plans/202611/logs/958-agents-orchestrator-write/build-failure-diagnose-1.md
```

The flagged file `.bkit/core/engine/commands/workflow/workflows.ts` is tracked, and commit `22a30ddfb` changed it.

#### Result

REFUTED — the finding is on tracked source that this branch changed, not on build output.

### Hypothesis 3: The `if (fs.existsSync(base))` guard that this file already uses at line 1944 clears the finding without a slop-config override

#### Reason

The knowledge row `fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing` shows that slop-scan counts a catch holding only a comment as empty, and that adding a log line inside it trips `defensive.error-swallowing` instead. `workflows.ts:1944` already resolves real paths without a catch: `const real = (p: string) => (fs.existsSync(p) ? fs.realpathSync(p) : p);`.

#### Act

Wrote two scratch probe files outside the repo (`sloprobe/a/x.ts` with the current catch shape, `sloprobe/b/x.ts` with the `existsSync` guard) and ran `pnpm exec slop-scan scan <dir> --json` on each.

#### Observe

```text
== a
[{"ruleId":"defensive.empty-catch","path":"x.ts","line":null}]
== b
[]
```

#### Result

CONFIRMED — the current shape reproduces the finding (a known hit), and the `existsSync` shape reports no finding.

### Hypothesis 4: An earlier gate should have caught this finding, so something is broken in the build loop's group or holistic gate

#### Reason

`build-holistic-gate` attempt 3 passed at 2026-11-18T21:48:25Z with scope `pnpm bkit:gate:changed (37 changed files)`, and the first full gate run failed one minute later.

#### Act

Searched `scripts/gate/bkit-gate-changed.mjs` for `slop`/`static` (no hits), checked the same file for its known stages, and read `docs/testing.md:716`.

#### Observe

```text
 *   related  → vitest related --run: the Vitest tests that import a changed file
 *   lint     → oxlint on the changed engine .ts files (the `lint` script's scope)
 *   types    → pnpm typecheck when a .ts file changed (tsc checks whole projects only)
```

`docs/testing.md:716` lists the stages of the changed-file gate: `vitest related`, named test files, the text ceiling test, Oxlint, Prettier and `pnpm typecheck`. It does not list slop-scan.

#### Result

REFUTED — the changed-file gate does not run slop-scan, and its documented contract says so. The full gate at run-tests is where slop-scan runs, and it caught the finding there as designed. Nothing in the gate is broken.
