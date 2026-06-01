<!-- verdict:start -->

Verdict: CONCERNS
Findings: 6 (CRITICAL: 0, HIGH: 0, MEDIUM: 2, LOW: 4)

<!-- verdict:end -->

# Build Challenge — Reconciled

FID: `160-centralise-install-code`

Reconciled from two challenge reports (both verdict CONCERNS, 0 CRITICAL):

- `build-challenge-1.md` — Lens: Bugs and edge cases (5 findings: MEDIUM x2, LOW x3)
- `build-challenge-2.md` — Lens: Security (3 findings: LOW x3)

Severity ladder: `CRITICAL > HIGH > MEDIUM > LOW`. Merged findings adopt max-wins severity unless a `## Justification` block downgrades. Both inputs reached CONCERNS; max-wins verdict = CONCERNS.

---

## F1 — removeOrphanTemplatesDir unconditionally deletes consumer `.agents/templates/`

- **Canonical severity:** MEDIUM (max-wins)
- **Class:** architectural
- **file:line:** `.bkit/src/bkit-install.ts:670-678` (wired into `upgrade` only, at `:750`)
- **agreement:** 2/2 (both lenses)

**Description (verified):** `removeOrphanTemplatesDir(cwd, dryRun)` does `fs.rmSync(path.join(cwd, ".agents", "templates"), { recursive: true, force: true })` on every `bkit upgrade`, guarded only by `fs.existsSync(orphanDir)` — no ownership/marker/manifest check. Confirmed verbatim at lines 670-678 and wired only into the `upgrade` verb at line 750 (NOT `install`). The dry-run branch logs only; the live branch deletes with `force: true` and a single-line log.

**Exploit / data-loss scenario:** Pre-#160, `.agents/templates/` was the bkit-owned SOURCE location read FROM inside the package, so a normal tarball consumer never had it in their own tree — realistic blast radius is small. The residual edge: any consumer who maintains their own unrelated `.agents/templates/` (own templating convention under the agents namespace), or who checks out an old bkit dev branch, has that directory silently and irreversibly deleted on next `bkit upgrade`. No path-traversal vector (path built from fixed literals joined to `process.cwd()` — Agent 2 confirmed). Secondary asymmetry: cleanup runs only on `upgrade`, never `install`, so a consumer who bumps the package and runs `bkit install` keeps the orphan (per #160 task item 6, by design).

**Both agents' takes:**

- Agent 1 (bugs lens): MEDIUM / architectural — flags both the unguarded destructive delete and the install-vs-upgrade asymmetry; asks for a bkit-origin sentinel/marker gate or scoped rm, plus an auditable content log.
- Agent 2 (security lens): LOW / mechanical — confirms no path-traversal vector (fixed literals, no untrusted input); frames it purely as a data-loss edge with low collision likelihood; suggests gating on a known bkit template basename or skipping when `isDogfood()` is true.

**Canonical ruling:** Adopt MEDIUM (max-wins). No downgrade — Agent 2's "no attacker vector" narrows the _threat model_ but does not eliminate the data-loss risk Agent 1 raised; the destructive unguarded `rmSync` stands on its own merit. Suggested fix: gate the delete on evidence the directory is bkit-origin (known bkit template basename / sentinel), or scope the rm to bkit-known subpaths; at minimum log the paths/count being removed so the action is auditable.

---

## F2 — `.agents/README.md` ships stale install/template paths to consumers

- **Canonical severity:** MEDIUM
- **Class:** mechanical
- **file:line:** `.agents/README.md:55,144,145,176-199,207,209,210,299,300`
- **agreement:** 1/2 (bugs lens only — single-lens finding, not outvoted)

**Description (verified):** `.agents/README.md` ships to consumers — confirmed via `npm pack --dry-run` (`"path": ".agents/README.md"`, 24.4kB in payload). #160 moved the engine to `.bkit/src/` and templates to `.bkit/templates/`, but the README still references the OLD layout:

- `pnpm tsx .agents/scripts/bkit-install.ts install` / `check` (lines 144-145) — verified present.
- Names `.agents/scripts/bkit-install.ts` as the install script (lines 55, 300) — verified present; the file no longer exists (`ls` errors), only `.bkit/src/bkit-install.ts` exists.
- Snapshot-regen command `pnpm vitest run .agents/scripts/bkit-templates.content.test.ts -u` (line 210) — verified present.
- The entire "What install writes" table maps every managed file to `.agents/templates/...` (lines 176-199, 207, 209, 299) — verified present; `.agents/templates/` directory is gone (`.bkit/templates/` exists instead).

**Exploit scenario:** A consumer (or contributor) following the README's dev/regen instructions runs `pnpm tsx .agents/scripts/bkit-install.ts ...` and hits "file not found"; the templates table points every entry at a directory (`.agents/templates/`) that no longer exists in the shipped tree. Documentation rot shipped in the payload.

**Both agents' takes:**

