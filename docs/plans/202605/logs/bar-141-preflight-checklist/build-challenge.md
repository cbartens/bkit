Verdict: CONCERNS
Failures: 10

<!-- verdict:end -->

# Build Challenge

## Findings

The diff is large but well-structured. No CRITICAL bugs found that should block the PR. Several MEDIUM/LOW concerns worth addressing before merge or in follow-up.

### MEDIUM-1: Empty `.agents/.bkit-version` file produces NaN-major false advisory

- **File:** `.agents/scripts/bkit-preflight.ts:148-159` (`detectBkitVersionMajorDowngrade`)
- **Severity:** MEDIUM
- **Exploit / failure scenario:** A consumer with a zero-byte or whitespace-only `.agents/.bkit-version` file will:
  1. `fs.readFileSync(...).trim()` returns `""`.
  2. `"".split(".")[0]` returns `""`.
  3. `parseInt("", 10)` returns `NaN`.
  4. `NaN <= installingMajor` evaluates to `false` → detector falls through and emits an advisory with the literal string `"On-disk .bkit-version major (NaN) is greater than the installing version major (X)"`. This is a misleading, user-confusing advisory.
- **Suggested fix:** Validate parse result. If `Number.isNaN(onDiskMajor) || Number.isNaN(installingMajor)` return `null` (or emit a distinct `bkit-version-malformed` advisory). Same defensive guard belongs in `detectBkitVersionPinStale` `semverGt` — `Number(undefined)` etc. → NaN comparisons silently return `false` for both `>` and `<`, masking malformed inputs.

### MEDIUM-2: Module-emitted ctx.advisories not deduplicated before runPostInstallCheck

- **File:** `.agents/scripts/bkit-install.ts:670-710`, `.agents/scripts/bkit-postinstall.ts:275-384` (`runPostInstallCheck`)
- **Severity:** MEDIUM
- **Exploit / failure scenario:** Plan F4 mandates "intra-phase dedupe-by-id (first occurrence wins) on the Phase 3 finding array BEFORE the cross-phase dedupe" AND "Apply the same intra-phase dedupe inside `runPreflight` (both `blockers` and `advisories`)." The implementation does dedupe within `runPreflight` (`dedupeById` in bkit-preflight.ts) and within Phase 3 (`dedupeById` in bkit-postinstall.ts). However, the array passed AS `preflightAdvisories` to `runPostInstallCheck` is `ctx.advisories`, which is `[...preflightAdvisories]` from runPreflight PLUS any pushes from `dispatchModules` (e.g. multiple modules pushing `lint-package-json-malformed`, `tier3-merge-suggested-X` family across overlapping calls, or `devdeps-need-fetch` from both runLintModule and runGitHooksModule paths in theory). The current cross-phase dedupe filters by Phase-3 ids only, so duplicate ids that originate WITHIN ctx.advisories survive into the final banner.
- **Suggested fix:** In `runPostInstallCheck`, dedupe the incoming `preflightAdvisories` first (before the cross-phase filter): `const dedupedPreflight = dedupeById(preflightAdvisories);` and use that downstream. Alternatively, run `dedupeById` on `ctx.advisories` once before passing it in.

### MEDIUM-3: Plan F4 test row "intra-phase dedup in runPostInstallCheck" not exercised with truly duplicate ids

- **File:** `.agents/scripts/bkit-postinstall.test.ts:350-376` ("deduplicates findings within Phase 3 when same id appears multiple times")
- **Severity:** MEDIUM
- **Exploit / failure scenario:** The Derived Test Matrix row "Findings deduplicated within a single phase when modules double-report the same `id`" is required by the plan, mapped to Phase F4. The existing test of the same name actually validates **cross-phase** dedup (preflight vs Phase 3), not **intra-phase** Phase-3 dedup. There is no test where two real Phase-3 detectors emit the same id and verify the second is dropped. Because the Phase-3 detectors don't organically produce duplicates, this dedupe path is effectively un-covered. If a future detector introduces a duplicate id, the contract that "first occurrence wins" can regress silently.
- **Suggested fix:** Add a unit test that injects duplicates by mocking — e.g. force two detectors that share an id, or pass synthetic findings into a helper that exercises `dedupeById`. At minimum, export `dedupeById` and unit-test it directly. The same gap applies to the `runPreflight` test "deduplicates findings within phase when same id would appear twice" — its assertion `expect(allIds).toEqual(uniqueIds)` only proves no duplicates are observed organically; it does not prove the dedupe code path executes.

### MEDIUM-4: detectCiYmlMissingTokenEnv brittle to whitespace / quoting variations

