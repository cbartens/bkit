Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

None. No CRITICAL items. The plan does not drift from source, satisfies the bkit template, and every runbook task carries a terse, codebase-verifiable `Done when:` line. Issue #245's six acceptance bullets each map cleanly to a Success Criterion + Derived Test Matrix row + runbook task. The design-missing fallback is handled correctly (issue body authored into Narrative/Success Criteria, both gated behind human confirmation per template § Design-missing fallback). Approach-A removal (the riskiest scope) is sequenced LAST as its own PR with explicit grep-guard `Done when:` lines (Task 6.1/6.2), matching the issue mandate "sequenced LAST so there's no capability gap."

## OPTIONAL

- **Agent count "46" vs 47 on disk.** The plan hardcodes "46 agents" in ~12 places (Context, Success Criteria, Derived Test Matrix, Task 1.2/1.3/2.2). `.bkit/prompts/*.md` currently holds 47 files. The shipping tests (`bkit-catalog-parity.test.ts`) assert dynamically via `.length`, so this is doc-figure drift, not a test-encoded bug — but the `Done when:` lines for Task 1.2/1.3/2.2 say "returns all 46 agent names" / "writes 46 `.opencode/agent/*.md`", which would fail-loud against the real count. Recommend replacing the literal "46" with "all catalog agents (count = `parseModelLookup` length)" so the assertion tracks the catalog rather than a frozen number. Verify the live count before Build.

- **GateGuard "off" mode omitted.** `gateguard.cjs` has THREE modes (advisory [default] / off / deny). The plan's Edge Cases, Architecture note, and Task 3.1 `Done when:` enumerate only advisory + deny. For a faithful port the opencode plugin should also honour the disabled/no-op path (env `BKIT_GATEGUARD=off`). Add "off → no-op" to Task 3.1's coverage list so the parity is complete.

- **`bkit-mode.sh` has no engine-side TS counterpart — confirm test harness.** The plan introduces `bkit-mode.test.ts` (new) to assert shell-script behaviour (`bkit-mode.sh` is bash, not TS). No `bkit-mode.*` file exists in `.bkit/src/` today, so this is genuinely new test infrastructure for a shell artifact. Vitest asserting against a `.sh` file (grep for removed identifiers, parse flag grammar) is workable but unusual in this repo. Task 4.1/6.1 `Done when:` lines should name HOW the test exercises the script (string-scan of the rendered template vs spawning bash) so Build doesn't improvise. The repo-grep guard test is the stronger, lower-risk half — keep that as the load-bearing assertion.

- **Spike artifact path is also a Derived Test Matrix "Target file."** The matrix lists `spike-verdict.md` (a log doc) in the "Target file" column alongside Vitest test files. This is internally consistent (the spike is explicitly a manual gate, not a Vitest row) and the note above the matrix calls it out, so no action needed — but a reviewer scanning the matrix column may misread it. Optional: add a "(manual gate — not a Vitest file)" suffix in that cell.

- **Default-install decision left OPEN into Phase 2.** Task 2.3 branches on "ALL_MODULES (always-on, like cursor) vs OPTIN_MODULES per confirmed default-install decision." This is correctly surfaced for human confirmation in Breaking Changes, but it gates a concrete code path (`bkit-cli.ts`). Fine as-is since Gate 1 blocks on the confirmation checkbox, but flag for the human reviewer that this one decision forks Task 2.3 and the Concrete Example (which assumes explicit `--opencode`).

## OUT OF SCOPE

- **opencode dir-name uncertainty (`agent` vs `agents`, `command` vs `commands`).** The plan correctly defers this to spike-time confirmation (Breaking Changes) and the recon comments themselves disagree (Comment 3 says `.opencode/agents/` + `.opencode/plugins/`; the plan body uses singular `.opencode/agent/` + `.opencode/plugin/`). This is a real ground-truth question that drives manifest paths, but resolving it requires the live opencode CLI (the spike), so it cannot and should not be settled in the plan. Leaving it as a spike/Breaking-Changes confirm item is the right call — noted here only so the orchestrator does not treat the plan's singular-form paths as load-bearing before the spike confirms them.

- **Provider model-ID seeding (`ollama/qwen3.6:27b` etc.).** Picking real default model IDs per agent is explicitly out of scope (issue § Scope; plan Out of Scope) and consumer-tuned. Correct to exclude; the spike only needs to verify ONE real provider/model works, not curate the full catalog.

- **Codex CLI / OpenAI-native lane (#247) and per-agent capability override (#246).** Both correctly fenced out in Out of Scope and Related Issues. No leakage into the runbook.
