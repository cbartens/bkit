Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Single — sub-plan 1 of 3 (`141-cloud-app-plan-1.md`, Block 1: D1 fix + cloud-module split + tracker/cloud enforcement + advisory flip).

## Sub-Plans Verified

None (Single scope — 1 sub-plan).

## Integration Gaps

None (Single scope — cross-sub-plan integration is out of scope; T2.x/T3.x edits to the same template are explicitly owned by child 2).

## Previously Attempted

None (attempt 1).

## Notes

All Block-1 deliverables (T1.1–T1.10) verified directly against the diff, source files, and live test/typecheck runs — not taken from the executor log. T1.11 (`.agents/advisories.md` regen) is the intentionally-deferred orchestrator end-of-session batch regen; its verifiable part (correct SOURCE advisory definitions in `bkit-modules.ts`/`bkit-postinstall.ts`) is satisfied. Did NOT run `bkit install`.

Verification evidence:

- T1.1 (template): `.agents/templates/.github/workflows/bkit-cloud.yml` has `id-token: write` (line 76); `grep "github.token handles"` returns nothing; no `@@CLOUD_TRACKER` sentinels remain.
- T1.2 (`renderCloudWorkflow`): function at `bkit-modules.ts:1942` has no `isLinear` branch (tracker param `_tracker` ignored); resolves remaining sentinels to empty as a guard; integration test `bkit-modules.integration.test.ts:800` asserts rendered output has `id-token: write`, no `LINEAR_API_KEY`, no `@@CLOUD_TRACKER`. Linear-keep regression cases replaced.
- T1.3 (rendered copy): `.github/workflows/bkit-cloud.yml` byte-identical to `renderCloudWorkflow(template,"github")` (verified by node script — `byte-identical: true`); has `id-token: write`; the single "Linear" string (line 11) is a forward-looking phase-2 comment present identically in template, not a render branch.
- T1.4 (CLI): `bkit-cli.ts:214` rejects bare `--cloud` for non-uninstall verbs (exit 1); `:225` parses `--cloud=<variant>` and rejects invalid values (exit 1); `--force` parsed (`:245`); `printUsage` shows `--cloud=claude|cursor` (`:346`,`:351`,`:383`,`:384`). `bkit-cli.test.ts` green.
- T1.5 (split + field + manifest): `runCloudModule` branches `variant==="claude"` vs `"cursor"` (`bkit-modules.ts:1958`,`:2066`); `setConsumerBkitField("cloudAgents","claude"/"cursor")` (`:1999`,`:2075`); `CLOUD_MANIFEST_CLAUDE`/`CLOUD_MANIFEST_CURSOR` split (`bkit-manifest.ts:219`,`:224`); `parseCloudAgents("enabled")→"claude"` (`:142`); field-convention note widened to `claude|cursor|none` (`:118-132`). Manifest tests (39 incl. variant-ownership + back-compat) green.
- T1.6 (constraint + switch-block): `bkit-install.ts:948` tracker-switch hard-block requires `--force`, first-set free, symmetric; `:990` symmetric cloud/tracker constraint runs BEFORE `dispatchModules` (`:1017`) → no files written on mismatch.
- T1.7 (advisory flip + Auto migration + cloud.md): `grep '\bAuto\b' bkit-modules.ts` returns nothing; advisory states `/install-github-app` "required" (`:2010`); deleted "github.token handles" framing; `cloud.md` matrix (line 23) + path E (line 30) + Post-CI section flipped to App base requirement. Integration test asserts `install-github-app` + `bkit:auto` + no bare `Auto`.
- T1.8 (`bkit check` consistency): `buildCloudSetupAdvisory` (`bkit-postinstall.ts:816`) emits `cloud-claude-missing-id-token` with `severity:"blocker"` when `cloudAgents==="claude"` and workflow lacks `id-token: write`; blocker count drives exit signal.
- T1.9 (LINEAR_API_KEY decoupling): `detectCiRouterSecrets` requires only `ANTHROPIC_API_KEY` for `bkit-cloud.yml` (`:921`); `buildCloudDashboardsAdvisory` splits on `isCursorCloud` (`:878`); LINEAR_API_KEY appears only on the tracker-setup advisory (`.agents/.env`) and the cursor/.cursor dashboard path. Integration test `bkit-modules.integration.test.ts:740` asserts cloud=claude advisory does NOT reference LINEAR_API_KEY.
- T1.10 (dry-run parity): `bkit-dry-run-parity.integration.test.ts:109`/`:129` cover both variants — claude lists `bkit-cloud.yml`+`cloud-bootstrap.sh` (no Dockerfile), cursor lists `.cursor/Dockerfile`+`environment.json` (no bkit-cloud.yml). Green.
- Live gates: `pnpm vitest run` over the 5 relevant suites → 298 passed, 2 skipped, 1 todo. `pnpm typecheck` → clean.

## Identified Gaps Log

None blocking. One minor cosmetic note (non-blocking, does NOT violate any Done-when): stale comment at `.agents/scripts/bkit-postinstall.ts:1338` still reads "bkit-cloud workflow requires ANTHROPIC_API_KEY + LINEAR_API_KEY secrets", but the function it annotates (`detectCiRouterSecrets`) functionally requires `ANTHROPIC_API_KEY` only — comment drift, not a functional coupling. T1.9's substantive criterion (no builder associates LINEAR_API_KEY with the bkit-cloud.yml secret set) is met.
