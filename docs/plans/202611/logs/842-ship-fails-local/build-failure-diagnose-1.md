Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

The failing assertion localises the cause to one workflow fence, and the existing merge command provides a concrete replacement.

## CI Run

NOT CHECKED: this is a local gate failure; no remote CI run was requested. The retained `run-tests-1.log` and its single JUnit report identify one failing case. The artifact reports 2,952 retained lines with no clamp. Runtime and E2E evidence are not configured for this CLI repository.

## Prior Attempts Reviewed

None — STANDARD, TEST_ATTEMPT1. No `build-decision-2-*.md` exists in the supplied log directory; checked by both scoped file listing and directory glob. Existing status rows record successful plan execution, verification and challenges before this first final gate.

## Prior Knowledge

`bkit-runtime-shim-state-does-not-survive-bash-call-boundary`: independent workflow shell invocations do not share variables — applied by retaining the existing instruction to hold the command's emitted `target` as the orchestrator-substituted `MERGE_TARGET`, rather than inventing shell state.

Folded `docs/knowledge.jsonl` by key and highest timestamp and searched active winners for the workflow/fence symptom. Non-shallow Git history contains one matching revert-related change, `df4f13746`, restoring failed-install refusal; it does not concern merge-target resolution or this remediation. The raw read was introduced in `8510275b9`. External signals were not queried because the assertion and source establish a local contract violation, with no dependency-version or upstream hypothesis.

## Related Issues

NOT CHECKED: remote issue search was unnecessary for this reproduced local assertion. The supplied plan's related-issue list was read; none supplies evidence about this raw-call failure. The open failure-ledger entries for shell-parse timeouts and JSON readiness concern different assertions.

## Failures

`workflow-fence-syntax.test.ts:148` rejects `bkit-ship.md: git rev-parse --verify origin/dev`. The final unit run reports `1 failed | 7322 passed | 2 skipped (7325)`, with one failed test file and 172 passed files. Its JUnit report independently identifies this same sole case. The focused reproduction failed identically: one failed case, 14 filtered/skipped cases, exit 1. The enclosing static-unit command stopped before the remaining shell and integration stages; those stages are not proven by this gate attempt.

## Root Cause

Step 4 of `.bkit/core/workflows/bkit-ship.md:448` invokes raw Git to resolve `origin/dev`, violating the audit's established boundary that workflow Git operations belong to bkit verbs. The allow-list admits only the bootstrap lookup needed before bkit can run. This read duplicates resolution already performed by `syncVerb` in `.bkit/core/engine/commands/workflow/branches.ts:2568`: `--target` accepts a commit ref, resolves it to a SHA before `fetchDev`, passes that SHA to the merge, and emits it as `target`. The earlier selected tests did not surface this source-policy assertion; the final full unit suite did. This is unrelated to the recorded intermittent JSON readiness failure.

## Rot Signals

architecture

- architecture: the workflow duplicates a Git ref read outside the existing engine owner, contradicting the enforced command boundary. Reusing the existing target resolver removes this local violation without redesign.

## Recommended Remediation

1. In `.bkit/core/workflows/bkit-ship.md:447`, delete the standalone raw-Git fence and the sentence that holds its printed commit. Change only the initial dev-integration invocation to `branches sync --merge --fid="{FID}" --file="{STATUS}" --target="origin/dev" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"`, retaining its existing worktree `cd` and quoted bkit executable.
2. Keep the subsequent instruction that holds emitted `target` as `MERGE_TARGET`, and keep the resolver's `--target="{MERGE_TARGET}"` continuation unchanged. The engine already pins the supplied ref before fetching, matching the current workflow's pre-fetch pinning behavior.
3. Synchronise the matching instruction registry entry and workflow catalog if their recorded text changes, then regenerate all configured provider copies through the existing upgrade workflow. No engine code or audit allow-list change is required.

## Out-of-Scope Recommendations

None. The failing audit file is evidence, not a repair target; retain its assertion and existing bootstrap-only allowance.

