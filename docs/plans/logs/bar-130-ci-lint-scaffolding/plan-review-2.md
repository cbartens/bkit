Verdict: CONCERNS
Failures: 7

<!-- verdict:end -->

# Plan Review

## CRITICAL

### C1 — Dry-run bug scope misidentified (Task 5.1 / Phase 5)

The plan attributes the 14-vs-15 dry-run parity bug to `runTemplates` rule 3a and frames it as "already does for the template-write side, but write-set tracking now needs to flow through a shared WriteSet accumulator". Reading the actual `runTemplates` source (`.agents/scripts/bkit-install.ts` lines 425–443) shows that rule 3a **already increments `writes++` and logs** before the `continue`. The dry-run branch (`if (!dryRun) fs.writeFileSync(...)`) is only the write gate, not the count gate — the count always increments. The real bug is likely that `runTemplates` is called on `.agents/templates/` only, and the missing write was a `.gitignore` block appended by a path **not covered by templates at the time** (it may have been driven by `runHost` or a path that didn't exist in the template tree). Task 5.2 "fix dry-run path in `runTemplates` rule 3a" is therefore likely a no-op fix that will leave the actual bug unresolved. **Required change:** Task 5.1 must include a root-cause investigation step — run `bkit check` vs `bkit install` on a real tmpdir mirroring `app-gether-life` pre-v0.1.2 state and identify the actual diverging path before specifying the fix in Task 5.2. Do not pre-assume the fix location is `runTemplates`.

### C2 — `bkit-install.ts` uses `"html-comment"` marker strings that don't exist yet (Task 2.1–2.2)

The existing marker constants in `.agents/scripts/bkit-install.ts` (lines 262–266) are `START_MARKER = "<!-- bkit:start -->"` and `END_MARKER = "<!-- bkit:end -->"`, and `findLineAnchoredMarkers`, `updateManagedBlock`, `extractManagedBlock`, `extractFullManagedBlock` are all exported by name. The plan says Task 2.2 will "add `markerStyle` arg (default `html-comment`)". However, `updateManagedBlock` is already exported and imported by `bkit-install.test.ts` by signature `(filePath, newContent, dryRun)`. Adding a fourth `markerStyle` arg breaks the existing call sites in `main()` at line 453 (inside `runTemplates`). The plan has no task for updating call sites or ensuring backward-compatible overloading. **Required change:** Task 2.2 must explicitly list every call site of `updateManagedBlock`, `findLineAnchoredMarkers`, `extractManagedBlock`, `extractFullManagedBlock` that will be touched, and Task 2.1 tests must cover the unchanged default behaviour so any call-site regression is caught before Task 4.3.

### C3 — Supersession Inventory `bkit-init.ts` designation is contradictory

The Supersession Inventory marks `bkit-init.ts` as `DELETE` in the table but the justification says "tracked as RETAIN-WITH-REASON because the `init` verb itself remains as a CLI deprecation stub". The Decision column and Justification are internally inconsistent. The `[DELETE] bkit-init.ts` is correct (the file's body moves to `runCoreModule`), but the Justification text is the wrong explanation — it should say "init verb deprecation stub lives in `bkit-cli.ts`, not in this file; deletion is safe". The build agent following the current text may misread this as "retain the file". **Required change:** Clarify Justification column to read: "File body migrates to `runCoreModule` in `bkit-modules.ts`; deprecation stub for the `init` verb is in `bkit-cli.ts`. File itself is deleted."

### C4 — DoD bullet 13 (`app-gether-life` smoke) and bullet 14 (second consumer) not fully covered by automated verification

DoD bullets 13 and 14 (plan-input.md lines 193–195) require `app-gether-life` re-install with no surprise drift and at least one second consumer (`www-visitfrasercoast-com`) to onboard via `bkit install --full`. These are documented in Task 10.3 (smoke-install log) and Step 7/8 of Manual Verification. Task 10.3 explicitly defers bullet 14 to "Separate human session, not auto". This is permissible as a manual gate, but the plan must contain a hard **Gate 4.5** checkpoint (between Gate 4 and the PR) that blocks merge until both bullets are manually confirmed — currently there is no gate that enforces this. Gate 4 only covers automated test checks. **Required change:** Add a Gate 4.5 manual-confirmation gate in the Runbook after Task 10.3 that requires human sign-off on bullet 13 AND bullet 14 before the plan is marked complete. Without this gate the build agent can mark Gate 4 passed and open the PR while bullets 13/14 are still open.

### C5 — `bkit-install.ts` `main()` currently hard-checks `.agents/prompts.md` existence before non-init verbs (line 650–653)

After refactor (Task 4.3), the entry point changes to use `parseArgs` from `bkit-cli.ts` and module dispatch. The guard `if (verb !== "init" && !fs.existsSync(".agents/prompts.md"))` will need to be reconsidered — it will reject `bkit install --ci` on a greenfield repo that has no `.agents/` yet (which is a valid first-run use case for `--ci` alone, since `--core` is implicitly prepended). The plan does not mention removing or adjusting this guard. If left in, integration tests for `bkit install --ci` on a clean tmpdir will fail. **Required change:** Task 4.3 must include an explicit sub-step: remove or replace the `.agents/prompts.md` presence guard with logic that checks only when the `--core` module actually needs it (or removes it entirely if `runCoreModule` creates the file).

### C6 — `extractFullManagedBlock` function not listed in the generalisation scope (Task 2.2)

Task 2.2 says "Generalise `findLineAnchoredMarkers`, `updateManagedBlock`, `extractManagedBlock`, `extractFullManagedBlock`" — four functions. Reading the source: `extractFullManagedBlock` calls `findLineAnchoredMarkers` internally using the hardcoded `START_MARKER` / `END_MARKER` constants. Generalising `findLineAnchoredMarkers` to take a marker string means `extractFullManagedBlock`'s internal call also needs to be updated and pass the right marker strings. The plan has "extend bkit-install.test.ts" for Task 2.1 and "modify bkit-install.ts" for Task 2.2 but gives no concrete detail about what `markerStyle: "hash-comment"` maps to in terms of actual string literals (`"# bkit:start"` / `"# bkit:end"`). The test matrix row for this ("Hash-comment marker variant round-trips") targets `bkit-install.test.ts (extend)` but is defined only near the bottom of the test matrix (line 109), disconnected from Task 2.1 which targets a different row. **Required change:** Task 2.1 must explicitly state the hash-comment marker string literals (`# bkit:start` / `# bkit:end`) and the corresponding test assertions; Task 2.2 must list all four functions and show how `markerStyle` maps to concrete constants.

### C7 — `package.json` `"private": true` conflicts with shipping as a git dependency to consumers

`package.json` (line 4) has `"private": true`. The plan adds prettier as a devDep (Task 7.4) and bumps the version (Task 10.1) but never addresses `"private": true`. When consumers run `pnpm add -D github:cbartens/bkit#v0.1.2`, pnpm will install the package — `private: true` does not block git-dep installation. However, if the plan ever moves to `npm publish`, this field would block it. More critically, the plan does not verify that the `"files"` array (currently `["dist", ".agents", "README.md"]`) covers all new template paths added in Phase 6. If `.agents/templates/.github/`, `.vale/styles/House/`, `.husky/`, etc. are NOT under `.agents/` they would be missing from the npm/git-dep package. The templates are under `.agents/templates/` which IS covered, but `.github/workflows/ci.yml` added to bkit-the-repo (Phase 7) is NOT a template — it is a real file at repo root `.github/`. This is fine (not shipped to consumers), but requires verification. **Required change:** Task 7.1 must include an explicit verification that `.github/workflows/ci.yml` added to bkit-the-repo is excluded from consumer package distribution (it is under `.github/`, not under `dist/` or `.agents/` or `README.md`, so it is correctly excluded — but the plan should state this explicitly to avoid confusion during build).

---

## OPTIONAL

### O1 — `bkit-tokens.ts` testing strategy uses `process.chdir` which can leak between tests

Task 1.1 specifies "Use `tmpdir` + `process.chdir`". Vitest runs tests in a single process; `process.chdir` side-effects persist if a test fails before the `afterEach` restore. The existing `bkit-install.test.ts` already uses this pattern, but Phase 1 adds more heavy `process.chdir` usage across 6+ test cases. Recommend adding `beforeAll(() => originalCwd = process.cwd())` + `afterEach(() => process.chdir(originalCwd))` pattern explicitly documented in Task 1.1, to prevent flaky-order failures.

### O2 — Phase 6 template tasks have no failing test precondition (violates reproduce-first rule)

Tasks 6.1–6.6 create template files and verify via manual `bkit install --X` against tmpdir. None of them point to a failing automated test that turns green on completion. The Derived Test Matrix covers the tier-writer behaviour (Tasks 2.3/2.4) and module-dispatch behaviour (Tasks 4.1/4.2), so the individual template-file creation in Phase 6 is implicitly tested by Task 4.1 integration tests — but this linkage is not stated. Tasks 6.1–6.6 verifications say "run `bkit install --X` against tmpdir" which is manual. Recommend adding a note in Phase 6 that the integration tests from Task 4.1 (which run against real templates) constitute the automated reproduce-first coverage, and that the manual tmpdir check is a supplementary smoke only.

### O3 — `runCiModule` template contains `bkit check` as a CI step, but `bkit check` requires `.agents/` to exist

The `.agents/templates/.github/workflows/ci.yml` template's `bkit-gates` job includes `bkit check` as a step (Architecture section, B component, line 332). On a consumer repo where only `--ci` was installed (without `--core`), `.agents/` may not exist, and `bkit check` in CI would fail with the `.agents/prompts.md` guard (see C5 above). The edge-case table does not cover this scenario. Recommend either (a) scoping the CI template's `bkit check` to `bkit check --ci` (only checks the CI module itself), or (b) documenting in the edge-case table that `--ci` implicitly runs `--core` first, which seeds `.agents/`, so `bkit check` in CI always has `.agents/` available.

### O4 — `slop-scan.config.json` Tier 3 "suggested diff" output format is unspecified

Task 6.3 says "Existing consumer file → suggested-diff to stdout". The Tier 3 semantics in `bkit-tiers.ts` push to `printSink`. The format of the suggested diff is never specified in the plan — is it a unified diff, a prose message, or a code block? The edge-case table says "print suggested diff to stdout; exit 0" but gives no format. This matters because the test matrix row "Tier 3 seed-or-print: `slop-scan.config.json` exists → no write; suggested-diff printed to stdout" will need to assert against a specific format. Recommend specifying the output format (e.g., `"[bkit] Suggested update for slop-scan.config.json:\n<json block>"`) before Task 2.4 implementation.

### O5 — `bkit-install.ts` `build` output includes `dist/bkit-init.js` which will be deleted

The Verification Plan (Automated Tests) says '`pnpm build` emits `dist/bkit-install.js`, `dist/bkit-tokens.js`, etc. No `dist/bkit-init.js`'. The current `tsconfig.json` would need to be checked — if `bkit-init.ts` is in the compile scope, deleting it (Task 4.4) without confirming `tsconfig.json` `include`/`exclude` patterns is fine only if the compiler picks up all `.ts` files under `.agents/scripts/`. Task 4.4's acceptance criterion (`grep -r 'bkit-init' .agents/ tsconfig.json package.json`) will catch stale import references, but not a tsconfig that explicitly lists the file. Low risk but worth an explicit `cat tsconfig.json` check in Task 4.4.

### O6 — `lint:prose` script in Task 7.4 uses `|| (echo 'vale not in PATH — skipping' && exit 0)` which masks real Vale errors

The proposed `lint:prose` script pattern `"vale .agents/ *.md || (echo 'vale not in PATH — skipping' && exit 0)"` will silently pass CI when Vale IS installed but exits non-zero due to a real prose error. The guard should test `command -v vale` first, not catch all errors. Recommend: `"bash -c 'command -v vale && vale .agents/ *.md || echo [bkit] vale not in PATH — skipping'"`. The same issue will exist in the seeded consumer `ci.yml` if it uses the same pattern — though the CI template installs Vale itself, so this only matters for local dev.

### O7 — Human Confirmation checkboxes (Gate 1) are unchecked and plan proceeds anyway

Both `👤 ✅ Human Confirmation` checkboxes (Acceptance Scenario and Breaking Changes) are `[ ]` unchecked. The plan's own caution blocks say "Do NOT pass Gate 1 until checked". The plan header has a PASS verdict already written by a prior review agent. The build agent will read the header and potentially proceed without human confirmation. The plan's caution text is correct; the concern is that the existing header verdict `PASS` (from a prior review pass embedded in the plan itself, line 1) could be misread by a build agent as "human-confirmed". This is a process risk, not a plan defect — but it is worth flagging for the orchestrator to ensure human gates are enforced before build starts.

---

## OUT OF SCOPE

### OOS1 — Plan references `claude.yml` / `ci-complete.yml` implicitly via BAR-120 cross-references

The plan's Out of Scope section correctly excludes `claude.yml` / `ci-complete.yml`. No task touches these files. No action required — confirmed clean.

### OOS2 — `docs/pending.md` entries for `--no-X` / `--force` flags and `package.json` auto-merge

Task 9.2 routes these correctly to `docs/pending.md`. No plan expansion needed — confirmed correct routing.

### OOS3 — Three-way merge / versioned migrations

Correctly rejected in Alternative Approaches. No action.

### OOS4 — Helper action `cbartens/bkit/.github/actions/setup-auth@v1` (BAR-131 v0.2)

Correctly deferred to BAR-131. Task 9.2 adds the pending entry. No action.

### OOS5 — Release automation workflows beyond `ci.yml`

Correctly excluded. No task touches release automation. No action.
