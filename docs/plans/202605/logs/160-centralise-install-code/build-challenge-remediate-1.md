# Build Challenge Remediate Log

FID: `160-centralise-install-code`
CHALLENGE_REMEDIATE_ATTEMPT: 1

Scope: MEDIUM findings only (F1, F2). LOW findings (F3–F6) not touched per task scope.

---

## Remediation Log

DONE — Finding F1: removeOrphanTemplatesDir unguarded delete — Added bkit-origin sentinel gate before rmSync; checks for known bkit-managed basenames (AGENTS.md, CLAUDE.md, .github/workflows, .github/renovate.json5, .github/dependabot.yml, gitignore, .vale.ini) inside .agents/templates/ before deleting; logs skip message if none found (.bkit/src/bkit-install.ts:670-700)
DONE — Finding F2: .agents/README.md stale paths — Surgical find/replace: .agents/scripts/bkit-install.ts -> .bkit/src/bkit-install.ts (lines 55, 144-145, 300), .agents/scripts/bkit-templates.content.test.ts -> .bkit/src/bkit-templates.content.test.ts (line 210), .agents/templates/ -> .bkit/templates/ (lines 176-199, 207, 209) (.agents/README.md)

---

## Test results

- `pnpm build` — exit 0 (tsc, no errors)
- `pnpm test` — 32 test files passed, 1141 tests passed, 2 skipped, 1 todo

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->