## Blast Radius

- Initial Path B integration: compatible. Both old and proposed paths resolve local `origin/dev` before the command fetches, then merge the resolved SHA. Existing stale-base gate behavior remains unchanged.
- Pending dev conflicts and resolver continuation: compatible. Explicit-target output includes the resolved SHA even on pending-conflict exit 24, and the resolver keeps using that SHA. The existing real-Git continuation test passed: `1 passed | 274 skipped (275)`.
- Feature reconciliation: compatible. Its command and target handoff are unchanged.
- Shared `branches sync` callers: compatible. No engine behavior, flag or output contract changes.
- Provider copies and instruction registry: regenerate from the one workflow source and verify parity. Post-remediation generated-output checks remain required; diagnosis made no source changes.

## Suggested Tests

Use the existing failing raw-call audit as the red-before-fix regression; do not add a duplicate assertion or weaken the allow-list. Run the full fence audit after repair, alongside `ship-invariants.test.ts` and the existing explicit-target continuation case. Then rerun the final static-unit-integration gate to execute stages not reached by this attempt.

## Verification Commands

```bash
pnpm bkit:test:file .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts
pnpm bkit:test:file .bkit/core/engine/audits/workflows/ship-invariants.test.ts
pnpm bkit:test:file .bkit/core/engine/commands/workflow/branches.test.ts -t 'continues only the explicitly recorded target through the public merge command'
pnpm exec tsx .bkit/core/engine/tools/instructions.ts
```

Regenerate the configured provider mirrors through the project's existing upgrade command and run its parity checks. The orchestrator then reruns `bkit tests run` with `bkit:gate:static-unit-integration`, a fresh log, and attempt 2. No fixes, builds, installs or commits were performed during diagnosis.

## Hypotheses

### Hypothesis 1: A new raw Git read violates the workflow command boundary

#### Reason

The final gate names the workflow shell-fence audit and one unexpected raw call.

#### Act

Read the failure block and JUnit case, inspect the workflow fence and audit, and rerun only the failing assertion with `pnpm bkit:test:file .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts -t 'every raw call is a bkit verb'`.

#### Observe

```text
+   "bkit-ship.md: git rev-parse --verify origin/dev",
 Test Files  1 failed (1)
      Tests  1 failed | 14 skipped (15)
```

#### Result

CONFIRMED — the focused rerun reproduces the same deterministic source-policy violation without the full gate.

### Hypothesis 2: The existing JSON readiness flake or coverage caused this gate failure

#### Reason

An earlier wrapper JSON-read failure remains open in the failure ledger, and the final log ends with coverage output.

#### Act

Read the complete failure section and inspect every JUnit file in the retained report directory.

#### Observe

```text
 FAIL  .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts > workflow shell fences — no raw git, gh, jq or file copies > every raw call is a bkit verb, bar the named allow-list
 Test Files  1 failed | 172 passed (173)
      Tests  1 failed | 7322 passed | 2 skipped (7325)
```

#### Result

REFUTED — the sole reported failure is the raw-call assertion; no JSON-read or coverage-threshold failure appears in this run's failure evidence.

### Hypothesis 3: Existing target resolution can replace the workflow's raw Git read

#### Reason

The workflow uses the raw call only to turn `origin/dev` into the explicit merge target; the existing `--target` accepts a commit ref.

#### Act

Read `syncVerb` target validation, resolution and emitted output; read the resolver consumer and its explicit-target regression. The engine resolves `${targetFlag}^{commit}` before `fetchDev`, passes that SHA to `mergeDev`, and emits it as `target`, including pending-conflict outcomes.

#### Observe

```text
throw new CommandError(EXIT.USAGE, "--target needs --merge and a commit ref");
```

#### Result

CONFIRMED — passing `--target="origin/dev"` uses the existing engine resolver and preserves the same pre-fetch pinned SHA; the resolver continues with that emitted SHA. No new engine capability or audit exception is needed.
