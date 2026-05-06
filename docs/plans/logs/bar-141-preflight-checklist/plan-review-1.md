Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

## CRITICAL

1. **Phase 1 insertion-point contradiction between Architecture and Runbook.**
   - `Architecture & Component Changes → [MODIFY] bkit-install.ts` says: *"Insert Phase 1 between token resolution (line 638) and `dispatchModules` (line 668)"* — i.e. AFTER `resolveTokens`.
   - `Agent Execution Runbook → Task C5` says: *"after `parseArgs` and BEFORE `resolveTokens`, call `runPreflight(modules)`"*.
   - These are mutually exclusive. The decision matters because token resolution may itself fail in ways a blocker check could/should pre-empt (or vice versa). Pick one location, justify it, and align both sections. Recommendation: place Phase 1 immediately after `parseArgs` and BEFORE `resolveTokens` so that a missing-`package.json` blocker exits without ever resolving tokens — token resolution can fail noisily on malformed repos and confuse the blocker output.

2. **Public-id contract is incomplete — Breaking Changes id table omits ids the plan introduces.**
   The "stable identifiers" table in `Breaking Changes & Naming Review` is described as *"the public contract for downstream tooling"*, but the migration spec in `Agent Execution Runbook → Task B2` (and `Architecture → bkit-modules.ts` migration list, and `bkit-tiers.ts → tier3-merge-suggested-...`) introduces these ids that are NOT in the table:
     - `first-install-postinstall-steps`
     - `ci-package-json-missing`, `ci-package-json-malformed`, `ci-no-test-script`
     - `lint-package-json-missing`, `lint-package-json-malformed`, `vale-sync-recommended`
     - `git-hooks-package-json-missing`, `git-hooks-package-json-malformed`, `git-hooks-package-json-preserved-prepare`, `git-hooks-husky-devdep-added`
     - `tier3-merge-suggested-{dst-basename}` (note: the `{dst-basename}` suffix means this is a family of ids — the contract should specify the enumeration or commit to a stable parent prefix).
   Either add these to the breaking-changes id table (so human review is complete) OR explicitly state these are internal-only and not part of the stable contract. As written the human is asked to confirm an incomplete naming inventory.

3. **`WriteEntry.devDepsAdded` extension is marked both Optional and Required.**
   - `Architecture → bkit-tiers.ts`: *"Optional: extend `WriteEntry` with `devDepsAdded?: string[]` for Phase 3's `devdeps-need-fetch` lookup."*
   - `Architecture → bkit-postinstall.ts → detectDevDepsNeedFetch(ws)`: *"thread that through `WriteSet` (extend `WriteEntry` with optional `devDepsAdded?: string[]`)"* — i.e. the detector requires this field.
   - `Runbook → Task F3`: *"Extend `WriteEntry` with optional `devDepsAdded?: string[]`"* — required.
   If `detectDevDepsNeedFetch(ws)` is the contract, the field is mandatory; remove "Optional" framing in the Architecture section to avoid an implementer skipping the type extension and silently breaking the detector.

## OPTIONAL

1. **Acceptance Scenario design-missing fallback is correctly used, but the suggested wording is buried in italic parentheticals.** Per template Spec ("Design-missing fallback: If `{FID}-design.md` is absent... replace... with `⚠️ MISSING`... Do NOT fabricate"), the plan correctly does not fabricate. The suggested wording for human approval is helpful; consider extracting it into a `### Suggested wording (for human approval)` subsection rather than parenthetical italics, so the human reviewer can edit-in-place without parsing.

2. **Manual Verification Step 3 is non-deterministic on `vale-package-not-synced`.** *"Expected: 4 numbered advisories... `vale-package-not-synced` (if vale on PATH). Exit 0."* The "(if vale on PATH)" caveat makes the assertion unverifiable as a check-the-box step. Either (a) require vale on PATH as a precondition, (b) drop `vale-package-not-synced` and assert exactly 3 advisories, or (c) split into two sub-steps with explicit branches.

3. **No edge case / test for Phase 3 detector failure modes (timeout, hang, partial output).** Edge Cases table covers `gh` absent / `vercel` absent (returning `unknown`) but not: `gh secret list` hangs (no timeout listed), `vercel env ls` returns malformed JSON, `vale --version` hangs (5s timeout is mentioned in architecture but not tested). Add one row to Derived Test Matrix: *"`detectGhSecret` / `detectVercelEnv` / `detectValePackageNotSynced` return `unknown` when `execSync` exceeds Nms timeout"*.

4. **Line-number references will rot.** Architecture references concrete line numbers (638, 653, 668, 686-697, 911). These will be wrong by the time the runbook executes. Reference symbols instead (`ctx constructor`, `dispatchModules call site`, `inline checklist flush block`).

5. **Snapshot test of `formatChecklist` against issue-body example.** The issue body uses fixed-width dividers (`---` × 58) and specific indentation (8-space ACTION continuations). Snapshot byte-for-byte will be brittle if line endings or trailing whitespace differ between author/CI. Add explicit normalisation rules in Task G3 (LF only, no trailing whitespace, exactly N divider chars) so the snapshot is reproducible.

6. **Dedupe-by-id semantics: "Phase 3 wins on conflict" is asserted but not surfaced as a Test Matrix row.** Test Matrix has *"Findings are deduplicated by `id` when both phases emit the same finding"* but does not assert WHICH phase's `detect`/`action` text wins. Add an assertion or split the test row into two: dedupe + Phase-3-wins.

7. **`devdeps-need-fetch` is emitted by both Phase 2 (`runLintModule` migration in Task B2) and Phase 3 (`detectDevDepsNeedFetch` in Task F3).** This is the dedupe poster child but worth flagging in the Concrete Example so reviewers see the dedupe path exercised end-to-end.

## OUT OF SCOPE

1. **`bkit doctor` standalone verb** — already noted as future under "Future phase recommendations" and explicitly out of scope. No action.

2. **Per-finding consumer opt-out / `.bkit-ignore`** — out of scope per issue body. Worth a future issue if advisory fatigue emerges; do not add to this plan.

3. **Promotion of `--strict` mode** — explicitly rejected. No action.

4. **Sharing the `PreflightFinding` shape with BAR-139 (`bkit uninstall`)** — noted in Alternative Approaches as future recommendation. Correct to defer; the current plan should not pre-shape interfaces around an unscoped sibling feature.

5. **Reviewing the line-anchored `findLineAnchoredMarkers` helper for correctness** — the plan's `hasBkitMarkers` helper is described as "uses the same anchored-marker logic as `bkit-install.ts` `findLineAnchoredMarkers`". If that source helper is buggy, both will be — but verifying it is out of scope here. If concerned, file a separate audit issue.
