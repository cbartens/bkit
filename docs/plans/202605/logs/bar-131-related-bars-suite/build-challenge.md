<!-- verdict:start -->

Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Build Challenge

Partial diff coverage (15236 lines > 10000 guard). Focused on integration boundaries, bkit-modules.ts, bkit-version.ts, bkit-upgrade.ts, bkit-install.ts.

## Findings

### C1 — Raw `.bkit-version` read in migration path (CONCERN)

**File:** `.agents/scripts/bkit-modules.ts:423`

```typescript
const onDiskVersion = fs.readFileSync(versionFile, "utf-8").trim();
migrateTier1JsonToTier2(settingsDst, ".claude/settings.json", onDiskVersion);
```

`.bkit-version` is now JSON format (introduced in P2/v0.7.x). Reading with `.trim()` yields the full JSON string (e.g. `{"pinnedVersion":"0.7.0","tier3Hashes":{},...}`), not the semver string `"0.7.0"`. `migrateTier1JsonToTier2` uses this as a version for `semverLte` comparison — `semverLte` returns false for a JSON string, causing migration to silently skip.

**Impact:** Consumers upgrading from v0.7.x state (JSON .bkit-version) to v0.8.x will silently skip the Tier-1 → Tier-2 migration for `.claude/settings.json`. Not data-loss, but the idempotent migration guarantee is broken for this upgrade path.

**Fix:** `readBkitVersion(versionFile).pinnedVersion` instead of `fs.readFileSync(...).trim()`.

---

### C2 — Misleading `isConsumerModified` doc comment (CONCERN)

**File:** `.agents/scripts/bkit-version.ts:157,161-162`

Doc block says: `"unknown → conservative: treat as modified"` but the function returns `false` for unknown paths (line 174: `if (!recorded) return false`). Lines 161-162 contradict the main doc block ("conservative no-overwrite default") while the inline comment at upgrade line 108 is accurate ("no canonical hash → treat as update").

**Impact:** Misleading docs could cause future maintainers to misunderstand the upgrade behavior. No runtime impact — inline comments at call sites are correct.

**Fix:** Rewrite doc block: "unknown → no hash recorded → returns false (treat as unmodified, update proceeds if template changed)".

---

### C3 — `canonicalHashes` never populated by `bkit install` (CONCERN)

**Files:** `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`

`writeBkitVersion` is only called in `bkit-upgrade.ts:247`. `bkit install` never records `canonicalHashes` — meaning on any fresh install, `.bkit-version` has `canonicalHashes: {}`. On subsequent `bkit upgrade`, `isConsumerModified` always returns `false` for all paths (no recorded hashes), so the upgrade engine falls through to the "update" path if the template changed.

**Impact:** Drift detection for consumer edits to the `__bkit__` block is ineffective until after the first upgrade pass. However, master success criterion (a) — consumer keys outside `__bkit__` survive — is still guaranteed by `writeTier2Json` deep-merge semantics, which preserves non-`__bkit__` keys unconditionally. The only scenario where this matters is a consumer who manually edits the `__bkit__` block itself (unsupported usage).

**Not FAIL because:** Consumer key survival is preserved by deep-merge, not canonical hash comparison. The canonical hash feature adds a second layer of protection that is incomplete but non-critical for the stated success criteria.

---

## No Critical Issues Found

No path traversal, injection, or data-loss bugs. The three findings above are non-blocking concerns. All master plan success criteria (a), (b), (c) are enforced by the codebase:

- (a) Consumer keys survive upgrades: guaranteed by `writeTier2Json` deep-merge
- (b) `bkit install` exits 1 + recovery command on Phase 3 blocker: enforced in `bkit-install.ts`
- (c) `bkit uninstall` round-trip leaves files byte-identical: enforced by `bkit-uninstall.ts` + manifest
