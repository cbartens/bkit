Verdict: FAIL
Failures: 6

<!-- verdict:end -->

# Build Challenge Reconciliation — BAR-167

## MAJOR Findings (from challenge-1, verified)

### MAJOR-1 — REAL | CRITICAL | architectural

**File:** `.agents/scripts/bkit-tiers.ts:227-241`
**Title:** `writeTier2JsonContained` silently overwrites malformed consumer JSON with template (data-loss)

Verified: the `try { existing = JSON.parse(dstRaw) } catch { fs.writeFileSync(dstPath, JSON.stringify(template, null, 2) + "\n") }` branch falls through to a full template overwrite. Contrast with `malformed-package-json` blocker in `bkit-preflight.ts` which refuses to mutate. Tier-2 JSON loses that protection.

**Exploit:** Consumer hand-edits `.claude/settings.json` with a typo; husky `prepare` runs `pnpm bkit install`; all consumer keys lost without advisory.

**Fix:** Push an advisory through `ctx.advisories` and abort, OR rename to `dstPath.bkit-malformed-{timestamp}` before writing (mirror `migrateLegacyBkitEnvelope` discipline). Apply to symmetric catches in `bkit-modules.ts:518` / `:619`.

---

### MAJOR-2 — REAL | CRITICAL | mechanical

**File:** `.agents/scripts/bkit-manifest.ts:82`, `.agents/scripts/bkit-modules.ts:1010-1028`
**Title:** `slop-scan.config.json` manifest format `"json"` does not match install behaviour (`writeTier3`) — uninstall deep-strips a file install never wrote as JSON

Verified: manifest declares `{ path: "slop-scan.config.json", format: "json", module: "lint" }` (line 82) while `runLintModule` calls `writeTier3` (seed-or-print byte-equal-text semantics). Uninstall routes to `stripTier2JsonScope` which deletes any leaf byte-equal to template.

**Exploit:** Consumer runs `bkit install --lint` (Tier-3 seed). Consumer keeps default `rules`/`ignores` intentionally. `bkit uninstall --lint` strips every template-equal leaf — silent data loss of deliberately retained config.

**Fix:** Change manifest entry to `format: "byte-equal-text"` (matches install) — surgical and routes uninstall through `shouldDeleteTier3` hash guard.

---

### MAJOR-3 — REAL | CRITICAL | mechanical

**File:** `.agents/scripts/bkit-manifest.ts:69`, `.agents/scripts/bkit-modules.ts:895` (`runCiModule`), `.agents/scripts/bkit-install.ts:378`
**Title:** `ci.yml` manifest format `"markered-text"` does not match install behaviour (`writeTier3`); indented markers fall outside `ALLOWED_PREFIXES`

Verified: `ALLOWED_PREFIXES = ["", "# ", "// "]` excludes the 6-space-indented `# bkit:start` markers in `templates/.github/workflows/ci.yml`. Uninstall `detectMarkerStyle` returns `null` → preserve with misleading reason "no bkit markers found"; `detectTier2TextDrift` never fires for ci.yml.

**Exploit:** Consumer with customised ci.yml gets no upgrade hint; uninstall returns false reason. Install/uninstall/check semantics diverge for the same file.

**Fix:** Reclassify manifest entry to `byte-equal-text` (matches Tier-3 install) AND document indented-marker limitation in `findLineAnchoredMarkers`. Alternative: extend `ALLOWED_PREFIXES` to accept leading whitespace for hash-comment style.

---

### MAJOR-4 — REAL | CRITICAL | mechanical

**File:** `.agents/scripts/bkit-manifest.ts:81`, `.agents/scripts/bkit-modules.ts:974-991`
**Title:** `.vale.ini` manifest format `"markered-text"` does not match install behaviour (`writeTier3`)

Verified: same shape as MAJOR-3 — manifest declares `markered-text` while `runLintModule` installs via `writeTier3` (whole-file seed-or-print). No marker-block discipline at install time; uninstall block-strip is correct only by coincidence.

**Exploit:** Consumer who edits inside the seeded marker block expecting Tier-2 update semantics loses their edits on uninstall.

**Fix:** Switch manifest to `byte-equal-text`; document Group B install-seed-or-skip semantics.

---

### MAJOR-5 — REAL | HIGH | mechanical

**File:** `CHANGELOG.md:9-35` (2.0.0 entry)
**Title:** CHANGELOG 2.0.0 entry under-represents breaking changes (markers added to 12 Group A + 3 Group B templates; dispatch shift)