- **File:** `.agents/scripts/bkit-postinstall.ts:107-130`
- **Severity:** MEDIUM
- **Exploit / failure scenario:** The detector matches on the literal substring `"GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}"`. A perfectly valid ci.yml with any of:
  - `GH_BKIT_TOKEN_INSTALL: "${{ secrets.GH_BKIT_TOKEN_INSTALL }}"` (quoted)
  - `GH_BKIT_TOKEN_INSTALL:${{secrets.GH_BKIT_TOKEN_INSTALL}}` (no spaces)
  - `GH_BKIT_TOKEN_INSTALL: ${{secrets.GH_BKIT_TOKEN_INSTALL}}` (different inner spacing)
  - Multiple-line YAML folded form

  …will all FAIL the substring match → false-positive advisory. Worse, a workflow that uses `pnpm install --no-frozen-lockfile` without env (legitimate, e.g. cache-warm step) will trip the `pnpm install` heuristic and emit the advisory even though the actual install step elsewhere has the env block. Plan said "no false positives on bespoke layouts."

- **Suggested fix:** Use a regex like `/GH_BKIT_TOKEN_INSTALL\s*:\s*["']?\$\{\{\s*secrets\.GH_BKIT_TOKEN_INSTALL\s*\}\}/`. Or parse the YAML properly. Document in the action message that bespoke layouts may need manual verification.

### MEDIUM-5: Type-safe but runtime-unchecked shell template in detectVercelEnv

- **File:** `.agents/scripts/bkit-postinstall.ts:82-97`
- **Severity:** MEDIUM (defense in depth)
- **Exploit / failure scenario:** `execSync(\`vercel env ls ${env}\`, …)`interpolates`env`as a TypeScript-typed`"preview" | "production"`. Type erasure means at runtime nothing prevents a future caller (or a JS consumer importing from compiled `.js`) from passing an arbitrary string. While current call sites in `runPostInstallCheck`use literal`"preview"`and`"production"` only, adding a runtime guard hardens against future refactors and accidental misuse from the JS edge.
- **Suggested fix:** Add `if (env !== "preview" && env !== "production") return "unknown";` at the top of `detectVercelEnv`, OR switch to `execFileSync("vercel", ["env", "ls", env], …)` which removes shell metacharacter handling entirely. The same hardening applies to `detectGhSecret` (no user input today, but `execFileSync` is consistently safer).

### LOW-1: hasBkitMarkers uses naive substring check (not anchored)

- **File:** `.agents/scripts/bkit-preflight.ts:28-30`
- **Severity:** LOW
- **Exploit / failure scenario:** `hasBkitMarkers` matches if `<!-- bkit:start -->` appears anywhere in content, including inside a backtick-quoted prose example. A consumer writing a README that mentions `<!-- bkit:start -->` literally inside a code fence (or pre-existing reference docs) will silently pass the marker check and skip the advisory — even though their `.husky/pre-commit` lacks an actual managed block. The install code itself uses `findLineAnchoredMarkers` (in `bkit-install.ts`) for actual block detection. The plan called this out: "uses the same anchored-marker logic as `bkit-install.ts` `findLineAnchoredMarkers`" — but the implementation regressed to substring.
- **Suggested fix:** Reuse `findLineAnchoredMarkers` from `bkit-install.ts` (or re-implement the line-anchored check) so the detector matches the install logic exactly. Otherwise dest files with quoted references silently miss the advisory and their managed block won't be added correctly later.

### LOW-2: `runPostInstallCheck` cross-phase dedupe re-orders Phase-3-winning findings to the back of the banner

- **File:** `.agents/scripts/bkit-postinstall.ts:377-383`
- **Severity:** LOW
- **Exploit / failure scenario:** When a finding id appears in both phases, the implementation removes it from the preflight portion and appends the Phase-3 entry. The cumulative ordering is `[...filteredPreflight, ...phase3Deduped]`. Per plan, "Phase 3 wins on conflict because re-detection is more accurate" — only the content wins; position is unspecified. But this means a cross-phase-overlapping finding moves from its Phase-1 position to the back of the banner. This is a minor surprise for a consumer eyeballing diffs between checklists across two installs.
- **Suggested fix:** Either (a) document the position-shift in the README/knowledge.md, or (b) preserve the position of the original Phase-1 finding while substituting its content from Phase 3 (zip-in-place merge). Acceptable as-is; flag for awareness.

### LOW-3: Vercel CLI may hang interactively on a non-linked project

