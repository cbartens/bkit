Verdict: FAIL
Strategy: STANDARD
Fixed: 6

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 1 setup/group/attempt scoping — status invocation now binds --group/--attempt (Invocation.group/attempt) (.bkit/core/engine/commands/workflow/status.ts, lib.ts)
DONE — Gap 2: TASK 1 runless scope — standalone receipt records declaredStep and allowedAgent; --name/--agent/--group/--attempt validated (status.ts, lib.ts)
DONE — Gap 4: TASK 2 missing host model — an agent issued with no --observed-model is recorded unavailable (status.ts)
DONE — Gap 5: TASK 2 caller-asserted unavailable — appendLedgerRows refuses by.modelSource=unavailable without --invocation (commands/workflow/ledgers.ts)
DONE — Gap 6: TASK 2 table-driven compat — added provenance compat table through validate/normalize/fold/compact/query (ledgers/telemetry.test.ts)
DONE — Gap 7: TASK 3 invalid rows — queryLedger reports invalid-timestamp and invalid-identity diagnostics, coverage no longer clean (ledgers/telemetry.ts)
BLOCKED — Gap 1 (remainder): status-authority/outbox rehydration and workflows.ts/step-table.ts integration — an invocation row in status.jsonl would change the issuing run's status bytes, which the planned journal.integration.test.ts asserts stay unchanged; the plan does not decide the conflict
DONE — bkit tests changed: exit 0 (gate bkit:gate:changed PASS); render snapshots unchanged
