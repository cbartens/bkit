# Brief: group 1 — Min-push decision in the engine

Plan: Min-Push Accepts Audit Reports and Audit-Template Project Sections Implementation Plan

## Why and what

### Context & Goals

**Problem.** The pre-push hook blocks a `[skip ci]` push to `dev` whose only files outside the plans tree are the files an audit run writes. `bkit ci min-push` decides from `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: ship's `pr` bookkeeping allow-list (`bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts`), plus `docs/plans/**`, plus `bkit.testing.minPushPaths`. Two files an audit run writes match none of them:

1. The report `docs/audits/{YYYYMM}/{slug}.md` that `@bkit-audit-generate` writes. bkit already treats it as a record like a plan (the prettier pre-step and the prose linter's record handling cover both trees), but the min-push floor lists only `docs/plans/**`.
2. The `Project Instructions` section below `<!-- bkit:end -->` in `docs/templates/bkit-audit-*.md`, which every audit run edits. No path rule can tell that section from the bkit-managed block above it, so every audit run leaves a commit that cannot take the light gate.

**Goals (owner decision, issue comment 2026-11-10T06:56:41Z):**

- `bkit ci min-push` counts `docs/audits/**` as written by bkit, beside `docs/plans/**`.
- `bkit ci min-push` also accepts a change to `docs/templates/bkit-audit-*.md` when every changed line sits below the file's `<!-- bkit:end -->`. A change to any line above that marker still needs the full gate.
- Only `bkit-audit-*.md` gets this exception. Other templates, such as `docs/templates/bkit-plan.md`, keep blocking. `docs/**` is not added to `minPushPaths`.
- Every caller of the min-push decision gives the same answer: `bkit ci min-push --ref` (the `[skip ci]` guard on `dev` / `main`), `bkit ci min-push --update` (the hook's choice of `bkit:gate:min`, including the receipt path in `hasVerifiedIncrement`), and the landing routine's gate choice (`checkLanding` in `.bkit/core/engine/commands/land.ts`).
- `.bkit/templates.md` § Git hooks — Husky describes what bkit writes and the `minPushPaths` guidance in the same change.

**Owner-required confirmation: every code, build and test path that reads `docs/templates/bkit-audit-*.md`.** The owner asked the plan to show that nothing reads the part below `<!-- bkit:end -->`, and to stop and bring it back if something does. Four readers do:

- One code path (row 3) and the minimum gate's own tools (row 9). Neither can change a gate result that a min push skips.
- Two bkit-repo unit tests (rows 12 and 13). Both read bkit's installed audit templates below the marker, and bkit's own `bkit:gate:min` (`package.json:58`) runs neither, so a `[skip ci]` push to `dev` could leave either one red with nothing run.

The owner reviewed all four readers and chose option A: the audit-template exception goes ahead, both tests go into bkit's own `bkit:gate:min` beside `ledger-integrity.test.ts` (Task 6), and `detectManagedDuplicate` stays as it is (`docs/decisions.jsonl` `915-min-push-audit-template-project-section`).

<!-- prettier-ignore -->
| # | Reader | What it reads | Reads below `bkit:end`? | Can a below-marker change alter a gate result a min push skips? |
| --- | --- | --- | --- | --- |
| 1 | `bkit check` / `bkit install` / `bkit upgrade` core payload pass: `runCoreTemplates` → `writeTier2` (`.bkit/core/engine/install/write.ts`) → `replaceManagedBlock` (`.bkit/core/engine/install/managed-block.ts`) | `listCoreTemplateFiles` (`.bkit/core/engine/install/modules/core.ts`) lists every `docs/templates/**` file with scope `block`. The writer replaces the text between the markers and copies the text after the end-marker line unchanged, so the would-write count (`bkit check` drift) cannot see a below-marker edit. | Only to keep it byte for byte. | No. Exception: a second line-anchored `<!-- bkit:end -->` makes `replaceManagedBlock` refuse the file (`multiple`), which hides block drift. The plan refuses such a change (Edge Cases). |
| 2 | `detectManagedStale` (`.bkit/core/engine/checks/after/managed.ts`) | `readManagedBlockVersion`: the version marker inside the first block only. | No. | No. |
| 3 | `detectManagedDuplicate` (`.bkit/core/engine/checks/after/managed.ts`) | `stripManagedBlock` output, that is the text outside the block, searched for an older unmarked copy of the block. | **Yes.** | No. The finding's severity is `advisory`; `reportCheckDrift` (`.bkit/core/engine/commands/install/check.ts`) fails only on would-writes, a `bkit-managed-stale` blocker or a missing owned hook. Pre-push also runs `pnpm bkit check` on every push, min push included (`.bkit/templates/.husky/pre-push:178`). |
| 4 | `migrateTemplateNotes` / `stripRetiredTemplateNotes` (`.bkit/core/engine/install/template-notes.ts`) | Lines above `<!-- bkit:start -->`. | No. | No. |
| 5 | `bkit uninstall` (`.bkit/core/engine/commands/install/uninstall.ts`) | Deletes `docs/templates/bkit-*.md` whole. | Not a gate. | No. |
| 6 | `.bkit/version` `canonicalHashes` (`.bkit/core/engine/install/version-file.ts`) | Whole-file hash, refreshed by install and upgrade. Upgrade's whole-file `diffFile` and uninstall read it; block-scoped templates go through `writeTier2` instead, and `bkit check` does not read the hashes. | Hash only. | No. |
| 7 | `.bkit/core/engine/tools/instructions.ts` (`AUDIT_DIRS`, bkit repo only) | The installed copies under `docs/templates/`, through `proseLineIndexes`, which cuts `audit` surfaces to the managed block. Conditional clause modes read front matter, and only on prompts. `coverageIndex` skips `docs/templates/`. | No. | No. |
| 8 | bkit repo tests and scripts: `template-shape.test.ts` (`.bkit/core/engine/audits/templates/`), `question-option-format.test.ts`, `shipped-docs-refs.test.ts`, `scripts/readme/readme-art.mjs`, and the source-template cases of `templates.test.ts` and `template-no-userpath.test.ts` | The source `.bkit/core/docs/templates/`. The installed-copy cases of `templates.test.ts` and `template-no-userpath.test.ts` are rows 12 and 13. | No. | No. |
| 9 | `bkit:gate:min` steps: `format:check` (prettier), `bkit:lint:prose` (Vale), `bkit:slop:delta`; the pre-commit `lint-staged` prettier pass | Whole markdown files. | Yes. | No: they run on the min push itself. |
| 10 | `@bkit-audit-generate` (agent) | Reads and edits `Project Instructions`. | Yes. | Not code, build or test. |
| 11 | A consumer's own tests | Unknown, consumer-owned. | Unknown. | Covered by the existing guidance: a test that reads a min-push file goes into `bkit:gate:min` (`.bkit/templates.md` § Git hooks — Husky). |
| 12 | `.bkit/core/engine/audits/templates/templates.test.ts` `%s dogfood managed block differs only by the managed-version stamp` (`:211-228`, bkit repo only) | bkit's installed `docs/templates/bkit-audit-*.md` (`path.resolve(relPath)`, `:215`); asserts the text from `<!-- bkit:end -->` on starts `<!-- bkit:end -->\n\n## Project Instructions\n` (`:224-226`). | **Yes.** | **Yes, in the bkit repo.** bkit's own `bkit:gate:min` (`package.json:58`) does not run it, and a `[skip ci]` head starts no CI. Task 6 adds it to `bkit:gate:min` (the owner's option A). |
| 13 | `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` `shipped audit templates have no leaked host path` (`:27-36`, `:63-68`, bkit repo only) | Every installed `docs/templates/bkit-audit-*.md`, whole file, for a `/Users/<name>/` or `/home/<name>/` path. | **Yes.** | **Yes, in the bkit repo**, for the same reason as row 12. Task 6 adds it to `bkit:gate:min` (the owner's option A). |

**Related Issues:**

- #915 — Min-push ignores the audit reports bkit writes (OPEN)
- #645 — Pre-push: light gate for bookkeeping-only pushes (CLOSED)
- #852 — Use minimum gates for verified bookkeeping across push paths (CLOSED)

---

### Narrative

An operator pushes a `[skip ci]` commit to `dev` that holds only files bkit wrote, including an audit report and the `Project Instructions` section of an audit template, and the push takes the light gate with no `--no-verify` and no empty "trigger CI" commit.

### Success Criteria

1. `bkit ci min-push` accepts a change under `docs/audits/**`, at any depth, beside `docs/plans/**`.
2. `bkit ci min-push` accepts a change to a top-level `docs/templates/bkit-audit-*.md` when every changed line sits below its `<!-- bkit:end -->`; a change at or above that marker still needs the full gate.
3. Any other template, such as `docs/templates/bkit-plan.md`, still needs the full gate, and `docs/**` is not added to `minPushPaths`.
4. `bkit ci min-push --ref`, `bkit ci min-push --update` (including the receipt path in `hasVerifiedIncrement`) and the landing routine's gate choice give the same answer for the same files.
5. bkit's own `bkit:gate:min` runs `templates.test.ts` and `template-no-userpath.test.ts`.
6. `.bkit/templates.md` § Git hooks — Husky describes the new floor and the audit-template exception, and the `minPushPaths` guidance matches.

### Out of Scope

None. The open-PR `[skip ci]` guard (`bkit ci bookkeeping-push`) and ship's `--scope=pr` allow-list stay as they are by design, not as deferred work (Open Questions, second assumption; `docs/decisions.jsonl` `min-push-floor-is-ship-allow-list`).

## Where it fits

- Group 1: Min-push decision in the engine — this group
  - TASK 1: Add `managedHead` to the managed-block parser — open
  - TASK 2: Count `docs/audits/**` as written by bkit — open
  - TASK 3: Accept an audit template's project section on the `--ref` path — open
  - TASK 4: Accept an audit template's project section on the `--update` path and through the real hook — open
  - TASK 5: Use the same classifier on the receipt path and in the landing routine — open
- Group 2: bkit's own minimum gate and docs — next
  - TASK 6: Run the below-marker test readers in bkit's own `bkit:gate:min` — open
  - TASK 7: Document the floor and the audit-template rule in § Git hooks — Husky — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `managedHead` to the managed-block parser
  - **UPDATE:** `.bkit/core/engine/install/managed-block.ts`: add `export function managedHead(content: string, markerStyle: MarkerStyle = "html-comment"): string | null` — the text from the first byte through the end of the single line-anchored end-marker line; null unless there is exactly one start marker and one end marker, start first.
  - **READ:** `findLineAnchoredMarkers` in `.bkit/core/engine/install/managed-block.ts`: the line-anchored marker finder to reuse.
  - **READ:** `replaceManagedBlock` in `.bkit/core/engine/install/managed-block.ts`: the refusals (`absent`, `multiple`, `inverted`) `managedHead` mirrors.
  - **UPDATE:** `.bkit/core/engine/install/managed-block.test.ts`: a `describe("managedHead")` block with the tests below; the fixtures copy the installed shape (the managed-version stamp inside the block, then `<!-- bkit:end -->\n\n## Project Instructions\n`).
  - **DONE WHEN:** the five tests below pass; `pnpm typecheck` passes; `pnpm build && git add dist/` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns the text through the bkit:end line` fails on the missing export, so each call throws "is not a function"
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has no markers` fails on the missing export, so each call throws "is not a function"
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has two bkit:end lines` fails on the missing export, so each call throws "is not a function"
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has a second bkit:start line below bkit:end` fails on the missing export, so each call throws "is not a function"
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when bkit:end comes before bkit:start` fails on the missing export, so each call throws "is not a function"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Count `docs/audits/**` as written by bkit
  - **UPDATE:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: glob list `["docs/plans/**", "docs/audits/**", ...cfg.minPushPaths]`; its JSDoc and the file header name the audit reports.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: the `min-push` spec's `output.paths` help names `docs/audits/**`; `summary` unchanged.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: the seed comment above `minPushPaths` and the `pruneMinPushPaths` comment name `docs/audits/**` in the floor; `MIN_PUSH_FLOOR_ENTRIES` unchanged.
  - **UPDATE:** `minPushPaths` in `.bkit/core/engine/shared/settings.ts`: the JSDoc (`settings.ts:133-135`) names `docs/audits/**` in the floor; no type change.
  - **READ:** `checkLanding` in `.bkit/core/engine/commands/land.ts`: picks up the new floor through `minPushPathspecs` with no edit.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: a test in `describe("bkit ci min-push")`.
  - **UPDATE:** `.bkit/core/engine/commands/land.test.ts`: a `docs/audits/202611/logs.md` → `min` row in the `pushToDev` gate table.
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: an audit-report case in the per-hook loop of `describe(".husky/pre-push min push")`.
  - **DONE WHEN:** the four tests below pass; the existing `bkit ci min-push`, `pushToDev` and `.husky/pre-push min push` tests still pass; `pnpm typecheck` passes; `pnpm build && git add dist/` has run and `pnpm bkit:check:dist` passes; `pnpm cli:sync` leaves `.bkit/core/.bkit/cli.md` unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits` fails on the report being listed in `outside` and `paths` lacking `:(glob)docs/audits/**`
    - `.bkit/core/engine/commands/land.test.ts` `runs docs/audits/202611/logs.md through its declared gate in the built checkout` fails on the landing running the unit gate instead of `bkit:gate:min`
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Accept an audit template's project section on the `--ref` path
  - **UPDATE:** `gitRaw` in `.bkit/core/engine/commands/workflow/ledgers.ts`: export it; no other change.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: add `export function minPushOutside(root, from, to, paths)` — `changedOutside` plus `sections`; moves each top-level `docs/templates/bkit-audit-*.md` from `outside` to `sections` when its blob (`gitRaw` `cat-file blob`) exists at both commits and `managedHead` is non-null and equal at both; anything else stays outside.
  - **UPDATE:** `minPush` in `.bkit/core/engine/commands/ci/ci.ts`: call `minPushOutside`; log `{path}: only its project section below <!-- bkit:end --> changed` once per accepted template.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: the `min-push` spec's `output.minPush` help (`ci.ts:893`) and `output.outside` help (`ci.ts:896`) name the audit-template exception.
  - **READ:** `changedOutside` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the result shape `minPushOutside` extends, and its `--no-renames` diff (`ledgers.ts:1556`), which the rename case relies on.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: a helper that commits files at the base, and the tests below in `describe("bkit ci min-push")`; the template fixtures copy the installed shape (the managed-version stamp inside the block, then `<!-- bkit:end -->\n\n## Project Instructions\n`).
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the ten tests below pass; the existing `bkit ci min-push`, `bkit ci bookkeeping-push`, `verified incremental push gates` and `.husky/pre-push min push` tests still pass; `bkit ledgers only-bookkeeping` behaviour is unchanged (its tests in `.bkit/core/engine/commands/workflow/ledgers.test.ts` pass); `pnpm typecheck` passes; `pnpm build && git add dist/` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `exits 0 when an audit template changes only below its bkit:end, and says why` fails on the template being listed in `outside` and no log line naming it
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one changed above
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one changed on both sides
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one whose marker line changed
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the new one
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the deleted one
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end` fails on `outside` listing the below-only template as well as the renamed template's old and new paths
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one with the extra marker
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below` fails on `outside` listing the audit template as well as `bkit-plan.md`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below` fails on `outside` listing the top-level audit template as well as the nested one

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Accept an audit template's project section on the `--update` path and through the real hook
  - **UPDATE:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: `increment` and `whole` call `minPushOutside`; each accepted template is logged once per update, even when both `increment` and `whole` accept it; the `hasVerifiedIncrement` call is unchanged in this task.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: the two `--update` tests below in `describe("bkit ci min-push")`, reusing Task 3's base-commit helper; both pass a real old SHA with no full-gate receipt, so the `whole` and `increment` branch (`ci.ts:710-718`) decides.
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: a project-section case in the per-hook loop; the test moves `refs/remotes/origin/dev` to a commit holding the template before the `[skip ci]` edit.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the four tests below pass; the existing `bkit ci min-push`, `verified incremental push gates` and `.husky/pre-push min push` tests still pass; `pnpm typecheck` passes; `pnpm build && git add dist/` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > --update exits 0 when the update changes only an audit template's project section, and logs the template once` fails on the `--update` path exiting 1 with the template in `outside` and no log line naming it
    - `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > --update exits 1 and lists only the code file when a project-section edit ships beside a code file` fails on `outside` listing the audit template as well as the code file
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the hook running "bkit:gate:static-unit" instead of `bkit:gate:min`, because the `--update` path still lists the template as outside
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the hook running "bkit:gate:static-unit" instead of `bkit:gate:min`, because the `--update` path still lists the template as outside

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Use the same classifier on the receipt path and in the landing routine
  - **UPDATE:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: the fourth parameter becomes `outsideOf: (from: string, to: string) => { ok: true; outside: string[] } | { ok: false }`, called in the receipt loop in place of `changedOutside`; drop the `changedOutside` import.
  - **UPDATE:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: pass `(a, b) => minPushOutside(cwd, a, b, paths)` to `hasVerifiedIncrement`.
  - **UPDATE:** `checkLanding` in `.bkit/core/engine/commands/land.ts`: call `minPushOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)))`; drop the `changedOutside` import.
  - **UPDATE:** `.bkit/core/engine/commands/ci/push-gate.test.ts`: a test in `describe("verified incremental push gates")`; the template is committed with the checked code before the full gate runs.
  - **UPDATE:** `.bkit/core/engine/commands/land.test.ts`: a test in `describe("pushToDev")`; the template is on `origin/dev` before the landing.
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm bkit:graph:refresh` after the engine edits are staged (it reads the staged files), for the `ci` and `managed-block` symbol counts; never edited by hand.
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the two tests below pass; every existing test in `push-gate.test.ts` and `land.test.ts` still passes (run `push-gate.test.ts` alone before treating a failure as real; see Suggested Scope Expansion); `pnpm typecheck` passes; `pnpm build && git add dist/` has run and `pnpm bkit:check:dist` passes; `pnpm bkit:graph:check` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a full-gate receipt carries an audit template's project-section increment to the minimum gate` fails on `bkit ci min-push --update` exiting 1, because the receipt path still lists the template as outside
    - `.bkit/core/engine/commands/land.test.ts` `runs an audit template's project-section change through bkit:gate:min` fails on the landing running the unit gate instead of `bkit:gate:min`

<!-- bkit:task 5 end -->

Reuse Inventory rows left out: 7; Architecture entries left out: 8 — read them in docs/plans/202611/915-min-push-ignores-plan.md § Reuse Inventory and § Architecture & Component Changes.
