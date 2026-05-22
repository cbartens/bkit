Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

## CRITICAL

### C1 — Gate 1 is permanently blocked: Narrative and Success Criteria are marked MISSING and human confirmation checkboxes are unchecked

The plan correctly applies the design-missing fallback (Narrative and Success Criteria both read `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`). However, the plan then supplies suggested wording inside parenthetical `_(…)_` blocks and continues to populate all downstream sections (Concrete Example, Edge Cases, Derived Test Matrix, Runbook) as though the gate had been passed. Gate 1 is a hard gate — agent instructions say "do NOT pass Gate 1 until this checkbox is `[x]`". Both human-confirmation checkboxes (`Acceptance Scenario confirmed` and `Breaking Changes confirmed`) remain `[ ]`.

This means the plan is structurally sound in its content, but the gate machinery requires the human to explicitly confirm before the execution agent may proceed. The plan-summary agent must issue `REVISE`, not `APPROVE`, until both boxes are checked.

**Risk:** If the execution agent skips checking the gate state (by trusting session memory rather than re-reading the file), it will begin implementing against unconfirmed acceptance criteria and unconfirmed breaking changes. This is precisely the failure mode the gate exists to prevent.

**Required action:** Human must review and mark both checkboxes `[x]` before Gate 1 passes. No plan text change required; the gate instruction is already correct.

---

### C2 — `bkit check` (dry-run) Phase 3 skip is documented but the Phase 1 preflight interaction with dry-run is underspecified

The plan states Phase 3 is skipped in `bkit check` mode (correct — check is read-only). The edge-case table also confirms "Phase 1 blocker fires in `bkit check` (dry-run) → same exit 1 + blocker line; no writes." However, the `bkit-install.ts` modification section (Phase C5) says to insert Phase 1 "after `parseArgs` and BEFORE `resolveTokens`", while the current code resolves tokens at line 638 (awaiting an async call) before the `ctx` is constructed at line 653. In `bkit check` mode the existing flow still runs `resolveTokens` before any modules — Phase 1 preflight is inserted before this async call, meaning the preflight exits before any token resolution occurs. This is correct for blockers. But the plan is silent on whether Phase 1 advisory detection (e.g. `detectLintProseF9Vulnerable`) runs in `bkit check` mode, and if so, whether those advisories are surfaced (without the Phase 3 post-install output). The edge-case table says Phase 3 is skipped, but does not say what happens to Phase 1 advisories in check mode. The current dry-run path at lines 672–677 dumps `printSink` as plain lines. After migration, there is no equivalent handling of Phase 1 `preflightAdvisories` in the dry-run path. This creates a silent regression: check mode currently shows advisory messages; after migration it would show nothing (Phase 1 advisories accumulated into `ctx.advisories` but Phase 3 never runs to format them).

