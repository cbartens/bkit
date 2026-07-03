# Plan Input — bar-141-preflight-checklist

## Session Prompt

/bkit-plan bar-141

## Issue: BAR-141 — bkit install preflight + post-install AI checklist

**URL:** https://linear.app/bartens/issue/BAR-141/bkit-install-preflight-post-install-ai-checklist
**State:** In Progress
**Labels:** Feature, cbartens/bkit, Plan
**Priority:** Medium

## Description

## Goal

Replace bkit's current ad-hoc `printSink` advisory pattern with a structured three-phase install:

1. **Phase 1 — Preflight** (read-only checks before any writes)
2. **Phase 2 — Install** (current behaviour)
3. **Phase 3 — Post-install AI checklist** (consolidated actionable output)

v0.4.0 shipped a small consolidation (numbered banner around printSink dump). This issue covers the full feature.

## Background

BAR-138 smoke testing surfaced repeated patterns where consumers hit footguns during install:

- `.husky/pre-commit` exists without bkit markers → bkit silently appends, frankenstein hook
- `package.json#scripts.lint:prose` is the F9-vulnerable form → bkit preserves (consumer-wins) but consumer doesn't realize the bug is preserved with it
- `.npmrc` missing GHPR registry config → next `pnpm install` fails opaquely
- `GH_BKIT_TOKEN` set in shell but missing as GitHub repo secret → CI fails on next push
- Vale on PATH but `.vale/styles/write-good/` missing → husky pre-commit hard-fails locally

bkit currently has scattered `printSink` messages for some of these but no structured detection or AI-pasteable consolidation.

## Scope

### Phase 1 — Preflight (new)

New file `.agents/scripts/bkit-preflight.ts`:

```typescript
export interface PreflightFinding {
  id: string; // "no-package-json", "husky-no-markers", "lint-prose-f9"
  severity: "blocker" | "advisory";
  detect: string; // human-readable detection summary
  action: string; // AI-pasteable fix instruction (multi-line OK)
}

export function runPreflight(modules: Set<ModuleFlag>): {
  blockers: PreflightFinding[];
  advisories: PreflightFinding[];
};
```

**Blocker detectors** (Phase 1 exit 1 if any):

- `no-package-json` — `fs.existsSync("package.json")` false
- `malformed-package-json` — `JSON.parse` throws
- `not-git-repo` — no `.git/` and modules include `--core` (worktree branching assumes git)

**Advisory detectors** (collected, printed in Phase 3):

- `husky-no-markers-{precommit,prepush}` — file exists without `bkit:start`/`bkit:end` markers; bkit will APPEND
- `prettierignore-no-markers` — same risk on `.prettierignore`
- `lint-prose-f9-vulnerable` — `package.json#scripts.lint:prose` exists and lacks `[ -d .vale/styles/write-good ]` guard
- `bkit-version-major-downgrade` — `.bkit-version` shows higher major than installing version

### Phase 3 — Post-install AI checklist (expand current consolidation)

New file `.agents/scripts/bkit-postinstall.ts`:

```typescript
export function runPostInstallCheck(
  preflightAdvisories: PreflightFinding[],
  ws: WriteSet,
  modules: Set<ModuleFlag>,
): PreflightFinding[];
```

Re-runs detection AFTER writes (some state changes during install). Combines with preflight advisories, deduplicates, prints unified output.

**Four-surface** `GH_BKIT_TOKEN` sustainability check:

<!-- prettier-ignore -->
| Surface | Detector | Finding when missing |
| --- | --- | --- |
| Local shell | `process.env.GH_BKIT_TOKEN` | "Set `export GH_BKIT_TOKEN=<classic PAT>` in your shell rc" |
| `.npmrc` | grep for `@cbartens:registry=` AND `_authToken=${GH_BKIT_TOKEN}` | "Prepend two lines to .npmrc: ..." |
| GitHub Actions secret | `gh secret list \| grep GH_BKIT_TOKEN` (existing `checkBkitTokenSecret`) | "Run `gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN`" |
| Vercel env (optional) | `vercel env ls preview \| grep GH_BKIT_TOKEN` | "Run `vercel env add GH_BKIT_TOKEN preview` and `... production`" |

