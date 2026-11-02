Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Source: plan § Acceptance Scenario (`830-debug-diagnose-named-plan.md:22-28`) and each task's `DONE WHEN` line (Tasks 1-14), declared 2026-11-02. Verification run 2026-11-03 in this worktree: `pnpm exec vitest run` over the 13 matrix target files → exit 0, `Test Files 13 passed (13)`, `Tests 1234 passed (1234)`; all 43 named matrix tests located by exact title (line numbers below). Full gate evidence: `run-tests-1.md:2972-2973` (`pnpm bkit:gate:static-unit-integration`, 51 integration files, 1707 tests passed).

Acceptance Scenario success criteria:

- **SC1 — selected red run reaches Fetch Context and Diagnose without a discovery gate:** `Delivered`. `bkit-debug.md:316` runs `runs locate` before Step 3; `tests.ts:1657` `--ci-run` records a CI round with no local gate; tests `records a CI evidence round without executing a local gate` (`tests.test.ts:166`), `checks the complete selected CI fix sequence against green and red final runs` (`debug-ci-evidence.integration.test.ts:418`) pass.
- **SC2 — unrelated green workflow cannot hide the failure; missing/mismatched evidence cannot go clean:** `Delivered`. `runs.ts:187` `locateCi`; tests `filters branch and PR discovery by configured workflow and exact head` (`runs.test.ts:559`), `distinguishes proven automatic no-red from explicit non-red and unavailable lookup` (`:652`), `accepts only matching complete CI receipts with nonempty logs` (`context-fetch.test.ts:138`) pass.
- **SC3 — edits only the validated adopted branch; resume keeps selection; replacement cannot reuse old fixes:** `Delivered`. `branches.ts:2701` `parse`; `bkit-debug.md:179`; tests `adopts a requested debug branch without mutating conflicting worktrees` (`worktrees.test.ts:178`), `validates branch fork ancestor divergent and unavailable ancestry evidence` (`runs.test.ts:622`), `reloads saved fixes and recollects explicitly replaced evidence generations` (`debug-ci-evidence.integration.test.ts:474`) pass.
- **SC4 — `[local]` replaces CI selection, `[repro]` still writes a failing test first, post-fix gates preserve `[live=off]`:** `Delivered`. Tests `clears saved CI routing immediately for explicit local selection` (`status.test.ts:152`), `orders covering gates for red tiers and preserves live off` (`:235`), `honors CI reproduction before remediation and blocks unreproduced failures` (`ci-dispatch-gate-alignment.test.ts:95`), `preserves local and repro overrides across actual workflow command sequences` (`debug-ci-evidence.integration.test.ts:506`) pass.
- **SC5 — completion needs pushed-head CI plus selected-workflow verification; new red reports the new run:** `Delivered`. Tests `requires selected other-workflow success at the exact pushed head` (`runs.test.ts:210`), `retains original and verifying run identities through close and auto handoff` (`ci-dispatch-gate-alignment.test.ts:105`), `rejects fork verification runs that shadow a red selected workflow at the same head` (`runs.test.ts:178`) pass; `bkit-auto.md:136` passes the held run URL to debug.

Task `DONE WHEN` deliverables:

- **Task 1 — branch parse and safe debug adoption:** `Delivered`. `branches.test.ts:144`, `:180`, `worktrees.test.ts:178` pass; `branches.ts:2701` `parse` verb.
- **Task 2 — locate and validate CI evidence:** `Delivered`. `runs.ts:2517` `locate` verb; seven `runs.test.ts` cases (`:503`, `:542`, `:559`, `:589`, `:622`, `:652`, `:705`) and `ledgers/status.test.ts:22` pass.
- **Task 3 — atomic selection and generation routing:** `Delivered`. `status.ts:606` `--ci-selection-file`; `status.test.ts:99`, `:121`, `:152`, `:176`, `:235` pass.
- **Task 4 — CI round without local execution:** `Delivered`. `tests.ts:1657` `--ci-run`; `tests.test.ts:166`, `:203`, `:227` and `telemetry.test.ts:50` pass.
- **Task 5 — CI round completion and audit without weakening local clamps:** `Delivered`. `steps.test.ts:180`, `:214` and `status-holes.test.ts:943` pass.
- **Task 6 — pinned context evidence:** `Delivered`. `context.ts:1319` flag, `context.ts:2009-2016` sets/clears the four `BKIT_CI_*` pins; `.bkit/core/.agents/context.md:36`, `:38` document the inputs and `bkit-ci-evidence` receipt; `context-fetch.test.ts:119`, `:138`, `:181` pass.
- **Task 7 — shipped GitHub blocks honour the selection:** `Delivered`. `.bkit/templates/context/bkit-github.md:14`, `:49`, `:75`; adopted copy `.agents/context.md:187`; new suite `context-github-ci-block.test.ts:228`, `:264`, `:282`, `:304` pass.
- **Task 8 — Debug workflow wiring and final proof:** `Delivered`. `bkit-debug.md:179`, `:316`, `:321`; `bkit-auto.md:136`; `ci-dispatch-gate-alignment.test.ts:77`, `:95`, `:105` and `runs.test.ts:210` pass; holistic gap on this task (`build-plan-verify-holistic.md:39`) was closed by Task 12.
- **Task 9 — docs, CLI docs and decision row:** `Delivered`. `.bkit/core/.bkit/workflows.md:989`, `:1007`; `.bkit/core/.bkit/templates.md:108`; `docs/testing.md:562` § Debug CI evidence verification; `.bkit/cli.md:143-144` lists `--ci-selection-file`; `docs/decisions.jsonl:535` key `830-red-ci-run-is-the-first-test-round`. Static gate (prose lint, format, tables) passed in `run-tests-1.md`.
- **Task 10 — complete deterministic sequence:** `Delivered`. New `debug-ci-evidence.integration.test.ts` cases `:418`, `:474`, `:506`, `:555` pass.
- **Task 11 — regeneration and fresh-consumer footprint:** `Delivered`. Packed-consumer dogfood and 479-hash idempotence match recorded in `build-plan-verify-holistic.md:32`; historical replay recorded separately at `:33` (see Exempt item 8).
- **Task 12 — local round records `source: local` and finishes:** `Delivered`. `debug-ci-evidence.integration.test.ts:342` passes; confirmed by `build-challenge-1.md:18-20`.
- **Task 13 — replacement / later-run CI round finishes on the same derived round:** `Delivered`. `debug-ci-evidence.integration.test.ts:370`, `:392` pass.
- **Task 14 — fork / wrong-event runs cannot satisfy selected-workflow verification:** `Delivered`. `runs.test.ts:178`, `:198` pass; confirmed by `build-challenge-2.md:16-18`.