- **File:** `.agents/scripts/bkit-postinstall.ts:82-97`
- **Severity:** LOW
- **Exploit / failure scenario:** `vercel env ls` requires the project to be linked. On a fresh consumer who has `vercel.json` (so `detectVercelProject` returns true) but has never run `vercel link`, the CLI prompts on stdin. With `stdio: ["ignore", "pipe", "ignore"]` stdin is closed, but vercel CLI may try to prompt for project linking and stall until the 10s timeout. This adds 20s to every `bkit install` for a Vercel-but-unlinked consumer (preview + production = 2 timeouts) — once per install. Annoying UX but the timeout protects from hanging indefinitely.
- **Suggested fix:** Reduce timeout to 3-5s, OR detect "not linked" via short-circuit — e.g. check `.vercel/project.json` exists before invoking `vercel env ls`.

### LOW-4: GH_BKIT_TOKEN_INSTALL is empty-string normalised to "missing" — silent footgun

- **File:** `.agents/scripts/bkit-postinstall.ts:22-24`
- **Severity:** LOW
- **Exploit / failure scenario:** `Boolean(process.env.GH_BKIT_TOKEN_INSTALL) ? "present" : "missing"` — empty string evaluates as missing (correct). Fine. But this means a consumer who exported `GH_BKIT_TOKEN_INSTALL=""` to debug will see "missing", which is technically correct but the resulting ACTION advisory does not call out the empty-string case (it tells them to export). Not a bug — observation only.

### LOW-5: bkit-install.ts main() — Phase 1 errors are not logged through `[bkit-install]` prefix on dry-run path

- **File:** `.agents/scripts/bkit-install.ts:643-651`
- **Severity:** LOW
- **Exploit / failure scenario:** When `dryRun=true` and a Phase 1 blocker fires, `LOG_PREFIX` has been set to `[bkit-check]`, but the blocker banner from `formatChecklist` carries its own `[bkit] Post-install checklist` prefix. Log scanners filtering on `[bkit-check]` exclusively won't pick up the blocker banner. The plan does not mandate prefix consistency here — just calling out for awareness.

### Architectural / Plan-DoD review

- **Plan DoD: `runPostInstallCheck` signature** — plan specifies `(preflightAdvisories, ws, modules, cwd?)`. Implementation adds a `dryRun` 5th parameter. Acceptable extension; doesn't break the public contract.
- **Plan DoD: snapshot test** — plan §F5 requires a `formatChecklist` snapshot test "against the issue body's example fixture" matching "byte-for-byte (line endings, divider widths, blank-line counts)" per Manual Verification Step 5. The existing tests use `.toContain(...)` assertions, NOT `expect(banner).toMatchSnapshot()` against a fixture. The exact formatted-output contract is not snapshot-locked. **Worth flagging — plan calls for a snapshot test specifically; current tests assert substrings only.**
- **Plan DoD: dispatchModules side-effects on dry-run with .bkit-version** — verified: `postDispatch` for `.bkit-version` correctly guards `if (!dryRun)` for the actual write, so dry-run remains clean.
- **Plan DoD: `runPreflight` runs synchronously** — verified, no `await` inside detectors.
- **Plan DoD: blocker exits before resolveTokens** — verified at `bkit-install.ts:647-652`.
- **Plan DoD: `formatChecklist([])` returns `""`** — verified.
- **Plan DoD: `detectNpmrcAuth` silent skip when absent** — verified ("unknown" → no advisory pushed in `runPostInstallCheck`).
- **Plan DoD: token VALUE never logged** — verified. All token usage is `Boolean(...)` or `.includes("GH_BKIT_TOKEN_INSTALL")` (key-name only); no value reads.
- **Plan DoD: `detectVercelEnv` silent short-circuit** — verified.
- **Plan DoD: `bkit check` skips Phase 3** — verified.
- **Subprocess spawn test** — `.agents/scripts/bkit-install.integration.test.ts:79-108` uses `--import ${tsxBin}/register` syntax. Confirm tsx supports this — modern tsx 4.x uses `tsx` directly as `--import`, and the `/register` subpath may be tsx 3.x convention. Worth verifying it doesn't silently fail (the `if (!fs.existsSync(tsxBin)) return;` guard means CI without devDeps installed silently skips this assertion entirely → test passes without exercising the subprocess at all). LOW concern: if tsx isn't found, the only assertion that proves end-to-end exit-code behaviour is skipped silently.

### Summary

No critical bugs. The implementation is faithful to the plan with only minor edge-case gaps and brittleness in detector logic. Recommend addressing MEDIUM-1, MEDIUM-3, and MEDIUM-4 before merge; LOW items can be deferred to a follow-up issue.
