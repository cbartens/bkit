Verdict: PASS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the gate names the exact line (`tracker.ts:2046`) and rule, and folding one private function into its only caller is a concrete, local fix.

## CI Run

NOT CHECKED: this is a local Build Step 12 gate failure (`pnpm bkit:gate:static-unit-integration`, log `/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1008-plan-design-owner/run-tests-1.log`). The branch has not been pushed for this run, and the local log names the failure exactly, so no remote CI evidence was needed.

## Prior Attempts Reviewed

None (`Strategy: STANDARD`, and no `Repeat tests` named).

## Prior Knowledge

kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba: `bkit ci slop` scans the live tree against a clean base worktree, so ignored build output shows up as phantom additions — applied as a check that this finding is not such a phantom (Hypothesis 3, refuted).
fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing: a fix in place for one slop rule can trip another rule — applied as a constraint that the fix must not swap the wrapper for another flagged shape (no alias-comment exemption, no added log-only catch).

## Related Issues

None: `gh issue list --repo cbartens/bkit --search 'pass-through wrapper slop' --state all --limit 5` returned #294, #851, #551, #967 and #964. None of them is an earlier incident of this finding. #964 is this plan's parent review (findings D1 and N4) and does not discuss slop.

## Failures

- One failure: `bkit:slop:delta` (`bkit ci slop`), base `b7fd5085c4d7d7d4fcac2fba54e0f8d02d8cc7ce` vs working tree: `added 1, resolved 0, worsened 0; net findings 1, net score 2.00`, finding `added | .bkit/core/engine/commands/workflow/tracker.ts | 2046 | structure.pass-through-wrappers | Found 1 pass-through wrapper`.
- Typecheck, Oxlint, Prettier, the table check and Vale prose lint all passed before it (`All matched files use Prettier code style!`, `0/158 files need formatting`, `✔ 0 errors, 0 warnings and 0 suggestions in 152 files.`).
- Tiers never reached: `bkit:gate:static` stops at the first failing command, and slop runs last in it, so `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` did not run. Their state is unknown (Hypothesis 2). The holistic gate (`pnpm bkit:gate:changed`, 80 changed files) passed at 2026-11-18T12:54:13Z, which covers the tests related to the changed files, but not the full tiers.

## Root Cause

- **Proximate cause:** `runActionKey` (`.bkit/core/engine/commands/workflow/tracker.ts:2046-2052`) is now one line, `return commentKey(file, workflow, parts);`, which hands its own arguments unchanged to the private `commentKey` (`:2054-2065`). slop-scan's `structure.pass-through-wrappers` rule flags exactly that shape. In the base, `runActionKey` passed its own numbering strategy (`runNumber`) and `endedRunActionKey` passed another (`latest`), so neither was a plain forward.
- **Design fragility:** the plan itself caused it. Task 4 says "`runActionKey` names the latest run of the workflow, active or ended; `commentKey` loses its `numberOf` parameter" (plan § `[MODIFY] tracker.ts`, and the Code Change list `UPDATE: commentKey ... drops its numberOf parameter`). Once there is one strategy and one caller, `commentKey` has no reason to exist. The plan kept it as a separate function, and the build followed the plan word for word.
- **Contributing factor:** the per-group and holistic gates run `bkit:gate:changed`, which by design runs related tests, Oxlint, Prettier and typecheck, but not slop-scan (`docs/testing.md:716`, `scripts/gate/bkit-gate-changed.mjs`). So a slop finding added in group 1 (commit `d860779a9`) first shows up at Step 12.

## Rot Signals

None. The leftover forwarding function is the failure itself, and the remediation below removes it. Nothing else on the failing path shows rot. Leaving slop-scan out of `bkit:gate:changed` is a documented scope choice (`docs/testing.md:716`), not drift.

## Recommended Remediation