Each detector returns `present` / `missing` / `unknown` (last for cases where the CLI isn't available — distinguishes "we can't tell" from false positives).

**Other post-install detectors:**

- `ci-yml-missing-token-env` — gether-style: existing custom ci.yml's Install step has no `env: GH_BKIT_TOKEN`. Detect via grep on the workflow YAML.
- `vale-package-not-synced` — vale on PATH but `.vale/styles/write-good/` absent
- `devdeps-need-fetch` — bkit added new devDeps in this run (consumer needs `pnpm install`)

### Output format

```
==========================================================
[bkit] Post-install checklist (3 advisories)
==========================================================

INSTRUCTIONS FOR AN AI AGENT — copy this entire block into a coding
assistant to apply each item. Each ACTION below is self-contained.

--- 1/3 [advisory] husky-no-markers-precommit ---
DETECT: .husky/pre-commit exists without bkit:start/bkit:end markers; bkit appended its block at EOF
ACTION: Review .husky/pre-commit. If you want only your custom hooks to run, delete the
        bkit:start..bkit:end block. If both should run, no action needed.

--- 2/3 [advisory] lint-prose-f9-vulnerable ---
DETECT: package.json#scripts.lint:prose lacks `[ -d .vale/styles/write-good ]` guard
ACTION: Replace lint:prose with this value (one line, copy verbatim):
  bash -c 'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping"; fi'

--- 3/3 [advisory] gh-secret-missing ---
DETECT: gh CLI reports no GH_BKIT_TOKEN secret on this GitHub repo
ACTION: Run: gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN

After applying all ACTION items, run: pnpm install && pnpm bkit check
==========================================================
```

Each finding has stable `id` (parseable by automated tooling), `severity`, structured `detect` + `action` blocks.

### Out of scope

- Implementing the actual fixes automatically (would violate consumer-value-wins)
- Vercel env detection beyond the `vercel env ls` shell-out (no SDK integration)
- Telemetry / opting back out of advisories (could be added later)
- A `--strict` mode that turns advisories into blockers (overkill; consumer can `bkit check` instead)

## DoD

- [ ] `bkit-preflight.ts` with `runPreflight()` + 3 blocker detectors + 4+ advisory detectors
- [ ] `bkit-postinstall.ts` with `runPostInstallCheck()` + 4 token-surface detectors + ci.yml env detector + vale package detector + devDeps-fetch detector
- [ ] `bkit-install.ts main()` rewired: preflight → blockers exit 1 → dispatch → postInstallCheck → unified output
- [ ] Unit tests for each detector (positive and negative cases)
- [ ] Integration test: scratch consumer with N advisory-triggering conditions → assert exact checklist output
- [ ] Existing scattered `printSink.push()` calls migrated to `advisories.push({ id, severity, detect, action })` — no behavioural regression
- [ ] README update — document the preflight/checklist contract

## Related

- BAR-138 — bkit v0.4.0 GitHub Packages distribution. v0.4.0 shipped a 50-line consolidation as down payment; this issue is the full feature.
- BAR-139 — `bkit uninstall` command. Same pattern (advisory output, AI-pasteable instructions). Some detectors will be shareable.

## Suggested implementation order

1. Define `PreflightFinding` interface + migrate existing `printSink` strings to structured form (preserving messages).
2. Add Phase 1 blocker detectors (small — package.json absent/malformed).
3. Wire Phase 1 → exit-1-or-continue in `main()`.
4. Add advisory detectors one module at a time (start with highest-impact: token surfaces, husky-no-markers).
5. Add Phase 3 post-install detectors that run AFTER writes (devDeps-fetch, ci.yml env).
6. Replace existing inline `console.log` in flush block with structured output formatter.
7. Tests + README docs.

## Comments

(No prior comments on this issue.)

## Design Doc

(No design doc — BAR-141 was not preceded by a /bkit-design phase.)