## Blocking Deferrals

None. No deliverable is absent, stubbed or observably wrong under the checks above. `bkit branches scan-diff --disabled-tests --base=origin/dev` → exit 0, `found: false`, `disabled: []`.

## Exempt Deferrals

Plan file: `docs/plans/202611/830-debug-diagnose-named-plan.md` (last committed 2026-11-02T16:16:38Z, per `ship-input-1.md:478`). Declared deferrals, all `Exempt`, `reason` `scope-declared`:

1. **Historical tag-reading test fix** (`git show v6.0.0:<path>` in four test helpers). Leaves the #748 one-off cause unfixed here. Declared at plan § Out of Scope (`830-debug-diagnose-named-plan.md:518`) and in the issue's Constraints (`ship-input-1.md:50`). Belongs to #748.
2. **New CI provider framework or arbitrary job-mapping system.** Leaves non-GitHub CI discovery and custom job-to-gate maps uncovered; tier mapping stays on the `bkit-tests-<tier>` naming convention. Declared at plan § Out of Scope (`:519`) and § Open Questions & Assumptions (`:502-503`). Belongs to separate provider/configuration work.
3. **Prose branch interpretation such as "on dev".** Leaves free-text branch phrases unparsed; only `branch=<name>` and existing slash-containing branch tokens are read. Declared at plan § Out of Scope (`:520`).
4. **Build's local test step and ship's branch parser.** Leaves `/bkit-build` Step 12 and ship branch parsing unchanged. Declared at plan § Out of Scope (`:521`) and issue Constraints (`ship-input-1.md:48`).
5. **Automatic migration of consumer-owned context blocks.** Leaves already-adopted consumer `ci` / `diff` blocks unrewritten; Step 4 adapts a temporary execution copy instead. Declared at plan § Out of Scope (`:522`), § Breaking Changes & Naming (`:497`) and § Pre-Flight (`:152`).

Advisory process / merge conditions inside `DONE WHEN` lines (recorded here per sweep rule, not deliverables):

6. "After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit" (Tasks 1-8, 10; e.g. `:250`, `:431`). Build-process step.
7. "required gates pass, generated files are stable" and "Generated output is stable after a second generation" (Tasks 10-11, `:431`, `:447`). Build / merge conditions; the gate evidence is `run-tests-1.md:2972-2973` (51 files, 1707 integration tests passed) and the holistic report's 479-hash idempotence match (`build-plan-verify-holistic.md:32`).
8. Historical smoke replay of run 41405235221 (Task 10-11, `:429`, `:447`). Plan § Open Questions (`:504`) makes it advisory: "Their availability affects the advisory replay only". Reported as available and matching in `build-plan-verify-holistic.md:33`.

Plan-related deferral rows for FID `830-debug-diagnose-named` in `docs/deferrals.jsonl`: none found (`grep -n '830-debug-diagnose-named' docs/deferrals.jsonl` returned no lines). Both challenge reports logged no findings (`build-challenge-1.md:14`, `build-challenge-2.md:12`), so no `low-severity` rows exist.

## Lazy Deferrals

None. No intended deliverable remained `Planned`, so no `unjustified` row was appended. `bkit ledgers triage --fid=830-debug-diagnose-named --plan=docs/plans/202611/830-debug-diagnose-named-plan.md` → exit 0, `total: 0`, `written: 0`, `rows: []`.

## Handover Notes

None.

Limits of this sweep: the supplied diff `tmp/bkit-diff-830-debug-diagnose-named.md` is partial (7,422 lines of a larger diff); delivery was judged from the codebase and test runs, not from the diff alone. `bkit check` drift and a fresh `pnpm bkit:gate:static-unit-integration` were not rerun by this sweep; the gate result cited is the build's `run-tests-1.md`.
