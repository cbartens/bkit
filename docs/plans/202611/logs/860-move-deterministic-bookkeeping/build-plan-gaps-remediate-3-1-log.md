Verdict: FAIL
Strategy: STANDARD
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: operation store serialized — appendLedgerRows takes the store's own lock inside the target lock (.bkit/core/engine/commands/workflow/ledgers.ts)
DONE — Gap 2: migrateLedgers coordinated — target lock plus pending-intent refusal, test added (.bkit/core/engine/ledgers/migrate.ts, migrate.test.ts)
DONE — Gap 3: engine-issued operation id — new --issue-operation derives op-<invocation>-<request hash> from --invocation, exclusive with --operation (ledgers.ts, .bkit/core/.bkit/cli.md, ledgers.test.ts)
BLOCKED — Gap 4: Fixable derivation — code fixed (DERIVED_FIELDS.Fixable = some(fixable) in steps.ts) but planned test `derives supported header fields and rejects stale bodies without false PASS` in steps.test.ts still expects the old values: the bkit-build-plan-verify kinds row (`Fixable: "false"` for one fixable + one unfixable finding) must be `Fixable: "true"`, and `expect(header(cwd, "logs/clean.md")).toContain("Fixable: true");` (no findings) must be `toContain("Fixable: false");`. That test fails until the tests step corrects them.
DONE — Gap 5: header coverage — new test 'renders and verifies the header of every prompt that declares one' covers every prompt header, planned test untouched (steps.test.ts)
