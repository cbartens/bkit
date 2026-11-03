Verdict: PASS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

The failure is localized to two missing Markdown blank lines; the repository's installed formatter supplies the exact repair.

## CI Run

NOT CHECKED: this is local Build run 3, final gate attempt 1. The gate stopped before its unit and integration tiers. No remote CI request is needed.

## Prior Attempts Reviewed

None. Strategy: STANDARD.

## Prior Knowledge

- `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`: Prettier expands block boundaries inside loose list items. Applied by inspecting its actual output instead of guessing indentation.
- `wording-retired-prefix-of-new-text-and-loose-list-items`: list-item spacing can affect formatting. Applied by preserving every instruction and command while accepting only the formatter's blank-line changes.
- `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`: format only the named source; leave planned test blocks unchanged.
- Scar-tissue search: the repository is not shallow. No revert-subject commit touching the candidate workflow was found; a positive-control history read found the current rebase commit `9d8158e76` and earlier workflow commits. No prior reverted remediation is being reapplied.

## Related Issues

NOT CHECKED: the supplied local formatting error is conclusive, so no tracker search was needed.

## Failures

`run-tests-1.md` records `prettier --check .` warning on `.bkit/core/workflows/bkit-debug.md` and exit 1. Production/test typechecks and lint completed first. The chained gate stopped at formatting; unit, Bats, and integration tests did not run in this attempt. The missing JUnit count is a consequence of stopping before tests, not a separate runner defect.

## Root Cause

The rebase combined the debug workflow's exit-81 retry with dev's pushed-head verification branch, leaving its nested list without Prettier's required blank lines. The read-only formatter comparison adds exactly two lines: one after the feature-branch push fence (current line 730), and one after the route's final `Else` (current line 734), before the `BRANCH = dev` sibling. No instruction, argument, identifier, or condition changes.

The earlier changed-files gate passed because its explicit 25-file input list omitted this already-committed canonical workflow. `scripts/gate/bkit-gate-changed.mjs:96` formats only the supplied files, whereas the final gate runs `prettier --check .`. The `bkit:generate` script also does not format canonical sources, so regeneration could not repair the omitted whitespace.

## Rot Signals

None. The identified failure is a localized formatting mismatch; the inspected source and installed mirror retain the same instructions. No broader architecture or runtime defect is established by this evidence.

## Recommended Remediation

1. Format only `.bkit/core/workflows/bkit-debug.md` with the installed Prettier. Confirm its diff adds only the two diagnosed blank lines near lines 730 and 734.
2. Sync the instruction index and regenerate installed workflow copies from the canonical source. Preserve all wording, routing, progress reporting and lock behavior. Do not edit generated copies by hand.
3. Update the debug renderer snapshot through the existing renderer test if its expected bytes change. Preserve planned test code.
4. Check full-repository formatting before rerunning the full gate, so already-committed rebase files are covered.

## Out-of-Scope Recommendations

None. The canonical workflow is explicitly in plan Tasks 7 and 11, and its derived mirrors and snapshot are their required outputs. No gate or dependency change is warranted.

## Blast Radius

- Installed debug workflow copies in `.agents/skills/`, `.agents/plugins/bkit/skills/`, `.claude/commands/`, `.cursor/commands/` and `.opencode/commands/`: regenerate; compatibility is preserved because only blank-line boundaries change. The current installed Codex copy has the same unspaced boundary.
- `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: refresh expected rendered whitespace using the existing test, then run it normally.
- `.bkit/instructions.md` and `.bkit/version`: allow their normal generators to update references or hashes. No instruction identity or external contract changes.
- No engine code, dependency, public CLI contract, data schema, or runtime behavior changes are required. Capability graphs need no source-driven update for this whitespace-only repair.

## Suggested Tests

No new tests. Existing full formatting, instruction synchronization, workflow-route audit, renderer snapshot checks and the downstream full static/unit/integration gate cover the repair. Do not add a test that merely asserts these two blank lines.

## Verification Commands

Run from the feature worktree, with `direnv exec .`:

```bash
pnpm exec prettier --write .bkit/core/workflows/bkit-debug.md
git diff -- .bkit/core/workflows/bkit-debug.md
pnpm instructions:sync
pnpm tsx .bkit/core/engine/cli.ts upgrade
pnpm exec vitest run .bkit/core/engine/render/trackers.test.ts -u
pnpm exec vitest run .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/tools/instructions.test.ts
pnpm format:check
node dist/cli.js check
```

The orchestrator then reruns Step 12's exact full gate. Use the established permission-recovery path for the generator's IPC or cache writes if required. No broad suite was run during diagnosis.

## Hypotheses

### Hypothesis 1: The rebased debug workflow has a localized Markdown formatting mismatch

#### Reason

The full gate names one canonical Markdown file and stops in its formatter stage.

#### Act

Ran the installed Prettier on that file to stdout and compared the output with its current bytes using a unified diff; no source was written. Read the exact source and installed mirror boundary.

#### Observe

The gate reports `[warn] .bkit/core/workflows/bkit-debug.md` and `[warn] Code style issues found in the above file. Run Prettier with --write to fix.` The read-only diff contains `@@ -728,10 +728,12 @@`: two added empty lines, before `Route:` and before the sibling `BRANCH = dev` bullet.

#### Result

CONFIRMED — precisely two blank lines reproduce and explain the sole formatting warning.

### Hypothesis 2: The prior changed gate should already have checked this canonical file

#### Reason

The Group 6 changed-files validation passed after regeneration, so its scope must be compared with the final whole-tree formatting check.

#### Act

Read the explicit changed-file list in `tmp/724-group6-rebase-changed.log`, the changed gate's formatter invocation, and the `bkit:generate` package script.

#### Observe

The log reports `[bkit-tests] 25 changed file(s):` and names installed debug copies and its snapshot, but not `.bkit/core/workflows/bkit-debug.md`. The changed gate invokes `["--check", "--ignore-unknown", ...files]`; the full gate invokes `prettier --check .`. The generation chain contains build, CLI sync, instruction sync, upgrade, renderer tests and graph refresh, with no canonical-source formatter.

#### Result

REFUTED — the prior gate did not include the already-committed canonical workflow; the final gate correctly detected it.
