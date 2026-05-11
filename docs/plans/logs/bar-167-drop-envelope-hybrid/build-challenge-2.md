Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge 2

## Findings Log

---

### Finding 1 — MINOR | mechanical
**File:** `.agents/scripts/bkit-preflight.ts:402`
**Title:** `detectTier2JsonDrift` argument order is correct but asymmetric with the docstring — verify no latent swap risk

In `detectTier2JsonDrift` the call is:
```ts
const result = deepContains(templateDoc, consumerDoc);
```
`deepContains(template, consumer)` is the correct order (template is what bkit owns; consumer must contain it). This matches the function signature. However, the docstring at line 383 says "Runs deepContains(template, consumerFile)" which is correct. No actual bug, but the argument naming in the call site (`templateDoc` vs `consumerDoc`) means a reviewer must double-check the function signature to be sure. The risk is acceptable given the solid test coverage, but worth flagging as a latent read-error trap — the arguments are positionally identical to the wrong swap that would silently produce false-ok results (consumer drift not detected).

**Exploit scenario:** If the arguments were accidentally swapped by a future refactor, `bkit check` would report "no drift" even when the consumer has deleted bkit-owned JSON keys. There is no current bug, but the call is fragile.

**Suggested fix:** Add a named-argument comment at the call site:
```ts
const result = deepContains(/* template */ templateDoc, /* consumer */ consumerDoc);
```

---

### Finding 2 — MINOR | mechanical
**File:** `.agents/scripts/bkit-preflight.ts:613-625`
**Title:** Hard-coded `markeredTextPaths` list in `runPreflight` is incomplete — `claude/hooks/preflight.sh` and cursor markered-text files are absent

The hard-coded list of 8 paths checked for markered-text drift in `runPreflight` is:
```
".github/workflows/ci.yml", ".vale.ini", "AGENTS.md", "CLAUDE.md",
".gitignore", ".prettierignore", ".husky/pre-commit", ".husky/pre-push"
```

The manifest (`bkit-manifest.ts`) also lists these as `markered-text`:
- `.claude/hooks/preflight.sh` (CLAUDE_MANIFEST, line 52)
- `.cursor/hooks/preflight.sh` (CURSOR_MANIFEST, line 60)
- `.cursor/rules/00-shared-rules.mdc` (CURSOR_MANIFEST, line 61)

These three files are `markered-text` in the manifest but are **not** in `markeredTextPaths`. As a result, `bkit check` will never report tier2-text-drift for them, even if a consumer's preflight hook has a stale managed block.

**Exploit scenario:** A consumer upgrades bkit, the bkit block in `.claude/hooks/preflight.sh` changes, but `bkit check` reports no drift. CI passes, but the consumer is running a stale preflight on every Claude session.

**Suggested fix:** Either (a) derive `markeredTextPaths` from the manifest at runtime (`getInstallManifest().filter(e => e.format === "markered-text").map(e => e.path)`) so it self-maintains, or (b) add the three missing paths to the hard-coded list. Option (a) is the architecturally correct fix — it ensures the check set stays in sync with the manifest automatically when new `markered-text` files are added.

---

### Finding 3 — MINOR | mechanical
**File:** `.agents/scripts/bkit-modules.integration.test.ts:1042-1072`
**Title:** Two `describe.skip` blocks leave the uninstall consumer-key-survival path untested despite the implementation being complete

The tests for `bkit uninstall --claude consumer-key survival` and `bkit uninstall --cursor consumer-key survival` are marked `describe.skip` with a comment "PREREQ: Task 19 reclassification". However, Task 19 (reclassifying `.claude/settings.json` and `.cursor/hooks.json` to `format: "json"` in the manifest) is already **done** in this diff — both files appear with `format: "json"` in `CLAUDE_MANIFEST` and `CURSOR_MANIFEST` in `bkit-manifest.ts`. The prerequisite has been satisfied but the tests remain skipped, meaning the `stripTier2JsonScope` dispatch path for these two JSON files has no active integration test coverage.

**Exploit scenario:** A regression in `stripTier2JsonScope` (e.g., it incorrectly strips consumer-added keys like `hooks.Stop`) would not be caught by CI because the tests are skipped.

**Suggested fix:** Remove the `describe.skip` wrappers and implement the assertions (they are already scaffolded with clear `TODO` comments).

---

