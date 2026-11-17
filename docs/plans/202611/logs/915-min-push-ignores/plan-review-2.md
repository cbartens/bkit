Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists (`docs/plans/202611/915*` holds none; the plan states the owner's 2026-11-10 comment replaces design). Design-coverage (Process step 7) therefore has nothing to check. The owner's comment still requires a full reader list for `docs/templates/bkit-audit-*.md`, which this review checks under Task 3.

**Task 1: `managedHead` in `.bkit/core/engine/install/managed-block.ts`**

- Edits: `.bkit/core/engine/install/managed-block.ts` (new export) and `.bkit/core/engine/install/managed-block.test.ts`.
- Symbols: adds `managedHead`. It reuses `findLineAnchoredMarkers` (`managed-block.ts:34-50`) and `selectMarkers` (`managed-block.ts:21-25`), and copies the refusals of `replaceManagedBlock` (`managed-block.ts:67-89`: `absent`, `multiple`, `inverted`). No existing function changes, so the module's callers (install `writeTier2Content` at `.bkit/core/engine/install/write.ts:450-533`, upgrade, uninstall, `detectManagedStale` / `detectManagedDuplicate` in `.bkit/core/engine/checks/after/managed.ts:112,158`, and `driverText` at `write.ts:409-415`) are untouched.
- Marker rule: `findLineAnchoredMarkers` only accepts a marker followed by `\n` or the end of the file (`managed-block.ts:43-45`). A CRLF template therefore has no line-anchored marker, so `managedHead` returns null and the file stays outside. That fails closed.
- Schemas and endpoints: none.

**Task 2: the floor gains `docs/audits/**`**

- Edits: `minPushPathspecs` (`.bkit/core/engine/commands/ci/ci.ts:609-614`), the `min-push` spec `output.paths` help (`ci.ts:897-898`), and the comments at `.bkit/core/engine/install/modules/core.ts:617` and `core.ts:1526-1532`.
- Consumers of `minPushPathspecs`: `minPush` (`ci.ts:632`), and through it `minPushUpdates` (`ci.ts:638`), plus `checkLanding` (`.bkit/core/engine/commands/land.ts:198`). No other caller exists; checked by text search outside `dist/` and `docs/plans/`.
- Output: `--json` `paths` gains one entry. The only test that reads `paths` is `ci.test.ts:1031-1032`, and it uses `toContain`, so it still passes. `.bkit/core/.bkit/cli.md:118` renders only the `summary`, which stays the same.
- Hook callers: `.bkit/templates/.husky/pre-push:151` (`min-push $PUSH_UPDATES`, which picks the light gate) and `:161` (`min-push --ref`, the `[skip ci]` guard). The bkit repo's own `.husky/pre-push` has the same two calls.
- Stale prose the plan does not list: the `minPushPaths` JSDoc at `.bkit/core/engine/shared/settings.ts:133-135` still names the floor as "ship's bookkeeping allow-list, `docs/plans/**`, `ciSkipPaths`" (see OPTIONAL).
- Tests: `ci.test.ts` `describe("bkit ci min-push")` (`ci.test.ts:955`), the `land.test.ts` `pushToDev` `it.each` table (`land.test.ts:203-226`), and the hook loop at `husky-pre-push.integration.test.ts:1140-1224`.

**Task 3: `minPushOutside` on the `--ref` and `--update` paths**

- Edits: exports `gitRaw` (`.bkit/core/engine/commands/workflow/ledgers.ts:138-154`). Its behaviour does not change. It already converts a spawn error into a non-zero status (`ledgers.ts:152`), so an unreadable blob takes the fail-closed branch.
- Adds `minPushOutside` in `ci.ts`, which wraps `changedOutside` (`ledgers.ts:1545-1570`). Rewires `minPush` (`ci.ts:646`) and `minPushUpdates` `increment` / `whole` (`ci.ts:702,704`).
- `changedOutside` itself does not change. Its other consumer, `checkOnlyBookkeeping` (`ledgers.ts:1518-1538`), which backs `bkit ledgers only-bookkeeping` and ship's merge gate, keeps its contract.
- New import edges: `ci.ts` → `install/managed-block.ts`, and `ci.ts` → `ledgers.ts` `gitRaw` (`ci.ts` already imports `changedOutside` from that module, `ci.ts:54`). `managed-block.ts` imports only `node:fs` and `../shared/log-prefix.js`, so no import cycle forms.
- Readers of `docs/templates/bkit-audit-*.md` that read below `<!-- bkit:end -->`, checked against plan Context & Goals rows 1-11:
  - `detectManagedDuplicate` (`managed.ts:158-178`): `advisory`, as the plan states.
  - `hasRetiredDriver` / `driverText` (`write.ts:409-436`): reads the text outside the block, but only for the two `RETIRED_DRIVER_HASHES` keys (`write.ts:398-406`), which are plugin hooks. It never applies to `docs/templates/`, so it does not affect the gate.
  - `.bkit/core/engine/audits/templates/templates.test.ts:211-228`: reads bkit's installed `docs/templates/bkit-audit-*.md` (`path.resolve(relPath)`, `:215`). It asserts the text from `<!-- bkit:end -->` onward starts `/^<!-- bkit:end -->\n\n## Project Instructions\n/` (`:224-226`). That is below the marker, and it is a unit test. The plan's row 8 says this file reads only the source templates.
  - `.bkit/core/engine/audits/templates/template-no-userpath.test.ts:27-36,63-68`: reads every installed `docs/templates/bkit-audit-*.md` whole and fails on any `/Users/<name>/` or `/home/<name>/` path. That is below the marker too, and it is a unit test. The plan's row 8 says this file reads only the source templates.
  - `.bkit/core/engine/tools/instructions.ts:240,350`: limits audit surfaces to the managed block (`MANAGED`, `:104`), as row 7 says.
- Tests: the `ci.test.ts` and hook loop additions listed in the plan.

**Task 4: the receipt path and the landing routine**

- Edits: `hasVerifiedIncrement` (`.bkit/core/engine/commands/ci/push-gate.ts:188-223`). Its fourth parameter becomes a callback, and the `changedOutside` import goes (`push-gate.ts:12`). Its only caller is `minPushUpdates` (`ci.ts:705`). No test imports it; checked by text search.
- `checkLanding` (`land.ts:188-210`): `minPushOutside` returns the same `{ ok: false; stderr }` shape that `land.ts:199` reads.
- `pushToDev` consumers (bookkeeping landings and debug replays) get the project-section exception through `checkLanding`.
- Tests: `push-gate.test.ts` `describe("verified incremental push gates")` (`push-gate.test.ts:90`), whose fixture is `push-gate.test.ts:40-61`, and the `land.test.ts` `pushToDev` block.

**Task 5: docs**

- Edits: `.bkit/core/.bkit/templates.md:308` (§ Git hooks — Husky), mirrored to `.bkit/templates.md` by `bkit upgrade`. The two files differ only on line 3 (`{{BKIT_MANAGED_MARKER}}` against the rendered stamp), so the DONE WHEN parity check can pass.
- No code consumer.

## CRITICAL

1. **(plan edit) The plan's reader list is wrong: two bkit unit tests read below `<!-- bkit:end -->` in the installed audit templates, and a min push in the bkit repo skips both.**
   - **What the plan says:** Context & Goals row 8 states that `templates.test.ts` and `template-no-userpath.test.ts` read "the source `.bkit/core/docs/templates/`, never the installed `docs/templates/` copies".
   - **What the code does:**
     - `.bkit/core/engine/audits/templates/templates.test.ts:215` reads `path.resolve(relPath)`, which is bkit's installed `docs/templates/bkit-audit-*.md`. `:224-226` asserts the text after the marker begins `\n\n## Project Instructions\n`.
     - `.bkit/core/engine/audits/templates/template-no-userpath.test.ts:34` adds every installed `docs/templates/bkit-audit-*.md`, and `:63-68` fails on a `/Users/<name>/` or `/home/<name>/` path anywhere in the file.
   - **Why this breaks things:** bkit's own `bkit:gate:min` (`package.json:58`) runs prettier, `format:tables:check`, prose, slop and `ledger-integrity.test.ts` only. Neither test is in it.
     - After this plan, a `[skip ci]` push to `dev` in the bkit repo can carry an `@bkit-audit-generate` edit below the marker that writes an absolute home path, or that reshapes the `## Project Instructions` heading.
     - That push passes `bkit ci min-push`, runs only the light gate and starts no CI, so `dev` holds a red unit suite nobody ran. A leaked home path is the exact failure `template-no-userpath.test.ts` exists to catch.
     - These tests run in the bkit repo only, not in consumer installs. They are code-and-test readers of the section the owner asked about.
   - **The owner's instruction:** "list every code, build and test path that reads `docs/templates/bkit-audit-*.md`, and show that none reads the part below `<!-- bkit:end -->`. If one does, stop and bring it back to the owner" (plan-input-1, comment 2026-11-10T06:56:41Z).
   - **Plan edits:**
     - (a) Correct row 8, and add both tests as new rows with "Reads below `bkit:end`? Yes" and "Can alter a skipped gate result? Yes, in the bkit repo".
     - (b) Name both readers in Open Question 1 so the owner sees them, alongside `detectManagedDuplicate`.
     - (c) Add a task, or a Task 3 line, that adds `vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/templates/template-no-userpath.test.ts` to bkit's own `bkit:gate:min` in `package.json:58`, beside `ledger-integrity.test.ts`. This applies the plan's own row-11 guidance ("a test that reads a min-push file goes into `bkit:gate:min`") to bkit as a consumer. Add `pnpm bkit:gate:min` passing to that task's DONE WHEN.
     - (d) Update the `.bkit/workflows.md` gate table row for `bkit:gate:min` (`.bkit/core/.bkit/workflows.md:1535`) only if it is meant to describe bkit's own gate. It currently lists the seeded consumer default, so no edit is expected there.

## OPTIONAL

- **High-risk surfaces flagged** (no rule makes them `CRITICAL`):
  - `bkit ci min-push` is the `[skip ci]` guard that keeps code from landing on `dev` / `main` with no CI run. The plan covers it with unit rows that fail-close and the real hook at the Integration tier.
  - `managed-block.ts` is a shared parser. The change is additive, and existing exports are untouched.
  - `hasVerifiedIncrement` changes signature. It has one caller, updated in the same task.
  - `gitRaw` is exported from a shared utility with no behaviour change.
- **Stale floor description in `.bkit/core/engine/shared/settings.ts:133-135`:** the `minPushPaths` JSDoc lists the floor without `docs/audits/**`. Add it to Task 2's comment edits beside `core.ts:617` and `core.ts:1526-1530`.
- **`min-push` output help:** `ci.ts:893` (`minPush`: "true when every changed file matches a min-push path") and `ci.ts:896` (`outside`: "the changed files no min-push path matches") stop being exact once an audit template is accepted without matching a path. Task 2 or 3 could reword both, for example "… matches a min-push path or is an audit template whose text through `bkit:end` is unchanged".
- **`--update` increment coverage:** in Task 3, `increment` calls `minPushOutside`, but the only `--update` coverage for the project section is the hook test with a zero old SHA (`husky-pre-push.integration.test.ts:1113-1117`, so `increment` is null) and Task 4's receipt case. A `push-gate.test.ts` or `ci.test.ts` case with a real old SHA, no receipt, and a range that holds only a project-section edit would cover the `whole` + `increment` branch at `ci.ts:710-718`.
- **Duplicate log lines:** Task 3 logs accepted templates from both `increment` and `whole` in `minPushUpdates`. One push update can then print the same template twice. Log once per path per update.
- **Capability register:** `docs/capabilities.md:301,343` records symbol counts for `ci` (43) and `managed-block` (16). `managedHead` and `minPushOutside` change both counts. bkit's pre-push blocks a `dev` push on register drift (`docs/knowledge.jsonl` `capability-register-drift-reached-dev-through-warn-only-pre-push`). `@bkit-build-plan-tasks` runs `pnpm bkit:generate` (`.bkit/core/prompts/bkit-build-plan-tasks.md:118`), which refreshes the register only when graphify is installed (`package.json:67`). Naming `docs/capabilities.md` in Documentation Updates and `pnpm bkit:graph:check` in Task 4's DONE WHEN would make this explicit.
- **Fixture shape:** the Task 3 / Task 4 template fixtures should copy the real installed shape: the stamp line inside the block, then `<!-- bkit:end -->\n\n## Project Instructions\n`, as asserted at `templates.test.ts:224-226`. Then `managedHead` is tested against what `bkit install` writes, not against a minimal stand-in.
- **CRLF:** document in the Task 5 bullet that a template with CRLF line endings never qualifies, because `findLineAnchoredMarkers` (`managed-block.ts:43-45`) does not anchor a marker followed by `\r`.

## OUT OF SCOPE

- The open-PR `[skip ci]` guard (`bkit ci bookkeeping-push`) still blocks an audit-run head pushed to a feature branch with an open PR. The plan records this as by design (Open Questions, second assumption). A follow-up issue would be needed if audit runs push there.
- Runtime readers of `docs/audits/**` (`.bkit/core/engine/commands/workflow/fids.ts:484`, the `/bkit-plan` `--audit` input in `workflows.test.ts:2778-2798`) read reports at workflow time. No gate reads them, so they do not affect the min-push decision.