Verified: CHANGELOG entry covers envelope removal, API deletions, deep-containment ownership model, new helpers/blockers/advisories — but does NOT list the new `bkit:start/bkit:end` markers added to AGENTS.md, CLAUDE.md, `.agents/rules.md`, `.agents/docs.md`, etc., nor the Tier-1→Tier-2 dispatch shift for the three markered-text files, nor the new `lint:no-tier-terms` script.

**Exploit:** Consumer reading CHANGELOG before bumping has no signal that customisation semantics changed for these files.

**Fix:** Append "Changed"/"Added" sub-bullets listing marker additions and dispatch shifts.

Note: MAJOR-5 is mechanical (documentation completeness) — promoting to HIGH-not-CRITICAL because it does not break runtime behaviour but does mislead consumers during upgrade.

---

### MAJOR-6 — REAL | HIGH | mechanical

**File:** `.agents/scripts/bkit-preflight.ts:65-69` (`stripBkitBlock`)
**Title:** Greedy whitespace regex marker stripping (KN-8 lesson violation)

Verified: implementation uses `/<!--\s*bkit:start\s*-->[\s\S]*?<!--\s*bkit:end\s*-->/g` and `/#\s*bkit:start[\s\S]*?#\s*bkit:end/g` — exactly the unsafe greedy pattern KN-8 documents. Reintroduces the pattern that `findLineAnchoredMarkers` was created to replace.

**Exploit:** Consumer prose in CLAUDE.md that mentions `# bkit:start` literally without matching `# bkit:end` causes the regex to eat unrelated content; downstream advisory detectors (`detectHuskyBlockDuplicates`, `detectGitignoreBlockDuplicates`, `detectPrettierignoreScopeNarrowing`) see truncated "consumer content" and may silently skip findings.

**Fix:** Replace with line-anchored implementation using `findLineAnchoredMarkers`, OR call `stripManagedBlock` from `bkit-tiers.ts:363-399` (already KN-8-correct).

Severity note: lower than KN-8 original because call sites are advisory-only (not write-mutating), but still a regression of the KN-8 fix surface — HIGH.

---

## MINOR Findings (merged from both reviews, accepted at face value)

### MINOR-1 — REAL | architectural

**File:** `.agents/scripts/bkit-tiers.ts:118-126` (`_deepContainsArray`)
`deepContains` array-of-primitives uses `includes()` — set-subset, not multiset-subset semantics. Docstring claim is imprecise. (challenge-1 MINOR-1)
**Fix:** Update docstring to clarify "set-subset, not multiset-subset" or implement multiset check.

### MINOR-2 — REAL | architectural

**File:** `.agents/scripts/bkit-uninstall.ts:152-158` (`stripTier2JsonScope`)
Leaf equality uses `JSON.stringify(cVal) === JSON.stringify(tVal)` — sensitive to key order; over-preserves on editor-reformatted JSON. Benign over-preservation, not data loss. (challenge-1 MINOR-2)
**Fix:** Replace with structural deep-equal.

### MINOR-3 — REAL | architectural (challenge-1 MINOR-3 + challenge-2 Finding 5 + Finding 8, merged)

**File:** `.agents/scripts/bkit-tiers.ts:331-346` (`_detectSchemaFlip`)
Only iterates `Object.keys(after)` (Finding 8) and only walks first level (challenge-1 MINOR-3 / Finding 5). Deeper schema flips silently misclassified; log message reads "stripped **bkit** envelope" when "schema flip applied" is correct. Observability gap, not data loss. Both reviewers concur.
**Fix:** Recurse `_detectSchemaFlip` OR rename to `_detectShallowSchemaFlip` and document; iterate `Object.keys(before) ∪ Object.keys(after)`.

### MINOR-4 — REAL | architectural (challenge-1 MINOR-4 + challenge-2 Finding 7, merged)

**File:** `.agents/scripts/bkit-preflight.ts:491-503` (`detectPreEnvelopeBkitVersion`)
Hard-coded `[".claude/settings.json", ".cursor/hooks.json"]` envelope-presence check is forward-compat fragile and may misclassify partial-install consumers from envelope-era versions. Both reviewers concur.
**Fix:** Derive list from `getInstallManifest().filter(e => e.format === "json")`.

### MINOR-5 — REAL | mechanical

**File:** `.agents/scripts/lint-no-tier-terms.ts:70-73`
`SCAN_DIRS` only includes `docs/` — `.agents/README.md`, `CHANGELOG.md`, root README excluded; tier terminology can leak into consumer-shipped tarball. (challenge-1 MINOR-5)
**Fix:** Add `.agents` and root `*.md` (with CHANGELOG history exclusion) or document the policy in script header.

