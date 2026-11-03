Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Tightness, dependency correctness, design-coverage.

Mechanical checks: `bkit tests plan-check --existence=refuse` on `plan-v3-reviewed.md` → 0 problems, 0 existence findings. Group caps (3 tasks / 15 tests) and per-task caps (10 tests across 3 files) hold: max group is 14 tests, max task is 10 tests in 3 files (Task 12). No design artifact exists for this FID, so design-coverage is scored against issue #715's body only; every `Success criteria` bullet maps to a task (retirement → 7/8/9/14/15, publish config → 1/2/3/4, endings → 5/10/11/12/13, gate → 16). Task dependency graph is acyclic and each consumed artefact is produced by an earlier task (12 ← 4,5,10; 13 ← 10,12; 14 ← 8,9; 16 ← 12,13,14,15). The 4 decision and 7 deferral keys on the **Ledger rows:** line all exist on disk.

## CRITICAL

- **Task 7 leaves every consumer that kept lite content with a permanent false "manual fix" warning.** The plan writes a consumer-owned stub after stripping the managed block (Edge Cases § "Consumer `.bkit/lite.md` with lines below `bkit:end`", Decision `715-lite-workflows-retired`), and separately requires `migrateRetiredLite` to leave "a blockless or multi-block file untouched with a logged fix" (Architecture § Install payload, Edge Cases § "`.bkit/lite.md` with no single managed block", Task 7 `TEST FIRST` line 4: `leaves a blockless or two-block lite.md untouched and logs`). The stub is exactly a blockless file, so the next `bkit install` / `bkit upgrade` / `bkit check` on that consumer takes the blockless branch and prints the old migration's message — "has no single bkit managed block — left in place. Move your own lines into `.bkit/lite.md` below `<!-- bkit:end -->`, then delete it." (`core.ts:345-349`) — telling the consumer to move lines into a managed block this change just removed, on every future run. The two rules cannot both hold, no test distinguishes "already retired by us" from "consumer file that never had a block", and the stub heading is the same `## Project Lite Workflows` string the migration excludes, so it cannot be the discriminator. Fix: state the discriminator (e.g. a retired-stub sentinel line, or "no managed block and content only under the retired heading → return silently") in Task 7, and add the matrix row + `TEST FIRST` case "a second upgrade after the stub was written logs no fix and writes nothing" to `core.integration.test.ts`.
- **The orphaned shortcuts-merge path has a missing prerequisite after the docs loop stops writing `.bkit/lite.md`.** `migrateRetiredLite` must merge `.agents/shortcuts.md` consumer lines into `.bkit/lite.md`, but the existing implementation reads the destination unconditionally (`const current = fs.readFileSync(dst, "utf-8")`, `core.ts:358`) because today's `runBkitDocs` writes `.bkit/lite.md` in the loop _before_ the migration runs (`core.ts:289-305`). Task 7 removes `"lite.md"` from `BKIT_CANONICAL_DOCS` and deletes the package doc, and explicitly says the replacement must not gate on `getBkitDocsRoot()/lite.md` — so the destination's existence is no longer guaranteed. A 5.1.0–5.2.4 consumer who deleted `.bkit/lite.md` (or a partial install) and kept `.agents/shortcuts.md` lines makes the migration throw and abort the whole install. Fix: specify create-if-absent for the merge target in Task 7's `UPDATE` and add the missing row to the Derived Test Matrix and `TEST FIRST` ("merges shortcuts lines when `.bkit/lite.md` is absent, creating the stub").

## OPTIONAL

- **Process Sketch adds an example the Concrete Example and Edge Cases do not contain.** `WHEN a build resumes after Step 2 → THEN …` is not restated from either source; the scenario contract allows only 3-7 outcome lines drawn from those two sections. Either move the resume point into Edge Cases (it is load-bearing — the whole `{PUBLISH}`-is-re-derived design rests on it) or drop the line.
- **`bkit stats` is named by the issue's Implementation scope but has no test, task, or deferral row.** The plan's justification (Architecture § "`bkit stats` … buckets every `outcome` row by kind, not by `ending`") is sound, but the issue asks to "record `publish` and ending `held`" in both `workflows summary` and `bkit stats`; a reader cannot tell whether that was measured or assumed. A one-line matrix row (or an `Exempt`/deferral entry) would close it without new code.
- **Task 13's reads and its described tests do not line up on the ship side.** The `READ` names `extractStep6Line`, while the `TEST FIRST` rows run "Step 2's no-PR route" and "Step 2's CI/merge lines"; and the held-close describe asserts `build-summary.md` holds `Publish: held` / `Docs: not synced`, which Step 15 produces, not the Step 16 fence the task says it runs "as written". Name the extraction helper for Step 2 and the exact command sequence (Step 15 summary line, then the Step 16 fence) so the test cannot be written against the wrong lines.
- **Duplicate and split design subsections.** `.bkit/core/.bkit/jsonl.md` and `docs/observability.md` appear twice under Architecture (`Build workflow and telemetry` and `Documentation`), and `.bkit/core/.bkit/README.md` ownership is split across Task 8 (tier rows) and Task 14 (change row) in two places. One subsection per artifact would make the task boundaries unambiguous.
- **`bkit check` advisory precedence for `publish.remote: false` is unstated.** Task 1's `invalidBuildPublish` returns `build.publish.remote` as an invalid key, while Task 3's `detectBuildPublish` maps a set non-`true` `remote` to `bkit-build-publish-remote`. Say which finding fires so `bkit check` cannot emit both for one value.
- **`issues.test.ts:233,239` still use `next:plan:lite` as a fixture label.** Harmless (generic label arithmetic), but the retirement sweep's story reads cleaner if the fixture uses a plain `next:plan`; no task currently owns that line.

## OUT OF SCOPE

None — every plan task traces to a `Success criteria` bullet, an issue Implementation-scope line, or a repo rule (`dist/` staging, `instructions:sync`, gate). No expansion proposed.

## SUGGESTED SCOPE EXPANSION

None beyond the candidates already tabled in the plan's own § Suggested Scope Expansion (`main-checkout-left-core-bare-true`, the four full-gate timeout rows, `650-debug-dev-ci-live-round-trip`, `bkit builds --held`).
