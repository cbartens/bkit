Verdict: PASS

<!-- verdict:end -->

Failures: 0

# Plan Scope Check (auditor 1 / parallel)

Lens: every task has Scope, Acceptance/Done-when, Verification; nothing drifts into #209 scope or new `gh` migrations; PRIMARY STEER (copy gether ci.yml near-verbatim, parameterize values, no whole-tier stubs) is reflected.

## Per-task pass matrix

| Task                                           | Scope                                                                          | Done-when checkable?                                                                       | Verification cmd? | Verdict                                                                                                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 (header bridge note)                        | `.bkit/templates/.github/workflows/ci.yml`                                     | literal substring grep + `pnpm lint:workflows`                                             | yes               | PASS                                                                                                                                                                                                                  |
| A2 (rewrite template ci.yml — COPY gether)     | `.bkit/templates/.github/workflows/ci.yml`                                     | 7 explicit greps with exact counts + actionlint                                            | yes               | PASS — PRIMARY STEER ("copy gether near-verbatim, parameterize values, bkit-tests-live CANONICAL not stub") explicitly named in task body + matched by `grep -cE '^      - name: Run Live Tests$'` un-commented check |
| A2b (Detect Direct Push compat retain)         | `.bkit/templates/.github/workflows/ci.yml`                                     | grep + `pnpm test -- bkit-postinstall` exits 0                                             | yes               | PASS                                                                                                                                                                                                                  |
| A3 (bkit-own ci.yml degenerate 3-job)          | `.github/workflows/ci.yml`                                                     | 4 explicit greps incl. NO bkit-tests-live + actionlint                                     | yes               | PASS — out-of-scope reaffirmed (no turbo affected-graph in bkit-own)                                                                                                                                                  |
| A3a (self-CI bash -n preview)                  | verification only                                                              | `bash -n` over extracted `run:` bodies                                                     | yes               | PASS — guards CRITICAL #8                                                                                                                                                                                             |
| A4 (local sanity actionlint × 3 + render test) | verification                                                                   | `pnpm lint:workflows` + `pnpm test -- bkit-templates.content`                              | yes               | PASS                                                                                                                                                                                                                  |
| A5 (snapshot regen)                            | `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap`                  | `pnpm test -- bkit-templates.content -u` + `git diff --stat` non-zero + manual review note | yes               | PASS — addresses CRITICAL #3                                                                                                                                                                                          |
| B1, B2 (git mv)                                | `scripts/ci/` + `.bkit/templates/scripts/ci/`                                  | `git status` shows R + old absent / new present                                            | yes               | PASS                                                                                                                                                                                                                  |
| B3 (edit renamed scripts)                      | both renamed scripts                                                           | grep no `bkit-set-protection` + `REQUIRED_JOB="bkit-tests-check"` present                  | yes               | PASS                                                                                                                                                                                                                  |
| B4 (dry-run live)                              | verification                                                                   | exit 0 + output contains `"contexts": ["bkit-tests-check"]` + pre-flight grep              | yes               | PASS                                                                                                                                                                                                                  |
| B5 (postinstall.ts edits)                      | `.bkit/src/bkit-postinstall.ts`                                                | three grep counts pinned (0/3/1) + word-boundary regex sanity check                        | yes               | PASS                                                                                                                                                                                                                  |
| C1 (bkit-ship.md Step 2 step 6 — MCP)          | `.bkit/workflows/bkit-ship.md`                                                 | literal presence + zero-new-gh diff check                                                  | yes               | PASS — MCP-only mandate explicit                                                                                                                                                                                      |
| C2 (bkit-ship.md Step 12 + gate 12 label)      | same file                                                                      | 3 greps + ASCII-only python sweep + zero-new-gh diff                                       | yes               | PASS                                                                                                                                                                                                                  |
| C3 (bkit-debug.md Step 3 — MCP TESTS_CHECK)    | `.bkit/workflows/bkit-debug.md`                                                | grep + ASCII + zero-new-gh diff                                                            | yes               | PASS                                                                                                                                                                                                                  |
| D1, D2 (rules.md bullet ×2)                    | `.agents/rules.md` + template mirror                                           | grep `Green != ran != validated` between L64-70 + bkit-rules-sync test green               | yes               | PASS                                                                                                                                                                                                                  |
| E1 (content tests extension)                   | `.bkit/src/bkit-templates.content.test.ts`                                     | `pnpm test -- bkit-templates.content` exits 0 with new tests reported                      | yes               | PASS — matrix-row coverage explicit                                                                                                                                                                                   |
| E2 (postinstall + bug-class regression tests)  | `.bkit/src/bkit-postinstall.test.ts` + new `bkit-ship-workflow.test.ts`        | named tests listed (4 explicit bug-class cases) + exit 0                                   | yes               | PASS — closes CRITICAL #6 root-cause class                                                                                                                                                                            |
| E3 (bkit-protect-main test)                    | new test file or extension                                                     | `pnpm test -- bkit-protect-main` exit 0                                                    | yes               | PASS                                                                                                                                                                                                                  |
| E4 (rules-sync test extension)                 | `.bkit/src/bkit-rules-sync.test.ts`                                            | `pnpm test -- bkit-rules-sync` exit 0                                                      | yes               | PASS                                                                                                                                                                                                                  |
| E5 (heavy-customised-ci fixture)               | fixture ci.yml + verify guard scope                                            | actionlint + bare-marker greps + guard-scope grep                                          | yes               | PASS — CRITICAL #5 fixture/template marker contract collision resolved explicitly                                                                                                                                     |
| E6 (upgrade.integration test extension)        | `.bkit/src/bkit-modules.upgrade.integration.test.ts`                           | `pnpm test -- bkit-modules.upgrade.integration` exit 0                                     | yes               | PASS                                                                                                                                                                                                                  |
| E7 (docs/pending.md quick-path)                | `docs/pending.md`                                                              | grep no old name + at least 1 new + historical regex preserved                             | yes               | PASS                                                                                                                                                                                                                  |
| E8 (deployments.md ×2)                         | `docs/deployments.md` + template mirror                                        | grep + `pnpm lint:prose`                                                                   | yes               | PASS                                                                                                                                                                                                                  |
| E9 (knowledge.md + decisions.md)               | both files                                                                     | `tail -n 5` shows new entry                                                                | yes               | PASS                                                                                                                                                                                                                  |
| E10 (CHANGELOG)                                | `CHANGELOG.md`                                                                 | new `## [{NEXT}]` block + `pnpm lint:prose`                                                | yes               | PASS                                                                                                                                                                                                                  |
| F1 (dist regen)                                | `dist/`                                                                        | `pnpm check:dist` + `grep -c "bkit-protect-main" dist/bkit-postinstall.js` == 3            | yes               | PASS — addresses prior dist-drift class                                                                                                                                                                               |
| F2 (mirror regen)                              | `.claude/commands/`, `.cursor/commands/`, `.claude/agents/`, `.cursor/agents/` | `pnpm bkit install` then `pnpm bkit check` exit 0                                          | yes               | PASS — CRITICAL #7 (verb resolution documented inline)                                                                                                                                                                |
| F3 (final verification)                        | verification only                                                              | five named commands exit 0                                                                 | yes               | PASS                                                                                                                                                                                                                  |

