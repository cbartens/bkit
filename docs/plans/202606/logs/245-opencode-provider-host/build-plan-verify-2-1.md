Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan 2 of 4)

## Sub-Plans Verified

None (Single scope)

## Integration Gaps

None (Single scope)

## Previously Attempted

None (first attempt)

## Notes

All sub-plan 2 SOURCE code is fully implemented and correct. Phase 1 (Tasks 1.1, 1.2, 1.3) is complete with all named test assertions present and passing: applyOpencodeCommand, applyOpencodeAgent (effort->reasoningEffort, fail-loud process.exit(1), frontmatter shape), header-addressed parseModelLookupForColumn + parseOpencodeModelLookup, the cursor-regression assertion, the all-agents count assertion, the opencode model column in prompts.md, and the mapping note. These 3 tasks remain [x].

Phase 2 (Tasks 2.1, 2.2, 2.3) source is implemented and correct — OPENCODE_MANIFEST (Tier-2 json for opencode.json, byte-equal-text for gateguard.js, dynamic agent/command mirrors), the opencode.json template (env-var apiKey, no plaintext key), runOpencodeModule (registered in MODULE_REGISTRY + MODULE_DISPATCH_ORDER, opencodeModelLookup threaded additively through ModuleContext, post-install advisory naming provider key + bkit doctor/status), and the --opencode=<provider> CLI flag (OPTIN_MODULES additive, provider-required parse, printUsage updated). Direct-write pattern matches runCursorModule (established convention, not a deviation). KN-19 malformed-destination throw is satisfied by the shared writeTier2JsonContained helper (bkit-tiers.ts:232).

HOWEVER, the Phase 2 "Done when" clauses explicitly name test files + assertions that DO NOT EXIST: bkit-manifest.test.ts, bkit-modules.integration.test.ts, bkit-dry-run-parity.integration.test.ts, and bkit-cli.test.ts each contain ZERO opencode references. The named manifest round-trip, KN-19-for-opencode throw, clean-install writeset, dry-run parity, transactional-staging zero-footprint, advisory-emitted, and CLI flag-parse assertions are absent. opencode test coverage exists ONLY in bkit-install.test.ts (Phase 1). All 321 tests across the named suites pass, but they pass without exercising opencode in 4 of the 5 files. Per protocol step 8, Tasks 2.1/2.2/2.3 "Done when" criteria are not met → boxes un-ticked.

This is CONCERNS (not FAIL): the source is fully implemented and correct, the remaining work is purely adding the missing test assertions named in the plan — addressable by gap-remediate without redesign or feature work.

Verified test runs: bkit-install.test.ts + bkit-cli.test.ts + bkit-manifest.test.ts + bkit-catalog-parity.test.ts = 204 passed; bkit-modules.integration.test.ts + bkit-dry-run-parity.integration.test.ts = 117 passed, 2 skipped, 1 todo.

## Identified Gaps Log

6 gaps (4 CONCERNS-level test-coverage gaps + 2 MINOR). See entries below.

GAP-1 (Task 2.1) — `bkit-manifest.test.ts` contains zero opencode references. "Done when" requires the manifest test to round-trip OPENCODE_MANIFEST and to assert the opencode.json Tier-2/json write path throws on a malformed destination (KN-19) "unconditionally for the committed Tier-2 default". Neither assertion exists for opencode. (Source code IS correct: OPENCODE_MANIFEST registered, writeTier2JsonContained throws on malformed dest at bkit-tiers.ts:232; only the opencode-targeted test assertions are missing.)
GAP-2 (Task 2.2) — `bkit-modules.integration.test.ts` contains zero opencode references. "Done when" requires asserting a clean `--opencode` install writes .opencode/agent/_.md (count = parseModelLookup length), .opencode/command/_.md, .opencode/opencode.json, .opencode/plugin/gateguard.js; a transactional-staging zero-footprint assertion (KN-12); and an advisory-emitted assertion naming the provider key + bkit doctor/status. None present. (Source: runOpencodeModule, advisory, and registry wiring all implemented correctly.)
GAP-3 (Task 2.2) — `bkit-dry-run-parity.integration.test.ts` contains zero opencode references. "Done when" requires an identical dry-run vs install writeset assertion for `--opencode`. Absent.
GAP-4 (Task 2.3) — `bkit-cli.test.ts` contains zero opencode references. "Done when" requires asserting parseArgs(["install","--opencode"]) resolves the opencode module (+ core) and that help text lists `--opencode`. Absent. (Source: ModuleFlag/MODULE_FLAGS/OPTIN_MODULES + provider-required parse + printUsage all implemented correctly.)
MINOR (Task 1.2) — "Done when" names `bkit-catalog-parity.test.ts (extended)`; that file was not modified. Equivalent observable coverage (every agent has an opencode model entry; column present for all catalog agents) IS present in bkit-install.test.ts (parseOpencodeModelLookup describe, lines 1014-1027). Criterion satisfied, test located in a different file — not a blocker.
MINOR (Task 2.1 .gitignore sub-item) — the "determine whether opencode writes local-only runtime files → add gitignore entries" sub-item is unresolved; no opencode entries in .bkit/templates/gitignore and spike-verdict.md does not explicitly record this determination. Sub-item, not a hard "Done when". Note for remediation.

<!-- verdict:start -->

Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->
