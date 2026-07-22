Verdict: CONCERNS
Strategy: STANDARD

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — **G3:** `tests/counter-failclosed.bats` mutating tracked `red-vs-dev.txt` — write only `$TMPD/red-vs-dev.txt`, diff (ignore timestamp/stderr) vs tracked as provenance check (`:101-135`, plan T2.7 amended). Verified: `npx bats tests/*.bats` → `git status --short` shows no `red-vs-dev.txt` modification.

DONE — **G1:** T2.4 fixture (3 rows / asserts 4) vs plan (2 rows / asserts 3) — reconciled **plan toward test** (`58-workflow-counters-plan-1.md:469-472`; `:473` rationale: 3-row fixture surfaces off-by-one filter regression).

DONE — **G2:** T2.6 lacked non-vacuity guard — added guard + RED-PROOF to `.bkit/src/bkit-counter-prose-audit.test.ts` (`DERIVE_CALL_PRESENCE` vs `DERIVE_CALL_PATTERN`; fails on quoted-argument mismatch). Vacuous-correct today (both 0); RED-PROOF fires on synthetic mismatch. Gate 2b text at plan `:527`/`:530` now self-enforcing. `npx vitest run .bkit/src/bkit-counter-prose-audit.test.ts` → 40 tests, expected T5.2 RED only.

DONE — **G4:** `extractFoldJq` CWD-relative — added `REPO_ROOT = path.resolve(__dirname, "../..")`, rebased `extractFoldJq` + `WORKFLOWS_DIR`. `npx vitest run .bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` → **39/39 pass**.

DONE — **G5:** soft-skips on shallow clone (`bkit-status-fold.test.ts:85-90`; `counter-failclosed.bats:103-105`) — added `console.warn` on Vitest skip; bats TAP reason sufficient. Judgement in plan T1.3 (`:452-454`).

DONE — **G6:** position-3 sites by description not line ref — `bkit-counter-bus.sh:52-54`, `counter-failclosed.bats:160` now `bkit-build.md:786-787`; plan T2.1 (`:463-466`).

DONE — **Verification:** `pnpm typecheck`/`format:check` clean; `pnpm slop:delta` net 0; `pnpm lint:prose` → pre-existing `docs/architecture.md:156` only; `npx bats tests/*.bats` → **68 tests, 7 RED** (documented fail-open, unchanged); post-run `red-vs-dev.txt` NOT modified (G3 confirmed).

CONCERNS — **`pnpm test` full default parallelism:** 4/58 files intermittently timeout (`bkit-slop-type-suppression.integration.test.ts`, `bkit-check-opencode.integration.test.ts`, `bkit-upgrade.integration.test.ts`) — untouched by remediation. Pre-existing flake: (a) all 3 pass **24/24 in isolation**; (b) `--maxWorkers=2` → **2235 passed**, only expected T5.2 RED (matches verify baseline 2233/1). Out of scope to change vitest pool; flagged at `docs/knowledge.jsonl` → `local-pnpm-test-full-parallelism-integration-timeouts-flake`.
