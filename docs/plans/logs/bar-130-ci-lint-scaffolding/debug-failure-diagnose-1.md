Verdict: PASS

<!-- verdict:end -->

# Debug Failure Diagnosis

## CI Run

[`Run #25354307730`](https://github.com/cbartens/bkit/actions/runs/25354307730) — `bkit-gates` job, `Setup pnpm` step, exit code non-zero from `pnpm/action-setup@v4` self-installer.

## Prior Attempts Reviewed

N/A — first debug attempt for this failure (DEBUG_ATTEMPT=0, TEST_ATTEMPT=1). No `debug-failure-diagnose-*.md` or `debug-failure-remediate-*.md` artifacts exist for FID `bar-130-ci-lint-scaffolding`. Strategy: STANDARD (targeted diagnosis).

## Failures

Single hard failure, action-level (not code-level), in the post-merge `dev` CI run on commit `8646711`:

| Job          | Step         | Action                 | Outcome                                                                 |
| ------------ | ------------ | ---------------------- | ----------------------------------------------------------------------- |
| `bkit-gates` | `Setup pnpm` | `pnpm/action-setup@v4` | Self-installer aborts with `Error: Multiple versions of pnpm specified` |

Verbatim error:

```
Error: Multiple versions of pnpm specified:
  - version 10 in the GitHub Action config with the key "version"
  - version pnpm@10.33.0 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
```

Relationship: every downstream step in `bkit-gates` (Setup Node, Install, Typecheck, Test, Format Check, Vale, Prose Lint, Slop Scan, bkit Self-Test) is unreachable until pnpm is installed — they are not separate failures, they are a single blast-radius from the action-level abort. Local `pnpm install --frozen-lockfile` was not run from this agent (no shell access in this leaf), but the failure mode is independent of the lockfile: `pnpm/action-setup@v4` reads BOTH `with: version:` AND `package.json#packageManager` and refuses to start when both are present and not literally identical, so local repro on a developer machine via `act` would reproduce only if `act` is invoked against the same workflow step.

## Root Cause

**Proximate cause — dual pnpm version source-of-truth in `.github/workflows/ci.yml`.**

The bkit-self CI workflow declares pnpm version both ways simultaneously:

1. `.github/workflows/ci.yml` lines 29–32 (the `Setup pnpm` step):

   ```yaml
   - name: Setup pnpm
     uses: pnpm/action-setup@v4
     with:
       version: 10
   ```

2. `package.json` line 18:

   ```json
   "packageManager": "pnpm@10.33.0",
   ```

`pnpm/action-setup@v4` was changed (vs. v2/v3) to validate that at most ONE of `with.version` / `package.json#packageManager` / `pnpm-workspace.yaml` declares a pnpm version. When more than one is present and they are not byte-identical, the self-installer aborts with `Multiple versions of pnpm specified`. Here `version: 10` (loose major) and `pnpm@10.33.0` (strict) are not identical strings, so the action errors out before any install runs.

**Why this only fired now (post-merge dev, not the PR run):** PR #1 was the first run that introduced both declarations on the same head. The workflow runs on `push: branches: [main, dev]` and `pull_request: branches: [main, dev]`. The PR check ran against the merge ref and presumably passed (per ship-summary). The post-merge `push` to `dev` is the first time the new `ci.yml` ran on the post-squash tree. There's no flake or env factor — it's a deterministic action-config defect that fires every time.

**Design fragility — three issues compound:**

1. **Dual SoT.** The workflow author hand-typed `version: 10` in `ci.yml` and the `packageManager` field was bumped to `pnpm@10.33.0` independently (likely by Corepack / `pnpm install`). There was no plan-level rule "ci.yml MUST NOT carry `with.version:` when `packageManager` is set", so the two stayed un-reconciled.
2. **Loose vs. strict pin asymmetry.** `version: 10` accepts any `10.x.y`; `packageManager: pnpm@10.33.0` is exact. Even ignoring the action's hard error, this would let consumer/contributor environments diverge from CI on patch releases. `packageManager` is the established Corepack-aware single-line strict pin and is what `pnpm/action-setup@v4` documents as the preferred SoT.
3. **Template parity drift risk.** The same defect almost certainly exists in the consumer-distributed template at `.agents/templates/.github/workflows/ci.yml` (verified — see below), which means consumers who run `bkit install --ci` inherit a broken workflow. This is a second-order regression: shipping the fix only in `bkit`'s self workflow leaves consumer installs broken.

**Template parity check (verified):** `.agents/templates/.github/workflows/ci.yml` lines 18–20:

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: { { PNPM_VERSION } }
```

Combined with `.agents/scripts/bkit-tokens.ts` `resolvePnpmVersion()` (lines 56–68), which extracts the major from the consumer's own `package.json#packageManager` (e.g. `pnpm@10.4.1` → `"10"`), this template will reproduce the EXACT same defect on any consumer that has both:

- a non-empty `packageManager` field in their `package.json` (which `bkit install --ci` does NOT remove), AND
- the rendered `version: {{PNPM_VERSION}}` in their installed `ci.yml`.

In other words: every consumer using Corepack (the recommended setup) will hit `Error: Multiple versions of pnpm specified` on first CI run after `bkit install --ci`. This is a critical post-ship defect for the whole BAR-130 ci/template module, not just bkit-self.

**Token resolution side-effect:** With the recommended fix (drop `with.version:` from both ci.yml files), the `{{PNPM_VERSION}}` token has no remaining substitution sites. The `resolvePnpmVersion` helper, the warn-on-non-pnpm logic (MED-2), and four tests in `bkit-tokens.test.ts` all become dead code if the token is retired. Two viable paths:

- **(A) Retire the token** — drop `PNPM_VERSION` from `TokenMap`, drop `resolvePnpmVersion`, drop the four `PNPM_VERSION` tests, drop the three `MED-2` warn tests. Cleaner but slightly larger diff; touches a public-ish interface (`TokenMap`).
- **(B) Keep the token** for now (stable interface, still resolved on every install, just unused in the only template that referenced it). Add a comment in `bkit-tokens.ts` and the consumer template that `{{PNPM_VERSION}}` is no longer wired into ci.yml; revisit in v0.2.

Recommendation: **(B) keep the token, retire the wiring.** Rationale: this is a single-defect post-ship hotfix, and `TokenMap` is consumed by `applyTokens` which is part of bkit's installer surface. Retiring the field is a wider blast radius than the bug warrants. Document in a code comment + `docs/pending.md` follow-up. (See "Out of scope" for the cleanup ticket.)

**Contributing factors — process gaps to flag, not to fix here:**

- Plan/build/scope-check phases did not enumerate the rule "exactly one pnpm SoT in any workflow that uses `pnpm/action-setup@v4`." This rule belongs in `docs/knowledge.md` as `KN-3` so future scaffolding work catches it pre-merge.
- The PR's own CI passed against the merge ref — meaning either (i) the PR ran an older ci.yml from `dev` rather than the workflow added in PR #1, or (ii) some race let it pass. Worth a separate audit but out-of-scope for this hotfix.

## Recommended Fix

Drop the `with.version:` clause from both ci.yml files. Keep `package.json#packageManager` as the single source of truth (Corepack / `pnpm/action-setup@v4` will read it automatically). Two file edits, one knowledge entry, one pending entry.

### Edit 1 — `.github/workflows/ci.yml` (bkit-self), lines 29–32

Current (lines 29–32):

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10
```

Replace with:

```yaml
- name: Setup pnpm
  # Pnpm version is resolved from package.json#packageManager (single SoT).
  # Do NOT add `with: version:` here — pnpm/action-setup@v4 errors when both are set.
  uses: pnpm/action-setup@v4
```

Note: an action call with no `with:` block is valid YAML; the action falls back to `package.json#packageManager`. If the YAML linter requires a non-empty `with:` block (it does not for `pnpm/action-setup@v4`), drop the whole `with:` line as well.

### Edit 2 — `.agents/templates/.github/workflows/ci.yml`, lines 18–20

Current (lines 18–20):

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: { { PNPM_VERSION } }
```

Replace with:

```yaml
# Pnpm version is resolved from the consumer's package.json#packageManager (single SoT).
# Do NOT add `with: version:` here — pnpm/action-setup@v4 errors when both are set.
- uses: pnpm/action-setup@v4
```

The `{{PNPM_VERSION}}` token reference is removed at the only place it was substituted. Token resolution itself stays in `bkit-tokens.ts` for backwards compatibility (see Edit 3 note).

### Edit 3 — `.agents/scripts/bkit-tokens.ts` (NON-BLOCKING annotation only)

Above `resolvePnpmVersion` (line ~56), add a one-line comment:

```ts
// NOTE: As of the BAR-130 hotfix, ci.yml templates no longer reference {{PNPM_VERSION}}.
// pnpm/action-setup@v4 reads package.json#packageManager directly (single SoT).
// Token kept for stable interface; retire in v0.2 — see docs/pending.md.
```

Do NOT delete the function or change the `TokenMap` interface in this hotfix — keep the surface stable.

### Edit 4 — `docs/knowledge.md` — append `KN-3`

```markdown
## KN-3: pnpm/action-setup@v4 errors when `with.version:` AND `package.json#packageManager` both set (2026-05-05)

- **Category:** infra
- **Symptom:** GitHub Actions step fails immediately with `Error: Multiple versions of pnpm specified: - version X in the GitHub Action config with the key "version" - version pnpm@X.Y.Z in the package.json with the key "packageManager"`. No pnpm install runs; all downstream steps in the job become unreachable.
- **Root cause:** pnpm/action-setup@v4 enforces single-SoT for pnpm version. If both `with.version:` (workflow YAML) and `package.json#packageManager` are present, it aborts unless they are byte-identical. Loose major (`10`) vs. strict pin (`pnpm@10.33.0`) is not identical.
- **Fix or rule:** Pick ONE source. Recommended: drop `with.version:` from the workflow and let `packageManager` be the single SoT — Corepack-aware, exact pin, already required by pnpm install on the developer machine.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, `.github/workflows/ci.yml`, `.agents/templates/.github/workflows/ci.yml`, run 25354307730
```

### Edit 5 — `docs/pending.md` — append v0.2 cleanup ticket

```markdown
## v0.2: Retire `{{PNPM_VERSION}}` token (2026-05-05)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** After the BAR-130 ci hotfix, `{{PNPM_VERSION}}` is no longer substituted into any template (ci.yml templates removed `with.version:` in favour of `package.json#packageManager` as single SoT). `resolvePnpmVersion`, the field on `TokenMap`, and 4 tests in `bkit-tokens.test.ts` (+3 MED-2 warn tests) are dead code. Retire in v0.2 alongside the `init`/`--host=` deprecation removals.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200, KN-3, `.agents/scripts/bkit-tokens.ts`, `.agents/scripts/bkit-tokens.test.ts`
```

## Suggested Tests

No new vitest cases are strictly required for the hotfix to be correct (the failure is action-config, not script logic). But two low-cost regression guards would prevent recurrence and are recommended:

1. **`.agents/scripts/bkit-tokens.test.ts` — keep existing `PNPM_VERSION` tests as-is.** They still assert `resolvePnpmVersion` semantics; they do not assert that the token is wired into any template, so they remain green after Edit 2. No update needed.

2. **NEW (recommended) — `.agents/scripts/bkit-modules.test.ts` (or wherever `runCiModule` is tested) — single regression test:**

   ```ts
   it("ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3)", () => {
     const tplPath = path.join(PKG_ROOT, ".agents/templates/.github/workflows/ci.yml");
     const tpl = fs.readFileSync(tplPath, "utf-8");
     // pnpm/action-setup@v4 errors if `with.version:` is set when consumer
     // also has package.json#packageManager. Template MUST NOT set `version:`.
     expect(tpl).not.toMatch(/pnpm\/action-setup@v4[\s\S]{0,100}with:[\s\S]{0,50}version:/);
   });
   ```

3. **NEW (recommended) — same file — assert bkit's own ci.yml is also clean:**

   ```ts
   it("bkit's own .github/workflows/ci.yml does NOT set `with.version:` for pnpm action (KN-3)", () => {
     const ciPath = path.join(PKG_ROOT, ".github/workflows/ci.yml");
     const ci = fs.readFileSync(ciPath, "utf-8");
     expect(ci).not.toMatch(/pnpm\/action-setup@v4[\s\S]{0,100}with:[\s\S]{0,50}version:/);
   });
   ```

Both regressions are pure file-content asserts; no fixtures, no module-loading. They guarantee that any future "helpful" edit re-adding `version: X` to either ci.yml fails CI before it can ship.

**Tests that need updating after Edit 1/2:** none. Existing token tests stay green; no test currently asserts the literal string `version: 10` or `version: {{PNPM_VERSION}}` exists in either ci.yml.

## Verification Commands

Run from the worktree root `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding`:

```bash
cd "$(git rev-parse --show-toplevel)/.worktrees/bar-130-ci-lint-scaffolding"
pwd

# 1. Static guard — neither ci.yml may set `with.version:` for pnpm action.
#    Both greps must return non-zero (no match) after the fix.
grep -nE 'pnpm/action-setup@v4' .github/workflows/ci.yml
grep -nE 'pnpm/action-setup@v4' .agents/templates/.github/workflows/ci.yml
! grep -nA3 'pnpm/action-setup@v4' .github/workflows/ci.yml | grep -E '^\s*version:'
! grep -nA3 'pnpm/action-setup@v4' .agents/templates/.github/workflows/ci.yml | grep -E '^\s*version:'

# 2. YAML well-formedness.
pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null
pnpm dlx js-yaml .agents/templates/.github/workflows/ci.yml > /dev/null

# 3. Local pre-PR gates (matches the workflow steps that previously could not run).
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm format:check
pnpm lint:slop

# 4. bkit self-test — install dry-run from worktree root must complete cleanly
#    (template substitution path that previously rendered `version: 10` is now empty).
pnpm tsx .agents/scripts/bkit-install.ts check || true

# 5. After push, observe the next CI run on the fix branch's PR. The `Setup pnpm`
#    step log should now show `with: {}` (or no `with:` block) and the self-installer
#    log should report `Using pnpm version pnpm@10.33.0 from package.json` rather than
#    aborting.
gh run list --branch fix/bar-130-ci-pnpm --limit 3
gh run view <RUN_ID> --log | grep -E 'Setup pnpm|Multiple versions|Using pnpm'
```

**Pass criteria:**

- Steps 1–4 all exit 0 locally.
- Step 5 (post-push) shows `Setup pnpm` succeeding and `Install Dependencies` proceeding to `pnpm install --frozen-lockfile` without error.
- The `bkit-gates` job runs to completion (or fails ONLY on a different downstream step — which would be a separate diagnosis, not a regression of this fix).

## Out of scope

Items spotted during diagnosis but outside the single-defect hotfix. Do NOT bundle into the fix PR.

1. **Audit how PR #1 passed CI despite this defect.** PR #1 ran the workflow against the merge ref but the post-merge `dev` push failed deterministically. Either the PR check ran an older `ci.yml` from `dev` (pre-BAR-130 state) or there's a path through `pnpm/action-setup@v4` that succeeded transiently. Either way, the gate did not catch a defect that is 100% reproducible on `dev`. File a separate ticket once this hotfix lands.
2. **Retire `{{PNPM_VERSION}}` token + `resolvePnpmVersion`.** Captured in the new pending entry (Edit 5). v0.2 cleanup, alongside `init` / `--host=` deprecation removal sweep.
3. **Decide policy on multi-SoT for other workflow knobs.** `{{NODE_VERSION}}` has the same shape (could be read from `.nvmrc` by `actions/setup-node@v4` directly using `node-version-file:`). Same SoT-collapse opportunity, but no current bug — defer.
4. **Squashed-feat-branch rebase friction** (already logged in `.agents/friction.md`). Out of scope for this debug; orchestrator already created `fix/bar-130-ci-pnpm` from `origin/dev`.