1. `.bkit/core/engine/commands/workflow/tracker.ts:2042-2065`: fold `commentKey` into `runActionKey` and delete `commentKey`. Keep the exported signature (`file`, `workflow`, `...parts`) and the doc comment unchanged, so that no caller changes:

   ```ts
   export function runActionKey(
     file: string | undefined,
     workflow: string | undefined,
     ...parts: Array<string | number | undefined | null>
   ): string | undefined {
     if (file === undefined || !fs.existsSync(file)) return undefined;
     const runs = readRunsLenient(file);
     const name = workflow ?? runs.at(-1)?.workflow;
     if (name === undefined) return undefined;
     const n = runs.filter((r) => r.workflow === name).length;
     return n === 0 ? undefined : actionKey(name, n, ...parts, "comment");
   }
   ```

   - Do NOT exempt the wrapper with a comment the detector matches (`alias`, `legacy`, `backward compat`) or with a `slop-scan.config.json` override. It is a true redundancy, not a named contract.
   - Do NOT rename `commentKey` to `runActionKey` at the call sites, and do NOT touch `issues.ts`, `workflows.ts` or the tests. Those callers stay as they are.
   - This changes the plan's Code Change entry `UPDATE: commentKey ... drops its numberOf parameter` to a deletion of `commentKey`. Behaviour is identical, so record it as a remediation note, not as a plan change.
2. Engine build: run `pnpm build && git add dist/` so `dist/` lands in the same commit (`.agents/rules.md` § Engine builds).
3. Generated maps: removing a symbol changes the `tracker<br/>91 symbols · 1 files` node in `docs/capabilities.md:304`. Stage the `tracker.ts` edit first, because `bkit:graph:refresh` reads the staged files. Then run `pnpm bkit:graph:refresh`, include `docs/capabilities.md` and `DETAILS.md` if they changed, and confirm with `pnpm bkit:graph:check`.

## Out-of-Scope Recommendations

- `scripts/gate/bkit-gate-changed.mjs`: consider running `bkit ci slop` (or a changed-files slop scan) in the per-group gate, so that a net-new slop finding fails in the group that adds it instead of at Step 12. This is a gate-design proposal with a runtime cost, not part of this fix.
- `.bkit/core/prompts/` (plan reviewer prompts): a plan that removes the only other caller, or the strategy parameter, of a helper could flag the helper as a likely pass-through. This is a proposal only; it is not in this plan's scope.

## Blast Radius

- `runActionKey` callers: `.bkit/core/engine/commands/workflow/issues.ts:1346`, `.bkit/core/engine/commands/workflow/workflows.ts:421`, `.bkit/core/engine/commands/workflow/tracker.ts:2004`, and `.bkit/core/engine/commands/workflow/tracker.test.ts:175,308,732,897,1971,1975,1979,2012`. Compatible: the exported name, parameters, rest-argument spread and return values do not change, and the body is the same logic as before.
- `commentKey`: not exported, and `git grep -n -w 'commentKey' -- '.bkit/core/engine/**'` finds only `tracker.ts:2051` (the call) and `:2054` (the definition). Compatible: deleting it breaks no importer.
- `dist/`: regenerated by `pnpm build`. Compatible once committed with the source; `bkit:check:dist` in CI enforces this.
- `docs/capabilities.md` / `DETAILS.md` generated graph: the symbol count for `tracker.ts` drops by one. Compatible after `pnpm bkit:graph:refresh` on the staged edit; `pnpm bkit:graph:check` confirms it.

## Suggested Tests

- No new test is needed: behaviour does not change, and `.bkit/core/engine/commands/workflow/tracker.test.ts:887-897` (`runActionKey names the latest run after it ended`) plus the keyed-post cases at `:175`, `:308`, `:732` and `:1971-2012` already pin the latest-run rule and the no-file / no-run `undefined` returns.
- The slop gate itself is the regression check for the wrapper shape.

## Verification Commands

```bash
pnpm bkit:slop:delta
pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/tracker.test.ts
pnpm exec vitest run .bkit/core/engine/commands/workflow/tracker.integration.test.ts
pnpm build && pnpm bkit:check:dist
pnpm bkit:graph:check
pnpm bkit:gate:static-unit-integration
```

## Hypotheses

### Hypothesis 1: Task 4's edit left `runActionKey` as a one-line forward to `commentKey`, which slop-scan flags as a net-new pass-through wrapper

#### Reason

The gate log names one net-new finding, `.bkit/core/engine/commands/workflow/tracker.ts:2046  structure.pass-through-wrappers`, and the plan's Task 4 tells the builder to delete `endedRunActionKey` and drop `commentKey`'s `numberOf` parameter. With the strategy argument gone, the two functions take the same inputs.

#### Act

`sed -n '2030,2070p' .bkit/core/engine/commands/workflow/tracker.ts`; `git diff b7fd5085c -- .bkit/core/engine/commands/workflow/tracker.ts`; `git show b7fd5085c:.bkit/core/engine/commands/workflow/tracker.ts | grep -n -E 'commentKey|runActionKey'`; read `findPassThroughWrappers` in `node_modules/slop-scan/dist/node-entry.js:179575-179583`.