### MINOR-6 — DEFER | architectural

**File:** `.agents/scripts/bkit-tiers.ts:250-257`
Idempotent guard analysis — challenge-1 self-classifies as "no bug, audit traceability". (challenge-1 MINOR-6)
**Fix:** None required.

### MINOR-7 — REAL | mechanical (challenge-2 Finding 1)

**File:** `.agents/scripts/bkit-preflight.ts:402`
`detectTier2JsonDrift` call site lacks named-argument comments — latent swap-risk if refactored.
**Fix:** Add `/* template */` and `/* consumer */` inline comments at the call site.

### MINOR-8 — REAL | mechanical (challenge-2 Finding 2)

**File:** `.agents/scripts/bkit-preflight.ts:613-625`
Hard-coded `markeredTextPaths` list missing `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.cursor/rules/00-shared-rules.mdc` — these three are `markered-text` in the manifest but never receive drift detection.
**Fix:** Derive from manifest at runtime: `getInstallManifest().filter(e => e.format === "markered-text").map(e => e.path)`.

### MINOR-9 — REAL | mechanical (challenge-2 Finding 3)

**File:** `.agents/scripts/bkit-modules.integration.test.ts:1042-1072`
Two `describe.skip` blocks for `bkit uninstall --claude/--cursor consumer-key survival` cite "PREREQ: Task 19 reclassification" — but Task 19 is already complete in this diff (both files declared `format: "json"`). The `stripTier2JsonScope` dispatch path lacks active integration coverage.
**Fix:** Remove `describe.skip` and activate the scaffolded assertions.

### MINOR-10 — REAL | mechanical (challenge-2 Finding 4)

**File:** `.agents/scripts/bkit-modules.upgrade.integration.test.ts:325-342`
`expect(result === null || result?.id === "tier2-text-drift").toBe(true)` is an always-true assertion for the ci.yml indented-marker limitation — zero regression protection if the gap closes.
**Fix:** Split into `expect(result).toBeNull()` with a TODO comment explaining the future flip.

### MINOR-11 — REAL | mechanical (challenge-2 Finding 6)

**File:** `.agents/scripts/bkit-modules.ts:501-519`, `:595-620`
`migrateLegacyBkitEnvelope` gated on `!dryRun` — `bkit check` (dry-run) does not include the migration in its write-set count; idempotence-parity tests may produce false matches.
**Fix:** Move migration into a pure function callable in both paths; track would-be write in `ws.writes` with `action: "update"` even when dry-run.

### MINOR-12 — DEFER | mechanical (challenge-2 Finding 9)

**File:** `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`
Heavy-customised fixture has `NODE_AUTH_TOKEN` inside the bkit marker block, illustrating the indented-marker drift gap. Documented in the test but not tracked in `docs/pending.md`.
**Fix:** Add a `docs/pending.md` entry tracking the indented-marker drift gap. Subsumed by MAJOR-3 fix scope.

---

## Summary

<!-- prettier-ignore -->
| Category | Count |
| --- | --- |
| MAJOR (CRITICAL severity, real) | 4 (MAJOR-1, MAJOR-2, MAJOR-3, MAJOR-4) |
| MAJOR (HIGH severity, real) | 2 (MAJOR-5, MAJOR-6) |
| MAJOR false-positive | 0 |
| MINOR real | 10 (MINOR-1, 2, 3, 4, 5, 7, 8, 9, 10, 11) |
| MINOR deferred | 2 (MINOR-6, MINOR-12) |

All six MAJOR findings from challenge-1 were verified REAL via targeted greps. Challenge-2's nine MINOR findings merged into the MINOR set (Findings 5 and 8 collapsed into MINOR-3 with challenge-1 MINOR-3; Finding 7 collapsed into MINOR-4 with challenge-1 MINOR-4).

`Failures` count = 6 (six MAJOR findings; four CRITICAL + two HIGH all real).

## Recommendation

**REMEDIATE.** Four CRITICAL findings (MAJOR-1 through MAJOR-4) represent install/uninstall data-loss vectors and manifest/install dispatch mismatches that must be fixed before v2.0.0 ships. MAJOR-5 (CHANGELOG completeness) and MAJOR-6 (KN-8 regression) are HIGH and should be fixed in the same cycle. MINORs may be batched into a follow-up unless trivial to fold in.
