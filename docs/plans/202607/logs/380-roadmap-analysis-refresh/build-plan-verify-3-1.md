Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 3/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-3.md`), Tasks 13–15 plus the sub-plan-3-owned Gates 2/3/4, Mandatory Testing & Documentation tasks, Verification Plan and Manual Verification. Sub-plans 1 and 2 already verified PASS — their scope was not re-verified.

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

None — first verification attempt for sub-plan 3.

## Notes

All gates were re-run independently in this session; the execute log's numbers reproduce.

**Gates re-run (real numbers, this session):**

- `pnpm typecheck` — PASS (0 errors).
- `pnpm format:check` — PASS ("All matched files use Prettier code style").
- `pnpm lint:prose` — PASS: 0 errors, 1 warning (`docs/testing.md:318`, pre-existing — the #380 section starts at line 377; not in the diff).
- `pnpm lint:slop` — report-only; repo score 31.60, hotspots all pre-existing files unrelated to #380.
- `pnpm slop:delta` — PASS: "added 8, resolved 8, worsened 0; net findings 0, net score 0.00", "OK — no net-new or worsened findings".
- `pnpm test` (with `--testTimeout=90000`) — PASS: 83 files, 2778 passed / 2 skipped / 1 todo. Zero failures; no timeout flake encountered (the execute log's default-timeout numbers agree).
- `npx --yes bats tests/*.bats` — PASS: 189/189 ok, including the six new #380 fail-open cases (184–189).
- `pnpm test:coverage:unit` — PASS, exit 0; branches 70.67% vs the `--coverage.thresholds.branches=70` floor.
- `pnpm check:dist` — PASS (clean; `dist/bkit-telemetry-migrate.js` is committed in `7bdff27c`, so the execute log's "stale" caveat no longer applies).
- `pnpm lint:workflows` (actionlint) — PASS, no findings.
- `node dist/bkit-install.js check` — PASS: `[bkit-check] 0 write(s) would occur.` `git config core.bare` reads `false`.

**1. Task 15 / mirror regen (load-bearing) — VERIFIED.** All six host mirrors return `grep -c "completed\.md"` = 0: `.claude|.cursor|.opencode` × (`commands/bkit-ship.md`, `agents/bkit-ship-update-docs.md`). `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/README.md` and `.agents/*.md` are also clean. `.bkit/version` has no `docs/completed.md` entry and carries the six new `bkit-roadmap` mirror hashes. `docs/completed.md` is deleted (-183 lines in the range diff). `docs/roadmap.jsonl` is populated (50 valid rows). `bkit check` = 0 writes. `.agents/docs.md` is accurate (`docs/roadmap.jsonl` row in-block, `docs/roadmap.md` row under Project Documents, no `completed.md` row).

**2. `slop:delta` carry-in — GENUINELY GREEN, fix judged acceptable.** Re-run independently: net findings 0, net score 0.00. The `tryParseJsonLine<T>` helper (`.bkit/src/bkit-telemetry-migrate.ts:855`) uses `let parsed = null; try { parsed = JSON.parse(...) } catch { parsed = null } return parsed`. I read the rule implementation (`node_modules/slop-scan/dist/node-entry.js`, `findErrorObscuringSummaries`): it flags `catchReturnsDefault || catchThrowsGeneric || (catchHasLogging && catchHasDefaultReturn)` — the assignment shape has no `return` and no logging inside the catch, so it is not matched. **Judgement: a real fix, not rule-dodging, with one caveat.** No error information is lost — BOTH call sites (`existingRoadmapKeys:882`, `detectInFlightStatus:916`) branch on `obj === null` and emit the loud `console.error("[bkit-telemetry] seed: malformed … line skipped")` diagnostic the plan mandates, so a parse MISS is never silent. The refactor genuinely reduces two error-handling sites to one. `JSON.parse` has no non-throwing variant, so any minimal safe-parse helper needs a try/catch; the only alternatives are `catch { return null }` (flagged) or rethrow (wrong semantics). Caveat worth recording: the AST shape was chosen to sit outside the rule, so the rule no longer sees this class of default-on-parse-failure in this file — a latent blind spot if a future edit drops the call-site logging. No gate was weakened: no `as any` / `@ts-ignore` / `@ts-expect-error` / `.skip(` / `passWithNoTests` / eslint- or slop-disable was added anywhere in the sub-plan-3 range diff (verified by grep over added lines).

**3. Task 13 — VERIFIED.** `.bkit/workflows/bkit-roadmap.md` exists: `description:` frontmatter, `/bkit-roadmap` usage, step 2 sources `.bkit/scripts/bkit-roadmap-fold.sh` and calls `bkit_roadmap_fold`, step 3 sources `bkit-roadmap-reconcile.sh` and calls `bkit_roadmap_drift_check`, step 4 invokes `@bkit-roadmap-refresh` scoped to the `roadmap-analysis` marker block, and every sourced script has a `[bkit-roadmap]` fail-open fallback. Both functions really exist (`bkit-roadmap-fold.sh:121`, `bkit-roadmap-reconcile.sh:15`) in template and rendered copies. `.bkit/src/bkit-roadmap-utility.test.ts` (5 tests, matrix row 17) passes. `bkit-catalog-parity` passes — `.bkit/workflows.md` gained the `/bkit-roadmap` section, file-tree entry and command-table row. Non-defect checked: step 3 passes `$ROADMAP_JSONL`, set in step 2's separate bash block; `bkit_roadmap_drift_check` defaults arg 2 to `${root}/docs/roadmap.jsonl`, so a cross-block unset is harmless.

**4. Task 14 — VERIFIED.** `docs/deferrals.jsonl` carries `status:"CLOSED"` same-`key` rows for BOTH `380-dev-located-roadmap-status-write-for-build-debug-closes` and `380-persisted-frontier-snapshot-event-log-for-260` (the latter referencing `260`). `docs/observability.md:41` registers `[bkit-roadmap]` in the one-prefix-per-subsystem list, and `:81-90` is the prefix section covering fold / append / bootstrap-hint / drift-check / reverse-sync / analysis-refresh fail-open lines. `.bkit/jsonl.md` carries `kind: "feature"` in § Ledgers & Writers (:40), the kind enum (:48), § Per-Kind Fields with the six-value `DESIGNED|PLANNED|BUILT|DEBUGGED|SHIPPED|ABANDONED` ladder (:70), the § Severity explicit exclusion (:134), the `ABANDONED` board-removal idiom plus example rows (:446-453), and both `counterName`s (:456). `docs/decisions.jsonl` gained all 5 planned rows; `docs/knowledge.jsonl` gained all 5 planned rows plus the `380-debugged-fid-permanently-outside-reverse-sync-reach` carry-in. All five ledgers parse as valid JSONL (68/50/75/8/50 rows, 0 malformed). `docs/testing.md` gained the "Roadmap fold + analysis test coverage (#380)" section and table. The consumer migration doc obligation is met by the `completed-md-unmigrated` preflight advisory (`.bkit/src/bkit-preflight.ts:150`), which names `bkit telemetry migrate` and states the board is "empty, not wrong".

**Partial Manual Verification performed by me (Step 1, scratch consumer in `/tmp`):** a fresh `git init` repo seeded with `docs/completed.md` → `node dist/bkit-install.js install --claude --cursor --tooling` exits 0 and does **NOT** create `docs/roadmap.md` (matrix row 18 behaviour holds); `bkit check` then reports `0 write(s) would occur` and fires advisory `1/33 completed-md-unmigrated`. **However `bkit telemetry migrate` produced no output, exit 0, and left `docs/completed.md` in place with no `docs/roadmap.jsonl` created** — see GAP-2; I could not distinguish a wrong invocation from a real no-op within budget, so this leg is inconclusive rather than confirmed-broken.

**Residual observations (not counted as failures):**

- `.bkit/version` `canonicalHashes` has no entries for the three new `.bkit/scripts/bkit-roadmap-{fold,reconcile,cadence}.sh`. The scripts were committed in sub-plan 1, so the Task-15 `writeTier2` pass was a no-op and never pushed them into `ws.writes`. Cosmetic in the bkit repo — `bkit check` is 0-write and a fresh consumer install stamps them — but `.bkit/version` does not match the Task-15 narrative "regenerate `.bkit/version` hashes (new scripts)".
- Task 15's literal Done-when sweep `grep -rln "completed\.md" … .` returns 15 paths, not "ONLY `docs/decisions.jsonl`": `dist/{bkit-telemetry-migrate,bkit-cli,bkit-preflight}.js`, `.bkit/src/{bkit-telemetry-migrate,bkit-cli,bkit-preflight,bkit-telemetry,bkit-ship-invariants}.ts` and their tests, `docs/{decisions,deferrals,knowledge}.jsonl`, `docs/testing.md`. Every one is a legitimate reference (the migrator must name its source file; ledgers are append-only history; `bkit-ship-invariants.test.ts` uses it as a NEGATIVE assertion). The load-bearing subset the Done-when actually targets (six host mirrors + `.bkit/*.md`) is clean, so this is an over-strict plan expectation, not a defect.
- Verification Plan "Full local gate suite" names `pnpm lint`, which is not a script in `package.json` (the repo has `lint:prose` / `lint:slop` / `lint:workflows`). Plan-text defect; I ran all three real lint scripts instead.
- `docs/observability.md:88` paraphrases the drift-check line as `[bkit-roadmap] {FID}: live feat/* with no ledger row`; the emitted text is `[bkit-roadmap] drift: live feat/{FID} has NO docs/roadmap.jsonl row — a close that never wrote`. Summary-level doc, acceptable.
- Human-owned `👤 ✅ Human Confirmation` boxes (Acceptance Scenario / Breaking Changes / Open Questions) and the Pre-Flight core checklist remain `[ ]` — not defects, recorded as observations.

**Plan checkboxes updated by this verification:** Gate 2 (all 3), Mandatory "Write new tests" / "Verify observability" / "Update documentation", Gate 3 (both), the five Automated Tests items and Gate 4 — each independently re-verified above. Left `[ ]`: the two Mandatory test-coverage items (GAP-1) and Manual Verification Steps 1–4 (GAP-2).

## Identified Gaps Log

2 gaps.

GAP-1 (blocking a Mandatory task) — **Derived Test Matrix row 18 has NO covering test.** The matrix Target file is `.bkit/src/bkit-install.integration.test.ts` (new scenario), and the Mandatory task "Update existing tests" says "extend `bkit-install.integration.test.ts` with the roadmap-consumer-owned scenario (matrix row 18)". `grep -n roadmap .bkit/src/bkit-install.integration.test.ts` returns ZERO hits, and a repo-wide search (`grep -rln "roadmap\.md" .bkit/src/*.test.ts tests/*.bats`) finds only `bkit-roadmap-{reconcile,utility,staging}`, `bkit-ship-invariants`, `bkit-telemetry-gitattributes` and `tests/roadmap-fold.bats` — none of which asserts that `bkit install` never creates/overwrites `docs/roadmap.md` or that `bkit check` drift stays clean. Success Criterion 5's automated leg is therefore unguarded (the behaviour itself is correct — confirmed manually in a scratch consumer — but nothing will catch a regression). Consequently the Mandatory tasks "Verify test coverage against Derived Test Matrix" (which asserts "no uncovered row") and "Update existing tests" are both unsatisfied and left `[ ]`. Remediation: add the row-18 scenario to `bkit-install.integration.test.ts`.

GAP-2 (unexecuted plan section) — **Manual Verification Steps 1–4 were not performed.** The execute log makes no claim about them and all four boxes are `[ ]`; the plan flags Steps 2 and 4 as the load-bearing runtime ground-truth for the workflow-file-content matrix rows 11/15/20 and states they "MUST NOT be skipped". I executed the install half of Step 1 myself (PASS: install does not create `docs/roadmap.md`; `bkit check` 0 writes; `completed-md-unmigrated` advisory fires), but the migrate half did not reproduce: in the scratch consumer `bkit telemetry migrate` exited 0 with no stdout, did not create `docs/roadmap.jsonl`, and did not delete `docs/completed.md`. That may be an invocation/flag issue on my side rather than a defect, but it is exactly what Step 1 exists to settle. Steps 2 (both `RUNTIME_DEVPUSHES` modes), 3 (cadence + drift check) and 4 (real ship-close round-trip including the "row actually COMMITTED" assertions) remain entirely unrun. Remediation: run Steps 1–4 as written and record the outputs.