### Finding 4 — MINOR | mechanical
**File:** `.agents/scripts/bkit-modules.upgrade.integration.test.ts:325-342`
**Title:** ci.yml Group B drift test is documented as a limitation but the limitation is not asserted — the test accepts both `null` and a valid result

The test at line 341:
```ts
expect(result === null || result?.id === "tier2-text-drift").toBe(true);
```
This is an always-true assertion for the common case — it passes whether drift is detected or not. The comment correctly documents that indented markers (6-space indent) are not supported by the line-anchored marker parser. The test correctly captures the boundary, but it means the test provides zero regression protection: any future change that breaks detection of the indented-marker case will still pass.

**Exploit scenario:** If someone adds indented-marker support and it is broken (returns null instead of a finding), the test will still pass.

**Suggested fix:** Split into two explicit assertions: `expect(result).toBeNull()` to document the current limit, with a comment "when indented-marker support is added, change this to `expect(result?.id).toBe('tier2-text-drift')`". This makes the limitation's resolution testable.

---

### Finding 5 — MINOR | architectural
**File:** `.agents/scripts/bkit-tiers.ts:331-346`
**Title:** `_detectSchemaFlip` only checks first-level keys — deep nested type flips are silently undetected

The `_detectSchemaFlip` helper used by `migrateLegacyBkitEnvelope` performs a **shallow** (first-level) type comparison:
```ts
function _detectSchemaFlip(before, after): boolean {
  for (const key of Object.keys(after)) { … }
}
```
If a schema flip occurs at a nested key (e.g., `hooks.sessionStart` changes from an array to an object), `schemaFlipped` will remain `false` and the migration log message will say "stripped __bkit__ envelope" instead of "schema flip applied". This is a cosmetic issue — the actual merge still runs correctly via `deepMergeJson` which handles type conflicts at any depth. But the `schemaFlipped` flag is used to produce the migration log variant message at call sites in `runClaudeModule` and `runCursorModule`, so consumers will receive misleading log output during upgrade.

**Exploit scenario:** Consumer upgrades from v0.8.x. The `.cursor/hooks.json` has nested type flip (flat array `hooks` → keyed object `hooks`). The log says "stripped __bkit__ envelope" when it should say "schema flip applied". The consumer cannot distinguish a simple envelope strip from a structural migration in the logs. Not a data-loss bug, but an observability gap.

**Suggested fix:** Either make `_detectSchemaFlip` recursive (matching `deepMergeJson` depth), or rename it to `_detectShallowSchemaFlip` and update the JSDoc to document the shallow-only semantics.

---

### Finding 6 — MINOR | mechanical
**File:** `.agents/scripts/bkit-modules.ts:501-519` (runClaudeModule) and `595-620` (runCursorModule)
**Title:** Migration block is gated on `!dryRun` — dry-run does not validate that migration would succeed

The `migrateLegacyBkitEnvelope` call in both `runClaudeModule` and `runCursorModule` is wrapped in:
```ts
if (fs.existsSync(settingsDst) && !dryRun) {
```
This means `bkit check` (which runs with `dryRun=true`) will not detect a `__bkit__` envelope that is still on disk after a failed or skipped upgrade. The `detectLegacyBkitEnvelope` advisor in `runPreflight` does fire on `__bkit__` presence, so the gap is partially mitigated at Phase 1. However, Phase 2 (dry-run dispatch) should also simulate the migration to produce an accurate `ws.writes` count.

**Exploit scenario:** A consumer has `.claude/settings.json` with `__bkit__`. Running `bkit check` (dry-run mode) will not include the migration step in its write-set, so the drift report underestimates the number of changes `bkit install` would make. The write-set parity check in the idempotence test may also produce false-match results if it runs dry-run first.

**Suggested fix:** Move the migration logic into a pure function that can be called in both dry and live paths, tracking the would-be migration in `ws` (with `action: "update"`) even during dry-run. The actual file write can still be gated on `!dryRun`.

---

### Finding 7 — MINOR | mechanical
**File:** `.agents/scripts/bkit-preflight.ts:492-503` (`detectPreEnvelopeBkitVersion`)
**Title:** `detectPreEnvelopeBkitVersion` checks only `.claude/settings.json` and `.cursor/hooks.json` for the envelope — a consumer that only has one of these files is misclassified

