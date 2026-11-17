# Brief: group 2 — bkit's own minimum gate and docs

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

- Group 1: Min-push decision in the engine — done
  - TASK 1: Add `managedHead` to the managed-block parser — done
  - TASK 2: Count `docs/audits/**` as written by bkit — done
  - TASK 3: Accept an audit template's project section on the `--ref` path — done
  - TASK 4: Accept an audit template's project section on the `--update` path and through the real hook — done
  - TASK 5: Use the same classifier on the receipt path and in the landing routine — done
- Group 2: bkit's own minimum gate and docs — this group
  - TASK 6: Run the below-marker test readers in bkit's own `bkit:gate:min` — open
  - TASK 7: Document the floor and the audit-template rule in § Git hooks — Husky — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Run the below-marker test readers in bkit's own `bkit:gate:min`
  - **UPDATE:** `package.json`: the `bkit:gate:min` script's `vitest run` adds `.bkit/core/engine/audits/templates/templates.test.ts` and `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` beside `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`. Applies the owner's choice of option A.
  - **READ:** `.bkit/core/engine/audits/templates/templates.test.ts`: `%s dogfood managed block differs only by the managed-version stamp` (`:211-228`), which asserts the text after `<!-- bkit:end -->`.
  - **READ:** `.bkit/core/engine/audits/templates/template-no-userpath.test.ts`: `shipped audit templates have no leaked host path` (`:27-36`, `:63-68`), which scans each installed audit template whole.
  - **READ:** `BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`: the seeded consumer `bkit:gate:min`, which stays as it is.
  - **DONE WHEN:** `pnpm bkit:gate:min` exits 0 and its output shows `templates.test.ts` and `template-no-userpath.test.ts` ran; a scratch below-marker edit that deletes `## Project Instructions` from one installed `docs/templates/bkit-audit-*.md` makes `pnpm bkit:gate:min` exit non-zero, and the build removes that scratch edit with an edit afterwards; the `.husky/pre-push min push` integration tests still pass.
  - **TEST FIRST:** n/a — config only: adds two existing unit test files to bkit's own `bkit:gate:min` script; no new test.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Document the floor and the audit-template rule in § Git hooks — Husky
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky — "What bkit writes" adds `docs/audits/**`; a new "Min push" bullet states the audit-template project-section rule, what keeps the full gate (including CRLF line endings), and that "what bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections; "Min-push paths" says the floor already covers `docs/plans/**` and `docs/audits/**`.
  - **UPDATE:** `.bkit/templates.md`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited by hand.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** both files carry the new text; `pnpm bkit check` exits 0; `.bkit/templates.md` equals `.bkit/core/.bkit/templates.md` apart from the managed-version marker line; `pnpm bkit:lint:prose` and `pnpm format:check` pass; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts` passes.
  - **TEST FIRST:** n/a — docs only.

<!-- bkit:task 7 end -->

### Earlier tasks this group depends on

- TASK 5 (group 1, done): Use the same classifier on the receipt path and in the landing routine — `.bkit/core/engine/commands/ci/push-gate.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/commands/land.ts`, `.bkit/core/engine/commands/ci/push-gate.test.ts`, `.bkit/core/engine/commands/land.test.ts`, `docs/capabilities.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| bkit's own minimum gate runs the tests that read below `bkit:end` | `package.json` | `grep -n 'bkit:gate:min' package.json`; read `.bkit/core/engine/audits/templates/templates.test.ts:205-228` and `.bkit/core/engine/audits/templates/template-no-userpath.test.ts:20-70`; `rg -l 'gate:min' --glob '*.test.ts' .bkit/core/engine` (no test pins bkit's own `bkit:gate:min` text) | `bkit:gate:min` — already runs one test file (`ledger-integrity.test.ts`) after the static steps | EXTEND | Add the two test files to its `vitest run` (the owner's option A). |
| Describe what bkit writes for the min push | `.bkit/core/.bkit/templates.md` | `grep -n 'min-push\|minPush\|docs/plans/\*\*' .bkit/core/.bkit/templates.md` | § Git hooks — Husky, bullets "What bkit writes" and "Min-push paths" | EXTEND | Add `docs/audits/**`, the project-section rule, and the `minPushPaths` guidance; mirror to `.bkit/templates.md` with `bkit upgrade`. |

### Architecture entries

#### [MODIFY] `package.json`

- **Existence Check:** `bkit:gate:min` (`package.json:58`) ends `vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts`.
- Add `.bkit/core/engine/audits/templates/templates.test.ts` and `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` to that `vitest run`. bkit repo only: the seeded consumer default (`BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts:245`) does not change. Applies the owner's choice of option A.

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** § Git hooks — Husky has the bullets "What bkit writes = ship's `--scope=pr` allow-list … plus `docs/plans/**`" and "Min-push paths: list only files that no code, build or test reads".
- "What bkit writes" adds `docs/audits/**`.
- A new bullet under "Min push" states the audit-template rule:
  - A change to `docs/templates/bkit-audit-*.md` qualifies when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range.
  - A new, deleted or renamed template, a second marker line, or any change at or above `<!-- bkit:end -->` keeps the full gate.
  - A template with CRLF line endings never qualifies, because a marker followed by `\r` is not line-anchored.
  - Other templates keep the full gate.
  - "What bkit writes" in the `bkit ci min-push` summary covers the audit reports and the audit templates' project sections.
- "Min-push paths" says the floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.

#### [MODIFY] `.bkit/templates.md`

- The mirror of `.bkit/core/.bkit/templates.md`, written by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never by hand.