- Agent 1 (bugs lens): MEDIUM / mechanical — full enumeration of stale call-sites; scopes out historical refs (`.agents/friction.md`, CHANGELOG, archival plans) correctly.
- Agent 2 (security lens): not raised (out of security lens scope).

**Canonical ruling:** MEDIUM retained. Single-lens finding is valid, not outvoted — the security lens simply had no reason to inspect README prose. Suggested fix: surgical find/replace across `.agents/README.md` — `.agents/scripts/` -> `.bkit/src/` and `.agents/templates/` -> `.bkit/templates/` at the listed lines. No redesign.

---

## F3 — Upgrade `canonicalHashes` `.agents/` exclusion is a new behavior change

- **Canonical severity:** LOW
- **Class:** mechanical
- **file:line:** `.bkit/src/bkit-upgrade.ts:370` (`if (relPath.startsWith(".agents" + path.sep)) continue;`)
- **agreement:** 2/2 (raised by security lens; explicitly examined and cleared as not-a-bug by bugs lens)

**Description:** The `.agents/`-prefix skip in `updateCanonicalHashesAfterUpgrade` is genuinely NEW vs `main` (main hashed all seedable paths including `.agents/` files; this diff stops recording `.agents/` hashes on upgrade). It is a deliberate consistency fix mirroring the long-standing install-path filter at `bkit-modules.ts:470`. `.agents/` runtime files are bkit-internal and not consumer-drift-tracked by design.

**Scenario / informational flag:** Because `.agents/` files are no longer re-hashed on upgrade, drift detection there relies entirely on the install path having seeded them. Risk: a stale `.agents/*` key from a pre-filter version could be left orphaned in the manifest. No data exposure; informational.

**Both agents' takes:**

- Agent 2 (security lens): LOW / informational — confirms NEW vs main, deems it intended and not a security regression; optional fix to prune pre-existing `.agents/*` keys from `canonicalHashes` on upgrade.
- Agent 1 (bugs lens): listed under "Notes (verified NOT bugs)" — independently confirmed the filter is new in #160, correctly mirrors the install-path filter, uses `path.sep` consistently (no Windows separator bug), and `.agents/.bkit-version` is covered by the prefix.

**Canonical ruling:** LOW (informational). Both lenses agree the behavior is intended/correct; the only residual is the optional manifest-hygiene concern Agent 2 raised. No fix required if intended. Optional: prune pre-existing `.agents/*` keys from `canonicalHashes` during upgrade so the manifest does not retain stale, now-unmanaged entries, and verify install and upgrade agree on which (if any) `.agents/` entries remain hashed.

---

## F4 — `isDogfood()` is dead production code (exported + tested, never called)

- **Canonical severity:** LOW
- **Class:** architectural
- **file:line:** `.bkit/src/bkit-paths.ts:67-69`
- **agreement:** 2/2 (both lenses)

**Description (verified):** `isDogfood()` is exported and covered by unit + integration tests, but `grep` across `.bkit/src/*.ts` (non-test) and `dist/*.js` shows zero production callers — only the definition and its dist mirror. The actual dogfood zero-write safety in `runPayload` relies on the per-target resolved-path equality check (`path.resolve(srcDir) === path.resolve(dstDir)`, `bkit-install.ts:641`), NOT on `isDogfood()`.

**Scenario:** (a) The tested heuristic is not the one that guards writes, so the dogfood-noop integration test asserts a function production never invokes (false confidence). (b) The `getPkgRoot() === process.cwd()` heuristic, if ever wired in, would be a coarser guard than the existing src===dst comparison and could misfire under symlinked roots, monorepo hoisting, or `cwd != repo root` — currently latent because nothing calls it. `getPkgRoot()` derives solely from `import.meta.url` (no untrusted input), so `getTemplatesRoot()` path-injection is not feasible (Agent 2).

**Both agents' takes:**

- Agent 1 (bugs lens): LOW / mechanical — emphasises the false-confidence test gap; asks to either wire `isDogfood()` in as the single source of the dogfood guard or remove the export + tests.
- Agent 2 (security lens): LOW / architectural — emphasises the forward-looking misuse risk; asks to delete it until a production consumer exists, or document that future use must defer to the src===dst guard.

**Canonical ruling:** LOW (both agree on severity). Class reconciled to **architectural** — the substance is a structural mismatch between the tested/enforced guard mechanisms, not a mechanical typo. Suggested fix: pick one canonical mechanism — either wire `isDogfood()` into `runPayload`/dispatch (keeping src===dst as defense-in-depth), or remove the export + its tests and standardise on the path-equality guard.

---

## F5 — doctor verb prints `getTemplatesRoot()` without `guardTemplatesRoot()`

- **Canonical severity:** LOW
- **Class:** mechanical
- **file:line:** `.bkit/src/bkit-install.ts:711`
- **agreement:** 1/2 (bugs lens only — single-lens finding, not outvoted)