The blocker reads:
```ts
const jsonFiles = [".claude/settings.json", ".cursor/hooks.json"];
const hasEnvelope = jsonFiles.some(…);
if (hasEnvelope) return null; // consumer already has envelope — not a pre-envelope install
```
If a consumer installed only `--claude` (not `--cursor`), they would have `.claude/settings.json` with `__bkit__` but NOT `.cursor/hooks.json`. The `some()` would return `true` (envelope found in `.claude/settings.json`), correctly bypassing the blocker. Conversely, if a consumer only installed `--cursor`, `.claude/settings.json` would be absent, `.cursor/hooks.json` presence with `__bkit__` would return `true`, also correct. The logic is safe for both partial-module and full installs.

However, the check only tests for envelopes in these two specific paths. If bkit adds a third JSON-format file in a future version, a consumer with `pinnedVersion < 0.8.0` that has no envelope in these two paths but does have it in the new file would incorrectly receive the blocker. This is forward-compat fragility.

**Suggested fix:** Derive the list of JSON-format files from `getInstallManifest().filter(e => e.format === "json").map(e => e.path)` so it tracks the manifest automatically.

---

### Finding 8 — MINOR | mechanical
**File:** `.agents/scripts/bkit-tiers.ts:330` (`_detectSchemaFlip` / `migrateLegacyBkitEnvelope`)
**Title:** `migrateLegacyBkitEnvelope` doc says `schemaFlipped: true when at least one path in the merge changed value type` but the implementation only checks first-level keys in `before` (not `after`)

`_detectSchemaFlip` iterates `Object.keys(after)` not `Object.keys(before)`. This means a key that was *removed* from `before` by the merge (because template didn't have it) is iterated via `after`, but a key that was in `before` and *not* in `after` (deleted by merge) is skipped — `bVal` would be `undefined` for it, but the loop never reaches it because it iterates `after` keys. The result: if `deepMergeJson` *removes* a key from `before` that was not in `after`, the flip is missed. Since `deepMergeJson` never deletes keys (it only adds/replaces), this is not an active data-loss issue. But it is a subtle coupling between `deepMergeJson`'s semantics and `_detectSchemaFlip`'s loop choice that could become a bug if `deepMergeJson` is ever extended to support key deletion.

**Suggested fix:** Document this coupling explicitly in a comment, or iterate `Object.keys(before)` joined with `Object.keys(after)` for completeness.

---

### Finding 9 — MINOR | mechanical
**File:** `.agents/scripts/bkit-modules.integration.test.ts` (Task 23a, line 341)
**Title:** Heavy-customised ci.yml fixture has `NODE_AUTH_TOKEN` inside the bkit marker block — the fixture differs from the canonical ci.yml template which does NOT have `NODE_AUTH_TOKEN`

The canonical template (`.agents/templates/.github/workflows/ci.yml`) has only `GH_BKIT_TOKEN` in the Install Dependencies step. The heavy-customised fixture (`tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`) adds `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}` inside the bkit marker block (confirmed by reading the file). The test at line 318 asserts `expect(fixtureContent).toContain("NODE_AUTH_TOKEN")` — which is correct as a fixture check. But the test comment at line 330-342 admits that `detectTier2TextDrift` cannot detect this drift because the markers are 6-space indented.

This is a documented limitation, not a new finding. However it means that a **real** consumer with a customised Install Dependencies step inside the bkit block will receive no drift advisory from `bkit check`, creating silent divergence between the consumer's CI and bkit's canonical gate config. The test correctly documents this gap but there is no follow-up pending entry or plan to address it.

**Suggested fix:** Add a `docs/pending.md` entry for "indented-marker drift detection for Group B ci.yml" so the gap is tracked. Alternatively, refactor ci.yml to use column-0 markers (restructure the job so the bkit block is at the top level rather than inside a step sequence, accepting that the managed block style changes to match the line-anchored parser).

---

### Summary

No CRITICAL or MAJOR findings. All nine findings are MINOR. The implementation is architecturally sound and the new primitives (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`) are well-tested. The primary concerns are:

1. Hard-coded `markeredTextPaths` list in `runPreflight` is incomplete vs. the manifest (3 markered-text files missing from drift detection).
2. Two uninstall consumer-key-survival tests remain `describe.skip` despite their prerequisite (Task 19 reclassification) being satisfied in this diff.
3. The ci.yml Group B indented-marker drift gap is documented but not tracked in `docs/pending.md`.
