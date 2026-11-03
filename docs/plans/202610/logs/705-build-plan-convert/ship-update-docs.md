Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Docs Update

Docs synced to the state shipped this cycle for `705-build-plan-convert` (#705). Passes run per doc, in order: **1 sync** (gaps vs implementation) → **2 reorganize** → **3 compress** → **4 cross-references**.

Sources read: `docs/plans/202610/705-build-plan-convert-plan.md` (5 groups / 8 tasks, all ticked, § Documentation Updates), the run logs under `docs/plans/202610/logs/705-build-plan-convert/` (glob of 78 `.md` files; `build-input-1.md`, `ship-input-1.md`, `ship-deferred-sweep.md`, the `build-plan-execute-*-log.md` set), and the shipped commits (`origin/dev..HEAD`, `git rev-parse --is-shallow-repository` → `false`, so history is complete). Worktree's own binary (`./node_modules/.bin/bkit`) used for `check`.

Mirror rule applied: every `.bkit/*.md` reference doc is a byte-equal mirror of its `.bkit/core/.bkit/*.md` source (line 3 marker excepted), and the build already regenerated `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/cloud.md` and the five host workflow mirrors. No mirror was hand-edited here; `bkit check` reports `0 write(s) would occur`.

## Files Modified

<!-- prettier-ignore -->
| File | Pass | Gap closed |
| --- | --- | --- |
| `CHANGELOG.md` | 1, 3 | `[Unreleased]` § Changed gained the missing entry for this cycle: Plan Convert as its own Step 4 posting `### Step 4 — Plan Convert`, Branch Sync keeping Step 3 with `branches sync --merge-docs` alone, Plan Current on Step 5 posting on both routes (the exit-12 `Status: skipped (no plan anchor)` comment), the later steps shifted through Summary 15 / Close Workflow & Create PR 16, `WORKFLOW_STEPS` and resume targets following, no row or comment when the plan is already valid, and an in-flight run finishing on the version it started on. Ends `#705`, matching every neighbouring bullet. |

## Drift Resolved

Pass 1 (sync) closed one gap — the release record. The 6.0.0 § Changed entry still says "Step 3 runs `bkit tests plan-check`", which is correct as history for that release; `[Unreleased]` carried no line for #705 at all, so the shipped numbering change reached consumers with no record. Pass 3 (compress) trimmed that bullet to the load-bearing facts (numbers, the two post sites, the skip comment, the resume guarantee) rather than restating the workflow prose. Pass 2 (reorganize) found nothing misplaced: the bullet sits under `[Unreleased]` / `Changed`, where the numbering change belongs. Pass 4 (xref) found no link to add — the entry names the verbs and steps themselves, and the canonical detail lives in `.bkit/workflows.md` § `/bkit-build`, which the entry does not duplicate.

Every other surface this change touches already states the shipped state; checked against the workflow source and the step table, not trusted:

<!-- prettier-ignore -->
| Surface | Check | Result |
| --- | --- | --- |
| `.bkit/core/.bkit/workflows.md:862,875-888` | `### `/bkit-build` — 16 steps`; rows `3 — Branch Sync`, `4 — Plan Convert`, `5 — Plan Current` … `16 — Close Workflow & Create PR`; § Group loop reads `Steps 7-9`; `:27` reads `16 steps` | in sync |
| `.bkit/workflows.md` (mirror) | `diff <(sed 3d …)` source vs mirror | byte-equal |
| `.bkit/instructions.md:7112,7046` | mirrored § Cross-step invariants `One pass of Steps 7-9 per plan group`; Plan contract line renumbered | in sync |
| `.bkit/core/.bkit/cloud.md:399` + `.bkit/cloud.md` (mirror) | `after `bkit-build` Step 16 close-workflow` in both | in sync |
| `docs/deployments.md:533,535` | `build Step 16` at both gate sites; no `build Step 15` anywhere in the file | in sync |
| `docs/testing.md:631` | `workflow-shape.test.ts` row names `Branch Sync merging its docs, Plan Convert checking the plan … Step 7 taking the next group's brief, Step 8 verifying … build Step 11 running `challenge gate`` | in sync |
| `docs/migrations.md:37` | `the FID's next `/bkit-build` Step 4 converts the plan` | in sync |
| `docs/roadmap.md:42` | build row carries `705-build-plan-convert`; generated tables not hand-edited | in sync |
| `.bkit/pipeline.md` | its build schematic numbers its own list (1-12), never the workflow's step numbers, and already places plan-convert after plan-check | n/a |
| `docs/architecture.md`, `docs/security.md`, `docs/observability.md`, `docs/technology.md`, `README.md`, `.bkit/README.md`, `.bkit/install.md`, `.bkit/providers.md`, `.bkit/trackers.md`, `.bkit/lite.md`, `.bkit/templates.md` | `grep -n 'build Step\|Steps 6-8\|Step 4 — Plan Current\|Step 5 — Install Skills'` → no hit | n/a |
| `.agents/docs.md` | this change adds no doc and removes none; every indexed path exists; the `CHANGELOG.md` row scope (`Release record — notable changes per version`) still accurate | accurate |
| `docs/knowledge.jsonl` / `docs/decisions.jsonl` | out of scope by prompt; the same-`key` anchor-row append was build task 5's | untouched |
| agent memory | no `MEMORY.md` and no `memory/` in this repo → step 6 no-op | n/a |

Verification, run in this worktree after the edit:

```
pnpm exec prettier --check CHANGELOG.md            → All matched files use Prettier code style
pnpm lint:prose                                    → 0 errors / 0 warnings, 147 files
vitest run catalog-parity.test.ts release-workflow.test.ts workflow-shape.test.ts
                                                   → 3 files, 271 passed
./node_modules/.bin/bkit check                     → 0 write(s) would occur
pnpm format:check                                  → 1 warn: ship-input-1.md only (see Blockers)
```

## Pending Items

`{FID}` = `705-build-plan-convert` — 8 rows in `docs/deferrals.jsonl` (6 unique keys, all `reason: low-severity`, `severity: LOW`, `by.step: build-challenge`). This pass wrote nothing to the ledger.

<!-- prettier-ignore -->
| `key` | Verdict at ship time | Note |
| --- | --- | --- |
| `…-challenge-low-docs-migrations-md-37` | Closed | Row `ts` 1793098336457 (`CLOSED`) after `docs/migrations.md:37` came to read `Step 4 converts the plan`; verified on this tree. |
| `…-challenge-low-bkit-core-bkit-workflows-md-27` | Closed | Row `ts` 1793098336458 (`CLOSED`) after `.bkit/core/.bkit/workflows.md:27` and its mirror read `16 steps`; verified on this tree. |
| `…-challenge-low-bkit-core-engine-commands-workflow-status-ts-468` | Live | `bkit status resume --help` still describes the challenge as Step 10 while the table reads 11. Engine text, not a doc surface; needs an engine edit plus `dist/` rebuild. |
| `…-challenge-low-bkit-core-engine-install-manifest-ts-252` | Live | Engine source comments (`manifest.ts:252/286`, `checks/after/index.ts:365`, `checks/before/repo.ts:186`, `challenge.ts:53`) cite pre-renumbering build steps. Comment-only; same engine-edit remit. |
| `…-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | Live | A Decision Pause file written before the renumber re-posts its recorded old `Pause step` for one release; routing stays name-keyed, so the run still resumes correctly. Needs an owner decision. |
| `…-challenge-low-bkit-core-workflows-bkit-build-md-415` | Live | Plan Current's exit-12 skip comment says `no plan anchor` for every exit-12 cause (`unreachable`, `nothing-landed` also fire it). Text-only fix in the workflow's route; outside this pass's sync mandate (the comment does state the shipped behaviour for the common cause). |

## Blockers

<!-- prettier-ignore -->
| Id | Reason |
| --- | --- |
| `format-check-ship-logs` | `pnpm format:check` fails on one untracked artifact this ship run wrote — `docs/plans/202610/logs/705-build-plan-convert/ship-input-1.md` — so the pre-push `pnpm bkit:gate:static` chain would red. Nothing this pass edited is flagged (`prettier --check CHANGELOG.md` clean); `ship-deferred-sweep.md` now passes. Fix belongs to the ship run: `pnpm exec prettier --write` that file before push, or ignore `ship-*.md` alongside the existing `docs/plans/*/logs/*/` patterns. |
