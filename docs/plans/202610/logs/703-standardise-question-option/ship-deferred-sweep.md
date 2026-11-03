Verdict: PASS
Failures: 0
Lazy: 1

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Bar: the issue's `## Acceptance criteria` (the run's requested outcomes) plus every runbook `DONE WHEN` line in `docs/plans/202610/703-standardise-question-option-plan.md`. The plan carries no `Acceptance Scenario` section. No design doc exists (`docs/plans/202610/703-standardise-question-option-design.md` absent).

- **Delivered** — _The engine letters every option on compose and strips the letter on parse, so headless / `ask:false` routing is unchanged_ (issue AC 2; TASK 1 `DONE WHEN`). `.bkit/core/engine/commands/workflow/decisions.ts:54-60` (`bareName`, `letteredOptions`, `letterOf`), `:193` renders `Options: ${letteredOptions(it.options)}`, `:196` renders `Recommended: ${letter} ${rec} — …`, `:79` / `:81` strip a leading `{A-Z}) ` so `options` / `recommended` stay bare names, `:263` letters the deferral row. `npx vitest run decisions.test.ts challenge.test.ts` + the new audit → 66 passed; `challenge.test.ts`'s letterless fixture still parses.
- **Delivered** — _One option layout enforced across the corpus by a new audit_ (TASK 2 `DONE WHEN`). `.bkit/core/engine/audits/workflows/question-option-format.test.ts` exists (16 tests, all pass) with the not-vacuous guard (`:253`), the canonical-layout rule (`:264`) and the RED-PROOF / negative-control cases (`:351-383`).
- **Delivered** — _Every option and recommendation line in the five phase workflows is lettered; no workflow shows `Options: A / B` or a letterless named option_ (TASK 3 `DONE WHEN`; issue AC 1 and 3). `grep -rn "Options:\|Recommended:" .bkit/core/workflows` → `bkit-ship.md:304,601`, `bkit-debug.md:108`, `bkit-design.md:243,263`, `bkit-build.md:132` all lettered; a grep for `Options: A / B` / `Options: Accept / Fix now` / `Options: Try again / Stop` / `Options: Confirm / Reject` over `.bkit/core/**`, `.bkit/*.md`, `docs/templates/` and every host mirror returns nothing.
- **Delivered** — _The open-question and audit decision-question option shape is lettered in the prompts and templates, and the shared clause is synced_ (TASK 4 `DONE WHEN`). `.bkit/core/prompts/bkit-plan-{generate:43,review-1:37,scope-check:37,update:38}`, `bkit-design-{generate:133,update:65,review-2:76}`, `bkit-audit-generate`; `.bkit/core/docs/templates/bkit-plan.md:107-108` and `bkit-audit-models.md:89`; `.bkit/instructions.md:2838-2844` carries the lettered `### plan-open-questions` clause.
- **Delivered** — _Generated mirrors and `.bkit/instructions.md` regenerated and consistent_ (TASK 5 `DONE WHEN`; issue AC 5). `npx bkit check` → exit 0, `[bkit-check] 0 write(s) would occur.`
- **Delivered** — _`dist/` rebuilt_ (TASK 6 `DONE WHEN`; issue AC 4). `pnpm bkit:check:dist` → exit 0 (committed `dist/` byte-equal to a fresh `tsc`).
- **Delivered** — _`pnpm test`, `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check` pass on the final tree_ (TASK 7 `DONE WHEN`; issue AC 4). Re-run on this tree: `pnpm typecheck` exit 0; `pnpm lint:prose` exit 0 (`passed: true`, 147 files); `pnpm bkit:check:dist` exit 0; `pnpm test` → run 1 exit 1 with 200 files, 7886 passed | 1 skipped, 2 failures — both `Test timed out in 5000ms` in `.bkit/core/engine/commands/workflow/runs.test.ts` (`:2072`, `:2090`), a file the supplied diff does not touch (`grep -c runs.test.ts tmp/bkit-diff-703-standardise-question-option.md` → 0), which passes 159/159 standalone on the same tree — and run 2 exit 0 with 200 files, 7888 passed | 1 skipped (load-induced timeouts, not reproducible); `pnpm format:check` exit 0 at the build head (`build-plan-verify-holistic.md`), and on this tree exit 1 on exactly one file — `docs/plans/202610/logs/703-standardise-question-option/ship-input-1.md`, the ship run's own Step 1 artifact, not in the supplied diff, whose only diffs are the unpadded issue-body tables that `.lintstagedrc.json`'s `bkit-insert-ignore.mjs` + `prettier --write` pass over `docs/{plans,audits}/**/*.md` wraps with `<!-- prettier-ignore -->` at the ship bookkeeping commit (the same pattern the build summary recorded for the plan file). The change set itself is prettier-clean.
- **Delivered** — _Challenge round 1 fixes_ (TASK 8 / 9 / 10 `DONE WHEN`). Audit `optionLists` iterates `line.matchAll(OPTIONS_LABEL)` so a second `Options:` list on one line fires (`question-option-format.test.ts:98-115`); the recommendation rule scans `[PROMPTS, TEMPLATES, AUTHORING]` and `.bkit/core/docs/templates/bkit-plan.md:108` states `**Recommended:** A) [option] — [why, 1 line]`; `.bkit/core/.bkit/prompts.md` rows 255 / 257 / 267 / 270 name the lettered form and the index-vs-mirror agreement test holds. All green in the 16-test audit run.
- **Delivered** — _Challenge round 2 fix_ (TASK 11 `DONE WHEN`). `.bkit/core/prompts/bkit-design-review-2.md:76` names lettered options, a lettered `Recommended` **and** `Default if unanswered`; the test `the design review names every part the design prompts require` (`:313`) passes and the four rendered mirrors carry the three parts.

