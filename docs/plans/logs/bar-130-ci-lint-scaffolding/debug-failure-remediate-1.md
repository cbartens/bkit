Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Debug Failure Remediation

Edits 1-4 were already applied in a prior interrupted pass and verified verbatim against the diagnose. Applied Edit 5 (docs/pending.md), added KN-3 regression tests to bkit-modules.integration.test.ts, and fixed a pre-existing test (`toContain("10")`) broken by Edit 2 removing `{{PNPM_VERSION}}` from the template. All 175 tests pass, typecheck and format:check clean.

## Strategy

STANDARD — apply diagnose edits as written, add recommended regression guards.

## Changes Applied

<!-- prettier-ignore -->
| Edit | File | Action |
| --- | --- | --- |
| 1 (pre-existing) | `.github/workflows/ci.yml` | Dropped `with: version: 10` block; added two-line KN-3 comment |
| 2 (pre-existing) | `.agents/templates/.github/workflows/ci.yml` | Dropped `with: version: {{PNPM_VERSION}}` block; added two-line KN-3 comment |
| 3 (pre-existing) | `.agents/scripts/bkit-tokens.ts` | Added three-line `NOTE:` comment above `resolvePnpmVersion` |
| 4 (pre-existing) | `docs/knowledge.md` | Appended `KN-3` entry before `<!-- bkit:end -->` |
| 5 (this pass) | `docs/pending.md` | Appended `v0.2: Retire {{PNPM_VERSION}} token` entry before `<!-- bkit:end -->` |
| 6 (this pass) | `.agents/scripts/bkit-modules.integration.test.ts` | Added two KN-3 regression guards (template ci.yml + bkit ci.yml must not set `with.version:` for pnpm action); updated pre-existing `toContain("10")` pnpm-version assertion broken by Edit 2 |

## Deviations from Diagnose

- **Suggested Tests target file:** Diagnose recommended adding tests to `bkit-modules.test.ts`, which does not exist. Added to `bkit-modules.integration.test.ts` (the actual file exercising `runCiModule` and ci.yml template wiring) — closest fit.
- **Regex refinement:** Diagnose regex `/pnpm\/action-setup@v4[\s\S]{0,100}with:[\s\S]{0,50}version:/` produced false positives: (a) the KN-3 warning comment itself contains `with: version:` in the comment text, and (b) the setup-node step's `with: node-version:` falls within 100+50 chars of the action line. Replaced with `/pnpm\/action-setup@v4[^-]*?with:[^-]*?version:/s` which stops matching at the next YAML step separator (`-`). The semantic intent is identical: assert no `version:` key in the pnpm action's own `with:` block.
- **Pre-existing test fix:** `expect(onDisk).toContain("10")` on line 120 of the integration test was asserting the pnpm major was emitted via `{{PNPM_VERSION}}`. Edit 2 removed that token substitution site. Updated the assertion to remove the stale `"10"` check and clarify in a comment that the pnpm version is no longer emitted into the rendered ci.yml (by design — KN-3 fix).

## Blockers

None

## Verification

```
pnpm run typecheck  → clean (0 errors)
pnpm run format:check → clean (all files Prettier-conformant)
pnpm run test → 7 test files, 175 passed, 1 todo, 0 failed
```