## Surface coverage vs #203

- Template ci.yml — A1, A2, A2b (covers all 4 jobs CANONICAL, parameterized, no whole-tier stubs)
- bkit-own ci.yml — A3, A3a (degenerate 3-job)
- Protection rename + postinstall + dist — B1-B5, F1
- Layer-2 ship/debug gates — C1, C2, C3 (MCP-only)
- Layer-3 rules ×2 — D1, D2
- Deployments matrix ×2 — E8
- Fixtures/tests — E1-E6
- CHANGELOG — E10
- docs/pending — E7
- Batched mirror+dist regen — F1, F2

Every surface from the issue body + #403 design addendum is mapped to a task.

## Matrix ↔ Runbook bidirectional mapping

All 22 Derived Test Matrix rows mapped:

- Rows 1-7 (template content + snapshot) -> A2 + E1 + A5
- Row 8 (Detect Direct Push compat) -> A2b
- Row 9 (bkit-own degenerate shape) -> A3
- Row 10 (protect-main rename) -> B1-B3, E3
- Row 11 (postinstall advisory) -> B5, E2
- Rows 12-13 (ship gate + 4 bug-class outcomes) -> C1, C2, E2
- Row 14 (debug gate MCP, zero new gh) -> C3, E2
- Row 15 (rules.md ×2) -> D1, D2, E4
- Rows 16-17 (heavy-customised-ci fixture + guard scope) -> E5, E1, E6
- Row 18 (pending.md) -> E7
- Row 19 (dist freshness) -> F1
- Row 20 (mirror parity) -> F2
- Row 21 (bash -n self-CI preview) -> A3a

No orphan rows, no orphan tasks.

## CRITICAL

None — every task has scope, deterministic done-when (file paths or pinned grep counts or named commands), and a verification command. The PRIMARY STEER from 2026-06-02 (copy gether's ci.yml near-verbatim, parameterize VALUES not SHAPES, bkit-tests-live CANONICAL not stub) is explicitly stated in A2's task body and reinforced by the un-commented `Run Live Tests` grep check + E1's "CANONICAL job body (NOT commented — assert the Run Live Tests step is present un-commented)" assertion. The previous "generalize the SHAPE" framing is correctly noted as SUPERSEDED in Alternative Approaches.

## OPTIONAL

- Task A2's `Done when` grep for `plan-table-v1` uses `>=2`; could be pinned exactly (one for jq schema-tag, one for the summary header) but the lower-bound is safe.
- Task C1's `Done when` says "line ~290 (or nearby)" — "nearby" is a soft locator; if the file shifts, the assertion still binds via grep for `bkit-tests-check` literal inside an MCP call. Tolerable.
- Task E5's bare-marker grep uses fixed 6-space indent (`^      # bkit:start$`) — if the fixture's job-step nesting changes, this would mis-match; cross-check matches today's fixture indent.
- Task A3a's `bash -n` extraction one-liner uses `yq` which may not be on every developer's PATH; consider documenting `brew install yq` fallback (does not block the task, only DX).

## OUT OF SCOPE

- #209 plumbing (status.jsonl conflicts, [skip ci] tip guard) — correctly excluded.
- Pre-existing `gh` -> MCP migration on legacy lines — correctly out-of-scope; plan only forbids NEW `gh` invocations.
- Live `bash scripts/ci/bkit-protect-main.sh` execution against `cbartens/bkit` (operator step, GitHub Pro gated) — correctly deferred via docs/pending.md.
- bkit-own turbo affected-graph + E2E + parity-matrix — correctly excluded (bkit is single-package, no deploy).
- Renovate / external-caller alias drops — correctly excluded (gether D14 / WS-4 scope).

No scope creep detected; no missing surfaces; matrix ↔ runbook clean.