**Description (verified):** The `doctor` verb prints `Templates root: ${getTemplatesRoot()}` (line 711 confirmed) but never calls `guardTemplatesRoot()`. On a corrupt/partial package where `.bkit/templates/` is missing, doctor prints a non-existent path as if valid and continues its read-only scan with no signal the package is broken. `guardTemplatesRoot` (bkit-modules.ts:199) is only invoked from `runCoreTemplates` (line 215), which the doctor path does not execute. Diagnostic blind spot, not a crash.

**Both agents' takes:**

- Agent 1 (bugs lens): LOW / mechanical.
- Agent 2 (security lens): not raised (Agent 2 separately confirmed `guardTemplatesRoot` fails loud on a missing root, but did not flag the doctor-path gap).

**Canonical ruling:** LOW retained. Suggested fix: in the doctor branch, surface a "templates root missing" advisory (read-only scan should warn, not fail-loud/exit) rather than printing a path that may not exist.

---

## F6 — `guardTemplatesRoot` only fires in `runCoreTemplates`; other module callsites silent-skip on missing root

- **Canonical severity:** LOW
- **Class:** architectural
- **file:line:** `.bkit/src/bkit-modules.ts:215` (only guard call) vs unguarded `getTemplatesRoot()` callsites at 581, 643, 668, 693, 768, 1248, 1358, 1541, 1759, 1864, 1941
- **agreement:** 1/2 (bugs lens only — single-lens finding, not outvoted)

**Description (verified):** `guardTemplatesRoot` is called exactly once (line 215, inside `runCoreTemplates`). The claude/cursor/lint/git-hooks/renovate/dependabot/ci modules each call `getTemplatesRoot()` (callsites verified at 581, 643, 668, 693, 768, 1248, 1358, 1541, 1759, 1864, 1941) and then rely on per-file `fs.existsSync(specificSrc)` checks — if the templates root is missing, those return false and the module silently installs nothing rather than failing loud.

**Scenario:** Masked in practice because `resolveModules` always injects `core` and `core` dispatches first (MODULE_DISPATCH_ORDER[0]), so the guard fires before any module pass. Residual risk is structural: the fail-loud invariant depends on (a) core always being present and (b) core always running first; if either changes, the other modules degrade to silent no-ops.

**Both agents' takes:**

- Agent 1 (bugs lens): LOW / architectural.
- Agent 2 (security lens): not raised as a finding (Agent 2 noted only that `guardTemplatesRoot` fails loud, without examining the order-coupling).

**Canonical ruling:** LOW retained. Suggested fix: hoist `guardTemplatesRoot(getTemplatesRoot())` to the top of `dispatchModules` so the guard is unconditional and order-independent, rather than implicitly coupled to core running first.

---

## Cleared vectors (no finding — both lenses)

- **Windows path-sep in upgrade filter** (`bkit-upgrade.ts:370` `relPath.startsWith(".agents" + path.sep)`) — both `relPath` (built via `path.join`) and the install-side mirror filter (`path.relative`) yield OS-native separators; filter matches on Windows. (See F3 for the related informational hash-exclusion note.)
- **`package.json` files[] negation patterns** — `npm pack --dry-run --json`: 0 test/integration-test/snapshot files ship; 16 `.bkit/src/*.ts` source files ship (intended, matches pre-#160 behaviour).
- **Secrets in templates** — `.env.example`, `.envrc`, `.mcp.json` use empty placeholders / `${GH_TOKEN}` env-refs only; full-tree regex scan (gh\*/sk-/lin*api*/AKIA/PEM) found nothing.
- **Tarball hygiene** — 0 `*.test.ts`, 0 `*.integration.test.ts`, 0 `__snapshots__`, 0 `.env`/`.npmrc`/`.pem`/`.key` in payload; `.bkit/templates` ships 56 files, old `.agents/scripts/*` location fully gone.
- **`.agents/.bkit-version`** — ships but contains only SHA-256 hashes + version pins (no secrets/PII); already shipped in `main`.
- **No npm lifecycle RCE** — no `postinstall`/`preinstall` hooks; `prepare: husky` dev-only; shipped `.sh` hooks contain no curl|sh / eval / remote-fetch.
- **`check:dist` gate** — `rm -rf dist && tsc && git diff --exit-code dist/` (package.json:39, ci.yml:86) fails CI on stale output; dist verified to encode the new `.bkit/templates` literal.
- **ESM `.js` import extensions** — all relative imports in `.bkit/src/*.ts` use `.js`; `tsc --noEmit` exit 0.
- **`getTemplatesRoot()` / `getPkgRoot()`** — derive purely from `import.meta.url` literals; no untrusted input reaches the resolved path; no path-injection vector.
- **Test suites** — bkit-paths/dogfood/rules-sync/templates-content + modules/install/upgrade/preflight/uninstall all green (345 tests across both reports).

---

<!-- verdict:start -->

Verdict: CONCERNS
Findings: 6 (CRITICAL: 0, HIGH: 0, MEDIUM: 2, LOW: 4)

<!-- verdict:end -->
