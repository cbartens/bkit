Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS/tenancy.

## Findings Log

### LOW-1 — removeOrphanTemplatesDir has no dogfood/ownership guard (data-loss edge, not attacker-driven)

- Severity: LOW
- Class: mechanical
- Location: `.bkit/src/bkit-install.ts:670-678` (called unconditionally at `:750`)
- Description: `removeOrphanTemplatesDir(cwd, dryRun)` does `fs.rmSync(path.join(cwd, ".agents", "templates"), { recursive: true, force: true })` on every `bkit upgrade` whenever that path exists. The path is built from fixed literals (`.agents`, `templates`) joined to `process.cwd()`, so there is NO path-traversal vector — untrusted input cannot redirect the deletion. The residual concern is purely a data-loss edge: the deletion is unconditional with no dogfood guard and no check that the directory was actually bkit-shipped (vs. a consumer maintaining their own `.agents/templates/`). Mitigating fact: `.agents/templates/` was historically a bkit-owned shipped directory, so a real collision with consumer-authored content is unlikely.
- Reproduction: In any repo with a pre-existing `.agents/templates/` (e.g. an old bkit dev branch checked out, or a consumer who happened to use that path for their own content), run `bkit upgrade`. The directory is removed recursively with `force:true`, no confirmation, no backup.
- Fix suggestion: Gate the removal so it only fires when the directory is recognisably the pre-#160 bkit payload (e.g. presence of a known bkit template basename inside it), or skip when `isDogfood()` is true. Dry-run already logs correctly; the live path is the gap.

### LOW-2 — isDogfood() is dead code in production paths (latent misuse risk)

- Severity: LOW
- Class: architectural
- Location: `.bkit/src/bkit-paths.ts:67-69`
- Description: `isDogfood()` is defined and unit-tested (`bkit-dogfood-noop.integration.test.ts`, `bkit-paths.test.ts`) but is NOT consumed anywhere in production install/upgrade code. The actual dogfood zero-write safety in `runPayload` is enforced by a per-target resolved-path equality check (`path.resolve(srcDir) === path.resolve(dstDir)`, `bkit-install.ts:641`), which is the robust mechanism — so the blast-radius question in the task brief is moot today: even if `isDogfood()` returned a wrong boolean, no production write decision depends on it. The risk is forward-looking: a future change might wire `isDogfood()` (a coarse `getPkgRoot() === process.cwd()` cwd-equality) into a write/delete decision and inherit a weaker guard than the existing src===dst comparison. Note `getPkgRoot()` derives solely from `import.meta.url` with no untrusted input, so `getTemplatesRoot()` path-injection (task item 4) is not feasible.
- Reproduction: Static — `grep -rln isDogfood .bkit/src/*.ts` shows only test files plus the definition; no production consumer.
- Fix suggestion: Either delete `isDogfood()` until a production consumer exists, or document that any future use must defer to the per-path src===dst guard rather than the cwd-equality heuristic (which breaks under symlinked roots, monorepo hoisting, or `cwd` differing from the repo root).

### LOW-3 — Upgrade canonicalHashes .agents/ exclusion is a NEW behavior change (intended, but worth flagging)

- Severity: LOW
- Class: mechanical
- Location: `.bkit/src/bkit-upgrade.ts:370` (`if (relPath.startsWith(".agents" + path.sep)) continue;`)
- Description: This `.agents/`-prefix skip in `updateCanonicalHashesAfterUpgrade` is genuinely NEW vs. `main` (main hashed ALL seedable paths including `.agents/` files; this diff stops recording `.agents/` hashes on upgrade). It is a deliberate consistency fix that mirrors the long-standing install-path filter at `bkit-modules.ts:470`, and `.agents/` runtime files are bkit-internal (not consumer-drift-tracked) by design, so this is not a security regression. The flag: the change means changes to `.agents/` files between versions are not re-hashed on upgrade, so drift detection there relies entirely on the install path having seeded them — verify install and upgrade agree on which `.agents/` entries (if any) remain in `canonicalHashes` so a stale entry from a pre-filter version isn't left orphaned in the manifest. No data exposure; informational.
- Reproduction: `git show main:.agents/scripts/bkit-upgrade.ts` vs current — the `.agents/` continue line is absent in main.
- Fix suggestion: None required if intended. Optional: prune any pre-existing `.agents/*` keys from `canonicalHashes` during upgrade so the manifest does not retain stale, now-unmanaged entries.

## Cleared vectors (no finding)

- Secrets in templates: `.bkit/templates/.agents/.env.example`, `.envrc`, `.mcp.json` use empty placeholders and `${GH_TOKEN}` env-refs only; full-tree regex scan for gh\*/sk-/lin*api*/AKIA/PEM found nothing.
- Tarball hygiene (`files[]`): `npm pack --dry-run --json` confirms 0 `*.test.ts`, 0 `*.integration.test.ts`, 0 `__snapshots__`, 0 `.env`/`.npmrc`/`.pem`/`.key` in the published payload; `.bkit/templates` ships 56 files, old `.agents/scripts/*` location fully gone.
- `.agents/.bkit-version` ships but contains only SHA-256 hashes + version pins (no secrets/PII) and was already shipped in `main` (pre-existing, `.agents` always in `files[]`).
- No npm `postinstall`/`preinstall` lifecycle hooks; `prepare: husky` is a dev-only devDependency, no consumer RCE on install. Shipped `.sh` hooks contain no curl|sh / eval / remote-fetch patterns.
- `check:dist` gate (`rm -rf dist && tsc && git diff --exit-code dist/`, package.json:39, run at ci.yml:86) properly fails CI on stale compiled output; dist verified to already encode the new `.bkit/templates` literal.
- `getTemplatesRoot()` / `getPkgRoot()` derive purely from `import.meta.url` literals — no untrusted input reaches the resolved path; `guardTemplatesRoot` fails loud on a missing root.
