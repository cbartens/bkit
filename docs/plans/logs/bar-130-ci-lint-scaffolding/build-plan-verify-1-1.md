# Build Plan Verify — Sub-plan 1, attempt 1

**FID:** bar-130-ci-lint-scaffolding
**Sub-plan:** 1/3 (Scope A — bkit self-gating)
**Verdict:** CONCERNS
**Failures:** 0

## Sub-plan checklist coverage

<!-- prettier-ignore -->
| Item | Status | Evidence |
| --- | --- | --- |
| DoD #5 — bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test + format:check | Covered | `.github/workflows/ci.yml` lines 43-72 — Typecheck, Run Tests, Format Check, Install Vale, Prose Lint, Slop Scan, Self-Test steps in order |
| Task 7.1 — `.github/workflows/ci.yml` w/ markers + Option A (`pnpm tsx`) | Covered | `.github/workflows/ci.yml` line 1 (`# bkit:start`), line 73 (`# bkit:end`), line 72 (`pnpm tsx .agents/scripts/bkit-install.ts check`) |
| Task 7.2 — `.vale.ini` + `.vale/styles/House/` slim scope | Covered | `.vale.ini` lines 6-7 `[.agents/**]`, lines 29-34 `[*.md]`; `.vale/styles/House/LLMSlop.yml` exists |
| Task 7.3 — `slop-scan.config.json` + `.prettierignore` | Covered | `slop-scan.config.json` (32 lines), `.prettierignore` (8 lines wrapped in markers) |
| Task 7.4 — `prettier` devDep + format/format:check/lint:slop/lint:prose scripts | Covered | `package.json` lines 30-33, devDep `prettier ^3.5.3` line 37 |
| Gate 1, 2, 3, 4 | Ticked | plan-1 lines 167-171, 269, 281-282, 295-297 |
| CI on PR (line 293) + Manual Step 3 (line 306) | Unticked (correct — pre-PR) | Branch not yet merged |

## Diff review (in-scope files only)

- `.github/workflows/ci.yml` — Wrapped in `# bkit:start`/`# bkit:end` (lines 1, 73). Steps match plan: checkout → pnpm action-setup v4 (v10) → setup-node v4 (node 20, cache pnpm) → `pnpm install --frozen-lockfile` → typecheck → test → format:check → install Vale 3.14.1 (curl + `vale sync`) → lint:prose → lint:slop → `pnpm tsx .agents/scripts/bkit-install.ts check`. NO auth-shim — correct (bkit's own repo clones itself, plan line 186). Concurrency + permissions present. PASS.
- `.vale.ini` — Wrapped in `# bkit:start`/`# bkit:end`. Scopes slimmed to `.agents/**` + root `*.md`. Adds defensive `[**/.agents/skills/**]`, `[**/.claude/skills/**]`, `[**/.cursor/skills/**]` blocks disabling House rules for vendored skills (sensible expansion). `Packages = write-good` declared. PASS.
- `.vale/styles/House/` — `LLMSlop.yml` checked in with token list and error level. Tier-1 fully-managed style ships at repo root (plan line 195). PASS.
- `slop-scan.config.json` — Present with structure rules + comments + defensive checks + test overrides. Content matches seed conventions. PASS.
- `.prettierignore` — Wrapped in markers; lists `node_modules/`, `dist/`, `.agents/skills/`, `*.tsbuildinfo`, plus `docs/` and `pnpm-lock.yaml`. The latter two extend beyond plan line 202 but are pragmatic (`docs/` would otherwise blow up format:check on plan markdown; `pnpm-lock.yaml` is conventional). Minor deviation, not blocking.
- `.prettierrc.json` — New file (semi+doublequote+2spaces+trailingComma all+printWidth 100). Not explicitly listed in plan but a reasonable companion to prettier devDep adoption. Concern: plan does not authorise this file.
- `package.json` — `prettier ^3.5.3` devDep added; scripts `format`, `format:check`, `lint:slop`, `lint:prose` added. `lint:slop` uses `slop-scan scan .` (vs plan-suggested `node ./node_modules/.bin/slop-scan ...` — functionally equivalent via PATH resolution). `lint:prose` uses a `find`-based file enumerator wrapping vale rather than the plan's literal `vale .agents/ "*.md"` invocation; behaviour preserves the two-stage guard (real Vale findings still propagate; missing-binary still skips). Deviation from plan text but identical contract.
- `pnpm-lock.yaml` — Synced for `prettier`.

## Findings

1. (Concern) `lint:prose` script body deviates from plan-1 line 263 verbatim text. Plan says `bash -c 'if command -v vale ...; then vale .agents/ "*.md"; else echo ...; fi'`; actual is a `find`-based enumerator. The contract (graceful skip on missing binary; non-zero on findings) is preserved. Treat as minor/cosmetic.
2. (Concern) `.prettierignore` adds `docs/` and `pnpm-lock.yaml` beyond plan line 202's listed entries. Pragmatic, non-blocking.
3. (Concern) `.prettierrc.json` introduced without plan authorisation. Reasonable accompaniment to prettier adoption; document or add to plan in a follow-up.
4. (Concern) `lint:slop` invocation form differs from plan line 259 hint (`node ./node_modules/.bin/slop-scan ...` → `slop-scan scan .`). Functionally equivalent.

None of the findings block the v4-1 success criteria (DoD #5, format:check clean, lint:slop clean, lint:prose graceful, pack-distribution exclusion). All concerns are textual deviations from plan with preserved behavioural contract.

## Decision

CONCERNS (0 failures). All Tier-A artefacts present, CI workflow correctly structured with `pnpm tsx` self-test (Option A), markers in place for v4-3 dogfood round-trip, `.github/` outside `package.json` `"files"` allowlist (default-excluded). Deviations are cosmetic and behaviourally equivalent. Recommend gap-remediate to either (a) align `lint:prose` script text to plan or (b) update plan to reflect the `find`-based form, and to authorise `.prettierrc.json` + extra `.prettierignore` rows.

<!-- verdict:end -->