#### Observe

Head, `tracker.ts:2046-2052`:

```ts
export function runActionKey(
  file: string | undefined,
  workflow: string | undefined,
  ...parts: Array<string | number | undefined | null>
): string | undefined {
  return commentKey(file, workflow, parts);
}
```

Diff against base `b7fd5085c`:

```diff
-  return commentKey(file, workflow, runNumber, parts);
...
-export function endedRunActionKey(
...
-  return commentKey(file, workflow, latest, parts);
+  return commentKey(file, workflow, parts);
...
-  numberOf: (runs: WorkflowRun[], name: string) => number,
```

In the base, `runActionKey` passed its own strategy (`runNumber`), so it was not a plain forward. The detector exempts only a wrapper with an alias comment (`/\balias\b/i`, `/legacy/i`, ...) within two lines above it, or a boundary target prefix. `slop-scan.config.json:39-41` has `"structure.pass-through-wrappers": { "enabled": true }`, and no override for `tracker.ts`.

#### Result

CONFIRMED: the only net-new slop finding is the `runActionKey` → `commentKey` forward that the plan's own Task 4 wording produced (commit `d860779a9`, plan-execute group 1 attempt 1).

### Hypothesis 2: Other tiers in the same gate also fail, and the slop failure hides them

#### Reason

`bkit:gate:static` stops at the first failing command, and `bkit:slop:delta` is the last command in it. `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never ran in `run-tests-1.log`. The decision record (Q2) also named a failing check in `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:800`.

#### Act

Read the gate log for later tiers, and the status rows and commit list since the decision: `tail -25 status.jsonl`, `git log --oneline b7fd5085c..HEAD`.

#### Observe

The log ends after slop with `ELIFECYCLE  Command failed with exit code 1.` (x4), and has no unit or integration output. After the decision: `a7f20f282 ... plan-tests group 1 attempt 2`, `09b8f07c0 ... plan-execute group 1 attempt 2`, `e87394586 ... group-gate group 1 attempt 3`. Holistic gate row: `"step":"build-holistic-gate","attempt":1,"run":1,"verdict":"PASS","exitCode":0,"failures":0,"scope":"pnpm bkit:gate:changed (80 changed files)"`. `docs/testing.md:716` says `bkit:gate:changed` runs `vitest related --run` on the changed files, Oxlint, Prettier and `pnpm typecheck`. It does not run slop-scan.

#### Result

INCONCLUSIVE: the tests related to the 80 changed files passed in the holistic gate at 12:54Z, and the Q2 test fix ran in group 1 attempt 2. But the full unit coverage, bats, awake and integration tiers were never reached at Step 12, so their state is unknown until the gate is re-run.

### Hypothesis 3: The finding is a phantom from the head-tree versus clean-base asymmetry (`kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba`)

#### Reason

Known ledger gotcha: `bkit ci slop` scans the live tree against a clean base worktree, so untracked or ignored build output reads as added.

#### Act

Checked the finding's path and `git status --short`.

#### Observe

The finding is in a tracked engine source file (`.bkit/core/engine/commands/workflow/tracker.ts:2046`), not in build output. `git status --short` shows only ` M docs/plans/202611/logs/1008-plan-design-owner/status.jsonl` and the new diagnosis file.

#### Result

REFUTED: the finding sits on tracked code that this branch changed, and it is a real net-new finding.

### Hypothesis 4: Other code calls `commentKey`, so inlining it would ripple

#### Reason

Inlining is the natural fix, and it is safe only if `commentKey` has no other caller.

#### Act

`git grep -n -E '\bcommentKey\b' -- '.bkit/core/engine/**'` returned nothing. Because an empty result proves nothing on its own, it was re-run as `git grep -n -w 'commentKey' -- '.bkit/core/engine/**'`. The earlier `grep -n` hit at `tracker.ts:2051` corroborates the re-run.

#### Observe

```
.bkit/core/engine/commands/workflow/tracker.ts:2051:  return commentKey(file, workflow, parts);
.bkit/core/engine/commands/workflow/tracker.ts:2054:function commentKey(
```

The first `\b` query returned a false empty. `commentKey` is not exported, and its one caller is `runActionKey`.

#### Result

REFUTED: `commentKey` is private to `tracker.ts` and has one caller, so folding it into `runActionKey` changes no other file's code.