**Required action:** Add explicit handling in `bkit-install.ts main()` for dry-run: after `dispatchModules`, emit `formatChecklist(ctx.advisories)` (Phase 1 advisories only) even in dry-run mode, or explicitly document that check mode suppresses all advisories by design. If suppression is intentional, add that as an edge-case row and a `docs/knowledge.md` entry (plan already includes the knowledge entry but doesn't address the dry-run advisory output).

---

### C3 — `detectNpmrcAuth` returns `unknown` when `.npmrc` is absent, but the Derived Test Matrix has no test for the file-absent case emitting no advisory (only "missing-one-line" and "missing-both-lines" cases)

The Architecture section defines `detectNpmrcAuth` as returning `unknown` if `.npmrc` is absent. An `unknown` result should produce no finding (same as `gh` CLI unavailable). The test matrix row for this detector says "positive, missing-one-line, missing-both-lines, file-absent" — this implies four sub-cases, but the matrix row maps to a single task (`E3`) in the runbook. The runbook task `E3` reads "Implement `detectNpmrcAuth` + unit test (positive, missing-one-line, missing-both-lines, file-absent)" — one task for four sub-cases is fine. However, the Architecture section says the id emitted when `.npmrc` is absent is `unknown`, described as "covered by Vercel-side already, but distinct id" — this parenthetical is confusing. The sentence reads: "`detectNpmrcAuth(cwd)` — greps `.npmrc` for both `@cbartens:registry=` AND `_authToken=${GH_BKIT_TOKEN}`. `unknown` if `.npmrc` absent (covered by Vercel-side already, but distinct id)." This is internally contradictory: if the result is `unknown` and unknown means silent skip, why does the parenthetical say "but distinct id"? There appears to be no `id` for the `unknown` return — it produces no finding. The parenthetical is probably vestigial copy. This creates ambiguity for the execution agent: does file-absent emit `npmrc-missing-gh-packages` or nothing?

The breaking-changes table only lists `npmrc-missing-gh-packages` for `.npmrc` missing registry/auth lines — not for the file-absent case. Clarification needed: file-absent → `unknown` → no finding (silent). The "covered by Vercel-side already" comment is confusing and should be removed.

**Required action:** Clarify in the Architecture section that `.npmrc` absent → `unknown` → no finding emitted (not an advisory). Remove the contradictory parenthetical "(covered by Vercel-side already, but distinct id)".

---

## OPTIONAL

### O1 — Phase C5 insertion point race with async `resolveTokens`

The plan says Phase 1 runs "after `parseArgs` and BEFORE `resolveTokens`". In the current `main()`, `resolveTokens` is an async call (line 638). Inserting a synchronous Phase 1 before an async call is straightforward, but the runbook should note that `runPreflight` must remain synchronous (no `await`) to avoid introducing a new async boundary. The plan calls `runPreflight` as a synchronous function throughout — this is consistent — but should be stated explicitly in the architecture section to prevent the execution agent from adding async file I/O inside detectors.

### O2 — `formatChecklist` is called for blockers (Phase 1 exit path) but blockers have no `detect`/`action` in the output example

The issue body output example shows only `[advisory]` findings with `DETECT:` / `ACTION:` blocks. The plan uses `formatChecklist([...blockers])` for the Phase 1 exit path. The blocker finding shape is `PreflightFinding` which includes `detect` and `action` — this is fine — but the plan should confirm the formatter renders blockers with the same `--- i/N [blocker] id ---\nDETECT: ...\nACTION: ...` shape. The Manual Verification Step 2 only asserts "single `[blocker] no-package-json` line in the formatted output" — this is vague on whether `DETECT:` and `ACTION:` blocks appear. The snapshot test for `formatChecklist` should cover a blocker-only fixture, not just an advisory fixture.

### O3 — `detectCiYmlMissingTokenEnv` uses "YAML-grep" (string matching) on a YAML file, risking false negatives on valid multi-line YAML

The plan says "YAML-grep for an Install step without `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`" and notes "returns `null` if no ci.yml or step structure unrecognised (no false positives on bespoke layouts)." Grepping YAML by string is fragile — indentation variations, block/flow scalar styles, or quoted keys can defeat a regex match. The plan's escape hatch ("unrecognised → null") handles false positives correctly, but the string-grep approach may yield false negatives on valid ci.yml layouts that happen to format the env block differently. Since this is a low-stakes advisory (not a blocker), the current approach is acceptable, but the unit test should include at least one YAML variant with block-style `env:` mapping to prevent regression.

### O4 — `WriteEntry` extension with `devDepsAdded?: string[]` has a potential tsc break on existing callers

Task F3 extends `WriteEntry` with an optional `devDepsAdded?: string[]` field. `WriteEntry` is defined in `bkit-install.ts` and re-exported from `bkit-tiers.ts`. Adding an optional field to a TypeScript interface is non-breaking for existing callers (they don't need to provide it). However, the runbook does not include a `tsc --noEmit` verification step after F3 — the verification step is only mandated after A1 and A2. The runbook should add a type-check step after F3 to catch any structural issues before Phase G wiring.

### O5 — Integration test spawns `node --import tsx` but `.npmrc` KN-1 gotcha may cause false test failures

The integration test uses `node --import tsx .agents/scripts/bkit-install.ts install --full` (per Manual Verification Step 2). The test is designed to run against a scratch consumer dir in `tmp/`. If `GH_BKIT_TOKEN` is unset in the test runner environment, the `resolveTokens` call inside `bkit-install.ts` may fail before Phase 1 runs, masking the blocker exit with a token-resolution error. The plan should confirm that the integration test either: (a) seeds a stub `GH_BKIT_TOKEN` env var, or (b) confirms that `resolveTokens` gracefully handles an unset token without exiting before Phase 1 gets to run. Currently Phase 1 is inserted BEFORE `resolveTokens` per C5 — so in the blocker scenario the token resolution is never reached. This is correct. But the full happy-path integration test (scenario b) DOES reach `resolveTokens` and will fail if the token is unset. The runbook is silent on this environment setup requirement for integration tests.

### O6 — Derived Test Matrix row for `bkit check` + Phase 1 is absent

The edge-case table includes "Phase 1 blocker fires in `bkit check` (dry-run) → same exit 1 + blocker line." There is no corresponding Derived Test Matrix row for this behaviour, and no runbook task covers it. The template mandates "each row → exactly one task in the Agent Execution Runbook." If the check-mode blocker path is not tested, a regression could break it silently. Either add a matrix row and a test task, or explicitly document why it is covered by an existing row.

### O7 — `detectVercelProject` move from `bkit-modules.ts` to `bkit-postinstall.ts` should be reflected in `bkit-modules.ts` callers

The plan moves `detectVercelProject` to `bkit-postinstall.ts`. The Architecture section says `runCiModule` in `bkit-modules.ts` currently calls `detectVercelProject` (it's how the CI module decides whether to emit Vercel auth instructions). After the move, `runCiModule` either needs an import from `bkit-postinstall.ts` (introducing a dependency from modules → postinstall, which is a layering concern) or the CI module needs to receive the result as a parameter. The plan does not address this call-site migration for `runCiModule`. Task G2 only covers deleting the auth instruction constants — it doesn't address `runCiModule`'s remaining use of `detectVercelProject`. This could cause a compile error if the move is executed without updating the import in `bkit-modules.ts`.

---

## OUT OF SCOPE

### S1 — `bkit doctor` standalone verb

The plan mentions a future `bkit doctor` verb that calls `runPreflight` + `runPostInstallCheck` standalone. This is a sound future-phase idea but outside BAR-141 scope. Noted in the Alternative Approaches section — no action needed in this plan.

### S2 — BAR-139 (`bkit uninstall`) re-use of `formatChecklist`

The plan notes BAR-139 will share `formatChecklist`. This is a valid architectural motivation for the refactor but is outside BAR-141 scope.

### S3 — `pnpm-lock.yaml` change for `devDepsAdded` threading through `ensurePackageJsonDevDeps`

The plan correctly notes no new packages are required. However, it does not address whether threading `devDepsAdded` through `WriteEntry` requires any update to the `bkit-install.ts` type exports (since `WriteEntry` is exported from `bkit-install.ts` and re-exported from `bkit-tiers.ts`). This is a type-only change — no runtime or lockfile impact — but is worth confirming at the tsc gate.