## Blocking Deferrals

None.

- No intended deliverable is absent, a stub, or producing a wrong observable result; no guard was removed or weakened; no shipped surface instructs a consumer to run something that fails at runtime.
- No test disabled in the supplied diff: `grep -nE "^\+" tmp/bkit-diff-703-standardise-question-option.md` filtered for `.skip` / `.todo` / `.fixme` / `xfail` / `.only` / `t.Skip` / `@Disabled` / `#[ignore]` / `eslint-disable` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / `type: ignore` / `nolint` returns no hits. The two removed assertion lines in the diff (`- expect(text).toContain("Recommended: Fix now — a secret reaches the log")`, `- expect(text).toContain("Options: Try again / Decide")`) are the pre-change letterless expectations that TASK 1's declared `UPDATE:` line replaces with the lettered form — assertions tightened, not deleted.

## Exempt Deferrals

- **4 `LOW` challenge findings** — `reason: low-severity`, `severity: LOW`, so the reason holds without applying the four tests (`.bkit/jsonl.md` § Deferral Reason). Declared by the build workflow (`by.step: build-challenge`) during the run, recorded in `docs/deferrals.jsonl`:
  - `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-52` — `letterAt` (`decisions.ts:52`) walks past `Z` into punctuation, so a 27+-option item composes `Options: … / [) {option}` and the file no longer round-trips through `parseDecisionItems`.
  - `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-steps-ts-463` — `writeStepRow`'s rollback (`steps.ts:463`) truncates to the pre-append byte offset, so a row another writer appended in that window is deleted while the exit code says nothing was written.
  - `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-55` — the recommendation rule passes on any `X)` anywhere in the tail, so `Recommended: Fix now — the A) path already caps it` reports zero violations.
  - `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50` — every `/` inside an option's own text splits that entry, so `Options: A) keep the read/write split · B) merge them` reports two bogus violations.
- **The issue's declared non-goals** — `reason: scope-declared`, declared before work started (issue body § `## Out of scope`, 2026-10-26). Recorded as `Exempt` per the sweep's plan scan:
  - Changing the number of questions, the ask points, or the loop / attempt limits.
  - Any behavioural change to the decision engine beyond the label format.
- **The plan's advisory boxes** — `Gate 2`, `Gate 3`, `Gate 4`, the `Verification Plan` boxes and the `Manual Verification` steps sit unticked in `docs/plans/202610/703-standardise-question-option-plan.md`; the plan marks the Manual Verification section `advisory only` and "an unticked box blocks nothing: not the merge, not plan approval". Advisory by declaration — recorded, not blocking. (The runbook `DONE WHEN` fields, which do gate, are all `Delivered` above.)

## Lazy Deferrals

- **`703-standardise-question-option-roadmap-duplicate-refreshed-stamp`** — `docs/roadmap.md:17` carries a duplicated `_(refreshed 2026-10-27T06:01:16Z)_` stamp that this run's diff adds (`git diff origin/dev -- docs/roadmap.md` → `+_(refreshed 2026-10-27T06:01:16Z)_` under the existing `_(refreshed 2026-10-27T06:01:17Z)_`). Declared as deferred work in the run's tracker comment (2026-10-27T08:31:22.000Z, `ship-input-1.md` § `## Issue comment`): "left as a follow-up rather than adding another commit" — with no row in `docs/deferrals.jsonl`, so the sweep is the only place it is recorded.
  - **Tests failed:** all four `unjustified` tests (`.bkit/jsonl.md` § Deferral Reason). No enum value fits — not `scope-declared` (no doc called it out before work started), not `hard-blocked` (no external blocker), not `needs-decision`, not `own-cycle` (a one-line mechanical fix), not `low-severity` (not a challenge finding) — so per "no valid justification = not valid deferral → finish work" it is unfinished work. Bounded remediation; the surface sits in a file this cycle touched; no external blocker; the declaration exists only in the run's own tracker comment, written at the moment of avoidance.
  - **Bounded remediation:** delete the duplicate line at `docs/roadmap.md:17`, or run `bkit roadmap fold` once before the merge so the stamp block carries a single line.
  - **Ledger row recorded:** `docs/deferrals.jsonl` — `key: 703-standardise-question-option-roadmap-duplicate-refreshed-stamp`, `reason: unjustified`, `status: TRIAGED`, `severity: LOW` (appended this step with `bkit ledgers append`). Cosmetic: no gate catches it and `bkit roadmap fold` collapses it at workflow close, so it never blocks the merge.

## Handover Notes

None.
