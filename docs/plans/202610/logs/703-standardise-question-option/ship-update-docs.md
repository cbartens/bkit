Verdict: PASS
Failures: 0
Lazy: 1

<!-- verdict:end -->

# Docs Update

Sync for `703-standardise-question-option`. Sources read this session: `docs/plans/202610/703-standardise-question-option-plan.md` (11 tasks, all ticked; Reuse Inventory), the run logs under `docs/plans/202610/logs/703-standardise-question-option/` (glob of 60 `.md` files at session start; `build-summary.md`, `ship-input-1.md` and `ship-deferred-sweep.md` included), and the shipped diff (`origin/dev..HEAD`, 184 files; 117 under `docs/`, `.bkit/` and `docs/templates/`). Repo not shallow (`git rev-parse --is-shallow-repository` → `false`), so history is complete.

Passes per doc, in order: **1 sync** (gaps vs implementation) → **2 reorganize** → **3 compress** → **4 cross-references**.

**Outcome: no doc edit was needed — every shipped doc this change touches already states the lettered option layout.** Build tasks 2-5 wrote those docs; this step verified them against the shipped engine and found no gap. The four passes ran over each surface below and none produced an edit, so **Files Modified** is `None` — reporting an edit here would be an invented change.

## Files Modified

None.

## Drift Resolved

None — no doc drifted. Verification only, per surface:

<!-- prettier-ignore -->
| Surface | Check | Result |
| --- | --- | --- |
| `.bkit/core/.bkit/workflows.md:924` § Ask points — **Question layout** | `Options: A) … / B) …`, `Recommended: A) X — {reason}` — the canonical the audit reads | lettered |
| `.bkit/core/.bkit/authoring.md:114` § Human questions | lettered list, named option included (`Options: A) Accept / B) Fix now`) | lettered |
| `.bkit/core/.bkit/prompts.md` rows 255 / 257 / 259 / 267 / 270 / 271 | index rows stating the open-question rule name the lettered form | in sync |
| `.bkit/core/workflows/bkit-debug.md:108`, `bkit-ship.md:304,601`, `bkit-design.md:243,263`, `bkit-build.md:132` | `grep -rn 'Options:\|Recommended:' .bkit/core/workflows` — every option and recommendation line lettered | lettered |
| `.bkit/core/prompts/*.md` open-question rules | 4 plan carriers (`plan-generate:43`, `plan-review-1:37`, `plan-scope-check:37`, `plan-update:38`), 3 design (`design-generate:133`, `design-update:65`, `design-review-2:76`), `audit-generate:198` | lettered |
| `.bkit/core/docs/templates/bkit-plan.md:107-108`, `bkit-audit-models.md:89` | `Options: A) … · B) …`, `Recommended: A) [option] — [why, 1 line]` | lettered |
| mirrors — `.bkit/{workflows,authoring,prompts}.md`, `docs/templates/{bkit-plan,bkit-audit-models}.md` | `diff` source vs mirror → line 3 managed marker only | byte-equal |
| letterless forms | `grep -rn 'Options: A / B\|Options: Accept\|Options: Confirm\|Options: Try again'` over `.bkit/core`, `docs/templates`, `.bkit/*.md` → hits are RED-PROOF fixtures in `question-option-format.test.ts:351-383` and `decisions.test.ts` legacy-parse fixtures only | no live letterless line |
| `.agents/docs.md` | this change adds no doc and removes none → no index row to add; every indexed path exists (`.bkit/advisories.md`, `.bkit/LICENSE.md` unindexed before this cycle, unchanged) | accurate |
| agent memory | no `MEMORY.md` and no `memory/` in this repo → nothing to update | n/a |
| `docs/*.md` outside the shipped set | `grep -rn 'Options:\|Recommended:\|Question layout' docs/*.md` → no hit | n/a |
| plan Gate 3 doc condition | "every shipped doc this change touches states the lettered option layout; `.agents/docs.md` accurate" | satisfied; boxes stay unticked as `ship-deferred-sweep.md` declared them advisory |

## Pending Items

`{FID}` = `703-standardise-question-option` — 5 matches in `docs/deferrals.jsonl` (rows 282-286), all for human review; this step wrote nothing to the ledger.

**Exempt — 4 `LOW` build-challenge findings** (`reason: low-severity`, `by.step: build-challenge`):

- `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-52` — `letterAt` (`decisions.ts:52`) walks past `Z`, so a 27+-option item composes `Options: … / [) {option}` and the file no longer round-trips through `parseDecisionItems`.
- `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-steps-ts-463` — `writeStepRow`'s rollback (`steps.ts:463`) truncates to the pre-append byte offset, so a row another writer appended in that window is deleted while the exit code says nothing was written.
- `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-55` — the recommendation rule passes on any `X)` anywhere in the tail, so `Recommended: Fix now — the A) path already caps it` reports zero violations.
- `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50` — every `/` inside an option's own text splits that entry, so `Options: A) keep the read/write split · B) merge them` reports two bogus violations.

**Triaged — 1 `unjustified` doc finding, `status: TRIAGED`:**

- `703-standardise-question-option-roadmap-duplicate-refreshed-stamp` — `docs/roadmap.md` carries a duplicated `_(refreshed 2026-10-27T06:01:16Z)_` stamp the run's diff adds under `_(refreshed 2026-10-27T06:01:17Z)_` (`git diff origin/dev..HEAD -- docs/roadmap.md` → one added line at `:17`). **Not hand-edited here, deliberately:** the file is machine-managed (`do not hand-edit the bkit tables`), the only writer of that stamp is `statusBlock` (`roadmap.ts:147`, one stamp per render), and this step's own caller block runs `bkit roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs` right after this agent returns (`bkit-ship.md:446`) → `appendFeature` → `foldRoadmap` → `foldBoard`, which rewrites the status region with a single stamp. The duplicate therefore collapses without a commit; a hand edit here would be undone by the next render.

**Proposed separately, not bundled (out-of-scope finds):**

- `.bkit/core/.bkit/prompts.md:314` — the `bkit-audit-generate` index row does not state the report-format rule its prompt gained (`.bkit/core/prompts/bkit-audit-generate.md:198`: an open question the report poses carries lettered options and a lettered `Recommended`). Not drift under the change's own definition: `indexOpenQuestionRules` (`question-option-format.test.ts:236-242`) selects only rows matching both the open-question and options-word patterns, this row matches neither, and challenge round 1 (TASK 10) scoped the index update to rows that state the rule. Closing it means a source edit plus the dogfood install (`.bkit/version` `canonicalHashes`) — build-state work, not this step's remit.

## Blockers

None.
